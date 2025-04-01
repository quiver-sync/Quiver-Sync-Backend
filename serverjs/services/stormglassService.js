const axios = require("axios");

const API_KEY = process.env.STORMGLASS_API_KEY;
const PARAMS = [
  "waveHeight",
  "windSpeed",
  "windDirection",
  "swellPeriod",
  "waterTemperature",
  "swellDirection",
].join(",");

// ✅ Helper: average numeric values
const avg = (arr) => {
  const valid = arr.filter((n) => typeof n === "number");
  const sum = valid.reduce((acc, val) => acc + val, 0);
  return valid.length ? Number((sum / valid.length).toFixed(2)) : null;
};

// ✅ Helper: group hourly data into days
const groupByDate = (data) => {
  return data.reduce((acc, entry) => {
    const dateKey = entry.time.split("T")[0];
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(entry);
    return acc;
  }, {});
};

// ✅ Shared processor: takes an array of hourly entries
const processHourlyData = (hourly) => ({
  waveHeight: avg(hourly.map((h) => h.waveHeight?.noaa)),
  windSpeed: avg(hourly.map((h) => h.windSpeed?.noaa)),
  windDirection: avg(hourly.map((h) => h.windDirection?.noaa)),
  swellPeriod: avg(hourly.map((h) => h.swellPeriod?.noaa)),
  swellDirection: avg(hourly.map((h) => h.swellDirection?.noaa)),
  waterTemperature: avg(hourly.map((h) => h.waterTemperature?.noaa)),
});

// ✅ Fetch single-day forecast (today)
const fetchSurfForecast = async (lat, lon, date) => {
  const start = new Date(date);
  const end = new Date(date);
  end.setHours(23, 59, 59);

  const url = "https://api.stormglass.io/v2/weather/point";

  try {
    const res = await axios.get(url, {
      params: {
        lat,
        lng: lon,
        start: start.toISOString(),
        end: end.toISOString(),
        params: PARAMS,
        source: "noaa",
      },
      headers: {
        Authorization: API_KEY,
      },
    });

    const hourly = res.data?.hours || [];
    if (!hourly.length) return null;

    return processHourlyData(hourly);
  } catch (err) {
    console.error("Stormglass error:", err.message);
    throw new Error("Failed to fetch forecast from Stormglass");
  }
};

// ✅ Fetch 5-day forecast grouped by date
const fetchFiveDayForecast = async (lat, lng) => {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 5);

  const url = "https://api.stormglass.io/v2/weather/point";

  try {
    const res = await axios.get(url, {
      params: {
        lat,
        lng,
        start: start.toISOString(),
        end: end.toISOString(),
        params: PARAMS,
        source: "noaa",
      },
      headers: {
        Authorization: API_KEY,
      },
    });

    const hourly = res.data?.hours || [];
    if (!hourly.length) return [];

    const grouped = groupByDate(hourly);

    return Object.entries(grouped).map(([date, hours]) => ({
      date,
      ...processHourlyData(hours),
    }));
  } catch (err) {
    console.error("Stormglass error:", err.message);
    throw new Error("Failed to fetch 5-day forecast from Stormglass");
  }
};

module.exports = {
  fetchSurfForecast,
  fetchFiveDayForecast,
};
