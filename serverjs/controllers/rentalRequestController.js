const RentalRequest = require('../models/RentalRequest');
const Rental = require('../models/Rental');
const ActiveRental = require('../models/ActiveRental');

exports.createRentalRequest = async (req, res) => {
  try {
    const { rentalId, startDate, endDate } = req.body;
    const hirerId = req.user.id;

    const rental = await Rental.findById(rentalId).populate("owner board");
    if (!rental) return res.status(404).json({ message: 'Rental not found' });

    if (rental.owner._id.toString() === hirerId) {
      return res.status(403).json({ message: 'You cannot rent your own board' });
    }

    const overlap = await ActiveRental.findOne({
      rental: rental._id,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });
    if (overlap) {
      return res.status(409).json({ message: 'Board is already booked on those dates' });
    }

    const request = await RentalRequest.create({
      rental: rental._id,
      renter: rental.owner._id,
      hirer: hirerId,
      board: rental.board,
      startDate,
      endDate
    });

    res.status(201).json(request);
  } catch (err) {
    console.error("❌ Error creating rental request:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await RentalRequest.find({ hirer: req.user.id })
      .populate("renter", "username picture")
      .populate("hirer", "username")
      .populate("board")
      .populate({
        path: "rental",
        select: "pricePerDay"
      })
      .exec();

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching my rental requests:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRequestsReceived = async (req, res) => {
  try {
    const requests = await RentalRequest.find({ renter: req.user.id })
      .populate("hirer", "username picture")
      .populate("board")
      .exec();

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching received requests:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRentalRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await RentalRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.renter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this request' });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status}` });
  } catch (err) {
    console.error("❌ Error updating request:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRentalRequest = async (req, res) => {
  try {
    const request = await RentalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Rental request not found" });
    }

    if (
      request.hirer.toString() !== req.user.id ||
      request.status !== "pending"
    ) {
      return res.status(403).json({ message: "Not allowed to cancel this request" });
    }

    await request.deleteOne();

    res.status(200).json({ message: "Rental request canceled" });
  } catch (err) {
    console.error("❌ Failed to cancel rental request:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const myUserId = req.user.id;

    
    const myRentals = await Rental.find({ owner: myUserId }).select("_id");
    const myRentalIds = myRentals.map(r => r._id);

    
    const requests = await RentalRequest.find({ rentalId: { $in: myRentalIds } })
      .populate("rentalId")
      .populate("renter", "username picture")
      .populate("board")
      .populate({
        path: "rental", 
        select: "pricePerDay"
      });

    res.json(requests);
  } catch (err) {
    console.error("❌ Error fetching received requests:", err);
    res.status(500).json({ message: "Server error" });
  }
};
  