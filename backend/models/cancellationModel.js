import mongoose from "mongoose";

const cancellationSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // One cancellation per booking
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cancelledAt: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      default: "No reason provided",
    },
    // Original booking amount
    originalAmount: {
      type: Number,
      required: true,
    },
    // Refund calculation
    cancellationFee: {
      type: Number,
      required: true, // 20% or 0%
    },
    refundAmount: {
      type: Number,
      required: true, // 80% or 100%
    },
    refundPercentage: {
      type: Number,
      required: true, // 80 or 100
    },
    // Status tracking
    refundStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    // Timeline
    refundInitiatedAt: {
      type: Date,
      default: Date.now,
    },
    refundCompletedAt: {
      type: Date,
    },
    // Metadata
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

// Indexes for faster queries
cancellationSchema.index({ bookingId: 1 });
cancellationSchema.index({ cancelledBy: 1 });
cancellationSchema.index({ refundStatus: 1 });
cancellationSchema.index({ createdAt: -1 });

export default mongoose.model("Cancellation", cancellationSchema);