(function () {
  var win = document.getElementById('win');
  var reel = document.getElementById('reel');
  var slot = document.getElementById('slot');

  function getRowH() {
    var v = getComputedStyle(slot).getPropertyValue('--row-h').trim();
    var n = parseFloat(v);
    return isNaN(n) ? 60 : n;
  }
  var rowH = getRowH();

  var iconEls = Array.prototype.slice.call(
    document.querySelectorAll('.slot-icons .slot-icon')
  );

  function setActiveIcon(idx) {
    iconEls.forEach(function (el, n) {
      if (n === idx) { el.classList.add('active'); }
      else { el.classList.remove('active'); }
    });
  }

  var words = [
    'On-Page-SEO',
    'Google-Ads',
    'GA4-Analysis',
    'Meta- & LinkedIn-Ads',
    'Setting up GTM',
    'Conversion-Optimization',
    'and more'
  ];

  var seq = words.concat([words[0]]);
  seq.forEach(function (w) {
    var s = document.createElement('span');
    s.className = 'slot-item';
    s.textContent = w;
    reel.appendChild(s);
  });

  function fitWidth() {
    var max = 0;
    Array.prototype.forEach.call(reel.children, function (el) {
      max = Math.max(max, el.scrollWidth);
    });
    win.style.width = max + 'px';
  }

  var i = 0;
  function step() {
    i++;
    reel.style.transition = 'transform .7s cubic-bezier(.2,.8,.25,1)';
    reel.style.transform = 'translateY(' + (-i * rowH) + 'px)';

    setActiveIcon(i % words.length);

    if (i === words.length) {
      setTimeout(function () {
        reel.style.transition = 'none';
        i = 0;
        reel.style.transform = 'translateY(0px)';
      }, 720);
    }
  }

  function run() {
    rowH = getRowH();
    fitWidth();
    setActiveIcon(0);
    setInterval(step, 1700);
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    var target = document.querySelector('.service-hero-animation') ||
                 document.getElementById('slot');
    obs.observe(target);
  } else { run(); }
})();
