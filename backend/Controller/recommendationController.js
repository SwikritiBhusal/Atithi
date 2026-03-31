import Homestay from '../models/homestayModel.js';
import RecommendationHistory from '../models/recommendationHistoryModel.js';
import natural from 'natural'; 
import { cosineSimilarity, generateEmbedding } from '../utils/aiHelper.js';

// AI-POWERED RECOMMENDATION ENGINE
export const getSmartRecommendations = async (req, res) => {
  try {
    const { travelPurpose, budget, mustHaves, duration, groupSize } = req.body;
    const userId = req.user?.id;

    // Fetch all approved homestays
    const homestays = await Homestay.find({ status: 'approved' });

    if (homestays.length === 0) {
      return res.json({
        success: false,
        message: 'No homestays available at the moment'
      });
    }

    // Build user preference text
    const userPreferenceText = buildUserPreferenceText({
      travelPurpose,
      budget,
      mustHaves,
      duration,
      groupSize
    });

    console.log('🎯 User Preference Profile:', userPreferenceText);

    // Generate embedding for user preferences
    const userEmbedding = await generateEmbedding(userPreferenceText);

    // Score all homestays using AI similarity
    const scoredHomestays = await Promise.all(
      homestays.map(async (homestay) => {
        const homestayText = buildHomestayText(homestay);
        const homestayEmbedding = await generateEmbedding(homestayText);

        let matchScore = cosineSimilarity(userEmbedding, homestayEmbedding) * 100;

        const { score: filterScore, penalties } = applyFilters(homestay, {
          budget,
          groupSize,
          duration
        });

        matchScore = (matchScore * 0.7) + (filterScore * 0.3);

        const reasons = await generateMatchReasons(
          homestay,
          { travelPurpose, budget, mustHaves, groupSize },
          matchScore
        );

        return {
          homestay,
          matchScore: Math.min(Math.round(matchScore), 100),
          reasons,
          semanticScore: Math.round(cosineSimilarity(userEmbedding, homestayEmbedding) * 100),
          filterScore: Math.round(filterScore)
        };
      })
    );

    // Sort by match score and take top 2
    scoredHomestays.sort((a, b) => b.matchScore - a.matchScore);
    let topRecommendations = scoredHomestays.slice(0, 2);

    // Ensure minimum quality threshold
    topRecommendations = topRecommendations.map((rec, idx) => {
      if (idx === 0) rec.matchScore = Math.max(rec.matchScore, 75);
      if (idx === 1) rec.matchScore = Math.max(rec.matchScore, 65);
      return rec;
    });

    // ✅ FIX 1: Safely parse duration — schema expects Number, but input may be "1-2"
    const parsedDuration = (() => {
      if (!duration) return 0;
      if (typeof duration === 'number') return duration;
      const match = String(duration).match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })();

    // Save to history
    let savedHistory = null;
    if (userId) {
      try {
        savedHistory = await RecommendationHistory.create({
          userId,
          preferences: {
            travelPurpose,
            budget,
            mustHaves: mustHaves || [],
            duration: parsedDuration,   // ✅ Always a Number now
            groupSize: groupSize || 1
          },
          recommendations: topRecommendations.map(rec => ({
            homestayId: rec.homestay._id,
            matchScore: rec.matchScore,
            reasons: rec.reasons
          })),
          aiMetadata: {
            userPreferenceText,
            algorithmVersion: '2.0-AI-Powered'
          }
        });

        console.log('✅ AI Recommendation saved:', savedHistory._id);
      } catch (historyError) {
        // ✅ FIX 2: Log full error details so you can debug schema mismatches faster
        console.error('Failed to save history:', historyError.message);
        if (historyError.errors) {
          Object.entries(historyError.errors).forEach(([field, err]) => {
            console.error(`  Field "${field}": ${err.message} (got: ${JSON.stringify(err.value)})`);
          });
        }
      }
    }

    return res.json({
      success: true,
      recommendations: topRecommendations,
      total: topRecommendations.length,
      historyId: savedHistory?._id,
      message: `Found ${topRecommendations.length} AI-matched homestays for you`,
      aiPowered: true
    });

  } catch (error) {
    console.error('❌ AI Recommendation Error:', error);
    return res.json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
};

// ⭐ BUILD USER PREFERENCE TEXT
function buildUserPreferenceText({ travelPurpose, budget, mustHaves, duration, groupSize }) {
  const purposeDescriptions = {
    adventure: 'adventure trekking hiking mountain outdoor activities climbing expedition trails wilderness nature exploration',
    wellness: 'wellness relaxation peaceful quiet yoga meditation spa tranquil calm serene rejuvenation retreat healing',
    culture: 'cultural heritage traditional authentic local customs festivals temples history art traditional-food community',
    family: 'family-friendly children kids spacious safe playground activities group accommodation large-rooms',
    photography: 'scenic views photography landscape panoramic vistas mountain-view sunrise sunset picturesque photogenic'
  };

  const budgetDescriptions = {
    budget: 'affordable economical budget-friendly value cheap low-cost',
    moderate: 'moderate comfortable standard value-for-money mid-range',
    premium: 'luxury premium upscale high-end exclusive deluxe sophisticated'
  };

  let text = purposeDescriptions[travelPurpose] || '';
  text += ' ' + (budgetDescriptions[budget] || '');

  if (mustHaves && mustHaves.length > 0) {
    const mustHaveDescriptions = {
      mountain_view: 'mountain panoramic-view himalayan-view scenic-vista peaks',
      trekking_trails: 'trekking-access hiking-trails mountain-trails outdoor-activities',
      traditional_food: 'traditional-cuisine local-food authentic-meals nepali-food',
      wifi: 'internet wifi connectivity workspace remote-work',
      family_friendly: 'family children kids child-safe playground',
      cultural_activities: 'cultural-activities traditional-experiences local-culture workshops',
      peaceful: 'peaceful quiet serene tranquil calm secluded',
      hot_water: 'hot-water shower facilities comfort amenities'
    };

    mustHaves.forEach(item => {
      text += ' ' + (mustHaveDescriptions[item] || '');
    });
  }

  if (groupSize > 1) {
    text += ' group accommodation spacious multiple-rooms';
  }

  return text.toLowerCase().trim();
}

// ⭐ BUILD HOMESTAY TEXT
function buildHomestayText(homestay) {
  const name = homestay.homestayName || '';
  const description = homestay.description || '';
  const location = homestay.location || '';
  const district = homestay.district || '';
  const province = homestay.province || '';

  let text = `${name} ${description} ${location} ${district} ${province}`;

  if (homestay.amenities && Array.isArray(homestay.amenities)) {
    text += ' ' + homestay.amenities.join(' ');
  }

  return text.toLowerCase().trim();
}

// ⭐ APPLY HARD FILTERS
function applyFilters(homestay, { budget, groupSize }) {
  let score = 0;
  const penalties = [];

  const price = homestay.price || 0;

  if (budget === 'budget' && price < 2000) {
    score += 30;
  } else if (budget === 'moderate' && price >= 2000 && price <= 4000) {
    score += 30;
  } else if (budget === 'premium' && price > 4000) {
    score += 30;
  } else if (budget === 'budget' && price < 2500) {
    score += 25;
  } else if (budget === 'moderate' && price >= 1500 && price < 2000) {
    score += 25;
  } else {
    score += 15;
    penalties.push('Outside preferred budget range');
  }

  const capacity = homestay.rooms || 1;
  if (groupSize <= capacity * 2) {
    score += 20;
  } else {
    score += 10;
    penalties.push('May be tight for group size');
  }

  const rating = homestay.averageRating || 0;
  if (rating >= 4.5) score += 10;
  else if (rating >= 4.0) score += 7;
  else if (rating >= 3.5) score += 5;

  return { score, penalties };
}

// ⭐ GENERATE AI-POWERED MATCH REASONS
async function generateMatchReasons(homestay, preferences, matchScore) {
  const reasons = [];
  const { travelPurpose, budget, mustHaves, groupSize } = preferences;

  const purposeReasons = {
    adventure: `Perfect for adventure enthusiasts with ${homestay.district || 'excellent'} location`,
    wellness: `Tranquil atmosphere ideal for wellness and relaxation`,
    culture: `Authentic cultural experience with traditional hospitality`,
    family: `Family-friendly environment with spacious accommodations`,
    photography: `Stunning scenic views perfect for photography`
  };
  reasons.push(purposeReasons[travelPurpose] || 'Great match for your travel style');

  const price = homestay.price || 0;
  reasons.push(`Excellent value at NPR ${price.toLocaleString()} per night`);

  const rating = homestay.averageRating || 0;
  if (rating >= 4.0) {
    reasons.push(`Highly rated at ${rating.toFixed(1)}⭐ by previous guests`);
  } else {
    reasons.push(`Welcoming hosts provide authentic local experience`);
  }

  reasons.push(`Prime location in ${homestay.district || 'Nepal'}`);

  return reasons.slice(0, 4);
}

// ✅ GET RECOMMENDATION HISTORY — fixed populate path
export const getRecommendationHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const history = await RecommendationHistory.find({ userId })
      .populate({
        path: 'recommendations.homestayId',
        model: 'Homestay',           // ✅ Explicitly name the model
        select: 'homestayName location district province price averageRating images'
      })
      .sort({ createdAt: -1 })
      .limit(20);

    // ✅ FIX 3: Filter out entries where homestayId failed to populate (deleted homestays)
    const cleanHistory = history.map(entry => ({
      ...entry.toObject(),
      recommendations: entry.recommendations.filter(r => r.homestayId != null)
    }));

    return res.json({
      success: true,
      history: cleanHistory
    });

  } catch (error) {
    console.error('Get history error:', error);
    return res.json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
};

export const getRecommendationById = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user?.id;

    const recommendation = await RecommendationHistory.findOne({
      _id: historyId,
      userId
    }).populate({
      path: 'recommendations.homestayId',
      model: 'Homestay',
      select: 'homestayName location district province price averageRating images'
    });

    if (!recommendation) {
      return res.json({ success: false, message: 'Recommendation not found' });
    }

    return res.json({ success: true, recommendation });

  } catch (error) {
    console.error('Get recommendation error:', error);
    return res.json({ success: false, message: 'Failed to fetch recommendation', error: error.message });
  }
};

export const toggleSaveRecommendation = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user?.id;

    const recommendation = await RecommendationHistory.findOne({ _id: historyId, userId });

    if (!recommendation) {
      return res.json({ success: false, message: 'Recommendation not found' });
    }

    recommendation.isSaved = !recommendation.isSaved;
    await recommendation.save();

    return res.json({
      success: true,
      message: recommendation.isSaved ? 'Saved to collection' : 'Removed from collection',
      isSaved: recommendation.isSaved
    });

  } catch (error) {
    console.error('Toggle save error:', error);
    return res.json({ success: false, message: 'Failed to save', error: error.message });
  }
};

export const deleteRecommendation = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user?.id;

    const result = await RecommendationHistory.findOneAndDelete({ _id: historyId, userId });

    if (!result) {
      return res.json({ success: false, message: 'Recommendation not found' });
    }

    return res.json({ success: true, message: 'Recommendation deleted' });

  } catch (error) {
    console.error('Delete error:', error);
    return res.json({ success: false, message: 'Failed to delete', error: error.message });
  }
};