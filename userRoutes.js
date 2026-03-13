const express = require("express");
const {
  registerUser,
  loginUser,
  getLeaderboard,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Leaderboard (Public)
router.get("/leaderboard", getLeaderboard);

module.exports = router;