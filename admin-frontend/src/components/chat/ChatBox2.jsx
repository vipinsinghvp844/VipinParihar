import { Col, Container, Row } from "react-bootstrap";
import ChatSidebar2 from "./ChatSidebar2";
import ChatWindow2 from "./ChatWindow2";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useSocket } from "../WebSocketProvider";


const ChatBox2 = () => { 
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileImage, setProfileImage] = useState([]);
  const [users, setUsers] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState({});

  useEffect(() => {
    const fetchLastSeen = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/last-seen-map",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        // console.log(response.data.lastSeenMap, "=====");
      setLastSeenMap(response.data.lastSeenMap);
        
      } catch (error) {
        consol.log("failed to fetch Last Seen", error);
      }
    }
    fetchLastSeen()
  },[])

  useEffect(() => {
    if (!socket) return;
    socket.on("initial-online-users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user-online", ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on("user-offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("initial-online-users");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [socket]);



    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/auth/get-user`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
              },
            }
          );
          setUsers(response.data.data);
        } catch (error) {
          console.error("failed to fetch users");
        }
      };
      fetchUsers();
    }, []);
  
  
   useEffect(() => {
      const fetchProfileImage = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/images/getallimage`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
              },
            }
          );
          setProfileImage(response.data.profiles);
          
        } catch (error) {
          console.log("failed to fetch user Profile", error);
        }
      }
      fetchProfileImage();
    }, [])
    
    //profile images ke liye
    const profileImageMap = useMemo(() => {
      const map = new Map();
      profileImage.forEach((img) => {
        map.set(String(img.user_id), img.profile_image || "/default-avatar.png");
      });
      return map;
    }, [profileImage]);
    const getProfileImage = (userId) => {
      return profileImageMap.get(String(userId)) || "/default-avatar.png";
  };

  
  return (
    <Container>
      <Row>
        <Col md={3} className="mobilechatsidebar">
          <ChatSidebar2
            setSelectedUser={setSelectedUser}
            getProfileImage={getProfileImage}
            users={users}
            onlineUsers={onlineUsers}
          />
        </Col>
        <Col md={9} className="mobilschatwindow">
          <ChatWindow2
            selectedUser={selectedUser}
            getProfileImage={getProfileImage}
            users={users}
            onlineUsers={onlineUsers}
            lastSeenMap={lastSeenMap}
          />
        </Col>
      </Row>
    </Container>
  );
}
export default ChatBox2;