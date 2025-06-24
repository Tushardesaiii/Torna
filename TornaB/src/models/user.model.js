import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// User Schema for Torna Writing SaaS
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" }, // Explicit enum for themes
      editorFont: { type: String, default: "Inter" }, // Changed from 'font' for clarity
      keyboardShortcuts: { type: Boolean, default: true }, // Added for UI (mocked in frontend)
      notificationEmails: { type: Boolean, default: true }, // Changed from 'notifications' for clarity
      weeklyReports: { type: Boolean, default: false }, // Added for UI (mocked in frontend)
    },
    subscription: {
      type: { type: String, enum: ["free", "pro", "premium"], default: "free" }, // Added 'premium' as an option
      renewalDate: { type: Date },
      paymentProviderId: { type: String },
      // New: Add a way to store actual feature limits based on plan
      projectLimit: { type: Number, default: 1 }, // Default for 'free'
      documentLimit: { type: Number, default: 5 }, // Default for 'free'
      storageGB: { type: Number, default: 0.1 }, // Example: 100MB for free tier
      features: [{ type: String }], // Array of strings, e.g., ["advanced_editor", "version_history", "ai_assistant"]
    },
    writingStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }, // Set default to current time for new users
    lastLogin: { type: Date }, // Keep lastLogin for specific login event tracking
    totalWordsWritten: { type: Number, default: 0 },

    // New: Daily Word Goal and History
    dailyWordGoal: { type: Number, default: 500 }, // Default daily goal
    wordCountHistory: [
      {
        date: { type: Date, required: true },
        words: { type: Number, required: true, default: 0 },
        goalAchieved: { type: Boolean, required: true, default: false },
      },
    ],

    // New: Notifications (more detailed structure)
    notifications: [
      {
        _id: false, // Don't generate _id for subdocuments in array
        id: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
        }, // Manual ID for stable client-side keys
        type: {
          type: String,
          enum: [
            "system",
            "collaboration",
            "achievement",
            "billing",
            "promotion",
          ],
          required: true,
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],

    // New: Achievements (more detailed structure)
    achievements: [
      {
        _id: false, // Don't generate _id for subdocuments in array
        // REMOVED unique: true from here.
        // The 'id' field is unique per achievement within THIS user's array,
        // but not globally unique across all users.
        id: { type: String, required: true }, // e.g., "first_project", "10k_words"
        name: { type: String, required: true },
        description: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        icon: { type: String }, // Storing Heroicon name or path (e.g., 'RocketLaunchIcon')
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
    },
    socialAccounts: {
      google: { type: String },
      github: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password check
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
      subscription: this.subscription.type,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);