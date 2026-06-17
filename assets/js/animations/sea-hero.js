(function () {
  var tile = document.getElementById('tile');
  if (!tile) return;

  var query = tile.querySelector('.sea-query');
  if (!query) return;

  var text = query.getAttribute('data-text') || query.textContent || '';
  var hasFinished = false;

  query.textContent = text;
  query.style.setProperty('--sea-steps', text.length);

  function measureAndSet() {
    var probe = document.createElement('span');
    var cs = window.getComputedStyle(query);

    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.whiteSpace = 'pre';
    probe.style.font = cs.font;
    probe.style.fontFamily = cs.fontFamily;
    probe.style.fontSize = cs.fontSize;
    probe.style.fontWeight = cs.fontWeight;
    probe.style.letterSpacing = cs.letterSpacing;
    probe.textContent = text;

    document.body.appendChild(probe);

    var w = probe.getBoundingClientRect().width;

    document.body.removeChild(probe);

    query.style.setProperty('--sea-width', Math.ceil(w + 4) + 'px');
  }

  function restartAnimation() {
    tile.classList.remove('is-visible');

    void tile.offsetWidth;

    tile.classList.add('is-visible');
  }

  measureAndSet();

  query.addEventListener('animationend', function () {
    hasFinished = true;
  });

  tile.addEventListener('mouseenter', function () {
    if (hasFinished) {
      hasFinished = false;
      restartAnimation();
    }
  });

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });

    obs.observe(tile);
  } else {
    tile.classList.add('is-visible');
  }
})();