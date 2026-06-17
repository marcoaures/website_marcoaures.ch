(function () {
  var svg = document.getElementById('rep');
  var line = document.getElementById('line');
  line.style.setProperty('--len', line.getTotalLength());

  Array.prototype.forEach.call(svg.querySelectorAll('.rep-leader'), function (l) {
    l.style.setProperty('--llen', l.getTotalLength());
  });

  function tForX(x){ return ((x-44)/416)*3200; }

  var schedule = [
    { step: 0, at: tForX(130) },
    { step: 1, at: tForX(215) },
    { step: 2, at: tForX(255) },
    { step: 3, at: tForX(340) },
    { step: 4, at: tForX(380) }
  ];

  function reveal(step) {
    Array.prototype.forEach.call(
      svg.querySelectorAll('[data-step="' + step + '"]'),
      function (el) {
        var delay = (el.classList.contains('rep-marker') || el.classList.contains('rep-event')) ? 0
                  : el.classList.contains('rep-leader') ? 150 : 300;
        setTimeout(function () { el.classList.add('show'); }, delay);
      }
    );
  }

  function start() {
    svg.classList.add('is-visible');
    schedule.forEach(function (s) { setTimeout(function () { reveal(s.step); }, s.at); });
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { start(); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    obs.observe(svg);
  } else { start(); }
})();
