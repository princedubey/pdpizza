const jwt = require("jsonwebtoken");
const express = require('express')
const router = express.Router();
const bcrypt = require("bcrypt")
const authenticate = require("../middleware/authenticate");

require("../database/database");
const User = require("../model/userSchema");

router.get("/", (req, res)=>{
    res.send("Hello Welcome");
})

// -------------------------------- Using PROMISES -----------------------------

// router.post("/register", (req, res) => {
//     //OBJECT DISTRUCTRUTING
//     const { name, email, phone, work, password, cpassword } = req.body;  

//     if(!name || !email || !phone || !work || !password || !cpassword){
//         return res.status(422).json({ error: "plz filled it properly"});
//     }
//     User.findOne({email:email})
//     .then((userExist) => {
//         if(userExist){
//             return res.status(422).json({ error: "Email already exist"});
//         }
    
//         const user = new User({name, email, phone, work, password, cpassword});

//         user.save().then(() => {
//             res.status(201).json({message: "user registration sucessful"});
//         }).catch((err) => res.status(500).json({error: "failed registartion"}));
    
//     }).catch(err => {console.log(err)});
// });


// ----------------------------------- Using ASYNC AWAIT -------------------------------
// ------------------------------REGISTRATION--------------------------------------
router.post("/register", async (req, res) => {
    //OBJECT DISTRUCTRUTING
    const { name, email, phone, work, password, cpassword } = req.body;  

    if(!name || !email || !phone || !work || !password || !cpassword){
        return res.status(422).json({ error: "plz filled it properly"});
    }

    try {

        const userExist = await User.findOne({email:email});
        
        if(userExist){
            return res.status(422).json({ error: "Email already exist"});
        }else if(password !== cpassword){
            return res.status(422).json({ error: "Password not matching"});
        }else{
            const user = new User({name, email, phone, work, password, cpassword});
            const userRegister = await user.save();

            if (userRegister) {
                res.status(201).json({message: "user registration sucessful"});
            } else {
                res.status(500).json({error: "failed registartion"});
            }
    
        }
       
    } catch (err) {
        console.log(err)
    }
    
});

// ---------------------------------------------- LOGIN ROUT  -------------------------------------------

router.post("/signin", async (req, res) => {
    try {
        const {email, password} = req.body;

        if( !email || !password){
            return res.status(400).json({error: "plz fill the data"})
        }

        const userLogin = await User.findOne({email:email});
        
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);

            const token = await userLogin.generateAuthToken();
            console.log(token)

            // automatic logout like payment timing or railway 
            res.cookie("jwtoken", token , {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            })

        if(!isMatch){
                res.status(400).json({error: "invalid credential"})
        }else{
            res.json({message:"user signin sucessfuly"})
        }
        }else{
            res.status(400).json({error: "invalid credential"})
        }
        
            
    } catch (error) {

        console.log(error);

    }
})

// ------------------------------------ ABOUT ---------------------------------------- 

router.get("/about", authenticate ,  (req, res)=>{
        res.send(req.rootUser);
});

router.get("/getdata", authenticate ,  (req, res)=>{
    res.send(req.rootUser);
});

// ---------------------------------- CONTACT ---------------------------------------- 

router.post("/contact", authenticate , async (req, res)=>{

    try {
        const {name,email,phone,message} = req.body;

        if( !name || !email || !phone || !message ){
            console.log("error in contact form");
            return res.json({error: "plz fill the contact form properly"});
        }

        const userContact = await User.findOne({_id: req.userID})

        if(userContact){
            const userMessage = await userContact.addMessage(name, email, phone, message)
            await userContact.save();

            res.status(201).json({message: "user contact sucessfully"});
        }
    } catch (error) {
        console.log(error)
    }
});


// ----------------------------------- LOGOUT ---------------------------------------- 

router.get("/logout",  (req, res)=>{
        res.clearCookie('jwtoken', {path:"/"})
        res.status(200).send("Logout Sucessful");
});


module.exports = router;