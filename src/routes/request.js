const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      
      if(!allowedStatus.includes(status)){
        return res.status(400).json({message: "Invalid Status Type: " + status,});
      }
      
      if(fromUserId.equals(toUserId)){
        return res.status(400).json({message: "You cannot send request to yourself"});
      }
      
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          {fromUserId,toUserId,},
          {fromUserId: toUserId, toUserId: fromUserId},
        ],
      })

      if(existingConnectionRequest){
        return res.status(400).json({message: "Cannot send request again"})
      }
    
      const toUser = await User.findById(toUserId)
      if(!toUser){
        return res.status(404).json({message: "User not Found!"})
      }

      const connectionReqForDb = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionReqForDb.save();

     
      res.json({
        message: req.user.firstName + status + toUser.firstName + " request",
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR " + err.message);
    }
  }
);

requestRouter.post("/request/review/:status/:requestId", userAuth , async (req,res) =>{

  try{
    
    // Validate the status
    // request id should be valid
    // Aarav => Elon
    // loggedInUser === toUserId
    // status === interested

    const loggedInUser = req.user;
    const { status, requestId } = req.params

    const allowedStatus = ["accepted", "rejected"];
    
    if(!allowedStatus.includes(status)){
      return res.status(400).json({message: status + "Status is not allowed"})
    }
    
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested"
    });

    if(!connectionRequest){
      return res.status(400).json({message: "Connection request not found"});
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();

    res.json({message: "Connection Request " + status,
      data: data,
    });

  }
  catch(err){
    res.status(400).send("ERROR: " + err.message)
  }
}
);

module.exports = requestRouter;
