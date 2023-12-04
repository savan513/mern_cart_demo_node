const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    product_title : {
        type : String
    },
    product_desc : {
        type : String
    },
    product_img : {
        type : String
    },
    product_price : {
        type : Number
    },
    product_id : {
        type : Number,
        unique : true
    }
})

const products = mongoose.model("product",productSchema);

module.exports = products;