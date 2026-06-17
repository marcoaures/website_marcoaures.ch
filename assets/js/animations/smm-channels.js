(function () {
  var root = document.getElementById('adflip');
  var cards = Array.prototype.slice.call(root.querySelectorAll('.card'));
  var cur = 0;

  cards[0].classList.add('active');

  function show(next) {
    var outgoing = cards[cur];
    var incoming = cards[next];
    outgoing.classList.remove('active');
    outgoing.classList.add('leaving');
    incoming.classList.add('active');
    setTimeout(function () { outgoing.classList.remove('leaving'); }, 600);
    cur = next;
  }

  function run() {
    var order = [1,2,0];
    var k = 0;
    setInterval(function () {
      show(order[k % order.length]);
      k++;
    }, 2800);
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(run, 900); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    obs.observe(root);
  } else { setTimeout(run, 900); }
})();
