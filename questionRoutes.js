const express = require("express");
const {
  createQuestion,
  getQuestions,
  getMyQuestions,
  getQuestionById,
  deleteQuestion,
} = require("../controllers/questionController");

const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Create Question (Protected)
router.post("/", auth, createQuestion);

// Get My Questions (Profile - Protected)
router.get("/my", auth, getMyQuestions);

// Get All Questions (Protected)
router.get("/", auth,getQuestions);

// Get Single Question (Protected)
router.get("/:id", auth, getQuestionById);

// Delete Question (Only Owner Can Delete)
router.delete("/:id", auth, deleteQuestion);

module.exports = router;