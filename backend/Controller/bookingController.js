// controllers/bookingController.js

import Booking from '../models/bookingModel.js';
import Cancellation from '../models/cancellationModel.js';
import Notification from "../models/notificationsModel.js";
import { sendBookingConfirmationEmail } from '../utils/emailService.js';
import Homestay from '../models/homestayModel.js';
import { autoCompletePastCheckoutBookings } from '../utils/bookingStatusUpdater.js';

const formatCurrency = (amount = 0) => `NPR ${Number(amount || 0).toLocaleString()}`;

const formatReportDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const sanitizePdfText = (value = '') =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const buildRevenueEntries = (bookings = []) =>
  bookings.map((booking) => {
    const cancellation = booking.cancellation || null;
    const deductionAmount = booking.status === 'cancelled'
      ? Number(cancellation?.refundAmount || booking.advancePayment || 0)
      : 0;
    const retainedAmount = booking.status === 'cancelled'
      ? Number(booking.advancePayment || 0) - deductionAmount
      : Number(booking.advancePayment || 0);

    return {
      id: booking._id,
      bookingId: booking.bookingId,
      guestName: booking.guestName,
      homestayName: booking.homestayName,
      createdAt: booking.createdAt,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status,
      totalPrice: Number(booking.totalPrice || 0),
      collectedAmount: Number(booking.advancePayment || 0),
      pendingAmount: booking.status === 'cancelled' ? 0 : Number(booking.remainingPayment || 0),
      deductionAmount,
      netCollectedAmount: retainedAmount,
      cancellationFee: Number(cancellation?.cancellationFee || 0),
      refundAmount: Number(cancellation?.refundAmount || 0),
      refundStatus: cancellation?.refundStatus || null,
      cancellationReason: booking.cancellationReason || cancellation?.reason || ''
    };
  });

const getAvailableRoomsForBooking = async ({ homestayId, checkIn, checkOut }) => {
  const homestay = await Homestay.findById(homestayId).select('rooms blockedRooms');
  if (!homestay) {
    return null;
  }

  const overlappingBookings = await Booking.find({
    homestayId,
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
    status: { $in: ['confirmed', 'completed'] }
  }).select('rooms');

  const bookedRooms = overlappingBookings.reduce(
    (total, booking) => total + Number(booking.rooms || 0),
    0
  );

  return Math.max(
    0,
    Number(homestay.rooms || 0) - Number(homestay.blockedRooms || 0) - bookedRooms
  );
};

const buildRevenueSummary = (entries = []) => entries.reduce((summary, entry) => {
  summary.totalBookings += 1;
  summary.totalGrossRevenue += entry.totalPrice;
  summary.totalCollectedRevenue += entry.collectedAmount;
  summary.totalPendingRevenue += entry.pendingAmount;
  summary.totalDeductions += entry.deductionAmount;
  summary.netCollectedRevenue += entry.netCollectedAmount;

  if (entry.status === 'confirmed') summary.confirmedBookings += 1;
  if (entry.status === 'completed') summary.completedBookings += 1;
  if (entry.status === 'cancelled') summary.cancelledBookings += 1;

  return summary;
}, {
  totalBookings: 0,
  confirmedBookings: 0,
  completedBookings: 0,
  cancelledBookings: 0,
  totalGrossRevenue: 0,
  totalCollectedRevenue: 0,
  totalPendingRevenue: 0,
  totalDeductions: 0,
  netCollectedRevenue: 0
});

const createPdfBuffer = ({ title, subtitle, summary, entries }) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginLeft = 40;
  const marginTop = 40;
  const lineHeight = 16;
  const linesPerPage = 44;

  const lines = [
    title,
    subtitle,
    '',
    `Total bookings: ${summary.totalBookings}`,
    `Confirmed: ${summary.confirmedBookings}   Completed: ${summary.completedBookings}   Cancelled: ${summary.cancelledBookings}`,
    `Gross revenue: ${formatCurrency(summary.totalGrossRevenue)}`,
    `Collected online: ${formatCurrency(summary.totalCollectedRevenue)}`,
    `Pending at property: ${formatCurrency(summary.totalPendingRevenue)}`,
    `Cancellation deductions: ${formatCurrency(summary.totalDeductions)}`,
    `Net collected: ${formatCurrency(summary.netCollectedRevenue)}`,
    '',
    'Booking records',
    'Booking ID | Guest | Status | Collected | Deduction | Net | Check-in'
  ];

  entries.forEach((entry) => {
    lines.push(
      `${entry.bookingId} | ${entry.guestName} | ${entry.status} | ${formatCurrency(entry.collectedAmount)} | ${formatCurrency(entry.deductionAmount)} | ${formatCurrency(entry.netCollectedAmount)} | ${formatReportDate(entry.checkIn)}`
    );

    if (entry.pendingAmount > 0) {
      lines.push(`Pending amount: ${formatCurrency(entry.pendingAmount)}`);
    }

    if (entry.cancellationReason) {
      lines.push(`Reason: ${entry.cancellationReason}`);
    }

    lines.push('');
  });

  const pages = [];
  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  let objectIndex = 1;
  const objects = [];

  const addObject = (content) => {
    const id = objectIndex++;
    objects.push({ id, content });
    return id;
  };

  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds = [];

  const contentIds = pages.map((pageLines) => {
    const commands = ['BT', `/F1 10 Tf`, `${marginLeft} ${pageHeight - marginTop} Td`];

    pageLines.forEach((line, lineIndex) => {
      const safeLine = sanitizePdfText(line);
      if (lineIndex === 0) {
        commands.push(`(${safeLine}) Tj`);
      } else {
        commands.push(`0 -${lineHeight} Td`);
        commands.push(`(${safeLine}) Tj`);
      }
    });

    commands.push('ET');
    const stream = commands.join('\n');
    return addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
  });

  const pagesId = objectIndex++;

  contentIds.forEach((contentId) => {
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  const pagesObject = {
    id: pagesId,
    content: `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`
  };

  objects.push(pagesObject);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  objects.sort((a, b) => a.id - b.id);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object) => {
    offsets[object.id] = Buffer.byteLength(pdf, 'utf8');
    pdf += `${object.id} 0 obj\n${object.content}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let id = 1; id <= objects.length; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
};

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

    const availableRooms = await getAvailableRoomsForBooking({
      homestayId,
      checkIn,
      checkOut
    });

    if (availableRooms === null) {
      return res.json({
        success: false,
        message: 'Homestay not found'
      });
    }

    if (Number(rooms || 0) > availableRooms) {
      return res.json({
        success: false,
        message: `Only ${availableRooms} room(s) are available for the selected dates`
      });
    }

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
    await autoCompletePastCheckoutBookings();

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
    await autoCompletePastCheckoutBookings();

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

export const getHostRevenue = async (req, res) => {
  try {
    const { hostId } = req.params;
    await autoCompletePastCheckoutBookings();

    const bookings = await Booking.find({ hostId })
      .populate('cancellation')
      .sort({ createdAt: -1 });

    const entries = buildRevenueEntries(bookings);
    const summary = buildRevenueSummary(entries);

    return res.json({
      success: true,
      summary,
      entries
    });
  } catch (error) {
    console.error('Get Host Revenue Error:', error);
    return res.json({
      success: false,
      message: 'Failed to fetch host revenue',
      error: error.message
    });
  }
};

export const downloadHostRevenueReport = async (req, res) => {
  try {
    const { hostId } = req.params;
    await autoCompletePastCheckoutBookings();

    const bookings = await Booking.find({ hostId })
      .populate('cancellation')
      .sort({ createdAt: -1 });

    const entries = buildRevenueEntries(bookings);
    const summary = buildRevenueSummary(entries);

    const generatedAt = new Date();
    const pdfBuffer = createPdfBuffer({
      title: 'Host Revenue Report',
      subtitle: `Generated on ${formatReportDate(generatedAt)}`,
      summary,
      entries
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="host-revenue-report-${hostId}-${generatedAt.toISOString().slice(0, 10)}.pdf"`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Download Host Revenue Report Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download revenue report',
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
    await autoCompletePastCheckoutBookings();

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
