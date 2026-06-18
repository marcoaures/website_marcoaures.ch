document.addEventListener("DOMContentLoaded", function () {
    var hamburger = document.querySelector(".hamburger");
    var nav = document.querySelector("nav");
    var header = document.querySelector("header");
    var navLinks = document.querySelectorAll("nav a");
    var navParents = document.querySelectorAll(".nav-parent");
    var mq = window.matchMedia("(max-width: 768px)");

    hamburger.addEventListener("click", function () {
        var expanded = nav.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            nav.classList.remove("open");
            hamburger.setAttribute("aria-expanded", "false");
        });
    });

    navParents.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            if (mq.matches) {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdown(btn.closest(".has-dropdown"));
            }
        });
    });

    document.addEventListener("click", function (e) {
        if (!header.contains(e.target) && nav.classList.contains("open")) {
            nav.classList.remove("open");
            hamburger.setAttribute("aria-expanded", "false");
        }
    });

    function toggleDropdown(li) {
        if (!li) return;
        var expanded = li.classList.toggle("open");
        var control = li.querySelector(":scope > .nav-parent, :scope > a");
        if (control) control.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
});