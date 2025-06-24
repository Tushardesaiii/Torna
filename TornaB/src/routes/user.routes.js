import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserProfile,          // New import
  updateDailyGoalAndWordCount, // New import
  markNotificationAsRead,     // New import
  markAllNotificationsAsRead  // New import
} from "../controller/user.controller.js"; // Ensure all new controllers are imported
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// Protected routes (authentication required using authMiddleware)
router.post("/logout", authMiddleware, logoutUser);
router.get("/current-user", authMiddleware, getCurrentUser);

// User Profile and Preferences
router.put("/profile", authMiddleware, updateUserProfile); // To update general profile info and preferences

// User Dashboard Data (Daily Goal, Word Count)
router.put("/daily-goal", authMiddleware, updateDailyGoalAndWordCount); // To update daily goal and today's word count

// Notifications
router.put("/notifications/:notificationId/read", authMiddleware, markNotificationAsRead); // Mark specific notification as read
router.put("/notifications/read-all", authMiddleware, markAllNotificationsAsRead); // Mark all notifications as read

export default router;