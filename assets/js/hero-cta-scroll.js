(function () {
  function focusTarget(container) {
    if (!container) return;

    var isTouchLike = window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;

    if (isTouchLike) return;

    var field = container.querySelector(
      '#callback-start input:not([type="hidden"])'
    );

    if (field) {
      setTimeout(function () {
        field.focus({ preventScroll: true });
      }, 400);
    }
  }

  function scrollToCallback(e) {
    var trigger = e.target.closest(
      '.callbackform__hero-tile, [data-scroll-to], [id*="jump-to-callback"]'
    );

    if (!trigger) return;

    var selector = trigger.getAttribute('data-scroll-to') || '#callback';
    var target = document.querySelector(selector);

    if (!target) return;

    e.preventDefault();

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    target.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start'
    });

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'callback_jump' });

    focusTarget(target);
  }

  document.addEventListener('click', scrollToCallback);
})();