const express = require("express");
const {
  createAnswer,
  getAnswersByQuestion,
  getMyAnswers,
  deleteAnswer,
  toggleLikeAnswer,
} = require("../controllers/answerController");

const auth = require("../middleware/authMiddleware");

const router = express.Router();


// ==============================
// POST ANSWER (Protected)
// ==============================
router.post("/:questionId", auth, createAnswer);


// ==============================
// GET ANSWERS FOR A QUESTION (Public)
// ==============================
router.get("/question/:questionId", getAnswersByQuestion);


// ==============================
// GET MY ANSWERS (Protected)
// ==============================
router.get("/my", auth, getMyAnswers);


// ==============================
// TOGGLE LIKE ON ANSWER (Protected)
// ==============================
router.put("/:id/like", auth, toggleLikeAnswer);


// ==============================
// DELETE ANSWER (Owner Only)
// ==============================
router.delete("/:id", auth, deleteAnswer);


module.exports = router;