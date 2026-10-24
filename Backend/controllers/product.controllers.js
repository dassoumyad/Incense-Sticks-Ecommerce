const ProductModel = require("../models/product");
const AdminModel = require("../models/admin");
const { validationResult } = require("express-validator");
const fs = require("fs");
const deleteAllFiles = require("../middleware/deletefile");

// delete old images by name (names saved in database)
const deleteImagesByName = (images) => {
  if (!images || images.length === 0) {
    return;
  }

  images.forEach((image) => {
    const imagePath = `statics/product_images/${image}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });
};


// Create Product
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      deleteAllFiles(req.files);
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    // check admin is valid
    const exist_admin = await AdminModel.findOne({ _id: req.token.id });
    if (!exist_admin) {
      deleteAllFiles(req.files);
      return res.status(400).json({ message: "Invalid Authentication", success: false });
    }

    // check image
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required", success: false });
    }

    const {
      title,
      brandName,
      category,
      fragranceType,
      MRP,
      discount,
      stock,
      description,
      burningTime,
      weight,
      material,
    } = req.body;

    // calculate actual price
    const mrp = Number(MRP);
    const discountValue = Number(discount) || 0;
    const actualPrice = mrp - (mrp * discountValue) / 100;

    // get image names
    const images = req.files.map((file) => file.filename);

    const product = new ProductModel({
      title,
      brandName,
      category,
      fragranceType,
      MRP: mrp,
      discount: discountValue,
      actualPrice,
      stock,
      description,
      burningTime,
      weight,
      material,
      images,
    });

    await product.save();

    return res.status(201).json({ message: "Product created successfully", success: true, product });
  } catch (error) {
    deleteAllFiles(req.files);
    return res.status(500).json({ message: error.message, success: false });
  }
};


// Get all products (with search and skip)
const getAllProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const search = req.body.search || "";
    const skip = Number(req.body.skip) || 0;

    // no search text: send all products
    if (search === "") {
      const data = await ProductModel.find().sort({ _id: -1 }).skip(skip).limit(50);
      return res.status(200).json({ message: "Products fetched successfully", success: true, data });
    }

    // search text given: find matching products
    const data = await ProductModel.find({ $text: { $search: `"${search}"` } })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(50);

    return res.status(200).json({ message: "Products fetched successfully", success: true, data });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};


// Update product
// Update product (only the fields you send are changed)
const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      deleteAllFiles(req.files);
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    // check admin is valid
    const exist_admin = await AdminModel.findOne({ _id: req.token.id });
    if (!exist_admin) {
      deleteAllFiles(req.files);
      return res.status(400).json({ message: "Invalid Authentication", success: false });
    }

    const { _id } = req.body;

    const product = await ProductModel.findById(_id);
    if (!product) {
      deleteAllFiles(req.files);
      return res.status(404).json({ message: "Product not found", success: false });
    }

    // fields that can be updated
    const fields = [
      "title",
      "brandName",
      "category",
      "fragranceType",
      "MRP",
      "discount",
      "stock",
      "description",
      "burningTime",
      "weight",
      "material",
    ];

    // change only the fields that were sent
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // calculate the price again only if MRP or discount was sent
    if (req.body.MRP !== undefined || req.body.discount !== undefined) {
      const mrp = Number(product.MRP);
      const discountValue = Number(product.discount) || 0;
      product.actualPrice = mrp - (mrp * discountValue) / 100;
    }

    // remember old images, delete them after save
    const oldImages = product.images;
    let imagesChanged = false;

    // replace images only if new images are uploaded
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => file.filename);
      imagesChanged = true;
    }

    await product.save();

    if (imagesChanged) {
      deleteImagesByName(oldImages);
    }

    return res.status(200).json({ message: "Product updated successfully", success: true, product });
  } catch (error) {
    deleteAllFiles(req.files);
    return res.status(500).json({ message: error.message, success: false });
  }
};


// Delete product
const deleteProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    // check admin is valid
    const exist_admin = await AdminModel.findOne({ _id: req.token.id });
    if (!exist_admin) {
      return res.status(400).json({ message: "Invalid Authentication", success: false });
    }

    const { _id } = req.body;

    const product = await ProductModel.findById(_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    // delete product from database, then its images
    await ProductModel.deleteOne({ _id });
    deleteImagesByName(product.images);

    return res.status(200).json({ message: "Product deleted successfully", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};