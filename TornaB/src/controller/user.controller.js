import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Helper to generate and store tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Save without re-validating the whole document

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens", error.message);
  }
};

// Common options for setting cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Use secure cookies only in production over HTTPS
  sameSite: "lax", // Recommended for CSRF protection and better UX
};


// REGISTER (Signup)
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Create the user. Mongoose defaults will handle new fields.
  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
    // When a new user registers, initialize their daily word goal history for today
    wordCountHistory: [{ date: new Date().setHours(0, 0, 0, 0), words: 0, goalAchieved: false }]
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -resetToken -socialAccounts -subscription.paymentProviderId -subscription.renewalDate"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Generate tokens for immediate login after registration
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Update lastLogin for the newly registered user
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });


  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, accessToken, refreshToken }, // Optionally send tokens back
        "User registered successfully"
      )
    );
});

// LOGIN (Signin)
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: email?.toLowerCase() }
    ]
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Update lastLogin for the user
  user.lastLogin = Date.now();
  // Ensure that a daily word count entry exists for today if not present
  const today = new Date().setHours(0, 0, 0, 0);
  const todayEntry = user.wordCountHistory.find(entry => new Date(entry.date).setHours(0,0,0,0) === today);
  if (!todayEntry) {
    user.wordCountHistory.push({ date: today, words: 0, goalAchieved: false });
  }

  await user.save({ validateBeforeSave: false }); // Save lastLogin and potentially new wordCountHistory entry

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -resetToken -socialAccounts -subscription.paymentProviderId -subscription.renewalDate"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// LOGOUT
export const logoutUser = asyncHandler(async (req, res) => {
  // `req.user` is populated by your authentication middleware
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // Remove refreshToken from DB
      $set: { lastActive: Date.now() } // Update lastActive timestamp on logout
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out"));
});

// REFRESH ACCESS TOKEN
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token provided");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token: User not found");
    }

    // Check if the incoming refresh token matches the one stored in DB
    if (incomingRefreshToken !== user?.refreshToken) {
      // If the refresh token doesn't match, it might be a token reuse attempt.
      // Invalidate all tokens for this user for security.
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(401, "Refresh token is expired or used. Please log in again.");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    // Log the actual error for debugging, but send a generic message to the client
    console.error("Refresh token error:", error);
    throw new ApiError(401, error?.message || "Invalid or expired refresh token. Please log in again.");
  }
});

// GET CURRENT USER
export const getCurrentUser = asyncHandler(async (req, res) => {
  // Assuming you have middleware that sets req.user after verifying JWT
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  // Fetch the user again to ensure we get the latest data and perform a clean select
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken -resetToken -socialAccounts -subscription.paymentProviderId -subscription.renewalDate"
  );

  if (!user) {
    throw new ApiError(404, "User not found after authentication");
  }

  // Ensure wordCountHistory has an entry for today if not present
  const today = new Date().setHours(0, 0, 0, 0);
  const todayEntry = user.wordCountHistory.find(entry => new Date(entry.date).setHours(0,0,0,0) === today);
  if (!todayEntry) {
    user.wordCountHistory.push({ date: today, words: 0, goalAchieved: false });
    await user.save({ validateBeforeSave: false }); // Save the updated history
  }


  return res.status(200).json(
    new ApiResponse(
      200,
      user, // Send the cleaned user object
      "User details fetched successfully"
    )
  );
});

// --- NEW CONTROLLERS ---

// @desc    Update user profile details (fullName, bio, avatar, preferences)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, avatar, preferences } = req.body;

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Update fields if provided
  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;

  // Handle preferences update deeply
  if (preferences && typeof preferences === 'object') {
    Object.keys(preferences).forEach(key => {
      if (user.preferences[key] !== undefined) {
        user.preferences[key] = preferences[key];
      }
    });
  }

  await user.save({ validateBeforeSave: true }); // Validate to ensure preference enums are correct

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -resetToken -socialAccounts -subscription.paymentProviderId -subscription.renewalDate"
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "User profile updated successfully.")
  );
});

// @desc    Update user's daily word goal and word count for today
// @route   PUT /api/users/daily-goal
// @access  Private
export const updateDailyGoalAndWordCount = asyncHandler(async (req, res) => {
  const { dailyWordGoal, wordsToday } = req.body;

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Update dailyWordGoal if provided
  if (dailyWordGoal !== undefined && typeof dailyWordGoal === 'number' && dailyWordGoal >= 0) {
    user.dailyWordGoal = dailyWordGoal;
  }

  // Update or add today's word count history
  const today = new Date().setHours(0, 0, 0, 0);
  let todayEntry = user.wordCountHistory.find(entry => new Date(entry.date).setHours(0,0,0,0) === today);

  if (wordsToday !== undefined && typeof wordsToday === 'number' && wordsToday >= 0) {
    if (todayEntry) {
      todayEntry.words = wordsToday;
      todayEntry.goalAchieved = (wordsToday >= user.dailyWordGoal);
    } else {
      // If no entry for today, create one
      user.wordCountHistory.push({
        date: today,
        words: wordsToday,
        goalAchieved: (wordsToday >= user.dailyWordGoal)
      });
    }
  }

  // Mark for update if direct sub-document modification
  user.markModified('wordCountHistory');

  await user.save({ validateBeforeSave: true }); // Save the updated user document

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -resetToken -socialAccounts -subscription.paymentProviderId -subscription.renewalDate"
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Daily goal and word count updated successfully.")
  );
});


// @desc    Mark a specific notification as read
// @route   PUT /api/users/notifications/:notificationId/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const notification = user.notifications.id(notificationId); // Mongoose helper to find by subdocument _id

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  notification.read = true;
  user.markModified('notifications'); // Mark the array as modified for Mongoose to save

  await user.save({ validateBeforeSave: false }); // No need to validate other fields

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -resetToken -socialAccounts -subscription.paymentProviderId -subscription.renewalDate"
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Notification marked as read.")
  );
});

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized: User not logged in.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Iterate and mark all unread notifications
  user.notifications.forEach(notif => {
    if (!notif.read) {
      notif.read = true;
    }
  });

  user.markModified('notifications'); // Mark the array as modified

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken -resetToken -socialAccounts -subscription.paymentProviderId -subscription.renewalDate"
  );

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "All notifications marked as read.")
  );
});

// Note: Achievement update logic will typically live where actions that trigger them occur.
// E.g., when a user creates their first project, or saves a document.
// Example:
/*
export const unlockAchievement = asyncHandler(async (userId, achievementId) => {
  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found for achievement unlock:", userId);
    return;
  }

  const achievementExists = user.achievements.some(
    (ach) => ach.id === achievementId
  );

  // Define potential achievements with their details (can be moved to a config/constants file)
  const allAchievements = {
    "first_project": {
      name: "First Project Created",
      description: "You've taken the first step!",
      icon: "RocketLaunchIcon" // Corresponds to the Heroicon name
    },
    "10k_words": {
      name: "10,000 Words Milestone",
      description: "A significant writing milestone achieved.",
      icon: "ScaleIcon"
    },
    // ... more achievements
  };

  const achievementDetails = allAchievements[achievementId];

  if (!achievementDetails) {
    console.warn(`Attempted to unlock unknown achievement: ${achievementId}`);
    return;
  }

  if (!achievementExists) {
    user.achievements.push({
      id: achievementId,
      name: achievementDetails.name,
      description: achievementDetails.description,
      icon: achievementDetails.icon,
      unlockedAt: Date.now(),
    });
    user.markModified('achievements');
    await user.save({ validateBeforeSave: false });
    console.log(`Achievement unlocked for ${user.username}: ${achievementDetails.name}`);
  }
});
*/