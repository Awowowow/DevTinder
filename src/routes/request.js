const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const asyncHandler = require("../utils/asyncHandler");
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require("../utils/customErrors");
const { run: sendEmail } = require("../utils/sendEmail");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  asyncHandler(async (req, res) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      throw new BadRequestError(`Invalid status: ${status}`);
    }

    if (fromUserId.equals(toUserId)) {
      throw new BadRequestError("Cannot send request to yourself");
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      throw new NotFoundError("User not found");
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      throw new ConflictError("Connection request already exists");
    }

    const connectionReqForDb = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionReqForDb.save();

    // Try to send email (will only work for verified emails in sandbox)
    try {
      const emailData = {
        senderName: `${req.user.firstName} ${req.user.lastName || ''}`.trim(),
        recipientName: `${toUser.firstName} ${toUser.lastName || ''}`.trim(),
        status: status,
        profileUrl: `${process.env.FRONTEND_URL || 'https://devconnect.lol'}/profile/${fromUserId}`,
        acceptUrl: `${process.env.FRONTEND_URL || 'https://devconnect.lol'}/requests`,
      };

      await sendEmail(
        toUser.emailId,
        process.env.SES_FROM_EMAIL || "no-reply@devconnect.lol",
        emailData
      );
    } catch (emailError) {
      console.error("Email send failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: `${req.user.firstName} sent ${status} request to ${toUser.firstName}`,
      data,
    });
  })
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  asyncHandler(async (req, res) => {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      throw new BadRequestError(`Invalid status: ${status}`);
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      throw new NotFoundError(
        "Connection request not found or already reviewed"
      );
    }

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.json({
      success: true,
      message: `Connection request ${status}`,
      data,
    });
  })
);

module.exports = requestRouter;