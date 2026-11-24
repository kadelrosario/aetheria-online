/* ===== Homepage script =====
 * Desktop: clicking a star in Container 1 shows that character in Container 2.
 * Tablet/phone: the « » arrows (or a swipe) step through the characters, and
 * the current character's glowing star shows under the portrait.
 * Only the character image, description and that star fade
 * (out 0.5s -> swap -> in 0.5s); the rest of Container 2 stays still.
 */

(function () {
  "use strict";

  const FADE_MS = 500; // keep in sync with .fade transition in css/home.css
  const DEFAULT_CHARACTER = "warrior";
  const ORDER = Object.keys(CHARACTERS); // arrow order = order in characters.js

  const imgEl = document.getElementById("character-img");
  const descEl = document.getElementById("character-desc");
  const portraitEl = document.getElementById("portrait");
  const starWrapEl = document.getElementById("character-star-wrap");
  const starEl = document.getElementById("character-star");
  const starImgEl = starEl.querySelector("img");
  const charactersSection = document.getElementById("characters");
  const stars = document.querySelectorAll(".stars .star"); // Container 1 stars only
  const fadeEls = [imgEl, descEl, starWrapEl];

  let current = null;
  let requestId = 0; // guards against fast repeated clicks

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function waitForImage(img) {
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = img.onerror = () => resolve();
    });
  }

  function applyCharacter(key) {
    const c = CHARACTERS[key];
    imgEl.src = c.image;
    imgEl.alt = c.name;
    descEl.textContent = c.description;
    portraitEl.style.setProperty("--frame-color", c.frameColor);
    // tablet/phone star: same image + glow colour as the desktop star
    starImgEl.src = c.star;
    starEl.dataset.character = key;
  }

  function setActiveStar(key) {
    stars.forEach((s) =>
      s.classList.toggle("is-active", s.dataset.character === key)
    );
  }

  async function showCharacter(key) {
    if (!CHARACTERS[key] || key === current) return;
    const myId = ++requestId;
    current = key;
    setActiveStar(key);

    // Preload the next image while fading out
    const preload = new Image();
    preload.src = CHARACTERS[key].image;

    // 1. Fade out
    fadeEls.forEach((el) => el.classList.add("is-hidden"));
    await wait(FADE_MS);
    await waitForImage(preload);
    if (myId !== requestId) return; // a newer click took over

    // 2. Swap content
    applyCharacter(key);
    await waitForImage(imgEl);
    if (myId !== requestId) return;

    // 3. Fade in
    fadeEls.forEach((el) => el.classList.remove("is-hidden"));
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      showCharacter(star.dataset.character);
      charactersSection.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Tablet/phone: « » arrows and swipe ---------- */
  function step(direction) {
    const i = ORDER.indexOf(current);
    const next = ORDER[(i + direction + ORDER.length) % ORDER.length]; // wraps around
    showCharacter(next);
  }

  document.getElementById("char-prev").addEventListener("click", () => step(-1));
  document.getElementById("char-next").addEventListener("click", () => step(1));

  // Swipe left/right on the portrait
  let touchX = null;
  portraitEl.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  portraitEl.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  // Initial character (no animation on page load)
  current = DEFAULT_CHARACTER;
  applyCharacter(DEFAULT_CHARACTER);
  setActiveStar(DEFAULT_CHARACTER);

  // "Discover More" scrolls back up to Container 1
  const heroSection = document.getElementById("home");
  document.getElementById("discover-btn").addEventListener("click", (e) => {
    e.preventDefault();
    heroSection.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Container 3: fade-up map + text when scrolled into view ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ---------- Container 4: Play for Free ---------- */
  document.querySelector(".btn--play").addEventListener("click", (e) => {
    e.preventDefault();
    // TODO: point this to your game client / download page.
  });

  /* ---------- Footer ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("to-top").addEventListener("click", () => {
    heroSection.scrollIntoView({ behavior: "smooth" });
  });
})();
