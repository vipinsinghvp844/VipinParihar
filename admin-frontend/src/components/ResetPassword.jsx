import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";

const ResetPassword = () => {
  const { key, login } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${import.meta.env.VITE_API_PASSWORD_RESET}`, { key, login, newPassword })
      .then((response) => {
        setMessage(response.data.message);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Something went wrong");
        setMessage("");
      });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow-sm border-0 rounded p-4">
            <Card.Body>
              <h2 className="text-center mb-4">Reset Password</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="mb-3"
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Reset Password
                </Button>
              </Form>
              {message && <Alert variant="success" className="mt-3">{message}</Alert>}
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
