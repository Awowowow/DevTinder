const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:toUserId", userAuth, async (req, res) =>{
    const {toUserId} = req.params;
    const userId = req.user._id;

    if (userId.toString() === toUserId) {
        return res.status(400).json({ 
            success: false, 
            error: "Cannot create chat with yourself" 
        });
    }

    try{ 
        let chat = await Chat.findOne({
            participants: { $all: [userId, toUserId]},
        }) .populate("participants", "firstName lastName photoUrl isOnline lastSeen") 
           .populate("messages.senderId", "firstName lastName photoUrl isOnline lastSeen"); 

        if(!chat){
            chat = new Chat({
                participants: [userId, toUserId],
                messages: [],
            });

            await chat.save();
        }
        chat = await chat.populate({
            path: "messages.senderId",
            select: "firstName lastName photoUrl"
        });

        res.json({ success: true, data: chat });
    } catch(err){
        res.status(500).json({ success: false, error: err.message });
    }
})

module.exports = chatRouter