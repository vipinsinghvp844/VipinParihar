import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Row, Col, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { GetTotalUserActionByUserId } from "../../redux/actions/EmployeeDetailsAction";
import Spinner from "./common/LoaderSpiner";

const PersonalInfo = () => {
  // console.log(TotalUsersId,"============================================");

  const [userInfo, setUserInfo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const userId = localStorage.getItem("user_id");
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await dispatch(GetTotalUserActionByUserId());
        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
    setLoader(false);
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleSave = async () => {
    setLoader(true);
    const response = userInfo;
    setUserInfo(response);

    if (response) {
      setIsEditing(false);
    }

    try {
      const token = localStorage.getItem("authtoken");
      await axios.put(
        `http://localhost:5000/api/auth/updateuser/${userId}`,
        userInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsEditing(false);
      setLoader(false);
    } catch (error) {
      console.error("Error updating user info:", error);
    }
  };
  // console.log(loginUserData,"=========loginUserData");
  // console.log(userInfo,"=========userInfo");

  return (
    <Container>
      {loader ? (
        <Spinner />
      ) : (
        <Row className="justify-content-md-center">
          <Col xs={12} md={6}>
            <h3 className="my-4">Personal Info</h3>
            {isEditing ? (
              <Form>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={userInfo.personalInfo.firstname || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={userInfo.personalInfo.lastname || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="user_email"
                    value={userInfo.email || ""}
                    onChange={handleInputChange}
                    disabled
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile"
                    value={userInfo.personalInfo.mobile || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={userInfo.additionalInfoDetail.address || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleSave}>
                  Save
                </Button>
              </Form>
            ) : (
              <div>
                <p>First Name: {userInfo?.personalInfo?.firstname}</p>
                <p>Last Name: {userInfo?.personalInfo?.lastname}</p>
                <p>Email: {userInfo?.email}</p>
                <p>Mobile: {userInfo?.personalInfo?.mobile}</p>
                <p>Address: {userInfo?.additionalInfoDetail?.address}</p>
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PersonalInfo;
