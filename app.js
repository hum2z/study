/* Study — offline revision tracker.
   Three tabs, with subject detail pushed on top of the Subjects tab. */

const STORE = "study-tracker-v1";
const DEFAULT_DATES = {
  ielts: "2026-09-29",   // IELTS test
  mock:  "2026-11-02",   // Mock 1, first week of November
  final: "2027-05-03"    // May/June exam series
};
const CD_META = [
  { key: "ielts", label: "IELTS",    colour: "var(--yellow)" },
  { key: "mock",  label: "Mock 1",   colour: "var(--orange)" },
  { key: "final", label: "May/June", colour: "var(--blue)"   }
];

/* ---------------------------------------------------------------- state */
let state = load();
let tab = "home";
let openChapters = new Set();

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE));
    if (raw && raw.marks) return {
      dates: { ...DEFAULT_DATES, ...(raw.dates || {}) },
      marks: raw.marks,
      theme: raw.theme || "auto"
    };
  } catch (e) { /* corrupt or unavailable — start fresh */ }
  return { dates: { ...DEFAULT_DATES }, marks: {}, theme: "auto" };
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
}

const keyOf = (s, c, i) => `${s}:${c}:${i}`;
const mark = k => state.marks[k] || { l: false, r: false };
const el = document.getElementById.bind(document);
const esc = s => String(s).replace(/[&<>"]/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------------------------------------------------------------- theme */
function applyTheme() {
  const t = state.theme || "auto";
  const root = document.documentElement;
  if (t === "auto") delete root.dataset.theme; else root.dataset.theme = t;

  const dark = t === "dark" ||
    (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#000000" : "#EFEFF4";

  document.querySelectorAll("[data-theme-set]").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.themeSet === t));
}
matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => { if ((state.theme || "auto") === "auto") applyTheme(); });

/* ---------------------------------------------------------------- dates */
const midnight = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
function daysUntil(iso) {
  if (!iso) return null;
  const t = midnight(iso + "T00:00:00");
  return isNaN(t) ? null : Math.round((t - midnight(new Date())) / 86400000);
}
const fmtDate = iso => new Date(iso + "T00:00:00")
  .toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/* ------------------------------------------------------------- progress */
function subjectStats(subj) {
  let total = 0, learnt = 0, revised = 0, chapters = 0, chaptersDone = 0;
  for (const g of subj.groups) for (const ch of g.chapters) {
    chapters++;
    let done = 0;
    ch.subs.forEach((_, i) => {
      total++;
      const m = mark(keyOf(subj.id, ch.n, i));
      if (m.l) { learnt++; done++; }
      if (m.r) revised++;
    });
    if (done === ch.subs.length) chaptersDone++;
  }
  return { total, learnt, revised, chapters, chaptersDone,
           pct: total ? Math.round(learnt / total * 100) : 0 };
}
const overall = () => SYLLABUS.reduce((a, s) => {
  const st = subjectStats(s);
  a.total += st.total; a.learnt += st.learnt; a.revised += st.revised;
  a.chapters += st.chapters; a.chaptersDone += st.chaptersDone;
  return a;
}, { total: 0, learnt: 0, revised: 0, chapters: 0, chaptersDone: 0 });

/* ------------------------------------------------------------ fragments */
function countdownStrip() {
  return `<div class="cds">` + CD_META.map(m => {
    const iso = state.dates[m.key], d = daysUntil(iso), past = d !== null && d < 0;
    return `<div class="cd card ${past ? "past" : ""}" style="--c:${m.colour}">
      <div class="lab">${m.label}</div>
      <div class="num">${d === null ? "—" : past ? "✓" : d}</div>
      <div class="unit">${d === null ? "no date" : past ? "done" : d === 1 ? "day left" : "days left"}</div>
      <div class="date">${iso ? fmtDate(iso) : ""}</div>
    </div>`;
  }).join("") + `</div>`;
}

function ring(pct, colour = "var(--blue)") {
  const R = 40, C = 2 * Math.PI * R;
  return `<div class="ring">
    <svg viewBox="0 0 92 92">
      <circle class="trk" cx="46" cy="46" r="${R}"/>
      <circle class="val" cx="46" cy="46" r="${R}" style="stroke:${colour};
        stroke-dasharray:${C};stroke-dashoffset:${C * (1 - pct / 100)}"/>
    </svg><b>${pct}%</b></div>`;
}

const initials = s => s.short || s.name.slice(0, 2).toUpperCase();

function subjectRows() {
  return `<div class="card">` + SYLLABUS.map(s => {
    const st = subjectStats(s);
    return `<button class="row" data-open="${s.id}" style="--c:${s.colour}">
      <span class="tile">${initials(s)}</span>
      <span class="row-main">
        <b>${esc(s.name)}</b>
        <span>${st.chaptersDone}/${st.chapters} chapters · ${st.total - st.learnt} topics left</span>
      </span>
      <span class="badge">${st.pct}%</span>
      <svg class="ico chev"><use href="#i-chevron"/></svg>
    </button>`;
  }).join("") + `</div>`;
}

/* ------------------------------------------------------------- screens */
function screenHome() {
  const o = overall();
  const left = o.total - o.learnt;
  const pct = o.total ? Math.round(o.learnt / o.total * 100) : 0;
  const dMock = daysUntil(state.dates.mock);
  const pace = (dMock && dMock > 0 && left > 0) ? (left / dMock).toFixed(1) : "0";

  return `<div class="screen-in">
    <h1 class="large-title">Study</h1>
    <p class="large-sub">${new Date().toLocaleDateString(undefined,
      { weekday: "long", day: "numeric", month: "long" })}</p>
  </div>
  ${countdownStrip()}
  <div class="screen-in">
    <div class="hero card">
      ${ring(pct)}
      <div class="hero-txt">
        <h2>${o.learnt} of ${o.total}</h2>
        <p>topics learnt · ${o.revised} revised</p>
        <div class="pace"><b>${pace}</b><span>a day to finish by Mock 1</span></div>
      </div>
    </div>
    <div class="sec-hdr">Subjects</div>
    ${subjectRows()}
    <p class="note">Tap a subject to tick off chapters. Everything is stored on this
      phone and works with no signal.</p>
  </div>`;
}

function screenSubjects() {
  const o = overall();
  return `<div class="screen-in">
    <h1 class="large-title">Subjects</h1>
    <p class="large-sub">${o.chaptersDone} of ${o.chapters} chapters complete</p>
    <div class="sec-hdr">All subjects</div>
    ${subjectRows()}
  </div>`;
}

function screenSubject(subj) {
  const st = subjectStats(subj);
  let html = `<div class="screen-in">
    <h1 class="large-title">${esc(subj.name)}</h1>
    <p class="large-sub">${esc(subj.code)}</p>
    <div class="hero card" style="--c:${subj.colour}">
      ${ring(st.pct, subj.colour)}
      <div class="hero-txt">
        <h2>${st.learnt} of ${st.total}</h2>
        <p>learnt · ${st.chaptersDone}/${st.chapters} chapters</p>
        <div class="pace"><b>${st.revised}</b><span>revised</span></div>
      </div>
    </div>`;

  for (const g of subj.groups) {
    html += `<div class="sec-hdr">${esc(g.name)}</div><div class="card">`;
    for (const ch of g.chapters) {
      const id = `${subj.id}:${ch.n}`;
      const ms = ch.subs.map((_, i) => mark(keyOf(subj.id, ch.n, i)));
      const done = ms.filter(m => m.l).length;
      const all = done === ch.subs.length;
      const open = openChapters.has(id);

      html += `<div class="ch ${all ? "done" : ""} ${open ? "open" : ""}"
                    style="--c:${subj.colour}" data-ch="${esc(id)}">
        <button class="row ch-head" data-toggle="${esc(id)}">
          <span class="num">${esc(ch.n)}</span>
          <span class="row-main">
            <b>${esc(ch.t)}</b>
            <span>${done}/${ch.subs.length} learnt</span>
          </span>
          <svg class="ico chev"><use href="#i-chevron"/></svg>
        </button>
        <div class="ch-body">` +
        ch.subs.map((s, i) => {
          const k = keyOf(subj.id, ch.n, i), m = ms[i];
          return `<div class="topic ${m.l ? "learnt" : ""}">
            <button class="tick" data-k="${k}" data-f="l" aria-pressed="${m.l}"
              aria-label="Learnt"><svg class="ico"><use href="#i-check"/></svg></button>
            <p>${esc(s)}</p>
            <button class="star" data-k="${k}" data-f="r" aria-pressed="${m.r}"
              aria-label="Revised"><svg class="ico"><use href="#i-star"/></svg></button>
          </div>`;
        }).join("") +
        `<div class="ch-acts">
          <button data-bulk="l" data-subj="${subj.id}" data-chn="${esc(ch.n)}">All learnt</button>
          <button data-bulk="r" data-subj="${subj.id}" data-chn="${esc(ch.n)}">All revised</button>
          <button class="warn" data-bulk="clear" data-subj="${subj.id}" data-chn="${esc(ch.n)}">Clear</button>
        </div></div>
      </div>`;
    }
    html += `</div>`;
  }
  return html + `</div>`;
}

function screenSettings() {
  const dateRow = (k, label) => `<div class="row plain">
      <span class="row-main"><b>${label}</b></span>
      <input type="date" data-date="${k}" value="${state.dates[k] || ""}">
    </div>`;
  return `<div class="screen-in">
    <h1 class="large-title">Settings</h1>

    <div class="sec-hdr">Appearance</div>
    <div class="seg">
      <button data-theme-set="auto">Auto</button>
      <button data-theme-set="light">Light</button>
      <button data-theme-set="dark">Dark</button>
    </div>

    <div class="sec-hdr">Exam dates</div>
    <div class="card">
      ${dateRow("ielts", "IELTS")}
      ${dateRow("mock", "Mock 1")}
      ${dateRow("final", "May/June")}
    </div>

    <div class="sec-hdr">Your data</div>
    <div class="card">
      <button class="act-row" id="exportBtn">Export backup</button>
      <button class="act-row" id="importBtn">Import backup</button>
      <button class="act-row danger" id="resetBtn">Reset all progress</button>
    </div>
    <p class="note">Progress lives on this phone only. Export a backup before you
      clear Safari's data, or to move it to another device.</p>
  </div>`;
}

/* ------------------------------------------------------------ rendering */
const TITLES = { home: "Study", subjects: "Subjects", settings: "Settings" };
let current = null;          // the live .screen element
let currentSubject = null;   // subject id when a detail screen is on top

function bodyFor(view) {
  if (view === "home") return screenHome();
  if (view === "subjects") return screenSubjects();
  if (view === "settings") return screenSettings();
  return screenSubject(SYLLABUS.find(s => s.id === view));
}
function titleFor(view) {
  return TITLES[view] || (SYLLABUS.find(s => s.id === view) || {}).name || "";
}

function makeScreen(view) {
  const s = document.createElement("section");
  s.className = "screen";
  s.dataset.view = view;
  s.innerHTML = bodyFor(view);
  s.addEventListener("scroll", () => { if (s === current) syncNav(); }, { passive: true });
  return s;
}

function syncNav() {
  el("nav").classList.toggle("solid", !!current && current.scrollTop > 24);
  el("navCompact").textContent = titleFor(current ? current.dataset.view : tab);
}

/* Replace the visible screen with no animation (tab switches). */
function show(view) {
  const s = makeScreen(view);
  el("stack").replaceChildren(s);
  current = s;
  currentSubject = null;
  el("backBtn").hidden = true;
  applyTheme();
  syncNav();
}

/* Slide a subject detail in over the current screen. */
function push(subjectId) {
  const from = current;
  const s = makeScreen(subjectId);
  s.classList.add("push-enter");
  el("stack").appendChild(s);
  current = s;
  currentSubject = subjectId;

  el("backLabel").textContent = titleFor(from ? from.dataset.view : "subjects");
  el("backBtn").hidden = false;
  applyTheme();

  requestAnimationFrame(() => requestAnimationFrame(() => {
    s.classList.add("push-active", "push-done");
    if (from) { from.classList.add("push-active", "push-behind"); }
    setTimeout(() => { if (from && from.parentNode) from.remove(); syncNav(); }, 440);
  }));
  syncNav();
}

function pop() {
  if (!currentSubject) return;
  const leaving = current;
  const s = makeScreen(tab);
  s.classList.add("push-active", "push-behind");
  el("stack").insertBefore(s, leaving);
  current = s;
  currentSubject = null;
  el("backBtn").hidden = true;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    s.classList.remove("push-behind");
    leaving.classList.add("push-active");
    leaving.classList.remove("push-done");
    leaving.classList.add("push-enter");
    setTimeout(() => { if (leaving.parentNode) leaving.remove(); syncNav(); }, 440);
  }));
  applyTheme();
  syncNav();
}

/* Re-render in place, preserving scroll — used after every tick. */
function refresh() {
  if (!current) return;
  const y = current.scrollTop;
  current.innerHTML = bodyFor(current.dataset.view);
  current.scrollTop = y;
  applyTheme();
  syncNav();
}

function setTab(t) {
  tab = t;
  document.querySelectorAll(".tabbtn").forEach(b =>
    b.setAttribute("aria-selected", b.dataset.go === t));
  show(t);
}

/* --------------------------------------------------------- interactions */
document.addEventListener("click", e => {
  const t = e.target.closest.bind(e.target);

  const tabBtn = t("[data-go]");
  if (tabBtn) { setTab(tabBtn.dataset.go); return; }

  if (t("#backBtn")) { pop(); return; }

  const open = t("[data-open]");
  if (open) { push(open.dataset.open); return; }

  const toggle = t("[data-toggle]");
  if (toggle) {
    const id = toggle.dataset.toggle;
    openChapters.has(id) ? openChapters.delete(id) : openChapters.add(id);
    toggle.closest(".ch").classList.toggle("open");
    return;
  }

  const tick = t("[data-k]");
  if (tick) {
    const k = tick.dataset.k, f = tick.dataset.f, m = { ...mark(k) };
    m[f] = !m[f];
    if (f === "r" && m.r) m.l = true;     // revising implies learnt
    if (f === "l" && !m.l) m.r = false;   // un-learning clears the star
    state.marks[k] = m;
    save(); refresh();
    return;
  }

  const bulk = t("[data-bulk]");
  if (bulk) {
    const { bulk: mode, subj: sid, chn } = bulk.dataset;
    const s = SYLLABUS.find(x => x.id === sid);
    const ch = s.groups.flatMap(g => g.chapters).find(c => c.n === chn);
    ch.subs.forEach((_, i) => {
      const k = keyOf(sid, chn, i);
      if (mode === "clear") delete state.marks[k];
      else if (mode === "l") state.marks[k] = { ...mark(k), l: true };
      else state.marks[k] = { l: true, r: true };
    });
    save(); refresh();
    return;
  }

  const th = t("[data-theme-set]");
  if (th) { state.theme = th.dataset.themeSet; save(); applyTheme(); return; }

  if (t("#exportBtn")) return doExport();
  if (t("#importBtn")) return el("importFile").click();
  if (t("#resetBtn")) return doReset();
});

document.addEventListener("change", e => {
  const d = e.target.closest("[data-date]");
  if (!d) return;
  state.dates[d.dataset.date] = d.value || DEFAULT_DATES[d.dataset.date];
  save();
});

/* ----------------------------------------------------------- data files */
function toast(msg) {
  const n = document.createElement("div");
  n.className = "toast"; n.textContent = msg;
  document.body.appendChild(n);
  requestAnimationFrame(() => n.classList.add("show"));
  setTimeout(() => { n.classList.remove("show"); setTimeout(() => n.remove(), 400); }, 2000);
}
function doExport() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `study-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
el("importFile").onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data.marks) throw new Error("bad file");
    state = {
      dates: { ...DEFAULT_DATES, ...(data.dates || {}) },
      marks: data.marks,
      theme: data.theme || state.theme || "auto"
    };
    save(); refresh(); toast("Backup restored");
  } catch (err) { toast("Could not read that file"); }
  e.target.value = "";
};
function doReset() {
  if (!confirm("Clear all ticks and reset dates? This cannot be undone.")) return;
  state = { dates: { ...DEFAULT_DATES }, marks: {}, theme: state.theme || "auto" };
  openChapters.clear();
  save(); refresh(); toast("Progress reset");
}

/* ------------------------------------------------------------------ PWA */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
setInterval(() => { if (current && current.dataset.view === "home") refresh(); }, 60000);

applyTheme();
setTab("home");
