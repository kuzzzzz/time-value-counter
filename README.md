# Time Value Counter

**Presence-verified counting to 10,000 – 100,000.**

Inspired by MrBeast’s legendary counting video, but designed for people with real lives. No camera, no studio, no 40-hour continuous session required. Just focused attention, one number at a time, with a permanent verifiable log.

> Most people will never count this high.  
> Yet the money supply keeps expanding.  
> What is your time actually worth?

## Live Demo (GitHub Pages)

Once you enable Pages (see below), the app will be available at:

**https://kuzzzzz.github.io/time-value-counter/**

## Features

- **Selectable goal**: 10k / 25k / 50k / 75k / 100k
- **Every count is timestamped** and grouped into sessions
- **Session notes** — what was happening in the background
- **Presence verification**:
  - Tab-focus detection (counting blocked when you leave the tab)
  - Random presence challenges (simple math checks)
- **Verifiable logs across devices**:
  - **Export** downloads a JSON proof that includes a SHA-256 content hash
  - **Import** the same file on another phone/laptop to continue exactly where you left off
- Live stats: active time, sessions, rate, estimated finish
- Comparison / reflection cards
- **PWA** — installable on phone (Add to Home Screen)
- Works fully offline
- Keyboard: Space to count
- Clean dark UI

## How to use across devices

1. Count on Device A
2. Tap **Export** → save the JSON somewhere (Drive, email, iCloud, USB…)
3. On Device B open the app → tap **Import** → choose the JSON file
4. Continue. The log (and the hash) travels with you.

This is currently the most reliable zero-backend way to have a verifiable, portable record of your focused time.

## Enable GitHub Pages (one-time)

1. Go to the repo → **Settings** → **Pages**
2. Under “Build and deployment” → Source: **Deploy from a branch**
3. Branch: `main` / folder: `/ (root)`
4. Save

After a minute the site will be live at:
`https://kuzzzzz.github.io/time-value-counter/`

## Philosophy

The original video was spectacle. This version is quieter and more personal:

- It forces you to feel how long focused attention actually takes.
- It creates an immutable personal log of time spent.
- It sits next to the daily reality that currencies inflate while most humans have never counted this high.

Treat it as a meditation, an experiment, a statement, or a long game with yourself.

## Tech

Pure client-side (HTML + CSS + vanilla JS).  
No backend, no accounts, no tracking.  
PWA via `manifest.json` + `sw.js`.  
Data in `localStorage` + portable JSON logs with SHA-256 hash.

## Roadmap

- Optional real cloud sync / login (Supabase / GitHub)
- Public “I finished” wall (opt-in)
- Live inflation / Bitcoin / gold comparison data
- Daily goals & streaks
- Stronger cryptographic signing of logs

## License

MIT.

---

*Start the count. Export often. See how far focused time can go.*
