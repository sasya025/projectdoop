const express = require("express");
const auth = require("../middleware/authMiddleware");
const { unlockQuestion } = require("../controllers/unlockController");

const router = express.Router();

router.put("/:questionId", auth, unlockQuestion);

module.exports = router;