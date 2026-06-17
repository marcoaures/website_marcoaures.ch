(function () {
  var svg = document.getElementById('jny');
  var paths = Array.prototype.slice.call(svg.querySelectorAll('.jny-path'));
  var ns = 'http://www.w3.org/2000/svg';
  var W = 50, H = 34;
 
  function drawWindow(parent, cx, cy, cls) {
    var x = cx-W/2, y = cy-H/2;
    var g = document.createElementNS(ns,'g');
 
    var halo = document.createElementNS(ns,'rect');
    halo.setAttribute('class', cls.halo);
    halo.setAttribute('x',x-3); halo.setAttribute('y',y-3);
    halo.setAttribute('width',W+6); halo.setAttribute('height',H+6);
    halo.setAttribute('rx',6);
 
    var body = document.createElementNS(ns,'rect');
    body.setAttribute('class', cls.body);
    body.setAttribute('x',x); body.setAttribute('y',y);
    body.setAttribute('width',W); body.setAttribute('height',H);
    body.setAttribute('rx',4);
 
    var bar = document.createElementNS(ns,'rect');
    bar.setAttribute('class', cls.bar);
    bar.setAttribute('x',x); bar.setAttribute('y',y);
    bar.setAttribute('width',W); bar.setAttribute('height',8); bar.setAttribute('rx',4);
 
    var dot = document.createElementNS(ns,'circle');
    dot.setAttribute('class', cls.dot);
    dot.setAttribute('cx',x+5); dot.setAttribute('cy',y+4); dot.setAttribute('r',1.5);
 
    g.appendChild(halo); g.appendChild(body); g.appendChild(bar); g.appendChild(dot);
    parent.appendChild(g);
  }
 
  var winCoords = [
    [58,42],[58,110],[58,178],[58,246],
    [176,76],[176,144],[176,212],
    [296,110],[296,178]
  ];
  var wg = document.getElementById('windows');
  var stdCls = { halo:'win-halo', body:'win-body', bar:'win-bar', dot:'win-dot' };
  winCoords.forEach(function (c) { drawWindow(wg, c[0], c[1], stdCls); });
 
  drawWindow(document.getElementById('goal'), 404, 144,
    { halo:'goal-halo', body:'goal-body', bar:'goal-bar', dot:'goal-dot' });
 
  function grow() {
    paths.forEach(function (p, idx) {
      var w = parseFloat(p.getAttribute('data-w'));
      setTimeout(function () { p.style.strokeWidth = w; }, idx * 260);
    });
    var winner = paths.find(function (p) { return p.getAttribute('data-win') === '1'; });
    setTimeout(function () { if (winner) winner.classList.add('win'); }, 2400);
  }
 
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { grow(); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    obs.observe(svg);
  } else { grow(); }
})();