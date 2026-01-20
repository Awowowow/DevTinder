const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");
const { validateSignUpData } = require("../utils/validation");
const { validateEditFieldValue } = require("../utils/validation");
const asyncHandler = require("../utils/asyncHandler");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    const user = req.user;
    res.send(user);
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid Error Request");
    }
    validateEditFieldValue(req);
    
    const loggedInUser = req.user;
    Object.keys(req.body).forEach(key =>(loggedInUser[key] = req.body[key]))

    await loggedInUser.save();

    res.json({
      success: true,
      message: `${loggedInUser.firstName}, your profile was updated successfully`,
      data: loggedInUser,
    });
});

module.exports = profileRouter;

