
const Board = require('../models/Boards');
const Rental = require('../models/Rental');
const ActiveRental = require('../models/ActiveRental');


exports.createRental = async (req, res) => {
  try {
    const { boardId, location, pricePerDay, availableUntil, agreementAccepted } = req.body;

    if (!boardId || !location || !pricePerDay || !availableUntil || !agreementAccepted) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found." });
    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized board access." });
    }

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
    const rentals = await Rental.find({ owner: req.user.id })
      .populate("board")
      .sort({ createdAt: -1 });
    res.status(200).json(rentals);
  } catch (err) {
    console.error("Failed to fetch rentals:", err);
    res.status(500).json({ message: "Error fetching rentals." });
  }
};

exports.deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Rental not found." });
    if (rental.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }
    await rental.deleteOne();
    res.status(200).json({ message: "Rental canceled." });
  } catch (err) {
    console.error("Rental deletion error:", err);
    res.status(500).json({ message: "Server error during rental deletion." });
  }
};

exports.updateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Rental not found." });
    if (rental.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const { location, pricePerDay, availableUntil } = req.body;
    rental.location = location || rental.location;
    rental.pricePerDay = pricePerDay || rental.pricePerDay;
    rental.availableUntil = availableUntil || rental.availableUntil;

    await rental.save();
    res.status(200).json({ message: "Rental updated successfully", rental });
  } catch (err) {
    console.error("Rental update error:", err);
    res.status(500).json({ message: "Server error during rental update." });
  }
};


exports.getAvailableRentals = async (req, res) => {
  try {
    const today = new Date();

    // Get all rentals available in the future
    const rentals = await Rental.find({
      availableUntil: { $gte: today }
    })
      .populate("board")
      .populate("owner", "username");

    // For each rental, find its booked dates from active rentals
    const rentalsWithBookings = await Promise.all(
      rentals.map(async (rental) => {
        const bookings = await ActiveRental.find({
          rental: rental._id,
        });

        const bookedDates = bookings.map((b) => ({
          start: b.startDate,
          end: b.endDate,
        }));

        return {
          ...rental.toObject(),
          bookedDates,
        };
      })
    );

    res.status(200).json(rentalsWithBookings);
  } catch (err) {
    console.error("❌ Error fetching rentals:", err);
    res.status(500).json({ message: "Failed to load rentals" });
  }
};



exports.getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('board')
      .populate('owner', 'username');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    res.status(200).json(rental);
  } catch (err) {
    console.error('Failed to fetch rental:', err);
    res.status(500).json({ message: 'Server error' });
  }
};