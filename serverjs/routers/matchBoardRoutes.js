// routers/forecastRoutes.js
const express = require("express");
const router = express.Router();
const { matchBoards,listGeminiModels } = require("../controllers/matchController");


router.post("/", matchBoards);
router.get("/gemini/models", listGeminiModels);

module.exports = router;
