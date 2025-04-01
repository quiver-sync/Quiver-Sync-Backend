const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const cleanAndParseJSON = (text) => {
  try {
    const match = text.match(/\[.*\]/s); // extract JSON array block
    return JSON.parse(match[0]);
  } catch (err) {
    console.warn("⚠️ Could not parse Gemini output:");
    throw new Error("Invalid JSON returned by Gemini");
  }
};

exports.getLLMPrediction = async (prompt) => {
  try {
    const res = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`, // Use the correct URL here
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return cleanAndParseJSON(rawText);
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    throw new Error("Failed to get LLM prediction");
  }
};