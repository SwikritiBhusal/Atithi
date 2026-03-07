import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingId: {
    type: String,
    required: true,
    unique: true
  },

  // User & Homestay References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homestayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homestay',
    required: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Booking Details
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  rooms: {
    type: Number,
    required: true
  },
  guests: {
    type: Number,
    required: true
  },

  // Pricing
  totalPrice: {
    type: Number,
    required: true
  },
  advancePayment: {
    type: Number,
    required: true
  },
  remainingPayment: {
    type: Number,
    required: true,
    default: 0
  },
  paymentOption: {
    type: String,
    enum: ['advance', 'full'],
    required: true
  },

  // Payment Details
  paymentStatus: {
    type: String,
    enum: ['partial', 'full'],  // Removed 'pending' - payment is done before booking
    default: 'partial'
  },
  khaltiTransactionId: {
    type: String
  },
  khaltiPidx: {
    type: String
  },
  paymentDate: {
    type: Date
  },

  // Booking Status (INSTANT BOOKING - no 'pending' or 'rejected')
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],  // Removed 'pending' and 'rejected'
    default: 'confirmed'  // INSTANT BOOKING - automatically confirmed
  },

  // Guest Information (for easy access)
  guestName: {
    type: String,
    required: true
  },
  guestEmail: {
    type: String,
    required: true
  },
  guestPhone: {
    type: String
  },

  // Homestay Information (snapshot for record)
  homestayName: {
    type: String,
    required: true
  },
  homestayLocation: {
    type: String
  },

  // Additional Notes
  specialRequests: {
    type: String
  },
  cancellationReason: {
    type: String
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
bookingSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;