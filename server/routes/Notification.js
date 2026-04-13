import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  cartReminder,
} from "../controllers/Notification.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", auth, getNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.patch("/:notificationId/read", auth, markNotificationRead);
router.post("/read-all", auth, markAllNotificationsRead);
router.post("/cart-reminder", auth, cartReminder);

export default router;