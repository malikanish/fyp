const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { appendFile } = require("fs");
const { verifyToken } = require("./verifyToken");
const Cart = require("../models/Cart");



//REGISTER
router.post("/register", async (req, res) => {

  if(req.body.username=="" || req.body.email=="" 
  || req.body.password=="" || req.body.isAdmin=="") {
    return req.status(400).send("some fields are empty");
  }
  
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    // password: req.body.password,
    password: CryptoJS.AES.encrypt(req.body.password,process.env.PASS_SEC).toString(),
    isAdmin: req.body.isAdmin
  });


  try {
    const savedUser = await newUser.save();
    console.log("user created");
    console.log(savedUser)
    var cart = new Cart({
      userId: savedUser.id,
    });
    let flag = await cart.save();
    console.log("cart created");
    return res.status(200).json(savedUser)
  } catch (err) {
    console.log("error")
    return res.status(500).json(err);
  }
});

//LOGIN

router.post("/login",  async(req, res) => {
    console.log(req.body)
  try {
    const user = await User.findOne({ email: req.body.email});
    if (!user) {
      return res.status(401).json("Wrong credentials!");
    }

    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);

 
    // const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
    // console.log(hashedPassword.toString(CryptoJS.enc.Base64),"hashed")
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    console.log(OriginalPassword,"original pass")
    if(OriginalPassword !== req.body.password) {
      res.status(401).send("Wrong credentialsaa!");
      return;
    }

    const accessToken = jwt.sign({
        id:user._id, 
        isAdmin: user.isAdmin
    },
      process.env.JWT_SEC,
      {expiresIn:"3d"}
    );


    const { password, ...others } = user._doc;
      return res.status(200).json({...others, accessToken});  
  } catch (err) {
    res.status(500).send(err+"");
  }
});

router.get("/authenticate", verifyToken, (req, res)=>{
  return res.status(200).send(JSON.stringify("you are authenticated successfuly!"));
})
module.exports = router;
