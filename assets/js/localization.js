(function () {
  function ensureTrailingSlash(path) {
    if (path === '' || path === '/') return '/';

    return path.endsWith('/') ? path : path + '/';
  }

  function switchToDE() {
    const { pathname, search, hash } = window.location;

    let newPath = pathname.replace(/^\/en(\/|$)/, '/');

    newPath = ensureTrailingSlash(newPath);

    window.location.href = newPath + search + hash;
  }

  function switchToEN() {
    const { pathname, search, hash } = window.location;

    if (/^\/en(\/|$)/.test(pathname)) {
      return;
    }

    let newPath;

    if (pathname === '/' || pathname === '') {
      newPath = '/en/';
    } else {
      newPath = '/en' + pathname;
    }

    newPath = ensureTrailingSlash(newPath);

    window.location.href = newPath + search + hash;
  }

  function initLanguageSwitcher() {
    const langDE = document.getElementById('langDE');
    const langEN = document.getElementById('langEN');

    if (langDE) langDE.addEventListener('click', (e) => {
      e.preventDefault();
      switchToDE();
    });

    if (langEN) langEN.addEventListener('click', (e) => {
      e.preventDefault();
      switchToEN();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
  } else {
    initLanguageSwitcher();
  }
})();
