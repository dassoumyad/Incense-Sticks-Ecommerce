const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controllers");

router.post(
  "/create-category",
  verifyAdminToken,
  [body("categoryName").notEmpty().withMessage("Category name is required")],
  createCategory
);

router.get("/get-all-categories", getAllCategories);

router.put(
  "/update-category",
  verifyAdminToken,
  [
    body("_id").isMongoId().withMessage("Valid category id is required"),
    body("categoryName").notEmpty().withMessage("Category name is required"),
  ],
  updateCategory
);

router.delete(
  "/delete-category",
  verifyAdminToken,
  [body("_id").isMongoId().withMessage("Valid category id is required")],
  deleteCategory
);

module.exports = router;
