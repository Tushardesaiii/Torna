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

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: { type: String },
    isVerified: { type: Boolean, default: false },
    resetToken: { type: String },

    socialAccounts: {
      google: { type: String },
      github: { type: String },
    },

    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      editorFont: { type: String, default: "Inter" },
      keyboardShortcuts: { type: Boolean, default: true },
      notificationEmails: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: false },
    },

    subscription: {
      type: { type: String, enum: ["free", "pro", "premium"], default: "free" },
      renewalDate: { type: Date },
      paymentProviderId: { type: String },
      projectLimit: { type: Number, default: 1 },
      documentLimit: { type: Number, default: 5 },
      storageGB: { type: Number, default: 0.1 },
      features: [{ type: String }],
    },

    dailyWordGoal: { type: Number, default: 500 },
    totalWordsWritten: { type: Number, default: 0 },
    writingStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    lastLogin: { type: Date },

    wordCountHistory: [
      {
        date: { type: Date, required: true },
        words: { type: Number, required: true, default: 0 },
        goalAchieved: { type: Boolean, required: true, default: false },
      },
    ],

    notifications: [
      {
        _id: false,
        id: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
        },
        type: {
          type: String,
          enum: ["system", "collaboration", "achievement", "billing", "promotion"],
          required: true,
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],

    achievements: [
      {
        _id: false,
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        unlockedAt: { type: Date, default: Date.now },
        icon: { type: String },
      },
    ],

    // === Relations (for dashboard hydration) ===
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  },
  {
    timestamps: true,
  }
);

// ====== Middleware & Methods ======

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT Access Token
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

// Generate JWT Refresh Token
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
