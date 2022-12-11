const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require('path');
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());


dotenv.config({path:'./config.env'});   
require('./database/database');        


// to change data in the json form
app.use(express.json());

// const User = require('./model/userSchema');
app.use(require('./router/auth'));     
const PORT = process.env.PORT;

// serving front end
app.use(express.static(path.join(__dirname,"./client/build"))); 

app.get("*", function( _ , res){
    res.sendFile(
        path.join(__dirname, "./client/build/index.html"),
        function(err) {
            res.status(500).send(err);
        }
    )
})


app.listen(PORT , ()=>{
    console.log(`you are on port ${PORT}`);
})