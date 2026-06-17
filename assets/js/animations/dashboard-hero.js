(function () {
  function initDashboardHero(root) {
    var cards = Array.prototype.slice.call(root.querySelectorAll('.card'));
    var ns = 'http://www.w3.org/2000/svg';
    var pieSvg = root.querySelector('.pie');

    if (!cards.length || !pieSvg) return;

    var pie = [42, 28, 18, 12];
    var colors = ['var(--c0)','var(--c1)','var(--c2)','var(--c3)'];
    var R = 13, C = 2 * Math.PI * R, offset = 0;

    pie.forEach(function (pct, i) {
      var c = document.createElementNS(ns, 'circle');
      c.setAttribute('class', 'pie-seg');
      c.setAttribute('cx', '18');
      c.setAttribute('cy', '18');
      c.setAttribute('r', R);
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', colors[i]);
      c.setAttribute('stroke-width', '5');
      c.setAttribute('stroke-dasharray', (C * pct / 100) + ' ' + (C - C * pct / 100));
      c.setAttribute('stroke-dashoffset', (-C * offset / 100));
      offset += pct;
      pieSvg.appendChild(c);
    });

    var cur = 0;
    cards[0].classList.add('active');

    function show(next) {
      var outgoing = cards[cur];
      var incoming = cards[next];

      outgoing.classList.remove('active');
      outgoing.classList.add('leaving');
      incoming.classList.add('active');

      setTimeout(function () {
        outgoing.classList.remove('leaving');
      }, 600);

      cur = next;
    }

    function run() {
      setInterval(function () {
        show((cur + 1) % cards.length);
      }, 2400);
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            run();
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.4 });

      obs.observe(root);
    } else {
      run();
    }
  }

  function boot() {
    document
      .querySelectorAll('.service-hero-animation #dash')
      .forEach(initDashboardHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();