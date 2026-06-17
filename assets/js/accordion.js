(function () {
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.accordion-header');
    if (!btn) return;

    var open = btn.getAttribute('aria-expanded') === 'true';
    var accordion = btn.closest('.accordion');

    accordion.querySelectorAll('.accordion-header').forEach(function (other) {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.classList.remove('is-open');
      }
    });

    btn.setAttribute('aria-expanded', String(!open));
    btn.nextElementSibling.classList.toggle('is-open', !open);
  });
})();
