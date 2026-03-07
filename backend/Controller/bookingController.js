// controllers/bookingController.js

import Booking from '../models/bookingModel.js';
import { sendBookingConfirmationEmail } from '../utils/emailService.js';

// Create new booking (called after successful payment)
export const createBooking = async (req, res) => {
  try {
    const {
      bookingId,
      userId,
      homestayId,
      hostId,
      checkIn,
      checkOut,
      nights,
      rooms,
      guests,
      totalPrice,
      advancePayment,
      remainingPayment,
      paymentOption,
      khaltiTransactionId,
      khaltiPidx,
      guestName,
      guestEmail,
      guestPhone,
      homestayName,
      homestayLocation
    } = req.body;

    // Check if booking already exists (prevent duplicates)
    const existingBooking = await Booking.findOne({ bookingId });
    if (existingBooking) {
      return res.json({
        success: true,
        message: 'Booking already exists',
        booking: existingBooking
      });
    }

    // Determine payment status
    const paymentStatus = paymentOption === 'full' ? 'full' : 'partial';

    // Create new booking (INSTANT CONFIRMATION)
    const newBooking = new Booking({
      bookingId,
      userId,
      homestayId,
      hostId,
      checkIn,
      checkOut,
      nights,
      rooms,
      guests,
      totalPrice,
      advancePayment,
      remainingPayment,
      paymentOption,
      paymentStatus,
      khaltiTransactionId,
      khaltiPidx,
      paymentDate: new Date(),
      status: 'confirmed', // INSTANT BOOKING - Automatically confirmed after payment
      guestName,
      guestEmail,
      guestPhone,
      homestayName,
      homestayLocation
    });

    await newBooking.save();

    // Send booking confirmation email
    try {
      await sendBookingConfirmationEmail(newBooking);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue even if email fails
    }

    return res.json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    return res.json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId })
      .populate('homestayId', 'homestayName homestayPhotos province district')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get User Bookings Error:', error);
    return res.json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get host's bookings
export const getHostBookings = async (req, res) => {
  try {
    const { hostId } = req.params;

    const bookings = await Booking.find({ hostId })
      .populate('userId', 'username email contactNumber')
      .populate('homestayId', 'homestayName')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get Host Bookings Error:', error);
    return res.json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Update booking status (for status changes)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    const oldStatus = booking.status;
    booking.status = status;
    
    if (reason) {
      booking.cancellationReason = reason;
    }
    
    await booking.save();

    return res.json({
      success: true,
      message: 'Booking status updated',
      booking
    });

  } catch (error) {
    console.error('Update Booking Status Error:', error);
    return res.json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Get single booking details
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ bookingId })
      .populate('userId', 'username email contactNumber')
      .populate('homestayId')
      .populate('hostId', 'username email contactNumber');

    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get Booking Details Error:', error);
    return res.json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message
    });
  }
};

// Delete booking (for emergencies)
export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Store booking info before deletion (for potential refund/records)
    const deletedBookingInfo = {
      bookingId: booking.bookingId,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      homestayName: booking.homestayName,
      totalPrice: booking.totalPrice,
      advancePayment: booking.advancePayment
    };

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    // TODO: Send cancellation email to guest
    // TODO: Process refund if needed

    return res.json({
      success: true,
      message: 'Booking deleted successfully',
      deletedBooking: deletedBookingInfo
    });

  } catch (error) {
    console.error('Delete Booking Error:', error);
    return res.json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
};