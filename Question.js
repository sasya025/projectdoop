const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // PREMIUM SYSTEM
    isPremium: {
      type: Boolean,
      default: false,
    },
    unlockPrice: {
      type: Number,
      default: 15,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Advanced"],
      default: "Easy",
    },
    examTag: {
      type: String,
    },
    hint: {
      type: String,
    },
    fullSolution: {
      type: String,
    },
    examTrick: {
      type: String,
    },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1 });

module.exports = mongoose.model("Question", questionSchema);