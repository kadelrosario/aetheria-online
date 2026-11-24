/* ===== Homepage arrival animation =====
 * Loaded in <head> so it runs before the page is drawn.
 * If the visitor came from the landing page's "Official Website" button
 * (js/landing.js sets the flag), add the "arriving" class, which plays
 * the light-flash fade-out and hero zoom defined in css/home.css.
 */

(function () {
  "use strict";

  let fromLanding = false;
  try {
    fromLanding = sessionStorage.getItem("aetheria-transition") === "1";
    sessionStorage.removeItem("aetheria-transition"); // only play once
  } catch (err) {
    /* storage blocked: skip the effect */
  }

  if (!fromLanding) return;

  const root = document.documentElement;
  root.classList.add("arriving");

  // Clean up once the animation is over (keep in sync with css/home.css)
  setTimeout(() => root.classList.remove("arriving"), 1600);
})();
