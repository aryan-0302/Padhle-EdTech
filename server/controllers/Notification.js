import Notification from "../models/Notifications.js";
import { createNotification } from "../utils/notificationHelper.js";
import User from "../models/User.js"
import { notifyInstructorNewReview } from "../utils/notificationHelper.js";

const LIST_LIMIT = 30;

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(LIST_LIMIT)
      .lean();

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("getNotifications:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      recipient: userId,
      readAt: null,
    });
    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("getUnreadCount:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { readAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("markNotificationRead:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { recipient: userId, readAt: null },
      { readAt: new Date() }
    );
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("markAllNotificationsRead:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cartReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseIds } = req.body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        skipped: true,
      });
    }

    const oneMinuteAgo = new Date(Date.now() -  60 * 1000);
    const recent = await Notification.findOne({
      recipient: userId,
      type: "CART_REMINDER",
      createdAt: { $gte: oneMinuteAgo },
    }).lean();

    if (recent) {
      return res.status(200).json({
        success: true,
        skipped: true,
      });
    }

    const n = courseIds.length;
    await createNotification({
      recipientId: userId,
      type: "CART_REMINDER",
      title: "Your cart is waiting",
      body:
        n === 1
          ? "You have 1 course in your cart. Complete checkout when you're ready."
          : `You have ${n} courses in your cart. Complete checkout when you're ready.`,
      metadata: { courseIds: courseIds.map(String) },
    });

    return res.status(200).json({
      success: true,
      created: true,
    });
  } catch (error) {
    console.error("cartReminder:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};