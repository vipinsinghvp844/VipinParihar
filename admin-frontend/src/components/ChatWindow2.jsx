import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";

const ChatWindow2 = ({ selectedUser, getProfileImage }) => {
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
  }
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

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() && file) return;

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
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editMessageId ? { ...msg, message: newMessage } : msg
          )
        );
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
      setMessages((prev) => [
        ...prev,
        {
          sender_id: { _id: userId },
          message: newMessage,
          updatedAt: new Date().toISOString(),
          read_status: "0",
          media: file
            ? {
                base64: URL.createObjectURL(file),
                type: file.type.startsWith("image") ? "image" : "video",
              }
            : { base64: "", type: "none" },
        },
      ]);
      setNewMessage("");
      setFile(null);
      setIsSending(false);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (!selectedUser) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        Please select a user to start chatting.
      </div>
    );
  }

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
    } catch (error) {
      console.error("failed to edit message", error);
    }
  };

  return (
    <Container
      className="d-flex flex-column border rounded"
      style={{
        height: "90vh",
        maxHeight: "90vh",
        width: "100%",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      {/* Header */}
      <Row className="align-items-center bg-light p-2 border-bottom position-relative">
        <Col className="d-flex align-items-center  ">
          <img
            src={getProfileImage(selectedUser?._id) || "/default-avatar.png"}
            alt="profile"
            className="rounded-circle me-2"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          <h5 className="mb-0">{selectedUser?.username}</h5>
        </Col>

        <Col className="d-flex justify-content-end">
          <i
            class="bi bi-three-dots-vertical"
            style={{ cursor: "pointer", zIndex: 100 }}
            onClick={toggleMenu}
          />
          {showOptions && (
            <div
              className="position-absolute bg-white shadow rounded p-2"
              style={{
                top: "30px",
                right: "10px",
                zIndex: 99,
                minWidth: "150px",
              }}
            >
              <div
                className="dropdown-item"
                onClick={() => selectedMessages}
              >
                ✅ Select Messages
              </div>
              <div className="dropdown-item" onClick={() => alert("Copy All")}>
                📋 Copy All
              </div>
              <div className="dropdown-item" onClick={() => alert("Clear All")}>
                🧹 Clear Chat
              </div>
              <div className="dropdown-item" onClick={() => alert("Download")}>
                ⬇️ Download Chat
              </div>
              <div
                className="dropdown-item"
                onClick={() => alert("View Profile")}
              >
                👤 View Profile
              </div>
            </div>
          )}
        </Col>
      </Row>
      {/* Messages */}
      <div
        className="flex-grow-1 p-3 overflow-auto"
        ref={chatBoxRef}
        style={{ background: "#f9f9f9" }}
      >
        {messages.map((msg, idx) => {
          const isMe = String(msg.sender_id?._id) === String(userId);
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
          return (
            <div key={idx}>
              {messageDate !== previousMessageDate && (
                <div className="text-center my-2 text-muted">
                  <strong>{messageDate}</strong>
                </div>
              )}
              <div
                className={`d-flex ${
                  isMe ? "justify-content-end" : "justify-content-start"
                } mb-2`}
                style={{ overflowWrap: "break-word", width: "100%" }}
              >
                <div
                  className={`p-2 rounded ${
                    isMe ? "bg-success text-white" : "bg-secondary text-white"
                  }`}
                  style={{
                    maxWidth: "70%",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    backgroundColor:
                      msg.deleted_by_sender || msg.deleted_by_receiver
                        ? "#d3d3d3"
                        : "",
                    color:
                      msg.deleted_by_sender || msg.deleted_by_receiver
                        ? "#555"
                        : undefined,
                  }}
                >
                  <div className="dot-menu position-relative">
                    {!(msg.deleted_by_sender || msg.deleted_by_receiver) && (
                      <div
                        onClick={() => setDotOpenId(msg._id)}
                        style={{ display: "flex", justifyContent: "end" }}
                      >
                        <i
                          className="bi bi-three-dots-vertical"
                          style={{ cursor: "pointer" }}
                        ></i>
                      </div>
                    )}
                    {/* 3 Dot open edit delete*/}
                    {dotOpenId === msg._id && (
                      <div
                        className="position-absolute bg-dark p-2 rounded"
                        style={{ zIndex: "1" }}
                      >
                        {isMe && (
                          <>
                            <div
                              className="text-light"
                              style={{ cursor: "pointer", marginBottom: "5px" }}
                              onClick={() => {
                                setNewMessage(msg.message);
                                setEditMode(true);
                                setEditMessageId(msg._id);
                                setDotOpenId(null);
                              }}
                            >
                              <i className="bi bi-pencil-square me-1"></i>Edit
                            </div>
                            <div
                              className="text-light"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                handleDeleteMessage(msg._id);
                                setDotOpenId(null);
                              }}
                            >
                              <i className="bi bi-trash3 me-1"></i>Delete
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    className={`message-item ${
                      selectedMessages.includes(msg._id) ? "selected" : ""
                    }`}
                    onClick={() => {
                      if (selectMode) toggleSelectMessage(msg._id);
                    }}
                    style={{ cursor: selectMode ? "pointer" : "default" }}
                  >
                    {msg.deleted_by_sender || msg.deleted_by_receiver ? (
                      <i style={{ fontStyle: "italic", color: "#ccc" }}>
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
                          } else {
                            return "";
                          }
                        })()}
                      </i>
                    ) : (
                      <>
                        {msg.media?.base64 && msg.media?.type === "image" && (
                          <img
                            src={msg.media.base64}
                            alt="sent"
                            className="mb-2"
                            style={{ maxWidth: "100%", borderRadius: "8px" }}
                          />
                        )}

                        {msg.media?.base64 && msg.media?.type === "video" && (
                          <video
                            controls
                            className="mb-2"
                            style={{ maxWidth: "100%", borderRadius: "8px" }}
                          >
                            <source src={msg.media.base64} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}

                        <span style={{ wordBreak: "break-word" }}>
                          {msg.message}
                        </span>
                        {msg.updatedAt && (
                          <span
                            style={{ fontSize: "0.7rem", marginLeft: "5px" }}
                          >
                            (edited)
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div
                    className="text-end mt-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {messageTime}
                    {isMe && msg.read_status === "1" ? (
                      <i className="bi bi-check2-all text-danger ms-1"></i>
                    ) : isMe && msg.read_status === "0" ? (
                      <i className="bi bi-check ms-1"></i>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <Form className="mt-3 d-flex align-items-center">
          {showEmojiPicker && (
            <div style={{ position: "absolute", bottom: "-30px" }}>
              <EmojiPicker
                onEmojiClick={(emojiObject) =>
                  setNewMessage((prev) => prev + emojiObject.emoji)
                }
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              marginRight: "1px",
              position: "absolute",
            }}
          >
            😊
          </button>
          <i
            className="bi bi-paperclip"
            onClick={() => document.getElementById("fileInputmedia").click()}
            style={{
              cursor: "pointer",
              marginLeft: "50px",
              fontSize: "1.5rem",
            }}
          />
          <input
            id="fileInputmedia"
            onChange={handleFileChange}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
          />
          <Form.Group controlId="newMessage" className="w-100 ms-5">
            <Form.Control
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={
                editMode ? "Edit your message..." : "Type Your message..."
              }
            />
            {editMode && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="ms-2"
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
          <i
            className="bi bi-send mx-2 p-2 bg-danger rounded"
            style={{ cursor: "pointer" }}
            onClick={handleSendMessage}
            disabled={isSending}
          ></i>
        </Form>
      </div>
      <div>
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header>
            <Modal.Body>
              {file?.type.startsWith("image") ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "10px",
                  }}
                />
              ) : (
                <video
                  src={preview}
                  controls
                  style={{ width: "100%", borderRadius: "10px" }}
                />
              )}
              <input
                type="text"
                className="form-control me-2"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </Modal.Body>
          </Modal.Header>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                await handleSendMessage();
                setShowModal(false); // Ensure modal closes after sending
              }}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </Modal.Footer>
        </Modal>
        <div show={showModal} onHide={() => setShowModal(false)} centered></div>
      </div>
    </Container>
  );
};

export default ChatWindow2;
