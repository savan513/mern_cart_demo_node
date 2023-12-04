const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    user_name :  {
        type : String,
    },
    user_email : {
        type : String,
        unique : true,
        required : true,
        validate(n) {
              if(!validator.isEmail(n))
                throw new ("Please enter valid email")
        }
    },
    user_pass : {
        type : String,
        required : true,
    },
    user_cpass : {
        type : String,
        required : true,
    },
    user_order : [
       {
        order_date : {
           type : Date,
           default : Date.now(),
        }
        ,
        product_id : Number,
        product_qty : Number,
        order_price : Number
       }
    ],
    user_cart : [{
        product_id : Number,
        product_qty : Number
    }],
    tokens : [{
        token : String
    }]

})

userSchema.pre("save",async function(next){
     try{
          if(this.isModified("user_pass"))
          {
             this.user_pass = await bcrypt.hash(this.user_pass,10);
             this.user_cpass = this.user_pass
             
          }
     }catch(err){
        console.log(err)
     }
     next();
})

const users = new mongoose.model("user",userSchema);

module.exports = users;