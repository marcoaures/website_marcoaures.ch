(function () {
  var roadmapItems = document.querySelectorAll('.roadmap-item');
  if (!roadmapItems.length) return;

  var roadmapObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          roadmapObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.35,
      rootMargin: '0px 0px -80px 0px'
    }
  );

  roadmapItems.forEach(function (item) {
    roadmapObserver.observe(item);
  });
})();
