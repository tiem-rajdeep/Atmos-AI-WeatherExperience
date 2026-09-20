// ============================================================
//  Atmos — Vercel Serverless Function Proxy
//  Protects your OpenWeatherMap API key by keeping it server-side.
// ============================================================

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "method_not_allowed", message: "Method Not Allowed" });
  }

  const apiKey = process.env.OWM_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "no_api_key",
      message: "Server environment variable OWM_API_KEY is not configured in Vercel settings.",
    });
  }

  const { city, lat, lon, units = "metric" } = req.query;

  let currentWeatherUrl = "";
  let forecastWeatherUrl = "";

  if (city) {
    const encodedCity = encodeURIComponent(city.trim());
    currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=${units}&appid=${apiKey}`;
    forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&units=${units}&cnt=8&appid=${apiKey}`;
  } else if (lat && lon) {
    currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
    forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&cnt=8&appid=${apiKey}`;
  } else {
    return res.status(400).json({
      error: "invalid_request",
      message: "Missing 'city' or 'lat'/'lon' query parameter.",
    });
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentWeatherUrl),
      fetch(forecastWeatherUrl),
    ]);

    if (currentRes.status === 404) {
      return res.status(404).json({
        error: "city_not_found",
        message: `City "${city}" not found. Try another name.`,
      });
    }

    if (currentRes.status === 401) {
      return res.status(401).json({
        error: "invalid_key",
        message: "Invalid OpenWeatherMap API key configured on server.",
      });
    }

    if (!currentRes.ok) {
      return res.status(currentRes.status).json({
        error: "api_error",
        message: `OpenWeatherMap API returned status ${currentRes.status}`,
      });
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    // Cache at Vercel Edge for 10 minutes (600s) to stay well within free limits
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return res.status(200).json({ current, forecast });

  } catch (error) {
    console.error("[api/weather] Fetch error:", error);
    return res.status(500).json({
      error: "server_error",
      message: "An error occurred while fetching weather data.",
    });
  }
}
