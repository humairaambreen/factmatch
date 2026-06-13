# FactMatch

A Pinterest-style masonry feed of facts — sourced live from Wikipedia and
several free fact APIs (no hardcoded trivia in source). Tap a card to open
a full-bleed, blurred "morph" overlay; swipe right ("Useful") or left
("Skip") like a dating-app deck. Every 4-5 swipes you get a quick recall
quiz built only from facts you've swiped right. Your profile (name, photo,
and category interest breakdown) lives entirely in your browser's
localStorage — nothing is sent to a server — and can be exported as a
shareable PNG card.

## Stack

- **Next.js 16.2.9** (App Router, Turbopack dev & build)
- **React 19.2**
- **Tailwind CSS 4.3** (CSS-first `@theme` config)
- **Framer Motion 12** — shared-layout "morph" transitions + swipe gestures
- **GSAP 3.15** (ScrollTrigger included free since 3.13) — masonry reveal animations
- Hand-rolled, dependency-free **service worker** (`public/sw.js`) for an
  installable offline-capable PWA

## Fact sources (all free, no API keys)

Everything is fetched live — nothing is hardcoded:

- **Wikipedia REST API** — `page/random/summary` (near-infinite "did you
  know" content with images) and `feed/onthisday/selected` (today in history)
- [Useless Facts API](https://uselessfacts.jsph.dev/)
- [Cat Facts](https://catfact.ninja/)
- [Dog API facts](https://dog-api.kinduff.com/)
- [Numbers API](http://numbersapi.com/) trivia
- [Open Trivia DB](https://opentdb.com/) (re-categorized into Science,
  History, Geography, Animals, Art, Sports, Entertainment, Food, General)
- [Advice Slip API](https://api.adviceslip.com/)

If every API is unreachable (fully offline, no cache yet), the feed shows a
"couldn't reach any fact sources" state with a retry button — no fake
content is ever shown.

## Personalization & recommendations

`lib/recommend.ts` implements a tiny, dependency-free **on-device
content-similarity model**: it builds bag-of-words term-frequency vectors
for fact text and ranks new batches by cosine similarity to your
right-swiped ("useful") facts, combined with category-level engagement
weights (`lib/storage.ts`). No external ML service or model download — it's
pure JS and runs instantly.

## How it works

- **Masonry feed** (`components/MasonryFeed.tsx`): CSS-columns, 2/3/4
  responsive columns, infinite scroll via `IntersectionObserver` (no "load
  more" button — it just keeps streaming), GSAP `ScrollTrigger` stagger
  reveals.
- **Feed tiles** (`components/FactTile.tsx`): real background photography
  (via Picsum / Wikipedia thumbnails), gradient overlay, category pill,
  fact text.
- **Morph overlay** (`components/FactOverlay.tsx`): tapping a card uses a
  Framer Motion shared `layoutId` so the tile visually expands from its
  grid position into a centered, blurred-background overlay (leaving ~5%
  margin around it). Drag left/right to swipe through the deck, "Useful" /
  "Skip" stamps animate based on drag direction, with pill buttons as a
  fallback.
- **Recall quiz** (`components/QuizModal.tsx`): every 4–5 swipes, shown 4
  facts and asked which one was swiped "Useful" — the correct answer is
  always drawn from your right-swipe history, never random.
- **Cookie/consent banner** (`components/CookieConsent.tsx`): asks
  permission before persisting swipe history & profile to localStorage.
  Declining just means the session-only personalization (still active in
  memory) won't be saved for next time.
- **Profile** (`components/ProfileModal.tsx`): set a name + local photo
  (stored as base64 in localStorage), see a bar-chart breakdown of your
  interests per category (like-rate %), and export a PNG profile card
  (drawn on `<canvas>`, no extra libraries).

## Color system

Defined in `app/globals.css` via Tailwind 4's `@theme`:

| Token | Hex |
| --- | --- |
| `--color-onyx` | `#0A0A0A` |
| `--color-slate` | `#536878` |
| `--color-alabaster` | `#E5E4E2` |

The "Obsidian Chrome" gradient (dark → slate → alabaster) is used for the
hero banner, overlay accents, and the exported profile card.

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel (free)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework preset: **Next.js** (auto-detected). No environment variables
   required — everything is free/keyless.
4. Deploy.

## Notes

- Swap the icon PNGs in `public/icons/` for your own branding if desired.
- Picsum/Wikipedia images are loaded `unoptimized` via `next/image` since
  they're external and already optimized at source — `next.config.ts`
  allows all `https` remote hosts.
- To add more free fact sources, add a fetcher function to
  `FETCHERS` in `lib/facts.ts` — it just needs to return `Fact[]`.
