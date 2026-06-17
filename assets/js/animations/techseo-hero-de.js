(function () {
  var root = document.getElementById('ts');
  var ns = 'http://www.w3.org/2000/svg';
 
  var CX = 50, CY = 50, R = 38;
  var arcLen = Math.PI * R;
  function polar(deg){ var r=deg*Math.PI/180; return [CX+R*Math.sin(r), CY-R*Math.cos(r)]; }
  var p0 = polar(-90), p1 = polar(90);
  var arcPath = 'M'+p0[0]+','+p0[1]+' A'+R+','+R+' 0 0 1 '+p1[0]+','+p1[1];
 
  var gauges = [
    { label:'Linkstruktur',     from:0.18, to:1 },
    { label:'Seitenarchitektur',from:0.25, to:1 },
    { label:'Core-Web-Vitals',  from:0.30, to:1 },
    { label:'Crawlbarkeit',     from:0.15, to:1 }
  ];
 
  var wrap = document.getElementById('tsGauges');
  var gaugeEls = gauges.map(function (g) {
    var d = document.createElement('div');
    d.className = 'ts-gauge';
 
    var svg = document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 100 60');
 
    var track = document.createElementNS(ns,'path');
    track.setAttribute('class','ts-track');
    track.setAttribute('d',arcPath);
 
    var fill = document.createElementNS(ns,'path');
    fill.setAttribute('class','ts-fill');
    fill.setAttribute('d',arcPath);
    fill.style.setProperty('--arc', arcLen);
    fill.style.setProperty('--from',   arcLen * (1 - g.from));
    fill.style.setProperty('--target', arcLen * (1 - g.to));
 
    svg.appendChild(track); svg.appendChild(fill);
    d.appendChild(svg);
 
    var lbl = document.createElement('div');
    lbl.className = 'ts-label'; lbl.textContent = g.label;
    d.appendChild(lbl);
 
    wrap.appendChild(d);
    return { el:d };
  });
 
  var scoreEl = document.getElementById('tsScore');
  var numEl = document.getElementById('tsNum');
  var rankSteps = [42.6, 31.1, 22.8, 9.7, 1.2];
 
  function bumpRank(toValue, fromValue) {
    var start = performance.now(), dur = 700;
    function tick(now){
      var t = Math.min((now-start)/dur, 1);
      numEl.textContent = 'Ø Rank ' + Math.round(fromValue + (toValue-fromValue)*t);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
 
  function raiseGauge(i) {
    var g = gaugeEls[i];
    g.el.classList.add('go');
    setTimeout(function () { g.el.classList.add('good'); }, 650);
    setTimeout(function () {
      bumpRank(rankSteps[i+1], rankSteps[i]);
      if (i+1 === gaugeEls.length) scoreEl.classList.add('peaked');
    }, 1100);
  }
 
  function run() {
    gaugeEls.forEach(function (_, i) {
      setTimeout(function () { raiseGauge(i); }, i * 1300);
    });
  }
 
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(run, 600); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    obs.observe(root);
  } else { setTimeout(run, 600); }
})();