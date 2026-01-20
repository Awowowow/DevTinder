const express = require("express");
const authRouter = express.Router();
const validator = require("validator");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const asyncHandler = require("../utils/asyncHandler");
const {
  BadRequestError,
  UnauthorizedError,
} = require("../utils/customErrors");

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      throw new BadRequestError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
      },
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new BadRequestError("Invalid email format");
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
      },
    });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    res.cookie("token", null, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      expires: new Date(0),
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  })
);

module.exports = authRouter;
