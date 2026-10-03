import React, { useState } from "react";
import { Icon, Check, Sheet } from "../ui.jsx";
import * as S from "../store.js";

/* ===================== Task pool editor ===================== */
function PoolSheet({ open, onClose, state, setState }) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState("posting");

  const KINDS = ["posting", "production", "submission", "research", "monitor", "other"];

  function add() {
    const t = text.trim();
    if (!t) return;
    const id = "t" + Date.now();
    setState({ ...state, pool: [...state.pool, { id, text: t, kind }] });
    S.haptic.tick();
    setText("");
  }

  function remove(id) {
    setState({ ...state, pool: state.pool.filter((p) => p.id !== id) });
    S.haptic.light();
  }

  function edit(id, val) {
    setState({
      ...state,
      pool: state.pool.map((p) => (p.id === id ? { ...p, text: val } : p)),
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Task list">
      <p className="text-base text-ink-dim mb-4 leading-relaxed">
        These tasks repeat on <strong className="text-ink-text">every day</strong> of the month. Edit once, reuse forever.
      </p>

      <div className="flex flex-col gap-2.5 mb-5">
        {state.pool.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <input
              value={p.text}
              onChange={(e) => edit(p.id, e.target.value)}
              className="flex-1 min-h-[48px] px-3.5 rounded-xl bg-ink-bg border-2 border-ink-line text-base font-semibold text-ink-text"
            />
            <button
              type="button"
              onClick={() => remove(p.id)}
              className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-red-400"
              aria-label={"Remove " + p.text}
            >
              <Icon name="trash" size={22} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New task, e.g. Posting for Grad Day"
          className="min-h-[48px] px-3.5 rounded-xl bg-ink-bg border-2 border-ink-line text-base text-ink-text"
        />
        <div className="flex gap-2 flex-wrap">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={
                "pill border-2 " +
                (kind === k ? "bg-brand text-white border-brand" : "bg-ink-raised text-ink-dim border-ink-line")
              }
            >
              {k}
            </button>
          ))}
        </div>
        <button type="button" onClick={add} disabled={!text.trim()} className="tap bg-brand text-white w-full disabled:opacity-40">
          <span className="flex items-center justify-center gap-2">
            <Icon name="plus" size={20} />
            Add task
          </span>
        </button>
      </div>
    </Sheet>
  );
}

/* ===================== Month view ===================== */
export default function Month({ state, setState, onToast, goToDay }) {
  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth());
  const [poolOpen, setPoolOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const total = S.daysInMonth(y, m);
  const firstDow = new Date(y, m, 1).getDay(); // 0 = Sunday
  const todayKey = S.dayKey(now);

  let planned = 0, completed = 0;
  for (let d = 1; d <= total; d++) {
    const key = y + "-" + S.pad(m + 1) + "-" + S.pad(d);
    if (state.days[key]) {
      planned++;
      completed += state.days[key].tasks.filter((t) => t.done).length;
    }
  }
  const totalPossible = planned * state.pool.length;

  function shift(n) {
    const d = new Date(y, m + n, 1);
    setY(d.getFullYear());
    setM(d.getMonth());
  }

  function generate() {
    setConfirm(y + "-" + S.pad(m + 1));
  }

  function doGenerate() {
    const created = S.generateMonth(state, y, m);
    setState({ ...state });
    S.haptic.big(); // you just saved a full day of typing
    setConfirm(null);
    const n = S.daysInMonth(y, m);
    if (created === 0) {
      onToast(S.MONTHS[m] + " was already planned - nothing changed", "info");
    } else {
      onToast(
        created + " days planned (" + created * state.pool.length + " tasks) in one tap",
        "win"
      );
    }
    if (!n) return;
  }

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Month header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button type="button" onClick={() => shift(-1)} className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-ink-dim" aria-label="Previous month">
          <Icon name="left" size={24} />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-xl font-bold text-ink-text leading-tight">{S.MONTHS[m]}</h2>
          <p className="text-sm font-semibold text-ink-dim">{y}</p>
        </div>
        <button type="button" onClick={() => shift(1)} className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-ink-dim" aria-label="Next month">
          <Icon name="right" size={24} />
        </button>
      </div>

      {/* The big button - the whole point of this app */}
      <button
        type="button"
        onClick={generate}
        className="tap w-full bg-brand text-white shadow-lift mb-4 !py-5 flex-col !gap-1"
      >
        <span className="flex items-center gap-2.5 text-lg">
          <Icon name="bolt" size={24} />
          Auto-fill {S.MONTHS[m]}
        </span>
        <span className="text-sm font-semibold opacity-90">
          {total} days x {state.pool.length} tasks = {total * state.pool.length} entries, one tap
        </span>
      </button>

      {/* Stats */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-ink-text">Days planned</span>
          <span className="text-base font-bold text-ink-text">
            {planned} / {total}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-ink-text">Tasks finished</span>
          <span className="text-base font-bold text-done">{completed}</span>
        </div>
      </div>

      {/* Task pool link */}
      <button
        type="button"
        onClick={() => setPoolOpen(true)}
        className="tap w-full bg-ink-raised border-2 border-ink-line text-ink-text mb-4 justify-between"
      >
        <span className="flex items-center gap-2.5">
          <Icon name="edit" size={22} className="text-brand" />
          Edit task list
        </span>
        <span className="pill bg-ink-bg border-2 border-ink-line text-ink-dim">{state.pool.length}</span>
      </button>

      {/* Calendar grid */}
      <div className="card p-3">
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-ink-faint py-1.5">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={"blank" + i} />
          ))}
          {Array.from({ length: total }).map((_, i) => {
            const d = i + 1;
            const key = y + "-" + S.pad(m + 1) + "-" + S.pad(d);
            const day = state.days[key];
            const st = S.stats(day);
            const isToday = key === todayKey;
            const all = st.all && st.total > 0;
            const some = st.done > 0 && !all;
            return (
              <button
                key={key}
                type="button"
                onClick={() => day && goToDay(key)}
                className={
                  "aspect-square rounded-xl border-2 flex flex-col items-center justify-center " +
                  (isToday
                    ? "bg-brand/20 border-brand"
                    : all
                    ? "bg-done/25 border-done"
                    : some
                    ? "bg-brand/10 border-brand/50"
                    : day
                    ? "bg-ink-bg border-ink-line"
                    : "bg-ink-bg border-transparent")
                }
                aria-label={key + (day ? ", " + st.done + " of " + st.total + " done" : ", not planned")}
              >
                <span className={"text-base font-bold " + (isToday ? "text-brand" : all ? "text-done" : "text-ink-dim")}>
                  {d}
                </span>
                {day && (
                  <span className={"text-[10px] font-bold " + (all ? "text-done" : "text-ink-faint")}>
                    {st.done}/{st.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs font-semibold text-ink-faint mt-3 text-center leading-relaxed">
          Tap any planned day to open its checklist
        </p>
      </div>

      <PoolSheet open={poolOpen} onClose={() => setPoolOpen(false)} state={state} setState={setState} />

      <Sheet
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={"Fill " + S.MONTHS[m] + " " + y + "?"}
        footer={
          <div className="flex flex-col gap-2.5 mt-5">
            <button type="button" onClick={doGenerate} className="tap bg-brand text-white w-full">
              Yes, fill {total} days
            </button>
            <button type="button" onClick={() => setConfirm(null)} className="tap bg-ink-raised border-2 border-ink-line text-ink-dim w-full">
              Cancel
            </button>
          </div>
        }
      >
        <p className="text-base text-ink-dim leading-relaxed">
          This creates a checklist for <strong className="text-ink-text">all {total} days</strong> of {S.MONTHS[m]},
          using your {state.pool.length} saved tasks.
        </p>
        <p className="text-base text-ink-dim leading-relaxed mt-3">
          Days you already planned stay exactly as they are - finished work is never touched.
        </p>
      </Sheet>
    </div>
  );
}