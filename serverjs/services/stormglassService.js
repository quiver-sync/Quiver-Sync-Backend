const axios = require("axios");

const API_KEY = process.env.STORMGLASS_API_KEY;

const fetchSurfForecast = async (lat, lon, date) => {
  const start = new Date(date);
  const end = new Date(date);
  end.setHours(23, 59, 59);

  const isoStart = start.toISOString();
  const isoEnd = end.toISOString();

  const url = "https://api.stormglass.io/v2/weather/point";

  try {
    const res = await axios.get(url, {
      params: {
        lat,
        lng: lon,
        start: isoStart,
        end: isoEnd,
        params: "waveHeight,windSpeed,windDirection,swellPeriod,waterTemperature",
        source: "noaa",
      },
      headers: {
        Authorization: API_KEY,
      },
    });

    const hourly = res.data?.hours || [];

    if (!hourly.length) return null;

    const avg = (arr) => {
      const valid = arr.filter((n) => typeof n === "number");
      const sum = valid.reduce((acc, val) => acc + val, 0);
      return valid.length ? Number((sum / valid.length).toFixed(2)) : null;
    };

    return {
      waveHeight: avg(hourly.map((h) => h.waveHeight?.noaa)),
      windSpeed: avg(hourly.map((h) => h.windSpeed?.noaa)),
      windDirection: avg(hourly.map((h) => h.windDirection?.noaa)),
      swellPeriod: avg(hourly.map((h) => h.swellPeriod?.noaa)),
      waterTemperature: avg(hourly.map((h) => h.waterTemperature?.noaa)),
    };
  } catch (err) {
    console.error("Stormglass error:", err.message);
    throw new Error("Failed to fetch forecast from Stormglass");
  }
};

module.exports = { fetchSurfForecast };
