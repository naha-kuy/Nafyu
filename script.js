var PASS = "Yuliana";
var AUTH_KEY = "nafyu_archive_expires";

var lockEl = document.getElementById("lock");
var lockCard = document.getElementById("lockCard");
var lockForm = document.getElementById("lockForm");
var passInput = document.getElementById("passInput");
var eyeBtn = document.getElementById("eyeBtn");
var lockError = document.getElementById("lockError");
var mainEl = document.getElementById("main");
var search = document.getElementById("search");
var chipsEl = document.getElementById("chips");
var counterEl = document.getElementById("counter");
var gridEl = document.getElementById("grid");

function nextFridayWIB(nowMs) {
  var WIB = 7 * 60 * 60 * 1000;
  var shifted = new Date(nowMs + WIB);
  var day = shifted.getUTCDay();
  var days = (5 - day + 7) % 7;
  if (days === 0) days = 7;
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + days) - WIB;
}

function openIndex() {
  passInput.value = "";
  lockEl.classList.add("hidden");
  mainEl.classList.remove("hidden");
  search.focus();
}

function storeCache(key, value) {
  try { localStorage.setItem(key, value); } catch (err) {}
}

function readCache(key) {
  try { return localStorage.getItem(key); } catch (err) { return null; }
}

var saved = readCache(AUTH_KEY);
if (saved && Date.now() < Number(saved)) {
  openIndex();
}

lockForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (passInput.value.trim().toLowerCase() === PASS.toLowerCase()) {
    storeCache(AUTH_KEY, String(nextFridayWIB(Date.now())));
    openIndex();
  } else {
    lockError.classList.add("show");
    lockCard.classList.remove("shake");
    void lockCard.offsetWidth;
    lockCard.classList.add("shake");
    passInput.select();
  }
});

eyeBtn.addEventListener("click", function () {
  var isHidden = passInput.type === "password";
  passInput.type = isHidden ? "text" : "password";
  eyeBtn.classList.toggle("visible", !isHidden);
  eyeBtn.setAttribute("aria-label", isHidden ? "Sembunyikan sandi" : "Tampilkan sandi");
  passInput.focus();
});

var SEMUA_ID = TIPES[0].id;
var state = { q: "", tipe: SEMUA_ID };
var chips = [];

var TYPE_LABEL = {};
TIPES.forEach(function (t) { TYPE_LABEL[t.id] = t.label; });

TIPES.forEach(function (t) {
  var b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = t.label;
  b.setAttribute("aria-pressed", "false");
  b.addEventListener("click", function () {
    state.tipe = t.id;
    render();
  });
  chips.push(b);
  chipsEl.appendChild(b);
});

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (err) {
    return "";
  }
}

function typesOf(s) {
  return Array.isArray(s.tipe) ? s.tipe : (s.tipe ? [s.tipe] : []);
}

function favSources(domain) {
  return [
    "https://icon.horse/icon/" + domain,
    "https://www.google.com/s2/favicons?domain=" + domain + "&sz=64"
  ];
}

var favCache = {};

function placeFav(ico, letter, domain) {
  ico.appendChild(letter);
  var urls = favSources(domain);
  if (favCache[domain]) {
    urls = [favCache[domain]].concat(urls.filter(function (u) { return u !== favCache[domain]; }));
  }
  var idx = 0;
  function tryNext() {
    if (idx >= urls.length) return;
    var img = new Image();
    img.className = "card-fav";
    img.decoding = "async";
    img.setAttribute("alt", "");
    img.referrerPolicy = "no-referrer";
    img.addEventListener("load", function () {
      if (!favCache[domain]) favCache[domain] = img.src;
      ico.innerHTML = "";
      ico.appendChild(img);
    });
    img.addEventListener("error", function () {
      if (favCache[domain]) {
        favCache[domain] = "";
        urls = favSources(domain);
        idx = -1;
      }
      idx++;
      tryNext();
    });
    img.src = urls[idx];
    idx++;
  }
  tryNext();
}

function buildCard(s, i) {
  var a = document.createElement("a");
  a.className = "card";
  a.href = s.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.style.animationDelay = Math.min(i * 40, 400) + "ms";

  if (s.url === "#") {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  }

  var top = document.createElement("div");
  top.className = "card-top";

  var ico = document.createElement("div");
  ico.className = "card-ico";

  var letter = document.createElement("span");
  letter.className = "card-letter";
  letter.textContent = s.nama.charAt(0).toUpperCase();

  var domain = domainOf(s.url);
  if (domain) {
    placeFav(ico, letter, domain);
  } else {
    ico.appendChild(letter);
  }

  var title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = s.nama;

  var arrow = document.createElement("span");
  arrow.className = "card-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>';

  top.appendChild(ico);
  top.appendChild(title);
  top.appendChild(arrow);

  var urlLine = document.createElement("p");
  urlLine.className = "card-url";
  urlLine.textContent = domain || "local://";

  var tags = document.createElement("div");
  tags.className = "card-tags";
  var tp = document.createElement("span");
  tp.className = "tag tag-type";
  var firstType = typesOf(s)[0] || "";
  tp.textContent = (firstType && TYPE_LABEL[firstType]) || firstType || "—";
  tags.appendChild(tp);
  s.tag.split(/[\s,]+/).forEach(function (t) {
    if (!t) return;
    var sp = document.createElement("span");
    sp.className = "tag";
    sp.textContent = t;
    tags.appendChild(sp);
  });

  a.appendChild(top);
  a.appendChild(urlLine);
  a.appendChild(tags);
  return a;
}

function sitePool() {
  if (state.tipe === SEMUA_ID) {
    return SITES.filter(function (s) { return s.showSemua !== false; });
  }
  return SITES.filter(function (s) { return typesOf(s).indexOf(state.tipe) !== -1; });
}

function render() {
  var q = state.q.toLowerCase();
  var pool = sitePool();
  var list = pool.filter(function (s) {
    return (s.nama + " " + s.url + " " + s.tag).toLowerCase().indexOf(q) !== -1;
  });

  counterEl.textContent = list.length === 0
    ? "tidak ada tautan yang cocok"
    : "menampilkan " + list.length + " dari " + pool.length + " tautan";

  chips.forEach(function (c, i) {
    var active = TIPES[i].id === state.tipe;
    c.classList.toggle("active", active);
    c.setAttribute("aria-pressed", String(active));
  });

  gridEl.innerHTML = "";
  if (list.length === 0) {
    var empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "// tidak ditemukan";
    gridEl.appendChild(empty);
    return;
  }
  list.forEach(function (s, i) {
    gridEl.appendChild(buildCard(s, i));
  });
}

search.addEventListener("input", function () {
  state.q = search.value.trim();
  render();
});

document.addEventListener("keydown", function (e) {
  var t = e.target;
  var typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
  if (e.key === "/" && !typing && mainEl.classList.contains("hidden") === false) {
    e.preventDefault();
    search.focus();
  }
  if (e.key === "Escape" && typing) {
    search.value = "";
    state.q = "";
    render();
  }
});

render();