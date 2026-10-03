import React, { useState } from "react";
import { Icon, Sheet } from "../ui.jsx";
import * as S from "../store.js";

function backupAge(state) {
  const d = S.daysSinceBackup(state);
  if (d === null) return "Never backed up";
  if (d === 0) return "Backed up today";
  if (d === 1) return "Backed up yesterday";
  return "Backed up " + d + " days ago";
}

export default function History({ state, setState, onToast }) {
  const [q, setQ] = useState("");
  const [settings, setSettings] = useState(false);
  const rows = S.searchHistory(state, q);

  function doBackup() {
    S.exportJSON(state);
    const next = { ...state, meta: { ...state.meta, lastBackup: new Date().toISOString() } };
    setState(next);
    S.save(next);
    S.haptic.win();
    onToast("Backup downloaded - keep it in Drive", "win");
  }

  const months = Object.keys(state.days).sort().reverse();
  const stale = (S.daysSinceBackup(state) || 999) > 14;

  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="text-xl font-bold text-ink-text mb-1">History</h2>
      <p className="text-base text-ink-dim mb-4">Everything you have finished, searchable.</p>

      {/* Search */}
      <div className="relative mb-4">
        <Icon name="search" size={22} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 'Black Friday' or 2026-11"
          className="w-full min-h-[48px] pl-12 pr-4 rounded-xl bg-ink-raised border-2 border-ink-line text-base text-ink-text"
        />
      </div>

      {/* Backup nudge */}
      <div className={"card p-4 mb-4 " + (stale ? "border-warn" : "")}>
        <div className="flex items-start gap-3">
          <Icon name="download" size={22} className={"flex-shrink-0 mt-0.5 " + (stale ? "text-warn" : "text-done")} />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-ink-text leading-snug">
              {backupAge(state)}
            </p>
            <p className="text-sm text-ink-dim leading-relaxed mt-1">
              This app stores everything on this phone only. Back up so nothing is lost.
            </p>
          </div>
        </div>
        <button type="button" onClick={doBackup} className="tap w-full bg-brand text-white mt-3">
          <span className="flex items-center justify-center gap-2">
            <Icon name="download" size={20} />
            Back up now
          </span>
        </button>
      </div>

      {/* Export */}
      <div className="flex gap-2.5 mb-5">
        <button type="button" onClick={() => { S.exportCSV(state); S.haptic.tick(); }} className="tap flex-1 bg-ink-raised border-2 border-ink-line text-ink-text justify-center">
          <span className="flex items-center justify-center gap-2">
            <Icon name="chart" size={20} className="text-brand" />
            Export CSV
          </span>
        </button>
        <button type="button" onClick={() => setSettings(true)} className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-ink-dim" aria-label="Settings">
          <Icon name="settings" size={22} />
        </button>
      </div>

      {/* Results grouped by date */}
      {rows.length === 0 ? (
        <div className="card p-6 text-center">
          <Icon name="history" size={40} className="text-ink-faint mx-auto mb-3" />
          <p className="text-base font-semibold text-ink-text">Nothing found</p>
          <p className="text-base text-ink-dim mt-1 leading-relaxed">
            {q ? "Try a different word or date." : "Finished tasks will appear here."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(
            rows.reduce((acc, r) => {
              (acc[r.date] = acc[r.date] || []).push(r);
              return acc;
            }, {})
          ).map(([date, items]) => (
            <div key={date}>
              <p className="text-base font-bold text-brand mb-2">{S.prettyDate(date)}</p>
              <div className="card divide-y-2 divide-ink-line">
                {items.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5">
                    <Icon name="check" size={20} className="text-done flex-shrink-0" />
                    <span className="flex-1 min-w-0 text-base text-ink-dim leading-relaxed">{r.text}</span>
                    {r.stamp && <span className="text-xs font-bold text-ink-faint flex-shrink-0">{r.stamp}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <SettingsSheet open={settings} onClose={() => setSettings(false)} state={state} setState={setState} onToast={onToast} />
    </div>
  );
}

function SettingsSheet({ open, onClose, state, setState, onToast }) {
  const [busy, setBusy] = useState(false);

  function onFile(e) {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    const r = new FileReader();
    r.onload = () => {
      try {
        const next = S.importJSON(String(r.result));
        setState(next);
        S.save(next);
        S.haptic.win();
        onToast("Backup restored", "win");
        onClose();
      } catch (err) {
        onToast(err.message, "error");
      }
      setBusy(false);
    };
    r.onerror = () => { onToast("Could not read that file", "error"); setBusy(false); };
    r.readAsText(f);
  }

  function reset() {
    if (!window.confirm("Erase everything and start over? This cannot be undone.")) return;
    localStorage.removeItem(S.KEY);
    location.reload();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Settings & Backup">
      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={() => S.exportJSON(state)} className="tap w-full bg-brand text-white">
          <span className="flex items-center justify-center gap-2">
            <Icon name="download" size={20} />
            Download backup (JSON)
          </span>
        </button>

        <label className="tap w-full bg-ink-raised border-2 border-ink-line text-ink-text cursor-pointer">
          <span className="flex items-center justify-center gap-2">
            <Icon name="share" size={20} className="text-brand" />
            {busy ? "Reading..." : "Restore from backup"}
          </span>
          <input type="file" accept="application/json,.json" onChange={onFile} className="hidden" />
        </label>

        <div className="card p-4 mt-2">
          <p className="text-base font-semibold text-ink-text mb-1.5">Vibration</p>
          <p className="text-sm text-ink-dim leading-relaxed mb-3">
            {S.haptic.supported()
              ? "Buzzes when you finish things. Works on Android."
              : "This phone does not support vibration (normal on iPhone). Everything else works."}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-base font-semibold text-ink-text mb-1.5">Where your data lives</p>
          <p className="text-sm text-ink-dim leading-relaxed">
            Only in this browser on this phone. Nothing is uploaded anywhere. If you clear your
            browser data or lose the phone, everything is gone - so download a backup regularly.
          </p>
        </div>

        <button type="button" onClick={reset} className="tap w-full bg-ink-raised border-2 border-red-900/60 text-red-400 mt-2">
          <span className="flex items-center justify-center gap-2">
            <Icon name="trash" size={20} />
            Erase everything
          </span>
        </button>
      </div>
    </Sheet>
  );
}