const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { sendingChat, getChatUserToUser, selfChatEdit, softDeleteMessageSelf } = require("../controllers/chatController");
const upload = require("../middleware/upload");

router.post('/sending-chat/:receiver_id', protect, upload.single('media'), sendingChat);
router.get('/get-user-chat/:sender_id', protect, getChatUserToUser); 
router.put('/edit-message/:messageId', protect, selfChatEdit);
router.delete('/delete-chat/:messageId', protect, softDeleteMessageSelf)




module.exports = router; 

