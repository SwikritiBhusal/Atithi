
import Homestay from '../models/homestayModel.js';
import RecommendationHistory from '../models/recommendationHistoryModel.js';
import HomestayEmbedding from '../models/homestayEmbeddingModel.js';
import { generateEmbedding, cosineSimilarity } from '../utils/aiHelper.js';

export const getSmartRecommendations = async (req, res) => {
  try {
    const { travelPurpose, budget, mustHaves, duration, groupSize } = req.body;
    const userId = req.user?.id;

    // Fetch pre-computed embeddings with homestay data
    const homestayEmbeddings = await HomestayEmbedding.find()
      .populate('homestayId')
      .lean();

    // Only approved homestays that have embeddings
    const validEmbeddings = homestayEmbeddings.filter(
      e => e.homestayId && e.homestayId.status === 'approved'
    );

    if (validEmbeddings.length === 0) {
      return res.json({
        success: false,
        message: 'No homestays available at the moment'
      });
    }

    // Build preference text for embedding
    const userPreferenceText = buildUserPreferenceText({
      travelPurpose, budget, mustHaves, duration, groupSize
    });

    console.log('User Preference Profile:', userPreferenceText);

    // ONE embedding call for user query (not one per homestay)
    const userEmbedding = await generateEmbedding(userPreferenceText);

    // Score using stored embeddings — pure math, no extra API calls
    const scoredHomestays = validEmbeddings.map(embeddingDoc => {
      const homestay = embeddingDoc.homestayId;
      const semanticScore = cosineSimilarity(userEmbedding, embeddingDoc.embedding);
      const { score: filterScore } = applyFilters(homestay, { budget, groupSize });

      const matchScore = Math.min(
        Math.round((semanticScore * 100 * 0.7) + (filterScore * 0.3)),
        100
      );

      return {
        homestay,
        matchScore,
        semanticScore: Math.round(semanticScore * 100),
        filterScore: Math.round(filterScore)
      };
    });

    // Sort and take top 2
    scoredHomestays.sort((a, b) => b.matchScore - a.matchScore);
    let topRecommendations = scoredHomestays.slice(0, 2);

    // Minimum score threshold
    topRecommendations = topRecommendations.map((rec, idx) => {
      if (idx === 0) rec.matchScore = Math.max(rec.matchScore, 75);
      if (idx === 1) rec.matchScore = Math.max(rec.matchScore, 65);
      return rec;
    });

    // Add human-readable reasons
    topRecommendations = topRecommendations.map(rec => ({
      ...rec,
      reasons: generateMatchReasons(rec.homestay, { travelPurpose, budget, mustHaves, groupSize })
    }));

    // Parse duration safely
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
            travelPurpose, budget,
            mustHaves: mustHaves || [],
            duration: parsedDuration,
            groupSize: groupSize || 1
          },
          recommendations: topRecommendations.map(rec => ({
            homestayId: rec.homestay._id,
            matchScore: rec.matchScore,
            reasons: rec.reasons
          })),
          aiMetadata: {
            userPreferenceText,
            algorithmVersion: '3.0-SentenceTransformers'
          }
        });
        console.log('Recommendation saved:', savedHistory._id);
      } catch (historyError) {
        console.error('Failed to save history:', historyError.message);
      }
    }

    return res.json({
      success: true,
      recommendations: topRecommendations,
      total: topRecommendations.length,
      historyId: savedHistory?._id,
      message: `Found ${topRecommendations.length} AI-matched homestays for you`,
      aiPowered: true,
      modelVersion: 'sentence-transformers/all-MiniLM-L6-v2'
    });

  } catch (error) {
    console.error('Recommendation Error:', error);
    return res.json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
};

// Builds user preference text for embedding
function buildUserPreferenceText({ travelPurpose, budget, mustHaves, groupSize }) {
  const purposeDescriptions = {
    adventure: 'adventure trekking hiking mountain outdoor activities climbing expedition trails wilderness nature exploration',
    wellness: 'wellness relaxation peaceful quiet yoga meditation spa tranquil calm serene rejuvenation retreat healing',
    culture: 'cultural heritage traditional authentic local customs festivals temples history art community',
    family: 'family-friendly children kids spacious safe playground activities group accommodation large rooms',
    photography: 'scenic views photography landscape panoramic vistas mountain view sunrise sunset picturesque photogenic'
  };

  const budgetDescriptions = {
    budget: 'affordable economical budget-friendly value cheap low-cost inexpensive',
    moderate: 'moderate comfortable standard value-for-money mid-range',
    premium: 'luxury premium upscale high-end exclusive deluxe sophisticated'
  };

  let text = purposeDescriptions[travelPurpose] || travelPurpose || '';
  text += ' ' + (budgetDescriptions[budget] || '');

  // mustHaves are real facility strings from homestay DB
  // e.g. ["WiFi", "Hot Water", "Mountain View"] — add directly
  if (mustHaves && mustHaves.length > 0) {
    text += ' ' + mustHaves.join(' ');
  }

  if (groupSize > 1) text += ' group accommodation spacious multiple rooms';

  return text.toLowerCase().trim();
}

function applyFilters(homestay, { budget, groupSize }) {
  let score = 0;
  const price = homestay.price || 0;

  if (budget === 'budget' && price < 2000) score += 30;
  else if (budget === 'moderate' && price >= 2000 && price <= 4000) score += 30;
  else if (budget === 'premium' && price > 4000) score += 30;
  else if (budget === 'budget' && price < 2500) score += 25;
  else if (budget === 'moderate' && price >= 1500 && price < 2000) score += 25;
  else score += 15;

  score += (groupSize <= (homestay.rooms || 1) * 2) ? 20 : 10;

  const rating = homestay.averageRating || 0;
  if (rating >= 4.5) score += 10;
  else if (rating >= 4.0) score += 7;
  else if (rating >= 3.5) score += 5;

  return { score };
}

function generateMatchReasons(homestay, preferences) {
  const { travelPurpose } = preferences;
  const purposeReasons = {
    adventure: `Perfect for adventure enthusiasts in ${homestay.district || 'Nepal'}`,
    wellness: 'Tranquil atmosphere ideal for wellness and relaxation',
    culture: 'Authentic cultural experience with traditional hospitality',
    family: 'Family-friendly environment with spacious accommodations',
    photography: 'Stunning scenic views perfect for photography'
  };

  const price = homestay.price || 0;
  const rating = homestay.averageRating || 0;

  return [
    purposeReasons[travelPurpose] || 'Great match for your travel style',
    `Excellent value at NPR ${price.toLocaleString()} per night`,
    rating >= 4.0
      ? `Highly rated at ${rating.toFixed(1)} stars by previous guests`
      : 'Welcoming hosts provide authentic local experience',
    `Located in ${homestay.district || 'Nepal'}`
  ];
}

export const getRecommendationHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const history = await RecommendationHistory.find({ userId })
      .populate({
        path: 'recommendations.homestayId',
        model: 'Homestay',
        select: 'homestayName location district province price averageRating homestayPhotos'
      })
      .sort({ createdAt: -1 })
      .limit(20);

    const cleanHistory = history.map(entry => ({
      ...entry.toObject(),
      recommendations: entry.recommendations.filter(r => r.homestayId != null)
    }));

    return res.json({ success: true, history: cleanHistory });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getRecommendationById = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user?.id;
    const recommendation = await RecommendationHistory.findOne({ _id: historyId, userId })
      .populate({ path: 'recommendations.homestayId', model: 'Homestay' });
    if (!recommendation) return res.json({ success: false, message: 'Recommendation not found' });
    return res.json({ success: true, recommendation });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const toggleSaveRecommendation = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user?.id;
    const recommendation = await RecommendationHistory.findOne({ _id: historyId, userId });
    if (!recommendation) return res.json({ success: false, message: 'Recommendation not found' });
    recommendation.isSaved = !recommendation.isSaved;
    await recommendation.save();
    return res.json({
      success: true,
      message: recommendation.isSaved ? 'Saved to collection' : 'Removed from collection',
      isSaved: recommendation.isSaved
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const deleteRecommendation = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user?.id;
    const result = await RecommendationHistory.findOneAndDelete({ _id: historyId, userId });
    if (!result) return res.json({ success: false, message: 'Recommendation not found' });
    return res.json({ success: true, message: 'Recommendation deleted' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};