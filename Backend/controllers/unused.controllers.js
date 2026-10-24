const AdminModel=require("../models/admin");
const UnusedModel=require("../models/unusedcode");
const {validationResult}=require("express-validator");

const create_new_coupon_code=async(req,res)=>{
    try{
        const error=validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({message:error.array()[0].msg,success:false});
        }
        const {discount,maxDiscount}=req.body;
        const name=req.body.name.toUpperCase(); // fixed: same format as the model
        const exist_admin=await AdminModel.findOne({_id:req.token.id}); // fixed: id
        if(!exist_admin){
            return res.status(400).json({message:"Invalid Authentication",success:false});
        }
        const exist_coupon=await UnusedModel.findOne({name:name});
        if(exist_coupon){
            return res.status(400).json({message:"Coupon code already exists",success:false});
        }
        const new_coupon=new UnusedModel({
            name:name,
            discount:discount,
            maxDiscount:maxDiscount
        });
        await new_coupon.save();
        return res.status(200).json({message:"Coupon code created successfully",success:true});
    }catch(err){
        console.log(err); // fixed: shows the real error in the terminal
        res.status(500).json({message:"Internal Server Error",success:false});
    }
    }

    const delete_exist_coupon_code=async(req,res)=>{
        try{
            const error=validationResult(req);
            if(!error.isEmpty()){
                return res.status(400).json({message:error.array()[0].msg,success:false});
            }
            const {_id}=req.body;
            const exist_admin=await AdminModel.findOne({_id:req.token.id}); // fixed: id
            if(!exist_admin){
                return res.status(400).json({message:"Invalid Authentication",success:false});
            }
            const exist_coupon=await UnusedModel.findOne({_id:_id});
            if(!exist_coupon){
                return res.status(404).json({message:"Coupon code not found",success:false}); // fixed: 404
            }
            await UnusedModel.deleteOne({_id:_id});
            return res.status(200).json({message:"Coupon code deleted successfully",success:true});
        }catch(err){
            console.log(err); // fixed
            res.status(500).json({message:"Internal Server Error",success:false});
        }
        }

module.exports={create_new_coupon_code,delete_exist_coupon_code};