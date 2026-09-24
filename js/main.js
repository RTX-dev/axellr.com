/* ============================================================
   AXEL LEROY — PORTFOLIO 2026
   Animations : GSAP + ScrollTrigger
   ============================================================ */

(function () {
  "use strict";

  /* Certains navigateurs restaurent le scroll une fois la page
     completement chargee : on reforce le haut de page a ce moment.
     (le retour initial au chargement est géré dans common.js) */
  function goTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  window.addEventListener("load", goTop);

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  var preloader = document.getElementById("preloader");
  var body = document.body;

  /* Remplit directement les compteurs (sans animation) */
  function fillCounters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = el.getAttribute("data-count");
    });
  }

  /* ---------- Arborescence compétences : plier / déplier ---------- */
  document.querySelectorAll(".tree-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var folder = btn.closest(".tree-folder");
      var open = folder.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Fallback sans GSAP (CDN indisponible) ---------- */
  if (!hasGsap) {
    if (preloader) preloader.remove();
    body.classList.remove("loading");
    fillCounters();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  /* ---------- Motion réduite : états finaux, pas d'animation ---------- */
  if (prefersReduced) {
    if (preloader) preloader.remove();
    body.classList.remove("loading");
    fillCounters();
    gsap.set(".tl-line", { scaleY: 1 });
    return;
  }

  /* ---------- Curseur personnalisé ---------- */
  if (window.matchMedia("(pointer: fine)").matches) {
    var dot = document.getElementById("cursorDot");
    var ring = document.getElementById("cursorRing");

    var ringX = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
    var ringY = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

    window.addEventListener("mousemove", function (e) {
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      ringX(e.clientX);
      ringY(e.clientY);
    });

    document.querySelectorAll("a, button, [data-hover]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        gsap.to(ring, { scale: 1.8, opacity: 0.4, duration: 0.25, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.25, ease: "power3.out" });
      });
    });
  }

  /* ---------- Boutons magnétiques ---------- */
  document.querySelectorAll(".magnetic").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * 0.35,
        y: (e.clientY - r.top - r.height / 2) * 0.35,
        duration: 0.5
      });
    });
    el.addEventListener("mouseleave", function () {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });

  /* ---------- Preloader + intro hero ---------- */
  var heroMasks = ".hero .mask-inner";
  gsap.set(heroMasks, { yPercent: 110 });
  gsap.set(".pl-letter", { yPercent: 120 });

  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(heroMasks, { yPercent: 0, duration: 1.3, stagger: 0.12 })
      .from(".hero-topline .mono-label", { y: -24, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.9")
      .from(".hero-desc", { y: 30, opacity: 0, duration: 0.9 }, "-=0.7")
      .from(".hero-ctas .btn", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.7")
      .from(".hero-scroll", { opacity: 0, duration: 0.8 }, "-=0.5")
      .from(".hero-star", {
        scale: 0,
        rotation: -90,
        duration: 1.2,
        ease: "back.out(1.6)"
      }, "-=1.1");
  }

  var count = { n: 0 };
  var plCount = document.getElementById("plCount");

  var plTl = gsap.timeline();
  plTl
    .to(".pl-letter", { yPercent: 0, duration: 0.7, stagger: 0.05 }, 0.2)
    .from(".preloader-sub", { opacity: 0, y: 12, duration: 0.5 }, "-=0.4")
    .to(count, {
      n: 100,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: function () {
        plCount.textContent = Math.round(count.n);
      }
    }, 0.3)
    .to(".pl-letter", { yPercent: -120, duration: 0.55, stagger: 0.035, ease: "power3.in" }, "+=0.2")
    .to(".preloader-sub, .preloader-count", { opacity: 0, duration: 0.3 }, "<")
    .to(preloader, {
      yPercent: -100,
      duration: 0.9,
      ease: "power4.inOut",
      onStart: function () {
        body.classList.remove("loading");
        /* Le scroll redevient possible ici : reforcer le haut de page
           au cas ou le navigateur restaure la position a ce moment */
        goTop();
      },
      onComplete: function () {
        preloader.remove();
        /* La scrollbar apparait quand .loading saute :
           recalcul des positions (pin des projets) avec la largeur finale */
        ScrollTrigger.refresh();
      }
    }, "-=0.25")
    .add(heroIntro, "-=0.55");

  /* ---------- Barre de progression ---------- */
  gsap.to("#progressBar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3
    }
  });

  /* ---------- Révélations au scroll ---------- */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) {
    gsap.from(el, {
      y: 60,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* Titres de sections (masques) */
  gsap.utils.toArray(".section-title .mask-inner").forEach(function (el) {
    gsap.from(el, {
      yPercent: 110,
      duration: 1.1,
      ease: "power4.out",
      scrollTrigger: { trigger: el.closest(".section-head"), start: "top 85%", once: true }
    });
  });

  /* Arborescence compétences : fenêtre + dossiers en cascade */
  var treeTl = gsap.timeline({
    scrollTrigger: { trigger: ".explorer", start: "top 80%", once: true }
  });
  treeTl
    .from(".explorer", { y: 60, opacity: 0, duration: 0.9 })
    .from(".tree-root, .tree-folder", {
      x: -28,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out"
    }, "-=0.55");

  /* Compteurs animés */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
      onUpdate: function () {
        el.textContent = Math.round(obj.v);
      }
    });
  });

  /* Ligne de la timeline qui se dessine */
  gsap.to("#tlLine", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".timeline",
      start: "top 75%",
      end: "bottom 55%",
      scrub: 1
    }
  });

  /* Éléments de la timeline */
  gsap.utils.toArray("[data-tl]").forEach(function (el) {
    gsap.from(el, {
      x: -40,
      opacity: 0,
      duration: 0.9,
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
  });

  /* Projets : lignes qui entrent en cascade */
  gsap.utils.toArray(".p-row").forEach(function (el, i) {
    gsap.from(el, {
      x: -40,
      opacity: 0,
      duration: 0.9,
      delay: (i % 2) * 0.08,
      scrollTrigger: { trigger: el, start: "top 90%", once: true }
    });
  });

  /* Titre contact : révélé ligne par ligne */
  gsap.utils.toArray(".contact-giant .mask-inner").forEach(function (el) {
    gsap.from(el, {
      yPercent: 110,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: { trigger: ".contact-giant", start: "top 82%", once: true }
    });
  });

})();
