// contain all the routes related to user

const express = require('express');
const {registerUser,authUser,allUsers} = require("../controllers/userControllers");
const router = express.Router();
const {protect} = require("../middlewares/authMiddleware");

// using this router to create different routes

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

module.exports = router;