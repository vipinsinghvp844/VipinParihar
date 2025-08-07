import React, { useState } from "react";
// import axios from "axios";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { ChangePasswordAction } from "../../../redux/actions/dev-aditya-action";
import { toast } from "react-toastify";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.warning("New password and confirm password not match");
      return;
    }
    let body = {
      oldPassword: currentPassword,
      newPassword: newPassword,
    };
    const response = await dispatch(ChangePasswordAction(body));
    if (response) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      console.error("password chenge failed");
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h3 className="my-4">Change Password</h3>
          <Form>
            <Form.Group controlId="currentPassword">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="newPassword" className="mt-2">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="confirmPassword" className="mt-2">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleChangePassword}
              className="mt-4"
            >
              Change Password
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
