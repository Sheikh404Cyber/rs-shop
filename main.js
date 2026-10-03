/* ══════════════════════════════════════
   RS SHOP — main.js  (Updated 2026)
   All Animations & Interactive Effects
══════════════════════════════════════ */

/* ══ LOADER — 2.5s থেকে 1.2s করা হয়েছে ══ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    if (loader) loader.classList.add('hide');
    document.body.style.overflow = 'auto';
    initAnimations();
  }, 1200);
});
document.body.style.overflow = 'hidden';

/* ══ CUSTOM CURSOR ══ */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && cursorFollower) {
  if (window.innerWidth > 768) {
    document.body.style.cursor = 'none';
    document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
      el.style.cursor = 'none';
    });
  }

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let cursorVisible = false;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
    if (!cursorVisible) {
      cursor.style.opacity = '1';
      cursorFollower.style.opacity = '1';
      cursorVisible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorFollower.style.opacity = '0';
    cursorVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '1';
    cursorVisible = true;
  });

  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll(
    'a, button, .product-card, .cat-card, .why-card, .t-dot, .cat-showcase-card, input, select, textarea'
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

  if (window.innerWidth <= 768) {
    cursor.style.display = 'none';
    cursorFollower.style.display = 'none';
    document.body.style.cursor = 'auto';
  }
}

/* ══ NAVBAR SCROLL ══ */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
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
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (navbar && !navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
}

/* ══ HERO PARTICLES ══ */
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const p        = document.createElement('div');
    p.className    = 'particle';
    const size     = Math.random() * 3 + 1;
    const x        = Math.random() * 100;
    const duration = Math.random() * 15 + 8;
    const delay    = Math.random() * 10;
    const opacity  = Math.random() * 0.5 + 0.1;
    p.style.cssText = `left:${x}%;bottom:-10px;width:${size}px;height:${size}px;animation-duration:${duration}s;animation-delay:${delay}s;opacity:${opacity}`;
    container.appendChild(p);
  }
}

/* ══ SCROLL ANIMATIONS (AOS) ══ */
function initScrollAnimations() {
  /* why-card visible class */
  const whyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        whyObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.why-card').forEach(el => whyObserver.observe(el));

  /* data-aos elements */
  const aosObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0) translateX(0)';
        aosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-aos]').forEach(el => {
    const dir = el.getAttribute('data-aos');
    el.style.opacity    = '0';
    el.style.transition = 'all 0.7s cubic-bezier(0.25,0.46,0.45,0.94)';
    if (dir === 'left')       el.style.transform = 'translateX(-40px)';
    else if (dir === 'right') el.style.transform = 'translateX(40px)';
    else                      el.style.transform = 'translateY(40px)';
    aosObserver.observe(el);
  });
}

/* ══ TESTIMONIAL SLIDER ══ */
let currentSlide = 0;
let slideInterval;

window.goSlide = function(index) {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots  = document.querySelectorAll('.t-dot');
  if (!cards.length) return;
  cards[currentSlide]?.classList.remove('active');
  dots[currentSlide]?.classList.remove('active');
  currentSlide = (index + cards.length) % cards.length;
  cards[currentSlide]?.classList.add('active');
  dots[currentSlide]?.classList.add('active');
};

function autoSlide() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    const cards = document.querySelectorAll('.testimonial-card');
    if (cards.length) window.goSlide(currentSlide + 1);
  }, 4500);
}

/* ══ CART SYSTEM ══ */
function getCart() {
  try { return JSON.parse(localStorage.getItem('rs_cart') || '[]'); }
  catch(e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem('rs_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart  = getCart();
  const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  /* cart badge */
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = total;
    if (total > 0) {
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => badge.style.transform = 'scale(1)', 300);
    }
  }
  /* wishlist badge */
  const wish = JSON.parse(localStorage.getItem('rs_wishlist') || '[]');
  const wBadge = document.getElementById('wishCount');
  if (wBadge) wBadge.textContent = wish.length;
}

window.addToCart = function(id, name, price, image) {
  const cart     = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ id, name: name || id, price: price || 0, image: image || '', qty: 1 });
  }
  saveCart(cart);
  showToast(`🛒 Cart-এ যোগ হয়েছে!`);
};

window.removeFromCart = function(id) {
  saveCart(getCart().filter(item => item.id !== id));
};

window.updateQty = function(id, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) { item.qty = Math.max(1, qty); saveCart(cart); }
};

/* ══ WISHLIST ══ */
window.toggleWishlist = function(id, name, price, image) {
  let wish = JSON.parse(localStorage.getItem('rs_wishlist') || '[]');
  const idx = wish.findIndex(x => x.id === id);
  if (idx > -1) {
    wish.splice(idx, 1);
    showToast('❤️ Wishlist থেকে সরানো হয়েছে', 'error');
  } else {
    wish.push({ id, name, price, image });
    showToast('❤️ Wishlist-এ যোগ হয়েছে!');
  }
  localStorage.setItem('rs_wishlist', JSON.stringify(wish));
  updateCartCount();
};

/* ══ TOAST NOTIFICATION ══ */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.rs-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'rs-toast';
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${message}</span>`;
  toast.style.cssText = `
    position:fixed;bottom:30px;left:50%;
    transform:translateX(-50%) translateY(100px);
    background:linear-gradient(135deg,#1a1a1a,#0f0f0f);
    color:#fff;padding:14px 24px;border-radius:10px;
    border:1px solid ${type === 'success' ? 'rgba(201,168,76,0.4)' : 'rgba(255,80,80,0.4)'};
    font-size:13px;font-weight:600;letter-spacing:.5px;
    display:flex;align-items:center;gap:10px;
    z-index:9999;box-shadow:0 10px 40px rgba(0,0,0,0.6);
    transition:transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
    white-space:nowrap;font-family:'Raleway',sans-serif;
  `;
  toast.querySelector('i').style.color = type === 'success' ? '#c9a84c' : '#ff5050';
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }));
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
window.showToast = showToast;

/* ══ PAGE TRANSITIONS ══ */
function initPageTransitions() {
  let overlay = document.getElementById('pageTransition');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pageTransition';
    overlay.style.cssText = 'position:fixed;inset:0;background:#080808;z-index:9990;opacity:0;pointer-events:none;transition:opacity 0.35s ease';
    document.body.appendChild(overlay);
  }
  /* fade in on load */
  setTimeout(() => { overlay.style.opacity = '0'; }, 50);

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('https')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(() => { window.location.href = href; }, 350);
    });
  });
}

/* ══ PARALLAX ══ */
function initParallax() {
  window.addEventListener('scroll', () => {
    const heroEl = document.querySelector('.hero-content');
    if (!heroEl) return;
    const scrollY = window.scrollY;
    heroEl.style.transform = `translateY(${scrollY * 0.2}px)`;
    heroEl.style.opacity   = Math.max(0, 1 - scrollY / 500);
  }, { passive: true });
}

/* ══ ACTIVE NAV LINK ══ */
function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href')?.split('?')[0];
    link.classList.toggle('active', href === current);
  });
}

/* ══ LOGO COLOR — RS gold, SHOP white ══ */
function fixLogoColor() {
  document.querySelectorAll('.logo-rs').forEach(el => {
    el.style.cssText = 'color:#C9A84C;font-family:Cinzel,serif;font-weight:900;font-size:inherit';
  });
  document.querySelectorAll('.logo-shop').forEach(el => {
    el.style.cssText = 'color:#ffffff;font-family:Cinzel,serif;font-weight:400;font-size:inherit;letter-spacing:3px';
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
  fixLogoColor();
}
