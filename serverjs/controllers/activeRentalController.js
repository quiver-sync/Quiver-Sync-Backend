const ActiveRental = require('../models/ActiveRental');
const RentalRequest = require('../models/RentalRequest');
const User = require('../models/User')

exports.confirmRentalRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await RentalRequest.findById(requestId).populate('rental');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'approved') return res.status(400).json({ message: 'Request is not approved yet' });
    if (request.renter.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    const rental = request.rental;

    const activeRental = await ActiveRental.create({
      rental: rental._id,
      owner: rental.owner,
      hirer: userId,
      startDate: request.startDate,
      endDate: request.endDate
    });

    res.status(201).json({ message: 'Rental confirmed', activeRental });
  } catch (err) {
    console.error('❌ Error confirming rental request:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllActiveRentals = async (req, res) => {
  try {
    const activeRentals = await ActiveRental.find()
      .populate({
        path: 'rental',
        populate: { path: 'owner', select: '_id username' }
      })
      .populate('owner', '_id username')
      .populate('hirer', '_id username');

    res.status(200).json(activeRentals);
  } catch (err) {
    console.error("❌ Error checking users in active rentals:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyActiveRentals = async (req, res) => {
  try {
    const userId = req.user.id;

    const myRentals = await ActiveRental.find({
      $or: [{ owner: userId }, { hirer: userId }]
    })
      .populate({
        path: 'rental',
        populate: { path: 'board owner', select: 'model image location username' }
      })
      .populate('owner', 'username picture')
      .populate('hirer', 'username picture');

    res.json(myRentals);
  } catch (err) {
    console.error("❌ Error fetching active rentals:", err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.cancelRentalIfNoUpcoming = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const userId = req.user.id;

    // Fetch rental to ensure ownership
    const rental = await Rental.findById(rentalId);
    if (!rental) return res.status(404).json({ message: "Rental not found." });
    if (rental.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized – not the owner of this rental." });
    }

    // Check if any future rentals are within 96 hours (4 days)
    const now = new Date();
    const limit = new Date(now.getTime() + 96 * 60 * 60 * 1000); // 96 hours from now

    const upcomingRentals = await ActiveRental.find({
      rental: rentalId,
      startDate: { $lt: limit },
      status: { $in: ['active'] }
    });

    if (upcomingRentals.length > 0) {
      return res.status(400).json({ message: "Cannot cancel rental — there are upcoming bookings within 96 hours." });
    }

    // Otherwise, delete all future active rentals and the rental itself
    await ActiveRental.deleteMany({ rental: rentalId, status: 'active' });
    await rental.deleteOne();

    // Update board status
    await Board.updateOne({ _id: rental.board }, { isRented: false });

    res.status(200).json({ message: "Rental successfully cancelled and cleared." });
  } catch (err) {
    console.error("❌ Error cancelling rental:", err);
    res.status(500).json({ message: "Server error during rental cancellation." });
  }
};