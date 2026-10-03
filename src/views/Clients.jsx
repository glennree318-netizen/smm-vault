import React, { useState } from "react";
import { Icon, Sheet } from "../ui.jsx";
import * as S from "../store.js";

const SWATCHES = [
  "#FF69B4", "#4FC3F7", "#FFD54F", "#81C784", "#BA68C8",
  "#FF8A65", "#4DD0E1", "#AED581", "#F06292", "#9575CD",
  "#FFB74D", "#4DB6AC", "#E57373", "#90A4AE", "#BDBDBD",
];

/* ===================== Client list ===================== */
export function Clients({ state, setState, onToast }) {
  const [open, setOpen] = useState(null);

  function addClient() {
    const id = "c" + Date.now();
    const idx = state.clients.length;
    const color = SWATCHES[idx % SWATCHES.length];
    const next = {
      clients: [
        ...state.clients,
        {
          id,
          name: "Client " + (idx + 1),
          color,
          brand: [color, "#2C2C2E", "#F5F5F7", "#8E959F"],
          hashtags: [],
          captions: [],
        },
      ],
    };
    setState(next);
    S.haptic.big();
    setOpen(id);
    onToast("Client added - give it a name", "win");
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h2 className="text-xl font-bold text-ink-text">Client Vault</h2>
        <button
          type="button"
          onClick={addClient}
          className="tap !py-3 bg-brand text-white"
        >
          <span className="flex items-center gap-2">
            <Icon name="plus" size={20} />
            Add
          </span>
        </button>
      </div>
      <p className="text-base text-ink-dim mb-4">
        {state.clients.length} client{state.clients.length === 1 ? "" : "s"} on this phone
      </p>

      {state.clients.length === 0 ? (
        <div className="card p-6 text-center">
          <Icon name="users" size={40} className="text-ink-faint mx-auto mb-3" />
          <p className="text-base font-semibold text-ink-text mb-1">No clients yet</p>
          <p className="text-base text-ink-dim mb-5 leading-relaxed">
            Add your first client to save captions, hashtags and brand colors.
          </p>
          <button type="button" onClick={addClient} className="tap bg-brand text-white w-full">
            <span className="flex items-center justify-center gap-2">
              <Icon name="plus" size={20} />
              Add first client
            </span>
          </button>
        </div>
      ) : (
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
              <span className="block text-base font-bold text-ink-text leading-snug break-words">
                {c.name}
              </span>
              <span className="block text-xs font-semibold text-ink-faint mt-1">
                {c.captions.length} caption{c.captions.length === 1 ? "" : "s"}
              </span>
            </button>
          ))}
        </div>
      )}

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
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!c) return null;

  function patch(fields) {
    setState({
      ...state,
      clients: state.clients.map((x) => (x.id === id ? { ...x, ...fields } : x)),
    });
  }

  function setBrandColor(index, hex) {
    const brand = [...c.brand];
    brand[index] = hex;
    patch({ brand });
  }

  function saveCaption() {
    const v = caption.trim();
    if (!v) return;
    patch({ captions: [v, ...c.captions].slice(0, 50) });
    setCaption("");
    S.haptic.tick();
    onToast("Caption saved", "win");
  }

  function useCaption(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    S.haptic.tick();
    onToast("Caption copied", "win");
  }

  function addTag() {
    let v = tag.trim().replace(/^#/, "");
    if (!v) return;
    v = v.replace(/\s+/g, "");
    if (!v || c.hashtags.includes(v)) { setTag(""); return; }
    patch({ hashtags: [...c.hashtags, v] });
    setTag("");
    S.haptic.light();
  }

  function removeClient() {
    setState({
      ...state,
      clients: state.clients.filter((x) => x.id !== id),
    });
    S.haptic.big();
    setConfirmDelete(false);
    onClose();
    onToast("Client deleted", "info");
  }

  return (
    <Sheet open={!!id} onClose={onClose} title="Client details">
      {/* Name */}
      <p className="text-sm font-bold text-ink-faint mb-2.5">CLIENT NAME</p>
      <input
        value={c.name}
        onChange={(e) => patch({ name: e.target.value })}
        placeholder="e.g. Milk Tea Shop"
        className="w-full min-h-[48px] px-3.5 rounded-xl bg-ink-bg border-2 border-ink-line text-base font-semibold text-ink-text mb-5"
      />

      {/* Primary color */}
      <p className="text-sm font-bold text-ink-faint mb-2.5">TAG COLOR</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => { patch({ color: hex }); S.haptic.light(); }}
            aria-label={"Set color " + hex}
            className={
              "w-11 h-11 rounded-full border-2 " +
              (c.color === hex ? "border-white" : "border-ink-line")
            }
            style={{ background: hex }}
          />
        ))}
      </div>

      {/* Brand kit - now editable */}
      <p className="text-sm font-bold text-ink-faint mb-2.5">BRAND KIT (tap to change)</p>
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {c.brand.map((hex, i) => (
          <label key={i} className="block text-center cursor-pointer">
            <span className="block w-full aspect-square rounded-xl border-2 border-ink-line overflow-hidden">
              <input
                type="color"
                value={hex}
                onChange={(e) => setBrandColor(i, e.target.value)}
                className="w-full h-full cursor-pointer"
                aria-label={"Brand color " + (i + 1)}
              />
            </span>
            <span className="block text-[10px] font-semibold text-ink-faint mt-1.5 uppercase">
              {hex}
            </span>
          </label>
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
        <button type="button" onClick={addTag} className="tap bg-ink-raised border-2 border-ink-line text-brand" aria-label="Add hashtag">
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

      {/* Danger zone */}
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="tap w-full bg-ink-raised border-2 border-red-900/60 text-red-400 mt-8"
      >
        <span className="flex items-center justify-center gap-2">
          <Icon name="trash" size={20} />
          Delete this client
        </span>
      </button>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title={"Delete " + c.name + "?"}>
        <p className="text-base text-ink-dim leading-relaxed mb-5">
          This removes the client along with {c.captions.length} saved caption
          {c.captions.length === 1 ? "" : "s"} and {c.hashtags.length} hashtag
          {c.hashtags.length === 1 ? "" : "s"}. Completed tasks in History are not affected.
        </p>
        <div className="flex flex-col gap-2.5">
          <button type="button" onClick={removeClient} className="tap bg-red-600 text-white w-full">
            Yes, delete {c.name}
          </button>
          <button type="button" onClick={() => setConfirmDelete(false)} className="tap bg-ink-raised border-2 border-ink-line text-ink-dim w-full">
            Cancel
          </button>
        </div>
      </Sheet>
    </Sheet>
  );
}