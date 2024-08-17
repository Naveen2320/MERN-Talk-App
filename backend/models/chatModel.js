// ***************Info that it contain*****************
// CHAT NAME
// IS GROUPCHAT
// users
// latestMessages
// groupAdmin

const { timeStamp } = require('console');
const mongoose = require('mongoose');
const chatModel = mongoose.Schema(
    {
        chatName: { type: String, trim: true }, // trim the name so there will be no trilling space after and before it.
        isGroupChat: { type: Boolean, default: false },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timeStamps: true, // everytime when we add data it'll create a timestamops when data is added to DB.
    }
);

const Chat = mongoose.model("Chat", chatModel);
module.exports = Chat;
