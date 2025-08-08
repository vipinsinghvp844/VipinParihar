import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import moment from "moment";
    import "./chat-ui.css"

const socket = io("http://localhost:3000");

const ChatWindow2 = ({
  selectedUser,
  getProfileImage,
  users,
  onlineUsers,
  lastSeenMap,
}) => {

  const userId = localStorage.getItem("user_id");
  const chatBoxRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [dotOpenId, setDotOpenId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const senderId =
        typeof newMessage.sender_id === "object"
          ? newMessage.sender_id._id
          : newMessage.sender_id;

      if (
        selectedUser &&
        senderId === selectedUser._id &&
        newMessage.receiver_id === userId
      ) {
        clearTimeout(window.readTimer);
        window.readTimer = setTimeout(() => {
          markMessageAsRead(senderId);
        }, 500);
      }
    };

    socket.on("msgFromServer", handleNewMessage);

    return () => {
      socket.off("msgFromServer", handleNewMessage);
      clearTimeout(window.readTimer);
    };
  }, [selectedUser]);

  useEffect(() => {
    // socket.on("msgFromServer", (newMessage) => {
    //   setMessages((prev) => [...prev, newMessage]); // Update message list
    // });
    socket.on("editMsgFromServer", (editedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === editedMessage._id
            ? {
                ...msg,
                message: editedMessage.message,
                updatedAt: editedMessage.updatedAt,
              }
            : msg
        )
      );
    });

    socket.on("deleteMsgFromServer", (deletedMessage) => {
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== deletedMessage._id)
      );
    });
    socket.on("readMsgFromServer", ({ userId, forUser }) => {
      // Mark all messages from that user as read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_id._id === forUser && msg.receiver_id === userId
            ? { ...msg, read_status: 1 }
            : msg
        )
      );
    });

    return () => {
      socket.off("msgFromServer");
      socket.off("editMsgFromServer");
      socket.off("deleteMsgFromServer");
      socket.off("readMsgFromServer");
    };
  }, []);

  useEffect(() => {
    if (selectedUser?._id) {
      const updateReadStatus = async () => {
        try {
          const response = await axios.put(
            `http://localhost:5000/api/chats/mark-read-message/${selectedUser?._id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
              },
            }
          );
          socket.emit("readMsg", { userId, forUser: selectedUser._id });
        } catch (error) {
          console.error("Error updating read status:", error);
        }
      };

      updateReadStatus();
    }
  }, [selectedUser]);

  const markMessageAsRead = async (senderId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/chats/mark-read-message/${senderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      // ✅ Optional: Update seen status in UI
      // setLastMessages(response.data.users);

      // ✅ Notify sender over socket
      socket.emit("readMsg", {
        userId: userId,
        forUser: senderId,
      });
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  };

  // message three dot outside click hide menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dot-menu")) {
        setDotOpenId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  //show option menu toggle
  const toggleMenu = () => {
    setShowOptions(!showOptions);
  };
  // select message on click
  const toggleSelectMessage = (messageId) => {
    setSelectedMessages((prevSelected) => {
      if (prevSelected.includes(messageId)) {
        return prevSelected.filter((id) => id !== messageId); // deselect
      } else {
        return [...prevSelected, messageId]; // select
      }
    });
  };

  const handleCopySelectedMessages = () => {
    const textsToCopy = messages
      .filter((msg) => selectedMessages.includes(msg._id))
      .map((msg) => msg.message)
      .join("\n\n");

    if (textsToCopy) {
      navigator.clipboard
        .writeText(textsToCopy)
        .then(() => toast.success("Selected messages copied to clipboard"))
        .catch(() => toast.error("Failed to copy messages"));
    } else {
      toast.info("No messages selected to copy.");
    }
  };

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);
  //sender and receiver only message fetch by server
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser?._id) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/chats/get-user-chat/${selectedUser._id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
              },
            }
          );
          setMessages(response?.data?.chats || []);
        } catch (error) {
          console.error("Failed to fetch messages", error);
        }
      }
    };
    fetchMessages();
  }, [selectedUser]);
  //select file
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileURl = URL.createObjectURL(selectedFile);
    setPreview(fileURl);
    setFile(selectedFile);
    setShowModal(true);
  };
  //message send and edit
  // const handleSendMessage = async () => {
  //   if (!newMessage.trim() && !file) return;

  //   if (editMode && editMessageId) {
  //     try {
  //       await axios.put(
  //         `http://localhost:5000/api/chats/edit-message/${editMessageId}`,
  //         { newMessage: newMessage },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
  //           },
  //         }
  //       );
  //       setMessages((prev) =>
  //         prev.map((msg) =>
  //           msg._id === editMessageId ? { ...msg, message: newMessage } : msg
  //         )
  //       );
  //       setNewMessage("");
  //       setEditMode(false);
  //       setEditMessageId(null);
  //     } catch (error) {
  //       console.error("failed to edit message", error);
  //     }
  //     return;
  //   }
  //   const formData = new FormData();
  //   formData.append("message", newMessage);
  //   if (file) {
  //     formData.append("media", file);
  //     formData.append(
  //       "media_type",
  //       file.type.startsWith("image") ? "image" : "video"
  //     );
  //   }
  //   formData.append("read_status", "0");
  //   setIsSending(true);
  //   try {
  //     await axios.post(
  //       `http://localhost:5000/api/chats/sending-chat/${selectedUser._id}`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
  //         },
  //       }
  //     );
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         sender_id: { _id: userId },
  //         message: newMessage,
  //         createdAt: new Date().toISOString(),
  //         updatedAt: new Date().toISOString(),
  //         read_status: "0",
  //         media: file
  //           ? {
  //               base64: URL.createObjectURL(file),
  //               type: file.type.startsWith("image") ? "image" : "video",
  //             }
  //           : { base64: "", type: "none" },
  //       },
  //     ]);
  //     setNewMessage("");
  //     setFile(null);
  //     setIsSending(false);
  //   } catch (error) {
  //     console.error("Failed to send message", error);
  //   }
  // };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !file) return;

    if (editMode && editMessageId) {
      try {
        await axios.put(
          `http://localhost:5000/api/chats/edit-message/${editMessageId}`,
          { newMessage: newMessage },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        const updatedMsg = {
          _id: editMessageId,
          message: newMessage,
          updatedAt: new Date().toISOString(),
        };
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editMessageId ? { ...msg, message: newMessage } : msg
          )
        );
        socket.emit("editMsg", updatedMsg);
        setNewMessage("");
        setEditMode(false);
        setEditMessageId(null);
      } catch (error) {
        console.error("failed to edit message", error);
      }
      return;
    }

    const formData = new FormData();
    formData.append("message", newMessage);
    if (file) {
      formData.append("media", file);
      formData.append(
        "media_type",
        file.type.startsWith("image") ? "image" : "video"
      );
    }
    formData.append("read_status", "0");
    setIsSending(true);

    try {
      await axios.post(
        `http://localhost:5000/api/chats/sending-chat/${selectedUser._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      const newMsgObj = {
        sender_id: { _id: userId },
        receiver_id: selectedUser._id,
        message: newMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        read_status: 0,
        media: file
          ? {
              base64: URL.createObjectURL(file),
              type: file.type.startsWith("image") ? "image" : "video",
            }
          : { base64: "", type: "none" },
      };

      setMessages((prev) => [...prev, newMsgObj]);

      socket.emit("msg", newMsgObj);

      setNewMessage("");
      setFile(null);
      setIsSending(false);
    } catch (error) {
      console.error("Failed to send message", error);
      setIsSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        Please select a user to start chatting.
      </div>
    );
  }

  //single message delete
  const handleDeleteMessage = async (messageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (!confirmDelete) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/chats/delete-chat/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      const updatedMessages = messages.filter((msg) => msg._id !== messageId);
      setMessages(updatedMessages);
      socket.emit("deleteMsg", { _id: messageId });
    } catch (error) {
      console.error("failed to edit message", error);
    }
  };

  // all select delete message
  const handleDeleteSelectedMessages = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedMessages.length} selected message(s)?`
    );
    if (!confirmDelete) return;

    try {
      await Promise.all(
        selectedMessages.map((messageId) =>
          axios.delete(
            `http://localhost:5000/api/chats/delete-chat/${messageId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
              },
            }
          )
        )
      );

      setMessages((prev) =>
        prev.filter((msg) => !selectedMessages.includes(msg._id))
      );

      setSelectedMessages([]);
      setSelectMode(false);
      setShowOptions(false);
    } catch (error) {
      console.error("Failed to delete selected messages:", error);
    }
  };

  // message share to other user on select

  const handleShareMessages = () => {
    // const msgsToSend = messages.filter((msg) =>
    //   selectedMessages.includes(msg._id)
    // );
    // selectedRecipients.forEach((recipientId) => {
    //   msgsToSend.forEach((msg) => {
    //     socket.emit("sendMessage", {
    //       sender_id: myId,
    //       receiver_id: recipientId,
    //       message: msg.message,
    //       mediaType: msg.mediaType || "text",
    //       image: msg.image || "",
    //       timestamp: new Date(),
    //     });
    //   });
    // });
    // // Reset
    // setShowShareModal(false);
    // setSelectedRecipients([]);
    // alert("Message shared!");
  };

  // clear all chats
  const handleClearChat = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear this entire chat?"
    );
    if (!confirmClear) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/chats/delete-chat/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      setMessages([]); // Clear messages from UI
      toast.success("Chat cleared successfully.");
    } catch (error) {
      console.error("Failed to clear chat:", error);
      toast.error("Failed to clear chat.");
    }
  };

  //seen message and update read status
  const isOnline = onlineUsers?.includes(selectedUser?._id);
  const userStatus = lastSeenMap[selectedUser?._id] || {};
  const userLastSeen = userStatus.lastSeen;

  return (
    <Container className="chat-container">
      {/* Header */}
      <Row className="chat-header-row">
        <Col className="d-flex align-items-center">
          <div className="profile-image-container">
            <img
              src={getProfileImage(selectedUser?._id) || "/default-avatar.png"}
              alt="profile"
              className="profile-image"
            />
            <div
              className={`status-indicator ${isOnline ? "online" : "offline"}`}
            />
          </div>
          <div>
            <h5 className="mb-0">{selectedUser?.username}</h5>
            {isOnline ? (
              <span className="ms-2 text-success">Online</span>
            ) : (
              userLastSeen && (
                <span className="ms-2 text-muted">
                  {moment(userLastSeen).fromNow()}
                </span>
              )
            )}
          </div>
        </Col>

        <Col className="d-flex justify-content-end">
          {selectMode && selectedMessages.length > 0 && (
            <>
              <span className="selection-count">{selectedMessages.length}</span>
              <div
                className="dropdown-item text-danger"
                onClick={handleDeleteSelectedMessages}
              >
                <i className="bi bi-trash"></i>
              </div>
              <div
                className="dropdown-item"
                onClick={handleCopySelectedMessages}
              >
                <i className="bi bi-copy"></i>
              </div>
            </>
          )}
          {selectMode && selectedMessages.length > 0 && (
            <div
              className="dropdown-item text-danger"
              onClick={() => setShowShareModal(true)}
            >
              <i className="bi bi-share"></i>
            </div>
          )}
          <i
            className="bi bi-three-dots-vertical menu-icon"
            onClick={toggleMenu}
          />
          {showOptions && (
            <div className="options-menu">
              <div
                className="dropdown-item"
                onClick={() => setSelectMode(!selectMode)}
              >
                ✅ {selectMode ? "Cancel Selection" : "Select"}
              </div>
              <div className="dropdown-item" onClick={handleClearChat}>
                🧹 Clear Chat
              </div>
              <div className="dropdown-item" onClick={() => alert("Download")}>
                ⬇️ Download Chat
              </div>
              <div className="dropdown-item">
                <Link to="/profile" className="profile-link">
                  👤 View Profile
                </Link>
              </div>
            </div>
          )}
        </Col>
      </Row>
      {showShareModal && (
        <div className="share-modal-backdrop">
          <div className="share-modal-content">
            <h5 className="share-modal-title">Select Users to Share</h5>
            <div className="share-user-list">
              {users
                .filter((user) => user._id !== userId)
                .map((user) => (
                  <div key={user._id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value={user._id}
                      checked={selectedRecipients.includes(user._id)}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedRecipients((prev) =>
                          prev.includes(id)
                            ? prev.filter((uid) => uid !== id)
                            : [...prev, id]
                        );
                      }}
                    />
                    <label className="form-check-label">{user.username}</label>
                  </div>
                ))}
            </div>
            <div className="share-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowShareModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleShareMessages}>
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-container" ref={chatBoxRef}>
        {messages.map((msg, idx) => {
          const isMe = String(msg.sender_id?._id) === String(userId);
          const updateTime = new Date(msg.updated_at).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          );
          const deleteTime = new Date(msg.deleted_at).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          );
          const messageTime = new Date(msg.createdAt).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          );
          const messageDate = new Date(msg.createdAt).toLocaleDateString(
            "en-US"
          );
          const previousMessageDate =
            idx > 0
              ? new Date(messages[idx - 1].createdAt).toLocaleDateString(
                  "en-US"
                )
              : null;
          const isDeleted = msg.deleted_by_sender || msg.deleted_by_receiver;

          return (
            <div key={idx}>
              {messageDate !== previousMessageDate && (
                <div className="date-divider">
                  <strong>{messageDate}</strong>
                </div>
              )}
              <div className={`message-wrapper ${isMe ? "sent" : "received"}`}>
                <div
                  className={`message-bubble ${isMe ? "sent" : "received"} ${
                    isDeleted ? "deleted" : ""
                  }`}
                >
                  <div className="dot-menu">
                    {!isDeleted && (
                      <div onClick={() => setDotOpenId(msg._id)}>
                        <i className="bi bi-three-dots-vertical dot-menu-icon"></i>
                      </div>
                    )}
                    {dotOpenId === msg._id && (
                      <div className="dot-menu-options">
                        {isMe && (
                          <>
                            <div
                              className="dot-menu-option"
                              onClick={() => {
                                setNewMessage(msg.message);
                                setEditMode(true);
                                setEditMessageId(msg._id);
                                setDotOpenId(null);
                              }}
                            >
                              <i className="bi bi-pencil-square"></i> Edit
                            </div>
                            <div
                              className="dot-menu-option"
                              onClick={() => {
                                handleDeleteMessage(msg._id);
                                setDotOpenId(null);
                              }}
                            >
                              <i className="bi bi-trash3"></i> Delete
                            </div>
                            <div className="dot-menu-option">
                              <i className="bi bi-files"></i> Copy
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    className={`message-content ${
                      selectMode ? "selectable" : ""
                    }`}
                    onClick={() => {
                      if (selectMode) toggleSelectMessage(msg._id);
                    }}
                  >
                    {selectMode && (
                      <input
                        type="checkbox"
                        className="selection-checkbox"
                        checked={selectedMessages.includes(msg._id)}
                        onChange={(e) => e.stopPropagation()}
                      />
                    )}
                    {isDeleted ? (
                      <span className="deleted-message">
                        {(() => {
                          const isSender =
                            String(msg.sender_id?._id || msg.sender_id) ===
                            userId;
                          const isReceiver =
                            String(msg.receiver_id?._id || msg.receiver_id) ===
                            userId;

                          if (
                            (msg.deleted_by_sender && isSender) ||
                            (msg.deleted_by_receiver && isReceiver)
                          ) {
                            return "This message was deleted by you";
                          } else if (msg.deleted_by_sender) {
                            return `This message was deleted by ${msg.sender_username}`;
                          } else if (msg.deleted_by_receiver) {
                            return `This message was deleted by ${msg.receiver_username}`;
                          }
                          return "";
                        })()}
                      </span>
                    ) : (
                      <>
                        {msg.media?.base64 && msg.media?.type === "image" && (
                          <img
                            src={msg.media.base64}
                            alt="sent"
                            className="message-media"
                          />
                        )}
                        {msg.media?.base64 && msg.media?.type === "video" && (
                          <video controls className="message-media">
                            <source src={msg.media.base64} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <span className="message-text">{msg.message}</span>
                      </>
                    )}
                  </div>
                  <div className="message-meta">
                    {msg.updated_at && !msg.deleted_at && (
                      <span className="message-time">
                        Updated at: {updateTime}
                      </span>
                    )}
                    {msg.deleted_at && (
                      <span className="message-time">
                        Deleted at: {deleteTime}
                      </span>
                    )}
                    {!msg.updated_at && !msg.deleted_at && (
                      <span className="message-time">{messageTime}</span>
                    )}
                    {isMe && msg.read_status === 1 ? (
                      <i className="bi bi-check2-all text-danger"></i>
                    ) : isMe && msg.read_status === 0 ? (
                      <i className="bi bi-check"></i>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* send input and emoji */}
      <div className="input-container">
        <Form className="mt-3 d-flex align-items-center">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <EmojiPicker
                onEmojiClick={(emojiObject) =>
                  setNewMessage((prev) => prev + emojiObject.emoji)
                }
              />
            </div>
          )}

          {/* Emoji Toggle Button */}
          <button
            type="button"
            className="emoji-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>

          {/* File Upload */}
          <i
            className="bi bi-paperclip attachment-icon"
            onClick={() => document.getElementById("fileInputmedia").click()}
          />
          <input
            id="fileInputmedia"
            className="file-input"
            onChange={handleFileChange}
            type="file"
            accept="image/*,video/*"
          />

          {/* Message Input */}
          <Form.Group controlId="newMessage" className="message-input-group">
            <Form.Control
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                editMode ? "Edit your message..." : "Type your message..."
              }
            />
            {editMode && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="cancel-button"
                onClick={() => {
                  setEditMode(false);
                  setEditMessageId(null);
                  setNewMessage("");
                }}
              >
                Cancel
              </Button>
            )}
          </Form.Group>

          {/* Send Button */}
          <i className="bi bi-send send-button" onClick={handleSendMessage} />
        </Form>
      </div>

      <div>
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          className="preview-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Media Preview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {file?.type.startsWith("image") ? (
              <img src={preview} alt="Preview" className="preview-media" />
            ) : (
              <video src={preview} controls className="preview-media" />
            )}
            <input
              type="text"
              className="form-control preview-input"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
          </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                await handleSendMessage();
                setShowModal(false);
              }}
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default ChatWindow2;
