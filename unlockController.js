const Unlock = require("../models/Unlock");
const Question = require("../models/Question");
const User = require("../models/User");

exports.unlockQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question || !question.isPremium) {
      return res.status(400).json({
        message: "Not a premium question",
      });
    }

    const user = await User.findById(req.user.id);

    if (user.coins < question.unlockPrice) {
      return res.status(400).json({
        message: "Not enough coins",
      });
    }

    const alreadyUnlocked = await Unlock.findOne({
      user: user._id,
      question: question._id,
    });

    if (alreadyUnlocked) {
      return res.status(400).json({
        message: "Already unlocked",
      });
    }

    user.coins -= question.unlockPrice;
    await user.save();

    await Unlock.create({
      user: user._id,
      question: question._id,
    });

    res.json({
      message: "Question unlocked successfully",
      remainingCoins: user.coins,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};