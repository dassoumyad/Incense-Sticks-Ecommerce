const express=require("express");
const router=express.Router();
const {body}=require("express-validator");
const verifyAdminToken=require("../middleware/verifyAdminToken");
const {create_new_coupon_code,delete_exist_coupon_code}=require("../controllers/unused.controllers");


router.post("/create-new-coupon-code",verifyAdminToken,[body("name").isString().isLength({min:3,max:25}).withMessage("Coupon name must be between 3 to 25 characters"),
body("discount").isFloat({min:1,max:100}).withMessage("Discount must be between 1 and 100 percent"), // fixed
body("maxDiscount").isFloat({min:1}).withMessage("Max discount must be at least 1") // fixed
],create_new_coupon_code);

router.post("/delete-exist-coupon-code",verifyAdminToken,[body("_id").isMongoId().withMessage("Valid coupon code id is required")],delete_exist_coupon_code);

module.exports=router;
