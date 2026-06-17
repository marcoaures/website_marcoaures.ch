function closePopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.style.display = "none";
  }
}

const popupCloseBtn = document.getElementById("popupCloseBtn");
const popupElement  = document.getElementById("popup");

if (popupCloseBtn && popupElement) {
  popupCloseBtn.addEventListener("click", closePopup);

  document.querySelectorAll(".portrait-thumbnail").forEach(thumb => {
    thumb.addEventListener("click", e => {
      popupElement.style.display = "flex";
      const popupImg = document.getElementById("popup-img");
      if (popupImg) {
        popupImg.src = e.target.src;
      }
    });
  });

  window.addEventListener("click", e => {
    if (e.target === popupElement) {
      popupElement.style.display = "none";
    }
  });
}
