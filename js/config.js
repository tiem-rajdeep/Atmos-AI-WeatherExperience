// ============================================================
//  Atmos — Configuration
//  Fill in your OpenWeatherMap API key below.
//  Get a free key at: https://openweathermap.org/api
// ============================================================

const CONFIG = {
  // For local static testing without Vercel, you can paste your key here:
  // When deployed to Vercel, the app automatically uses the secure serverless proxy (/api/weather)
  OWM_API_KEY: "YOUR_API_KEY_HERE",

  // OpenWeatherMap base URL (fallback for local standalone file usage)
  OWM_BASE_URL: "https://api.openweathermap.org/data/2.5",

  // Default city shown on first load
  DEFAULT_CITY: "London",

  // Units: "metric" (°C) or "imperial" (°F)
  UNITS: "metric",
};
