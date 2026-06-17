(function () {
  var root = document.getElementById('rb');
  var body = document.getElementById('rbBody');

  var lines = [
    [{cls:'rb-key', text:'User-agent: '},{cls:'', text:'*'}],
    [],
    [{cls:'rb-comment', text:'# Exclude shopping cart from crawling'}],
    [{cls:'rb-key', text:'Disallow: '},{cls:'rb-val', text:'/cart/'}],
    [{cls:'rb-comment', text:'# Exclude filtered views from crawling'}],
    [{cls:'rb-key', text:'Disallow: '},{cls:'rb-val', text:'/*?filter='}],
    [],
    [{cls:'rb-key', text:'Sitemap: '},{cls:'rb-val', text:'https://yourwebsite.ch/sitemap.xml'}]
  ];

  var lineEls = lines.map(function () {
    var el = document.createElement('span');
    el.className = 'rb-line';
    body.appendChild(el);
    return el;
  });

  var caret = document.createElement('span');
  caret.className = 'rb-caret';

  var li = 0;
  var si = 0;
  var ci = 0;
  var segSpan = null;

  var CHAR_MS = 28;
  var LINE_PAUSE = 260;
  var BLANK_PAUSE = 160;

  function ensureLineVisible(el) {
    el.classList.add('show');
    el.appendChild(caret); 
  }

  function typeStep() {
    if (li >= lines.length) { caret.remove(); return; }

    var line = lines[li];
    var el = lineEls[li];

    if (!el.classList.contains('show')) ensureLineVisible(el);

    if (line.length === 0) {
      el.textContent = '\u200b'; 
      el.appendChild(caret);
      li++; si = 0; ci = 0; segSpan = null;
      setTimeout(typeStep, BLANK_PAUSE);
      return;
    }

    var seg = line[si];

    if (segSpan === null) {
      segSpan = document.createElement('span');
      if (seg.cls) segSpan.className = seg.cls;
      el.insertBefore(segSpan, caret);
    }

    segSpan.textContent += seg.text.charAt(ci);
    ci++;

    if (ci >= seg.text.length) {
      si++; ci = 0; segSpan = null;
      if (si >= line.length) {
        li++; si = 0;
        setTimeout(typeStep, LINE_PAUSE);
        return;
      }
    }
    setTimeout(typeStep, CHAR_MS);
  }

  function run() { typeStep(); }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(run, 500); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    obs.observe(root);
  } else { setTimeout(run, 500); }
})();