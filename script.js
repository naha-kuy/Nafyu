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

var saved = localStorage.getItem(AUTH_KEY);
if (saved && Date.now() < Number(saved)) {
  openIndex();
}

lockForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (passInput.value.trim().toLowerCase() === PASS.toLowerCase()) {
    localStorage.setItem(AUTH_KEY, String(nextFridayWIB(Date.now())));
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

var state = { q: "", tipe: "1" };
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

function favSources(domain) {
  return [
    "https://icon.horse/icon/" + domain,
    "https://www.google.com/s2/favicons?domain=" + domain + "&sz=64"
  ];
}

function placeFav(ico, letter, domain) {
  ico.appendChild(letter);
  var urls = favSources(domain);
  var idx = 0;
  function tryNext() {
    if (idx >= urls.length) return;
    var img = new Image();
    img.className = "card-fav";
    img.setAttribute("alt", "");
    img.addEventListener("load", function () {
      ico.innerHTML = "";
      ico.appendChild(img);
    });
    img.addEventListener("error", function () {
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
  a.style.animationDelay = i * 40 + "ms";

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
  arrow.textContent = "->";

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
  tp.textContent = TYPE_LABEL[s.tipe] || s.tipe;
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

function render() {
  var q = state.q.toLowerCase();
  var list = SITES.filter(function (s) {
    return (state.tipe === "1" || s.tipe === state.tipe) &&
      (s.nama + " " + s.url + " " + s.tag).toLowerCase().indexOf(q) !== -1;
  });

  counterEl.textContent = list.length === 0
    ? "tidak ada tautan yang cocok"
    : "menampilkan " + list.length + " dari " + SITES.length + " tautan";

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