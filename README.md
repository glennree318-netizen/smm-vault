# SMM Vault

Monthly planner and daily checklist for social media managers.
**Local-only. Offline-first PWA. No backend, no accounts, no tracking.**

## The problem it solves

Planning a month meant typing roughly 240 calendar entries by hand - about a
full working day, every month. SMM Vault generates the whole month in one tap
(~3 seconds) from a saved task list, and never overwrites days that already
exist, so completed work is safe.

## Features

- **Monthly Planner** - one tap fills every day of a month from your task pool
- **Today** - day checklist with large tap targets, strikethrough + timestamp on completion
- **Client Vault** - 9 clients with brand kits, hashtag chips and a reusable caption library
- **History** - searchable record of everything finished, with CSV export
- **Director report** - one-tap text summary, share straight to WhatsApp
- **Backup** - JSON export/restore, with a nudge if you have not backed up recently

## Design notes: built for astigmatism

Typography and contrast values are set deliberately, and verified by tests:

| Concern | Value |
|---|---|
| Base font size | 17px (never 14px for content) |
| Minimum font weight | 500 (no light/thin 300) |
| Muted text | `#B0B7C3` - stays light, never dimmed to unreadable |
| Body text | `#E8EAED` - not pure white, avoids halation |
| Background | `#0F0F0F` - not pure black, reduces glare |
| Tap targets | 48px minimum |
| Checkbox border | 3px, heavy stroke |
| Icon stroke | 2.25 |
| Letter spacing | +0.01em, line height 1.75 |

## Tech

- React 18, bundled and minified by esbuild (no CDN, works offline)
- Tailwind CSS, compiled to a static file
- SVG icons only - no emoji, so nothing falls back to tofu boxes
- Service worker precaches everything for full offline use
- Haptics via `navigator.vibrate` - works on Android, silently no-ops on iOS

## Data and privacy

Everything lives in `localStorage` on the device. Nothing is uploaded, no network
requests are made at runtime. Because that means a cleared browser loses
everything, the History screen surfaces backup status and offers one-tap JSON
export.

## Build

```bash
npm install
npm run build     # icons + css + js bundle -> public/
npm run verify    # runs the test suite
```

Output is a fully static site in `public/`. Deploy anywhere.

## License

MIT