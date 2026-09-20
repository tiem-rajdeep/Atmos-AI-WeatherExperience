# Atmos — AI Weather Experience
## Product Requirements Document (PRD)

**Author:** Rajdeep
**Type:** Personal Portfolio Project (Beginner–Intermediate)
**Version:** 1.0
**Last Updated:** September 2026

---

## 1. Overview

Atmos is a weather web app that turns the *entire interface* into a living reflection of real-world weather. Instead of a static "28°C, Rainy" card, the whole screen becomes an animated rain environment — dark glass panels, falling droplets, soft lightning flicker, and a plain-English AI insight like *"Rain is likely to continue for the next 2 hours — carry an umbrella."*

A small "Weather Character" (frog, butterfly, penguin, etc.) lives quietly in the scene and reacts to the weather, giving the app a personality that sets it apart from generic weather apps.

**Elevator pitch:** *"A weather app that doesn't tell you the weather — it puts you inside it."*

---

## 2. Goals

| Goal | Why it matters |
|---|---|
| Build a visually striking, portfolio-worthy project | Demonstrates UI/animation skill beyond basic CRUD apps |
| Practice real API integration | Weather API + (optional) AI API = real-world data flow |
| Practice state-driven UI design | Same components render differently based on data — great CSS/JS practice |
| Ship on both desktop and mobile | Responsive design practice, one core skill gap to close |
| Keep scope realistic | Avoid over-engineering; ship a polished MVP first |

### Non-Goals (v1)
- No user accounts / login
- No multi-city saved list (single searched city only, v1)
- No native app — responsive web app only
- No offline mode

---

## 3. Target Tech Stack (Beginner–Intermediate Friendly)

Chosen to match your current skills (HTML/CSS/JS, heading toward MERN) without requiring a heavy framework detour.

| Layer | Choice | Why |
|---|---|---|
| Structure | HTML5 | You already know this well |
| Styling | **Tailwind CSS** | Fast to build glassmorphism + responsive layouts without writing tons of custom CSS; still teaches real CSS concepts via utility classes |
| Interactivity | **Vanilla JavaScript (ES6+)** | No React needed for v1 — keeps focus on JS fundamentals (fetch, DOM, async/await) which strengthens your MERN prep |
| Animations | **CSS animations/keyframes** for ambient effects (rain, snow, glow) + **GSAP (free tier)** for character movement | GSAP is beginner-friendly and far more reliable than hand-rolled JS animation loops |
| Weather Data | **OpenWeatherMap API** (free tier) | Most beginner-friendly weather API, great docs, generous free quota |
| AI Insight Layer | Rule-based JS logic (v1) → optional Claude/OpenAI API call (v2 stretch) | Start with clever if/else + templates so the app works with zero AI cost; upgrade later |
| Hosting | **Vercel** or **Netlify** | Free, instant deploys, great for portfolio links |
| Icons | Lucide or Phosphor icons (SVG) | Lightweight, no cartoon look |

> **Optional upgrade path (v2):** Once comfortable, migrate the JS logic into React components — this becomes a great "before/after" portfolio story (vanilla JS → React refactor).

---

## 4. Core Features (MVP Scope)

### 4.1 Weather Data Engine
- Search a city (text input) OR use browser geolocation
- Fetch current weather + short forecast (next few hours) from OpenWeatherMap
- Map API weather codes → one of Atmos's internal **Weather States**: `clear`, `rain`, `snow`, `windy`, `storm`, `cloudy`, `night-clear` (extend later)

### 4.2 Dynamic Atmosphere System
Each Weather State drives:
- Background gradient/color palette
- Animated environment layer (see §5)
- Glass panel tint/opacity
- Ambient sound *(optional stretch — keep muted by default)*

### 4.3 AI-Style Human Insight
A single, short, natural-language line generated from the data, e.g.:
- ☔ "Rain is likely to continue for the next 2 hours — an umbrella would help."
- ☀️ "Clear skies all afternoon — good time for a walk."
- 🌬️ "Winds are picking up — secure any loose items outside."

**v1 approach:** template strings driven by conditions (temperature trend, precipitation probability, wind speed) — no external AI call needed, keeps it free and fast.
**v2 stretch:** send the raw weather JSON to an LLM API with a tight prompt to generate this line dynamically for more variety.

### 4.4 Weather Character System
| Weather | Character | Behavior |
|---|---|---|
| Rain | 🐸 Frog | Occasionally jumps into a puddle near the bottom |
| Sunny | 🦋 Butterfly | Drifts/flies across the screen periodically |
| Snow | 🐧 Penguin | Slides/waddles slowly at the bottom |
| Windy | 🍃 Leaves | Leaves blow across the screen |
| Storm | ⚡ Small creature | Flickers/reacts on lightning bolts |
| Clear night | 🦉 Owl *(optional add)* | Blinks occasionally |

**Design rule: subtlety over cartoon.** Character should be small (40–70px), low-opacity when idle, animate only every 10–20 seconds — a detail people notice on a second look, not a mascot dominating the UI.

### 4.5 Responsive Layout (Desktop + Mobile)
- **Desktop:** wide glass card centered with generous background animation space
- **Mobile:** full-bleed background, stacked glass cards, character scaled down and repositioned to avoid overlapping text
- Tailwind breakpoints handle this cleanly (`sm:`, `md:`, `lg:`)

### 4.6 Core UI Elements
- Search bar / location button
- Main glass card: city, temp, condition icon, AI insight line
- Secondary glass cards: humidity, wind speed, "feels like", hourly mini-forecast strip
- Weather character layer (positioned absolutely, behind/around cards)
- Loading state (skeleton glass cards, not spinners — stay on-theme)
- Error state (city not found, API failure) — keep in the glass aesthetic, not a plain alert

---

## 5. UI/UX Architecture

```
Background (animated gradient, weather-state driven)
   ↓
Animated weather environment layer (SVG/CSS particles: rain, snow, leaves, lightning)
   ↓
Weather Character layer (absolute positioned, subtle animation)
   ↓
Blur layer (backdrop-filter: blur)
   ↓
Semi-transparent glass cards (bg-white/10 style, Tailwind)
   ↓
Soft borders (1px, low-opacity white/light)
   ↓
Subtle glow (box-shadow, weather-tinted — blue glow for rain, gold for sun)
```

### Visual Design Tokens (starting point)

| Weather State | Background | Accent Glow | Mood |
|---|---|---|---|
| Clear/Sunny | Warm gradient (amber → sky blue) | Soft gold | Bright, airy |
| Rain | Cool gradient (slate → deep blue) | Cool blue | Moody, calm |
| Snow | Pale gradient (white → light blue-grey) | Icy white-blue | Quiet, soft |
| Storm | Dark gradient (charcoal → deep purple) | Flickering white/violet | Dramatic, tense |
| Windy | Muted green-grey gradient | Pale green | Breezy |
| Clear Night | Deep navy → indigo gradient | Soft silver | Calm, starlit |

Keep text contrast accessible (WCAG AA) against every background — this is a common beginner mistake with glassmorphism, worth testing explicitly.

---

## 6. Technical Implementation Notes

### 6.1 Suggested File Structure
```
atmos/
├── index.html
├── /css
│   └── style.css          (custom keyframes beyond Tailwind)
├── /js
│   ├── api.js              (OpenWeatherMap fetch logic)
│   ├── weatherState.js      (maps API data → internal weather state)
│   ├── insights.js          (rule-based AI insight generator)
│   ├── characters.js        (character spawn/animation logic, GSAP)
│   ├── ui.js                (DOM updates, render glass cards)
│   └── main.js               (app entry point, event listeners)
├── /assets
│   └── icons, character SVGs
└── README.md
```

### 6.2 Key JS Concepts You'll Practice
- `fetch` + `async/await` + error handling
- Environment variables for API key (via build tool or a simple config approach for static hosting)
- State management without a framework (a single `appState` object + re-render function)
- Debouncing the search input
- `requestAnimationFrame` or GSAP timelines for ambient particle motion

### 6.3 Performance Notes
- Cap particle count (rain drops, leaves) — beginners often spawn too many DOM elements; prefer CSS-only particle loops or `<canvas>` for high counts
- Respect `prefers-reduced-motion` media query — pause heavy animation for accessibility
- Lazy-load character animations only when their weather state is active

---

## 7. Build Phases (Suggested Milestones)

| Phase | Deliverable |
|---|---|
| **Phase 1 — Foundation** | Static layout, Tailwind glass card, hardcoded weather state, responsive skeleton (desktop + mobile) |
| **Phase 2 — Live Data** | OpenWeatherMap integration, search + geolocation, real data rendering |
| **Phase 3 — Atmosphere Engine** | Background/animation switching per weather state, glow/border theming |
| **Phase 4 — AI Insight Layer** | Rule-based insight generator wired to real data |
| **Phase 5 — Weather Characters** | Character system with subtle animations per state |
| **Phase 6 — Polish** | Loading/error states, accessibility pass, mobile QA, deploy to Vercel/Netlify |
| **Phase 7 (Stretch)** | LLM-powered dynamic insights, ambient sound toggle, hourly/weekly forecast view |

---

## 8. Success Criteria (v1)

- [ ] Works smoothly on both desktop and mobile viewports
- [ ] All 5–6 weather states have a distinct, polished visual identity
- [ ] Character appears and animates subtly without feeling gimmicky
- [ ] AI insight line always feels relevant and human, never robotic/generic
- [ ] App loads and updates in under ~2 seconds on a typical connection
- [ ] No layout breakage on narrow (320px) screens
- [ ] Deployed live with a shareable link for your portfolio

---

## 9. Stretch Goals (Post-MVP)

- Multiple saved cities with quick-switch
- Real LLM-generated insights (Claude/OpenAI API) with cached responses to control cost
- Sound design (rain ambience, wind) with mute toggle
- Dark/light manual override alongside weather-driven theme
- Share-as-image feature ("share today's atmosphere" card for social media)
- PWA support (installable, works offline with last-fetched data)

---

## 10. Why This Project Is a Strong Portfolio Piece

- Shows **API integration** (fetch, async data, error handling)
- Shows **design sensibility** (glassmorphism, motion, color theory) — most student portfolios lack this
- Shows **state-driven UI thinking**, which transfers directly to React/MERN later
- Has a **memorable hook** (the weather character) that make it stand out in interviews — an easy "let me show you something" project
