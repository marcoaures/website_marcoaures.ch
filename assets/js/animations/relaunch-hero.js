(function () {
  var root = document.getElementById('gl');
  var lineA = document.getElementById('glLineA');
  var lineB = document.getElementById('glLineB');
  lineA.style.setProperty('--len', lineA.getTotalLength());
  lineB.style.setProperty('--len', lineB.getTotalLength());

  var tGoLive = ((210-44)/(450-44))*2600;

  function run() {
    root.classList.add('is-go');
    setTimeout(function () {
      document.getElementById('glGuide').classList.add('show');
      document.getElementById('glTag').classList.add('show');
      document.getElementById('glTagText').classList.add('show');
    }, tGoLive);
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
