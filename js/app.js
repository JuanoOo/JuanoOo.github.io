/* ===========================================================
   Moto Kapital — lógica del prototipo
   Depende de js/data.js (PRODUCTS, MODELOS, CATS, ...)
   =========================================================== */

/* ---------- iconografía propia por categoría ---------- */
const ICONS = {
  Motor:'<svg viewBox="0 0 24 24"><path d="M8 4h8M12 4v3"/><rect x="6" y="7" width="12" height="10" rx="2"/><path d="M6 12H3M18 12h3M9 21l1.5-4M15 21l-1.5-4"/></svg>',
  Traccion:'<svg viewBox="0 0 24 24"><circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M7 8h10M7 16h10"/></svg>',
  Frenos:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18"/></svg>',
  Llantas:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
  Lubricantes:'<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/></svg>',
  Filtros:'<svg viewBox="0 0 24 24"><path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"/></svg>',
  "Eléctrico":'<svg viewBox="0 0 24 24"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>'
};

/* ---------- utilidades ---------- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const cop  = n => "$ " + n.toLocaleString("es-CO");
const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const catLabel = c => CAT_LABEL[c] || c;
const waLink = msg => "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(msg);
const icon = c => ICONS[c] || ICONS.Motor;

function estado(p){
  if (AGOTADOS.includes(p.id)) return {k:"no",  t:"Agotado"};
  if (p.qty <= 10)             return {k:"ped", t:"Sobre pedido"};
  return {k:"ok", t:"Disponible"};
}

function cardHTML(p){
  const e = estado(p);
  return `<a class="card" href="#/p/${p.id}">
    <span class="thumb" aria-hidden="true">${icon(p.cat)}</span>
    <span class="cbody">
      <span class="nom">${p.nombre}</span>
      <span class="apl">${p.apl}</span>
      <span class="precio">${cop(p.precio)}</span>
      <span class="disp d-${e.k}"><i></i>${e.t}</span>
    </span></a>`;
}

/* ---------- estado de los filtros ---------- */
let F = {q:"", cat:"", marca:"", apl:""};

/* ---------- navegación móvil ---------- */
const navM = $("#nav-m"), burger = $("#burger");
function cerrarNav(){ navM.hidden = true; burger.setAttribute("aria-expanded","false"); }
burger.addEventListener("click", () => {
  const abierto = !navM.hidden;
  navM.hidden = abierto;
  burger.setAttribute("aria-expanded", String(!abierto));
});
navM.addEventListener("click", e => { if (e.target.closest("a")) cerrarNav(); });
document.addEventListener("click", e => {
  if (!navM.hidden && !e.target.closest("#nav-m") && !e.target.closest("#burger")) cerrarNav();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarNav(); });

/* ---------- portada ---------- */
function renderHome(){
  $("#cats").innerHTML = CATS.map(c =>
    `<a class="cat" href="#/catalogo?cat=${encodeURIComponent(c)}">${icon(c)}<span>${catLabel(c)}</span></a>`
  ).join("");

  const top = DESTACADOS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  $("#destacados").innerHTML = top.map(cardHTML).join("");

  const ms = $("#f-marca");
  if (ms.options.length === 1) MARCAS_MOTO.forEach(m => ms.add(new Option(m, m)));
}

$("#f-marca").addEventListener("change", e => {
  const md = $("#f-modelo");
  md.innerHTML = "";
  if (!e.target.value){
    md.disabled = true;
    md.add(new Option("Elige el modelo", ""));
    return;
  }
  md.disabled = false;
  md.add(new Option("Todos los modelos", ""));
  MODELOS[e.target.value].forEach(m => md.add(new Option(m, m)));
});

$("#finder").addEventListener("submit", e => {
  e.preventDefault();
  const marca = $("#f-marca").value, apl = $("#f-modelo").value;
  if (!marca){ $("#f-marca").focus(); return; }
  F = {q:"", cat:"", marca, apl};
  location.hash = "#/catalogo";
  renderCat();
});

/* ---------- catálogo ---------- */
function renderCat(){
  const cs = $("#c-cat"), ms = $("#c-marca");
  if (cs.options.length === 1) CATS.forEach(c => cs.add(new Option(catLabel(c), c)));
  if (ms.options.length === 1) MARCAS_MOTO.forEach(m => ms.add(new Option(m, m)));
  cs.value = F.cat; ms.value = F.marca; $("#c-q").value = F.q;

  $("#c-chip").innerHTML = F.apl
    ? `<button class="fchip" id="chip-x">Para <b>&nbsp;${F.apl}</b> &nbsp;✕</button>` : "";
  if (F.apl) $("#chip-x").onclick = () => { F.apl = ""; renderCat(); };

  const list = PRODUCTS.filter(p =>
    (!F.cat   || p.cat   === F.cat)   &&
    (!F.marca || p.marca === F.marca) &&
    (!F.apl   || p.apl   === F.apl)   &&
    (!F.q     || norm(p.nombre + " " + p.apl + " " + p.marca).includes(norm(F.q)))
  );

  $("#c-count").textContent = list.length === 1 ? "1 producto" : list.length + " productos";
  $("#c-grid").innerHTML = list.map(cardHTML).join("");
  $("#c-vacio").hidden = list.length > 0;
  if (!list.length){
    $("#wa-vacio").href = waLink("Hola Moto Kapital, busco: " + (F.q || F.apl || "un repuesto") + ". ¿Lo tienen disponible?");
  }
}

$("#c-q").addEventListener("input",  e => { F.q = e.target.value;      renderCat(); });
$("#c-cat").addEventListener("change", e => { F.cat = e.target.value;   renderCat(); });
$("#c-marca").addEventListener("change", e => { F.marca = e.target.value; renderCat(); });

$$(".hsearch").forEach(form => form.addEventListener("submit", e => {
  e.preventDefault();
  F = {q: form.querySelector("input").value, cat:"", marca:"", apl:""};
  location.hash = "#/catalogo";
  renderCat();
}));

/* ---------- ficha de producto ---------- */
function renderProd(id){
  const p = PRODUCTS.find(x => x.id === id);
  if (!p){ location.hash = "#/catalogo"; return; }
  const e = estado(p);

  $("#p-crumbs").innerHTML = `<a href="#/">Inicio</a> / <a href="#/catalogo">Catálogo</a> / ${catLabel(p.cat)}`;
  $("#p-img").innerHTML = icon(p.cat) + "<span>Foto del producto en camino</span>";
  $("#p-marca").textContent = p.marca + " · " + catLabel(p.cat);
  $("#p-nombre").textContent = p.nombre;

  const compat = p.apl.split(/[,/]| y /).map(s => s.trim()).filter(Boolean);
  $("#p-chips").innerHTML = `<span class="clabel">Sirve para:</span>` + compat.map(c => `<b>${c}</b>`).join("");

  $("#p-precio").innerHTML = cop(p.precio) + "<small>Precio de mostrador, IVA incluido</small>";
  $("#p-disp").className = "disp d-" + e.k;
  $("#p-disp").innerHTML = "<i></i>" + e.t + (e.k === "ped" ? " · llega en 2 a 4 días" : "");

  const btn = $("#p-wa");
  if (e.k === "no"){
    btn.classList.add("off"); btn.removeAttribute("href");
    $("#p-wa-txt").textContent = "Avisarme cuando llegue";
  } else {
    btn.classList.remove("off");
    $("#p-wa-txt").textContent = "Pedir por WhatsApp";
    btn.href = waLink(`Hola Moto Kapital, quiero pedir: ${p.nombre} (${p.apl}) — ${cop(p.precio)}. ¿Está disponible?`);
  }

  $("#p-rel").innerHTML = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0,4).map(cardHTML).join("");
  window.scrollTo(0,0);
}

/* ---------- enrutador ---------- */
function marcarNav(clave){
  $$("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === clave));
}

function route(){
  const h = location.hash || "#/";
  cerrarNav();
  $$(".view").forEach(v => v.classList.remove("on"));

  if (h.startsWith("#/p/")){
    $("#v-prod").classList.add("on");
    marcarNav("");
    renderProd(h.slice(4));
  } else if (h.startsWith("#/catalogo")){
    const q = new URLSearchParams(h.split("?")[1] || "");
    if (q.get("cat")) F = {q:"", cat:q.get("cat"), marca:"", apl:""};
    $("#v-cat").classList.add("on");
    marcarNav("cat");
    renderCat();
    window.scrollTo(0,0);
  } else {
    $("#v-home").classList.add("on");
    marcarNav("home");
    renderHome();
    const ancla = h.split("#").pop();
    if (["mayoristas","promos","contacto"].includes(ancla)){
      const el = document.getElementById(ancla);
      if (el) setTimeout(() => el.scrollIntoView({behavior:"smooth", block:"start"}), 60);
    } else {
      window.scrollTo(0,0);
    }
  }
}

/* ---------- enlaces de WhatsApp fijos ---------- */
$("#wa-fab").href   = waLink("Hola Moto Kapital, quisiera hacer una consulta.");
$("#wa-mayor").href = waLink("Hola Moto Kapital, tengo un almacén o taller y quiero la lista de precios al por mayor.");
$$(".wa-mayor-link").forEach(a => a.href = $("#wa-mayor").href);

window.addEventListener("hashchange", route);
route();
