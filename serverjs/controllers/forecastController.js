// controllers/forecastController.js
const { fetchSurfForecast } = require("../services/stormglassService");

exports.getForecast = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Missing coordinates" });
  }

  try {
    const forecast = await fetchSurfForecast(lat, lng, new Date());
    if (!forecast) {
      return res.status(404).json({ message: "No forecast data available" });
    }

    res.status(200).json(forecast);
  } catch (error) {
    console.error("Forecast error:", error.message);
    res.status(500).json({ message: "Server error while fetching forecast" });
  }
};
