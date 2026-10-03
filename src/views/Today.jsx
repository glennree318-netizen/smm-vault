import React, { useState } from "react";
import { Icon, Check, Progress } from "../ui.jsx";
import * as S from "../store.js";

/* Task list row. Big 48px+ tap target, heavy check stroke, strikethrough on done. */
function Row({ task, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-ink-raised border-2 border-ink-line text-left active:scale-[0.99] transition-transform"
    >
      <Check on={task.done} label={(task.done ? "Uncheck: " : "Check: ") + task.text} />
      <span className="flex-1 min-w-0">
        <span className={"block text-base leading-relaxed " + (task.done ? "done-text text-ink-dim" : "text-ink-text")}>
          {task.text}
        </span>
        {task.done && task.doneAt && (
          <span className="block text-xs font-semibold text-done mt-0.5">
            Done at {S.timeOf(task.doneAt)}
          </span>
        )}
      </span>
    </button>
  );
}

export default function Today({ state, setState, onReport, offset, setOffset }) {
  const [showDoneFirst, setShowDoneFirst] = useState(false);

  const real = new Date();
  const view = new Date(real.getFullYear(), real.getMonth(), real.getDate() + offset);
  const key = S.dayKey(view);
  const day = state.days[key];
  const s = S.stats(day);

  const sorted = day
    ? [...day.tasks].sort((a, b) => {
        if (a.done !== b.done) return showDoneFirst ? a.done - b.done : a.done ? 1 : -1;
        return 0;
      })
    : [];

  function toggle(task) {
    const d = state.days[key];
    const t = d.tasks.find((x) => x.id === task.id);
    t.done = !t.done;
    t.doneAt = t.done ? Date.now() : null;

    const after = S.stats(state.days[key]);
    if (after.all && after.total > 0) {
      // every box ticked - this is the moment she wants to feel
      S.haptic.win();
      onReport(key, state.days[key], true);
    } else if (t.done) {
      S.haptic.tick();
    } else {
      S.haptic.light();
    }
    setState({ ...state });
  }

  const isToday = offset === 0;

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Day hero */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={() => setOffset(offset - 1)}
          className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-ink-dim"
          aria-label="Previous day"
        >
          <Icon name="left" size={24} />
        </button>

        <div className="text-center flex-1">
          <div className="text-day font-bold text-ink-text leading-none">{view.getDate()}</div>
          <div className="text-sm font-semibold text-ink-dim mt-1.5">{S.longDate(key)}</div>
          {isToday ? (
            <div className="mt-2">
              <span className="pill bg-brand/20 text-brand border-2 border-brand/50">Today</span>
            </div>
          ) : (
            <button type="button" onClick={() => setOffset(0)} className="mt-2 pill bg-ink-raised text-ink-dim border-2 border-ink-line">
              Jump to today
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOffset(offset + 1)}
          className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-ink-dim"
          aria-label="Next day"
        >
          <Icon name="right" size={24} />
        </button>
      </div>

      {/* Empty state */}
      {!day || day.tasks.length === 0 ? (
        <div className="card p-6 text-center">
          <Icon name="calendar" size={44} className="text-ink-faint mx-auto mb-4" />
          <p className="text-base font-semibold text-ink-text mb-1.5">No tasks for this day</p>
          <p className="text-base text-ink-dim mb-5 leading-relaxed">
            Generate the month once and every day fills itself in.
          </p>
          <button type="button" onClick={() => setState({ ...state, ...{ tabHint: "month" } })} className="tap bg-brand text-white w-full">
            Go to Month planner
          </button>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className={"text-base font-bold " + (s.all ? "text-done" : "text-ink-text")}>
                {s.all ? "All done! " + s.done + " of " + s.total : s.done + " of " + s.total + " completed"}
              </span>
              <span className="text-base font-bold text-ink-dim">{s.pct}%</span>
            </div>
            <Progress pct={s.pct} all={s.all} />
            <button
              type="button"
              onClick={() => setShowDoneFirst(!showDoneFirst)}
              className="mt-3 text-sm font-semibold text-brand"
            >
              {showDoneFirst ? "Move finished to bottom" : "Move finished to top"}
            </button>
          </div>

          {/* All-done banner */}
          {s.all && (
            <div className="card p-4 mb-4 border-done bg-done/10">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="sparkle" size={26} className="text-done flex-shrink-0" />
                <p className="text-base font-bold text-done">
                  All done! {s.total} of {s.total} completed
                </p>
              </div>
              <button type="button" onClick={() => onReport(key, state.days[key], false)} className="tap bg-done text-white w-full">
                <span className="flex items-center justify-center gap-2">
                  <Icon name="share" size={20} />
                  Report to director
                </span>
              </button>
            </div>
          )}

          {/* Tasks */}
          <div className="flex flex-col gap-2.5">
            {sorted.map((t) => (
              <Row key={t.id} task={t} onToggle={() => toggle(t)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}