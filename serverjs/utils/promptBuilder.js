exports.buildPrompt = (boards, forecast, user) => {
  return `
You are a world-class surfboard-matching expert with deep knowledge of surfboard design, wave dynamics, and surfer physiology.

A surfer is planning their next session. Here are their attributes:
- Height: ${user.height} cm
- Weight: ${user.weight} kg
- Surfing Level: ${user.level} (can be "kook", "intermediate", or "pro")

Surf forecast:
- Wave Height: ${forecast.waveHeight} meters
- Swell Period: ${forecast.swellPeriod} seconds
- Swell Direction: ${forecast.swellDirection}°
- Wind Speed: ${forecast.windSpeed} m/s
- Wind Direction: ${forecast.windDirection}°
- Water Temperature: ${forecast.waterTemperature}°C

They have the following boards:

${boards.map((b, i) => {
  return `${i + 1}. ${b.brand} ${b.model || "–"} (${b.type}) – ${b.length}ft x ${b.width || "?"}in, ${b.volume || "?"}L, Fins: ${b.fins || "unspecified"}`
}).join("\n")}

Your task is to rate how compatible each board is for the *given surf conditions* and the *surfer's profile*. Take into account:

### 🌊 Wave conditions
- Wave height and swell period are the most important: they determine power, speed, and paddle timing.
- Consider if the board offers enough paddle speed, early entry, control, and maneuverability.
- Adjust based on wind direction/speed (e.g., strong onshore = harder control).
- Water temperature only if it indirectly impacts performance.

### 🧠 Surfer Level Logic
- **Kook (Beginner)**: Needs high volume and stability. Avoid shortboards or low-volume boards unless conditions are tiny and mellow. Prioritize easy paddling and forgiveness.
- **Intermediate**: Can handle more responsive boards, but still needs good float and forgiving rails unless conditions are ideal.
- **Pro**: Can ride anything, but match boards to the wave type. Do *not* give high scores to oversized boards unless they’re ideal for the wave (e.g., longboard in small waves, gun in big surf).

### 🧮 Scoring Logic
- Score from 0–100.
- 90+ = ideal match, 70–89 = decent match, 50–69 = usable but not optimal, below 50 = mismatch.
- Explain **why** it fits or doesn’t, using both forecast and surfer profile.

Respond with a JSON array like this:
[
  {
    "model": "Lost Driver 2.0",
    "score": 85,
    "reason": "Great fit for a pro surfer in shoulder-high, punchy waves. Volume and rocker match the forecast perfectly."
  },
  {
    "model": "7'2\" Soft Top",
    "score": 95,
    "reason": "Perfect for a beginner in mellow waist-high waves. Easy paddling and plenty of stability."
  }
]
`.trim();
};
