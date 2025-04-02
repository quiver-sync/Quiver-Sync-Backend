const User = require("../models/User");
const { findOne } = require("../models/User");
const { getLLMPrediction } = require("../services/llmService");
const { buildPrompt } = require("../utils/promptBuilder");
const axios = require("axios");

exports.matchBoards = async (req, res) => {
  const { boards, forecast, user } = req.body;

  try {
    const realUser = await User.findOne({ email: user.email });
    if(realUser.height!=user.height || realUser.weight!=user.weight){
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const prompt = buildPrompt(boards, forecast, user);
    const matchResults = await getLLMPrediction(prompt);

    res.json({ predictions: matchResults });
  } catch (error) {
    console.error("Match error:", error.message);
    res.status(500).json({ message: "Failed to match boards" });
  }
};

exports.listGeminiModels = async (req, res) => {
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Gemini listModels error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to list Gemini models" });
  }
};
