document.addEventListener("DOMContentLoaded", function () {
  const scrollBtn = document.getElementById("scrollToContentBtn");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", scrollToContent);
  }
});

function scrollToContent() {
  const start = document.getElementById("start");
  if (!start) return;

  const o = start.getBoundingClientRect().top + window.pageYOffset;
  let offset;

  if (window.innerWidth < 769) {
    offset = o + 20;
  } else {
    offset = o - 75;
  }

  window.scrollTo({
    top: offset,
    behavior: "smooth"
  });
}
