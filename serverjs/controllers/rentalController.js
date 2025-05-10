const Board = require('../models/Boards');
const Rental = require('../models/Rental');

exports.createRental = async (req, res) => {
  try {
    const { boardId, location, pricePerDay, availableUntil, agreementAccepted } = req.body;

    // Validate inputs
    if (!boardId || !location || !pricePerDay || !availableUntil || !agreementAccepted) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    


    // Validate board existence and ownership
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }
    console.log("board:", board);
    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized board access." });
    }

    // Create rental
    const rental = new Rental({
      board: board._id,
      owner: req.user.id,
      location,
      pricePerDay,
      availableUntil,
      agreementAccepted,
    });

    await rental.save();
    res.status(201).json({ message: "Rental created successfully", rental });
  } catch (err) {
    console.error("Rental creation error:", err);
    res.status(500).json({ message: "Server error during rental creation." });
  }
};


exports.getMyRentals = async (req, res) => {
    try {
      const rentals = await Rental.find({ owner: req.user.id }).select("board");
      res.status(200).json(rentals);
    } catch (err) {
      console.error("Failed to fetch rentals:", err);
      res.status(500).json({ message: "Error fetching rentals." });
    }
  };
  