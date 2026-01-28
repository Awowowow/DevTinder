const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const socketAuth = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return next(new Error("unauthorized"));
    } 

    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) { 
      return next(new Error("unauthorized"));
    }

    socket.user = user;
    socket.userId = user._id.toString();

    next();
  } catch (err) {
    next(new Error("unauthorized"));
  }
};


module.exports = {
    socketAuth,
}