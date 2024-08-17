
const express = require('express');
const dotenv = require("dotenv");
const { chats } = require('./data/data');
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const {notFound,errorHandler} = require("./middlewares/errorMiddleware");
//const { Console } = require('console');
const path = require("path");


dotenv.config();
connectDB(); // for connecting mongodb database
const app = express();
// since we are taking data from frontend to accept in server we need tell server to accept json data
app.use(express.json()); //to accept json data



app.get('/', (req, res) => { // creating first js api
    res.send("API is Running Successfully");
})

app.use('/api/user',userRoutes)// all logic for routes related to user inside userRoutesFile
app.use('/api/chat', chatRoutes)// all logic for chat related to user inside userChatFile
app.use("/api/message", messageRoutes);

// ********************************* Deployment **********************************//

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}
    
    
    
    
// ********************************* Deployment **********************************//

// using Middleware for error handling for Pretecting Routes
app.use(notFound);// for routes not found
app.use(errorHandler); // other normal error


const PORT = process.env.PORT || 9000; // for not making our port public .
const server = app.listen(PORT, '127.0.0.1', console.log(`Server started on port ${PORT}`));

// ********************************* SOCKET I/O ************************************** //
     
const io = require('socket.io')(server, {
    pingTimeout:60000, //after 60sec it goes the connection off btw user and server. to save bandwidth
    cors: {
        origin: "http://localhost:3000",
    },
});
io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
        // accept data from frontend to the server
        socket.join(userData._id);
      //  console.log(userData._id);
        socket.emit('connected');
        
    })

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room : " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if (!chat.users) return console.log("chats.users not defined");

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageReceived);
        })
    });
     
    // we need to make socket off to avoid bandwidth consumption

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });

});