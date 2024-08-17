const express = require('express');
const { protect }  = require("../middlewares/authMiddleware");
const {accessChat,fetchChats,createdGroupChats,renameGroup,addToGroup,removeFromGroup} = require("../controllers/chatControllers");


const router = express.Router();
router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/group').post(protect, createdGroupChats);
router.route('/rename').put(protect, renameGroup);
router.route('/groupremove').put(protect, removeFromGroup); // add in group to person
router.route('/groupadd').put(protect, addToGroup); // kicking the person from group.

module.exports = router;