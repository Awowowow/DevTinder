const socketIO = require("socket.io");
const { socketAuth } = require("../middlewares/socketAuth");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const User = require("../models/user");

const getSecretRoomId = ({userId, toUserId}) =>{
     return crypto
     .createHash("sha256")
     .update([userId, toUserId]
        .sort()
        .join("$"))
        .digest("hex"); 
    }

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {


    socket.on("joinChat", ({ toUserId }) => {
      const room = getSecretRoomId({
        userId: socket.userId,
        toUserId
      });
      socket.join(room);
    });

    socket.on("sendMessage", async ({ toUserId, text }) => {
      
      if (socket.userId.toString() === toUserId) {
        socket.emit("error", { message: "You cannot message yourself" });
        return;
    }
      const roomId = getSecretRoomId({
        userId: socket.userId,
        toUserId
      });
 

      try{
        let chat = await Chat.findOne({
            participants: { $all: [socket.userId, toUserId ]}
        });

        if(!chat){
            chat = new Chat({
                participants: [socket.userId, toUserId],
                messages: [],
            })
        }

        chat.messages.push({
            senderId: socket.userId,
            reciverId: toUserId,
            text
        }); 

        await chat.save();
      }catch(err){
        console.log(err);
      }

      io.to(roomId).emit("messageRecivied", {
        senderId: socket.userId,
        reciverId: toUserId,
        text,
      });

    });

    (async () => {
      await User.updateOne(
        { _id: socket.userId },
        { isOnline: true }
      );
    })();

    socket.on("disconnect", async () => {
      
      await User.updateOne(
        { _id: socket.userId }, 
        { isOnline: false, lastSeen: new Date() }
      );
    });
  });
};

module.exports = initializeSocket;