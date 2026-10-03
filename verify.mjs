/* Verify the real built bundle + core logic without a browser.
   We test the store module's month generation and date helpers by
   transpiling store.js on the fly (it is plain ESM, no JSX). */
import { readFileSync, existsSync, writeFileSync, unlinkSync } from "fs";

let fail = 0;
const check = (n, c) => { console.log((c ? "OK  " : "FAIL") + " " + n); if (!c) fail++; };

console.log("--- build artifacts ---");
["public/index.html", "public/app.js", "public/styles.css", "public/sw.js",
 "public/manifest.webmanifest", "public/icons/icon.svg",
 "public/icons/icon-192.png", "public/icons/icon-512.png"
].forEach((f) => check("exists " + f, existsSync(f)));

const bundle = readFileSync("public/app.js", "utf8");
// Regression guard: the npm build script must escape the NODE_ENV define.
// If the shell strips the quotes, esbuild substitutes a bare `production`
// identifier and the app dies with "ReferenceError: production is not
// defined" - a blank white page. Prod bundle is ~180KB, broken was ~500KB.
check("bundle is production build (<250kb)", bundle.length < 250000);
check("no bare `production` identifier (runtime ReferenceError)", (bundle.replace(/"[^"]*"/g, "").match(/(^|[^.\w$])production([^.\w$]|$)/g) || []).length === 0);
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
check("package.json escapes NODE_ENV define", pkg.scripts.js.indexOf("NODE_ENV=" + String.fromCharCode(92) + String.fromCharCode(34)) !== -1);
check("bundle is minified (<600kb)", bundle.length < 600000);
check("bundle has no leftover JSX", !/<[a-z]+[A-Z][a-zA-Z]*\s/.test(bundle.slice(0, 2000)));

console.log("--- PWA / offline ---");
check("sw.js precaches app.js + css", /app\.js/.test(readFileSync("public/sw.js","utf8")) && /styles\.css/.test(readFileSync("public/sw.js","utf8")));
const manifest = JSON.parse(readFileSync("public/manifest.webmanifest","utf8"));
check("manifest is portrait standalone", manifest.display === "standalone" && manifest.orientation === "portrait");
check("manifest has 192 + 512 png", manifest.icons.some(i=>i.sizes==="192x192") && manifest.icons.some(i=>i.sizes==="512x512"));
check("manifest has maskable icon", manifest.icons.some(i=>i.purpose==="maskable"));
const html = readFileSync("public/index.html","utf8");
check("html links manifest", /rel="manifest"/.test(html));
check("html has theme-color #0F0F0F", /#0F0F0F/.test(html));
check("html has apple touch icon", /apple-touch-icon/.test(html));
check("viewport-fit=cover for notch", /viewport-fit=cover/.test(html));
check("no white flash boot screen", /#boot/.test(html));

console.log("--- icons are valid PNG ---");
[192,512].forEach((s)=>{
  const b = readFileSync(`public/icons/icon-${s}.png`);
  const sig = b.slice(0,8).toString("hex");
  check(`icon-${s}.png PNG signature`, sig === "89504e470d0a1a0a");
  check(`icon-${s}.png IHDR`, b.slice(12,16).toString("ascii") === "IHDR");
});

console.log("--- ASTIGMATISM tokens in built CSS ---");
const css = readFileSync("public/styles.css","utf8");
// Tailwind compiles hex to rgb() and hex-with-alpha to a space-slash form.
const hasRGB = (hex) => {
  const n = hex.replace("#","");
  const r = parseInt(n.slice(0,2),16), g = parseInt(n.slice(2,4),16), b = parseInt(n.slice(4,6),16);
  const s = r + " " + g + " " + b;
  return css.includes(s) || css.includes(s.replace(/ /g,",")) || css.toLowerCase().includes(hex);
};
check("base font 17px present", /1\.0625rem/.test(css));
check("min tap target 48px present", /3rem/.test(css));
check("text colour #e8eaed compiled", hasRGB("e8eaed"));
check("muted text stays light #b0b7c3", hasRGB("b0b7c3"));
check("faint text #8e959f present", hasRGB("8e959f"));
check("pink accent present", hasRGB("ff69b4"));
check("green done present", hasRGB("4caf50"));
check("checkbox 3px border present", /3px/.test(css));
check("no hairline 1px borders on checks", !/\.check\{[^}]*\b1px\b/.test(css));
// brand-dark is declared in the theme but never used, so Tailwind's JIT purges
// it. That is correct behaviour - assert the purge, not the colour.
check("unused theme colour is purged by JIT", !hasRGB("e0509a"));

console.log("--- core logic (Option A: all tasks every day) ---");
// store.js is plain ESM; copy to .mjs so node treats it as a module
writeFileSync("src/__store_test.mjs", readFileSync("src/store.js","utf8"));
const store = await import("./src/__store_test.mjs");
unlinkSync("src/__store_test.mjs");
const state = { pool: store.DEFAULT_POOL.slice(), days: {}, meta:{} };
const created = store.generateMonth(state, 2026, 10); // November
check("November 2026 has 30 days", store.daysInMonth(2026,10) === 30);
check("generateMonth created 30 days", created === 30);
check("day 1 has all 8 tasks", state.days["2026-11-01"].tasks.length === 8);
check("day 28 has all 8 tasks (matches her screenshot)", state.days["2026-11-28"].tasks.length === 8);
check("day 30 exists (last day)", !!state.days["2026-11-30"]);
check("total entries = 240", Object.values(state.days).reduce((n,d)=>n+d.tasks.length,0) === 240);
check("all tasks start not done", state.days["2026-11-15"].tasks.every(t=>t.done === false));

console.log("--- idempotence + data safety ---");
state.days["2026-11-15"].tasks[0].done = true;
state.days["2026-11-15"].tasks[0].doneAt = Date.now();
const again = store.generateMonth(state, 2026, 10);
check("re-generating creates 0 new days", again === 0);
check("re-generating never wipes completed work", state.days["2026-11-15"].tasks[0].done === true);
check("completed timestamp preserved", typeof state.days["2026-11-15"].tasks[0].doneAt === "number");

console.log("--- leap year + short months ---");
check("Feb 2028 is leap = 29", store.daysInMonth(2028,1) === 29);
check("Feb 2027 is 28", store.daysInMonth(2027,1) === 28);
check("Apr has 30", store.daysInMonth(2026,3) === 30);

console.log("--- stats + report ---");
const day = state.days["2026-11-28"];
day.tasks.forEach(t => { t.done = true; t.doneAt = new Date(2026,10,28,10,12).getTime(); });
const s = store.stats(day);
check("stats 8 of 8, all=true", s.done===8 && s.total===8 && s.all===true && s.pct===100);
const rep = store.buildReport("2026-11-28", day, "Nov 28 Done:");
check("report lists every task", (rep.match(/\[done\]/g)||[]).length === 8);
check("report has completion count", /8 of 8 completed/.test(rep));
check("report shows the time", /10:12 AM/.test(rep));
const day2 = state.days["2026-11-01"];
day2.tasks[0].done = true; day2.tasks[0].doneAt = Date.now();
const rep2 = store.buildReport("2026-11-01", day2, "");
check("partial day lists what is still open", /Still open:/.test(rep2));

console.log("--- history search + CSV ---");
const all = store.allDoneEntries(state);
// Nov 1 has 1 done, Nov 15 has 1 done, Nov 28 has all 8 done = 10
check("history collects done tasks (1+1+8)", all.length === 10);
check("history sorted newest first", all[0].date >= all[all.length-1].date);
// "Posting for Black Friday" is task[0] of every generated day, and it is
// done on Nov 1, Nov 15 and Nov 28 -> 3 hits.
check("search by task text works", store.searchHistory(state, "Black Friday").length === 3);
check("search matches substring not just prefix", store.searchHistory(state, "Christmas").length === 1);
check("search by date works", store.searchHistory(state, "2026-11-28").length === 8);
check("search misses return empty", store.searchHistory(state, "zzzz").length === 0);
check("empty query returns all", store.searchHistory(state, "").length === 10);
const csv = store.toCSV(all);
check("csv header is quoted for Excel", csv.startsWith('"Date","Task","Category","Completed At"'));
check("csv uses CRLF (Excel safe)", csv.includes("\r\n") && !/[^\r]\n/.test(csv));
check("csv has a row per entry", csv.trim().split("\n").length === all.length + 1);

console.log("--- haptics degrade safely ---");
check("haptic.light is a function", typeof store.haptic.light === "function");
check("haptic.win is a function", typeof store.haptic.win === "function");
check("haptic.big is a function", typeof store.haptic.big === "function");
let threw = false;
try { store.haptic.light(); store.haptic.win(); store.haptic.big(); } catch(e) { threw = true; }
check("haptics never throw (iOS safe)", !threw);

console.log(fail === 0 ? "\nALL TESTS PASSED" : "\n" + fail + " TEST(S) FAILED");
process.exit(fail === 0 ? 0 : 1);
