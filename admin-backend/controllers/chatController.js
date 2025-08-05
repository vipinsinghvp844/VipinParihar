const mongoose = require('mongoose');
const Chat = require("../models/chatModel");
const User = require("../models/User"); 
const path = require('path');
const fs = require('fs');


exports.sendingChat = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id } = req.params;
    const { message, media_type, read_status, pageNum, limit } = req.body;

    if (!receiver_id || !mongoose.Types.ObjectId.isValid(receiver_id)) {
      return res.status(400).json({ message: "Invalid or missing receiver_id" });
    }

    const sender = await User.findById(sender_id, "username");
    const receiver = await User.findById(receiver_id, "username");

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or Receiver not found" });
    }

    let imageUrl = "";
    let finalMediaType = "none";

    if (req.file) {
      const fileName = req.file.filename;
      imageUrl = `${req.protocol}://${req.get("host")}/chatuploads/${fileName}`;
      finalMediaType = media_type || "image";
    }

    if (!message && !imageUrl) {
      return res.status(400).json({ message: "Cannot send empty message" });
    }

    const newMessage = new Chat({
      sender_id,
      receiver_id,
      sender_username: sender.username,
      receiver_username: receiver.username,
      message: message || "",
      media: {
        base64: imageUrl || "",
        type: finalMediaType,
      },
      read_status: read_status || 0,
      is_deleted: false,
    });

    await newMessage.save();

    return res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    console.error("Failed to send chat", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};


exports.getChatUserToUser = async (req, res) => {
  try {
    const receiver_id = req.user.id;
    const sender_id = req.params.sender_id;

    if (!receiver_id || !sender_id) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const chats = await Chat.find({
      $or: [
        { sender_id: sender_id, receiver_id: receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id }
      ],
      is_deleted: false
    })
    .populate("sender_id", "username") 
    .populate("receiver_id", "username")
    .lean(); 

    for (let chat of chats) {
      chat.sender_username = chat.sender_id.username;
      chat.receiver_username = chat.receiver_id.username;
      }

    return res.status(200).json({
      message: "Chat fetched successfully",
      chats,
    });

  } catch (err) {
    console.error("Failed to fetch chat:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getUserLastMessages = async (req, res) => {
  try {
   const userId = new mongoose.Types.ObjectId(req.user.id);

    const lastMessages = await Chat.aggregate([
      {
        $match: {
          $or: [
            { sender_id: userId },
            { receiver_id: userId },
          ],
          is_deleted: false,
        },
      },
      {
        $project: {
          sender_id: 1,
          receiver_id: 1,
          message: 1,
          media: 1,
          createdAt: 1,
          read_status: 1,
          updated_at:1,
          otherUser: {
            $cond: [
              { $eq: ["$sender_id", userId] },
              "$receiver_id",
              "$sender_id"
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1, updated_at: -1 }
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users", // collection name (check your DB)
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",

          username: "$userInfo.username",
          lastMessage: {
            message: "$lastMessage.message",
            media: "$lastMessage.media",
            createdAt: "$lastMessage.createdAt",
            updated_at: "$lastMessage.updated_at",
            read_status:"$lastMessage.read_status",
            sender_id: "$lastMessage.sender_id",
            receiver_id: "$lastMessage.receiver_id"
          }
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);
    return res.status(200).json({ users: lastMessages });
  } catch (err) {
    console.error("Failed to get last chat message", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
}


exports.selfChatEdit = async (req, res) => {
  try {
    const userId = req.user.id; // Logged-in user ID
    const { messageId } = req.params;
    
    const { newMessage, newBase64Image } = req.body;

    if (!newMessage || newMessage.trim() === "") {
      return res.status(400).json({ message: "New message content required" });
    }

    // Find message
    const message = await Chat.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user is the sender
    if (message.sender_id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You can only edit your own messages" });
    }

    // Update message
    message.message = newMessage;
    message.updated_at = new Date();

    await message.save();

    return res.status(200).json({
      message: "Message updated successfully",
      updatedMessage: message,
    });

  } catch (err) {
    console.error("Failed to edit chat message", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};


exports.softDeleteMessageSelf = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Chat.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    let updated = false;

    if (message.sender_id.toString() === userId) {
      message.deleted_by_sender = true;
      updated = true;
    }

    else if (message.receiver_id.toString() === userId) {
      message.deleted_by_receiver = true;
      updated = true;
    } else {
      return res.status(403).json({ message: "Unauthorized: You can't delete this message" });
    }

    if (updated) {
      message.deleted_at = new Date();

      if (message.deleted_by_sender && message.deleted_by_receiver) {
        message.is_deleted = true;
      }

      await message.save();
    }

    return res.status(200).json({
      message: "Message soft deleted for this user",
      data: message,
    });

  } catch (err) {
    console.error("Failed to soft delete message", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.messageReadUpdate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    if (!userId || !senderId) {
      return res.status(400).json({ message: "Invalid sender or user" });
    }

    const updated = await Chat.updateMany(
      {
        sender_id: senderId,
        receiver_id: userId,
        read_status: 0,
      },
      {
        $set: { read_status: 1 },
      }
    );

    return res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: updated.modifiedCount,
    });
  } catch (err) {
    console.error("Failed to update read status", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};




