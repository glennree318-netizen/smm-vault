import React, { useState } from "react";
import { Icon, Sheet } from "../ui.jsx";
import * as S from "../store.js";

/* ===================== Client list ===================== */
export function Clients({ state, setState, onToast }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="px-4 pt-4 pb-4">
      <h2 className="text-xl font-bold text-ink-text mb-1">Client Vault</h2>
      <p className="text-base text-ink-dim mb-4">Brand colors, captions and hashtags. All on this phone only.</p>

      <div className="grid grid-cols-2 gap-3">
        {state.clients.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setOpen(c.id); S.haptic.light(); }}
            className="card p-4 text-left active:scale-[0.98] transition-transform"
          >
            <span
              className="block w-11 h-11 rounded-full border-2 border-white/25 mb-3"
              style={{ background: c.color }}
              aria-hidden="true"
            />
            <span className="block text-base font-bold text-ink-text leading-snug">{c.name}</span>
            <span className="block text-xs font-semibold text-ink-faint mt-1">
              {c.captions.length} caption{c.captions.length === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>

      {open && (
        <ClientSheet
          id={open}
          onClose={() => setOpen(null)}
          state={state}
          setState={setState}
          onToast={onToast}
        />
      )}
    </div>
  );
}

/* ===================== Client detail ===================== */
function ClientSheet({ id, onClose, state, setState, onToast }) {
  const c = state.clients.find((x) => x.id === id);
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("");

  if (!c) return null;

  function patch(fields) {
    setState({
      ...state,
      clients: state.clients.map((x) => (x.id === id ? { ...x, ...fields } : x)),
    });
  }

  function saveCaption() {
    const v = caption.trim();
    if (!v) return;
    patch({ captions: [v, ...c.captions].slice(0, 30) });
    setCaption("");
    S.haptic.tick();
    onToast("Caption saved", "win");
  }

  function useCaption(text) {
    navigator.clipboard
      ? navigator.clipboard.writeText(text).catch(() => {})
      : null;
    S.haptic.tick();
    onToast("Caption copied", "win");
  }

  function addTag() {
    let v = tag.trim().replace(/^#/, "");
    if (!v) return;
    v = v.replace(/\s+/g, "");
    if (c.hashtags.includes(v)) { setTag(""); return; }
    patch({ hashtags: [...c.hashtags, v] });
    setTag("");
    S.haptic.light();
  }

  return (
    <Sheet open={!!id} onClose={onClose} title={c.name}>
      {/* Brand colors */}
      <p className="text-sm font-bold text-ink-faint mb-2.5">BRAND KIT</p>
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {c.brand.map((hex, i) => (
          <div key={i} className="text-center">
            <div className="w-full aspect-square rounded-xl border-2 border-ink-line" style={{ background: hex }} />
            <div className="text-[10px] font-semibold text-ink-faint mt-1.5 uppercase">{hex}</div>
          </div>
        ))}
      </div>

      {/* Hashtags */}
      <p className="text-sm font-bold text-ink-faint mb-2.5">HASHTAGS</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {c.hashtags.map((h) => (
          <span key={h} className="pill bg-brand/15 text-brand border-2 border-brand/40">
            #{h}
            <button
              type="button"
              onClick={() => { patch({ hashtags: c.hashtags.filter((x) => x !== h) }); S.haptic.light(); }}
              className="ml-0.5"
              aria-label={"Remove hashtag " + h}
            >
              <Icon name="close" size={16} />
            </button>
          </span>
        ))}
        {!c.hashtags.length && <span className="text-base text-ink-faint">No hashtags yet</span>}
      </div>
      <div className="flex gap-2 mb-6">
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          placeholder="milktea"
          className="flex-1 min-h-[48px] px-3.5 rounded-xl bg-ink-bg border-2 border-ink-line text-base text-ink-text"
        />
        <button type="button" onClick={addTag} className="tap bg-ink-raised border-2 border-ink-line text-brand">
          <Icon name="plus" size={22} />
        </button>
      </div>

      {/* Caption library */}
      <p className="text-sm font-bold text-ink-faint mb-2.5">CAPTION LIBRARY</p>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption once. Reuse it every week."
        rows={4}
        className="w-full px-3.5 py-3 rounded-xl bg-ink-bg border-2 border-ink-line text-base text-ink-text mb-2.5 leading-relaxed"
      />
      <button type="button" onClick={saveCaption} disabled={!caption.trim()} className="tap bg-brand text-white w-full mb-6 disabled:opacity-40">
        Save caption
      </button>

      <div className="flex flex-col gap-2.5">
        {c.captions.map((t, i) => (
          <div key={i} className="rounded-2xl bg-ink-bg border-2 border-ink-line p-3.5">
            <p className="text-base text-ink-text leading-relaxed mb-3">{t}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => useCaption(t)} className="tap flex-1 bg-ink-raised border-2 border-ink-line text-brand justify-center">
                <span className="flex items-center justify-center gap-2">
                  <Icon name="copy" size={20} />
                  Copy
                </span>
              </button>
              <button
                type="button"
                onClick={() => { patch({ captions: c.captions.filter((_, j) => j !== i) }); S.haptic.light(); }}
                className="tap !px-4 flex items-center justify-center bg-ink-raised border-2 border-ink-line text-red-400"
                aria-label="Delete caption"
              >
                <Icon name="trash" size={20} />
              </button>
            </div>
          </div>
        ))}
        {!c.captions.length && (
          <p className="text-base text-ink-faint text-center py-4 leading-relaxed">
            Saved captions show up here.<br />Tap any one to copy it again - no retyping.
          </p>
        )}
      </div>
    </Sheet>
  );
}