/* ===== Landing Page script =====
 * 1. Draws a realistic night sky behind the logo: mostly faint stars,
 *    a few bright ones with a soft glow, natural star colours,
 *    gentle twinkling, and the occasional shooting star.
 * 2. "Official Website" plays a hyperspace warp (stars stream toward the
 *    viewer), then opens the Homepage (pages/home.html), which finishes
 *    the effect on arrival (js/page-transition.js).
 */

(function () {
  "use strict";

  const LEAVE_MS = 1600; // keep in sync with the .is-leaving animations in css/landing.css

  /* ---------- Starfield ---------- */
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let warpStart = null; // time the warp began (null = normal twinkling)
  let lastT = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.floor((window.innerWidth * window.innerHeight) / 900);
    stars = Array.from({ length: count }, () => {
      // Real skies have many faint stars and only a few bright ones,
      // so size/brightness follow a steep curve.
      const mag = Math.pow(Math.random(), 5); // 0 = faint ... 1 = brightest
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0.3 + mag * 1.6,
        base: 0.35 + mag * 0.65,
        mag,
        rgb: starColor(),
        // twinkle (atmospheric scintillation): two quick, uneven flickers
        f1: 0.002 + Math.random() * 0.004,
        f2: 0.005 + Math.random() * 0.008,
        p1: Math.random() * Math.PI * 2,
        p2: Math.random() * Math.PI * 2,
      };
    });
  }

  // Star colours by temperature: mostly white, some blue-white,
  // a few warm yellow and the odd orange-red giant.
  function starColor() {
    const n = Math.random();
    if (n < 0.45) return "255, 255, 255";
    if (n < 0.70) return "205, 222, 255";
    if (n < 0.88) return "255, 244, 224";
    if (n < 0.97) return "255, 222, 186";
    return "255, 196, 168";
  }

  /* ---------- Shooting stars ---------- */
  let shooters = [];
  let nextShooterAt = 0;

  function spawnShooter(t) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // fall diagonally down-left or down-right at a random shallow angle
    const goingLeft = Math.random() < 0.65;
    const angle = (goingLeft ? 200 : 340) * (Math.PI / 180) + (Math.random() - 0.5) * 0.35;
    const speed = 900 + Math.random() * 700; // px per second
    shooters.push({
      x: goingLeft ? w * (0.4 + Math.random() * 0.7) : w * (Math.random() * 0.6 - 0.1),
      y: h * Math.random() * 0.45,
      vx: Math.cos(angle) * speed,
      vy: Math.abs(Math.sin(angle) * speed) + 120,
      len: 140 + Math.random() * 160,
      born: t,
      life: 700 + Math.random() * 600, // ms
      blue: Math.random() < 0.4,
    });
    // next one in 2.5 – 7 seconds (occasionally two close together)
    nextShooterAt = t + (Math.random() < 0.12 ? 400 : 2500 + Math.random() * 4500);
  }

  function drawShooters(t, dt) {
    if (t >= nextShooterAt) spawnShooter(t);

    shooters = shooters.filter((s) => t - s.born < s.life);
    for (const s of shooters) {
      s.x += s.vx * (dt / 1000);
      s.y += s.vy * (dt / 1000);

      const age = (t - s.born) / s.life; // 0 -> 1
      const fade = age < 0.15 ? age / 0.15 : 1 - (age - 0.15) / 0.85;
      const mag = Math.hypot(s.vx, s.vy);
      const tx = s.x - (s.vx / mag) * s.len;
      const ty = s.y - (s.vy / mag) * s.len;

      // tail
      const grad = ctx.createLinearGradient(s.x, s.y, tx, ty);
      const head = s.blue ? "180, 215, 255" : "255, 255, 255";
      grad.addColorStop(0, `rgba(${head}, ${0.95 * fade})`);
      grad.addColorStop(0.3, `rgba(${head}, ${0.35 * fade})`);
      grad.addColorStop(1, `rgba(${head}, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // glowing head
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 10);
      glow.addColorStop(0, `rgba(255, 255, 255, ${fade})`);
      glow.addColorStop(1, `rgba(${head}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* --- Hyperspace: each star gets a 3D position and flies toward the camera --- */
  function focal() {
    return Math.max(window.innerWidth, window.innerHeight) * 0.6;
  }

  function startWarp() {
    const f = focal();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (const s of stars) {
      // keep each star exactly where it is on screen, but give it a depth
      s.z = f * (0.6 + Math.random() * 0.9);
      s.wx = ((s.x - cx) * s.z) / f;
      s.wy = ((s.y - cy) * s.z) / f;
      s.px = s.x;
      s.py = s.y;
    }
    warpStart = performance.now();
  }

  function respawn(s, f) {
    // new star far away, spread across the view
    s.z = f * (1.2 + Math.random() * 0.6);
    s.wx = (Math.random() - 0.5) * window.innerWidth * 2.4;
    s.wy = (Math.random() - 0.5) * window.innerHeight * 2.4;
    s.px = null;
  }

  function drawWarp(t, dt) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const f = focal();
    const p = Math.min((t - warpStart) / LEAVE_MS, 1); // 0 -> 1

    // speed ramps up quickly: a clear "jump to light speed"
    const speed = f * (0.15 + 3.2 * p * p) * (dt / 1000);

    // slight trail instead of a full clear, for longer streaks
    ctx.fillStyle = `rgba(0, 0, 0, ${0.55 - p * 0.25})`;
    ctx.fillRect(0, 0, w, h);

    for (const s of stars) {
      s.z -= speed;
      if (s.z < 4) {
        respawn(s, f);
        continue;
      }
      const sx = cx + (s.wx / s.z) * f;
      const sy = cy + (s.wy / s.z) * f;

      if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
        respawn(s, f);
        continue;
      }

      if (s.px !== null) {
        const near = 1 - Math.min(s.z / (f * 1.5), 1); // 0 far -> 1 close
        const alpha = Math.min(0.35 + near + p * 0.4, 1);
        ctx.strokeStyle = `rgba(${s.rgb}, ${alpha})`;
        ctx.lineWidth = s.r * (1 + near * 3);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      s.px = sx;
      s.py = sy;
    }
  }

  function drawTwinkle(t, dt) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const s of stars) {
      // Scintillation: fast, irregular flicker. Faint stars twinkle more,
      // bright stars stay steadier (like a real sky).
      const flicker = Math.sin(t * s.f1 + s.p1) * Math.sin(t * s.f2 + s.p2); // -1..1
      const depth = 0.45 - s.mag * 0.3;
      const alpha = Math.max(0, Math.min(1, s.base * (1 - depth * 0.5 + depth * 0.5 * flicker)));

      // Only the brightest stars get a small, soft glow (no spikes)
      if (s.mag > 0.25) {
        const glowR = s.r * (3.2 + s.mag * 2.5);
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        glow.addColorStop(0, `rgba(${s.rgb}, ${0.32 * alpha})`);
        glow.addColorStop(0.35, `rgba(${s.rgb}, ${0.1 * alpha})`);
        glow.addColorStop(1, `rgba(${s.rgb}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${s.rgb}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    drawShooters(t, dt);
  }

  function draw(t) {
    const dt = lastT === null ? 16 : Math.min(t - lastT, 50);
    lastT = t;
    if (warpStart !== null) {
      drawWarp(t, dt);
    } else {
      drawTwinkle(t, dt);
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    if (warpStart === null) resize();
  });
  resize();
  requestAnimationFrame(draw);

  /* ---------- Transition to the Homepage ---------- */
  function goToHomepage(url) {
    // Tell the homepage to play its arrival animation
    try {
      sessionStorage.setItem("aetheria-transition", "1");
    } catch (err) {
      /* storage blocked: homepage simply loads without the arrival effect */
    }

    document.body.classList.add("is-leaving");
    startWarp();
    setTimeout(() => {
      window.location.href = url;
    }, LEAVE_MS);
  }

  // If the user comes back with the browser's Back button, reset the page
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      document.body.classList.remove("is-leaving");
      warpStart = null;
      resize();
    }
  });

  /* ---------- Buttons ---------- */
  const officialBtn = document.getElementById("official-btn");
  officialBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (document.body.classList.contains("is-leaving")) return;
    goToHomepage(officialBtn.getAttribute("href"));
  });

  const playBtn = document.getElementById("play-btn");
  playBtn.addEventListener("click", function (e) {
    e.preventDefault();
    // TODO: point this to your game client / download page.
  });
})();
