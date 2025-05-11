const Rental = require('../models/Rental');
const RentalRequest = require('../models/RentalRequest');
const ActiveRental = require('../models/ActiveRental');

exports.createRentalRequest = async (req, res) => {
  const { rentalId, startDate, endDate } = req.body;
  const userId = req.user.id;

  const rental = await Rental.findById(rentalId).populate('owner');
  if (!rental) return res.status(404).json({ message: 'Rental not found' });
  if (rental.owner._id.toString() === userId)
    return res.status(403).json({ message: 'You cannot rent your own board' });

  const overlap = await ActiveRental.findOne({
    rental: rentalId,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  });
  if (overlap) return res.status(409).json({ message: 'Board is already booked on those dates' });

  const request = await RentalRequest.create({ rental: rentalId, renter: userId, startDate, endDate });
  res.status(201).json(request);
};

exports.getMyRequests = async (req, res) => {
  const requests = await RentalRequest.find({ renter: req.user.id }).populate('rental');
  res.json(requests);
};

exports.getRequestsReceived = async (req, res) => {
  const requests = await RentalRequest.find()
    .populate({
      path: 'rental',
      match: { owner: req.user.id },
      populate: { path: 'board' }
    })
    .populate('renter', 'username email');

  const filtered = requests.filter(r => r.rental !== null);
  res.json(filtered);
};

exports.updateRentalRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const request = await RentalRequest.findById(id).populate('rental');
  if (!request) return res.status(404).json({ message: 'Not found' });

  if (request.rental.owner.toString() !== req.user.id)
    return res.status(403).json({ message: 'You are not the owner' });

  request.status = status;
  await request.save();

  res.json({ message: `Request ${status}` });
};
  
