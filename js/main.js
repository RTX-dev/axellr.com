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
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  /* ---------- Motion réduite : états finaux, pas d'animation ---------- */
  if (prefersReduced) {
    gsap.set(".tl-line", { scaleY: 1 });
    return;
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

  /* ---------- Intro hero ---------- */
  var heroMasks = ".hero .mask-inner";
  gsap.set(heroMasks, { yPercent: 110 });

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

  heroIntro();

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

})();
