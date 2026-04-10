// ==================== HEADER ====================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ==================== HAMBURGER ====================
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});
mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ==================== HERO CANVAS – CINEMATIC FUTURE ====================
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

let W, H, T = 0;
let particles = [], starDots = [], nebulaBlobs = [], shooters = [];
let auroraPhase = 0, initialized = false;

// ── Flow field angle ───────────────────────────────────────────
function flowAngle(x, y, t) {
  const nx = x / W, ny = y / H;
  return (
    Math.sin(nx * 5.2 + t * 0.85) * Math.cos(ny * 3.8 - t * 0.55) * Math.PI +
    Math.cos(nx * 2.7 - t * 0.68) * Math.sin(ny * 6.4 + t * 0.42) * 0.9 +
    Math.sin((nx + ny) * 4.6 + t * 1.05) * 0.5
  ) * Math.PI;
}

// ── Particle helpers ──────────────────────────────────────────
function resetParticle(p, scatter) {
  p.x      = scatter ? Math.random() * W : (Math.random() > 0.5 ? 0 : W);
  p.y      = Math.random() * H;
  p.age    = scatter ? Math.random() * 220 : 0;
  p.maxAge = 180 + Math.random() * 240;
  p.speed  = 0.7 + Math.random() * 1.4;
  p.hue    = 185 + Math.random() * 85;   // blue → cyan → violet
  p.bri    = 60 + Math.random() * 28;
  p.size   = 0.4 + Math.random() * 1.0;
}

function initParticles() {
  const N = Math.min(2800, Math.floor(W * H / 650));
  particles = Array.from({ length: N }, () => {
    const p = {};
    resetParticle(p, true);
    return p;
  });
}

function initStarDots() {
  starDots = Array.from({ length: 160 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 0.9 + 0.15,
    a: Math.random() * 0.45 + 0.08,
    ph: Math.random() * Math.PI * 2,
    sp: 0.005 + Math.random() * 0.012,
  }));
}

function initNebulaBlobs() {
  nebulaBlobs = Array.from({ length: 10 }, () => ({
    x:   Math.random() * W,
    y:   Math.random() * H * 0.85,
    r:   80 + Math.random() * 140,
    a:   0.022 + Math.random() * 0.025,
    ph:  Math.random() * Math.PI * 2,
    sp:  0.003 + Math.random() * 0.004,
    hue: 200 + Math.random() * 70,
  }));
}

function spawnShooter() {
  if (Math.random() > 0.004) return;
  shooters.push({
    x:     Math.random() * W * 0.6,
    y:     Math.random() * H * 0.4,
    vx:    3 + Math.random() * 4,
    vy:    1 + Math.random() * 2,
    len:   60 + Math.random() * 80,
    a:     0.8,
    hue:   200 + Math.random() * 40,
  });
}

// ── Resize ────────────────────────────────────────────────────
function resize() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
  initParticles();
  initStarDots();
  initNebulaBlobs();
  initialized = false;
}
window.addEventListener('resize', resize, { passive: true });

// ── Draw ──────────────────────────────────────────────────────
function draw() {
  T += 0.0042;

  // First frame: solid background
  if (!initialized) {
    ctx.fillStyle = 'rgb(1, 3, 14)';
    ctx.fillRect(0, 0, W, H);
    initialized = true;
  } else {
    ctx.fillStyle = 'rgba(1, 3, 14, 0.20)';
    ctx.fillRect(0, 0, W, H);
  }

  // ── Nebula glow blobs ─────────────────────────────────────
  nebulaBlobs.forEach(b => {
    b.ph += b.sp;
    const pulse = 0.85 + 0.15 * Math.sin(b.ph);
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * pulse);
    g.addColorStop(0,   `hsla(${b.hue}, 80%, 60%, ${b.a})`);
    g.addColorStop(1,   'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * pulse, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Starfield ────────────────────────────────────────────
  starDots.forEach(s => {
    s.ph += s.sp;
    const a = s.a * (0.5 + 0.5 * Math.sin(s.ph));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(190, 220, 255, ${a})`;
    ctx.fill();
  });

  // ── Aurora waves ─────────────────────────────────────────
  auroraPhase += 0.0028;
  for (let i = 0; i < 4; i++) {
    const ph  = auroraPhase + i * 1.4;
    const yB  = H * (0.12 + i * 0.11) + Math.sin(ph * 0.65) * H * 0.07;
    const hue = 192 + i * 22 + Math.sin(ph) * 14;
    const alf = 0.022 + 0.012 * Math.sin(ph * 0.8);

    ctx.beginPath();
    ctx.moveTo(0, yB);
    for (let x = 0; x <= W; x += 14) {
      const y = yB
        + Math.sin(x * 0.0055 + ph)         * H * 0.048
        + Math.sin(x * 0.0028 - ph * 0.75)  * H * 0.038
        + Math.cos(x * 0.0096 + ph * 1.2)   * H * 0.018;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = `hsla(${hue}, 85%, 58%, ${alf})`;
    ctx.fill();

    // bright line on top
    ctx.beginPath();
    ctx.moveTo(0, yB);
    for (let x = 0; x <= W; x += 14) {
      const y = yB
        + Math.sin(x * 0.0055 + ph)        * H * 0.048
        + Math.sin(x * 0.0028 - ph * 0.75) * H * 0.038
        + Math.cos(x * 0.0096 + ph * 1.2)  * H * 0.018;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${hue}, 100%, 75%, ${alf * 2.2})`;
    ctx.lineWidth = 1.2;
    ctx.shadowBlur  = 18;
    ctx.shadowColor = `hsla(${hue}, 100%, 75%, 0.5)`;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── Perspective grid ──────────────────────────────────────
  const vanY = H * 0.58;
  ctx.lineWidth = 0.7;
  ctx.strokeStyle = 'rgba(30, 110, 220, 0.055)';
  const vLines = 14;
  for (let i = 0; i <= vLines; i++) {
    const xFar  = W * (i / vLines);
    const xNear = W * (-0.9 + i / vLines * 2.8);
    ctx.beginPath();
    ctx.moveTo(xFar, vanY);
    ctx.lineTo(xNear, H);
    ctx.stroke();
  }
  const hLines = 8;
  for (let j = 0; j < hLines; j++) {
    const e = (j / hLines) ** 2;
    const y = vanY + (H - vanY) * e;
    ctx.beginPath();
    ctx.moveTo(W * (-0.45 * (1 - e)), y);
    ctx.lineTo(W * (1 + 0.45 * (1 - e)), y);
    ctx.stroke();
  }

  // ── Flow particles ────────────────────────────────────────
  particles.forEach(p => {
    const angle = flowAngle(p.x, p.y, T);
    p.x  += Math.cos(angle) * p.speed;
    p.y  += Math.sin(angle) * p.speed * 0.52;
    p.age++;
    if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.age > p.maxAge) {
      resetParticle(p, false); return;
    }
    const life = Math.sin(Math.PI * p.age / p.maxAge);
    const hue  = p.hue + Math.sin(T + p.age * 0.018) * 18;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * life + 0.25, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 88%, ${p.bri}%, ${life * 0.72})`;
    ctx.fill();
  });

  // ── Shooting stars ────────────────────────────────────────
  spawnShooter();
  shooters = shooters.filter(s => s.a > 0.02);
  shooters.forEach(s => {
    ctx.save();
    ctx.globalAlpha = s.a;
    const g = ctx.createLinearGradient(s.x - s.vx * s.len / 5, s.y - s.vy * s.len / 5, s.x, s.y);
    g.addColorStop(0, 'transparent');
    g.addColorStop(1, `hsla(${s.hue}, 100%, 90%, 1)`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x - s.vx * s.len / 5, s.y - s.vy * s.len / 5);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.restore();
    s.x  += s.vx; s.y += s.vy; s.a -= 0.018;
  });

  // ── Central atmospheric glow ──────────────────────────────
  const pulse = 0.65 + 0.35 * Math.sin(T * 1.15);
  const cg = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.45);
  cg.addColorStop(0,   `rgba(25, 90, 255, ${0.07 * pulse})`);
  cg.addColorStop(0.5, `rgba(8, 40, 180, ${0.035 * pulse})`);
  cg.addColorStop(1,   'transparent');
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(draw);
}

resize();
draw();

// ==================== REVEAL ON SCROLL ====================
const reveals = document.querySelectorAll(
  '.vm-block, .service-card, .feature-card, .news-card, .company-table tr, ' +
  '.contact-section__title, .contact-section__sub, .contact-section__label, ' +
  '.about-section__label, .about-section__title, .about-section__body, .about-section .btn-primary'
);
reveals.forEach(el => {
  el.classList.add('reveal');
  const siblings = el.parentElement.querySelectorAll('.reveal');
  const idx = Array.from(siblings).indexOf(el);
  if (idx > 0 && idx <= 4) el.classList.add(`reveal-delay-${idx}`);
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObserver.observe(el));

// ==================== CONTACT FORM ====================
document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.textContent = '送信中...';
  btn.disabled = true;

  const data = new FormData(e.target);
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data,
    });
    const json = await res.json();
    if (json.success) {
      btn.textContent = '送信しました！ありがとうございました。';
      btn.style.background = '#16a34a';
      e.target.reset();
    } else {
      btn.textContent = '送信に失敗しました。もう一度お試しください。';
      btn.style.background = '#dc2626';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = '送信に失敗しました。もう一度お試しください。';
    btn.style.background = '#dc2626';
    btn.disabled = false;
  }
});
