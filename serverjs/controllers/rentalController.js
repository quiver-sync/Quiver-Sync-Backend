
const Board = require('../models/Boards');
const Rental = require('../models/Rental');
const ActiveRental = require('../models/ActiveRental');


exports.createRental = async (req, res) => {
  try {
    const {
      boardId,
      location,
      locationCoords,
      pricePerDay,
      availableUntil,
      agreementAccepted,
      advanceNotes,
    } = req.body;

    if (
      !boardId ||
      !location ||
      !locationCoords ||
      !Array.isArray(locationCoords.coordinates) ||
      locationCoords.coordinates.length !== 2 ||
      !pricePerDay ||
      !availableUntil ||
      !agreementAccepted
    ) {
      return res.status(400).json({ message: "Missing or invalid required fields." });
    }

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found." });
    if (board.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized board access." });
    }

    await Board.updateOne({ _id: boardId }, { $set: { isRented: true } });

    const rental = new Rental({
      board: board._id,
      owner: req.user.id,
      location, 
      locationCoords: {
        type: "Point",
        coordinates: locationCoords.coordinates, 
      },
      pricePerDay,
      availableUntil,
      agreementAccepted,
      advanceNotes,
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

// controllers/rentalController.js
exports.updateRental = async (req, res) => {
  try {
    console.log("Updating rental with data:")
    const { id } = req.params;

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Fallback to existing values if not provided
    rental.location = req.body.location ?? rental.location;
    rental.pricePerDay = req.body.pricePerDay ?? rental.pricePerDay;
    rental.availableUntil = req.body.availableUntil ?? rental.availableUntil;
    rental.advanceNotes = req.body.advanceNotes ?? rental.advanceNotes;

    if (req.body.locationCoords && req.body.locationCoords.coordinates?.length === 2) {
      rental.locationCoords = req.body.locationCoords;
    }

    await rental.save();
    res.json({ rental });
  } catch (err) {
    console.error("Rental update error:", err);
    res.status(500).json({ message: "Rental update failed" });
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







exports.deleteRentalIfAllowed = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const userId = req.user.id;

    const rental = await Rental.findById(rentalId);
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    if (rental.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() + 96 * 60 * 60 * 1000); // 96 hours from now

    // console.log("⏰ Current time:", now.toISOString());
    // console.log("⏳ Cutoff (96h later):", cutoff.toISOString());

    const activeRentals = await ActiveRental.find({ rental: rentalId });

    const protectedRentals = activeRentals.filter((r, i) => {
      const start = new Date(r.startDate);
      const isProtected = start > now && start < cutoff;

      // console.log(`🔍 Rental #${i + 1}:`, {
      //   id: r._id,
      //   startDate: r.startDate,
      //   isProtected,
      // });

      return isProtected;
    });

    if (protectedRentals.length > 0) {
      const safeToDelete = activeRentals.filter((r) => {
        const start = new Date(r.startDate);
        return start >= cutoff;
      });

      const deleted = await ActiveRental.deleteMany({
        _id: { $in: safeToDelete.map((r) => r._id) },
      });

      // 🔁 Set rental end date to the latest protected reservation end
      const latestEndDate = protectedRentals.reduce((latest, r) => {
        const end = new Date(r.endDate);
        return end > latest ? end : latest;
      }, new Date(0));

      rental.availableUntil = latestEndDate;
      await rental.save();

      return res.status(200).json({
        message: `Rental partially deleted. ${deleted.deletedCount} future reservations removed. Still reserved until ${latestEndDate.toISOString()}.`,
        protected: protectedRentals.map((r) => ({
          id: r._id,
          startDate: r.startDate,
          endDate: r.endDate,
        })),
      });
    }

    // ✅ Full delete case
    await ActiveRental.deleteMany({ rental: rentalId });
    await Rental.findByIdAndDelete(rentalId);
    await Board.findByIdAndUpdate(rental.board, { isRented: false });

    return res.status(200).json({
      message: "Rental and all reservations deleted. Board marked as not rented.",
    });
  } catch (err) {
    console.error("❌ Error deleting rental:", err);
    return res.status(500).json({
      message: "Server error while deleting rental",
    });
  }
};
