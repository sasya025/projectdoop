const Question = require("../models/Question");
const Category = require("../models/Category");
const User = require("../models/User");
const Unlock = require("../models/Unlock");


// CREATE QUESTION
exports.createQuestion = async (req, res) => {
  try {
    const {
      title,
      description,
      keywords,
      categoryId,
      isPremium,
      difficulty,
      examTag,
      hint,
      fullSolution,
      examTrick,
    } = req.body;

    if (!title || !description || !keywords || !categoryId) {
      return res.status(400).json({
        message: "All basic fields including category are required",
      });
    }

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    const user = await User.findById(req.user.id);

    // Bronze check (50 coins required)
    if (isPremium) {
      if (user.coins < 50) {
        return res.status(403).json({
          message: "Bronze level (50 coins) required to post premium question",
        });
      }

      if (
        difficulty !== "Advanced" ||
        !hint ||
        !fullSolution ||
        !examTrick
      ) {
        return res.status(400).json({
          message:
            "Premium must be Advanced and include hint, fullSolution and examTrick",
        });
      }
    }

    const question = await Question.create({
      title,
      description,
      keywords,
      category: categoryId,
      user: req.user.id,
      isPremium,
      difficulty,
      examTag,
      hint,
      fullSolution,
      examTrick,
    });

    res.status(201).json(question);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL QUESTIONS (With Pagination)
exports.getQuestions = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    let filter = {};
    if (category) {
      filter.category = category;
    }

    const totalQuestions = await Question.countDocuments(filter);

    const questions = await Question.find(filter)
      .populate("user", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      totalQuestions,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalQuestions / pageSize),
      questions,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET MY QUESTIONS
exports.getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({
      user: req.user.id,
    })
      .populate("user", "name email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(questions);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SINGLE QUESTION (Premium Protected)
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("user", "name email")
      .populate("category", "name");

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    // If premium question
    if (question.isPremium) {

      // 🔥 Creator gets automatic full access
      if (question.user._id.toString() === req.user.id) {
        return res.json({
          ...question.toObject(),
          isLocked: false,
        });
      }

      // Check unlock record for other users
      const unlock = await Unlock.findOne({
        user: req.user.id,
        question: question._id,
      });

      if (!unlock) {
        return res.json({
          _id: question._id,
          title: question.title,
          description: question.description,
          difficulty: question.difficulty,
          examTag: question.examTag,
          hint: question.hint,
          unlockPrice: question.unlockPrice,
          isLocked: true,
        });
      }
    }

    // Normal question OR unlocked premium
    res.json({
      ...question.toObject(),
      isLocked: false,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE QUESTION
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (question.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this question",
      });
    }

    await question.deleteOne();

    res.json({
      message: "Question deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};