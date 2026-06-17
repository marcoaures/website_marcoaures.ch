(function () {
  var root = document.getElementById('trk');
  if (!root) return;

  var bars  = Array.prototype.slice.call(root.querySelectorAll('.trk-bar'));
  var chans = Array.prototype.slice.call(root.querySelectorAll('.trk-chan'));

  var patterns = [
    [90, 70, 45, 30, 55],  // Google
    [80, 60, 25, 15, 30],  // Instagram
    [50, 40, 55, 20, 60],  // Mail
    [60, 45, 30, 65, 50],  // YouTube
    [55, 65, 20, 25, 70]   // QR
  ];

  var i = -1;
  var timer = null;
  var hasFinished = false;

  function step() {
    i++;
    if (i >= patterns.length) {
      clearInterval(timer);
      timer = null;
      hasFinished = true;
      return;
    }
    chans.forEach(function (c, idx) { c.classList.toggle('active', idx === i); });
    var p = patterns[i];
    bars.forEach(function (b, idx) { b.style.height = p[idx] + '%'; });
  }

  function start() {
    hasFinished = false;
    i = -1;
    step();
    timer = setInterval(step, 1600);
  }

  function replay() {
    if (!hasFinished) return;
    start();
  }

  root.addEventListener('mouseenter', replay);

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !timer && !hasFinished) {
        start();
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  obs.observe(root);
})();