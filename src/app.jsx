import React, { useEffect, useState, useCallback } from "react";
import { Icon, Toast, TabBar, Sheet } from "./ui.jsx";
import * as S from "./store.js";
import Today from "./views/Today.jsx";
import Month from "./views/Month.jsx";
import { Clients } from "./views/Clients.jsx";
import History from "./views/History.jsx";

export default function App() {
  const [state, setState] = useState(() => S.load());
  const [tab, setTab] = useState("today");
  const [offset, setOffset] = useState(0);
  const [toast, setToast] = useState(null);
  const [report, setReport] = useState(null);
  const [installEvt, setInstallEvt] = useState(null);

  useEffect(() => { S.save(state); }, [state]);

  const say = useCallback((msg, tone = "info") => {
    setToast({ msg, tone, id: Date.now() });
    setTimeout(() => setToast((t) => (t && t.id === Date.now() ? null : t)), 2800);
  }, []);

  const openReport = useCallback((key, day, celebrate) => {
    const label = S.prettyDate(key) + (key === S.dayKey(new Date()) ? "" : "");
    setReport({ key, text: S.buildReport(key, day, label), celebrate });
  }, []);

  useEffect(() => {
    const onInstall = (e) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  function goToDay(key) {
    const today = S.dayKey(new Date());
    const a = S.parseKey(key), b = new Date();
    const diff = Math.round((a - new Date(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
    setOffset(diff);
    setTab("today");
    S.haptic.light();
  }

  function copyReport(text) {
    const done = () => { say("Report copied - paste in WhatsApp", "win"); S.haptic.win(); };
    if (navigator.share) {
      navigator.share({ text }).then(done).catch(() => {
        navigator.clipboard ? navigator.clipboard.writeText(text).then(done) : say("Could not share", "error");
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(done).catch(() => say("Could not copy", "error"));
    } else {
      say("Sharing not supported here", "error");
    }
  }

  return (
    <div className="min-h-screen bg-ink-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-ink-bg/95 backdrop-blur border-b-2 border-ink-line px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
            <Icon name="bolt" size={22} className="text-white" />
          </span>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-ink-text leading-tight truncate">SMM Vault</h1>
            <p className="text-xs font-semibold text-ink-faint leading-tight">
              {state.clients.length} clients
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTab("history")}
          className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-ink-dim"
          aria-label="Settings and backup"
        >
          <Icon name="settings" size={22} />
        </button>
      </header>

      {/* Install banner */}
      {installEvt && (
        <div className="px-4 pt-3">
          <div className="card p-3.5 border-brand">
            <div className="flex items-center gap-3">
              <Icon name="download" size={24} className="text-brand flex-shrink-0" />
              <p className="flex-1 text-sm font-semibold text-ink-text leading-snug">
                Add to home screen so it opens like an app.
              </p>
              <button
                type="button"
                onClick={async () => { installEvt.prompt(); setInstallEvt(null); }}
                className="tap !px-4 bg-brand text-white"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <main className="pb-24">
        {tab === "today" && (
          <Today state={state} setState={setState} onReport={openReport} offset={offset} setOffset={setOffset} />
        )}
        {tab === "month" && (
          <Month state={state} setState={setState} onToast={say} goToDay={goToDay} />
        )}
        {tab === "clients" && (
          <Clients state={state} setState={setState} onToast={say} />
        )}
        {tab === "history" && (
          <History state={state} setState={setState} onToast={say} />
        )}
      </main>

      <TabBar tab={tab} setTab={setTab} />

      <Toast msg={toast && toast.msg} tone={toast && toast.tone} />

      {/* Director report */}
      <Sheet
        open={!!report}
        onClose={() => setReport(null)}
        title={report && report.celebrate ? "Nice work today" : "Director report"}
      >
        {report && (
          <>
            {report.celebrate && (
              <div className="card p-4 mb-4 border-done bg-done/10 mb-4">
                <div className="flex items-center gap-3">
                  <Icon name="sparkle" size={26} className="text-done flex-shrink-0" />
                  <p className="text-base font-bold text-done leading-snug">
                    All done. Send this and enjoy the evening.
                  </p>
                </div>
              </div>
            )}
            <pre className="bg-ink-bg border-2 border-ink-line rounded-2xl p-4 text-base text-ink-text leading-relaxed whitespace-pre-wrap break-words font-sans">
              {report.text}
            </pre>
            <div className="flex flex-col gap-2.5 mt-4">
              <button type="button" onClick={() => copyReport(report.text)} className="tap bg-done text-white w-full">
                <span className="flex items-center justify-center gap-2">
                  <Icon name="share" size={20} />
                  Send to director
                </span>
              </button>
              <button type="button" onClick={() => setReport(null)} className="tap bg-ink-raised border-2 border-ink-line text-ink-dim w-full">
                Close
              </button>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}