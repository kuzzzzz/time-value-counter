# Time Value Counter — Features & Roadmap

> Living checklist so ideas don’t get lost.  
> Live app: GitHub Pages · Stack: static HTML/JS + Supabase

---

## Shipped (current)

### Core counting
- [x] Paced count (min interval ~750ms; no spacebar hold spam)
- [x] Voice call-out of numbers (1x / 1.5x / 2x) with lock until speech ends
- [x] Presence / focus checks (tab visibility + math challenges)
- [x] Selectable goals (10k–100k chips) + **custom goal number**
- [x] Session tracking (only sessions with counts > 0)
- [x] Session notes while counting
- [x] Session notes journal (searchable archive + export)
- [x] Local storage + cloud sync (Supabase progress)
- [x] Public leaderboard
- [x] Public proof links (`?u=username`)
- [x] Share PNG progress card
- [x] PWA (manifest + service worker)
- [x] Milestone confetti (aesthetic numbers: 69, 666, 1111, etc.)
- [x] “My Progress” stats (active time, sessions, pace, ETA, form strip)
- [x] “While you counted…” comparisons (shorts equivalent, wage, heartbeats, year-end pace)
- [x] Tips / “Buy my focus” waitlist UI
- [x] **Short count / sprint** (e.g. 1k today) with optional “add to main total”

### Feed mode
- [x] Optional YouTube feed mode (COUNT keeps playing; NEXT skips + counts)
- [x] Topic chips (Shorts / Study / Lofi / News / Tech) via curated video lists
- [x] Manual playlist / video paste for study focus
- [ ] YouTube Data API live discovery (API key planned)
- [ ] TikTok / Instagram (not practical on pure web without partners)

### Auth
- [x] Email + password sign up / sign in
- [x] Cloud progress sync across devices (when signed in)
- [x] Set / change password in Settings
- [x] Forgot password (email reset link)
- [x] Google OAuth button (requires enabling Google in Supabase Auth dashboard)

---

## Queued ideas

### Growth / campaigns
- [ ] “First 10 to 10k” cohort / race
- [ ] Focus credits / tokens (non-cash first)
- [ ] Redeem-for-cash later (fixed pool, terms, anti-cheat)
- [ ] Referrals (invitee hits 100 paced counts → both get credits)

### Engagement
- [ ] Shareable session cards mid-milestone
- [ ] Memory flashcards during count (optional)
- [ ] Voice personality options (calm / goofy / etc.)
- [ ] Year-end daily quota countdown card
- [ ] Pin / star important notes

### Social / attention economy
- [ ] Peer tip jar (Paystack / Flutterwave / etc.)
- [ ] “Buy my focus” live indicator while counting
- [ ] Richer public profiles

### Future (harder)
- [ ] Overlay / floating counter over other apps (native or extension)
- [ ] Background event context (careful with quality)

---

## Explicit non-goals / rejected for now
- Scraping Facebook profiles for rating cards
- Open-ended cash rewards without a fixed pool
- Binding every count to auto-advancing short-form only (Feed is optional)

---

## Technical notes
- Repo: `kuzzzzz/time-value-counter`
- Supabase: auth, `progress`, `profiles`, `leaderboard` view, `tip_interest`
- Cache version in `sw.js` bumped on each ship
- **Google OAuth:** Supabase → Authentication → Providers → Google → client ID/secret; redirect URL = site origin
- **YouTube API:** prefer edge function so key is not public in static frontend
- **Password recovery:** Settings → set password; or Forgot password sends reset email

---

## Decision log
| Decision | Choice |
|----------|--------|
| Focus vs Feed | Separate session `mode`; campaigns should use Focus-only |
| Search embeds | Abandoned (YouTube blocked); curated IDs + future API |
| Sessions | Increment only if `counts > 0` |
| Sync | Max-merge count; cloud priority when higher |
| Short counts | Optional sprint track; checkbox to fold into main total |

---

*Last updated: 2026-10-10*
