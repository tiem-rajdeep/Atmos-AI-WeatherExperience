# 🌦️ Atmos — AI Weather Experience

> *"A weather app that doesn't tell you the weather — it puts you inside it."*

A visually immersive weather web app where the entire interface transforms based on real-world weather conditions — animated rain, snow, storms, glassmorphism cards, and a subtle weather character that reacts to the conditions.

---

## ✨ Features

- **6 Weather States** — Clear, Rain, Storm, Snow, Windy, Cloudy, Night variants — each with a distinct animated environment
- **Glassmorphism UI** — Deep glass cards with weather-tinted glows (blue for rain, gold for sun, violet for storm...)
- **Animated Particles** — CSS rain drops, snowflakes, lightning bolts, twinkling stars
- **Weather Characters** — GSAP-animated characters: 🐸 Frog (rain), 🦋 Butterfly (clear), 🐧 Penguin (snow), 🦉 Owl (night), ⚡ Storm creature, 🍃 Blowing leaves (windy)
- **AI-Style Insights** — Human-sounding, contextual insight lines generated from real weather data (no AI API cost!)
- **Hourly Forecast Strip** — Next 6 weather windows at a glance
- **Geolocation** — One-tap weather for your current location
- **Skeleton Loading** — On-theme glass skeleton cards while fetching
- **Fully Responsive** — Designed for both desktop and mobile (320px+)
- **Accessible** — WCAG-AA contrast, `prefers-reduced-motion` support, `aria` labels throughout

---

## 🚀 Getting Started

### 1. Get a Free API Key

Sign up for free at [openweathermap.org](https://openweathermap.org/api) — no credit card needed.

After verifying your email, go to **API Keys** and copy your key.

> ⚠️ New keys take **10–15 minutes** to activate after sign-up.

### 2. Add Your Key

Open `js/config.js` and replace the placeholder:

```js
const CONFIG = {
  OWM_API_KEY: "your_actual_key_here",   // ← paste here
  DEFAULT_CITY: "London",                // ← change default city if you want
  UNITS: "metric",                       // ← "metric" (°C) or "imperial" (°F)
};
```

### 3. Open the App

Simply open `index.html` in your browser — no build step needed.

```
Double-click index.html
```

Or use a local dev server for the best experience:

```bash
# Using VS Code Live Server extension (recommended)
# Or with npx:
npx serve .
```

---

## 📁 Project Structure

```
atmos/
├── api/
│   └── weather.js      ← 🔒 Vercel Serverless Function (hides API key)
├── css/
│   └── style.css       ← Weather state themes, animations, glass cards
├── js/
│   ├── config.js       ← ⚙️ Settings & fallback config
│   ├── api.js          ← Weather fetch logic (uses proxy or local fallback)
│   ├── weatherState.js ← Maps API codes → Atmos states (dusk, day, night)
│   ├── insights.js     ← AI-style insight generator
│   ├── characters.js   ← GSAP character animations + inline SVGs
│   ├── ui.js           ← DOM renderer, particles, loading/error states
│   └── main.js         ← App entry, event listeners, state management
├── Docs/
│   └── Atmos_PRD.md    ← Product Requirements Document
├── .env.example        ← Environment variable template
├── .gitignore          ← Prevents committing secrets & dependencies
├── index.html          ← Main HTML, all UI structure
├── vercel.json         ← Security headers (CSP, X-Frame, Permissions)
└── README.md
```

---

## 🚀 Deployment to Vercel

Atmos comes pre-configured with a secure **Vercel Serverless Function** (`api/weather.js`) to keep your API key hidden server-side.

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Atmos Weather Experience"
   git remote add origin https://github.com/your-username/atmos.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Import your GitHub repository.

3. **Set Environment Variable in Vercel**:
   - In your Vercel Project Settings → **Environment Variables**, add:
     - **Key**: `OWM_API_KEY`
     - **Value**: `your_actual_openweathermap_api_key`
   - Click **Deploy**!

---

*Built with ❤️ by Rajdeep — Atmos v1.0*
