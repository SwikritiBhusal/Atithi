import Booking from '../models/bookingModel.js';

// Mark bookings as completed once their check-out date has fully passed.
export const autoCompletePastCheckoutBookings = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  await Booking.updateMany(
    {
      status: 'confirmed',
      checkOut: { $lt: todayStart }
    },
    {
      $set: {
        status: 'completed',
        updatedAt: new Date()
      }
    }
  );
};
