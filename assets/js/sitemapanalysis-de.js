(() => {
  const API = "https://marcoaures.ch/api/sitemap_analysis.php";

  const input = document.getElementById("sitemapInput");
  const btn = document.getElementById("sitemapGo");
  const out = document.getElementById("sitemapOut");

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function fmt(n) {
    return (typeof n === "number") ? n.toLocaleString() : "—";
  }

  function pct(x) {
    return (typeof x === "number") ? `${Math.round(x * 100)}%` : "—";
  }

function render(data) {
  const hl = data.hreflang?.present
    ? Object.entries(data.hreflang.counts || {})
        .sort((a,b) => b[1]-a[1])
        .slice(0, 8)
        .map(([k,v]) => `${esc(k)} (${fmt(v)})`)
        .join(", ")
    : "—";

  const limitsHit = data.sitemaps?.hit_limits
    ? Object.entries(data.sitemaps.hit_limits).filter(([,v]) => v).map(([k]) => k)
    : [];

  out.innerHTML = `
    <div class="sitemap-tool-grid">
	
      ${limitsHit.length ? `
        <div class="sitemap-tool-card sitemap-tool-fullrow sitemap-tool-note" id="limit">
          Limit erreicht: ${esc(limitsHit.join(", "))}
        </div>
      ` : ""}
	
      <div class="sitemap-tool-card"><span>Ermittelter Hostname</span><b>${esc(data.resolved_host || "—")}</b></div>
      <div class="sitemap-tool-card"><span>Verarbeitete Sitemaps</span><b>${fmt(data.sitemaps?.processed)}</b></div>
      <div class="sitemap-tool-card"><span>Verarbeitete Seiten (URLs)</span><b>${fmt(data.pages?.urls_processed)}</b></div>
      <div class="sitemap-tool-card"><span>Anteil mit lastmod</span><b>${pct(data.lastmod?.coverage)}</b></div>

      <div class="sitemap-tool-card"><span>Geändert ≤ 7 Tage</span><b>${fmt(data.recent_changes?.days_7)}</b></div>
      <div class="sitemap-tool-card"><span>Geändert ≤ 30 Tage</span><b>${fmt(data.recent_changes?.days_30)}</b></div>
      <div class="sitemap-tool-card"><span>Geändert ≤ 90 Tage</span><b>${fmt(data.recent_changes?.days_90)}</b></div>
      <div class="sitemap-tool-card"><span>Geändert ≤ 365 Tage</span><b>${fmt(data.recent_changes?.days_365)}</b></div>

      <div class="sitemap-tool-card"><span>Durchschnittsalter (Tage)</span><b>${data.age_days?.avg != null ? Math.round(data.age_days.avg) : "—"}</b></div>
      <div class="sitemap-tool-card"><span>Median-Alter (Tage)</span><b>${data.age_days?.median != null ? Math.round(data.age_days.median) : "—"}</b></div>
      <div class="sitemap-tool-card"><span>Bildeinträge</span><b>${fmt(data.media?.image_entries)}</b></div>
      <div class="sitemap-tool-card"><span>Videoeinträge</span><b>${fmt(data.media?.video_entries)}</b></div>

      <div class="sitemap-tool-card sitemap-tool-fullrow">
        <span>Verteilung Sprachen (via hreflang)</span><b>${hl}</b>
      </div>
    </div>
  `;
}

  async function run() {
    const val = input.value.trim();
    if (!val) {
      out.textContent = "Keine gültige Domain eingegeben";
      return;
    }

    btn.disabled = true;
    out.textContent = "Verarbeite…";

    try {
      const r = await fetch(`${API}?input=${encodeURIComponent(val)}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      const data = await r.json().catch(() => null);

      if (!r.ok) {
        if (r.status === 429 && data?.retry_after_seconds) {
          out.textContent = `Rate limited: Versuche es in ${data.retry_after_seconds}s erneut.`;
        } else {
          out.textContent = data?.error ? `Error: ${data.error}` : `Error: HTTP ${r.status}`;
        }
        return;
      }

      render(data);
    } catch (e) {
      out.textContent = "Fehlgeschlagen: (network or CORS).";
    } finally {
      btn.disabled = false;
    }
  }

  btn.addEventListener("click", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run();
  });
})();