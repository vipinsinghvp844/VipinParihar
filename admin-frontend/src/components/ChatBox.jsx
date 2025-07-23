import { Col, Container, Row } from "react-bootstrap";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { GetTotalUserAction } from "../../redux/actions/EmployeeDetailsAction";
import {
  GetSpecificUserCahts,
  messageSentSpecificUser,
  readMessageOnSelectUser,
  unseenUserandMessagecount,
} from "../../redux/actions/EmployeeDetailsAction";

const ChatBox = () => {
  const placeholderImage = import.meta.env.VITE_PLACEHOLDER_IMAGE;
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchItem, setSearchItem] = useState("");
  const { AllProfilesImage } = useSelector(({ AllReducers }) => AllReducers);
  
  const { TotalUsers } =
    useSelector(({ EmployeeDetailReducers }) => EmployeeDetailReducers);
  const userId = localStorage.getItem("user_id");
  const [socket, setSocket] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const chatBoxRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();
  const [page, setPage] = useState(1); // Current page number
  const [hasMore, setHasMore] = useState(true); // If more messages exist
  const [users, setUsers] = useState([]);
  const [usersWithImages, setUsersWithImages] = useState([]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await dispatch(GetTotalUserAction());
        setUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [selectedUser, messages]);

  //Edit message by sender user

  const handleEditMessage = async (messageId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_CHATTING}/${messageId}`,
        {
          message: editedMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      // Update the state after success
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, message: editedMessage } : msg
        )
      );

      // Clear editing state
      setEditingMessageId(null);
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  //delete message by sender user
  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SOFT_DELETED_MESSAGE}/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      // WebSocket ke through delete message ka event bhejna
      if (socket) {
        const deletePayload = {
          type: "delete_message",
          messageId: messageId,
          sender_id: userId,
          receiver_id: selectedUser.id,
        };
        socket.send(JSON.stringify(deletePayload));
      }

      // UI me update karna (Message ko "This message was deleted" se replace karna)
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                message: "This message was deleted",
                base64_image_data: "This message was deleted",
                is_deleted: true,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "delete_message") {
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === data.messageId
                  ? {
                      ...msg,
                      message: "This message was deleted",
                      base64_image_data: "This message was deleted",
                      is_deleted: true,
                    }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    }
  }, [socket]);

  const handleInputChange = (e) => {
    setSearchItem(e.target.value);
  };

  const filteredUsers = TotalUsers.filter((user) =>
    user.username.toLowerCase().includes(searchItem.toLowerCase())
  );

  const getAllUsersWithProfileImages = async (users) => {
    const response = await axios.get(
      `http://localhost:5000/api/images/getallimage`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );

    const pro = response.data.profiles;

    const usersWithImages = users.map((user) => {
      const profile = pro.find((p) => String(p.user_id) === String(user._id));
      const profile_image = profile?.profile_image?.trim()
        ? profile.profile_image
        : placeholderImage;

      return {
        ...user,
        profile_image,
      };
    });

    return usersWithImages;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Suppose `users` already fetched from some API
        const data = await getAllUsersWithProfileImages(users);
        setUsersWithImages(data);
      } catch (err) {
        console.error("Error fetching profile images", err);
      }
    };

    fetchData();
  }, [users]);
  

  const fetchMessages = async (pageNum) => {
    if (!selectedUser && !hasMore) return;

    setIsLoading(true);
    try {
      const selecteduserid = selectedUser?._id;
      const response = await axios.get(
        `http://localhost:5000/api/chats/get-user-chat/${selecteduserid}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      if (response.data.chats.length > 0) {
        setAllMessages((prevMessages) => [
          ...response.data.chats,
          ...prevMessages,
        ]);
        setPage(pageNum + 1);
      }
      if (response.data.chats.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
    setIsLoading(false);
  };

  // Reset chat when new user is selected
  useEffect(() => {
    setAllMessages([]);
    setPage(1);
    setHasMore(true);
    fetchMessages(1);
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser || !chatBoxRef.current) return;

    const chatBox = chatBoxRef.current;

    const handleScroll = () => {
      if (chatBox.scrollTop === 0 && hasMore && !isLoading) {
        fetchMessages(page);
      }
    };
    chatBox.addEventListener("scroll", handleScroll);

    return () => {
      chatBox.removeEventListener("scroll", handleScroll);
    };
  }, [selectedUser, hasMore, isLoading, page]);

  useEffect(() => {
    if (selectedUser) {
      const filteredMessages = allMessages;
      setMessages(filteredMessages);
    }
  }, [selectedUser, allMessages, userId]);

  useEffect(() => {
    if (selectedUser) {
      const ws = new WebSocket("ws://localhost:8080"); // on local use
      // const ws = new WebSocket("wss://testing-vipin.onrender.com"); // on production use

      ws.onopen = () => {
        console.log("✅ WebSocket Connected!");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 WebSocket Message Received:", event.data);

          console.log("WebSocket Message Received:", data);
          if (data.type === "message") {
            setAllMessages((prev) => [...prev, data]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      setSocket(ws);

      return () => {
        ws.close();
        console.log("WebSocket Disconnected");
      };
    }
  }, [selectedUser]);


  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (selectedUser) {
        const unreadMessages = messages.filter(
          (msg) => msg.receiver_id === userId && msg.read_status === "0"
        );

        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map((msg) => msg.id);

          try {
            await dispatch(
              readMessageOnSelectUser(messageIds, async () => {
                await dispatch(unseenUserandMessagecount((res) => {}));
              })
            );

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                messageIds.includes(msg.id) ? { ...msg, read_status: "1" } : msg
              )
            );

            // WebSocket ke through sender ko notify karna
            if (socket) {
              const payload = {
                type: "read_status",
                messageIds: messageIds,
                sender_id: selectedUser.id,
                receiver_id: userId,
              };
              socket.send(JSON.stringify(payload));
            }
          } catch (e) {
            console.error("Failed to update read status:", e);
          }
        }
      }
    };

    markMessagesAsRead();
  }, [selectedUser, messages]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "read_status") {
            setAllMessages((prevMessages) =>
              prevMessages.map((msg) =>
                data.messageIds.includes(msg.id)
                  ? { ...msg, read_status: "1" }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    }
  }, [socket]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileURl = URL.createObjectURL(selectedFile);
    setPreview(fileURl);
    setFile(selectedFile);
    setShowModal(true);
  };

  const handleSendMessage = async () => {
    if (
      (newMessage.trim() === "" && !file) ||
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      console.error("WebSocket is not open or message is empty");
      return;
    }
    // setIsLoading(true);
    setIsSending(true);

    let base64_image_data = "";
    let media_type = "";

    if (file) {
      // File ko Base64 me convert karna
      const reader = new FileReader();
      reader.readAsDataURL(file);
      base64_image_data = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
      });
      media_type = file.type.startsWith("image") ? "image" : "video";
    }

    const payload = {
      type: "message",
      sender_id: String(userId),
      receiver_id: selectedUser.id,
      message: newMessage,
      base64_image_data,
      media_type,
      timestamp: new Date().toISOString(),
      read_status: "0",
    };
    // Send message via WebSocket
    socket.send(JSON.stringify(payload));

    // Update UI instantly
    setAllMessages((prev) => [...prev, payload]);
    setNewMessage("");
    setFile(null);

    const selecteduserid = selectedUser?._id;
    await axios.post(
      `http://localhost:5000/api/chats/sending-chat/${selecteduserid}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
  //   await dispatch(
  //     messageSentSpecificUser(payload, async () => {
  //       await dispatch(GetSpecificUserCahts(selecteduserid, page, (res) => {}));
  //     })
  //   )
  //     .catch((error) => console.error(error))
  //     .finally(() => setIsSending(false));
  };
   
  const handleKeyDown = async (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents new line in textarea
      await handleSendMessage();
    }
  };

 
  const onEmojiClick = (event, emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  //media send message hear


  return (
    <Container>
      <Row>
        <Col md={3} className="mobilechatsidebar">
          <ChatSidebar
            selectUser={setSelectedUser}
            placeholderImage={placeholderImage}
            AllProfilesImage={AllProfilesImage}
            usersWithImages={usersWithImages}
            TotalUsers={TotalUsers}
            filteredUsers={filteredUsers}
            searchItem={searchItem}
            handleInputChange={handleInputChange}
            // getProfileImage={getProfileImage}
            // getLastMessageForUser={getLastMessageForUser}
            userId={userId}
            hasMore={hasMore}
          />
        </Col>
        <Col md={9} className="mobilschatwindow">
          <ChatWindow
            selectedUser={selectedUser}
            placeholderImage={placeholderImage}
            // AllProfilesImage={AllProfilesImage}
            userId={userId}
            socket={socket}
            messages={messages}
            isLoading={isLoading}
            handleSendMessage={handleSendMessage}
            newMessage={newMessage}
            isSending={isSending}
            chatBoxRef={chatBoxRef}
            setNewMessage={setNewMessage}
            // profileImage={profileImage}
            // filteredImage={filteredImage}
            editingMessageId={editingMessageId}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            setEditedMessage={setEditedMessage}
            setEditingMessageId={setEditingMessageId}
            editedMessage={editedMessage}
            handleEditMessage={handleEditMessage}
            handleDeleteMessage={handleDeleteMessage}
            onEmojiClick={onEmojiClick}
            EmojiPicker={EmojiPicker}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            setFile={setFile}
            handleFileChange={handleFileChange}
            showModal={showModal}
            file={file}
            setShowModal={setShowModal}
            preview={preview}
            handleKeyDown={handleKeyDown}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatBox;
