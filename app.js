/* study — offline revision tracker, dressed as a terminal.
   Three slash-command tabs, with a subject detail pushed over /subjects. */

const STORE = "study-tracker-v1";
const DEFAULT_DATES = {
  ielts: "2026-09-29",   // IELTS test
  mock:  "2026-11-02",   // Mock 1, first week of November
  final: "2027-05-03"    // May/June exam series
};
const CD_META = [
  { key: "ielts", label: "ielts",    colour: "var(--teal)"   },
  { key: "mock",  label: "mock-1",   colour: "var(--accent)" },
  { key: "final", label: "may-june", colour: "var(--blue)"   }
];

/* Subject colours live in syllabus.js as hex. Map them onto theme variables
   so they track light/dark instead of staying fixed. */
const HUE = {
  "#6a9bcc": "var(--blue)",  "#d97757": "var(--accent)",
  "#788c5d": "var(--green)", "#9a7aa4": "var(--plum)",
  "#bf9243": "var(--gold)",  "#5f938c": "var(--teal)"
};
const hue = s => HUE[String(s.colour).toLowerCase()] || "var(--accent)";

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
    (t === "auto" && !matchMedia("(prefers-color-scheme: light)").matches);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === "grok" ? "#000000" : dark ? "#1a1917" : "#faf9f5";

  document.querySelectorAll("[data-theme-set]").forEach(b =>
    b.setAttribute("aria-pressed", b.dataset.themeSet === t));
}
matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", () => { if ((state.theme || "auto") === "auto") applyTheme(); });

/* ---------------------------------------------------------------- dates */
const midnight = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
function daysUntil(iso) {
  if (!iso) return null;
  const t = midnight(iso + "T00:00:00");
  return isNaN(t) ? null : Math.round((t - midnight(new Date())) / 86400000);
}
/* Fixed 11-character date, so the countdown column never reflows on a
   locale that spells things differently. */
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

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
/* A progress bar drawn out of block characters, the way a CLI would. */
function bar(pct, width = 24, colour = "var(--accent)", cls = "") {
  const on = Math.round(width * Math.min(100, Math.max(0, pct)) / 100);
  return `<span class="bar ${cls}" style="--c:${colour}"
    ><b>${"█".repeat(on)}</b><i>${"░".repeat(width - on)}</i></span>`;
}
const cmd = (line, note = "") =>
  `<div class="cmd"><i>&gt;</i><b>${esc(line)}</b>${note ? `<u>${esc(note)}</u>` : ""}</div>`;
const out = text => `<div class="out">${text}</div>`;

function countdownPanel() {
  return `<div class="panel">` + CD_META.map(m => {
    const iso = state.dates[m.key], d = daysUntil(iso), past = d !== null && d < 0;
    const num = d === null ? "--" : past ? "done" : `${d}d`;
    return `<div class="cd ${past ? "past" : ""}" style="--c:${m.colour}">
      <span class="dot">${past ? "✔" : "●"}</span>
      <span class="lab">${m.label}</span>
      <span class="d">${num}</span>
      <span class="when">${iso ? fmtDate(iso) : "unset"}</span>
    </div>`;
  }).join("") + `</div>`;
}

function subjectList() {
  return `<div class="list">` + SYLLABUS.map(s => {
    const st = subjectStats(s), c = hue(s);
    return `<button class="row" data-open="${s.id}" style="--c:${c}">
      <span class="caret">›</span>
      <span class="row-main">
        <b>${esc(s.name)}</b>
        <span>${st.chaptersDone}/${st.chapters} chapters · ${st.total - st.learnt} topics left</span>
      </span>
      <span class="right">
        <span class="tag">${st.pct}%</span>
        ${bar(st.pct, 8, c, "sm")}
      </span>
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
  const today = new Date().toLocaleDateString(undefined,
    { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return `<div class="screen-in">
    ${cmd("study status")}
    ${out(`${esc(today.toLowerCase())} · ${o.total} topics tracked across ${SYLLABUS.length} subjects`)}

    <div class="sec">countdowns</div>
    ${countdownPanel()}

    <div class="sec">overall</div>
    <div class="panel">
      <div class="panel-hd">progress<em>${o.learnt}/${o.total} topics</em></div>
      <div class="panel-b">
        ${bar(pct, 24)}
        <div class="stat"><b class="pct">${pct}%</b><span>learnt</span></div>
        <div class="substat">${o.revised} revised · ${o.chaptersDone}/${o.chapters} chapters closed</div>
      </div>
    </div>
    ${out(left > 0
      ? `${pace} topics/day to finish everything before mock-1`
      : `nothing left — the whole board is ticked`)}

    <div class="sec">subjects</div>
    ${subjectList()}
    <p class="hint">tap a subject to open its chapters. state lives in
      <b>localStorage</b> on this device and works with no signal.</p>
  </div>`;
}

function screenSubjects() {
  const o = overall();
  return `<div class="screen-in">
    ${cmd("ls subjects")}
    ${out(`${SYLLABUS.length} subjects · ${o.chaptersDone}/${o.chapters} chapters complete`)}
    <div class="sec">all subjects</div>
    ${subjectList()}
    <p class="hint">chapters close automatically once every topic inside them is ticked.</p>
  </div>`;
}

function screenSubject(subj) {
  const st = subjectStats(subj), c = hue(subj);
  let html = `<div class="screen-in" style="--c:${c}">
    ${cmd(`cd subjects/${subj.id}`)}
    ${out(esc(subj.name) + " · " + esc(subj.code))}

    <div class="sec">progress</div>
    <div class="panel">
      <div class="panel-hd">${esc(subj.id)}<em>${st.learnt}/${st.total} topics</em></div>
      <div class="panel-b">
        ${bar(st.pct, 24, c)}
        <div class="stat"><b class="pct" style="--c:${c}">${st.pct}%</b><span>learnt</span></div>
        <div class="substat">${st.revised} revised · ${st.chaptersDone}/${st.chapters} chapters closed</div>
      </div>
    </div>`;

  for (const g of subj.groups) {
    html += `<div class="sec">${esc(g.name.toLowerCase())}</div><div class="list">`;
    for (const ch of g.chapters) {
      const id = `${subj.id}:${ch.n}`;
      const ms = ch.subs.map((_, i) => mark(keyOf(subj.id, ch.n, i)));
      const done = ms.filter(m => m.l).length;
      const all = done === ch.subs.length;
      const open = openChapters.has(id);

      html += `<div class="ch ${all ? "done" : ""} ${open ? "open" : ""}"
                    style="--c:${c}" data-ch="${esc(id)}">
        <button class="row ch-head" data-toggle="${esc(id)}">
          <span class="caret">▸</span>
          <span class="tag">[${esc(ch.n)}]</span>
          <span class="row-main"><b>${esc(ch.t)}</b></span>
          <span class="n">${done}/${ch.subs.length}</span>
        </button>
        <div class="ch-body">` +
        ch.subs.map((s, i) => {
          const k = keyOf(subj.id, ch.n, i), m = ms[i];
          return `<div class="topic ${m.l ? "learnt" : ""}">
            <button class="tick" data-k="${k}" data-f="l" aria-pressed="${m.l}"
              aria-label="Learnt">[${m.l ? "✓" : " "}]</button>
            <p>${esc(s)}</p>
            <button class="star" data-k="${k}" data-f="r" aria-pressed="${m.r}"
              aria-label="Revised">${m.r ? "★" : "☆"}</button>
          </div>`;
        }).join("") +
        `<div class="ch-acts">
          <button class="btn" data-bulk="l" data-subj="${subj.id}" data-chn="${esc(ch.n)}">--all-learnt</button>
          <button class="btn" data-bulk="r" data-subj="${subj.id}" data-chn="${esc(ch.n)}">--all-revised</button>
          <button class="btn warn" data-bulk="clear" data-subj="${subj.id}" data-chn="${esc(ch.n)}">--clear</button>
        </div></div>
      </div>`;
    }
    html += `</div>`;
  }
  return html + `<p class="hint">[ ] learnt · ☆ revised — ticking revised marks it
    learnt too.</p></div>`;
}

function screenSettings() {
  const dateRow = (k, label) => `<div class="row">
      <span class="row-main"><b>${label}</b></span>
      <input type="date" data-date="${k}" value="${state.dates[k] || ""}">
    </div>`;
  return `<div class="screen-in">
    ${cmd("study config")}
    ${out("settings are saved alongside your progress")}

    <div class="sec">theme</div>
    <div class="seg">
      <button data-theme-set="auto">auto</button>
      <button data-theme-set="light">light</button>
      <button data-theme-set="dark">dark</button>
      <button data-theme-set="grok">grok</button>
    </div>

    <div class="sec">exam dates</div>
    <div class="list">
      ${dateRow("ielts", "ielts")}
      ${dateRow("mock", "mock-1")}
      ${dateRow("final", "may-june")}
    </div>

    <div class="sec">data</div>
    <div class="list">
      <button class="act-row" id="exportBtn">export backup</button>
      <button class="act-row" id="importBtn">import backup</button>
      <button class="act-row danger" id="resetBtn">reset all progress</button>
    </div>
    <p class="hint">progress is stored on this device only. export before you clear
      browser data, or to move it to another phone.</p>
  </div>`;
}

/* ------------------------------------------------------------ rendering */
const PATHS = { home: "~/study", subjects: "~/study/subjects", settings: "~/study/config" };
let current = null;          // the live .screen element
let currentSubject = null;   // subject id when a detail screen is on top

function bodyFor(view) {
  if (view === "home") return screenHome();
  if (view === "subjects") return screenSubjects();
  if (view === "settings") return screenSettings();
  return screenSubject(SYLLABUS.find(s => s.id === view));
}
function pathFor(view) {
  if (PATHS[view]) return PATHS[view];
  return SYLLABUS.some(s => s.id === view) ? `~/study/subjects/${view}` : "~/study";
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
  el("nav").classList.toggle("solid", !!current && current.scrollTop > 12);
  const view = current ? current.dataset.view : tab;
  const p = pathFor(view), cut = p.lastIndexOf("/");
  el("navPath").innerHTML = esc(p.slice(0, cut + 1)) + `<b>${esc(p.slice(cut + 1))}</b>`;
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

  el("backBtn").hidden = false;
  applyTheme();

  requestAnimationFrame(() => requestAnimationFrame(() => {
    s.classList.add("push-active", "push-done");
    if (from) { from.classList.add("push-active", "push-behind"); }
    setTimeout(() => { if (from && from.parentNode) from.remove(); syncNav(); }, 380);
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
    setTimeout(() => { if (leaving.parentNode) leaving.remove(); syncNav(); }, 380);
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
    save(); refresh(); toast("backup restored");
  } catch (err) { toast("could not read that file"); }
  e.target.value = "";
};
function doReset() {
  if (!confirm("Clear all ticks and reset dates? This cannot be undone.")) return;
  state = { dates: { ...DEFAULT_DATES }, marks: {}, theme: state.theme || "auto" };
  openChapters.clear();
  save(); refresh(); toast("progress reset");
}

/* ------------------------------------------------------------------ PWA */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
setInterval(() => { if (current && current.dataset.view === "home") refresh(); }, 60000);

applyTheme();
setTab("home");
