(function () {
  var root = document.getElementById('vf');
  var dimEl = document.getElementById('vfDim');
  var bars = Array.prototype.slice.call(root.querySelectorAll('.vf-bar'));
  var lbls = Array.prototype.slice.call(root.querySelectorAll('.vf-lbl'));

  var views = [
    { dim:'Herkunft',  data:[['Direkt',40],['Organisch',35],['Newsletter',11],['Paid',9],['Social',5]] },
    { dim:'Kampagnen', data:[['Search Ads',45],['LinkedIn Ads',25],['Newsletter',15],['Meta-Ads',10],['QR-Sticker',5]] },
    { dim:'Kantone',   data:[['ZH',34],['BE',26],['BS',20],['LU',12],['Andere',8]] }
  ];

  var globalMax = 45;

  function apply(v) {
    var d = views[v].data;
    dimEl.classList.add('swap');
    setTimeout(function () {
      dimEl.textContent = views[v].dim;
      dimEl.classList.remove('swap');
    }, 300);

    var maxPct = Math.max.apply(null, d.map(function(x){return x[1];}));
    d.forEach(function (row, i) {
      bars[i].style.width = (row[1] / globalMax * 100) + '%';
      bars[i].classList.toggle('hot', row[1] === maxPct);
      lbls[i].textContent = row[0];
    });
  }

  var cur = 0;
  function run() {
    apply(0);
    setInterval(function () {
      cur = (cur + 1) % views.length;
      apply(cur);
    }, 2600);
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
