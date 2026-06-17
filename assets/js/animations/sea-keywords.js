(function () {
  var tile = document.getElementById('kw-tile');
  if (!tile) return;

  var lastAnimated = tile.querySelector('mark.kw[data-step="4"]');

  var hasFinished = false;
  var goTimer = null;

  function start() {
    hasFinished = false;

    tile.classList.add('is-visible');

    clearTimeout(goTimer);
    goTimer = setTimeout(function () {
      tile.classList.add('go');
    }, 1500);
  }

  function replay() {
    if (!hasFinished) return;

    hasFinished = false;
    tile.classList.remove('is-visible', 'go');

    void tile.offsetWidth;

    start();
  }

  if (lastAnimated) {
    lastAnimated.addEventListener('animationend', function (e) {
      if (e.animationName === 'sweep') {
        hasFinished = true;
      }
    });
  }

  tile.addEventListener('mouseenter', replay);

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        start();
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });

  obs.observe(tile);
})();