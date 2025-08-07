import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";

const RequestPasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoding, setIsLoding] = useState(false);

  const handleSubmit = (e) => {
    setIsLoding(true);
    e.preventDefault();
    axios
      .post(`${import.meta.env.VITE_API_REQUEST_PASSWORD_RESET}`, { email })
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
    <>
      <Container></Container>
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100">
          <Col md={12} lg={6} className="mx-auto">
            <Card className="shadow-sm border-0 rounded p-4">
              <Card.Body>
                <h2 className="text-center mb-4 text-primary">
                  Forgot Password
                </h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mb-3"
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Request Password Reset
                  </Button>
                  <div className="text-center mt-3">
                    <Link to="/">Go to Login</Link>
                  </div>
                </Form>
                {message && (
                  <Alert variant="success" className="mt-3">
                    {message}
                  </Alert>
                )}
                {error && (
                  <Alert variant="danger" className="mt-3">
                    {error}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default RequestPasswordReset;
