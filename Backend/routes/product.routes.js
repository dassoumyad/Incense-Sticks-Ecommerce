const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const verifyAdminToken = require("../middleware/verifyAdminToken");
const upload = require("../middleware/uploadproductfiles");

const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controllers");


// Create validation (all fields are required)
const productValidation = [
  body("title").notEmpty().withMessage("Title is required"),

  body("brandName").notEmpty().withMessage("Brand name is required"),

  body("category").notEmpty().withMessage("Category is required"),

  body("fragranceType").notEmpty().withMessage("Fragrance type is required"),

  body("MRP").isNumeric().withMessage("MRP must be a number"),

  body("discount").optional().isNumeric().withMessage("Discount must be a number"),

  body("stock").isNumeric().withMessage("Stock must be a number"),

  body("description").notEmpty().withMessage("Description is required"),

  body("burningTime").notEmpty().withMessage("Burning time is required"),

  body("weight").isNumeric().withMessage("Weight must be a number"),

  body("material").notEmpty().withMessage("Material is required"),
];


// Update validation (only _id is required, other fields are optional)
const updateValidation = [
  body("_id").isMongoId().withMessage("Valid product id is required"),

  body("title").optional().notEmpty().withMessage("Title cannot be empty"),

  body("brandName").optional().notEmpty().withMessage("Brand name cannot be empty"),

  body("category").optional().notEmpty().withMessage("Category cannot be empty"),

  body("fragranceType").optional().notEmpty().withMessage("Fragrance type cannot be empty"),

  body("MRP").optional().isNumeric().withMessage("MRP must be a number"),

  body("discount").optional().isNumeric().withMessage("Discount must be a number"),

  body("stock").optional().isNumeric().withMessage("Stock must be a number"),

  body("description").optional().notEmpty().withMessage("Description cannot be empty"),

  body("burningTime").optional().notEmpty().withMessage("Burning time cannot be empty"),

  body("weight").optional().isNumeric().withMessage("Weight must be a number"),

  body("material").optional().notEmpty().withMessage("Material cannot be empty"),
];


// Create product
router.post(
  "/create-product",
  verifyAdminToken,
  upload.array("images", 5),
  productValidation,
  createProduct
);


// Fetch products (search + skip)
router.post(
  "/fetch-products",
  [
    body("search")
      .optional()
      .isString()
      .withMessage("Invalid search query")
      .isLength({ max: 50 })
      .withMessage("Search query must not be longer than 50 characters"),

    body("skip")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Invalid skip value"),
  ],
  getAllProducts
);


// Update product
router.put(
  "/update-product",
  verifyAdminToken,
  upload.array("images", 5),
  updateValidation,
  updateProduct
);


// Delete product
router.delete(
  "/delete-specific-product",
  verifyAdminToken,
  [body("_id").isMongoId().withMessage("Valid product id is required")],
  deleteProduct
);


module.exports = router;
