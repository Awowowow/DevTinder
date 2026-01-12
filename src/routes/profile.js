const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");
const { validateSignUpData } = require("../utils/validation");
const { validateEditFieldValue } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid Error Request");
    }
    validateEditFieldValue(req);
    
    const loggedInUser = req.user;
    Object.keys(req.body).forEach(key =>(loggedInUser[key] = req.body[key]))

    await loggedInUser.save();

    res.json({ message: loggedInUser.firstName + " Your profile was edited Succesfuully",
        data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
});

module.exports = profileRouter;

