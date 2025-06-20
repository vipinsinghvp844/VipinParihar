import React, { useContext, useEffect, useState } from "react";
import { Col, Container, Form, Row, Modal, Button, Spinner } from "react-bootstrap";
import { WebSocketContext } from "./WebSocketContext";

const ChatWindow = ({
  selectedUser,
  // placeholderImage,
  // AllProfilesImage,
  userId,
  messages,
  isLoading,
  handleSendMessage,
  newMessage,
  setNewMessage,
  profileImage,
  isSending,
  // filteredImage,
  chatBoxRef,
  editingMessageId,
  contextMenu,
  setContextMenu,
  setEditedMessage,
  setEditingMessageId,
  editedMessage,
  handleEditMessage,
  handleDeleteMessage,
  // onEmojiClick,
  EmojiPicker,
  showEmojiPicker,
  setShowEmojiPicker,
  // setFile,
  showModal,
  file,
  setShowModal,
  preview,
  handleFileChange,
  handleKeyDown,
  hasMore,
}) => {
  if (!selectedUser) {
    return (
      <div style={{ paddingTop: "25%", paddingLeft: "30%" }}>
        Please select a user to start chatting.
      </div>
    );
  }
  const { userStatus } = useContext(WebSocketContext);
  const online = userStatus[String(selectedUser.id)]?.status || false;
  const lastSeen = userStatus[String(selectedUser.id)]?.last_updated;
  useEffect(() => {
    if (!chatBoxRef.current) return;
  }, [chatBoxRef]);
  useEffect(() => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        // console.log("ChatBox Ref Set Successfully:", chatBoxRef.current);
      } else {
        console.log("chatBoxRef is STILL null!");
      }
    }, 1000);
  }, []);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={profileImage}
          alt="profile"
          className="rounded-circle me-3"
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
        />
        <div>
          <h5>{selectedUser.username}</h5>
          {/* Show Online or Last Seen */}
          {online === "online" ? (
            <span style={{ color: "green" }}>Online</span>
          ) : (
            <span>{lastSeen}</span>
          )}
        </div>
      </div>

      <Container
        className="chat-box"
        style={{
          height: "100vh",
          maxHeight: "500px",
          overflowY: "auto",
          backgroundColor: "#87CEEB",
        }}
        ref={chatBoxRef}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 140,
              left: "70%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(255,255,255,0.8)",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            <Spinner size="sm" /> Loading messages...
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center text-muted">
            <h6>No messages yet</h6>
            <p>Start the conversation by sending a message!</p>
          </div>
        ) : (
            
          messages.map((msg, index) => {
            const isSender = msg.sender_id === String(userId);

            const messageTime = new Date(msg.timestamp).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            const messageDate = new Date(msg.timestamp).toLocaleDateString(
              "en-US"
            );
            const previousMessageDate =
              index > 0
                ? new Date(messages[index - 1].timestamp).toLocaleDateString(
                    "en-US"
                  )
                : null;

            return (
              <React.Fragment key={`${msg.id}-${index}`}>
                {/* Show Date Separator */}
                {messageDate !== previousMessageDate && (
                  <Row className="justify-content-center">
                    <Col xs="auto">
                      <div className="text-muted text-center">
                        <strong>{messageDate}</strong>
                      </div>
                    </Col>
                  </Row>
                )}

                {/* Message with Context Menu */}
                <Row
                  className={`my-1 ${
                    isSender ? "justify-content-end" : "justify-content-start"
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      visible: true,
                      x: e.pageX,
                      y: e.pageY,
                      messageId: msg.id,
                    });
                  }}
                >
                  <Col xs="auto">
                    {msg.base64_image_data &&
                      (msg.media_type === "image" ? (
                        <img
                          src={`data:image/jpeg;base64,${msg.base64_image_data}`}
                          alt="Media"
                          width="200"
                          height="auto"
                          style={{
                            borderRadius: "5px",
                          }}
                        />
                      ) : (
                        <video controls width="200" height="auto">
                          <source
                            src={`data:video/mp4;base64,${msg.base64_image_data}`}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      ))}
                    {/* Editable or Static Message */}
                    {editingMessageId === msg.id && isSender ? (
                      <input
                        type="text"
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        onBlur={() => handleEditMessage(msg.id)}
                        autoFocus
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          overflow: "auto",
                          display: "flex",
                        }}
                        className={`p-2 rounded ${
                          isSender
                            ? "bg-success text-white "
                            : "bg-secondary text-white"
                        }`}
                      >
                        {msg.message === "This message was deleted" ? (
                          <i key={msg.id}>{msg.message}</i>
                        ) : (
                          <div key={msg.id}>{msg.message}</div>
                        )}

                        <i
                          className="text-muted ms-2"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {messageTime}
                        </i>

                        {isSender && msg.read_status === "1" ? (
                          <i className="bi bi-check2-all text-danger ms-2"></i>
                        ) : isSender && msg.read_status === "0" ? (
                          <i className="bi bi-check ms-2"></i>
                        ) : null}
                      </div>
                    )}
                  </Col>
                </Row>
              </React.Fragment>
            );
          })
        )}

        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            style={{
              position: "absolute",
              top: Math.min(contextMenu.y, window.innerHeight - 100),
              left: Math.min(contextMenu.x, window.innerWidth - 200),
              background: "white",
              border: "1px solid #ccc",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              padding: "5px 0",
            }}
            onMouseLeave={() =>
              setContextMenu({ ...contextMenu, visible: false })
            }
          >
            <div
              style={{ padding: "5px 10px", cursor: "pointer" }}
              onClick={() => {
                const messageToEdit = messages.find(
                  (msg) => msg.id === contextMenu.messageId
                );
                setEditedMessage(messageToEdit.message);
                setEditingMessageId(contextMenu.messageId);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Edit
            </div>
            <div
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                color: "red",
              }}
              onClick={() => {
                handleDeleteMessage(contextMenu.messageId);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              Delete
            </div>
          </div>
        )}
      </Container>

      {/* Emoji Picker & Input Field */}

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
            onKeyDown={handleKeyDown}
            placeholder="Type your message....."
          />
        </Form.Group>
        <i
          className="bi bi-send mx-2 p-2 bg-danger rounded"
          style={{ cursor: "pointer" }}
          onClick={handleSendMessage}
          disabled={isSending}
        ></i>
      </Form>
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
      </div>
    </div>
  );
};

export default ChatWindow;
