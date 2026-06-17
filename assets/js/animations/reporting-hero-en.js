(function () {
  var root = document.getElementById('iw');
  var ring = document.getElementById('iwRing');
  var ns = 'http://www.w3.org/2000/svg';

  var nodes = [
    [50,50],[110,30],[175,55],[240,35],[300,60],[365,45],
    [40,110],[100,95],[160,115],[220,95],[285,118],[345,100],
    [70,165],[130,150],[195,170],[255,150],[315,168],[375,150],
    [95,210],[160,215],[230,205],[300,212]
  ];

  var edges = [
    [0,1],[1,2],[2,3],[3,4],[4,5],
    [0,6],[1,7],[2,8],[3,9],[4,10],[5,11],
    [6,7],[7,8],[8,9],[9,10],[10,11],
    [6,12],[7,13],[8,14],[9,15],[10,16],[11,17],
    [12,13],[13,14],[14,15],[15,16],[16,17],
    [12,18],[13,19],[14,19],[15,20],[16,21],
    [18,19],[19,20],[20,21],
    [2,9],[1,8],[3,10],[8,13],[9,14],[14,20],[10,15]
  ];

  var openEdges = [
    [0,[18,-22]], [1,[112,2]], [3,[244,5]], [5,[392,18]],
    [5,[395,60]], [11,[378,88]], [17,[404,150]],
    [21,[326,238]], [18,[80,238]], [12,[44,188]], [6,[10,118]]
  ];
  var OPEN_LEN = 26;

  function shorten(a, b, maxLen) {
    var dx = b[0]-a[0], dy = b[1]-a[1];
    var d = Math.sqrt(dx*dx+dy*dy);
    if (d <= maxLen) return b;
    return [a[0] + dx/d*maxLen, a[1] + dy/d*maxLen];
  }

  var eg = document.getElementById('iwEdges');

  openEdges.forEach(function (oe) {
    var a = nodes[oe[0]];
    var b = shorten(a, oe[1], OPEN_LEN);
    var ln = document.createElementNS(ns,'line');
    ln.setAttribute('class','iw-edge');
    ln.setAttribute('x1',a[0]); ln.setAttribute('y1',a[1]);
    ln.setAttribute('x2',b[0]); ln.setAttribute('y2',b[1]);
    eg.appendChild(ln);
  });

  var edgeEls = edges.map(function (e) {
    var a = nodes[e[0]], b = nodes[e[1]];
    var ln = document.createElementNS(ns,'line');
    ln.setAttribute('class','iw-edge');
    ln.setAttribute('x1',a[0]); ln.setAttribute('y1',a[1]);
    ln.setAttribute('x2',b[0]); ln.setAttribute('y2',b[1]);
    eg.appendChild(ln);
    return { el: ln, a: e[0], b: e[1] };
  });

  var ng = document.getElementById('iwNodes');
  var nodeEls = nodes.map(function (n) {
    var c = document.createElementNS(ns,'circle');
    c.setAttribute('class','iw-node');
    c.setAttribute('cx',n[0]); c.setAttribute('cy',n[1]); c.setAttribute('r',5);
    ng.appendChild(c);
    return c;
  });

  var findings = [
    { node: 8,  text: 'Change side bar' },
    { node: 4,  text: 'Modify CTA' },
    { node: 19, text: 'Ads-Retargeting' },
    { node: 15, text: 'Link help page' },
    { node: 1,  text: 'Shorten form' },
    { node: 16, text: 'Refresh blog' }
  ];

  var pillsWrap = document.getElementById('iwPills');
  var pillEls = findings.map(function (f) {
    var s = document.createElement('span');
    s.className = 'iw-pill';
    s.textContent = f.text;
    pillsWrap.appendChild(s);
    return s;
  });

  var prevPill = null;

  function showFinding(i) {
    var f = findings[i];

    if (prevPill !== null) { prevPill.classList.remove('active'); prevPill.classList.add('filed'); }

    nodeEls[f.node].classList.add('glow');
    edgeEls.forEach(function (ed) {
      if (ed.a === f.node || ed.b === f.node) {
        ed.el.classList.add('lit');
        setTimeout(function () { ed.el.classList.remove('lit'); }, 900);
      }
    });

    ring.setAttribute('cx', nodes[f.node][0]);
    ring.setAttribute('cy', nodes[f.node][1]);
    ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go');

    var p = pillEls[i];
    p.classList.add('show');
    void p.offsetWidth;
    setTimeout(function () { p.classList.add('active'); }, 250);
    prevPill = p;
  }

  function run() {
    var i = 0;
    showFinding(0);
    var iv = setInterval(function () {
      i++;
      if (i >= findings.length) {
        clearInterval(iv);
        setTimeout(function () {
          if (prevPill) { prevPill.classList.remove('active'); prevPill.classList.add('filed'); }
        }, 1700);
        return;
      }
      showFinding(i);
    }, 2600);
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(run, 1000); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    obs.observe(root);
  } else { setTimeout(run, 1000); }
})();
