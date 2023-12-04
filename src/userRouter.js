const express = require('express');
const users = require('../db/models/userModel')
const products = require('../db/models/productModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middelware/auth')
const userRouter = express.Router();

const generateToken = async (userid) => {
    try {
        const token = await jwt.sign(userid.toString(),process.env.JWT_SECRET)
        return token;
    } catch (err) {
        console.log(err)
    }

}

userRouter.get("/getUser", (req, res) => {
    res.send("hello from user router")
})

userRouter.post("/registeruser", async (req, res) => {
    try {
        const udata = {
            user_name: req.body.user_name,
            user_email: req.body.user_email,
            user_pass: req.body.user_pass,
            user_cpass: req.body.user_cpass,
            user_order: [],
            tokens: [],
            user_cart: []
        }
        if (udata.user_pass != udata.user_cpass) {
            res.status(403).json(
                {
                    "errorcode": "pacpns",
                    "errormsg": "Password and confirm password are not same! Please enter same value in both field."
                })
        }
        else {
            //console.log(udata)
            const finaldata = new users(udata);
            const token = await generateToken(finaldata._id);
            finaldata.tokens.push({ token: token })
            await finaldata.save();
            res.json({
                user_name: finaldata.user_name,
                user_email: finaldata.user_email,
                token: token
            })
        }
    } catch (err) {
        if (err.code == 11000) {
            console.log(err)
            res.status(403).json({
                "errorcode": "eae",
                "errormsg": "Email id is already registerd with us! Please use different email id or login with same id."
            })

        }
        else {
            console.log(err)
            res.status(403).json(err)
        }

    }
})

userRouter.post("/loginuser", async (req, res) => {
    try {
        const udata = await users.findOne({ user_email: req.body.user_email });
        //console.log(udata)
        if (!udata) {
            res.status(404).json({
                "errorcode": "ene",
                "errormsg": "Email not registerd with us! Please register first."
            })
        }
        else {
            const comparepass = await bcrypt.compare(req.body.user_pass, udata.user_pass)
            if (!comparepass) {
                res.status(404).json({
                    "errorcode": "pnc",
                    "errormsg": "Password is incorrect! Please enter correct password."
                })
            }
            else {
                const token = await generateToken(udata._id);
                udata.tokens.push({ token: token })
                await udata.save();
                res.json({
                    user_name: udata.user_name,
                    user_email: udata.user_email,
                    token: token
                })

            }
        }
    } catch (err) {
        console.log(err);
        res.status(403).json(err)
    }
})

userRouter.post("/placeorder", auth, async (req, res) => {
    try {
        const udata = await users.findOne({ user_email: req.body.user_email })
        if (!udata) {
            res.status(404).json({
                "errorcode": "ene",
                "errormsg": "Email not registerd with us! Please register first."
            })
        }
        else {
            req.body.products.forEach(product => {
                udata.user_order.push({
                    product_id: product.product_id,
                    product_qty: product.product_qty,
                    order_price: product.order_price
                })
            });
            udata.user_cart = []

            await udata.save();
            res.json("order data saved sucessfully")
        }
    } catch (err) {
        console.log(err)
        res.status(400).json(err);
    }
})


userRouter.post("/getorderhistory", auth, async (req, res) => {
    try {
        const udata = await users.findOne({ user_email: req.body.user_email })
        if (!udata) {
            res.status(404).json({
                "errorcode": "ene",
                "errormsg": "Email not registerd with us! Please register first."
            })
        }
        else {
            var orderdata = new Array();
            await Promise.all(
                udata.user_order.map(async (product) => {
                    try {
                        const productdata = {};
                        productdata.order_date = product.order_date;
                        productdata.product_detail = await products.findOne({ product_id: product.product_id });
                        productdata.product_qty = product.product_qty;
                        productdata.order_price = product.order_price;
                        // console.log(productdata)
                        orderdata.push(productdata);
                        //console.log(orderdata)

                    } catch (err) {
                        console.log(err)
                        res.status(400).json(err);
                    }
                })
            )
            //console.log(orderdata)
            res.json(orderdata)
        }
    } catch (err) {
        console.log(err)
        res.status(400).json(err);
    }
})

userRouter.post("/addtocart", auth, async (req, res) => {
    try {
        const udata = await users.findOne({ user_email: req.body.user_email });
        if (!udata) {
            res.status(404).json({
                "errorcode": "ene",
                "errormsg": "Email not registerd with us! Please register first."
            })
        }
        else {
            const pid = req.body.product_id;
            var isAlreadyAvailable = 0;
           // console.log("--------before loop", udata.user_cart);
               udata.user_cart =  udata.user_cart.map((product) => {
                    if (product.product_id == pid) {
                        product.product_qty = req.body.product_qty;
                        isAlreadyAvailable = 1;
                    }
                    return product;
                })
            // for (i = 0; i < udata.user_cart.length; i++) {
            //     if (udata.user_cart[i].product_id == pid) {
            //         udata.user_cart[i].product_qty = req.body.product_qty;
            //         isAlreadyAvailable = 1
            //     }
            // }

          //  console.log("--------after loop", udata.user_cart);
            if (isAlreadyAvailable == 0) {
                const cartProduct = {
                    product_id: req.body.product_id,
                    product_qty: req.body.product_qty
                };
                udata.user_cart.push(cartProduct);
            //    console.log("------inside if", udata.user_cart);
            }

            await udata.save();
            if(isAlreadyAvailable == 1){
                res.json("Product is already available in cart. Qty is updated for this product")
            }else{
                res.json("Product is added in your cart.")
            }

        }
    } catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
})

userRouter.post("/getcartproducts", auth, async (req, res) => {
    try {
        const udata = await users.findOne({ user_email: req.body.user_email });
        if (!udata) {
            res.status(404).json({
                "errorcode": "ene",
                "errormsg": "Email not registerd with us! Please register first."
            })
        }
        else {
            const cartProducts = [];
            await Promise.all(udata.user_cart.map(async (product) => {
                const productdata = {};
                productdata.product_detail = await products.findOne({ product_id: product.product_id });
                productdata.product_qty = product.product_qty;
                cartProducts.push(productdata)
            }))
            res.json(cartProducts);

        }
    } catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
})


userRouter.post("/getuserdetail", async (req,res)=>{
    try{
         const token = req.body.token;
         const id = await jwt.verify(token,process.env.JWT_SECRET);
         const udata = await users.findOne({_id : id});
         const finalData = {
            user_name : udata.user_name,
            user_email : udata.user_email
         }
         res.send(finalData);
    }catch(err){
        console.log(err)
        res.status(400).json(err)
    }
})

userRouter.delete("/removecartproduct", auth, async(req,res) =>{
    try{
        const udata = await users.findOne({ user_email: req.body.user_email });
        if (!udata) {
            res.status(404).json({
                "errorcode": "ene",
                "errormsg": "Email not registerd with us! Please register first."
            })
        }
        else {
           udata.user_cart =  udata.user_cart.filter((product)=>{
                if(product.product_id != req.body.product_id){
                    return product;
                }
            })
            await udata.save();
            res.send("product remove from cart")
        }
    }catch (err) {
        console.log(err)
        res.status(400).json(err)
    }
})

module.exports = userRouter;