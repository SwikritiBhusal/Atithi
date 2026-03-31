import mongoose from 'mongoose';

const recommendationHistorySchema = new mongoose.Schema({
  // User who made the search
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Search preferences
  preferences: {
    travelPurpose: {
      type: String,
      required: true
    },
    budget: {
      type: String,
      required: true
    },
    mustHaves: [{
      type: String
    }],
    duration: {
      type: Number
    },
    groupSize: {
      type: Number
    }
  },

  // Results (store top recommendations)
  recommendations: [{
    homestayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Homestay'
    },
    matchScore: {
      type: Number
    },
    reasons: [{
      type: String
    }]
  }],

  // Metadata
  searchTitle: {
    type: String,
    default: function() {
      // Auto-generate title like "Adventure Trip - Budget"
      const purpose = this.preferences.travelPurpose.charAt(0).toUpperCase() + 
                     this.preferences.travelPurpose.slice(1);
      const budget = this.preferences.budget.charAt(0).toUpperCase() + 
                    this.preferences.budget.slice(1);
      return `${purpose} Trip - ${budget}`;
    }
  },

  isSaved: {
    type: Boolean,
    default: false // User can mark as "saved to collection"
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
recommendationHistorySchema.index({ userId: 1, createdAt: -1 });
recommendationHistorySchema.index({ userId: 1, isSaved: 1 });

const RecommendationHistory = mongoose.model('RecommendationHistory', recommendationHistorySchema);

export default RecommendationHistory;