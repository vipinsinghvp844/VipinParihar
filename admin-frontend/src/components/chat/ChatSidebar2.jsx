import axios from "axios";
import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");


const ChatSidebar2 = ({
  users,
  selectedUser,
  setSelectedUser,
  getProfileImage,
  onlineUsers,
}) => {
  const [lastMessages, setLastMessages] = useState([]);
  const currentUserId = localStorage.getItem("user_id");
  const [searchItem, setSearchItem] = useState("");


  useEffect(() => {
    const fetchLastMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chats/last-message`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        setLastMessages(response.data.users);
      } catch (error) {
        console.error("Error fetching last messages:", error);
      }
    };
    fetchLastMessages();
  }, []);

  useEffect(() => {
    const handleLstMessage = (newMessage) => {
      const senderId =
        typeof newMessage.sender_id === "object"
          ? newMessage.sender_id._id
          : newMessage.sender_id;
      const receiverId =
        typeof newMessage.receiver_id === "object"
          ? newMessage.receiver_id._id
          : newMessage.receiver_id;

      const chatPartnerId = senderId === currentUserId ? receiverId : senderId;

      setLastMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter(
          (msg) => msg.userId !== chatPartnerId
        );

        return [
          ...updatedMessages,
          {
            userId: chatPartnerId,
            lastMessage: newMessage,
          },
        ];
      });

      // Optionally mark as read if selectedUser matches
      if (
        selectedUser &&
        chatPartnerId === selectedUser._id &&
        receiverId === currentUserId
      ) {
        clearTimeout(window.readTimer);
        window.readTimer = setTimeout(() => {
          markMessageAsRead(chatPartnerId);
        }, 500);
      }
    };

    socket.on("lstMsgFromServer", handleLstMessage);

    return () => {
      socket.off("lstMsgFromServer", handleLstMessage);
      clearTimeout(window.readTimer);
    };
  }, [selectedUser]);


  const getLastMessage = (userId) => {
    const msgObj = lastMessages?.find((msg) => msg.userId === userId);
    if (!msgObj || !msgObj.lastMessage) return "No messages yet";

    const lastMsg = msgObj.lastMessage;
    if (lastMsg.media?.type === "image") return "📷 Photo";
    if (lastMsg.media?.type === "video") return "🎥 Video";
    if (lastMsg.media?.type === "audio") return "🎵 Audio";
    return lastMsg.message || "No message text";
  };

  const getMessageTimestampLabel = (userId) => {
    const msgObj = lastMessages?.find((msg) => msg.userId === userId);
    if (!msgObj || !msgObj.lastMessage?.createdAt) return "";
    const { createdAt, updated_at } = msgObj.lastMessage;
    const createdTime = new Date(createdAt).getTime();
    if (updated_at) {
      const updatedTime = new Date(updated_at).getTime();
      if (Math.abs(updatedTime - createdTime) > 60000) {
        const timeStr = new Date(updated_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `Updated • ${timeStr}`;
      }
    }

    // show created time
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTickStatus = (lastMessage, currentUserId) => {
    if (!lastMessage) return null;

    const senderId =
      typeof lastMessage.sender_id === "object"
        ? lastMessage.sender_id._id
        : lastMessage.sender_id;

    if (senderId !== currentUserId) return null;

    switch (lastMessage.read_status) {
      case 0:
        return <span style={{ color: "gray" }}>✓</span>;
      case 1:
        return <span style={{ color: "gray" }}>✓✓</span>;
      case 2:
        return <span style={{ color: "black" }}>✓✓</span>;
      default:
        return null;
    }
  };
   const handleInputChange = (e) => {
     setSearchItem(e.target.value);
   };
  const SearchUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchItem.toLowerCase())
  );
  return (
    <>
      <div className="sidebar-header">
        <i
          className="bi bi-arrow-left-circle back-button"
          onClick={() => window.history.back()}
        ></i>
        <input
          type="text"
          className="search-input"
          value={searchItem}
          onChange={handleInputChange}
          placeholder="Type to Search User"
        />
      </div>
      <ListGroup className="user-list">
        {SearchUsers.length === 0 ? (
          <p className="no-users-found">No user found</p>
        ) : (
          SearchUsers.map((user) => {
            const msgObj = lastMessages.find((msg) => msg.userId === user._id);
            const lastMessage = msgObj?.lastMessage;
            const isOnline = onlineUsers?.includes(user._id);

            return (
              <ListGroup.Item
                key={user._id}
                onClick={() => setSelectedUser(user)}
                active={selectedUser?._id === user._id}
                className="user-item"
              >
                <div className="user-profile">
                  <div className="profile-image-container">
                    <img
                      src={getProfileImage(user._id) || "/default-avatar.png"}
                      alt="Profile"
                      className="profile-image"
                    />
                    <div
                      className={`online-status ${
                        isOnline ? "online" : "offline"
                      }`}
                    />
                  </div>
                  <div className="user-info">
                    <div className="username">{user.username}</div>
                    <div className="message-row">
                      <span className="message-text">
                        {getLastMessage(user._id)}
                      </span>
                      <span>{getTickStatus(lastMessage, currentUserId)}</span>
                      <span className="message-time">
                        {getMessageTimestampLabel(user._id)}
                      </span>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            );
          })
        )}
      </ListGroup>
    </>
  );
};

export default ChatSidebar2;
