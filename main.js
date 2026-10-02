/* ══════════════════════════════════════
   RS SHOP — main.js
   All Animations & Interactive Effects
══════════════════════════════════════ */

/* ══ LOADER ══ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hide');
    document.body.style.overflow = 'auto';
    initAnimations();
  }, 2500);
});
document.body.style.overflow = 'hidden';

/* ══ CUSTOM CURSOR ══ */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && cursorFollower) {
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  /* Smooth follower */
  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* Hover effect on interactive elements */
  document.querySelectorAll(
    'a, button, .product-card, .cat-card, .why-card, .t-dot'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorFollower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorFollower.classList.remove('hover');
    });
  });
}

/* ══ NAVBAR SCROLL ══ */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ══ HAMBURGER MENU ══ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  /* Close on link click */
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
}

/* ══ HERO PARTICLES ══ */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size     = Math.random() * 3 + 1;
    const x        = Math.random() * 100;
    const duration = Math.random() * 15 + 8;
    const delay    = Math.random() * 10;
    const opacity  = Math.random() * 0.6 + 0.2;

    p.style.cssText = `
      left: ${x}%;
      bottom: -10px;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${opacity};
    `;
    container.appendChild(p);
  }
}

/* ══ COUNTER ANIMATION ══ */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    const target   = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const step     = target / (duration / 16);
    let current    = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 16);
  });
}

/* ══ SCROLL ANIMATIONS ══ */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = el.getAttribute('data-delay') || 0;
        setTimeout(() => {
          el.classList.add('visible');
        }, parseInt(delay));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  /* Observe why cards */
  document.querySelectorAll('.why-card').forEach(el => {
    observer.observe(el);
  });

  /* AOS-like effect for cat cards */
  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-aos]').forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'all 0.7s cubic-bezier(0.25,0.46,0.45,0.94)';
    aosObserver.observe(el);
  });

  /* Counter trigger */
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        heroObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) heroObserver.observe(statsEl);
}

/* ══ TESTIMONIAL SLIDER ══ */
let currentSlide = 0;
let slideInterval;

function goSlide(index) {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.t-dot');

  if (!cards.length) return;

  cards[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = index;

  cards[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}

function autoSlide() {
  slideInterval = setInterval(() => {
    const cards = document.querySelectorAll('.testimonial-card');
    const next  = (currentSlide + 1) % cards.length;
    goSlide(next);
  }, 4000);
}

/* ══ CART SYSTEM ══ */
function getCart() {
  return JSON.parse(localStorage.getItem('rs_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('rs_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart  = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = total;
    if (total > 0) {
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => badge.style.transform = 'scale(1)', 300);
    }
  }
}

window.addToCart = function(id, name, price, image) {
  const cart     = getCart();
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }

  saveCart(cart);
  showToast(`"${name}" added to cart!`);
};

window.removeFromCart = function(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
};

window.updateQty = function(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
};

/* ══ TOAST NOTIFICATION ══ */
function showToast(message, type = 'success') {
  /* Remove existing toast */
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fas ${type === 'success'
      ? 'fa-check-circle'
      : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;

  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: ${type === 'success'
      ? 'linear-gradient(135deg,#1a1a1a,#0f0f0f)'
      : '#2a0a0a'};
    color: #fff;
    padding: 14px 24px;
    border-radius: 8px;
    border: 1px solid ${type === 'success'
      ? 'rgba(201,168,76,0.3)'
      : 'rgba(255,80,80,0.3)'};
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 9999;
    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
    white-space: nowrap;
  `;

  toast.querySelector('i').style.color =
    type === 'success' ? '#c9a84c' : '#ff5050';

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* Make showToast global */
window.showToast = showToast;

/* ══ SMOOTH PAGE TRANSITIONS ══ */
function initPageTransitions() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: #080808;
    z-index: 9990;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
  `;
  document.body.appendChild(overlay);

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (
      !href ||
      href.startsWith('#') ||
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      href.startsWith('https')
    ) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.opacity        = '1';
      overlay.style.pointerEvents  = 'all';
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });
  });

  /* Fade in on load */
  overlay.style.opacity       = '1';
  overlay.style.pointerEvents = 'none';
  setTimeout(() => {
    overlay.style.opacity = '0';
  }, 100);
}

/* ══ PARALLAX EFFECT ══ */
function initParallax() {
  window.addEventListener('scroll', () => {
    const scrollY  = window.scrollY;
    const heroEl   = document.querySelector('.hero-content');
    if (heroEl) {
      heroEl.style.transform =
        `translateY(${scrollY * 0.3}px)`;
      heroEl.style.opacity   =
        Math.max(0, 1 - scrollY / 600);
    }
  });
}

/* ══ ACTIVE NAV LINK ══ */
function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ══ INIT ALL ══ */
function initAnimations() {
  createParticles();
  initScrollAnimations();
  autoSlide();
  initPageTransitions();
  initParallax();
  setActiveNav();
  updateCartCount();
}

/* ══ EXPOSE goSlide GLOBALLY ══ */
window.goSlide = goSlide;
