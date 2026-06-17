(function () {
  var wrap = document.getElementById('relatedGrid');
  var btn = document.getElementById('relatedShowMore');
  if (!wrap || !btn) return;

  btn.addEventListener('click', function () {
    wrap.classList.remove('is-collapsed');
    document.getElementById('relatedMoreWrap').style.display = 'none';
  });
})();
