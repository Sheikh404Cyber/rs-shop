/* ══════════════════════════════════════
   RS SHOP — main.js
   Global scripts: loader, navbar,
   cursor, hamburger, hero slider,
   testimonials, count-up, theme, AOS
══════════════════════════════════════ */

/* ── LOADER ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) setTimeout(() => loader.classList.add('hide'), 800);
});

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* ── CUSTOM CURSOR ── */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
if (cursor && cursorFollower) {
  document.addEventListener('mousemove', e => {
    cursor.style.left         = e.clientX + 'px';
    cursor.style.top          = e.clientY + 'px';
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top  = e.clientY + 'px';
  });
  document.querySelectorAll('a,button,.product-card,.cat-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

/* ── HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-container')) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
}

/* ── HERO BANNER SLIDER ── */
let heroIndex = 0;
let heroTimer = null;

function getHeroSlides() { return document.querySelectorAll('.hero-slide'); }
function getHeroDots()   { return document.querySelectorAll('.hero-slide-dot'); }

function goHeroSlide(n) {
  const slides = getHeroSlides();
  const dots   = getHeroDots();
  if (!slides.length) return;
  slides[heroIndex].classList.remove('active');
  if (dots[heroIndex]) dots[heroIndex].classList.remove('active');
  heroIndex = (n + slides.length) % slides.length;
  slides[heroIndex].classList.add('active');
  if (dots[heroIndex]) dots[heroIndex].classList.add('active');
}

function startHeroAuto() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => goHeroSlide(heroIndex + 1), 5000);
}

window.heroPrev = function() { goHeroSlide(heroIndex - 1); startHeroAuto(); };
window.heroNext = function() { goHeroSlide(heroIndex + 1); startHeroAuto(); };

document.addEventListener('DOMContentLoaded', () => {
  if (getHeroSlides().length > 1) startHeroAuto();
});

/* ── HERO PARTICLES ── */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random()*3+1}px;
      height:${Math.random()*3+1}px;
      background:rgba(201,168,76,${Math.random()*0.4+0.1});
      border-radius:50%;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation:float-particle ${Math.random()*10+8}s ease-in-out infinite;
      animation-delay:${Math.random()*5}s;
    `;
    container.appendChild(p);
  }
});

/* ── TESTIMONIAL SLIDER ── */
let tIndex = 0;
let tTimer = null;

function goSlide(n) {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.t-dot');
  if (!cards.length) return;
  cards[tIndex].classList.remove('active');
  if (dots[tIndex]) dots[tIndex].classList.remove('active');
  tIndex = (n + cards.length) % cards.length;
  cards[tIndex].classList.add('active');
  if (dots[tIndex]) dots[tIndex].classList.add('active');
}
window.goSlide = goSlide;

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelectorAll('.testimonial-card').length > 1) {
    tTimer = setInterval(() => goSlide(tIndex + 1), 4000);
  }
});

/* ── COUNT-UP ANIMATION ── */
function startCountUp() {
  const elements = document.querySelectorAll('.count-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        entry.target.dataset.done = '1';
        const target   = parseInt(entry.target.dataset.target) || 0;
        const duration = 2000;
        const steps    = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;
        const timer = setInterval(() => {
          step++;
          current = Math.min(Math.round(increment * step), target);
          entry.target.textContent = current;
          if (current >= target) clearInterval(timer);
        }, duration / steps);
      }
    });
  }, { threshold: 0.4 });

  elements.forEach(el => observer.observe(el));
}

/* ── SCROLL ANIMATIONS (AOS-like) ── */
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('aos-animate'), Number(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => {
    el.classList.add('aos-init');
    observer.observe(el);
  });
}

/* ── THEME TOGGLE ── */
window.toggleTheme = function() {
  const isLight = document.body.getAttribute('data-theme') === 'light';
  const icon = document.getElementById('themeIcon');
  if (isLight) {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('rs_theme', 'dark');
    if (icon) icon.className = 'fas fa-sun';
  } else {
    document.body.setAttribute('data-theme', 'light');
    localStorage.setItem('rs_theme', 'light');
    if (icon) icon.className = 'fas fa-moon';
  }
};

/* ── INIT THEME ON LOAD ── */
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('rs_theme') === 'light') {
    document.body.setAttribute('data-theme', 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'fas fa-moon';
  }
  startCountUp();
  initAOS();
});

/* ── PAGE TRANSITION ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loaded');
});

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── FLOAT ANIMATION (CSS helper) ── */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes float-particle {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
    25%       { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
    50%       { transform: translateY(-60px) translateX(-10px); opacity: 0.4; }
    75%       { transform: translateY(-30px) translateX(20px); opacity: 0.6; }
  }
  .aos-init { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .aos-init[data-aos="left"]  { transform: translateX(-40px); }
  .aos-init[data-aos="right"] { transform: translateX(40px); }
  .aos-init[data-aos="up"]    { transform: translateY(40px); }
  .aos-animate { opacity: 1 !important; transform: translate(0) !important; }
`;
document.head.appendChild(styleSheet);
