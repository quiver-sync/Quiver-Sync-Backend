const ActiveRental = require('../models/ActiveRental');
const RentalRequest = require('../models/RentalRequest');

exports.confirmRentalRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user.id;

  const request = await RentalRequest.findById(requestId).populate('rental');
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status !== 'approved')
    return res.status(400).json({ message: 'Request is not approved yet' });
  if (request.renter.toString() !== userId)
    return res.status(403).json({ message: 'Unauthorized' });

  const activeRental = await ActiveRental.create({
    rental: request.rental._id,
    renter: userId,
    startDate: request.startDate,
    endDate: request.endDate
  });

  await RentalRequest.findByIdAndDelete(requestId);

  res.status(201).json({ message: 'Rental confirmed', activeRental });
};
