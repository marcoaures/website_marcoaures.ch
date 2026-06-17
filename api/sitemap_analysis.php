<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

/* ------------------------------- Helpers: IO -------------------------------- */

function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_SLASHES);
  exit;
}

function host_from_url(string $url): ?string {
  $p = @parse_url($url);
  if (!is_array($p) || empty($p['host'])) return null;
  return strtolower((string)$p['host']);
}

/* ------------------------- Safeguard: rate limiting ------------------------- */

function rate_limit(string $key, int $maxRequests, int $windowSeconds): void {
  $dir = sys_get_temp_dir() . '/sitemap_rl';
  if (!is_dir($dir)) @mkdir($dir, 0700, true);

  $file = $dir . '/' . hash('sha256', $key) . '.json';
  $now = time();

  $fp = @fopen($file, 'c+');
  if (!$fp) return;

  flock($fp, LOCK_EX);

  $raw = stream_get_contents($fp);
  $data = is_string($raw) ? json_decode($raw, true) : null;

  if (!is_array($data) || !isset($data['reset'], $data['count'])) {
    $data = ['reset' => $now + $windowSeconds, 'count' => 0];
  }

  if ($now >= (int)$data['reset']) {
    $data = ['reset' => $now + $windowSeconds, 'count' => 0];
  }

  $data['count']++;

  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($data));
  fflush($fp);

  flock($fp, LOCK_UN);
  fclose($fp);

  if ((int)$data['count'] > $maxRequests) {
    $retry = max(1, (int)$data['reset'] - $now);
    header('Retry-After: ' . $retry);
    respond(429, [
      'error' => 'rate_limited',
      'retry_after_seconds' => $retry,
    ]);
  }
}

/* ---------------------------- Safeguard: caching ---------------------------- */

function cache_get(string $key, int $ttlSeconds): ?string {
  $dir = sys_get_temp_dir() . '/sitemap_cache';
  if (!is_dir($dir)) @mkdir($dir, 0700, true);

  $file = $dir . '/' . hash('sha256', $key) . '.cache';
  if (!file_exists($file)) return null;
  if (time() - (int)filemtime($file) > $ttlSeconds) return null;

  $v = @file_get_contents($file);
  return ($v === false) ? null : $v;
}

function cache_set(string $key, string $value): void {
  $dir = sys_get_temp_dir() . '/sitemap_cache';
  if (!is_dir($dir)) @mkdir($dir, 0700, true);

  $file = $dir . '/' . hash('sha256', $key) . '.cache';
  @file_put_contents($file, $value, LOCK_EX);
}

/* ------------------------------ Input handling ------------------------------ */

function normalize_input_to_host(string $input): ?string {
  $input = trim($input);
  if ($input === '') return null;

  $s = str_contains($input, '://') ? $input : ('https://' . $input);
  $parts = @parse_url($s);
  if (!is_array($parts) || empty($parts['host'])) return null;

  $host = strtolower((string)$parts['host']);
  $host = rtrim($host, '.');

  if (!preg_match('/^(?=.{1,253}$)([a-z0-9-]{1,63}\.)+[a-z0-9-]{2,63}$/', $host)) {
    return null;
  }

  return $host;
}

/* ----------------------- Safeguard: SSRF-ish blocking ----------------------- */

function ip_is_private_or_local(string $ip): bool {
  if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
    $long = ip2long($ip);
    if ($long === false) return true;

    $ranges = [
      ['0.0.0.0',      '0.255.255.255'],
      ['10.0.0.0',     '10.255.255.255'],
      ['127.0.0.0',    '127.255.255.255'],
      ['169.254.0.0',  '169.254.255.255'],
      ['172.16.0.0',   '172.31.255.255'],
      ['192.0.0.0',    '192.0.0.255'],
      ['192.168.0.0',  '192.168.255.255'],
      ['224.0.0.0',    '239.255.255.255'],
      ['240.0.0.0',    '255.255.255.255'],
    ];
    foreach ($ranges as [$a, $b]) {
      if ($long >= ip2long($a) && $long <= ip2long($b)) return true;
    }
    return false;
  }

  if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
    $lower = strtolower($ip);
    if ($lower === '::1') return true;
    if (preg_match('/^fe[89ab][0-9a-f]:/i', $lower)) return true;
    if (str_starts_with($lower, 'fc') || str_starts_with($lower, 'fd')) return true;
    return false;
  }

  return true;
}

function host_is_blocked(string $host): bool {
  if ($host === 'localhost') return true;
  if (str_ends_with($host, '.local')) return true;

  $a = @dns_get_record($host, DNS_A);
  if (is_array($a)) {
    foreach ($a as $rec) {
      if (!empty($rec['ip']) && ip_is_private_or_local((string)$rec['ip'])) return true;
    }
  }

  $aaaa = @dns_get_record($host, DNS_AAAA);
  if (is_array($aaaa)) {
    foreach ($aaaa as $rec) {
      if (!empty($rec['ipv6']) && ip_is_private_or_local((string)$rec['ipv6'])) return true;
    }
  }

  return false;
}

/* ---------------------- Allowlist helpers (apex <-> www) -------------------- */

function host_variants(string $host): array {
  $host = strtolower(rtrim($host, '.'));
  $a = [$host];
  if (str_starts_with($host, 'www.')) {
    $a[] = preg_replace('/^www\./', '', $host);
  } else {
    $a[] = 'www.' . $host;
  }
  return array_values(array_unique(array_filter($a, fn($x) => is_string($x) && $x !== '')));
}

function is_allowlisted_target(string $url, array $allowedHosts): bool {
  $p = @parse_url($url);
  if (!is_array($p)) return false;

  $scheme = strtolower((string)($p['scheme'] ?? ''));
  $h = strtolower((string)($p['host'] ?? ''));
  $path = (string)($p['path'] ?? '/');

  if ($scheme !== 'https') return false;
  if ($h === '' || !in_array($h, $allowedHosts, true)) return false;

  $pathLower = strtolower($path);
  if ($pathLower === '/robots.txt') return true;

  if (str_contains($pathLower, 'sitemap')) return true;

  return false;
}

function normalize_to_https(string $u, string $fallbackHost): ?string {
  $u = trim($u);
  if ($u === '') return null;

  $pu = @parse_url($u);

  if (!is_array($pu) || empty($pu['scheme'])) {
    return "https://{$fallbackHost}/" . ltrim($u, '/');
  }

  $scheme = strtolower((string)$pu['scheme']);
  if ($scheme !== 'https') return null;

  $host = strtolower((string)($pu['host'] ?? ''));
  if ($host === '') return null;

  $path = (string)($pu['path'] ?? '/');
  $query = isset($pu['query']) ? ('?' . $pu['query']) : '';
  return "https://{$host}{$path}{$query}";
}

/* ------------------------------- HTTP fetch -------------------------------- */

function http_get_limited(
  string $url,
  int $maxBytes,
  int $connectTimeout,
  int $timeout,
  int $maxRedirects = 3,
  ?callable $allowlistCheck = null
): array {
  $ua = 'Sitemap-Analyzer/1.1 (+https://marcoaures.ch/tools/sitemap-analyse/; email:hoi@marcoaures.ch)';

  $visited = [];
  $current = $url;

  $finalCode = 0;
  $finalBody = '';
  $finalErr = null;
  $effective = $url;

  $validate_url = function(string $candidate) use ($allowlistCheck): ?string {
    $candidate = trim($candidate);
    if ($candidate === '') return null;

    $p = @parse_url($candidate);
    if (!is_array($p) || empty($p['scheme']) || empty($p['host'])) return null;

    $scheme = strtolower((string)$p['scheme']);
    if ($scheme !== 'https') return null;

    if ($allowlistCheck && !$allowlistCheck($candidate)) return null;

    $host = strtolower((string)$p['host']);
    $path = (string)($p['path'] ?? '/');
    $query = isset($p['query']) ? ('?' . $p['query']) : '';
    return "https://{$host}{$path}{$query}";
  };

  $resolve_location = function(string $baseUrl, string $location): ?string {
    $location = trim($location);
    if ($location === '') return null;

    if (str_contains($location, '://')) return $location;

    $b = @parse_url($baseUrl);
    if (!is_array($b) || empty($b['scheme']) || empty($b['host'])) return null;

    $scheme = (string)$b['scheme'];
    $host = (string)$b['host'];
    $basePath = (string)($b['path'] ?? '/');

    if (str_starts_with($location, '//')) {
      return $scheme . ':' . $location;
    }

    if (str_starts_with($location, '/')) {
      return "{$scheme}://{$host}{$location}";
    }

    $dir = $basePath;
    if ($dir === '' || $dir[0] !== '/') $dir = '/' . $dir;
    if (!str_ends_with($dir, '/')) {
      $dir = preg_replace('~/[^/]*$~', '/', $dir);
    }

    $joined = $dir . $location;

    $segments = explode('/', $joined);
    $out = [];
    foreach ($segments as $seg) {
      if ($seg === '' || $seg === '.') continue;
      if ($seg === '..') { array_pop($out); continue; }
      $out[] = $seg;
    }
    $normPath = '/' . implode('/', $out);

    return "{$scheme}://{$host}{$normPath}";
  };

  for ($i = 0; $i <= $maxRedirects; $i++) {
    if (isset($visited[$current])) {
      return [
        'ok' => false,
        'stopped' => false,
        'code' => $finalCode,
        'body' => $finalBody,
        'error' => 'redirect_loop',
        'effective_url' => $effective,
      ];
    }
    $visited[$current] = true;

    $validated = $validate_url($current);
    if ($validated === null) {
      return [
        'ok' => false,
        'stopped' => false,
        'code' => 0,
        'body' => '',
        'error' => 'blocked_or_invalid_url',
        'effective_url' => $current,
      ];
    }
    $current = $validated;

    $ch = curl_init($current);
    if (!$ch) {
      return [
        'ok' => false,
        'stopped' => false,
        'code' => 0,
        'body' => '',
        'error' => 'curl_init_failed',
        'effective_url' => $current,
      ];
    }

    $buf = '';
    $stopped = false;
    $respHeaders = [];

    curl_setopt_array($ch, [
      CURLOPT_FOLLOWLOCATION => false,
      CURLOPT_MAXREDIRS => 0,
      CURLOPT_RETURNTRANSFER => false,
      CURLOPT_HEADER => false,
      CURLOPT_WRITEFUNCTION => function($ch, $chunk) use (&$buf, $maxBytes, &$stopped) {
        $remaining = $maxBytes - strlen($buf);
        if ($remaining <= 0) {
          $stopped = true;
          return 0;
        }
        $buf .= substr($chunk, 0, $remaining);
        return strlen($chunk);
      },
      CURLOPT_HEADERFUNCTION => function($ch, $headerLine) use (&$respHeaders) {
        $len = strlen($headerLine);
        $line = trim($headerLine);
        if ($line === '') return $len;

        if (preg_match('~^HTTP/\d+\.\d+\s+\d+~i', $line)) {
          $respHeaders = [];
          return $len;
        }

        $pos = strpos($line, ':');
        if ($pos !== false) {
          $name = strtolower(trim(substr($line, 0, $pos)));
          $value = trim(substr($line, $pos + 1));
          $respHeaders[$name] = $value;
        }
        return $len;
      },
      CURLOPT_CONNECTTIMEOUT => $connectTimeout,
      CURLOPT_TIMEOUT => $timeout,
      CURLOPT_USERAGENT => $ua,
      CURLOPT_HTTPHEADER => [
        'Accept: application/xml,text/xml,text/plain;q=0.9,*/*;q=0.1'
      ],
      CURLOPT_PROXY => '',
      CURLOPT_NOPROXY => '*',

      CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
      CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTPS,

      CURLOPT_ENCODING => '',
    ]);

    $ok = curl_exec($ch);
    $err = curl_error($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $eff = (string)curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
    curl_close($ch);

    $effective = $eff ?: $current;
    $finalCode = $code;
    $finalBody = $buf;
    $finalErr  = $err ?: null;

    if ($stopped) {
      return [
        'ok' => true,
        'stopped' => true,
        'code' => $finalCode,
        'body' => $finalBody,
        'error' => $finalErr,
        'effective_url' => $effective,
      ];
    }

    if ($code >= 300 && $code < 400) {
      $loc = $respHeaders['location'] ?? '';
      $next = $resolve_location($effective, $loc);
      if ($next === null) {
        return [
          'ok' => false,
          'stopped' => false,
          'code' => $finalCode,
          'body' => $finalBody,
          'error' => 'redirect_missing_location',
          'effective_url' => $effective,
        ];
      }

      $validatedNext = $validate_url($next);
      if ($validatedNext === null) {
        return [
          'ok' => false,
          'stopped' => false,
          'code' => $finalCode,
          'body' => $finalBody,
          'error' => 'redirect_blocked_or_invalid',
          'effective_url' => $effective,
        ];
      }

      if ($i === $maxRedirects) {
        return [
          'ok' => false,
          'stopped' => false,
          'code' => $finalCode,
          'body' => $finalBody,
          'error' => 'too_many_redirects',
          'effective_url' => $effective,
        ];
      }

      $current = $validatedNext;
      continue;
    }

    // Final (non-redirect) response
    return [
      'ok' => ($ok !== false),
      'stopped' => false,
      'code' => $finalCode,
      'body' => $finalBody,
      'error' => $finalErr,
      'effective_url' => $effective,
    ];
  }

  return [
    'ok' => false,
    'stopped' => false,
    'code' => $finalCode,
    'body' => $finalBody,
    'error' => $finalErr ?: 'unknown_error',
    'effective_url' => $effective,
  ];
}

/* --------------------------- Robots.txt discovery --------------------------- */

function extract_sitemaps_from_robots(string $robotsBody): array {
  $sitemaps = [];
  $lines = preg_split("/\r\n|\n|\r/", $robotsBody) ?: [];

  foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') continue;
    if (stripos($line, 'sitemap:') === 0) {
      $u = trim(substr($line, 8));
      if ($u !== '') $sitemaps[] = $u;
    }
  }

  $seen = [];
  $out = [];
  foreach ($sitemaps as $u) {
    if (isset($seen[$u])) continue;
    $seen[$u] = true;
    $out[] = $u;
  }
  return $out;
}

function candidate_sitemap_urls(string $host): array {
  return [
    "https://{$host}/sitemap.xml",
    "https://{$host}/sitemap_index.xml",
    "https://{$host}/sitemap-index.xml",
    "https://{$host}/sitemap/sitemap.xml",
    "https://{$host}/sitemap-index.xml.gz",
    "https://{$host}/sitemap.xml.gz",
  ];
}

/* --------------------------- Sitemap XML streaming -------------------------- */

function looks_like_xml_sitemap(string $body): bool {
  $b = ltrim($body);
  return str_contains($b, '<urlset') || str_contains($b, '<sitemapindex');
}

function parse_sitemap_type_and_children(string $xml): array {
  libxml_use_internal_errors(true);

  $xr = new XMLReader();
  if (!$xr->XML($xml, null, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) {
    return ['type' => 'unknown', 'children' => []];
  }

  while ($xr->read()) {
    if ($xr->nodeType === XMLReader::ELEMENT) {
      $root = $xr->localName;
      if ($root === 'sitemapindex') {
        $children = [];
        while ($xr->read()) {
          if ($xr->nodeType === XMLReader::ELEMENT && $xr->localName === 'loc') {
            if ($xr->read() && ($xr->nodeType === XMLReader::TEXT || $xr->nodeType === XMLReader::CDATA)) {
              $u = trim($xr->value);
              if ($u !== '') $children[] = $u;
            }
          }
        }
        return ['type' => 'index', 'children' => $children];
      }
      if ($root === 'urlset') {
        return ['type' => 'urlset', 'children' => []];
      }
      return ['type' => 'unknown', 'children' => []];
    }
  }

  return ['type' => 'unknown', 'children' => []];
}

function bump_recent_buckets(array $counts, int $ts, int $now): array {
  $ageDays = (int) floor(($now - $ts) / 86400);
  if ($ageDays < 0) $ageDays = 0;

  if ($ageDays <= 7)   $counts['7']++;
  if ($ageDays <= 14)  $counts['14']++;
  if ($ageDays <= 30)  $counts['30']++;
  if ($ageDays <= 90)  $counts['90']++;
  if ($ageDays <= 180) $counts['180']++;
  if ($ageDays <= 365) $counts['365']++;

  return $counts;
}

function process_urlset_streaming(string $xml, array &$stats, int $maxUrls): void {
  $xr = new XMLReader();
  if (!$xr->XML($xml, null, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) return;

  $inUrl = false;
  $now = time();

  while ($xr->read()) {
    if ($stats['urls_processed'] >= $maxUrls) {
      $stats['hit_limits']['max_urls'] = true;
      return;
    }

    if ($xr->nodeType === XMLReader::ELEMENT) {
      $local = $xr->localName;
      $prefix = $xr->prefix;

      if ($local === 'url') {
        $inUrl = true;
        $stats['urls_processed']++;
        continue;
      }

      if (!$inUrl) continue;

      if ($local === 'lastmod') {
        if ($xr->read() && ($xr->nodeType === XMLReader::TEXT || $xr->nodeType === XMLReader::CDATA)) {
          $ts = strtotime(trim($xr->value));
          if ($ts !== false) {
            $stats['urls_with_lastmod']++;
            $stats['recent_change_counts'] = bump_recent_buckets($stats['recent_change_counts'], $ts, $now);

            $ageDays = ($now - $ts) / 86400.0;
            if ($ageDays < 0) $ageDays = 0.0;
            $stats['age_days_list'][] = $ageDays;
          }
        }
      } elseif ($prefix === 'image' && $local === 'image') {
        $stats['media']['image_entries']++;
      } elseif ($prefix === 'video' && $local === 'video') {
        $stats['media']['video_entries']++;
      } elseif ($prefix === 'news' && $local === 'news') {
        $stats['media']['news_entries']++;
      } elseif ($prefix === 'xhtml' && $local === 'link') {
        $rel = $xr->getAttribute('rel');
        $hreflang = $xr->getAttribute('hreflang');
        if ($hreflang && (!$rel || strtolower($rel) === 'alternate')) {
          $stats['hreflang']['present'] = true;
          $stats['hreflang']['counts'][$hreflang] = ($stats['hreflang']['counts'][$hreflang] ?? 0) + 1;
        }
      }
    } elseif ($xr->nodeType === XMLReader::END_ELEMENT && $xr->localName === 'url') {
      $inUrl = false;
    }
  }
}

/* ------------------------------- Main logic --------------------------------- */

$input = (string)($_GET['input'] ?? $_GET['domain'] ?? '');
$inputHost = normalize_input_to_host($input);
if (!$inputHost) respond(400, ['error' => 'invalid_input']);
if (host_is_blocked($inputHost)) respond(400, ['error' => 'blocked_host']);

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
rate_limit("ip:$ip", 60, 3600);
rate_limit("global", 200, 60);

// Limits
$MAX_URLS = 1000;
$MAX_SITEMAPS = 25;
$MAX_BYTES_PER_SITEMAP = 2_000_000;
$CONNECT_TIMEOUT = 6;
$FETCH_TIMEOUT = 15;

$cacheKey = "sitemap_full_v3:$inputHost";
if ($cached = cache_get($cacheKey, 300)) {
  echo $cached;
  exit;
}

$hostsToTry = [$inputHost];
if (!str_starts_with($inputHost, 'www.')) $hostsToTry[] = 'www.' . $inputHost;
else $hostsToTry[] = preg_replace('/^www\./', '', $inputHost);
$hostsToTry = array_values(array_unique($hostsToTry));

$robotsFound = false;
$robotsMissing = false;
$robotsUrlUsed = null;
$sitemapUrls = [];
$resolvedHost = null;
$fallbackUsed = false;

foreach ($hostsToTry as $h) {
  if (host_is_blocked($h)) continue;

  $robotsUrl = "https://{$h}/robots.txt";
  $robotsAllowedHosts = host_variants($h);
  $allowRobots = fn(string $u): bool => is_allowlisted_target($u, $robotsAllowedHosts);

  $r = http_get_limited($robotsUrl, 200_000, $CONNECT_TIMEOUT, $FETCH_TIMEOUT, 3, $allowRobots);

  if ($r['code'] === 404) {
    $robotsMissing = true;
    continue;
  }

  if ($r['code'] >= 200 && $r['code'] < 300 && $r['body'] !== '') {
    $robotsFound = true;
    $robotsMissing = false;

    $robotsUrlUsed = $r['effective_url'] ?: $robotsUrl;
    $effHost = host_from_url($robotsUrlUsed);
    $resolvedHost = $effHost ?: $h;
    $fallbackUsed = ($resolvedHost !== $inputHost);

    $sitemapUrls = extract_sitemaps_from_robots($r['body']);
    break;
  }
}

$usedHeuristic = false;
if (!$resolvedHost) $resolvedHost = $inputHost;

$allowedHosts = host_variants($resolvedHost);
$allowSitemap = fn(string $u): bool => is_allowlisted_target($u, $allowedHosts);

if (count($sitemapUrls) === 0) {
  $usedHeuristic = true;

  $candidates = candidate_sitemap_urls($resolvedHost);
  foreach ($candidates as $cand) {
    if (!is_allowlisted_target($cand, $allowedHosts)) continue;
    $r = http_get_limited($cand, $MAX_BYTES_PER_SITEMAP, $CONNECT_TIMEOUT, $FETCH_TIMEOUT, 3, $allowSitemap);
    if ($r['code'] >= 200 && $r['code'] < 300 && $r['body'] !== '' && looks_like_xml_sitemap($r['body'])) {
      $sitemapUrls = [$cand];
      break;
    }
  }

  if (count($sitemapUrls) === 0) {
    foreach ($hostsToTry as $h) {
      if ($h === $resolvedHost) continue;
      if (host_is_blocked($h)) continue;

      $candAllowedHosts = host_variants($h);
      $allowCand = fn(string $u): bool => is_allowlisted_target($u, $candAllowedHosts);

      $candidates = candidate_sitemap_urls($h);
      foreach ($candidates as $cand) {
        if (!is_allowlisted_target($cand, $candAllowedHosts)) continue;
        $r = http_get_limited($cand, $MAX_BYTES_PER_SITEMAP, $CONNECT_TIMEOUT, $FETCH_TIMEOUT, 3, $allowCand);
        if ($r['code'] >= 200 && $r['code'] < 300 && $r['body'] !== '' && looks_like_xml_sitemap($r['body'])) {
          $resolvedHost = $h;
          $allowedHosts = host_variants($resolvedHost);
          $allowSitemap = fn(string $u): bool => is_allowlisted_target($u, $allowedHosts);
          $fallbackUsed = ($resolvedHost !== $inputHost);
          $sitemapUrls = [$cand];
          break 2;
        }
      }
    }
  }
}

if (count($sitemapUrls) === 0) {
  $payload = [
    'error' => 'no_sitemap_found',
    'input_host' => $inputHost,
    'resolved_host' => $resolvedHost,
    'allowed_hosts' => $allowedHosts,
    'host_fallback_used' => $fallbackUsed,
    'robots' => [
      'found' => $robotsFound,
      'missing' => $robotsMissing,
      'url' => $robotsUrlUsed,
      'used_heuristic' => $usedHeuristic,
    ],
  ];
  $json = json_encode($payload, JSON_UNESCAPED_SLASHES);
  cache_set($cacheKey, $json);
  echo $json;
  exit;
}

$queue = [];
foreach ($sitemapUrls as $u) {
  $norm = normalize_to_https($u, $resolvedHost);
  if (!$norm) continue;

  $uHost = host_from_url($norm);
  if ($uHost === null || !in_array($uHost, $allowedHosts, true)) continue;

  if (is_allowlisted_target($norm, $allowedHosts)) $queue[] = $norm;
}

$queue = array_values(array_unique($queue));

if (count($queue) === 0) {
  $payload = [
    'error' => 'no_usable_sitemaps_after_normalization',
    'input_host' => $inputHost,
    'resolved_host' => $resolvedHost,
    'allowed_hosts' => $allowedHosts,
    'host_fallback_used' => $fallbackUsed,
    'robots' => [
      'found' => $robotsFound,
      'missing' => $robotsMissing,
      'url' => $robotsUrlUsed,
      'used_heuristic' => $usedHeuristic,
      'sitemaps_from_robots' => $robotsFound ? $sitemapUrls : [],
    ],
  ];
  $json = json_encode($payload, JSON_UNESCAPED_SLASHES);
  cache_set($cacheKey, $json);
  echo $json;
  exit;
}

$seenSitemaps = [];

$stats = [
  'urls_processed' => 0,
  'urls_with_lastmod' => 0,
  'recent_change_counts' => ['7'=>0,'14'=>0,'30'=>0,'90'=>0,'180'=>0,'365'=>0],
  'age_days_list' => [],
  'media' => ['image_entries'=>0,'video_entries'=>0,'news_entries'=>0],
  'hreflang' => ['present'=>false, 'counts'=>[]],
  'hit_limits' => ['max_urls'=>false,'max_sitemaps'=>false,'max_bytes'=>false],
  'sitemaps_processed' => 0,
  'sitemaps_discovered' => count($queue),
];

while (count($queue) > 0) {
  if ($stats['sitemaps_processed'] >= $MAX_SITEMAPS) {
    $stats['hit_limits']['max_sitemaps'] = true;
    break;
  }
  if ($stats['urls_processed'] >= $MAX_URLS) {
    $stats['hit_limits']['max_urls'] = true;
    break;
  }

  $sitemapUrl = array_shift($queue);
  if (isset($seenSitemaps[$sitemapUrl])) continue;
  $seenSitemaps[$sitemapUrl] = true;

  $r = http_get_limited($sitemapUrl, $MAX_BYTES_PER_SITEMAP, $CONNECT_TIMEOUT, $FETCH_TIMEOUT, 3, $allowSitemap);

  $effectiveSitemapUrl = $r['effective_url'] ?: $sitemapUrl;
  $effHost = host_from_url($effectiveSitemapUrl);
  if ($effHost && !in_array($effHost, $allowedHosts, true)) {
    continue;
  }

  if ($r['stopped']) $stats['hit_limits']['max_bytes'] = true;
  if (!($r['code'] >= 200 && $r['code'] < 300) || $r['body'] === '') continue;
  if (!looks_like_xml_sitemap($r['body'])) continue;

  $stats['sitemaps_processed']++;

  $meta = parse_sitemap_type_and_children($r['body']);
  if (($meta['type'] ?? '') === 'index') {
    $children = $meta['children'] ?? [];
    foreach ($children as $child) {
      if ($stats['sitemaps_processed'] + count($queue) >= $MAX_SITEMAPS) {
        $stats['hit_limits']['max_sitemaps'] = true;
        break;
      }

      $norm = normalize_to_https($child, $resolvedHost);
      if (!$norm) continue;

      $childHost = host_from_url($norm);
      if ($childHost === null || !in_array($childHost, $allowedHosts, true)) continue;
      if (!is_allowlisted_target($norm, $allowedHosts)) continue;

      if (!isset($seenSitemaps[$norm])) $queue[] = $norm;
    }
    $stats['sitemaps_discovered'] = max($stats['sitemaps_discovered'], count($seenSitemaps) + count($queue));
  } elseif (($meta['type'] ?? '') === 'urlset') {
    process_urlset_streaming($r['body'], $stats, $MAX_URLS);
  }
}

$coverage = null;
if ($stats['urls_processed'] > 0) {
  $coverage = $stats['urls_with_lastmod'] / $stats['urls_processed'];
}

$avgAge = null;
$medianAge = null;
$sampleSize = count($stats['age_days_list']);

if ($sampleSize > 0) {
  $sum = array_sum($stats['age_days_list']);
  $avgAge = $sum / $sampleSize;

  sort($stats['age_days_list']);
  $mid = intdiv($sampleSize, 2);
  if ($sampleSize % 2 === 1) {
    $medianAge = $stats['age_days_list'][$mid];
  } else {
    $medianAge = ($stats['age_days_list'][$mid - 1] + $stats['age_days_list'][$mid]) / 2.0;
  }
}

// Final response
$payload = [
  'input_host' => $inputHost,
  'resolved_host' => $resolvedHost,
  'allowed_hosts' => $allowedHosts,
  'host_fallback_used' => $fallbackUsed,

  'robots' => [
    'found' => $robotsFound,
    'missing' => $robotsMissing,
    'url' => $robotsUrlUsed,
    'used_heuristic' => $usedHeuristic,
    'sitemaps_from_robots' => $robotsFound ? $sitemapUrls : [],
  ],

  'sitemaps' => [
    'discovered' => $stats['sitemaps_discovered'],
    'processed' => $stats['sitemaps_processed'],
    'limits' => [
      'max_sitemaps' => $MAX_SITEMAPS,
      'max_urls' => $MAX_URLS,
      'max_bytes_per_sitemap' => $MAX_BYTES_PER_SITEMAP,
      'connect_timeout_sec' => $CONNECT_TIMEOUT,
      'fetch_timeout_sec' => $FETCH_TIMEOUT,
    ],
    'hit_limits' => $stats['hit_limits'],
  ],

  'pages' => [
    'urls_processed' => $stats['urls_processed'],
  ],

  'lastmod' => [
    'any' => $stats['urls_with_lastmod'] > 0,
    'urls_with_lastmod' => $stats['urls_with_lastmod'],
    'coverage' => $coverage,
  ],

  'recent_changes' => [
    'days_7' => $stats['recent_change_counts']['7'],
    'days_14' => $stats['recent_change_counts']['14'],
    'days_30' => $stats['recent_change_counts']['30'],
    'days_90' => $stats['recent_change_counts']['90'],
    'days_180' => $stats['recent_change_counts']['180'],
    'days_365' => $stats['recent_change_counts']['365'],
    'note' => 'Counts only include URLs with parseable lastmod',
  ],

  'age_days' => [
    'avg' => $avgAge,
    'median' => $medianAge,
    'sample_size' => $sampleSize,
    'note' => 'Computed only from URLs with parseable lastmod',
  ],

  'media' => [
    'image_entries' => $stats['media']['image_entries'],
    'video_entries' => $stats['media']['video_entries'],
    'news_entries' => $stats['media']['news_entries'],
    'note' => 'Counts are occurrences of image:image, video:video, news:news elements',
  ],

  'hreflang' => [
    'present' => $stats['hreflang']['present'],
    'counts' => (object)$stats['hreflang']['counts'],
    'note' => 'Counts hreflang attributes in xhtml:link rel=alternate elements',
  ],
];

$json = json_encode($payload, JSON_UNESCAPED_SLASHES);
cache_set($cacheKey, $json);
echo $json;