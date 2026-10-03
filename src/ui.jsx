/* Shared UI. SVG icons only - never emoji, because emoji fall back to
   tofu boxes on devices without an emoji font. Astigmatism-safe sizing:
   stroke-width 2.25+, 24px grid, no hairlines. */

export function Icon({ name, size = 22, className = "" }) {
  const s = { width: size, height: size, className, viewBox: "0 0 24 24", fill: "none" };
  const common = {
    stroke: "currentColor",
    strokeWidth: 2.25,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const paths = {
    check: <polyline points="4,12.5 9.5,18 20,6.5" {...common} />,
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="2.5" {...common} />
        <line x1="3" y1="10" x2="21" y2="10" {...common} />
        <line x1="8" y1="2.5" x2="8" y2="6.5" {...common} />
        <line x1="16" y1="2.5" x2="16" y2="6.5" {...common} />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.6" {...common} />
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" {...common} />
        <path d="M16.5 5.2a3.6 3.6 0 0 1 0 6.9" {...common} />
        <path d="M18 14.4c2.1.7 3.5 2.7 3.5 5.6" {...common} />
      </>
    ),
    history: (
      <>
        <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" {...common} />
        <polyline points="3,3.5 3,8 7.5,8" {...common} />
        <polyline points="12,7.5 12,12.5 16,14.5" {...common} />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" {...common} />
        <line x1="5" y1="12" x2="19" y2="12" {...common} />
      </>
    ),
    copy: (
      <>
        <rect x="9" y="9" width="12.5" height="12.5" rx="2.5" {...common} />
        <path d="M5.5 15H4.5a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2H13a2 2 0 0 1 2 2v1" {...common} />
      </>
    ),
    trash: (
      <>
        <polyline points="3.5,6 20.5,6" {...common} />
        <path d="M8.5 6V4.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V6" {...common} />
        <path d="M6 6v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" {...common} />
        <line x1="10" y1="11" x2="10" y2="17" {...common} />
        <line x1="14" y1="11" x2="14" y2="17" {...common} />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" {...common} />
        <line x1="14.5" y1="6.5" x2="17.5" y2="9.5" {...common} />
      </>
    ),
    bolt: <path d="M13.5 2.5 4 13.5h6l-.5 8 9.5-11h-6l.5-8z" {...common} />,
    download: (
      <>
        <path d="M12 3.5v11" {...common} />
        <polyline points="7.5,10.5 12,15 16.5,10.5" {...common} />
        <path d="M4 17.5v1.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5" {...common} />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" {...common} />
        <line x1="15.5" y1="15.5" x2="21" y2="21" {...common} />
      </>
    ),
    close: (
      <>
        <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" {...common} />
        <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" {...common} />
      </>
    ),
    left: <polyline points="14.5,5 8,12 14.5,19" {...common} />,
    right: <polyline points="9.5,5 16,12 9.5,19" {...common} />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3.2" {...common} />
        <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" {...common} />
      </>
    ),
    share: (
      <>
        <path d="M12 3.5v11" {...common} />
        <polyline points="7.5,8 12,3.5 16.5,8" {...common} />
        <path d="M4 14.5v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" {...common} />
      </>
    ),
    chart: (
      <>
        <line x1="4" y1="20" x2="20" y2="20" {...common} />
        <rect x="5.5" y="12" width="4" height="8" rx="1" {...common} />
        <rect x="11.5" y="7" width="4" height="13" rx="1" {...common} />
        <rect x="17" y="4" width="4" height="16" rx="1" {...common} />
      </>
    ),
    tag: (
      <>
        <path d="M11.5 3.5H20a.5.5 0 0 1 .5.5v8.5a2 2 0 0 1-.6 1.4l-6.6 6.6a2 2 0 0 1-2.8 0l-6.6-6.6a2 2 0 0 1 0-2.8l6.6-6.6a2 2 0 0 1 1.4-.5z" {...common} />
        <circle cx="16.5" cy="8" r="1.4" fill="currentColor" />
      </>
    ),
    sparkle: (
      <path d="M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5z" {...common} />
    ),
  };
  return <svg {...s}>{paths[name] || null}</svg>;
}

/* ---------------- Checkbox ---------------- */
export function Check({ on, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label || (on ? "Mark not done" : "Mark done")}
      className={"check" + (on ? " on" : "")}
    >
      {on && <Icon name="check" size={26} className="text-white" />}
    </button>
  );
}

/* ---------------- Progress bar ---------------- */
export function Progress({ pct, all }) {
  const color = all ? "bg-done" : "bg-brand";
  return (
    <div className="w-full h-3 rounded-full bg-ink-bg border-2 border-ink-line overflow-hidden">
      <div className={"h-full rounded-full transition-all duration-500 " + color} style={{ width: pct + "%" }} />
    </div>
  );
}

/* ---------------- Toast ---------------- */
export function Toast({ msg, tone }) {
  if (!msg) return null;
  const bg =
    tone === "win" ? "bg-done" : tone === "error" ? "bg-red-600" : "bg-brand";
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-5 z-50 px-5 min-h-[48px] flex items-center gap-2 rounded-2xl shadow-lift max-w-[92vw]">
      <div className={"flex items-center gap-2.5 rounded-2xl px-5 py-3.5 " + bg}>
        <Icon name={tone === "error" ? "close" : "check"} size={20} className="text-white flex-shrink-0" />
        <span className="text-base font-semibold text-white leading-snug">{msg}</span>
      </div>
    </div>
  );
}

/* ---------------- Modal sheet ---------------- */
export function Sheet({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-ink-surface border-t-4 border-brand rounded-t-3xl p-5 pb-8 shadow-lift max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink-text">{title}</h2>
          <button type="button" onClick={onClose} className="tap !min-h-[48px] !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-ink-dim">
            <Icon name="close" size={22} />
          </button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

/* ---------------- Bottom nav (thumb zone) ---------------- */
export function TabBar({ tab, setTab }) {
  const items = [
    { id: "today", label: "Today", icon: "calendar" },
    { id: "month", label: "Month", icon: "bolt" },
    { id: "clients", label: "Clients", icon: "users" },
    { id: "history", label: "History", icon: "history" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-ink-surface border-t-2 border-ink-line" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const on = tab === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setTab(it.id)}
              className={
                "min-h-[62px] flex flex-col items-center justify-center gap-1 " +
                (on ? "bg-brand/15 border-t-4 border-brand" : "border-t-4 border-transparent")
              }
              aria-current={on ? "page" : undefined}
            >
              <Icon name={it.icon} size={24} className={on ? "text-brand" : "text-ink-faint"} />
              <span className={"text-xs font-semibold " + (on ? "text-brand" : "text-ink-faint")}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}