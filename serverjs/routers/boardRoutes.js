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
  updateBoardRentedStatus,
  syncBoardRentalStatus,
} = require("../controllers/boardController");




router.use(protect);


router.get("/mine", getMyBoards);
router.get("/getMyRentedBoards", getMyRentedBoards)
router.get("/updateRentedStatus",protect, updateBoardRentedStatus)
router.post("/sync-rental-status",protect, syncBoardRentalStatus)
router.get("/", getBoards);
router.post("/", addBoard);
router.delete("/:id", deleteBoard);
router.get("/:id", protect,getBoardById);


module.exports = router;
