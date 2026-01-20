const user = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender description skills";

class UserService {
    async getFeedUsers(loggedInUserId, page = 1, limit = 10) {
        limit = limit > 30 ? 30 : limit;
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUserId },  
                { toUserId: loggedInUserId }
            ],
        }).select("fromUserId toUserId");  

        const hideUsersFromField = new Set();

        connectionRequests.forEach((req) => {
            hideUsersFromField.add(req.fromUserId.toString());  // ✅ Fixed typo
            hideUsersFromField.add(req.toUserId.toString());
        });

        const users = await user.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromField) } },
                { _id: { $ne: loggedInUserId } },
            ],
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        return users;
    }
}

module.exports = new UserService();

