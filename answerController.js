const Answer = require("../models/Answer");
const Question = require("../models/Question");
const User = require("../models/User");


// ==============================
// CREATE ANSWER
// ==============================
exports.createAnswer = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Answer content is required",
      });
    }

    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const alreadyAnswered = await Answer.findOne({
      question: req.params.questionId,
      user: req.user.id,
    });

    if (alreadyAnswered) {
      return res.status(400).json({
        message: "You have already answered this question",
      });
    }

    const normalizedContent = content.trim().toLowerCase();

    const existingAnswer = await Answer.findOne({
      question: req.params.questionId,
      content: normalizedContent,
    });

    let isDuplicate = false;

    if (existingAnswer) {
      isDuplicate = true;

      await User.findByIdAndUpdate(req.user.id, {
        $inc: { coins: -5 },
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { coins: 10 },
      });
    }

    const answer = await Answer.create({
      content: normalizedContent,
      question: req.params.questionId,
      user: req.user.id,
      isDuplicate,
    });

    res.status(201).json(answer);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


// ==============================
// TOGGLE LIKE ANSWER
// ==============================
exports.toggleLikeAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    // 🚫 Prevent self-like
    if (answer.user.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot like your own answer",
      });
    }

    const alreadyLiked = answer.likedBy.includes(req.user.id);

    if (alreadyLiked) {
      // UNLIKE
      answer.likedBy = answer.likedBy.filter(
        (userId) => userId.toString() !== req.user.id
      );

      answer.likesCount -= 1;

      await User.findByIdAndUpdate(answer.user, {
        $inc: { coins: -2 },
      });

      await answer.save();

      return res.json({
        message: "Like removed",
        likesCount: answer.likesCount,
      });

    } else {
      // LIKE
      answer.likedBy.push(req.user.id);
      answer.likesCount += 1;

      await User.findByIdAndUpdate(answer.user, {
        $inc: { coins: 2 },
      });

      await answer.save();

      return res.json({
        message: "Answer liked",
        likesCount: answer.likesCount,
      });
    }

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


// ==============================
// GET ANSWERS BY QUESTION (With Pagination)
// ==============================
exports.getAnswersByQuestion = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const filter = {
      question: req.params.questionId,
    };

    const totalAnswers = await Answer.countDocuments(filter);

    const answers = await Answer.find(filter)
      .populate("user", "name email coins")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      totalAnswers,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalAnswers / pageSize),
      answers,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// GET MY ANSWERS
// ==============================
exports.getMyAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({
      user: req.user.id,
    })
      .populate("question", "title")
      .sort({ createdAt: -1 });

    res.json(answers);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


// ==============================
// DELETE ANSWER
// ==============================
exports.deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        message: "Answer not found",
      });
    }

    if (answer.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this answer",
      });
    }

    await answer.deleteOne();

    res.json({
      message: "Answer deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};