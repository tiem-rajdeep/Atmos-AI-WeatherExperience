// ============================================================
//  Atmos — AI Insight Generator
//  Rule-based natural language weather insight lines
//  v1: No external AI API needed — runs entirely client-side
// ============================================================

/**
 * Generate a contextual, human-sounding insight line from weather data
 * @param {Object} current - OWM current weather data
 * @param {Object} forecast - OWM forecast data
 * @param {string} weatherState - Atmos internal state
 * @returns {string} Insight line with emoji prefix
 */
function generateInsight(current, forecast, weatherState) {
  const temp = Math.round(current.main.temp);
  const feelsLike = Math.round(current.main.feels_like);
  const humidity = current.main.humidity;
  const windSpeed = current.wind?.speed ?? 0; // m/s
  const windKmh = Math.round(windSpeed * 3.6);
  const pop = getMaxPrecipProbability(forecast); // 0–1
  const units = CONFIG.UNITS;
  const unitSymbol = units === "imperial" ? "°F" : "°C";
  const tempDesc = getTempDescriptor(feelsLike, units);

  const insights = buildInsightPool(
    weatherState, temp, feelsLike, humidity, windKmh, pop, unitSymbol, tempDesc
  );

  // Pick a consistent insight (not truly random, changes with weather)
  const idx = (Math.abs(temp + humidity + windKmh)) % insights.length;
  return insights[idx];
}

/**
 * Build a pool of relevant insights based on conditions
 */
function buildInsightPool(state, temp, feelsLike, humidity, windKmh, pop, unitSymbol, tempDesc) {
  const feelsNote = Math.abs(temp - feelsLike) >= 3
    ? ` — feels like ${feelsLike}${unitSymbol} though`
    : "";

  switch (state) {
    case "rain":
      return [
        `☔ Rain is likely to continue — an umbrella is a good idea today.`,
        `🌧️ It's wet out there. Best to keep a jacket handy${feelsNote}.`,
        `💧 With ${humidity}% humidity and rain overhead, a dry shelter sounds perfect.`,
        pop > 0.7
          ? `☔ High chance of rain (${Math.round(pop * 100)}%) — don't leave home without an umbrella.`
          : `🌦️ Light rain expected — a light jacket should do the trick.`,
        `🌧️ The skies are grey and damp. A warm drink would hit just right right now.`,
      ];

    case "storm":
      return [
        `⛈️ Thunderstorms rolling in — best to stay indoors if you can.`,
        `⚡ Lightning and heavy rain ahead. Keep away from open areas.`,
        `🌩️ Stormy conditions — wind gusts could be strong, so secure anything outside.`,
        `⛈️ A dramatic sky today. Stay safe, avoid unnecessary travel.`,
        `🌩️ The storm isn't letting up anytime soon — a great day to stay in.`,
      ];

    case "snow":
      return [
        `❄️ Snow is falling — roads may be slippery, take it slow.`,
        `🌨️ Bundle up! It's ${temp}${unitSymbol}${feelsNote} and snowing out there.`,
        `⛄ Perfect snow day weather. Layer up before heading out.`,
        `❄️ Cold and snowy — give yourself extra travel time today.`,
        `🌨️ Fresh snow on the ground. Watch your step on icy surfaces.`,
      ];

    case "clear":
      if (tempDesc === "hot") {
        return [
          `☀️ Bright and sunny, but hot at ${temp}${unitSymbol}. Stay hydrated and seek shade.`,
          `🌞 Clear skies, scorching heat — sunscreen and water are your best friends today.`,
          `☀️ Peak sunshine ahead. Try to limit outdoor time during midday heat.`,
        ];
      }
      if (tempDesc === "warm" || tempDesc === "mild") {
        return [
          `☀️ Clear skies all day — a great time to head outside.`,
          `🌤️ Beautiful weather today at ${temp}${unitSymbol}. Make the most of it!`,
          `☀️ Sunny and pleasant${feelsNote}. Perfect conditions for a walk.`,
          `🌞 Lovely day ahead — you really shouldn't be stuck indoors.`,
        ];
      }
      return [
        `☀️ Clear but crisp at ${temp}${unitSymbol}. A warm layer wouldn't hurt.`,
        `🧥 Bright skies, chilly air${feelsNote}. Dress for the cold, not the sun.`,
        `☀️ Sunny and cold — the kind of day that looks warmer than it is.`,
      ];

    case "night-clear":
      return [
        `🌙 Clear, calm night. A great sky for stargazing if you're out.`,
        `⭐ Quiet night ahead — cool and clear${feelsNote}.`,
        `🌌 The night sky is clear. Perfect for a late walk if you're brave enough.`,
        `🌙 Still and calm outside. Good sleeping weather tonight.`,
      ];

    case "night-cloudy":
      return [
        `🌙 Overcast night — clouds keeping things mild${feelsNote}.`,
        `🌥️ A quiet, cloudy evening. Good night to stay in.`,
        `☁️ Thick clouds tonight, but it's calm out there.`,
      ];

    case "cloudy":
      return [
        `☁️ Overcast today — the sun is playing hide and seek.`,
        `🌥️ Grey skies but no rain expected yet. Still a decent day out.`,
        `☁️ Cloudy but calm. A jacket might be wise${feelsNote}.`,
        humidity > 75
          ? `🌫️ Very humid and overcast — rain could develop later, stay alert.`
          : `☁️ Mild and cloudy. A good enough day to be outside.`,
      ];

    case "windy":
      return [
        windKmh > 50
          ? `💨 Strong winds at ${windKmh} km/h — hold onto your hat and secure loose items.`
          : `🌬️ Breezy conditions today — ${windKmh} km/h winds, perfect for kite flying.`,
        `💨 It's gusty out there. Cyclists and motorcyclists, take extra care.`,
        `🍃 A breezy day. Light items left outside may blow away.`,
        `🌬️ Wind is picking up — good conditions for airing out the house.`,
      ];

    default:
      return [
        `🌡️ ${temp}${unitSymbol} today${feelsNote}. Have a great day out there.`,
        `🌤️ Mild conditions today. Dress for the weather and enjoy your day.`,
      ];
  }
}

/**
 * Get the max precipitation probability from the forecast list
 * @param {Object} forecast - OWM forecast response
 * @returns {number} 0–1
 */
function getMaxPrecipProbability(forecast) {
  if (!forecast?.list?.length) return 0;
  return Math.max(...forecast.list.map((item) => item.pop ?? 0));
}
