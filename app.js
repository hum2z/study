/* Study Tracker — offline-first PWA */

const STORE = "study-tracker-v1";
const DEFAULT_DATES = {
  ielts: "2026-09-29",   // IELTS test
  mock:  "2026-11-02",   // Mock 1, first week of November
  final: "2027-05-03"    // May/June exam series
};
const CD_META = [
  { key: "ielts", label: "IELTS",       colour: "#ffd166" },
  { key: "mock",  label: "Mock 1",      colour: "#ff8a4f" },
  { key: "final", label: "May/June",    colour: "#4f8cff" }
];

/* ---------- state ---------- */
let state = load();
let activeTab = "overview";

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE));
    if (raw && raw.marks) return { dates: { ...DEFAULT_DATES, ...(raw.dates || {}) }, marks: raw.marks };
  } catch (e) { /* corrupt or unavailable — start fresh */ }
  return { dates: { ...DEFAULT_DATES }, marks: {} };
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
}

const keyOf = (subj, ch, i) => `${subj}:${ch}:${i}`;
const mark = k => state.marks[k] || { l: false, r: false };

/* ---------- dates ---------- */
function midnight(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function daysUntil(iso) {
  if (!iso) return null;
  const target = midnight(iso + "T00:00:00");
  if (isNaN(target)) return null;
  return Math.round((target - midnight(new Date())) / 86400000);
}
const fmtDate = iso => new Date(iso + "T00:00:00")
  .toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/* ---------- progress ---------- */
function subjectStats(subj) {
  let total = 0, learnt = 0, revised = 0, chapters = 0, chaptersDone = 0;
  for (const g of subj.groups) for (const ch of g.chapters) {
    chapters++;
    let chDone = 0;
    ch.subs.forEach((_, i) => {
      total++;
      const m = mark(keyOf(subj.id, ch.n, i));
      if (m.l) { learnt++; chDone++; }
      if (m.r) revised++;
    });
    if (chDone === ch.subs.length) chaptersDone++;
  }
  return { total, learnt, revised, chapters, chaptersDone, pct: total ? Math.round(learnt / total * 100) : 0 };
}
function overallStats() {
  return SYLLABUS.reduce((a, s) => {
    const st = subjectStats(s);
    a.total += st.total; a.learnt += st.learnt; a.revised += st.revised;
    a.chapters += st.chapters; a.chaptersDone += st.chaptersDone;
    return a;
  }, { total: 0, learnt: 0, revised: 0, chapters: 0, chaptersDone: 0 });
}

/* ---------- rendering ---------- */
const el = document.getElementById.bind(document);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function renderCountdowns() {
  el("countdowns").innerHTML = CD_META.map(m => {
    const iso = state.dates[m.key];
    const d = daysUntil(iso);
    const past = d !== null && d < 0;
    const num = d === null ? "—" : (past ? "done" : d);
    const unit = (d === null || past) ? "" : `<small>${d === 1 ? "day" : "days"} left</small>`;
    return `<div class="cd ${past ? "past" : ""}" style="--c:${m.colour}">
      <div class="lab">${m.label}</div>
      <div class="num">${num}${unit}</div>
      <div class="date">${iso ? fmtDate(iso) : "not set"}</div>
    </div>`;
  }).join("");
}

function renderTabs() {
  const tabs = [{ id: "overview", name: "Overview" }].concat(SYLLABUS);
  el("tabs").innerHTML = tabs.map(t => {
    const pct = t.id === "overview" ? "" :
      `<span class="pct">${subjectStats(t).pct}%</span>`;
    return `<button class="tab" role="tab" data-tab="${t.id}"
      aria-selected="${activeTab === t.id}">${esc(t.name)}${pct}</button>`;
  }).join("");
}

function renderOverview() {
  const o = overallStats();
  const left = o.total - o.learnt;
  const dMock = daysUntil(state.dates.mock);
  const dFinal = daysUntil(state.dates.final);
  const pace = (n, d) => (d && d > 0 && n > 0) ? (n / d).toFixed(1) : (n === 0 ? "0" : "—");

  const stats = `<div class="stats">
    <div class="stat"><div class="k">Topics done</div><div class="v">${o.learnt}<span class="sub"> / ${o.total}</span></div></div>
    <div class="stat"><div class="k">Chapters done</div><div class="v">${o.chaptersDone}<span class="sub"> / ${o.chapters}</span></div></div>
    <div class="stat"><div class="k">Revised</div><div class="v">${o.revised}</div></div>
    <div class="stat"><div class="k">Topics left</div><div class="v">${left}</div></div>
    <div class="stat"><div class="k">Pace to Mock 1</div><div class="v">${pace(left, dMock)}<span class="sub"> /day</span></div></div>
    <div class="stat"><div class="k">Pace to May/June</div><div class="v">${pace(left, dFinal)}<span class="sub"> /day</span></div></div>
  </div>`;

  const cards = SYLLABUS.map(s => {
    const st = subjectStats(s);
    return `<div class="card">
      <div class="subjrow"><b>${esc(s.name)}</b><span class="v" style="color:${s.colour}">${st.pct}%</span></div>
      <div class="sub">${esc(s.code)} · ${st.chaptersDone}/${st.chapters} chapters · ${st.learnt}/${st.total} topics · ${st.revised} revised</div>
      <div class="bar" style="--c:${s.colour}"><i style="width:${st.pct}%"></i></div>
    </div>`;
  }).join("");

  return stats + `<div class="grouphdr">By subject</div>` + cards;
}

function renderSubject(subj) {
  const st = subjectStats(subj);
  let html = `<div class="card" style="--c:${subj.colour}">
      <div class="subjrow"><b>${esc(subj.name)}</b><span class="v" style="color:${subj.colour}">${st.pct}%</span></div>
      <div class="sub">${esc(subj.code)} · ${st.chaptersDone}/${st.chapters} chapters complete · ${st.total - st.learnt} topics left</div>
      <div class="bar"><i style="width:${st.pct}%"></i></div>
    </div>
    <div class="legend">
      <span><i class="sw" style="background:var(--good)"></i> ✓ learnt</span>
      <span><i class="sw" style="background:var(--warn)"></i> ★ revised</span>
    </div>`;

  for (const g of subj.groups) {
    html += `<div class="grouphdr">${esc(g.name)}</div>`;
    for (const ch of g.chapters) {
      const marks = ch.subs.map((_, i) => mark(keyOf(subj.id, ch.n, i)));
      const done = marks.filter(m => m.l).length;
      const rev = marks.filter(m => m.r).length;
      const all = done === ch.subs.length;
      const chip = all ? `<span class="chip done">done</span>`
        : done ? `<span class="chip prog">${done}/${ch.subs.length}</span>`
        : `<span class="chip">${ch.subs.length} topic${ch.subs.length === 1 ? "" : "s"}</span>`;

      html += `<details class="ch ${all ? "done" : ""}" style="--c:${subj.colour}" data-ch="${esc(ch.n)}">
        <summary>
          <span class="chno">${esc(ch.n)}</span>
          <span class="chmeta"><b>${esc(ch.t)}</b>
            <span>${done}/${ch.subs.length} learnt${rev ? ` · ${rev} revised` : ""}</span></span>
          ${chip}
        </summary>
        <div class="subs">` +
        ch.subs.map((s, i) => {
          const m = marks[i];
          const k = keyOf(subj.id, ch.n, i);
          return `<div class="subitem ${m.l ? "learnt" : ""}">
            <p>${esc(s)}</p>
            <button class="tg l" data-k="${k}" data-f="l" aria-pressed="${m.l}" title="Learnt">✓</button>
            <button class="tg r" data-k="${k}" data-f="r" aria-pressed="${m.r}" title="Revised">★</button>
          </div>`;
        }).join("") +
        `</div>
        <div class="chactions">
          <button data-bulk="l" data-subj="${subj.id}" data-chn="${esc(ch.n)}">Mark all learnt</button>
          <button data-bulk="r" data-subj="${subj.id}" data-chn="${esc(ch.n)}">Mark all revised</button>
          <button data-bulk="clear" data-subj="${subj.id}" data-chn="${esc(ch.n)}">Clear</button>
        </div>
      </details>`;
    }
  }
  return html;
}

function render(keepOpen = true) {
  const open = keepOpen ? [...document.querySelectorAll("details.ch[open]")].map(d => d.dataset.ch) : [];
  const scroll = window.scrollY;

  el("todayLine").textContent = new Date()
    .toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  renderCountdowns();
  renderTabs();

  const subj = SYLLABUS.find(s => s.id === activeTab);
  el("view").innerHTML = subj ? renderSubject(subj) : renderOverview();

  open.forEach(n => {
    const d = document.querySelector(`details.ch[data-ch="${CSS.escape(n)}"]`);
    if (d) d.open = true;
  });
  window.scrollTo(0, scroll);
}

/* ---------- interactions ---------- */
document.addEventListener("click", e => {
  const tab = e.target.closest(".tab");
  if (tab) { activeTab = tab.dataset.tab; render(false); window.scrollTo(0, 0); return; }

  const tg = e.target.closest(".tg");
  if (tg) {
    const k = tg.dataset.k, f = tg.dataset.f;
    const m = { ...mark(k) };
    m[f] = !m[f];
    if (f === "r" && m.r) m.l = true;      // revising implies you've learnt it
    if (f === "l" && !m.l) m.r = false;    // un-learning clears the revised star
    state.marks[k] = m;
    save(); render();
    return;
  }

  const bulk = e.target.closest("[data-bulk]");
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
    save(); render();
  }
});

/* ---------- settings ---------- */
const dlg = el("settings");
function syncDateInputs() {
  el("d_ielts").value = state.dates.ielts;
  el("d_mock").value = state.dates.mock;
  el("d_final").value = state.dates.final;
}
el("menuBtn").onclick = () => { syncDateInputs(); dlg.showModal(); };
dlg.addEventListener("close", () => {
  state.dates = {
    ielts: el("d_ielts").value || DEFAULT_DATES.ielts,
    mock:  el("d_mock").value  || DEFAULT_DATES.mock,
    final: el("d_final").value || DEFAULT_DATES.final
  };
  save(); render();
});

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

el("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `study-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};
el("importBtn").onclick = () => el("importFile").click();
el("importFile").onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data.marks) throw new Error("bad file");
    state = { dates: { ...DEFAULT_DATES, ...(data.dates || {}) }, marks: data.marks };
    save(); syncDateInputs(); render(false); toast("Backup restored");
  } catch (err) { toast("Could not read that file"); }
  e.target.value = "";
};
el("resetBtn").onclick = () => {
  if (!confirm("Clear all ticks and reset dates? This cannot be undone.")) return;
  state = { dates: { ...DEFAULT_DATES }, marks: {} };
  save(); syncDateInputs(); render(false); toast("Progress reset");
};

/* ---------- PWA ---------- */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault(); deferredPrompt = e; el("installBtn").hidden = false;
});
el("installBtn").onclick = async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null; el("installBtn").hidden = true;
};
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

/* keep the countdowns honest if the app is left open overnight */
document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
setInterval(renderCountdowns, 60000);

render(false);
