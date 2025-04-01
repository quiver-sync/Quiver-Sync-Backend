// controllers/forecastController.js
const {
  fetchSurfForecast,
  fetchFiveDayForecast,
} = require("../services/stormglassService");


exports.getForecast = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Missing coordinates" });
  }

  try {
    const current = await fetchSurfForecast(lat, lng, new Date());
    const daily = await fetchFiveDayForecast(lat, lng);

    res.status(200).json({ current, daily });
  } catch (error) {
    console.error("Forecast error:", error.message);
    res.status(500).json({ message: "Server error while fetching forecast" });
  }
};

