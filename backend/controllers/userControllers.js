const asyncHandler = require("express-async-handler"); //for error handling
const User = require("../models/userModel");
const generateToken = require('../config/generateToken');
const { Error } = require("mongoose");

const registerUser = asyncHandler(async (req,res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }

    // to check user already exists in db or not
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({ // creating new user if not exist already
        name,
        email,
        password,
        pic,
    });

    if (user) {
        res.status(201).json({ // after creating user these things will be send to user.
            _id: user._id,
            name: user.name,
            email: user.name,
            pic: user.pic,
            token: generateToken(user._id), // also wants to send JWT token to user.
        });
    } else {
        res.status(400);
        throw new Error("Failed to Create the User");
    }

});

// LOGIN CONTROLLER
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

// api/user?search=piyush
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
    } : {};
    
    // find user in database by search option accept the own(khud ko chhod ke) user.
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
    
});

module.exports = { registerUser ,authUser,allUsers};




