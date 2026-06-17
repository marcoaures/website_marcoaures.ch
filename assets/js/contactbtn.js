document.addEventListener("DOMContentLoaded", function () {
  const contactBtns = document.querySelectorAll('button[id^="contactMailBtn"]');
  contactBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.location.href = "mailto:hoi@marcoaures.ch";
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "mailto_open" });
    });
  });
});
