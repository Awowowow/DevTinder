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

const VERIFIED_TEST_EMAILS = [
  "aaravchandel767@gmail.com",
];

const isSandboxMode = process.env.SES_SANDBOX_MODE === "true";

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

    try {
      const emailData = {
        senderName: `${req.user.firstName} ${req.user.lastName || ''}`.trim(),
        recipientName: `${toUser.firstName} ${toUser.lastName || ''}`.trim(),
        status: status,
        profileUrl: `${process.env.FRONTEND_URL || 'https://devconnect.lol'}/profile/${fromUserId}`,
        acceptUrl: `${process.env.FRONTEND_URL || 'https://devconnect.lol'}/requests`,
      };

      if (isSandboxMode) {
        if (VERIFIED_TEST_EMAILS.includes(toUser.email)) {
          await sendEmail(
            toUser.email,
            process.env.SES_FROM_EMAIL || "noreply@devconnect.lol",
            emailData
          );
          console.log(`✅ [SANDBOX] Email sent to verified address: ${toUser.email}`);
        } else {
          console.log(`⚠️ [SANDBOX] Skipping email to unverified address: ${toUser.email}`);
          console.log(`   Add this email to AWS SES verified identities to receive emails in sandbox mode`);
        }
      } else {
        await sendEmail(
          toUser.email,
          process.env.SES_FROM_EMAIL || "noreply@devconnect.lol",
          emailData
        );
        console.log(`✅ Email sent successfully to ${toUser.email}`);
      }
    } catch (emailError) {
      console.error("❌ Failed to send email notification:", emailError);
      console.error("Error details:", {
        message: emailError.message,
        code: emailError.code,
        statusCode: emailError.$metadata?.httpStatusCode,
      });
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