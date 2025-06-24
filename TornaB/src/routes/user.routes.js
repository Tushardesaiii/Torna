// routes/user.routes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateUserProfile,
  updateDailyGoalAndWordCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.post("/users/refresh-token", refreshAccessToken);

// Protected routes (authentication required using authMiddleware)
router.post("/users/logout", authMiddleware, logoutUser);
router.get("/users/current-user", authMiddleware, getCurrentUser);

// User Profile and Preferences
router.put("/users/profile", authMiddleware, updateUserProfile);

// User Dashboard Data (Daily Goal, Word Count)
router.put("/users/daily-goal", authMiddleware, updateDailyGoalAndWordCount);

// Notifications
router.put("/users/notifications/:notificationId/read", authMiddleware, markNotificationAsRead);
router.put("/users/notifications/read-all", authMiddleware, markAllNotificationsAsRead);

export default router;
