function checkAndSetMandatoryFields(e) {
    let t = !0;
    switch (e) {
    case "trackquest-step2-analyse":
        Array.from(document.querySelectorAll('input[name="trackquest-studie"]')).some(e => e.checked) || (t = !1);
        break;
    case "trackquest-step3-tools":
        if (Array.from(document.querySelectorAll('input[name="trackquest-tools"]')).some(e => e.checked) || (t = !1),
        document.getElementById("trackquest-tools-other").checked) {
            let c = document.getElementById("toolnames");
            c.required = !0,
            c.value.trim() || (t = !1)
        }
        break;
    case "trackquest-step4-orgarchit":
        ["trackquest-goals", "trackquest-supaction", "trackquest-b2"].forEach(e => {
            Array.from(document.querySelectorAll(`input[name="${e}"]`)).some(e => e.checked) || (t = !1)
        }
        );
        break;
    case "trackquest-step5-actions":
        Array.from(document.querySelectorAll('input[name="trackquest-interaction"]')).some(e => e.checked) || (t = !1),
        (document.getElementById("trackquest-interaction-contactform").checked || document.getElementById("trackquest-interaction-inquiryform").checked) && (Array.from(document.querySelectorAll('input[name="trackquest-formul"]')).some(e => e.checked) || (t = !1));
        break;
    case "trackquest-step6-existtrack":
        Array.from(document.querySelectorAll('input[name="trackquest-existtrack"]')).some(e => e.checked) || (t = !1);
        break;
    case "trackquest-step7-final":
        if (["trackquest-visitors", "trackquest-check", "trackquest-reportings"].forEach(e => {
            Array.from(document.querySelectorAll(`input[name="${e}"]`)).some(e => e.checked) || (t = !1)
        }
        ),
        document.getElementById("trackquest-aquisition").checked) {
            let n = document.getElementById("aquisition-preference-mail").checked
              , a = document.getElementById("aquisition-preference-tel").checked;
            n || a ? (n && !(document.getElementById("email")?.value ?? "").trim() && (t = !1),
            a && !(document.getElementById("telNo")?.value ?? "").trim() && (t = !1)) : t = !1,
            document.getElementById("aquisition-consent").checked || (t = !1)
        }
    }
    return t
}
function showAndScrollTo(e) {
    document.querySelectorAll(".step").forEach(e => e.style.display = "none");
    let t = document.getElementById(e);
    t && (t.style.display = "block"),
    requestAnimationFrame( () => {
        let e = document.querySelector(".questionnaire").getBoundingClientRect().top + window.pageYOffset
          , t = document.querySelector("header") ? document.querySelector("header").offsetHeight : 0;
        window.scrollTo({
            top: e - t - 10,
            behavior: "smooth"
        })
    }
    )
}
function toggleTooltip(e) {
    let t = e.currentTarget.nextElementSibling
      , c = t.hasAttribute("hidden");
    document.querySelectorAll(".tooltip-text").forEach(e => e.setAttribute("hidden", "")),
    c ? t.removeAttribute("hidden") : t.setAttribute("hidden", "")
}
function handleKeyDown(e) {
    ("Enter" === e.key || " " === e.key) && (e.preventDefault(),
    toggleTooltip(e))
}
function collectStepData(stepId) {
  const stepEl = document.getElementById(stepId);
  const data = {};
  if (!stepEl) return data;

  stepEl
    .querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked')
    .forEach((input) => {
      const name = input.name;
      const value = input.value;
      if (!name) return;

      if (!data[name]) data[name] = [];
      data[name].push(value);
    });

  if (stepId === "trackquest-step3-tools") {
    const otherChecked = document.getElementById("trackquest-tools-other")?.checked;
    if (otherChecked) {
      const otherText = document.getElementById("toolnames")?.value?.trim();
      if (otherText) {
        data.otherToolsText = otherText;
      }
    }
  }

  return Object.entries(data)
    .map(([key, value]) => `${key.replace("trackquest-", "")}=${Array.isArray(value) ? value.join("&") : value}`)
    .join("|");
}
function isUserConsentGiven() {
    return document.getElementById("trackquest-studie-ja").checked
}
document.addEventListener("DOMContentLoaded", function() { document.querySelector(".questionnaire").addEventListener("click", function(e) {
    if (!e.target.classList.contains("trackquest-nav-button"))
        return;
    let t = e.target.getAttribute("data-target-step")
      , c = e.target.closest(".step").id
      , n = ["trackquest-step1-intro", "trackquest-step2-analyse", "trackquest-step3-tools", "trackquest-step4-orgarchit", "trackquest-step5-actions", "trackquest-step6-existtrack", "trackquest-step7-final", "trackquest-step8-results"]
      , a = n.indexOf(c);
    if (n.indexOf(t) < a) {
        showAndScrollTo(t);
        return
    }
    if (!checkAndSetMandatoryFields(c)) {
        alert("Bitte f\xfclle alle erforderlichen Felder aus, bevor du weiterklickst.");
        return
    }
    showAndScrollTo(t)
})
}),
document.addEventListener("DOMContentLoaded", function() {
    var e = document.getElementById("trackquest-tools-other")
      , t = document.getElementById("other-tools");
    e.addEventListener("change", function() {
        e.checked ? t.style.display = "block" : t.style.display = "none"
    })
}),
document.addEventListener("DOMContentLoaded", function() {
    var e = document.querySelectorAll('input[name="trackquest-reportings"]')
      , t = document.getElementById("reporting-conditional")
      , c = function() {
        var e = document.getElementById("trackquest-reportings-occasional").checked || document.getElementById("trackquest-reportings-regularly").checked;
        t.style.display = e ? "block" : "none"
    };
    e.forEach(function(e) {
        e.addEventListener("change", c)
    }),
    c()
}),
document.addEventListener("DOMContentLoaded", function() {
    var e = document.querySelectorAll('input[name="trackquest-interaction"]')
      , t = document.getElementById("forms-additional")
      , c = function() {
        var e = document.getElementById("trackquest-interaction-contactform").checked || document.getElementById("trackquest-interaction-inquiryform").checked;
        t.style.display = e ? "block" : "none"
    };
    e.forEach(function(e) {
        e.addEventListener("change", c)
    }),
    c()
}),
document.addEventListener("DOMContentLoaded", function() {
    var e = document.getElementById("trackquest-aquisition")
      , t = document.getElementById("aquisition-contactinfo");
    e.addEventListener("change", function() {
        e.checked ? t.style.display = "block" : t.style.display = "none"
    })
}),
document.addEventListener("DOMContentLoaded", function() {
    let e = {
        "trackquest-interaction-mailtotel": ["conditional-mailtotel"],
        "trackquest-interaction-newsletter": ["conditional-newsletter"],
        "trackquest-interaction-contactform": ["conditional-contactform"],
        "trackquest-interaction-inquiryform": ["conditional-inquiryform"],
        "trackquest-formul-withsteps": ["conditional-formabandonment"],
        "trackquest-interaction-feedbackform": ["conditional-feedbackform"],
        "trackquest-interaction-booking": ["conditional-booking"],
        "trackquest-interaction-ecom": ["conditional-ecom"],
        "trackquest-interaction-downloads": ["conditional-downloads"],
        "trackquest-interaction-SoMe": ["conditional-SoMe"],
        "trackquest-interaction-search": ["conditional-search"],
        "trackquest-interaction-members": ["conditional-members"],
        "trackquest-interaction-media": ["conditional-media"],
        "trackquest-interaction-ctas": ["conditional-ctas"]
    };
    function t() {
        Object.keys(e).forEach(t => {
            let c = document.getElementById(t)
              , n = c && c.checked;
            e[t].forEach(e => {
                let t = document.getElementById(e);
                t && (t.style.display = n ? "block" : "none")
            }
            )
        }
        )
    }
    document.querySelectorAll('input[name="trackquest-interaction"], input[name="trackquest-formul"]').forEach(e => {
        e.addEventListener("change", t)
    }
    )
}),
document.addEventListener("DOMContentLoaded", function() {
    let e = document.querySelector(".questionnaire");
    e && e.addEventListener("click", function(e) {
        if (e.target && e.target.classList.contains("trackquest-nav-button")) {
            if (isUserConsentGiven()) {
                let t = e.target.closest(".step");
                if (t) {
                    let c = t.id
                      , n = {
                        event: "formSubmission",
                        formType: "Tracking-Questionnaire",
                        stepId: c,
                        data: collectStepData(c)
                    };
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push(function() {
						this.set('data', null);
					});
					window.dataLayer.push(n);
                }
            } else
                console.log()
        }
    })
}),
document.addEventListener("DOMContentLoaded", function() {
    function e() {
        let e = document.getElementById("trackquest-tools-analytics").checked
          , t = document.getElementById("trackquest-tools-gsc").checked
          , c = document.getElementById("trackquest-tools-gtm").checked
          , n = document.getElementById("trackquest-tools-wmt").checked
          , a = document.getElementById("trackquest-b2-c").checked
          , s = document.getElementById("trackquest-b2-b").checked
          , r = e && t && c && n
          , o = e && t && c && a;
        document.getElementById("tools-congrats").style.display = r || o ? "block" : "none",
        document.getElementById("bwmt-option").style.display = o ? "block" : "none",
        document.getElementById("tools-improv").style.display = r || o ? "none" : "block",
        document.getElementById("ga4miss").style.display = e ? "none" : "block",
        document.getElementById("gscmiss").style.display = t ? "none" : "block",
        document.getElementById("gtmmiss").style.display = c ? "none" : "block",
        document.getElementById("bwtmiss").style.display = !n && s ? "block" : "none"
    }
    document.querySelectorAll("#trackquest-step3-tools input, #trackquest-step4-orgarchit input").forEach(t => {
        t.addEventListener("change", e)
    }
    ),
    e()
}),
document.addEventListener("DOMContentLoaded", function() {
    function e() {
        let e = document.getElementById("trackquest-visitors-verylow").checked
          , t = document.getElementById("trackquest-visitors-low").checked
          , c = document.getElementById("trackquest-visitors-med").checked
          , n = document.getElementById("trackquest-visitors-high").checked
          , a = document.getElementById("trackquest-visitors-veryhigh").checked
          , s = document.getElementById("trackquest-goals-y").checked
          , r = document.getElementById("trackquest-supaction-y").checked
          , o = document.getElementById("trackquest-check-none").checked
          , i = document.getElementById("trackquest-check-year").checked
          , l = document.getElementById("trackquest-check-quarter").checked
          , d = document.getElementById("trackquest-check-month").checked
          , k = document.getElementById("trackquest-check-week").checked
          , u = document.getElementById("trackquest-check-day").checked
          , y = document.getElementById("trackquest-interaction-mailtotel").checked
          , m = document.getElementById("trackquest-interaction-newsletter").checked
          , q = document.getElementById("trackquest-interaction-contactform").checked
          , g = document.getElementById("trackquest-interaction-inquiryform").checked
          , h = document.getElementById("trackquest-formul-withsteps").checked
          , E = document.getElementById("trackquest-interaction-feedbackform").checked
          , p = document.getElementById("trackquest-interaction-booking").checked
          , f = document.getElementById("trackquest-interaction-ecom").checked
          , B = document.getElementById("trackquest-interaction-downloads").checked
          , I = document.getElementById("trackquest-interaction-SoMe").checked
          , b = document.getElementById("trackquest-interaction-search").checked
          , v = document.getElementById("trackquest-interaction-members").checked
          , x = document.getElementById("trackquest-interaction-media").checked
          , w = document.getElementById("trackquest-interaction-ctas").checked
          , S = document.getElementById("trackquest-existtrack-mailtotel").checked
          , L = document.getElementById("trackquest-existtrack-newsletter").checked
          , A = document.getElementById("trackquest-existtrack-newsletter-abm").checked
          , M = document.getElementById("trackquest-existtrack-newsletter-ctr").checked
          , _ = document.getElementById("trackquest-existtrack-contactform").checked
          , O = document.getElementById("trackquest-existtrack-inquiryform").checked
          , D = document.getElementById("trackquest-existtrack-feedbackform").checked
          , C = document.getElementById("trackquest-existtrack-formabandonment").checked
          , T = document.getElementById("trackquest-existtrack-booking").checked
          , F = document.getElementById("trackquest-existtrack-ecom-wk").checked
          , $ = document.getElementById("trackquest-existtrack-ecom-co").checked
          , G = document.getElementById("trackquest-existtrack-ecom-sa").checked
          , U = document.getElementById("trackquest-existtrack-downloads").checked
          , j = document.getElementById("trackquest-existtrack-SoMe").checked
          , H = document.getElementById("trackquest-existtrack-search").checked
          , K = document.getElementById("trackquest-existtrack-members").checked
          , N = document.getElementById("trackquest-existtrack-media").checked
          , Q = document.getElementById("trackquest-existtrack-ctas").checked
          , R = document.getElementById("aquisition-consent").checked
          , Y = e && !s && !r
          , z = e && !s && r
          , J = e && s
          , P = t && !s && !r
          , V = t && !s && r
          , W = c && !s && !r
          , X = t && s
          , Z = c && !s && r
          , ee = n && !s && !r
          , et = a
          , ec = n && r
          , en = c && s
          , ea = y && !S
          , es = m && !L
          , er = m && !A
          , eo = m && !M
          , ei = q && !_
          , el = g && !O
          , ed = h && !C
          , ek = E && !D
          , eu = p && !T
          , ey = f && !F
          , em = f && !$
          , eq = f && !G
          , eg = B && !U
          , eh = I && !j
          , eE = b && !H
          , ep = v && !K
          , ef = x && !N
          , eB = w && !Q;
        document.getElementById("monirec-rarely").style.display = Y ? "block" : "none",
        document.getElementById("monirec-quarterly").style.display = z || P ? "block" : "none",
        document.getElementById("monirec-monthly").style.display = J || V || W ? "block" : "none",
        document.getElementById("monirec-weekly").style.display = X || Z || ee ? "block" : "none",
        document.getElementById("monirec-daily").style.display = et || ec || en ? "block" : "none",
        document.getElementById("monirec-notenough").style.display = Y && o || z && (o || i) || P && (o || i) || J && (o || i || l) || V && (o || i || l) || W && (o || i || l) || X && (o || i || l || d) || Z && (o || i || l || d) || ee && (o || i || l || d) || et && (o || i || l || d || k) || ec && (o || i || l || d || k) || en && (o || i || l || d || k) ? "block" : "none",
        document.getElementById("monirec-alreadyenough").style.display = Y && (i || l || d || k || u) || z && (l || d || k || u) || P && (l || d || k || u) || J && (d || k || u) || V && (d || k || u) || W && (d || k || u) || X && (k || u) || Z && (k || u) || ee && (k || u) || et && u || ec && u || en && u ? "block" : "none",
        document.getElementById("reporec-sporadic").style.display = Y || z || P ? "block" : "none",
        document.getElementById("reporec-yearly").style.display = J || V || W ? "block" : "none",
        document.getElementById("reporec-quarterly").style.display = X || Z || ee ? "block" : "none",
        document.getElementById("reporec-monthly").style.display = et || ec || en ? "block" : "none",
        document.getElementById("missing-mailtotel").style.display = ea ? "block" : "none",
        document.getElementById("missing-newsletterleads").style.display = es ? "block" : "none",
        document.getElementById("missing-newslettercancel").style.display = er ? "block" : "none",
        document.getElementById("missing-newsletterctr").style.display = eo ? "block" : "none",
        document.getElementById("missing-contactform").style.display = ei ? "block" : "none",
        document.getElementById("missing-inquiryform").style.display = el ? "block" : "none",
        document.getElementById("missing-feedbackform").style.display = ek ? "block" : "none",
        document.getElementById("missing-formabandonment").style.display = ed ? "block" : "none",
        document.getElementById("missing-bookings").style.display = eu ? "block" : "none",
        document.getElementById("missing-cartadd").style.display = ey ? "block" : "none",
        document.getElementById("missing-checkout").style.display = em ? "block" : "none",
        document.getElementById("missing-cartabandonment").style.display = eq ? "block" : "none",
        document.getElementById("missing-downloads").style.display = eg ? "block" : "none",
        document.getElementById("missing-SoMe").style.display = eh ? "block" : "none",
        document.getElementById("missing-search").style.display = eE ? "block" : "none",
        document.getElementById("missing-register").style.display = ep ? "block" : "none",
        document.getElementById("missing-media").style.display = ef ? "block" : "none",
        document.getElementById("missing-ctas").style.display = eB ? "block" : "none",
        document.getElementById("has-conversions").style.display = s ? "block" : "none",
        document.getElementById("has-via").style.display = r ? "block" : "none",
        document.getElementById("alleventstracked").style.display = ea || es || er || eo || ei || el || ed || ek || eu || ey || em || eq || eg || eh || eE || ep || ef || eB ? "none" : "block",
        document.getElementById("contact-confirm").style.display = R ? "block" : "none"
    }
    ["trackquest-visitors-verylow", "trackquest-visitors-low", "trackquest-visitors-med", "trackquest-visitors-high", "trackquest-visitors-veryhigh", "trackquest-goals-y", "trackquest-supaction-y", "trackquest-check-none", "trackquest-check-year", "trackquest-check-quarter", "trackquest-check-month", "trackquest-check-week", "trackquest-check-day", "trackquest-interaction-mailtotel", "trackquest-existtrack-mailtotel", "trackquest-interaction-mailtotel", "trackquest-interaction-newsletter", "trackquest-interaction-contactform", "trackquest-interaction-inquiryform", "trackquest-formul-withsteps", "trackquest-interaction-feedbackform", "trackquest-interaction-booking", "trackquest-interaction-ecom", "trackquest-interaction-downloads", "trackquest-interaction-SoMe", "trackquest-interaction-search", "trackquest-interaction-members", "trackquest-interaction-media", "trackquest-interaction-ctas", "trackquest-existtrack-mailtotel", "trackquest-existtrack-newsletter", "trackquest-existtrack-newsletter-abm", "trackquest-existtrack-newsletter-ctr", "trackquest-existtrack-contactform", "trackquest-existtrack-inquiryform", "trackquest-existtrack-feedbackform", "trackquest-existtrack-formabandonment", "trackquest-existtrack-booking", "trackquest-existtrack-ecom-wk", "trackquest-existtrack-ecom-co", "trackquest-existtrack-ecom-sa", "trackquest-existtrack-downloads", "trackquest-existtrack-SoMe", "trackquest-existtrack-search", "trackquest-existtrack-members", "trackquest-existtrack-media", "trackquest-existtrack-ctas", "aquisition-consent"].forEach(t => {
        let c = document.getElementById(t);
        c && c.addEventListener("change", e)
    }
    ),
    e()
});