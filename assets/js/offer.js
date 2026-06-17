document.addEventListener('DOMContentLoaded', () => {
  const textCarousel        = document.querySelector('#textCarousel');
  const slidesContainer     = textCarousel?.querySelector('.slides');
  const slides              = textCarousel ? textCarousel.querySelectorAll('.slides li') : [];
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  const totalSlides         = slides.length;

  if (!textCarousel || !slidesContainer || !totalSlides || !indicatorsContainer) {
    return;
  }

  let currentSlide = 0;
  let slideInterval = setInterval(updateCarousel, 8000);
  let touchstartX = 0;
  let touchendX = 0;

  function handleTouchStart(e) {
    touchstartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e) {
    touchendX = e.changedTouches[0].screenX;
    if (touchendX < touchstartX) {
      updateCarousel();
    } else if (touchendX > touchstartX) {
      currentSlide = (currentSlide - 2 + totalSlides) % totalSlides;
      updateCarousel();
    }
    resetInterval();
  }

  function updateCarousel() {
    const offset = -100 * currentSlide;
    slidesContainer.style.transform = `translateX(${offset}%)`;
    updateIndicators();
    currentSlide = (currentSlide + 1) % totalSlides;
  }

  function updateIndicators() {
    document.querySelectorAll('.carousel-indicators span').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function createIndicators() {
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('span');
      dot.addEventListener('click', () => {
        currentSlide = i;
        updateCarousel();
        resetInterval();
      });
      indicatorsContainer.appendChild(dot);
    }
    updateIndicators();
  }

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(updateCarousel, 8000);
  }

  window.addEventListener('resize', resetInterval);
  slidesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
  slidesContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

  createIndicators();
  updateCarousel();
});
