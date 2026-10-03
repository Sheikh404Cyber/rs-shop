/* ══════════════════════════════════════
   RS SHOP — main.js  (Updated 2026)
   All Animations & Interactive Effects
══════════════════════════════════════ */

/* ══ LOADER — 1.2s ══ */
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

/* ══ COUNT-UP ANIMATION ══ */
function initCountUp() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target') || '0');
        const dur    = 2000;
        const step   = target / (dur / 16);
        let current  = 0;
        const timer  = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, 16);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.count-up').forEach(el => observer.observe(el));
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
  const badge = document.getElementById('cartCount');
  if (badge) {
    badge.textContent = total;
    if (total > 0) {
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => badge.style.transform = 'scale(1)', 300);
    }
  }
  const wish   = JSON.parse(localStorage.getItem('rs_wishlist') || '[]');
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
  showToast('🛒 Cart-এ যোগ হয়েছে!');
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
    el.style.color      = '#C9A84C';
    el.style.fontFamily = 'Cinzel,serif';
    el.style.fontWeight = '900';
  });
  document.querySelectorAll('.logo-shop').forEach(el => {
    el.style.color       = '#ffffff';
    el.style.fontFamily  = 'Cinzel,serif';
    el.style.fontWeight  = '400';
    el.style.letterSpacing = '3px';
  });
}

/* ══ THEME TOGGLE ══ */
window.toggleTheme = function() {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rs_theme', next);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = next === 'light' ? 'fas fa-moon' : 'fas fa-sun';
};

function loadTheme() {
  const saved = localStorage.getItem('rs_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = saved === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

/* ══ SEARCH HANDLER ══ */
window.handleSearch = function(val) {
  const resultsBox = document.getElementById('searchResults');
  if (!resultsBox) return;
  const q = (val || '').trim().toLowerCase();
  if (!q) { resultsBox.classList.remove('show'); return; }

  /* Firebase থেকে allProducts লোড হলে সেটা দিয়ে filter */
  const source = window._allProducts || [];
  const filtered = source.filter(p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q)
  ).slice(0, 6);

  if (!filtered.length) {
    resultsBox.innerHTML = `<div class="search-no-result">কোনো পণ্য পাওয়া যায়নি</div>`;
  } else {
    resultsBox.innerHTML = filtered.map(p => `
      <div class="search-item" onclick="window.location.href='product.html?id=${p.id}'">
        <img src="${p.imageUrl || ''}" alt="${p.name}" onerror="this.src=''">
        <div class="search-item-info">
          <h4>${p.name}</h4>
          <span>৳${p.price}</span>
        </div>
      </div>
    `).join('');
  }
  resultsBox.classList.add('show');
};

/* search close on outside click */
document.addEventListener('click', e => {
  const sr = document.getElementById('searchResults');
  const sw = document.querySelector('.search-wrap');
  if (sr && sw && !sw.contains(e.target)) sr.classList.remove('show');
});

/* ══ CATEGORY FILTER (Homepage tabs) ══ */
window.filterCat = function(type, gender, btn) {
  /* active tab */
  const tabsId = type === 'watches' ? 'watchTabs' : type === 'sunglasses' ? 'sunglassTabs' : null;
  if (tabsId) {
    document.querySelectorAll(`#${tabsId} .cat-tab`).forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  const gridId = type === 'watches' ? 'watchGrid' : type === 'sunglasses' ? 'sunglassGrid' : 'giftGrid';
  const grid   = document.getElementById(gridId);
  if (!grid) return;

  const cards = grid.querySelectorAll('.product-card');
  cards.forEach(card => {
    const g = card.getAttribute('data-gender') || 'all';
    card.style.display = (gender === 'all' || g === gender) ? '' : 'none';
  });
};

/* ══ QUICK VIEW ══ */
window.openQuickView = function(id, name, price, oldPrice, image, desc, cat) {
  const overlay = document.getElementById('quickViewOverlay');
  if (!overlay) return;
  document.getElementById('qvImg').src           = image || '';
  document.getElementById('qvName').textContent  = name  || '';
  document.getElementById('qvCat').textContent   = cat   || '';
  document.getElementById('qvPrice').textContent = '৳' + (price || 0);
  document.getElementById('qvOld').textContent   = oldPrice ? '৳' + oldPrice : '';
  document.getElementById('qvDesc').textContent  = desc  || '';
  document.getElementById('qvCartBtn').onclick   = () => {
    window.addToCart(id, name, price, image);
    window.closeQuickView();
  };
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeQuickView = function() {
  const overlay = document.getElementById('quickViewOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = 'auto';
};

/* ESC key closes quick view */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.closeQuickView?.();
});

/* ══ HERO BANNER SLIDER (Homepage) ══ */
let heroIndex     = 0;
let heroTimer     = null;
let heroSlides    = [];

window.heroNext = function() {
  if (!heroSlides.length) return;
  setHeroSlide((heroIndex + 1) % heroSlides.length);
  resetHeroTimer();
};

window.heroPrev = function() {
  if (!heroSlides.length) return;
  setHeroSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length);
  resetHeroTimer();
};

function setHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-slide-dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i)   => d.classList.toggle('active', i === index));
  heroIndex = index;
}

function resetHeroTimer() {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) setHeroSlide((heroIndex + 1) % slides.length);
  }, 5000);
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 1) resetHeroTimer();
}

/* ══ FLASH SALE TIMER ══ */
window.startFlashTimer = function(endDateStr) {
  function tick() {
    const now  = Date.now();
    const end  = new Date(endDateStr).getTime();
    const diff = Math.max(0, end - now);
    const d    = Math.floor(diff / 86400000);
    const h    = Math.floor((diff % 86400000) / 3600000);
    const m    = Math.floor((diff % 3600000)  / 60000);
    const s    = Math.floor((diff % 60000)    / 1000);
    const pad  = n => String(n).padStart(2, '0');
    const days  = document.getElementById('fDays');
    const hours = document.getElementById('fHours');
    const mins  = document.getElementById('fMins');
    const secs  = document.getElementById('fSecs');
    if (days)  days.textContent  = pad(d);
    if (hours) hours.textContent = pad(h);
    if (mins)  mins.textContent  = pad(m);
    if (secs)  secs.textContent  = pad(s);
    if (diff <= 0) {
      clearInterval(window._flashInterval);
      const sec = document.getElementById('flashSaleSection');
      if (sec) sec.style.display = 'none';
    }
  }
  clearInterval(window._flashInterval);
  tick();
  window._flashInterval = setInterval(tick, 1000);
};

/* ══ PRODUCT CARD BUILDER ══ */
window.buildProductCard = function(p) {
  const discount = p.oldPrice && p.price
    ? Math.round((1 - p.price / p.oldPrice) * 100)
    : null;
  return `
    <div class="product-card" data-gender="${p.gender || 'all'}"
         onclick="window.location.href='product.html?id=${p.id}'">
      <div class="p-img-wrap">
        <img src="${p.imageUrl || ''}" alt="${p.name}" loading="lazy"
             onerror="this.parentElement.style.background='#1a1a1a'">
        ${discount ? `<div class="p-badge">${discount}% OFF</div>` : ''}
        <div class="p-hover">
          <button onclick="event.stopPropagation();window.openQuickView('${p.id}','${(p.name||'').replace(/'/g,'&apos;')}',${p.price||0},${p.oldPrice||0},'${p.imageUrl||''}','${(p.description||'').substring(0,80).replace(/'/g,'&apos;')}','${p.category||''}')">
            <i class="fas fa-eye"></i> Quick View
          </button>
        </div>
      </div>
      <div class="p-info">
        <h3>${p.name || ''}</h3>
        <div class="p-price">
          <span class="p-current">৳${p.price || 0}</span>
          ${p.oldPrice ? `<span class="p-old">৳${p.oldPrice}</span>` : ''}
        </div>
        <button class="p-cart-btn" onclick="event.stopPropagation();window.addToCart('${p.id}','${(p.name||'').replace(/'/g,'&apos;')}',${p.price||0},'${p.imageUrl||''}')">
          <i class="fas fa-shopping-bag"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
};

/* ══ INIT ALL ══ */
function initAnimations() {
  loadTheme();
  createParticles();
  initScrollAnimations();
  initCountUp();
  autoSlide();
  initPageTransitions();
  initParallax();
  setActiveNav();
  updateCartCount();
  fixLogoColor();
  initHeroSlider();
}
