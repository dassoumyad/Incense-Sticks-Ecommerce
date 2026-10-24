const CategoryModel = require("../models/category");
const { validationResult } = require("express-validator");

// create category
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { categoryName } = req.body;

    const categoryExists = await CategoryModel.findOne({ categoryName });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const newCategory = new CategoryModel({
      categoryName: categoryName,
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: categories.length,
      categories: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// update category
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { _id, categoryName } = req.body;

    const category = await CategoryModel.findById(_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // check another category is not using the same name
    const nameExists = await CategoryModel.findOne({
      categoryName: categoryName,
      _id: { $ne: _id },
    });
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    category.categoryName = categoryName;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// delete category
const deleteCategory = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { _id } = req.body;

    const category = await CategoryModel.findById(_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await CategoryModel.deleteOne({ _id: _id });

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};