const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const user = require("../models/user");
const userRouter = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const userService = require("../services/user.service");


const USER_SAFE_DATA = "firstName lastName photoUrl age gender description skills";

// Get all the pending connection request for the logged in user
userRouter.get("/user/requests/received", userAuth, asyncHandler(async (req, res) => {
    const loggedInUser = req.user;

    const getConnectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    
    res.json({
      message: "Data fetched successfully",
      data: getConnectionRequest,
    });
}));


// Get all the connections/matches
userRouter.get("/user/connections", userAuth, asyncHandler(async (req, res) => {
    const loggedInUser = req.user;
    const connectionsRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionsRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
}));

userRouter.get("/feed", userAuth, asyncHandler(async (req, res) => {
  
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    
    limit = limit > 30 ? 30 : limit;
    const skip = (page - 1) * limit;

    const users = await userService.getFeedUsers(req.user._id,page,limit);
    res.json({
      success: true,
      data: users,
    });
}));

module.exports = userRouter;
