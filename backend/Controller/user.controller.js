import userModel from "../models/usermodel.js";
import Homestay from "../models/homestayModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.user.id; //get from middleware

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            userData: {
                name: user.username,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).populate('favorites');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const homestayId = req.params.id;

    const [user, homestay] = await Promise.all([
      userModel.findById(userId),
      Homestay.findById(homestayId),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    if (user.favorites.some((fav) => fav.toString() === homestayId)) {
      return res.json({ success: true, message: 'Already in favorites', favorites: user.favorites });
    }

    user.favorites.push(homestayId);
    await user.save();

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const homestayId = req.params.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.favorites = user.favorites.filter(favId => favId.toString() !== homestayId);
    await user.save();

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
