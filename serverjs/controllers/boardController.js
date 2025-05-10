const Board = require("../models/Boards");
const Rental = require('../models/Rental');


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

exports.getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.json(board);
  } catch (err) {
    next(err);
  }
};

exports.getMyRentedBoards = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all rentals listed by this user
    const rentals = await Rental.find({ owner: userId }).populate('board');

    // Filter out those where the board is missing (just in case)
    const rentedBoardsWithInfo = rentals
      .filter(r => r.board) // in case the board was deleted
      .map(rental => ({
        board: rental.board,
        rental: {
          location: rental.location,
          pricePerDay: rental.pricePerDay,
          availableUntil: rental.availableUntil,
          createdAt: rental.createdAt,
          _id: rental._id,
        },
      }));

    res.status(200).json(rentedBoardsWithInfo);
  } catch (err) {
    console.error("Error fetching rented boards:", err);
    res.status(500).json({ message: "Failed to load rented boards." });
  }
};