// ============================================================
//  Atmos — API Module
//  Handles all OpenWeatherMap data fetching
// ============================================================

/**
 * Fetch current weather + 3-hour forecast by city name
 * @param {string} city
 * @returns {Promise<{current: Object, forecast: Object}>}
 */
/**
 * Fetch current weather + 3-hour forecast by city name
 * @param {string} city
 * @returns {Promise<{current: Object, forecast: Object}>}
 */
async function fetchWeatherByCity(city) {
  const { OWM_API_KEY, OWM_BASE_URL, UNITS } = CONFIG;
  const isHttp = window.location.protocol.startsWith("http");

  // 1. If running on a web server / Vercel, try the secure serverless proxy first
  if (isHttp) {
    try {
      const proxyRes = await fetch(`/api/weather?city=${encodeURIComponent(city)}&units=${UNITS}`);
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
      if (proxyRes.status === 404) {
        throw new AtmosError("city_not_found", `City "${city}" not found. Try another name.`);
      }
      if (proxyRes.status === 401) {
        throw new AtmosError("invalid_key", "Invalid API key configured on server.");
      }
      // If proxy returned a specific error response
      const errData = await proxyRes.json().catch(() => ({}));
      if (errData.error && errData.error !== "no_api_key") {
        throw new AtmosError(errData.error, errData.message || `Weather API error: ${proxyRes.status}`);
      }
    } catch (err) {
      if (err instanceof AtmosError) throw err;
      // If serverless route is not found (e.g. static dev server), fall through to direct API
    }
  }

  // 2. Direct client-side API fallback (e.g., local file:/// or direct key testing)
  if (!OWM_API_KEY || OWM_API_KEY === "YOUR_API_KEY_HERE") {
    throw new AtmosError(
      "no_api_key",
      "Please add your OWM_API_KEY environment variable in Vercel, or set your key in js/config.js."
    );
  }

  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `${OWM_BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${UNITS}&appid=${OWM_API_KEY}`
    ),
    fetch(
      `${OWM_BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${UNITS}&cnt=8&appid=${OWM_API_KEY}`
    ),
  ]);

  if (currentRes.status === 404) {
    throw new AtmosError("city_not_found", `City "${city}" not found. Try another name.`);
  }
  if (currentRes.status === 401) {
    throw new AtmosError("invalid_key", "Invalid API key. Check js/config.js or Vercel environment variables.");
  }
  if (!currentRes.ok) {
    throw new AtmosError("api_error", `Weather API error: ${currentRes.status}`);
  }

  const current = await currentRes.json();
  const forecast = await forecastRes.json();
  return { current, forecast };
}

/**
 * Fetch current weather + forecast by geolocation coordinates
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{current: Object, forecast: Object}>}
 */
async function fetchWeatherByCoords(lat, lon) {
  const { OWM_API_KEY, OWM_BASE_URL, UNITS } = CONFIG;
  const isHttp = window.location.protocol.startsWith("http");

  // 1. If running on a web server / Vercel, try the secure serverless proxy first
  if (isHttp) {
    try {
      const proxyRes = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=${UNITS}`);
      if (proxyRes.ok) {
        return await proxyRes.json();
      }
      if (proxyRes.status === 401) {
        throw new AtmosError("invalid_key", "Invalid API key configured on server.");
      }
      const errData = await proxyRes.json().catch(() => ({}));
      if (errData.error && errData.error !== "no_api_key") {
        throw new AtmosError(errData.error, errData.message || `Weather API error: ${proxyRes.status}`);
      }
    } catch (err) {
      if (err instanceof AtmosError) throw err;
      // Fall through to direct API
    }
  }

  // 2. Direct client-side API fallback
  if (!OWM_API_KEY || OWM_API_KEY === "YOUR_API_KEY_HERE") {
    throw new AtmosError(
      "no_api_key",
      "Please add your OWM_API_KEY environment variable in Vercel, or set your key in js/config.js."
    );
  }

  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `${OWM_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${UNITS}&appid=${OWM_API_KEY}`
    ),
    fetch(
      `${OWM_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${UNITS}&cnt=8&appid=${OWM_API_KEY}`
    ),
  ]);

  if (!currentRes.ok) {
    throw new AtmosError("api_error", `Weather API error: ${currentRes.status}`);
  }

  const current = await currentRes.json();
  const forecast = await forecastRes.json();
  return { current, forecast };
}

/**
 * Get user's current geolocation
 * @returns {Promise<{lat: number, lon: number}>}
 */
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new AtmosError("no_geolocation", "Your browser doesn't support geolocation."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        if (err.code === 1) {
          reject(new AtmosError("location_denied", "Location access denied. Try searching by city name."));
        } else {
          reject(new AtmosError("location_error", "Couldn't get your location. Try searching by city name."));
        }
      },
      { timeout: 10000 }
    );
  });
}

/**
 * Custom error class for Atmos
 */
class AtmosError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "AtmosError";
  }
}
