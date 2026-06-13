# FactMatch

**Live at [factmatch.vercel.app](https://factmatch.vercel.app)**

FactMatch is a fact discovery app that makes learning feel like scrolling through a feed you actually enjoy. You get a beautiful masonry grid of real facts pulled live from Wikipedia and a handful of free APIs — no hardcoded trivia, no filler content. Open a card, read it, swipe right if it's useful, swipe left if it's not. Your feed gets smarter the more you interact with it, and everything stays on your device.

No accounts. No servers. No tracking. Just knowledge.

---

## What it does

- Pulls live facts from Wikipedia, trivia databases, and other free sources every time you open it
- Displays them in a responsive masonry grid with real photography
- Tap any card to open it full-screen with a morph animation
- Swipe right (or tap the right side) to mark a fact as useful — swipe left to skip
- Your feed learns your preferences over time and surfaces more of what you like
- Every few swipes, you get a quick recall quiz based on facts you've saved — keeps things sticky
- Export your profile as a shareable image card
- Installable as a PWA — works offline once cached

---

## Fact sources

Everything is fetched live. Nothing is hardcoded.

| Source | What it provides |
|---|---|
| Wikipedia REST API | Random summaries, "on this day" history, real images |
| Open Trivia DB | Categorized trivia across 10+ subjects |
| Cat Facts API | Animal category content |
| Dog API | More animal facts |
| Advice Slip API | Philosophy / lifestyle cards |

If every source is unreachable and there's no cache, the app shows an offline state with a retry button. It never shows fake or placeholder content.

---

## 63 topic categories

Science, Biology, Chemistry, Physics, Mathematics, Space, Climate, Nature, Geology, Oceanography, Tech, AI, Robotics, Cybersecurity, Engineering, Inventions, History, Geography, Travel, Politics, Economics, Business, Finance, Cryptocurrency, Law, Education, Mythology, Folklore, Archaeology, Military, Crime, Art, Literature, Design, Movies, Entertainment, Music, Architecture, Fashion, Comics, Gaming, Photography, Theatre, Anime, Dance, Healthcare, Psychology, Neuroscience, Mental Health, Fitness, Nutrition, Cooking, Meditation, Sustainability, Sociology, Linguistics, Relationships, Animals, Food, Philosophy, Sports, General.

---

## Privacy

All your data — swipe history, preferences, profile name and photo — lives in your browser's `localStorage`. Nothing is ever sent to a server. There are no analytics, no cookies (beyond what you explicitly accept), and no accounts of any kind.

You can clear everything from the Settings panel inside your profile at any time.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Animations | GSAP 3.15 + Framer Motion 12 |
| Smooth scroll | Lenis 1.3 |
| PWA | Hand-rolled service worker, web manifest |
| Personalization | On-device cosine similarity (no ML APIs) |
| Storage | Browser localStorage only |

---

## How the personalization works

There's no external model or API call involved. `lib/recommend.ts` builds a bag-of-words term-frequency vector from your right-swiped facts and ranks new batches by cosine similarity to what you've engaged with, combined with per-category engagement weights. It runs entirely in the browser in milliseconds.

---

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No environment variables needed — every fact source is free and keyless.

---

## Deploying

Push to GitHub, then connect to [Vercel](https://vercel.com/new). Framework is auto-detected as Next.js. No environment variables required for the app to run. The app deploys and works fully on Vercel's free tier.

If you want to add webmaster verification for search consoles, add these to your Vercel environment variables:

```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_SITE_VERIFICATION=
NEXT_PUBLIC_YANDEX_SITE_VERIFICATION=
NEXT_PUBLIC_BAIDU_SITE_VERIFICATION=
NEXT_PUBLIC_NAVER_SITE_VERIFICATION=
NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION=
```

---

## Extending it

To add a new fact source, add a fetcher function to the `FETCHERS` array in `lib/facts.ts`. It just needs to return `Fact[]`. The category detection in `guessCategory()` in the same file handles auto-categorization based on content keywords.

To add a new category, add it to `CATEGORY_SEEDS` in `lib/facts.ts`, add its color to `CATEGORY_VIVID` in `lib/visuals.ts`, add an icon to `CATEGORY_ICONS` in `components/ProfileModal.tsx`, and include it in the `ALL_CATEGORIES` arrays in `components/OnboardingScreen.tsx` and `components/ProfileModal.tsx`.

---

Built by [Humaira Ambreen](https://humairaambreen.vercel.app)
