// controllers/bookingController.js

import Booking from '../models/bookingModel.js';
import Cancellation from '../models/cancellationModel.js';
import Notification from "../models/notificationsModel.js";
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
      status: 'confirmed', // INSTANT BOOKING
      guestName,
      guestEmail,
      guestPhone,
      homestayName,
      homestayLocation
    });

    await newBooking.save();

    console.log("✅ Booking saved successfully:", newBooking.bookingId);

    try {
      // Host notification
      const hostNotification = await Notification.create({
        userId: newBooking.hostId,
        role: "host",
        title: "New Booking Received",
        message: `You received a new booking (${newBooking.bookingId})`
      });

      console.log("🔔 Host notification created:", hostNotification);

      // User notification
      const userNotification = await Notification.create({
        userId: newBooking.userId,
        role: "tourist",
        title: "Booking Confirmed",
        message: `Your booking at ${newBooking.homestayName} has been confirmed`
      });

      console.log("✅ User notification created:", userNotification);

    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
    }

    // Send booking confirmation email
    try {
      await sendBookingConfirmationEmail(newBooking);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
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
      .populate('cancellation') // ⭐ NEW: Populate cancellation
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
      .populate('cancellation') // ⭐ NEW: Populate cancellation
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

// Update booking status
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
      .populate('hostId', 'username email contactNumber')
      .populate('cancellation'); // ⭐ NEW: Populate cancellation

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

// ⭐⭐⭐ NEW FUNCTION: CANCEL BOOKING ⭐⭐⭐
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

    if (booking.status === 'cancelled') {
      return res.json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    if (today >= checkInDate) {
      return res.json({
        success: false,
        message: 'Cannot cancel on or after check-in date'
      });
    }

    const now = new Date();
    const bookingCreatedAt = new Date(booking.createdAt);
    const hoursSinceBooking = (now - bookingCreatedAt) / (1000 * 60 * 60);

    let cancellationFee = 0;
    let refundAmount = 0;
    let refundPercentage = 0;
    let policyApplied = '';

    if (hoursSinceBooking <= 2) {
      refundPercentage = 100;
      refundAmount = booking.advancePayment;
      cancellationFee = 0;
      policyApplied = 'Grace period (100% refund)';
    } else {
      refundPercentage = 80;
      refundAmount = Math.round(booking.advancePayment * 0.80);
      cancellationFee = Math.round(booking.advancePayment * 0.20);
      policyApplied = 'Standard cancellation (20% fee)';
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'No reason provided';
    await booking.save();

    const cancellation = new Cancellation({
      bookingId: booking._id,
      cancelledBy: userId,
      cancelledAt: new Date(),
      reason: reason || 'No reason provided',
      originalAmount: booking.advancePayment,
      cancellationFee: cancellationFee,
      refundAmount: refundAmount,
      refundPercentage: refundPercentage,
      refundStatus: 'pending',
      refundInitiatedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await cancellation.save();

    try {
      await Notification.create({
        userId: booking.hostId,
        role: 'host',
        title: '🚫 Booking Cancelled',
        message: `${booking.guestName} cancelled booking ${booking.bookingId}. Refund: NPR ${refundAmount.toLocaleString()} (${refundPercentage}%)`
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    return res.json({
      success: true,
      message: `Booking cancelled successfully. ${policyApplied}`,
      booking,
      cancellation: {
        cancelledAt: cancellation.cancelledAt,
        refundAmount: cancellation.refundAmount,
        cancellationFee: cancellation.cancellationFee,
        refundPercentage: cancellation.refundPercentage,
        refundStatus: cancellation.refundStatus
      },
      info: {
        title: 'Cancellation Confirmed',
        message: `You will receive NPR ${refundAmount.toLocaleString()} (${refundPercentage}% refund). ${policyApplied}`,
        refundTimeline: 'Refund will be processed within 24 hours and will appear in your account within 7-10 business days'
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

// Delete booking
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

    const deletedBookingInfo = {
      bookingId: booking.bookingId,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      homestayName: booking.homestayName,
      totalPrice: booking.totalPrice,
      advancePayment: booking.advancePayment
    };

    await Booking.findByIdAndDelete(bookingId);
    await Cancellation.findOneAndDelete({ bookingId: bookingId });

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