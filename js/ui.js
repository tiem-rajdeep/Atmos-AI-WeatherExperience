// ============================================================
//  Atmos — UI Renderer
//  Handles all DOM updates, glass card rendering, particles,
//  skeleton loading states, and error states
// ============================================================

// ── Weather State Visual Config ──────────────────────────────
const STATE_THEMES = {
  clear: {
    bodyClass: "state-clear",
    glowClass: "glow-gold",
    icon: "☀️",
    particleType: "dust",
  },
  dusk: {
    bodyClass: "state-dusk",
    glowClass: "glow-gold",
    icon: "🌆",
    particleType: "dust",
  },
  cloudy: {
    bodyClass: "state-cloudy",
    glowClass: "glow-grey",
    icon: "☁️",
    particleType: "dust",
  },
  rain: {
    bodyClass: "state-rain",
    glowClass: "glow-blue",
    icon: "🌧️",
    particleType: "rain",
  },
  storm: {
    bodyClass: "state-storm",
    glowClass: "glow-violet",
    icon: "⛈️",
    particleType: "storm",
  },
  snow: {
    bodyClass: "state-snow",
    glowClass: "glow-ice",
    icon: "❄️",
    particleType: "snow",
  },
  windy: {
    bodyClass: "state-windy",
    glowClass: "glow-green",
    icon: "💨",
    particleType: "dust",
  },
  "night-clear": {
    bodyClass: "state-night-clear",
    glowClass: "glow-silver",
    icon: "🌙",
    particleType: "stars",
  },
  "night-cloudy": {
    bodyClass: "state-night-cloudy",
    glowClass: "glow-silver",
    icon: "🌥️",
    particleType: "stars",
  },
};

const ALL_STATE_CLASSES = Object.values(STATE_THEMES).map((t) => t.bodyClass);
const ALL_GLOW_CLASSES = Object.values(STATE_THEMES).map((t) => t.glowClass);

let particleInterval = null;

// ── Temperature & Unit Helpers ────────────────────────────────

function convertTemp(tempVal, fromUnits, toUnits) {
  if (tempVal === undefined || tempVal === null) return 0;
  if (fromUnits === toUnits) return tempVal;
  if (fromUnits === "metric" && toUnits === "imperial") {
    return (tempVal * 9) / 5 + 32;
  }
  if (fromUnits === "imperial" && toUnits === "metric") {
    return ((tempVal - 32) * 5) / 9;
  }
  return tempVal;
}

function updateUnitToggleUI() {
  const toggleBtn = document.getElementById("unit-toggle");
  if (!toggleBtn) return;
  const cEl = toggleBtn.querySelector(".unit-c");
  const fEl = toggleBtn.querySelector(".unit-f");
  if (CONFIG.UNITS === "imperial") {
    cEl?.classList.remove("active");
    fEl?.classList.add("active");
  } else {
    cEl?.classList.add("active");
    fEl?.classList.remove("active");
  }
}

// ── Main Render Function ─────────────────────────────────────

/**
 * Render the full weather UI from API data
 * @param {Object} current - OWM current weather
 * @param {Object} forecast - OWM forecast
 * @param {string} weatherState - Atmos internal state
 */
function renderWeatherUI(current, forecast, weatherState) {
  const theme = STATE_THEMES[weatherState] || STATE_THEMES["clear"];

  // 1. Update unit toggle button state
  updateUnitToggleUI();

  // 2. Apply weather state theme to body
  applyWeatherTheme(weatherState, theme);

  // 3. Update main glass card
  renderMainCard(current, weatherState, theme);

  // 4. Update stat cards
  renderStatCards(current);

  // 5. Update hourly forecast strip
  renderHourlyForecast(forecast);

  // 6. Generate and show AI insight
  const insight = generateInsight(current, forecast, weatherState);
  setInsight(insight);

  // 7. Start particles
  startParticles(theme.particleType);

  // 8. Activate character
  activateCharacter(weatherState);

  // 9. Hide loading, show content
  hideLoading();
}

// ── Theme Application ────────────────────────────────────────

function applyWeatherTheme(state, theme) {
  const body = document.body;

  // Remove all state classes
  body.classList.remove(...ALL_STATE_CLASSES);
  body.classList.add(theme.bodyClass);

  // Apply glow to glass cards
  document.querySelectorAll(".glass-card").forEach((card) => {
    card.classList.remove(...ALL_GLOW_CLASSES);
    card.classList.add(theme.glowClass);
  });
}

// ── Main Card ─────────────────────────────────────────────────

function renderMainCard(current, weatherState, theme) {
  const fetchedUnits = appState.fetchedUnits || "metric";
  const rawTemp = current.main.temp;
  const rawFeels = current.main.feels_like;

  const temp = Math.round(convertTemp(rawTemp, fetchedUnits, CONFIG.UNITS));
  const feelsLike = Math.round(convertTemp(rawFeels, fetchedUnits, CONFIG.UNITS));
  const conditionDesc = getConditionDescription(current);
  const unitSymbol = CONFIG.UNITS === "imperial" ? "°F" : "°C";
  const city = current.name;
  const country = current.sys?.country ?? "";

  setEl("city-name", `${city}${country ? `, ${country}` : ""}`);
  setEl("temperature", `${temp}${unitSymbol}`);
  setEl("feels-like", `Feels like ${feelsLike}${unitSymbol}`);
  setEl("condition-desc", conditionDesc);
  setEl("condition-icon", theme.icon);
}

// ── Stat Cards ────────────────────────────────────────────────

function renderStatCards(current) {
  const humidity = current.main.humidity;
  const windSpeed = current.wind?.speed ?? 0;
  const fetchedUnits = appState.fetchedUnits || "metric";

  let windStr = "";
  if (CONFIG.UNITS === "imperial") {
    const mph = fetchedUnits === "metric" ? Math.round(windSpeed * 2.23694) : Math.round(windSpeed);
    windStr = `${mph} mph`;
  } else {
    const kmh = fetchedUnits === "metric" ? Math.round(windSpeed * 3.6) : Math.round(windSpeed * 1.60934);
    windStr = `${kmh} km/h`;
  }

  const visibility = current.visibility ? `${(current.visibility / 1000).toFixed(1)} km` : "—";
  const pressure = `${current.main.pressure} hPa`;

  setEl("stat-humidity", `${humidity}%`);
  setEl("stat-wind", windStr);
  setEl("stat-visibility", visibility);
  setEl("stat-pressure", pressure);
}

// ── Hourly Forecast ───────────────────────────────────────────

function renderHourlyForecast(forecast) {
  const container = document.getElementById("hourly-strip");
  if (!container || !forecast?.list?.length) return;

  const fetchedUnits = appState.fetchedUnits || "metric";
  const unitSymbol = CONFIG.UNITS === "imperial" ? "°F" : "°C";
  const items = forecast.list.slice(0, 6);

  container.innerHTML = items
    .map((item) => {
      const time = new Date(item.dt * 1000);
      const hour = time.getHours();
      const ampm = hour >= 12 ? "pm" : "am";
      const hour12 = hour % 12 || 12;
      const temp = Math.round(convertTemp(item.main.temp, fetchedUnits, CONFIG.UNITS));
      const condId = item.weather[0].id;
      const icon = getHourlyIcon(condId);
      const pop = item.pop ? `${Math.round(item.pop * 100)}%` : "";

      return `
        <div class="hourly-item">
          <span class="hourly-time">${hour12}${ampm}</span>
          <span class="hourly-icon">${icon}</span>
          <span class="hourly-temp">${temp}${unitSymbol}</span>
          ${pop ? `<span class="hourly-pop">💧${pop}</span>` : ""}
        </div>
      `;
    })
    .join("");
}

function getHourlyIcon(condId) {
  if (condId >= 200 && condId < 300) return "⛈️";
  if (condId >= 300 && condId < 600) return "🌧️";
  if (condId >= 600 && condId < 700) return "❄️";
  if (condId >= 700 && condId < 800) return "🌫️";
  if (condId === 800) return "☀️";
  if (condId > 800) return "☁️";
  return "🌤️";
}

// ── Insight ───────────────────────────────────────────────────

function setInsight(text) {
  const el = document.getElementById("ai-insight");
  if (!el) return;
  el.style.opacity = 0;
  el.textContent = text;
  // Fade in
  setTimeout(() => {
    el.style.transition = "opacity 0.8s ease";
    el.style.opacity = 1;
  }, 50);
}

// ── Particle System ──────────────────────────────────────────

function startParticles(type) {
  stopParticles();
  const container = document.getElementById("particle-layer");
  if (!container) return;
  container.innerHTML = "";

  if (!type) return;

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  switch (type) {
    case "dust":
      spawnDust(container);
      break;
    case "rain":
      spawnRain(container);
      break;
    case "storm":
      spawnStorm(container);
      break;
    case "snow":
      spawnSnow(container);
      break;
    case "stars":
      spawnStars(container);
      break;
  }
}

function stopParticles() {
  if (particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  const container = document.getElementById("particle-layer");
  if (container) container.innerHTML = "";
}

function spawnRain(container) {
  const count = 60;
  for (let i = 0; i < count; i++) {
    const drop = document.createElement("div");
    drop.className = "rain-drop";
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${Math.random() * 0.5 + 0.6}s`;
    drop.style.animationDelay = `${Math.random() * 2}s`;
    drop.style.opacity = Math.random() * 0.5 + 0.3;
    container.appendChild(drop);
  }
}

function spawnStorm(container) {
  // Rain drops
  spawnRain(container);
  // Lightning flashes
  const lightning = document.createElement("div");
  lightning.className = "lightning-layer";
  container.appendChild(lightning);
  // Random lightning bolts
  spawnLightningBolt(container);
  particleInterval = setInterval(() => {
    spawnLightningBolt(container);
  }, 4000 + Math.random() * 5000);
}

function spawnLightningBolt(container) {
  const existing = container.querySelectorAll(".lightning-bolt");
  existing.forEach((e) => e.remove());

  const bolt = document.createElement("div");
  bolt.className = "lightning-bolt";
  bolt.style.left = `${Math.random() * 60 + 20}%`;
  container.appendChild(bolt);
  setTimeout(() => bolt.remove(), 600);
}

function spawnSnow(container) {
  const count = 45;
  for (let i = 0; i < count; i++) {
    const flake = document.createElement("div");
    flake.className = "snow-flake";
    flake.textContent = ["❄", "❅", "❆"][i % 3];
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.fontSize = `${Math.random() * 10 + 8}px`;
    flake.style.animationDuration = `${Math.random() * 4 + 5}s`;
    flake.style.animationDelay = `${Math.random() * 5}s`;
    flake.style.opacity = Math.random() * 0.5 + 0.4;
    container.appendChild(flake);
  }
}

function spawnStars(container) {
  const count = 70;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 70}%`;
    star.style.width = star.style.height = `${Math.random() * 2 + 1}px`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    container.appendChild(star);
  }
}

function spawnDust(container) {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const dust = document.createElement("div");
    dust.className = "dust-particle";
    dust.style.left = `${Math.random() * 100}%`;
    dust.style.top = `${Math.random() * 85}%`;
    const size = Math.random() * 4 + 2;
    dust.style.width = `${size}px`;
    dust.style.height = `${size}px`;
    dust.style.animationDuration = `${Math.random() * 8 + 8}s`;
    dust.style.animationDelay = `${Math.random() * 6}s`;
    dust.style.opacity = Math.random() * 0.5 + 0.2;
    container.appendChild(dust);
  }
}

// ── Loading & Error States ────────────────────────────────────

function showLoading() {
  const loading = document.getElementById("loading-state");
  const content = document.getElementById("weather-content");
  const errorEl = document.getElementById("error-state");

  if (loading) loading.classList.remove("hidden");
  if (content) content.classList.add("opacity-0", "pointer-events-none");
  if (errorEl) errorEl.classList.add("hidden");
}

function hideLoading() {
  const loading = document.getElementById("loading-state");
  const content = document.getElementById("weather-content");

  if (loading) loading.classList.add("hidden");
  if (content) {
    content.classList.remove("opacity-0", "pointer-events-none");
    // Animate in
    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        content,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }
  }
}

function showError(message) {
  hideLoading();
  stopParticles();
  clearCharacter();

  const errorEl = document.getElementById("error-state");
  const errorMsg = document.getElementById("error-message");
  const content = document.getElementById("weather-content");

  if (errorMsg) errorMsg.textContent = message;
  if (errorEl) errorEl.classList.remove("hidden");
  if (content) content.classList.add("opacity-0", "pointer-events-none");
}

// ── Utility ───────────────────────────────────────────────────

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
