import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true, // ✅ Optimized for quick searches
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true, // ✅ Optimized for quick searches
    },
    password: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 1000,
    },
    highestRating: {
      type: Number,
      default: 1000,
    },

    currentStreak: {
      type: Number,
      default: 0,
    },
    lastgameDate: {
      type: Date,
      default: null,
    },
    lastGameDay: {
      type: String,
      default: "",
    },
    stats: {
      gamesPlayed: {
        type: Number,
        default: 0,
      },
      wins: {
        type: Number,
        default: 0,
      },
      losses: {
        type: Number,
        default: 0,
      },
    },
    // matchHistory: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Match",
    //     },
    // ]
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
