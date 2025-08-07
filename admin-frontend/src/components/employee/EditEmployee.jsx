import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import "../../commonDashboard.css"; // ✅ Common CSS import

const EditEmployee = ({ employeeId, show, handleClose }) => {
  const [employee, setEmployee] = useState({
    first_name: "",
    last_name: "",
    username: "",
    dob: "",
    email: "",
    mobile: "",
    role: "",
    address: "",
    user_state: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (employeeId) {
          const response = await axios.get(
            `http://localhost:5000/api/auth/get-user-by-id/${employeeId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
              },
            }
          );
          setEmployee(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        if (error.response && error.response.status === 404) {
          setErrorMessage("Employee not found.");
        } else {
          setErrorMessage("Failed to fetch employee details.");
        }
      }
    };

    if (show && employeeId) {
      fetchEmployee();
    }
  }, [show, employeeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const [objectName, key] = name.split(".");
    setEmployee((prev) => ({
      ...prev,
      [objectName]: {
        ...prev[objectName],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/auth/updateuser/${employeeId}`,
        employee,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      setSuccessMessage("Employee details updated successfully.");
      handleClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      setErrorMessage("Failed to update employee details.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="common-modal-header">
        <Modal.Title className="common-title">
          Edit Employee Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="common-form">
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Container>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group controlId="formFirstName" className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="personalInfo.firstname"
                    value={employee?.personalInfo?.firstname || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="formLastName" className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="personalInfo.lastname"
                    value={employee?.personalInfo?.lastname || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={employee.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="formUsername" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={employee.username}
                    onChange={handleInputChange}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <Form.Group controlId="formMobile" className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    type="text"
                    name="personalInfo.mobile"
                    value={employee?.personalInfo?.mobile || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="formRole" className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    name="role"
                    value={employee.role}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <Form.Group controlId="formdob" className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="personalInfo.dob"
                    value={employee?.personalInfo?.dob || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId="formAddress" className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="additionalInfoDetail.address"
                    value={employee?.additionalInfoDetail?.address || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <Form.Group controlId="formUserState" className="mb-3">
                  <Form.Label>User State</Form.Label>
                  <Form.Control
                    type="text"
                    name="user_state"
                    value={employee.user_state}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Container>
          <Button
            variant="primary"
            type="submit"
            className="mt-3 w-100 common-submit-btn"
          >
            Update
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditEmployee;
