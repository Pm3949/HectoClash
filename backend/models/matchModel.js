import mongoose from "mongoose";
const matchSchema = new mongoose.Schema(
  {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    status: {
      type: String,
      enum: ["pending", "started", "finished"],
      default: "pending",
    },
    problem: {
      type: String,
      required: true,
    },
    score1: {
      type: Number,
      default: 0,
    },
    score2: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    winningExpression: {
      type: String,
    },
    endTime: {
      type: Date,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

matchSchema.index({ endTime: 1 }, { expireAfterSeconds: 30 });

export const Match = mongoose.model("GameSession", matchSchema);
