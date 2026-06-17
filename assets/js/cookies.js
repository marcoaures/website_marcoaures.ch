function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 864e5);
        expires = "; expires=" + date.toUTCString();
    }
    var secure = location.protocol === "https:" ? "; Secure; SameSite=Lax" : "";
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/" + secure;
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function () {
    var blurTimer = null;
    var blurCheckTimer = null;

    const blur = document.getElementById("cookieBlur");
    if (blur) {
        blur.addEventListener("click", e => {
            e.stopPropagation();
        });
        blur.addEventListener("pointerdown", e => {
            e.stopPropagation();
        });
    }

    let savedScrollY = 0;
    let scrollLocked = false;

    function lockScroll() {
        if (scrollLocked) return;
        scrollLocked = true;

        savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;

        document.body.style.position = "fixed";
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
    }

    function unlockScroll() {
        if (!scrollLocked) return;
        scrollLocked = false;

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";

        window.scrollTo(0, savedScrollY);
    }

    function isBannerVisible() {
        var banner = document.getElementById("cookieConsentBanner");
        if (!banner) return false;

        var style = window.getComputedStyle(banner);

        if (style.display === "none") return false;
        if (style.visibility === "hidden") return false;
        if (parseFloat(style.opacity) === 0) return false;
        if (banner.getClientRects().length === 0) return false;

        return true;
    }

    function showWindMessage() {
        var oldMessage = document.getElementById("braveWindMessage");
        if (oldMessage) oldMessage.remove();

        var message = document.createElement("div");
        message.id = "braveWindMessage";
        message.textContent = "Mh! Must've been the wind...\n --- \nBrave or whatever you're using TRIED to hide the cookie banner... \nBut did it sloppily. Fixed it and killed the consent banner for you. \nThe website probably will briefly blur on every new page load. \nSorry about that! Message will disappear shortly\n --- \nMarco";

        message.style.position = "fixed";
		message.style.left = "2rem";
		message.style.right = "2rem";
		message.style.top = "2rem";
        message.style.zIndex = "999999";
        message.style.color = "#7a0e0e";
        message.style.fontSize = "1rem";
        message.style.fontWeight = "400";
        message.style.textAlign = "left";
        message.style.pointerEvents = "none";
        message.style.opacity = "0";
        message.style.transition = "opacity 150ms ease";

        message.style.background = "#fff";
        message.style.padding = "0.75rem 1rem";
        message.style.borderRadius = "10px";
        message.style.boxShadow = "0 4px 18px rgba(0, 0, 0, 0.12)";
        message.style.whiteSpace = "pre-line";
		message.style.width = "fit-content";
		message.style.maxWidth = "calc(100vw - 2rem)";
		
        document.body.appendChild(message);

        requestAnimationFrame(() => {
            message.style.opacity = "1";
        });

        setTimeout(() => {
            message.style.opacity = "0";
        }, 18000);

        setTimeout(() => {
            if (message && message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 18500);
    }

    function killBlurIfBannerMissing() {
        if (!isBannerVisible()) {
            var blur = document.getElementById("cookieBlur");

            if (!sessionStorage.getItem("braveWindMessageShown")) {
                showWindMessage();
                sessionStorage.setItem("braveWindMessageShown", "true");
            }

            if (blur) {
                blur.style.opacity = 0;
                blur.style.display = "none";
            }

            unlockScroll();

            if (blurCheckTimer) {
                clearTimeout(blurCheckTimer);
                blurCheckTimer = null;
            }
        }
    }

    function showBlur() {
        var blur = document.getElementById("cookieBlur");
        var banner = document.getElementById("cookieConsentBanner");
        if (!blur) return;

        blur.style.opacity = 0;
        blur.style.display = "block";
        setTimeout(() => { blur.style.opacity = 1; }, 10);

        if (banner && banner.getClientRects().length > 0) lockScroll();

        if (blurCheckTimer) clearTimeout(blurCheckTimer);
        blurCheckTimer = setTimeout(() => {
            killBlurIfBannerMissing();
        }, 500);
    }

    function hideBlur() {
        var blur = document.getElementById("cookieBlur");
        if (!blur) return;

        if (blurCheckTimer) {
            clearTimeout(blurCheckTimer);
            blurCheckTimer = null;
        }

        blur.style.opacity = 0;
        setTimeout(() => { blur.style.display = "none"; }, 400);
    }

    function showBannerWithFade() {
        var banner = document.getElementById("cookieConsentBanner");
        if (!banner) return;

        var icon = document.getElementById("cookieIcon");
        if (icon && !icon.src) icon.src = "/assets/img/cookies.svg";

        if (blurTimer) clearTimeout(blurTimer);
        if (blurCheckTimer) clearTimeout(blurCheckTimer);

        hideBlur();

        banner.style.opacity = 0;
        banner.style.display = "flex";
        setTimeout(() => { banner.style.opacity = 1; }, 100);

        blurTimer = setTimeout(() => { showBlur(); }, 1000);
    }

    function hideBanner() {
        var banner = document.getElementById("cookieConsentBanner");
        if (blurTimer) clearTimeout(blurTimer);
        if (blurCheckTimer) clearTimeout(blurCheckTimer);

        hideBlur();
        unlockScroll();

        if (banner) banner.style.display = "none";
    }

    setTimeout(() => {
        var e = getCookie("userConsent");
        if (e !== "true" && e !== "false") showBannerWithFade();
    }, 3000);

    var acceptBtn = document.getElementById("acceptCookies");
    if (acceptBtn) {
        acceptBtn.onclick = function () {
            setCookie("userConsent", "true", 365);
            gtag("consent", "update", {
                ad_storage: "granted",
                analytics_storage: "granted",
                ad_user_data: "granted",
                ad_personalization: "granted",
                functionality_storage: "granted",
                personalization_storage: "granted",
                security_storage: "granted"
            });
            hideBanner();
            dataLayer.push({ event: "consent_granted" });
        };
    }

    var declineBtn = document.getElementById("declineCookies");
    if (declineBtn) {
        declineBtn.onclick = function () {
            setCookie("userConsent", "false", 30);
            gtag("consent", "update", {
                ad_storage: "denied",
                analytics_storage: "denied",
                ad_user_data: "denied",
                ad_personalization: "denied",
                functionality_storage: "granted",
                personalization_storage: "denied",
                security_storage: "granted"
            });
            hideBanner();
        };

        declineBtn.addEventListener("mouseover", function () {
            var icon = document.getElementById("cookieIcon");
            if (icon) icon.src = "/assets/img/nocookies.svg";
        });

        declineBtn.addEventListener("mouseout", function () {
            var icon = document.getElementById("cookieIcon");
            if (icon) icon.src = "/assets/img/cookies.svg";
        });
    }

    var closeBtn = document.getElementById("closeBanner");
    if (closeBtn) {
        closeBtn.onclick = function () {
            setCookie("userConsent", "false", 1);
            gtag("consent", "update", {
                ad_storage: "denied",
                analytics_storage: "denied",
                ad_user_data: "denied",
                ad_personalization: "denied",
                functionality_storage: "granted",
                personalization_storage: "denied",
                security_storage: "granted"
            });
            hideBanner();
        };
    }

    var changeConsent = document.getElementById("changeConsent");
    if (changeConsent) {
        changeConsent.onclick = function (e) {
            e.preventDefault();
            showBannerWithFade();
        };
    }
});