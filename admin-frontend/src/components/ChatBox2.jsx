import { Col, Container, Row } from "react-bootstrap";
import ChatSidebar2 from "./ChatSidebar2";
import ChatWindow2 from "./ChatWindow2";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const ChatBox2 = () => { 
  const [selectedUser, setSelectedUser] = useState(null);
    const [profileImage, setProfileImage] = useState([]);


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
          />
        </Col>
        <Col md={9} className="mobilschatwindow">
          <ChatWindow2 selectedUser={selectedUser} getProfileImage={getProfileImage} />
        </Col>
      </Row>
    </Container>
  );
}
export default ChatBox2;