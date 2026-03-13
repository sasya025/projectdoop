const express = require("express");
const auth = require("../middleware/authMiddleware");

const {
  createQuestionComment,
  createAnswerComment,
  getQuestionComments,
  getAnswerComments,
  deleteComment,
  toggleLikeComment,
  pinComment,
} = require("../controllers/commentController");

const router = express.Router();

// Create
router.post("/question/:questionId", auth, createQuestionComment);
router.post("/answer/:answerId", auth, createAnswerComment);

// Get
router.get("/question/:questionId", getQuestionComments);
router.get("/answer/:answerId", getAnswerComments);

// Delete
router.delete("/:id", auth, deleteComment);

// Like
router.put("/like/:id", auth, toggleLikeComment);

// Pin
router.put("/pin/:id", auth, pinComment);

module.exports = router;