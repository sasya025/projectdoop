const express = require("express");
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");

const router = express.Router();

// Create Category
router.post("/", createCategory);

// Get All Categories
router.get("/", getCategories);

module.exports = router;