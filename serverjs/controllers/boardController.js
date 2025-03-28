const Board = require("../models/Boards");

exports.getBoards = async (req, res) => {
  const boards = await Board.find({ userId: req.user.id });
  res.json(boards);
};

exports.addBoard = async (req, res) => {
  const board = await Board.create({ ...req.body, userId: req.user.id });
  res.status(201).json(board);
};

exports.deleteBoard = async (req, res) => {
  const board = await Board.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!board) return res.status(404).json({ message: "Board not found" });
  res.json({ message: "Board deleted" });
};

// controllers/boardController.js
exports.getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user.id }).sort({ createdAt: 1 }); // optional: sort by oldest→newest
    res.status(200).json(boards);
  } catch (error) {
    console.error("Error fetching user boards:", error);
    res.status(500).json({ message: "Server error" });
  }
};

