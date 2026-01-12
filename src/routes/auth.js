const express = require('express');
const authRouter = express.Router();
const validator = require("validator");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
 

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of Data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypting the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    // Creating a new instance of the User
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    
    await user.save();
    const token = await user.getJWT();
    res.cookie("token", token);
    res.send(user);

  } catch (err) {
    console.error("ERROR in signup:", err);
    res.status(400).send("error: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid");
    }

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if(isPasswordValid){
      // Create a JWT token
      
      const token = await user.getJWT();

      // Add the token to cookie and send the response back to the user
      res.cookie("token", token);
      res.send(user);
    }
    else{
      throw new Error("Invalid credentials")
    }
  } catch (err) {
    res.status(400).send("Error: " + err.message);
    console.log(err.message);
  }
});

authRouter.post("/logout", async (req,res) =>{
      res.cookie("token", null, {
        expires: new Date(Date.now()),
      });
      res.send("logout successful")
});


module.exports = authRouter;
