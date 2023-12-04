const jwt = require('jsonwebtoken');
const users = require('../db/models/userModel')


const auth =async (req,res,next) => {
   try{
     const token = req.body.token;
     //console.log("token --------",token)
     const id = await jwt.verify(token,process.env.JWT_SECRET);
     //console.log("id --------",id)
     const udataauth = await users.findOne({_id : id});
     //console.log("udata ---------------------")
     //console.log(udataauth)
     res.udataauth = udataauth;
     res.tokenauth = token;
     next()
     

   }catch(err){
    if(err.name == "JsonWebTokenError"){
       res.status(401).json({"authfailed" : "need to login again"})
    }
    else{
        console.log(err)
        res.status(401).json(err)
    }
   }
}

module.exports = auth