/* =========================================================
   ATHENA — shoe store
   Products, filters, quick view, wishlist and bag (saved
   in localStorage so it survives a page refresh).
   ========================================================= */

// ---------- Sneaker illustration ----------
// Draws a side-profile sneaker as SVG in any colourway.
function shoeSVG({ upper, sole, accent, lace = "#ffffff", midsole = "#ffffff" }) {
  return `
  <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="200" cy="205" rx="170" ry="9" fill="rgba(0,0,0,.12)"/>
    <!-- outsole -->
    <path d="M28 168 Q24 190 52 192 L352 192 Q384 190 382 166 L378 158 L30 158 Z" fill="${sole}"/>
    <!-- midsole -->
    <path d="M30 150 Q26 172 56 176 L348 176 Q380 174 378 150 Q376 140 360 140 L40 140 Q30 140 30 150 Z" fill="${midsole}"/>
    <path d="M70 160 L330 160" stroke="rgba(0,0,0,.08)" stroke-width="3"/>
    <!-- upper -->
    <path d="M40 142 Q36 104 70 92 Q120 80 150 62 Q172 46 196 40 L236 34 Q256 32 262 50 L276 92
             Q300 96 330 104 Q370 116 376 142 Z" fill="${upper}"/>
    <!-- heel counter -->
    <path d="M262 50 Q268 40 286 42 Q300 46 298 70 L294 100 Q284 96 276 92 Z" fill="${accent}" opacity=".9"/>
    <!-- toe cap -->
    <path d="M40 142 Q36 112 62 100 Q90 96 104 114 Q110 130 104 142 Z" fill="rgba(0,0,0,.12)"/>
    <!-- swoosh-style Athena wing -->
    <path d="M86 132 Q170 132 250 100 Q300 80 346 72 Q300 96 258 120 Q200 148 120 142 Q96 140 86 132 Z" fill="${accent}"/>
    <!-- eyestay + laces -->
    <path d="M150 64 Q190 74 232 60" stroke="rgba(0,0,0,.18)" stroke-width="16" fill="none" stroke-linecap="round"/>
    <g stroke="${lace}" stroke-width="5" stroke-linecap="round">
      <path d="M160 60 L176 76"/><path d="M178 54 L194 70"/><path d="M196 48 L212 64"/><path d="M214 44 L228 58"/>
    </g>
    <!-- tongue -->
    <path d="M226 36 Q246 18 262 30 L262 50 Z" fill="${upper}" stroke="rgba(0,0,0,.15)" stroke-width="2"/>
    <!-- pull tab -->
    <rect x="290" y="44" width="8" height="22" rx="3" fill="${accent}"/>
    <!-- Athena A logo on heel -->
    <path d="M300 128 L312 108 L324 128 L318 128 L312 118 L306 128 Z" fill="${lace}" opacity=".9"/>
  </svg>`;
}

// ---------- Product catalogue ----------
const products = [
  { id: 1, name: "Athena Aegis Runner", cat: "running", gender: ["men", "women"], price: 180, isNew: true, rank: 1,
    colors: { upper: "#111111", sole: "#ff4d00", accent: "#ff4d00", midsole: "#f2f2f2" },
    desc: "Our flagship racer. Olympus Foam and a carbon-infused plate deliver explosive propulsion for race day." },
  { id: 2, name: "Athena Free Glide", cat: "running", gender: ["women"], price: 130, rank: 4,
    colors: { upper: "#f4c6d0", sole: "#d1677f", accent: "#ffffff", midsole: "#ffffff" },
    desc: "Soft, flexible and breathable. A daily trainer that makes easy miles feel even easier." },
  { id: 3, name: "Athena Spartan Trainer", cat: "training", gender: ["men"], price: 120, oldPrice: 150, rank: 3,
    colors: { upper: "#3a3a3a", sole: "#111111", accent: "#c9a227", midsole: "#1f1f1f", lace: "#c9a227" },
    desc: "Flat, stable base for heavy lifts with a grippy outsole for HIIT and agility work." },
  { id: 4, name: "Athena Olympus High", cat: "basketball", gender: ["men", "women"], price: 160, isNew: true, rank: 2,
    colors: { upper: "#1f3fd1", sole: "#ffffff", accent: "#ffffff", midsole: "#ffffff" },
    desc: "Lockdown support and court-gripping traction. Built to rise above the rim." },
  { id: 5, name: "Athena Classic Owl", cat: "lifestyle", gender: ["men", "women"], price: 95, rank: 5,
    colors: { upper: "#ffffff", sole: "#e8dcc0", accent: "#111111", midsole: "#ffffff", lace: "#111111" },
    desc: "A clean leather icon inspired by the terraces. Goes with everything, every day." },
  { id: 6, name: "Athena Pegasus Trail", cat: "running", gender: ["men"], price: 145, oldPrice: 165, rank: 7,
    colors: { upper: "#4d5a2f", sole: "#2a2a2a", accent: "#ff7a2f", midsole: "#d9cfb3" },
    desc: "Rugged lugs and a rock plate for when the road ends and the mountain begins." },
  { id: 7, name: "Athena Little Hero", cat: "lifestyle", gender: ["kids"], price: 60, isNew: true, rank: 6,
    colors: { upper: "#ffcf2e", sole: "#3762ff", accent: "#3762ff", midsole: "#ffffff" },
    desc: "Easy on, easy off, built to survive the playground. Big style for small feet." },
  { id: 8, name: "Athena Victory Court", cat: "basketball", gender: ["kids"], price: 75, oldPrice: 90, rank: 9,
    colors: { upper: "#d30005", sole: "#111111", accent: "#ffffff", midsole: "#ffffff" },
    desc: "Grade-school hoops shoe with cushioning that keeps up with every crossover." },
  { id: 9, name: "Athena Goddess Gold", cat: "lifestyle", gender: ["women"], price: 140, isNew: true, rank: 8,
    colors: { upper: "#f6efe0", sole: "#c9a227", accent: "#c9a227", midsole: "#f6efe0", lace: "#c9a227" },
    desc: "Premium suede, metallic gold details, and a platform midsole that turns heads." },
  { id: 10, name: "Athena Titan Lift", cat: "training", gender: ["women"], price: 110, rank: 10,
    colors: { upper: "#6a3cc8", sole: "#111111", accent: "#e5ff3a", midsole: "#ffffff" },
    desc: "A raised heel and rigid sole for deeper squats and confident Olympic lifts." },
  { id: 11, name: "Athena Hermes Sprint", cat: "running", gender: ["men", "women"], price: 99, oldPrice: 140, rank: 11,
    colors: { upper: "#00b3a4", sole: "#0b3d3a", accent: "#111111", midsole: "#ffffff" },
    desc: "Lightweight speed shoe for tempo runs and track sessions. Named for the fastest god." },
  { id: 12, name: "Athena Retro '86", cat: "lifestyle", gender: ["men"], price: 85, oldPrice: 110, rank: 12,
    colors: { upper: "#0e2a55", sole: "#e8dcc0", accent: "#d30005", midsole: "#f3f0e7" },
    desc: "Throwback runner silhouette with a gum sole and archive-inspired colour blocking." },
];

const SIZES = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13];
const money = n => `$${n.toFixed(2)}`;
const catLabel = p => `${p.gender.map(g => g[0].toUpperCase() + g.slice(1)).join(" & ")}'s ${p.cat[0].toUpperCase() + p.cat.slice(1)} Shoes`;

// ---------- Storage helpers ----------
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};

let cart = store.get("athena-cart", []);
let wishlist = store.get("athena-wish", []);
let filter = "all";
let query = "";
let sortBy = "featured";

// ---------- DOM ----------
const $ = sel => document.querySelector(sel);
const grid = $("#grid");

// ---------- Render products ----------
function visibleProducts() {
  let list = products.filter(p => {
    const matchFilter =
      filter === "all" ||
      p.cat === filter ||
      p.gender.includes(filter) ||
      (filter === "sale" && p.oldPrice);
    const q = query.trim().toLowerCase();
    const matchQuery = !q || `${p.name} ${p.cat} ${p.gender.join(" ")}`.toLowerCase().includes(q);
    return matchFilter && matchQuery;
  });
  if (sortBy === "low") list.sort((a, b) => a.price - b.price);
  else if (sortBy === "high") list.sort((a, b) => b.price - a.price);
  else if (sortBy === "new") list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.rank - b.rank);
  else list.sort((a, b) => a.rank - b.rank);
  return list;
}

function priceHTML(p) {
  if (!p.oldPrice) return `${money(p.price)}`;
  const off = Math.round((1 - p.price / p.oldPrice) * 100);
  return `${money(p.price)}<s>${money(p.oldPrice)}</s><span class="off">${off}% off</span>`;
}

function renderGrid() {
  const list = visibleProducts();
  $("#result-count").textContent = `(${list.length})`;
  $("#empty").hidden = list.length > 0;
  grid.innerHTML = list.map(p => `
    <article class="card" data-id="${p.id}" tabindex="0" aria-label="${p.name}">
      <div class="card-img">
        ${p.oldPrice ? '<span class="tag sale">SALE</span>' : p.isNew ? '<span class="tag new">JUST IN</span>' : ""}
        <button class="wish ${wishlist.includes(p.id) ? "on" : ""}" data-wish="${p.id}" aria-label="Add ${p.name} to wishlist">
          <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
        </button>
        ${shoeSVG(p.colors)}
        <button class="quick" data-quick="${p.id}">Quick View</button>
      </div>
      <div class="card-info">
        ${p.isNew ? '<p class="flag">Just In</p>' : p.oldPrice ? '<p class="flag" style="color:var(--sale)">Sale</p>' : ""}
        <h3>${p.name}</h3>
        <p class="sub">${catLabel(p)}</p>
        <p class="colors">1 Colour</p>
        <p class="price">${priceHTML(p)}</p>
      </div>
    </article>`).join("");
}

function setFilter(f) {
  filter = f;
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.filter === f));
  renderGrid();
}

// ---------- Quick view modal ----------
let current = null;
let chosenSize = null;
const modal = $("#modal");

function openModal(id) {
  current = products.find(p => p.id === id);
  chosenSize = null;
  $("#modal-img").innerHTML = shoeSVG(current.colors);
  $("#modal-cat").textContent = catLabel(current);
  $("#modal-title").textContent = current.name;
  $("#modal-price").innerHTML = priceHTML(current);
  $("#modal-desc").textContent = current.desc;
  $("#sizes").innerHTML = SIZES.map(s => `<button class="size" data-size="${s}">${s}</button>`).join("");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $("#close-modal").focus();
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

// ---------- Cart ----------
function saveCart() { store.set("athena-cart", cart); renderCart(); }

function addToCart(id, size) {
  const existing = cart.find(i => i.id === id && i.size === size);
  if (existing) existing.qty++;
  else cart.push({ id, size, qty: 1 });
  saveCart();
}

function renderCart() {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const countEl = $("#cart-count");
  countEl.textContent = count;
  countEl.classList.toggle("empty", count === 0);

  const items = $("#drawer-items");
  if (!cart.length) {
    items.innerHTML = `<p class="drawer-empty">Your bag is empty.<br>Time to find your next pair.</p>`;
  } else {
    items.innerHTML = cart.map((i, idx) => {
      const p = products.find(x => x.id === i.id);
      return `
        <div class="line-item">
          <div class="line-img">${shoeSVG(p.colors)}</div>
          <div>
            <h4>${p.name}</h4>
            <p class="meta">Size ${i.size}</p>
            <div class="qty">
              <button data-dec="${idx}" aria-label="Decrease quantity">−</button>
              <span>${i.qty}</span>
              <button data-inc="${idx}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove" data-remove="${idx}">Remove</button>
          </div>
          <strong>${money(p.price * i.qty)}</strong>
        </div>`;
    }).join("");
  }
  const subtotal = cart.reduce((sum, i) => sum + products.find(p => p.id === i.id).price * i.qty, 0);
  $("#subtotal").textContent = money(subtotal);
  $("#shipping").textContent = subtotal === 0 || subtotal >= 75 ? "Free" : money(8);
  $("#checkout").disabled = cart.length === 0;
}

function openDrawer() { $("#drawer").classList.add("open"); $("#overlay").classList.add("show"); }
function closeDrawer() { $("#drawer").classList.remove("open"); $("#overlay").classList.remove("show"); }

// ---------- Wishlist ----------
function renderWishCount() {
  const el = $("#wish-count");
  el.textContent = wishlist.length;
  el.classList.toggle("empty", wishlist.length === 0);
}
function toggleWish(id) {
  wishlist = wishlist.includes(id) ? wishlist.filter(x => x !== id) : [...wishlist, id];
  store.set("athena-wish", wishlist);
  renderWishCount();
  renderGrid();
  toast(wishlist.includes(id) ? "Added to wishlist ♥" : "Removed from wishlist");
}

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- Events ----------
grid.addEventListener("click", e => {
  const wish = e.target.closest("[data-wish]");
  if (wish) { e.stopPropagation(); toggleWish(+wish.dataset.wish); return; }
  const card = e.target.closest(".card");
  if (card) openModal(+card.dataset.id);
});
grid.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.classList.contains("card")) openModal(+e.target.dataset.id);
});

$("#filters").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (chip) setFilter(chip.dataset.filter);
});
// Nav links, category tiles and banners that carry a data-filter
document.querySelectorAll("a[data-filter]").forEach(a =>
  a.addEventListener("click", () => {
    setFilter(a.dataset.filter);
    $("#nav").classList.remove("open");
  })
);

$("#search").addEventListener("input", e => {
  query = e.target.value;
  renderGrid();
});
$("#search").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});
$("#sort").addEventListener("change", e => { sortBy = e.target.value; renderGrid(); });

$("#sizes").addEventListener("click", e => {
  const btn = e.target.closest(".size");
  if (!btn) return;
  document.querySelectorAll(".size").forEach(s => s.classList.remove("active"));
  btn.classList.add("active");
  chosenSize = btn.dataset.size;
});
$("#add-to-bag").addEventListener("click", () => {
  if (!chosenSize) {
    const sizes = $("#sizes");
    sizes.classList.remove("shake");
    void sizes.offsetWidth;
    sizes.classList.add("shake");
    toast("Please select a size");
    return;
  }
  addToCart(current.id, chosenSize);
  closeModal();
  toast(`${current.name} (US ${chosenSize}) added to bag`);
  openDrawer();
});
$("#close-modal").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

$("#drawer-items").addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.inc) cart[+t.dataset.inc].qty++;
  else if (t.dataset.dec) {
    const i = +t.dataset.dec;
    if (--cart[i].qty <= 0) cart.splice(i, 1);
  } else if (t.dataset.remove) cart.splice(+t.dataset.remove, 1);
  else return;
  saveCart();
});

$("#cart-btn").addEventListener("click", openDrawer);
$("#close-drawer").addEventListener("click", closeDrawer);
$("#overlay").addEventListener("click", closeDrawer);
$("#checkout").addEventListener("click", () => {
  cart = [];
  saveCart();
  closeDrawer();
  toast("Order placed! Thanks for shopping Athena 🏆");
});

$("#wishlist-btn").addEventListener("click", () => {
  if (!wishlist.length) { toast("Your wishlist is empty"); return; }
  query = "";
  $("#search").value = "";
  setFilter("all");
  grid.querySelectorAll(".card").forEach(c => {
    if (!wishlist.includes(+c.dataset.id)) c.remove();
  });
  $("#result-count").textContent = `(${wishlist.length} saved)`;
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});

$("#menu-btn").addEventListener("click", () => $("#nav").classList.toggle("open"));

$("#newsletter").addEventListener("submit", e => {
  e.preventDefault();
  e.target.reset();
  toast("Welcome to Athena! Check your inbox for 10% off.");
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closeDrawer(); }
});

// ---------- Init ----------
$("#hero-shoe").innerHTML = shoeSVG({ upper: "#f2f2f2", sole: "#111111", accent: "#ff4d00", midsole: "#ffffff", lace: "#111111" });
$("#year").textContent = new Date().getFullYear();
renderGrid();
renderCart();
renderWishCount();
