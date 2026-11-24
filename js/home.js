/* ===== Homepage script =====
 * Clicking a star in Container 1 shows that character in Container 2.
 * Only the character image and description fade (out 0.5s -> swap -> in 0.5s);
 * the rest of Container 2 stays still.
 */

(function () {
  "use strict";

  const FADE_MS = 500; // keep in sync with .fade transition in css/home.css
  const DEFAULT_CHARACTER = "warrior";

  const imgEl = document.getElementById("character-img");
  const descEl = document.getElementById("character-desc");
  const portraitEl = document.getElementById("portrait");
  const charactersSection = document.getElementById("characters");
  const stars = document.querySelectorAll(".star");

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
    imgEl.classList.add("is-hidden");
    descEl.classList.add("is-hidden");
    await wait(FADE_MS);
    await waitForImage(preload);
    if (myId !== requestId) return; // a newer click took over

    // 2. Swap content
    applyCharacter(key);
    await waitForImage(imgEl);
    if (myId !== requestId) return;

    // 3. Fade in
    imgEl.classList.remove("is-hidden");
    descEl.classList.remove("is-hidden");
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      showCharacter(star.dataset.character);
      charactersSection.scrollIntoView({ behavior: "smooth" });
    });
  });

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
