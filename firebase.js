/* ══════════════════════════════════════
   RS SHOP — firebase.js  (NEW FILE)
   Firebase project: sojib-shop
   Shared config, shop info, database helpers
   and admin login. Every page imports this.
══════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, serverTimestamp, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ── Firebase config ── */
const firebaseConfig = {
  apiKey: "AIzaSyAerNu3OWe2bCejiGXxnQeXr9yiDR1FysU",
  authDomain: "sojib-shop.firebaseapp.com",
  projectId: "sojib-shop",
  storageBucket: "sojib-shop.firebasestorage.app",
  messagingSenderId: "1061639520028",
  appId: "1:1061639520028:web:d164fdf6f3d0bbd79304d9"
};
const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

/* admin panel e shudhu ei email dhukte parbe (Firebase Authentication e ei email diye user banate hobe) */
export const ADMIN_EMAIL = "admin@rsshop.com";

/* Firestore function gulo admin.html o ekhan theke nibe */
export { collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
         query, where, orderBy, limit, serverTimestamp, onSnapshot };

/* ══ SHOP INFO (default — admin Settings theke override hoy) ══ */
export const SHOP = {
  name: "RS SHOP",
  tagline: "Premium Watch, Sunglass & Gift Collection",
  phone: "01996283245",
  whatsapp: "8801996283245",
  facebook: "https://web.facebook.com/sojib.islam.739215",
  address: "Purbadhala Station Road, Kazi Super Market",
  area: "Purbadhala",
  mapEmbed: "https://www.google.com/maps?q=" + encodeURIComponent("Kazi Super Market, Purbadhala Station Road, Purbadhala") + "&output=embed",
  mapLink:  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Kazi Super Market, Purbadhala Station Road, Purbadhala"),
  developer: "AMIN SHEIKH",
  developerLink: "https://web.facebook.com/AMIN.SHEIKH.01"
};

/* ══ CONSTANTS ══ */
export const CATEGORIES = {
  watches:    { label: "Watches",    bn: "ঘড়ি",       icon: "⌚",  path: "watches.html",    desc: "Men, Women & Kids Collection" },
  sunglasses: { label: "Sunglasses", bn: "সানগ্লাস",   icon: "🕶️", path: "sunglasses.html", desc: "Polarized & Premium Shades" },
  gift:       { label: "Gifts",      bn: "গিফট",       icon: "🎁",  path: "gift.html",       desc: "Birthday, Anniversary & Special Gifts" }
};
export const GENDERS = { men: "Men", women: "Women", kids: "Kids", unisex: "Unisex" };
export const SUBCATS = { analog: "Analog", digital: "Digital", sport: "Sport", luxury: "Luxury", gift_item: "Gift Item", birthday: "Birthday" };
export const PAYMENT_LABELS = { cod: "Cash on Delivery", bkash: "bKash", nagad: "Nagad", rocket: "Rocket" };
/* Payment logo: images/bkash.svg, images/nagad.svg, images/rocket.svg (file na thakle nam dekhabe) */
export const payLogo = (k, h = 32) => k === "cod"
  ? `<span class="pay-logo cod" style="height:${h}px"><i class="fas fa-money-bill-wave"></i>&nbsp;Cash on Delivery</span>`
  : `<span class="pay-logo" style="height:${h}px"><img src="images/${k}.svg" alt="${PAYMENT_LABELS[k]}" loading="lazy" onerror="this.replaceWith(document.createTextNode('${PAYMENT_LABELS[k]}'))"></span>`;
export const STATUS = {
  pending:    { label: "অর্ডার গৃহীত",     step: 1 },
  processing: { label: "প্রসেসিং",          step: 2 },
  shipped:    { label: "শিপ করা হয়েছে",    step: 3 },
  delivered:  { label: "ডেলিভারি সম্পন্ন",  step: 4 },
  cancelled:  { label: "বাতিল",             step: 0 }
};
export const COUPONS = { RS10: 10, RSSHOP20: 20, WELCOME15: 15 };
export const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#1c1c1c"/><text x="50%" y="52%" fill="#c9a84c" font-family="serif" font-size="46" text-anchor="middle">RS</text></svg>');

/* ══ SMALL HELPERS ══ */
export const taka = n => "৳" + (Number(n) || 0).toLocaleString("en-IN");
export const discountPercent = (price, old) =>
  old && old > price ? Math.round(((old - price) / old) * 100) : 0;
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const debounce = (fn, ms = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const waLink = (text = "") =>
  "https://wa.me/" + SHOP.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");

/* ══ SETTINGS ══ */
async function readSetting(name) {
  try { const s = await getDoc(doc(db, "settings", name)); return s.exists() ? s.data() : {}; }
  catch (e) { console.error("settings/" + name, e); return {}; }
}
export async function getShopInfo() {
  const s = await readSetting("shop");
  const out = { ...SHOP };
  ["name", "phone", "whatsapp", "facebook", "address"].forEach(k => { if (s[k]) out[k] = s[k]; });
  return out;
}
export async function getDeliverySettings() {
  const d = await readSetting("delivery");
  return {
    dhaka:   parseInt(d.dhaka   ?? d.insideDhaka)  || 60,
    outside: parseInt(d.outside ?? d.outsideDhaka) || 120,
    freeAt:  parseInt(d.freeAt) || 2000
  };
}
export async function getPaymentSettings() {
  const p = await readSetting("payment");
  return {
    cod:    { on: (p.payCOD    ?? p.codOn)    !== false, area: p.codArea || "" },
    bkash:  { on: (p.payBkash  ?? p.bkashOn)  !== false, number: p.bkashNum  || p.bkash  || "" },
    nagad:  { on: (p.payNagad  ?? p.nagadOn)  !== false, number: p.nagadNum  || p.nagad  || "" },
    rocket: { on: (p.payRocket ?? p.rocketOn) !== false, number: p.rocketNum || p.rocket || "" }
  };
}
export async function getFlashSale() {
  const f = await readSetting("flashSale");
  const start = f.startDate ? new Date(f.startDate).getTime() : 0;
  const end   = f.endDate   ? new Date(f.endDate).getTime()   : 0;
  const now = Date.now();
  return {
    title: f.title || "Flash Sale!",
    discount: Number(f.discount) || 0,
    endTime: end,
    active: !!f.active && end > now && (!start || start <= now)
  };
}
/* flash sale cholle product er dam kome jay */
export function applyFlash(p, flash) {
  if (!flash || !flash.active || !p.flashSale || !flash.discount) return p;
  const price = Math.round(p.price * (1 - flash.discount / 100));
  return { ...p, price, oldPrice: Math.max(p.oldPrice || 0, p.price) };
}

/* ══ BANNERS ══ */
export const DEFAULT_BANNERS = [
  { imageUrl: "", title: "Define Your Style", sub: "Premium Watches, Sunglasses & Gifts at the best price", cta: "Shop Watches", link: "watches.html" },
  { imageUrl: "", title: "Stylish Sunglasses", sub: "Polarized & premium shades for every face", cta: "Shop Sunglasses", link: "sunglasses.html" },
  { imageUrl: "", title: "Gift Collection", sub: "Birthday, anniversary & special gifts", cta: "Shop Gifts", link: "gift.html" }
];
export async function getBanners() {
  try {
    const snap = await getDocs(collection(db, "banners"));
    const list = [];
    snap.forEach(d => { const b = d.data(); if (b.active !== false && b.imageUrl) list.push({ id: d.id, ...b }); });
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list.length ? list : DEFAULT_BANNERS;
  } catch (e) { console.error("banners", e); return DEFAULT_BANNERS; }
}

/* ══ PRODUCTS ══ */
const norm = (id, d) => ({
  id, ...d,
  price: Number(d.price) || 0,
  oldPrice: Number(d.oldPrice) || 0,
  stockQty: Number(d.stockQty) || 0,
  gender: d.gender || "unisex",
  imageUrl: d.imageUrl || PLACEHOLDER_IMG,
  createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : 0
});
let _cache = null, _cacheAt = 0;
export async function getAllProducts(force = false) {
  if (!force && _cache && Date.now() - _cacheAt < 60000) return _cache;
  const snap = await getDocs(collection(db, "products"));
  const list = [];
  snap.forEach(d => list.push(norm(d.id, d.data())));
  list.sort((a, b) => b.createdAt - a.createdAt);
  _cache = list; _cacheAt = Date.now();
  return list;
}
/* getProducts({ category, gender, subCategory, featured, flashSale, limit }) */
export async function getProducts(f = {}) {
  let list = await getAllProducts();
  if (f.category)    list = list.filter(p => p.category === f.category);
  if (f.gender)      list = list.filter(p => p.gender === f.gender);
  if (f.subCategory) list = list.filter(p => p.subCategory === f.subCategory);
  if (f.featured)    list = list.filter(p => p.featured);
  if (f.flashSale)   list = list.filter(p => p.flashSale);
  return f.limit ? list.slice(0, f.limit) : list;
}
export async function getProduct(id) {
  const hit = (await getAllProducts()).find(p => p.id === id);
  if (hit) return hit;
  const s = await getDoc(doc(db, "products", id));
  return s.exists() ? norm(s.id, s.data()) : null;
}
export async function searchProducts(term, max = 6) {
  const t = String(term || "").trim().toLowerCase();
  if (t.length < 2) return [];
  return (await getAllProducts())
    .filter(p => (p.name + " " + (p.category || "") + " " + (p.gender || "")).toLowerCase().includes(t))
    .slice(0, max);
}
export async function getRelated(p, n = 4) {
  return (await getAllProducts()).filter(x => x.id !== p.id && x.category === p.category).slice(0, n);
}

/* ══ ORDERS ══ */
const genOrderId = () => "RS" + Math.random().toString(36).slice(2, 8).toUpperCase() + Date.now().toString(36).slice(-3).toUpperCase();
/* data: { customer:{name,phone,address,area}, items, subtotal, delivery, discount, total, payment, transactionId, note, coupon } */
export async function createOrder(data) {
  const orderId = genOrderId();
  await setDoc(doc(db, "orders", orderId), {
    ...data, orderId, status: "pending", createdAt: serverTimestamp()
  });
  return orderId;
}
/* phone dile last 4 digit match korte hobe (privacy) */
export async function findOrder(input, phone = "") {
  const id = String(input || "").trim().toUpperCase();
  if (!id) return null;
  const s = await getDoc(doc(db, "orders", id));
  if (!s.exists()) return null;
  const o = { id: s.id, ...s.data() };
  if (phone) {
    const a = String(o.customer?.phone || "").replace(/\D/g, "").slice(-4);
    const b = String(phone).replace(/\D/g, "").slice(-4);
    if (!a || a !== b) return null;
  }
  return o;
}

/* ══ CONTACT MESSAGE ══ */
export async function sendMessage(m) {
  const ref = await addDoc(collection(db, "messages"), {
    name: m.name, phone: m.phone, email: m.email || null,
    subject: m.subject || "", orderId: m.orderId || null,
    message: m.message, status: "unread", createdAt: serverTimestamp()
  });
  return "MSG-" + ref.id.slice(-6).toUpperCase();
}

/* ══ ADMIN LOGIN (Firebase Authentication) ══ */
export async function adminLogin(email, pass) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  if (cred.user.email !== ADMIN_EMAIL) { await signOut(auth); throw new Error("not-admin"); }
  return cred.user;
}
export const adminLogout = () => signOut(auth);
export const onAdmin = cb => onAuthStateChanged(auth, u => cb(u && u.email === ADMIN_EMAIL ? u : null));
export async function changeAdminPassword(oldPass, newPass) {
  const u = auth.currentUser;
  if (!u) throw new Error("not-logged-in");
  await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, oldPass));
  await updatePassword(u, newPass);
}
