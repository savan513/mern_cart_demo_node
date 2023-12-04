require('dotenv').config();
const express = require('express');
require("./db/dbConnection");
const userRouter = require('./src/userRouter');
const productRouter = require('./src/productRouter')
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = ['https://merncartdemonode.onrender.com/'];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(userRouter)
app.use(productRouter)

app.listen(port,()=> console.log(`node server is running on port - ${port}`));