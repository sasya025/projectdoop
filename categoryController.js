const Category = require("../models/Category");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existing = await Category.findOne({
      name: name.trim(),
    });

    if (existing) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
    });

    res.status(201).json(category);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};