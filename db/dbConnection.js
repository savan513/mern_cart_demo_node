const mongoose = require("mongoose");
//const url = "mongodb+srv://savan513:'Savan@513'@clusterminiproject.iiyi4qs.mongodb.net/shoppingcartDB?retryWrites=true&w=majority"
const url = process.env.DATABASE_URL;
mongoose.connect(url,{
    
})
.then(()=>{console.log("DB connection successfull.........")})
.catch((e)=>{console.log(`error in DB connection................... ${e}`)});