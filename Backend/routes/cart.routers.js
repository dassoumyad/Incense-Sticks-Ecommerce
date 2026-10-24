const express=require("express");
const router=express.Router();
const {body}=require("express-validator");
const verifyToken=require("../middleware/verifyToken");
const {addToCart, syncCart, remove_from_cart}=require("../controllers/cart.controllers");

router.post("/add-to-cart",verifyToken,[body("productId").isMongoId().withMessage("Valid product id is required"),body("quantity").optional().isInt({min:1}).withMessage("Quantity must be a positive whole number")],addToCart);
router.post("/sync-cart",verifyToken,[body("items").isArray().withMessage("Cart items must be an array")],syncCart);


router.post("/remove-from-cart",verifyToken,[body("productId").isMongoId().withMessage("Valid product id is required")],remove_from_cart);

module.exports=router
