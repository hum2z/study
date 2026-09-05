# Study Tracker

An offline-first PWA for tracking A Level and IELTS revision, chapter by chapter,
with live countdowns to each exam.

## What's in it

| Subject | Board / spec | Content |
|---|---|---|
| Computer Science | Cambridge International 9618 | Sections 1–20 (AS + A Level) |
| Physics | Cambridge International 9702 | Topics 1–25 + practical papers |
| Pure Maths 3 | Edexcel IAL WMA13 | Units 1–6 |
| Pure Maths 4 | Edexcel IAL WMA14 | Units 1–7 |
| Mechanics 1 | Edexcel IAL WME01 | Units 1–6 |
| IELTS Academic | British Council / IDP | Listening, Reading, Writing T1/T2, Speaking, mocks |

Every topic has two toggles:

- **✓ learnt** — you've covered it
- **★ revised** — you've been back over it (ticking this ticks "learnt" too)

Chapters show `x/y` and flip to **done** when every topic is ticked. There are
per-chapter "mark all" and "clear" buttons.

## Countdowns

Three countdowns sit at the top, recalculated every minute and on app focus:

| Event | Default date |
|---|---|
| IELTS | 29 Sep 2026 |
| Mock 1 | 2 Nov 2026 (first Monday of November) |
| May/June series | 3 May 2027 |

Change any of them under **⚙ → Exam dates** — they're stored with your progress.

The Overview tab turns these into a workload figure: topics left ÷ days left,
so you can see the per-day pace needed for Mock 1 and for May/June.

## Offline

A service worker caches the whole app shell, so once you've opened it on a
device it loads with no connection. Progress is kept in `localStorage` on that
device — use **⚙ → Export backup** before clearing browser data, and
**Import backup** to restore or move to another device.

## Running it

It's plain HTML/CSS/JS with no build step. Serve the folder over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A service worker needs `https://` or `localhost`, so opening `index.html`
straight off the filesystem works but won't cache for offline use. To install
it on a phone, host the folder anywhere static (GitHub Pages, Netlify, Vercel),
open it in the browser and choose **Add to Home Screen** / **Install**.

## Files

```
index.html            markup and settings dialog
styles.css            styling, light + dark
syllabus.js           all syllabus data
app.js                state, progress maths, rendering
sw.js                 service worker (cache-first app shell)
manifest.webmanifest  PWA manifest
icons/                app icons
```

To adjust a syllabus, edit `syllabus.js` — chapters and sub-topics are plain
data, and everything else derives from it.

## Sources

- [Cambridge International AS & A Level Computer Science 9618 syllabus](https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf)
- [Cambridge International AS & A Level Physics 9702 syllabus (2025–2027)](https://www.cambridgeinternational.org/Images/664565-2025-2027-syllabus.pdf)
- [Pearson Edexcel International A Level Mathematics specification (Issue 3)](https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Specification-and-Sample-Assessment/international-a-level-maths-spec.pdf)
