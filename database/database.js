const mongoose = require("mongoose");

const DB = process.env.DATABSE;

mongoose.connect(DB).then(() =>{
    console.log("connection sucessful")
 }).catch((err)=> console.log("no Connection"));
