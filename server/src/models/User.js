const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: "" },
    interests: { type: [String], default: [] },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    tier: { type: Number, enum: [1, 2, 3], default: 1 },
    nextDestination: {
      city: { type: String, default: null },
      date: { type: Date, default: null },
    },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    ratingTagCounts: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    name: this.name,
    avatarUrl: this.avatarUrl,
    bio: this.bio,
    interests: this.interests,
    city: this.city,
    country: this.country,
    tier: this.tier,
    nextDestination: this.nextDestination,
    ratingAvg: this.ratingAvg,
    ratingCount: this.ratingCount,
    ratingTagCounts: Object.fromEntries(this.ratingTagCounts || []),
    memberSince: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
