import React, { useState, useEffect } from "react";
import { Col, Container, Row, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import "./AddNewEmployee.css"; // Import the CSS file
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  AddNewEmployeeAction,
  GetTotalUserAction,
} from "../../../redux/actions/EmployeeDetailsAction";

const AddNewEmployee = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [userState, setUserState] = useState("active"); // Add this line to set user state as active by default
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userRoleOptions, setUserRoleOptions] = useState([]);
  const currentUserRole = localStorage.getItem("role");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUserRole === "admin") {
      setUserRoleOptions(["employee", "hr", "admin"]);
    } else if (currentUserRole === "hr") {
      setUserRoleOptions(["employee"]);
    }
  }, [currentUserRole]);

  const handleAddUser = async (e) => {
    e.preventDefault();

    const userData = {
      user_state: userState, // Ensure this is set to "active"
      firstname: firstName,
      lastname: lastName,
      address: address,
      mobile: mobile,
      dob: dob,
      username: userName,
      email: userEmail,
      password: userPassword,
      role: selectedUserRole,
    };

    try {
      const response = await dispatch(
        AddNewEmployeeAction(userData, async () => {
          await dispatch(GetTotalUserAction((res) => {}));
        })
      );

      if (response.status === 200) {
        toast.success("User added successfully!");
        setFirstName("");
        setLastName("");
        setAddress("");
        setMobile("");
        setDob("");
        setUserName("");
        setUserEmail("");
        setUserPassword("");
        setSelectedUserRole("");
      } else {
        toast.error("Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <Container className="add-new-employee">
      <Row className="mb-4">
        <Col md={1}>
          <i
            className="bi bi-arrow-left-circle"
            onClick={() => window.history.back()}
            style={{
              cursor: "pointer",
              fontSize: "32px",
              color: "#343a40",
            }}
          ></i>
        </Col>
        <Col md={10}>
          <h3 className="mt-2">Add New Employee </h3>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          {/* {successMessage && <Alert variant="success">{successMessage}</Alert>} */}
          {/* {errorMessage && <Alert variant="danger">{errorMessage}</Alert>} */}
          <Form onSubmit={handleAddUser}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={firstName}
                    placeholder="Enter first name"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={lastName}
                    placeholder="Enter last name"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formUserName">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formUserEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formAddress">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formUserRole">
                  <Form.Label>User Role</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedUserRole}
                    onChange={(e) => setSelectedUserRole(e.target.value)}
                    required
                  >
                    <option value="">Select role...</option>
                    {userRoleOptions.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formMobile">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formDob">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="fromuserstate">
                  <Form.Label>User State</Form.Label>
                  <Form.Control
                    type="text"
                    value={userState}
                    onChange={(e) => setUserState(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formUserPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" className="submit-button">
              Add User
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddNewEmployee;
