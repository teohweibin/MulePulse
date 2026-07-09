// =============================================
// CLEARCURRENT AI — LANDING PAGE SCRIPT
// Scroll-driven animations & interactions
// =============================================

// --- NAV scroll state ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// --- Reveal on scroll (IntersectionObserver) ---
const revealEls = document.querySelectorAll('.reveal-up');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));

// --- Hero elements immediate reveal ---
const heroReveal = document.querySelectorAll('.hero .reveal-up');
setTimeout(() => {
  heroReveal.forEach(el => el.classList.add('visible'));
}, 80);

// =============================================
// STICKY STEPS — scroll-driven slide control
// =============================================
const stepsTrack  = document.getElementById('stepsTrack');
const stepsSlider = document.getElementById('stepsSlider');
const stepsBar    = document.getElementById('stepsBar');
const slides      = stepsSlider ? Array.from(stepsSlider.querySelectorAll('.step-slide')) : [];
const STEP_COUNT  = slides.length;
const NAV_H       = 64; // matches --nav-height

function updateSteps() {
  if (!stepsTrack || !stepsSlider || STEP_COUNT === 0) return;

  const rect = stepsTrack.getBoundingClientRect();

  // How far the track has entered past the sticky threshold.
  // At sticky start: rect.top === NAV_H  → entered = 0
  // At sticky end:   rect.top === window.innerHeight - offsetHeight → entered = maxEnter
  const entered  = NAV_H - rect.top;
  // maxEnter accounts for NAV_H so progress=1 aligns exactly with sticky releasing
  const maxEnter = stepsTrack.offsetHeight - window.innerHeight + NAV_H;

  if (maxEnter <= 0) return;

  const rawProgress = Math.max(0, Math.min(1, entered / maxEnter));

  // Which slide (0-indexed)
  const slideIndex = Math.min(STEP_COUNT - 1, Math.floor(rawProgress * STEP_COUNT));

  // Translate slider — translateX uses own element width, which is now 100vw
  stepsSlider.style.transform = `translateX(-${slideIndex * 100}%)`;

  // Smooth progress bar (uses raw 0-1, not quantised)
  stepsBar.style.width = (rawProgress * 100) + '%';

  // Active class drives the step-number colour transition via CSS
  slides.forEach((s, i) => s.classList.toggle('active', i === slideIndex));
}

window.addEventListener('scroll', updateSteps, { passive: true });
updateSteps();

// =============================================
// HERO GRAPH — mouse parallax
// =============================================
const heroSection = document.querySelector('.hero');
const heroGraph   = document.querySelector('.hero-graph');

if (heroSection && heroGraph) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    heroGraph.style.transform = `perspective(800px) rotateY(${cx * 4}deg) rotateX(${-cy * 3}deg)`;
  }, { passive: true });

  heroSection.addEventListener('mouseleave', () => {
    heroGraph.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
    heroGraph.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    setTimeout(() => { heroGraph.style.transition = ''; }, 800);
  }, { passive: true });
}

// =============================================
// SMOOTH SCROLL for anchor links
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
