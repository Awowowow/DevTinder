const { timeStamp } = require("console");
const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email adrress" + value)
            };
      },
    },
    password: {
      type: String,
      required: true,
      validate(value){
        if(!validator.isStrongPassword(value)){
            throw new Error("Enter Strong Password" + value)
        };
  },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },
    photoUrl: {
      type: String,
      default: "https://37assets.37signals.com/svn/765-default-avatar.png",
      validate(value) {
        if(!validator.isURL(value)){
          throw new Error("Invalud Photo URL: " + value);
        }
      },
    },
    description: {
      type: String,
      default: "This is a default description of the User",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);


userSchema.methods.getJWT = async function () {
  const user = this;
   const token = await jwt.sign({_id: user._id}, "DEV@Tinder$18", {
           expiresIn: "30d",
          });

        return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
     passwordHash
  );

  return isPasswordValid;
}
module.exports = mongoose.model("User", userSchema);
