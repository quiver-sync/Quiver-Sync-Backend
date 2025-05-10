const express = require("express");
const router = express.Router();
const protect = require("../middelwares/authMiddleware");
const {
  getBoards,
  addBoard,
  deleteBoard,
  getMyBoards,
  getBoardById,
  getMyRentedBoards,
} = require("../controllers/boardController");
const { route } = require("./authRoutes");




router.use(protect);

// ✅ Custom "mine" route
router.get("/mine", getMyBoards);
router.get("/getMyRentedBoards", getMyRentedBoards)
router.get("/", getBoards);
router.post("/", addBoard);
router.delete("/:id", deleteBoard);
router.get("/:id", protect,getBoardById);


module.exports = router;
