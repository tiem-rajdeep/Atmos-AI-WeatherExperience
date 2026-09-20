// ============================================================
//  Atmos — Weather State Mapper
//  Maps OpenWeatherMap API data → Atmos internal weather states
// ============================================================

/**
 * Atmos Weather States
 * @typedef {'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'windy' | 'night-clear' | 'night-cloudy'} WeatherState
 */

/**
 * OWM weather condition code ranges:
 * 2xx = Thunderstorm
 * 3xx = Drizzle
 * 5xx = Rain
 * 6xx = Snow
 * 7xx = Atmosphere (fog, mist, haze, etc.)
 * 800 = Clear
 * 80x = Clouds
 */

/**
 * Map raw API data to an Atmos WeatherState
 * @param {Object} currentData - OWM current weather response
 * @returns {WeatherState}
 */
function mapToWeatherState(currentData) {
  const conditionId = currentData.weather[0].id;
  const windSpeed = currentData.wind?.speed ?? 0; // m/s
  const isDusk = isDuskTime(currentData);
  const isDay = isDaytime(currentData);

  // Thunderstorm
  if (conditionId >= 200 && conditionId < 300) {
    return "storm";
  }

  // Drizzle or Rain
  if (conditionId >= 300 && conditionId < 600) {
    // Heavy wind + rain = lean toward storm feel, but keep 'rain'
    return "rain";
  }

  // Snow / Sleet / Ice
  if (conditionId >= 600 && conditionId < 700) {
    return "snow";
  }

  // Atmosphere (fog, mist, haze, smoke)
  if (conditionId >= 700 && conditionId < 800) {
    return "cloudy";
  }

  // Clear sky
  if (conditionId === 800) {
    if (isDusk) return "dusk";
    return isDay ? "clear" : "night-clear";
  }

  // Clouds
  if (conditionId > 800 && conditionId < 900) {
    // High wind speed with clouds → windy feel
    if (windSpeed > 10) return "windy";
    if (isDusk && conditionId <= 802) return "dusk";
    return isDay ? "cloudy" : "night-cloudy";
  }

  if (isDusk) return "dusk";
  return isDay ? "clear" : "night-clear";
}

/**
 * Determine if it's currently daytime based on sunrise/sunset
 * @param {Object} currentData - OWM current weather response
 * @returns {boolean}
 */
function isDaytime(currentData) {
  const { dt, sys } = currentData;
  if (!sys?.sunrise || !sys?.sunset) return true;
  return dt >= sys.sunrise && dt < sys.sunset;
}

/**
 * Determine if it's currently dusk / golden hour (45 min before to 20 min after sunset)
 * @param {Object} currentData - OWM current weather response
 * @returns {boolean}
 */
function isDuskTime(currentData) {
  const { dt, sys } = currentData;
  if (!sys?.sunset) return false;
  const duskStart = sys.sunset - 45 * 60; // 45 mins before sunset
  const duskEnd = sys.sunset + 20 * 60; // 20 mins after sunset
  return dt >= duskStart && dt <= duskEnd;
}

/**
 * Get human-readable condition description
 * @param {Object} currentData
 * @returns {string}
 */
function getConditionDescription(currentData) {
  return currentData.weather[0].description
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Get feels-like description for the insight engine
 * @param {number} feelsLike - feels like temp in configured units
 * @param {string} units - 'metric' | 'imperial'
 * @returns {string} descriptor like 'hot', 'warm', 'cool', 'cold', 'freezing'
 */
function getTempDescriptor(feelsLike, units = "metric") {
  const c = units === "imperial" ? ((feelsLike - 32) * 5) / 9 : feelsLike;
  if (c >= 35) return "hot";
  if (c >= 25) return "warm";
  if (c >= 15) return "mild";
  if (c >= 5)  return "cool";
  if (c >= -5) return "cold";
  return "freezing";
}
