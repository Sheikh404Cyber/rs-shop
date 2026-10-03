/* ══════════════════════════════════════
   RS SHOP — main.js  (v2)
   Har page e <script type="module" src="main.js">
   Header, Footer, Cart drawer, Search, Cart,
   Wishlist, Theme, Animation helpers
══════════════════════════════════════ */
import { SHOP, CATEGORIES, PAYMENT_LABELS, PLACEHOLDER_IMG, getShopInfo, searchProducts,
         taka, discountPercent, esc, debounce, waLink } from "./firebase.js";

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const readJSON = (k, d = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ══ THEME (age-i set hoy) ══ */
if (localStorage.getItem("rs_theme") === "light") document.documentElement.setAttribute("data-theme", "light");
export function toggleTheme() {
  const light = document.documentElement.getAttribute("data-theme") === "light";
  if (light) document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", "light");
  try { localStorage.setItem("rs_theme", light ? "dark" : "light"); } catch {}
  const i = $("#themeBtn i"); if (i) i.className = light ? "fas fa-sun" : "fas fa-moon";
}

/* ══ TOAST ══ */
export function toast(msg) {
  let box = $("#toastBox");
  if (!box) { box = document.createElement("div"); box.id = "toastBox"; box.className = "toast-box"; document.body.appendChild(box); }
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; box.appendChild(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 350); }, 2600);
}

/* ══ CART (localStorage: rs_cart) ══ */
export const Cart = {
  items: () => readJSON("rs_cart"),
  count: () => Cart.items().reduce((s, i) => s + i.qty, 0),
  subtotal: () => Cart.items().reduce((s, i) => s + i.price * i.qty, 0),
  save(list) { writeJSON("rs_cart", list); window.dispatchEvent(new Event("rs:cart")); },
  add(p, qty = 1) {
    const list = Cart.items(); const ex = list.find(i => i.id === p.id);
    if (ex) ex.qty += qty; else list.push({ id: p.id, name: p.name, price: Number(p.price) || 0, image: p.image || p.imageUrl || "", category: p.category || "watches", qty });
    Cart.save(list);
  },
  remove(id) { Cart.save(Cart.items().filter(i => i.id !== id)); },
  setQty(id, q) { Cart.save(q < 1 ? Cart.items().filter(i => i.id !== id) : Cart.items().map(i => i.id === id ? { ...i, qty: q } : i)); },
  clear() { Cart.save([]); }
};

/* ══ WISHLIST (localStorage: rs_wishlist — id list) ══ */
export const Wish = {
  ids: () => readJSON("rs_wishlist").map(x => (typeof x === "object" && x ? x.id : x)).filter(Boolean),
  has: id => Wish.ids().includes(id),
  toggle(id) {
    const ids = Wish.ids(); const on = !ids.includes(id);
    writeJSON("rs_wishlist", on ? [...ids, id] : ids.filter(x => x !== id));
    window.dispatchEvent(new Event("rs:wish")); return on;
  }
};

/* ══ PRODUCT CARD (sob page eta use kore) ══ */
export function productCard(p) {
  const off = discountPercent(p.price, p.oldPrice);
  const out = p.stock === "out_of_stock" || (p.stockQty === 0 && p.stock === "out_of_stock");
  const img = esc(p.imageUrl || PLACEHOLDER_IMG);
  const data = `data-id="${esc(p.id)}" data-name="${esc(p.name)}" data-price="${p.price}" data-img="${img}" data-cat="${esc(p.category)}"`;
  return `
  <article class="product-card reveal ${out ? "sold" : ""}" ${data}>
    <div class="p-img">
      <a href="product.html?id=${encodeURIComponent(p.id)}" aria-label="${esc(p.name)}"><img src="${img}" alt="${esc(p.name)}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'"></a>
      ${off ? `<span class="p-off">${off}% OFF</span>` : ""}
      ${p.flashSale ? `<span class="p-tag">⚡ Flash Sale</span>` : ""}
      <button class="p-wish ${Wish.has(p.id) ? "on" : ""}" data-act="wish" aria-label="Wishlist"><i class="fas fa-heart"></i></button>
    </div>
    <div class="p-info">
      <a class="p-name" href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a>
      <div class="p-price"><span class="p-now">${taka(p.price)}</span>${p.oldPrice > p.price ? `<span class="p-old">${taka(p.oldPrice)}</span>` : ""}</div>
      ${p.stock === "limited" ? `<span class="p-stock">Limited stock</span>` : ""}
      <div class="p-actions">
        ${out ? `<button class="btn btn-dark" disabled>Stock Out</button>`
              : `<button class="btn btn-outline" data-act="add"><i class="fas fa-cart-plus"></i> Add</button>
                 <button class="btn btn-primary" data-act="buy">Order Now</button>`}
      </div>
    </div>
  </article>`;
}
export const skeletons = (n = 8) => Array.from({ length: n }, () => `<div class="skeleton"></div>`).join("");

/* card er button click (delegation) */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const card = b.closest("[data-id]"); if (!card) return;
  const p = { id: card.dataset.id, name: card.dataset.name, price: +card.dataset.price, image: card.dataset.img, category: card.dataset.cat };
  if (b.dataset.act === "wish") {
    const on = Wish.toggle(p.id); b.classList.toggle("on", on); toast(on ? "Wishlist e add hoyeche ❤️" : "Wishlist theke soriye newa hoyeche");
  } else if (b.dataset.act === "add") { Cart.add(p); toast("Cart e add hoyeche ✓"); }
  else if (b.dataset.act === "buy") { Cart.add(p); location.href = "cart.html"; }
});

/* ══ LAYOUT: HEADER / DRAWER / FOOTER ══ */
const NAV = [
  { key: "home", label: "Home", href: "index.html" },
  { key: "watches", label: "Watches", href: "watches.html", sub: true },
  { key: "sunglasses", label: "Sunglasses", href: "sunglasses.html", sub: true },
  { key: "gift", label: "🎁 Gift", href: "gift.html" },
  { key: "track", label: "Track Order", href: "track.html" },
  { key: "contact", label: "Contact", href: "contact.html" }
];
const SUBS = [["Men", "men"], ["Women", "women"], ["Kids", "kids"]];
const page = document.body.dataset.page || "";
const ticker = ["Premium Watches", "Stylish Sunglasses", "Gift Collection", "Fast Delivery", "100% Original", PAYMENT_LABELS.cod, "bKash / Nagad / Rocket"];
const tickerHTML = (ticker.map(t => `<span>✦ ${t}</span>`).join("")).repeat(2);

function headerHTML() {
  const nav = NAV.map(n => `
    <li class="nav-item ${page === n.key ? "active" : ""}">
      <a href="${n.href}">${n.label}${n.sub ? ' <i class="fas fa-chevron-down" style="font-size:.6rem"></i>' : ""}</a>
      ${n.sub ? `<div class="mega">${SUBS.map(([l, g]) => `<a href="${n.href}?gender=${g}">${l}</a>`).join("")}<a href="${n.href}">All ${n.label}</a></div>` : ""}
    </li>`).join("");
  const mobile = NAV.map(n => `
    <a class="mm-link" href="${n.href}">${n.label}</a>
    ${n.sub ? `<div class="mm-sub">${SUBS.map(([l, g]) => `<a href="${n.href}?gender=${g}">${l}</a>`).join("")}</div>` : ""}`).join("");
  return `
  <div class="topbar"><div class="topbar-track">${tickerHTML}</div></div>
  <header class="site-header" id="siteHeader">
    <div class="container header-main">
      <button class="icon-btn hamburger" id="menuBtn" aria-label="Menu"><i class="fas fa-bars"></i></button>
      <a class="logo" href="index.html">RS<small>SHOP</small></a>
      <div class="search-box desktop"><input type="search" id="searchInput" placeholder="Search watches, sunglasses, gifts..." autocomplete="off"><i class="fas fa-search"></i><div class="search-results" id="searchResults"></div></div>
      <div class="header-actions">
        <button class="icon-btn" id="themeBtn" aria-label="Theme"><i class="fas fa-sun"></i></button>
        <a class="icon-btn" href="wishlist.html" aria-label="Wishlist"><i class="fas fa-heart"></i><span class="badge" id="wishBadge">0</span></a>
        <button class="icon-btn" id="cartBtn" aria-label="Cart"><i class="fas fa-shopping-bag"></i><span class="badge" id="cartBadge">0</span></button>
      </div>
    </div>
    <nav class="main-nav"><ul class="nav-list container">${nav}</ul></nav>
  </header>
  <aside class="mobile-menu" id="mobileMenu">
    <div class="mm-head"><a class="logo" href="index.html">RS<small>SHOP</small></a><button class="icon-btn" id="menuClose" aria-label="Close"><i class="fas fa-times"></i></button></div>
    <div class="search-box" style="max-width:none;margin-bottom:12px"><input type="search" id="searchInputM" placeholder="Search products..." autocomplete="off"><i class="fas fa-search"></i><div class="search-results" id="searchResultsM"></div></div>
    ${mobile}
  </aside>`;
}

function drawerHTML() {
  return `
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="cartDrawer" aria-label="Cart">
    <div class="drawer-head"><span><i class="fas fa-shopping-bag" style="color:var(--gold)"></i> Your Cart</span><button class="icon-btn" id="drawerClose" aria-label="Close"><i class="fas fa-times"></i></button></div>
    <div class="drawer-body" id="drawerBody"></div>
    <div class="drawer-foot" id="drawerFoot"></div>
  </aside>
  <a class="wa-float" id="waFloat" href="${waLink("Assalamu alaikum, ami RS SHOP theke kichu jante chai")}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
  <button class="to-top" id="toTop" aria-label="Top"><i class="fas fa-arrow-up"></i></button>`;
}

const POLICIES = [["delivery-return", "Delivery & Return Policy"], ["refund", "Refund Policy"], ["privacy", "Privacy Policy"], ["terms", "Terms & Conditions"], ["how-to-buy", "How to Buy"]];
function footerHTML(S = SHOP) {
  return `
  <footer class="footer"><div class="container">
    <div class="footer-grid">
      <div><a class="logo" href="index.html">RS<small>SHOP</small></a>
        <p style="margin-top:10px" data-shop="tagline">${esc(S.tagline || SHOP.tagline)}. Quality products at the best price.</p>
        <div class="f-social"><a href="${esc(S.facebook)}" target="_blank" rel="noopener" aria-label="Facebook" data-shop="facebook-link"><i class="fab fa-facebook-f"></i></a><a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a></div></div>
      <div><h4>Quick Links</h4><ul>
        <li><a href="index.html">Home</a></li><li><a href="watches.html">Watches</a></li><li><a href="sunglasses.html">Sunglasses</a></li><li><a href="gift.html">Gift Collection</a></li><li><a href="track.html">Order Track</a></li><li><a href="wishlist.html">Wishlist</a></li></ul></div>
      <div><h4>Support</h4><ul>${POLICIES.map(([k, l]) => `<li><a href="policy.html?type=${k}">${l}</a></li>`).join("")}<li><a href="about.html">About Us</a></li><li><a href="contact.html">Contact Us</a></li></ul></div>
      <div><h4>Contact Us</h4><ul>
        <li><i class="fas fa-map-marker-alt" style="color:var(--gold)"></i> <a href="${SHOP.mapLink}" target="_blank" rel="noopener" data-shop="address">${esc(S.address)}</a></li>
        <li><i class="fas fa-phone" style="color:var(--gold)"></i> <a href="tel:${esc(S.phone)}" data-shop="phone">${esc(S.phone)}</a></li>
        <li><i class="fab fa-whatsapp" style="color:var(--gold)"></i> <a href="${waLink()}" target="_blank" rel="noopener">WhatsApp Message</a></li></ul>
        <div class="pay-row">${Object.values(PAYMENT_LABELS).map(l => `<span class="pay-chip">${l}</span>`).join("")}</div></div>
    </div>
    <div class="footer-bottom">© ${new Date().getFullYear()} RS SHOP. All Rights Reserved | Developed by <a href="${SHOP.developerLink}" target="_blank" rel="noopener">${SHOP.developer}</a></div>
  </div></footer>`;
}

/* ══ CART DRAWER RENDER ══ */
function renderDrawer() {
  const items = Cart.items(), body = $("#drawerBody"), foot = $("#drawerFoot");
  if (!body) return;
  if (!items.length) {
    body.innerHTML = `<div class="empty"><i class="fas fa-shopping-bag"></i><h3>Cart khali</h3><p>Pochhondo moto product add koro.</p></div>`;
    foot.style.display = "none"; return;
  }
  foot.style.display = "";
  body.innerHTML = items.map(i => `
    <div class="cart-item" data-id="${esc(i.id)}">
      <img src="${esc(i.image || PLACEHOLDER_IMG)}" alt="" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div class="ci-info"><div class="ci-name">${esc(i.name)}</div><div class="ci-price">${taka(i.price)}</div>
        <div class="qty"><button data-q="-1" aria-label="Kom">−</button><span>${i.qty}</span><button data-q="1" aria-label="Bari">+</button></div></div>
      <button class="ci-remove" data-rm aria-label="Remove"><i class="fas fa-trash"></i></button>
    </div>`).join("");
  foot.innerHTML = `<div class="drawer-total"><span>Subtotal</span><span>${taka(Cart.subtotal())}</span></div>
    <a class="btn btn-primary btn-block" href="cart.html">Checkout</a><a class="btn btn-dark btn-block" href="cart.html">View Cart</a>`;
}
function updateBadges() {
  const c = Cart.count(), w = Wish.ids().length;
  const cb = $("#cartBadge"), wb = $("#wishBadge");
  if (cb) { cb.textContent = c; cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump"); cb.style.display = c ? "" : "none"; }
  if (wb) { wb.textContent = w; wb.style.display = w ? "" : "none"; }
}
export function openCart()  { $("#cartDrawer")?.classList.add("open"); $("#overlay")?.classList.add("show"); document.body.classList.add("lock"); renderDrawer(); }
export function closeAll()  { ["#cartDrawer", "#mobileMenu"].forEach(s => $(s)?.classList.remove("open")); $("#overlay")?.classList.remove("show"); document.body.classList.remove("lock"); }

/* ══ SEARCH ══ */
function bindSearch(inputSel, boxSel) {
  const input = $(inputSel), box = $(boxSel); if (!input || !box) return;
  const run = debounce(async () => {
    const q = input.value.trim();
    if (q.length < 2) { box.classList.remove("open"); return; }
    try {
      const r = await searchProducts(q);
      box.innerHTML = r.length ? r.map(p => `<a class="sr-item" href="product.html?id=${encodeURIComponent(p.id)}"><img src="${esc(p.imageUrl)}" alt=""><div><b>${esc(p.name)}</b><span>${taka(p.price)}</span></div></a>`).join("")
                               : `<div class="sr-empty">"${esc(q)}" paoa jayni</div>`;
      box.classList.add("open");
    } catch { box.classList.remove("open"); }
  }, 250);
  input.addEventListener("input", run);
  document.addEventListener("click", e => { if (!e.target.closest(boxSel) && e.target !== input) box.classList.remove("open"); });
}

/* ══ ANIMATION HELPERS (page gulo import kore) ══ */
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 }) : null;
export function initReveal(root = document) { $$(".reveal:not(.in)", root).forEach(el => io ? io.observe(el) : el.classList.add("in")); }

export function initCounters(root = document) {
  const o = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; o.unobserve(e.target);
    const el = e.target, to = +el.dataset.target || 0, suf = el.dataset.suffix || "", t0 = performance.now();
    (function tick(t) { const k = Math.min((t - t0) / 1800, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString("en-IN") + suf; if (k < 1) requestAnimationFrame(tick); })(t0);
  }), { threshold: 0.4 });
  $$(".count-up", root).forEach(el => o.observe(el));
}

/* Hero: el = .hero-slider, banners = [{imageUrl,title,sub,cta,link}] */
export function renderHero(el, banners) {
  el.innerHTML = `<div class="hero-track">${banners.map((b, i) => `
      <div class="hero-slide ${i === 0 ? "active" : ""}">${b.imageUrl ? `<img src="${esc(b.imageUrl)}" alt="" ${i ? 'loading="lazy"' : ""}>` : ""}
        ${b.title ? `<div class="hero-caption"><small>✦ New Collection ${new Date().getFullYear()} ✦</small><h2>${esc(b.title)}</h2><p>${esc(b.sub || "")}</p>${b.cta ? `<a class="btn btn-primary" href="${esc(b.link || "watches.html")}">${esc(b.cta)}</a>` : ""}</div>` : ""}</div>`).join("")}</div>
    ${banners.length > 1 ? `<button class="hero-arrow hero-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button><button class="hero-arrow hero-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
    <div class="hero-dots">${banners.map((_, i) => `<button class="hero-dot ${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>`).join("")}</div>` : ""}`;
  const track = $(".hero-track", el), slides = $$(".hero-slide", el), dots = $$(".hero-dot", el);
  let i = 0, timer;
  const go = n => { i = (n + slides.length) % slides.length; track.style.transform = `translateX(-${i * 100}%)`; slides.forEach((s, k) => s.classList.toggle("active", k === i)); dots.forEach((d, k) => d.classList.toggle("active", k === i)); };
  const auto = () => { clearInterval(timer); if (slides.length > 1) timer = setInterval(() => go(i + 1), 5000); };
  $(".hero-prev", el)?.addEventListener("click", () => { go(i - 1); auto(); });
  $(".hero-next", el)?.addEventListener("click", () => { go(i + 1); auto(); });
  dots.forEach((d, k) => d.addEventListener("click", () => { go(k); auto(); }));
  let x0 = null;
  el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  el.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); auto(); } x0 = null; });
  el.addEventListener("mouseenter", () => clearInterval(timer)); el.addEventListener("mouseleave", auto);
  auto();
}

/* Countdown: el e .time-box b[data-u="d|h|m|s"] thakte hobe */
export function startCountdown(el, endTime, onEnd) {
  const put = (u, v) => { const b = $(`[data-u="${u}"]`, el); if (!b) return; const s = String(v).padStart(2, "0"); if (b.textContent !== s) { b.textContent = s; b.classList.remove("flip"); void b.offsetWidth; b.classList.add("flip"); } };
  const tick = () => {
    const d = endTime - Date.now();
    if (d <= 0) { ["d", "h", "m", "s"].forEach(u => put(u, 0)); clearInterval(t); onEnd && onEnd(); return; }
    put("d", Math.floor(d / 864e5)); put("h", Math.floor(d % 864e5 / 36e5)); put("m", Math.floor(d % 36e5 / 6e4)); put("s", Math.floor(d % 6e4 / 1e3));
  };
  const t = setInterval(tick, 1000); tick(); return t;
}

/* Slider (review): wrap = .review-wrap, track = .review-track, dotsEl = .slider-dots */
export function initSlider(wrap, dotsEl) {
  const track = $(".review-track", wrap), cards = $$(".review-card", wrap); if (!cards.length) return;
  let i = 0, timer;
  const per = () => innerWidth <= 600 ? 1 : innerWidth <= 1024 ? 2 : 3;
  const pages = () => Math.max(1, cards.length - per() + 1);
  const draw = () => { if (dotsEl) dotsEl.innerHTML = Array.from({ length: pages() }, (_, k) => `<button class="${k === i ? "active" : ""}" aria-label="Slide ${k + 1}"></button>`).join(""); };
  const go = n => { i = (n + pages()) % pages(); track.style.transform = `translateX(-${i * (cards[0].offsetWidth + 20)}px)`; draw(); };
  dotsEl?.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go([...dotsEl.children].indexOf(b)); });
  addEventListener("resize", debounce(() => go(0), 200));
  clearInterval(timer); timer = setInterval(() => go(i + 1), 4500); draw();
}

/* ══ BOOT ══ */
function boot() {
  /* loader */
  const loader = document.createElement("div");
  loader.className = "loader"; loader.id = "loader";
  loader.innerHTML = `<div class="loader-logo">RS SHOP</div><div class="loader-bar"><span></span></div>`;
  document.body.prepend(loader);
  const hide = () => setTimeout(() => loader.classList.add("hide"), 350);
  document.readyState === "complete" ? hide() : addEventListener("load", hide);
  setTimeout(hide, 3500);

  /* header / footer / drawer */
  const h = $("#site-header"); if (h) h.outerHTML = headerHTML();
  const f = $("#site-footer"); if (f) f.outerHTML = footerHTML();
  document.body.insertAdjacentHTML("beforeend", drawerHTML());
  if (document.documentElement.getAttribute("data-theme") === "light") { const i = $("#themeBtn i"); if (i) i.className = "fas fa-moon"; }

  /* events */
  $("#menuBtn")?.addEventListener("click", () => { $("#mobileMenu").classList.add("open"); $("#overlay").classList.add("show"); document.body.classList.add("lock"); });
  $("#menuClose")?.addEventListener("click", closeAll);
  $("#cartBtn")?.addEventListener("click", openCart);
  $("#drawerClose")?.addEventListener("click", closeAll);
  $("#overlay")?.addEventListener("click", closeAll);
  $("#themeBtn")?.addEventListener("click", toggleTheme);
  $("#toTop")?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
  addEventListener("scroll", () => {
    $("#siteHeader")?.classList.toggle("scrolled", scrollY > 40);
    $("#toTop")?.classList.toggle("show", scrollY > 500);
  }, { passive: true });
  $("#drawerBody")?.addEventListener("click", e => {
    const row = e.target.closest(".cart-item"); if (!row) return; const id = row.dataset.id;
    const q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
    if (q) { const it = Cart.items().find(i => i.id === id); if (it) Cart.setQty(id, it.qty + +q.dataset.q); }
    if (rm) Cart.remove(id);
  });
  const sync = () => { updateBadges(); renderDrawer(); };
  addEventListener("rs:cart", sync); addEventListener("rs:wish", updateBadges);
  addEventListener("storage", sync);
  bindSearch("#searchInput", "#searchResults"); bindSearch("#searchInputM", "#searchResultsM");
  sync();

  /* scroll reveal: notun add howa element o dhore */
  initReveal();
  new MutationObserver(() => initReveal()).observe(document.body, { childList: true, subtree: true });

  /* admin Settings theke shop info update */
  getShopInfo().then(S => {
    $$("[data-shop=phone]").forEach(a => { a.textContent = S.phone; a.href = "tel:" + S.phone; });
    $$("[data-shop=address]").forEach(a => { a.textContent = S.address; });
    $$("[data-shop=facebook-link]").forEach(a => { a.href = S.facebook; });
  }).catch(() => {});
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();

/* inline onclick er jonno */
window.RS = { Cart, Wish, toast, openCart, closeAll, productCard, skeletons, initReveal, initCounters, renderHero, startCountdown, initSlider, toggleTheme };
