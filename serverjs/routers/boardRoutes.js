const express = require("express");
const router = express.Router();
const protect = require("../middelwares/authMiddleware");
const {
  getBoards,
  addBoard,
  deleteBoard,
  getMyBoards,
} = require("../controllers/boardController");

router.use(protect);

// ✅ Custom "mine" route
router.get("/mine", getMyBoards);

router.get("/", getBoards);
router.post("/", addBoard);
router.delete("/:id", deleteBoard);

module.exports = router;
