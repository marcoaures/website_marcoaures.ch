(function () {
  var root = document.getElementById('rl');
  var ns = 'http://www.w3.org/2000/svg';
  var W = 110, H = 30;
 
  var leftX = 8, rightX = 420 - 8 - W;
  var rows = [12, 54, 96, 138, 180];
 
  function leftCentreRight(row){ return [leftX + W, rows[row] + H/2]; }
  function rightCentreLeft(row){ return [rightX, rows[row] + H/2]; }
 
  function drawWindow(parent, x, y, isNew) {
    var g = document.createElementNS(ns,'g');
    var body = document.createElementNS(ns,'rect');
    body.setAttribute('class','rl-win-body');
    body.setAttribute('x',x); body.setAttribute('y',y);
    body.setAttribute('width',W); body.setAttribute('height',H); body.setAttribute('rx',5);
    var bar = document.createElementNS(ns,'rect');
    bar.setAttribute('class','rl-win-bar' + (isNew ? ' new' : ''));
    bar.setAttribute('x',x); bar.setAttribute('y',y);
    bar.setAttribute('width',W); bar.setAttribute('height',8); bar.setAttribute('rx',5);
    var dot = document.createElementNS(ns,'circle');
    dot.setAttribute('class','rl-win-dot');
    dot.setAttribute('cx',x+6); dot.setAttribute('cy',y+4); dot.setAttribute('r',1.5);
    g.appendChild(body); g.appendChild(bar); g.appendChild(dot);
    parent.appendChild(g);
  }
 
  var wg = document.getElementById('rlWins');
  rows.forEach(function (y) { drawWindow(wg, leftX, y, false); });
  rows.forEach(function (y) { drawWindow(wg, rightX, y, true); });
 
  var maps = [ [0,3], [1,0], [2,2], [3,4], [4,1] ];
 
  var lg = document.getElementById('rlLinks');
  var linkEls = maps.map(function (m) {
    var a = leftCentreRight(m[0]);
    var b = rightCentreLeft(m[1]);
    var ln = document.createElementNS(ns,'line');
    ln.setAttribute('class','rl-link');
    ln.setAttribute('x1',a[0]); ln.setAttribute('y1',a[1]);
    ln.setAttribute('x2',b[0]); ln.setAttribute('y2',b[1]);
    lg.appendChild(ln);
    var len = Math.hypot(b[0]-a[0], b[1]-a[1]);
    ln.style.setProperty('--len', len);
    return ln;
  });
 
  function run() {
    document.getElementById('rlCount').classList.add('show');
    linkEls.forEach(function (ln, i) {
      setTimeout(function () { ln.classList.add('draw'); }, 400 + i * 600);
    });
  }
 
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    obs.observe(root);
  } else { run(); }
})();