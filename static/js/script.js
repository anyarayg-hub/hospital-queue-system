/* ---------- Page navigation ---------- */
const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const welcomeBtn = document.getElementById("welcomeBtn");
let animating = false;

function showPage(n) {
  page1.classList.toggle("hidden", n !== 1);
  page2.classList.toggle("hidden", n !== 2);
  const shouldAnimate = (n === 1);       // pause particles on page 2
  if (shouldAnimate && !animating) { animating = true; requestAnimationFrame(frame); }
  if (!shouldAnimate) animating = false;
}

// Click: show page 2 right away, then update the URL hash so Back works
welcomeBtn.addEventListener("click", () => {
  showPage(2);
  location.hash = "page2";
});

// Back/forward buttons
addEventListener("hashchange", () => showPage(location.hash === "#page2" ? 2 : 1));

/* ---------- Particle background ---------- */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const COUNT = 90, LINK_DIST = 130, BURST_MS = 1800;
const COLORS = ["#4aaee0", "#2cc5b5", "#7cc4f0"];
const LINE_RGB = "40,130,180";

let w, h, dpr, particles = [];
const mouse = { x: -9999, y: -9999 };
const start = performance.now();

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  w = innerWidth; h = innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function makeParticles() {
  particles = Array.from({ length: COUNT }, () => ({
    homeX: Math.random() * w, homeY: Math.random() * h,
    x: w / 2, y: h / 2,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.8 + 1,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    delay: Math.random() * 400, alpha: 0
  }));
}
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

function frame(now) {
  if (!animating) return;
  ctx.clearRect(0, 0, w, h);
  const elapsed = now - start;

  for (const p of particles) {
    const t = reduceMotion ? 1 : Math.min(Math.max((elapsed - p.delay) / BURST_MS, 0), 1);
    if (t < 1) {
      const e = easeOutCubic(t);
      p.x = w / 2 + (p.homeX - w / 2) * e;
      p.y = h / 2 + (p.homeY - h / 2) * e;
    } else {
      p.homeX += p.vx; p.homeY += p.vy;
      if (p.homeX < 0 || p.homeX > w) p.vx *= -1;
      if (p.homeY < 0 || p.homeY > h) p.vy *= -1;
      p.x = p.homeX; p.y = p.homeY;
    }
    p.alpha = t;
  }

  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK_DIST) {
        ctx.strokeStyle = `rgba(${LINE_RGB},${(1 - d / LINK_DIST) * .35 * Math.min(a.alpha, b.alpha)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
    if (dm < LINK_DIST * 1.4) {
      ctx.strokeStyle = `rgba(${LINE_RGB},${(1 - dm / (LINK_DIST * 1.4)) * .6})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }
  for (const p of particles) {
    ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}

addEventListener("resize", () => { resize(); makeParticles(); });
addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });

resize();
makeParticles();
showPage(location.hash === "#page2" ? 2 : 1);
