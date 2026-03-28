import Notification from "../models/notificationsModel.js";

export const getNotifications = async (req, res) => {
  try {
    // Debug logs
    console.log('📥 GET /api/notifications called');
    console.log('👤 req.user:', req.user);

    if (!req.user || !req.user.id) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    console.log('🔍 Searching for userId:', req.user.id);

    const notifications = await Notification.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    console.log('📊 Found notifications:', notifications.length);

    return res.json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('❌ Error in getNotifications:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('✅ Marking as read:', id);

    await Notification.findByIdAndUpdate(id, { read: true });

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllRead = async (req, res) => {
  try {
    console.log('✅ Marking all as read for user:', req.user.id);

    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};