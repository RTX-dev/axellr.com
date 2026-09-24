/* ============================================================
   Code partagé entre les pages :
   retour en haut au chargement, horloge, année, menu mobile
   ============================================================ */

(function () {
  "use strict";

  /* Toujours atterrir en haut de page au chargement (refresh inclus) */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });

  /* ---------- Horloge & année ---------- */
  var clock = document.getElementById("clock");
  var year = document.getElementById("year");

  function tick() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    clock.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);
  year.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById("burger");
  var overlay = document.getElementById("menuOverlay");

  function toggleMenu(force) {
    var open = typeof force === "boolean" ? force : !overlay.classList.contains("open");
    overlay.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  }

  burger.addEventListener("click", function () { toggleMenu(); });
  overlay.querySelectorAll(".menu-link").forEach(function (link) {
    link.addEventListener("click", function () { toggleMenu(false); });
  });

})();
