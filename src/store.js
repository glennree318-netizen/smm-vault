/* =========================================================================
   SMM Vault - data layer
   Local-only. No network calls. Everything in localStorage.
   ========================================================================= */

export const KEY = "smmvault.v1";

/* ---------------- Haptics ----------------
   Android Chrome / Firefox: works fully.
   iOS Safari: has never supported the Vibration API. navigator.vibrate()
   is simply absent, so every call here is a silent no-op. No errors,
   no broken state - it just does not buzz. That is intentional.        */
export const haptic = {
  light() {
    try {
      if (navigator.vibrate) navigator.vibrate(10);
    } catch (e) {}
  },
  tick() {
    try {
      if (navigator.vibrate) navigator.vibrate(18);
    } catch (e) {}
  },
  win() {
    // "All done for the day" - the payoff moment
    try {
      if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 80]);
    } catch (e) {}
  },
  big() {
    // Generated a whole month - you just saved a full day of work
    try {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 120]);
    } catch (e) {}
  },
  supported() {
    return typeof navigator !== "undefined" && !!navigator.vibrate;
  },
};

/* ---------------- Defaults ---------------- */
export const DEFAULT_POOL = [
  { id: "t1", text: "Posting for Black Friday", kind: "posting" },
  { id: "t2", text: "Posting for Christmas Day", kind: "posting" },
  { id: "t3", text: "Production for Valentine's Day", kind: "production" },
  { id: "t4", text: "Production for Women's Month", kind: "production" },
  { id: "t5", text: "Product Research and Product", kind: "research" },
  { id: "t6", text: "Submission for Period 16-30", kind: "submission" },
  { id: "t7", text: "Monitor Eva's output", kind: "monitor" },
  { id: "t8", text: "Continuation of Production for Valentine's Day", kind: "production" },
];

const CLIENT_COLORS = [
  "#FF69B4", "#4FC3F7", "#FFD54F", "#81C784",
  "#BA68C8", "#FF8A65", "#4DD0E1", "#AED581", "#F06292",
];

export function defaultClients() {
  return CLIENT_COLORS.map((c, i) => ({
    id: "c" + (i + 1),
    name: "Client " + (i + 1),
    color: c,
    brand: [c, "#2C2C2E", "#F5F5F7", "#8E959F"],
    hashtags: [],
    captions: [],
  }));
}

function fresh() {
  return {
    pool: DEFAULT_POOL.slice(),
    days: {},        // "YYYY-MM-DD" -> { tasks: [{id, text, done, doneAt}] }
    clients: defaultClients(),
    meta: {
      created: new Date().toISOString(),
      lastBackup: null,
      buzz: true,
    },
  };
}

/* ---------------- Persistence ---------------- */
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw);
    // merge against fresh() so new fields never break an old save
    return Object.assign(fresh(), parsed, {
      meta: Object.assign(fresh().meta, parsed.meta || {}),
    });
  } catch (e) {
    console.warn("Could not read saved data, starting fresh", e);
    return fresh();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn("Save failed", e);
    return false;
  }
}

/* ---------------- Dates ---------------- */
export const pad = (n) => String(n).padStart(2, "0");

export function dayKey(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function parseKey(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function prettyDate(key) {
  const d = parseKey(key);
  return MONTHS[d.getMonth()] + " " + d.getDate();
}

export function longDate(key) {
  const d = parseKey(key);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

export function timeOf(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + pad(d.getMinutes()) + " " + ampm;
}

/* ---------------- Month generation (Option A) ----------------
   Every task in the pool lands on EVERY day of the month.
   This is the whole point: one tap instead of ~270 manual entries.
   Existing days are never overwritten - completions are sacred.      */
export function generateMonth(state, y, m) {
  const n = daysInMonth(y, m);
  let created = 0;
  for (let day = 1; day <= n; day++) {
    const key = y + "-" + pad(m + 1) + "-" + pad(day);
    if (state.days[key]) continue; // already planned - leave it alone
    state.days[key] = {
      tasks: state.pool.map((t, i) => ({
        id: key + ":" + t.id + ":" + i,
        text: t.text,
        kind: t.kind,
        done: false,
        doneAt: null,
      })),
      generated: true,
    };
    created++;
  }
  return created;
}

/* ---------------- Day helpers ---------------- */
export function getDay(state, key) {
  return state.days[key] || null;
}

export function ensureToday(state) {
  const key = dayKey(new Date());
  if (!state.days[key]) {
    state.days[key] = { tasks: [], generated: false };
  }
  return state.days[key];
}

export function stats(day) {
  if (!day || !day.tasks.length) return { done: 0, total: 0, pct: 0, all: false };
  const done = day.tasks.filter((t) => t.done).length;
  const total = day.tasks.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0, all: done === total && total > 0 };
}

/* ---------------- Director report ---------------- */
export function buildReport(dayKeyStr, day, poolLabel) {
  const done = day.tasks.filter((t) => t.done);
  if (!done.length) {
    return prettyDate(dayKeyStr) + " - nothing done yet.";
  }
  const lines = done.map((t) => {
    const when = t.doneAt ? timeOf(t.doneAt) : "";
    return "[done] " + t.text + (when ? " - " + when : "");
  });
  const missed = day.tasks.filter((t) => !t.done).map((t) => "[ ] " + t.text);
  const s = stats(day);
  let out = poolLabel ? poolLabel + " Done:\n" : "";
  out += lines.join("\n");
  if (missed.length) out += "\n\nStill open:\n" + missed.join("\n");
  out += "\n\n" + s.done + " of " + s.total + " completed.";
  return out;
}

/* ---------------- History ---------------- */
export function allDoneEntries(state) {
  const out = [];
  Object.keys(state.days).forEach((k) => {
    const day = state.days[k];
    (day.tasks || []).forEach((t) => {
      if (t.done) {
        out.push({
          date: k,
          text: t.text,
          kind: t.kind,
          doneAt: t.doneAt,
          stamp: t.doneAt ? timeOf(t.doneAt) : "",
        });
      }
    });
  });
  out.sort((a, b) => (a.date === b.date ? (b.doneAt || 0) - (a.doneAt || 0) : b.date.localeCompare(a.date)));
  return out;
}

export function searchHistory(state, q) {
  const all = allDoneEntries(state);
  const term = (q || "").trim().toLowerCase();
  if (!term) return all;
  return all.filter((e) => e.text.toLowerCase().includes(term) || e.date.includes(term));
}

export function toCSV(rows) {
  // Excel compatibility - all three details matter:
  // 1. A leading = + - @ is prefixed with an apostrophe so Excel never
  //    treats the text as a formula (CSV injection).
  // 2. Every field is quoted and embedded quotes are doubled.
  // 3. CRLF line endings. LF-only makes Excel join every row together.
  // A UTF-8 BOM is added by exportCSV so accents survive on Windows.
  const esc = (v) => {
    let s = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return (
    ["Date", "Task", "Category", "Completed At"].map(esc).join(",") +
    "\r\n" +
    rows.map((r) => [r.date, r.text, r.kind || "", r.stamp].map(esc).join(",")).join("\r\n")
  );
}

/* ---------------- Backup ---------------- */
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function exportJSON(state) {
  downloadBlob(
    new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    "smmvault-backup-" + dayKey(new Date()) + ".json"
  );
}

export function exportCSV(state) {
  const rows = allDoneEntries(state);
  // The leading FEFF is a UTF-8 BOM. Without it, Excel on Windows renders
  // accented characters (Noel, Jose, Spanish-Filipino names) as mojibake.
  downloadBlob(
    new Blob(["\uFEFF" + toCSV(rows)], { type: "text/csv;charset=utf-8" }),
    "smmvault-history-" + dayKey(new Date()) + ".csv"
  );
  return rows.length;
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || !("pool" in parsed) || !("days" in parsed)) {
    throw new Error("That file does not look like an SMM Vault backup.");
  }
  return parsed;
}

export function daysSinceBackup(state) {
  const lb = state.meta && state.meta.lastBackup;
  if (!lb) return null;
  return Math.floor((Date.now() - new Date(lb).getTime()) / 86400000);
}