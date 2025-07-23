import axios from "axios";
import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

const ViewProfileInChats = () => {
  const [ProfileImage, setProfileImage] = useState([]);

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
  return (
    
      <Container>
        <Row>
          <Col>
          <h1>View Profile</h1>
          </Col>
        </Row>
    </Container>
    
  )
}

export default ViewProfileInChats;