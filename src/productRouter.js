const express = require('express');
const products = require('../db/models/productModel');
const auth = require('../middelware/auth')

const productRouter = express.Router();

productRouter.post("/addproduct",auth,async (req,res)=>{

    try{
        const productdata = new products({
            product_title : req.body.product_title,
            product_desc : req.body.product_desc,
            product_img :req.body.product_img,
            product_price :req.body.product_price,
            product_id: req.body.product_id
        })
        await productdata.save();
        res.json("product added...")
    }catch(err){
        console.log(err);
         res.json(err);
    }
    

})

productRouter.get("/getallProducts", async (req,res)=>{
    try{
          const allProducts =  await products.find();
          res.send(allProducts);
    }catch(err){
        console.log(err);
        res.status(404).send(err)
    }
    
})

module.exports = productRouter;