// ============================================================
//  Atmos — App Entry Point
//  State management, event listeners, search + geolocation
// ============================================================

// ── App State ─────────────────────────────────────────────────
const appState = {
  currentCity: null,
  currentWeather: null,
  currentForecast: null,
  weatherState: "clear",
  isLoading: false,
  lastFetchTime: null,
  fetchedUnits: "metric",
};

// ── Boot ──────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  // Load default city on startup
  loadWeather(CONFIG.DEFAULT_CITY);
});

// ── Event Listeners ───────────────────────────────────────────

function initEventListeners() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const locationBtn = document.getElementById("location-btn");
  const unitToggleBtn = document.getElementById("unit-toggle");
  const retryBtn = document.getElementById("retry-btn");

  // Search on Enter key
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const city = searchInput.value.trim();
      if (city) loadWeather(city);
    }
  });

  // Debounce live search (optional — fires after 800ms of no typing)
  searchInput?.addEventListener("input", debounce((e) => {
    const city = e.target.value.trim();
    if (city.length >= 3) loadWeather(city);
  }, 800));

  // Search button click
  searchBtn?.addEventListener("click", () => {
    const city = searchInput?.value.trim();
    if (city) loadWeather(city);
  });

  // Geolocation button
  locationBtn?.addEventListener("click", loadWeatherByLocation);

  // Unit toggle button click (°C / °F)
  unitToggleBtn?.addEventListener("click", () => {
    CONFIG.UNITS = CONFIG.UNITS === "metric" ? "imperial" : "metric";
    if (appState.currentWeather && appState.currentForecast) {
      renderWeatherUI(appState.currentWeather, appState.currentForecast, appState.weatherState);
    } else {
      updateUnitToggleUI();
    }
  });

  // Error state retry button
  retryBtn?.addEventListener("click", () => {
    const city = searchInput?.value.trim() || CONFIG.DEFAULT_CITY;
    loadWeather(city);
  });
}

// ── Load Weather (by city) ────────────────────────────────────

async function loadWeather(city) {
  if (appState.isLoading) return;
  appState.isLoading = true;

  showLoading();

  try {
    const { current, forecast } = await fetchWeatherByCity(city);
    const weatherState = mapToWeatherState(current);

    appState.currentCity = city;
    appState.currentWeather = current;
    appState.currentForecast = forecast;
    appState.weatherState = weatherState;
    appState.lastFetchTime = Date.now();
    appState.fetchedUnits = CONFIG.UNITS;

    renderWeatherUI(current, forecast, weatherState);

    // Update search input with canonical city name from API
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = current.name;

  } catch (err) {
    handleError(err);
  } finally {
    appState.isLoading = false;
  }
}

// ── Load Weather (by geolocation) ────────────────────────────

async function loadWeatherByLocation() {
  if (appState.isLoading) return;
  appState.isLoading = true;

  // Show locating state
  const locationBtn = document.getElementById("location-btn");
  if (locationBtn) {
    locationBtn.classList.add("locating");
    locationBtn.title = "Finding your location…";
  }

  showLoading();

  try {
    const { lat, lon } = await getUserLocation();
    const { current, forecast } = await fetchWeatherByCoords(lat, lon);
    const weatherState = mapToWeatherState(current);

    appState.currentCity = current.name;
    appState.currentWeather = current;
    appState.currentForecast = forecast;
    appState.weatherState = weatherState;
    appState.lastFetchTime = Date.now();
    appState.fetchedUnits = CONFIG.UNITS;

    renderWeatherUI(current, forecast, weatherState);

    // Update search with real city name
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = current.name;

  } catch (err) {
    handleError(err);
  } finally {
    appState.isLoading = false;
    if (locationBtn) {
      locationBtn.classList.remove("locating");
      locationBtn.title = "Use my location";
    }
  }
}

// ── Error Handler ─────────────────────────────────────────────

function handleError(err) {
  console.error("[Atmos]", err);

  let userMessage = "Something went wrong. Please try again.";

  if (err instanceof AtmosError) {
    switch (err.code) {
      case "no_api_key":
        userMessage = "⚙️ No API key configured. Open js/config.js and add your OpenWeatherMap key.";
        break;
      case "city_not_found":
        userMessage = `🌍 ${err.message}`;
        break;
      case "invalid_key":
        userMessage = "🔑 Invalid API key. Double-check js/config.js.";
        break;
      case "location_denied":
        userMessage = "📍 Location access denied — try searching by city name instead.";
        break;
      case "location_error":
      case "no_geolocation":
        userMessage = `📍 ${err.message}`;
        break;
      default:
        userMessage = `⚠️ ${err.message}`;
    }
  }

  showError(userMessage);
}

// ── Utilities ─────────────────────────────────────────────────

/**
 * Debounce helper
 * @param {Function} fn
 * @param {number} delay ms
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
