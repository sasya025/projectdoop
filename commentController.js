const Comment = require("../models/Comment");
const Question = require("../models/Question");
const Answer = require("../models/Answer");


// ==============================
// CREATE COMMENT (Question)
// ==============================
exports.createQuestionComment = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content?.trim() || !type) {
      return res.status(400).json({ message: "Content and type required" });
    }

    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const comment = await Comment.create({
      content,
      type,
      user: req.user.id,
      question: req.params.questionId,
    });

    res.status(201).json(comment);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// CREATE COMMENT (Answer)
// ==============================
exports.createAnswerComment = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content?.trim() || !type) {
      return res.status(400).json({ message: "Content and type required" });
    }

    const answer = await Answer.findById(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const comment = await Comment.create({
      content,
      type,
      user: req.user.id,
      answer: req.params.answerId,
    });

    res.status(201).json(comment);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// GET COMMENTS (Question)
// ==============================
exports.getQuestionComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      question: req.params.questionId,
    })
      .populate("user", "name")
      .sort({ isPinned: -1, likesCount: -1, createdAt: -1 });

    res.json(comments);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// GET COMMENTS (Answer)
// ==============================
exports.getAnswerComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      answer: req.params.answerId,
    })
      .populate("user", "name")
      .sort({ likesCount: -1, createdAt: -1 });

    res.json(comments);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// DELETE COMMENT (Owner Only)
// ==============================
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });

  } catch (error) {
  console.log("CREATE QUESTION COMMENT ERROR:");
  console.log(error);
  res.status(500).json({ message: error.message });
}
};


// ==============================
// LIKE TOGGLE
// ==============================
exports.toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likedBy.includes(req.user.id);

    if (alreadyLiked) {
      comment.likedBy.pull(req.user.id);
      comment.likesCount -= 1;
    } else {
      comment.likedBy.push(req.user.id);
      comment.likesCount += 1;
    }

    await comment.save();

    res.json({ likesCount: comment.likesCount });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// PIN COMMENT (Question Owner)
// ==============================
exports.pinComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || !comment.question) {
      return res.status(404).json({ message: "Invalid comment" });
    }

    const question = await Question.findById(comment.question);

    if (question.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only question owner can pin" });
    }

    // Unpin existing pinned comment
    await Comment.updateMany(
      { question: comment.question },
      { isPinned: false }
    );

    comment.isPinned = true;
    await comment.save();

    res.json({ message: "Comment pinned successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};