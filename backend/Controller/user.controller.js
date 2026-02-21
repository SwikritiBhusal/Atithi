import userModel from "../models/usermodel.js";

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
