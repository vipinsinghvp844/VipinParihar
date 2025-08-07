import React, { useState, useEffect } from "react";
import { Col, Row, Container, Card, Alert } from "react-bootstrap";
import MarkAttendance from "../attendance/MarkAttendance.jsx";
import "./CommonDasboard.css";// ✅ Reusing same CSS for consistency

import { useDispatch } from "react-redux";

function EmployeeDashboard() {
  const [userName, setUserName] = useState("");
  const [birthdayMessages, setBirthdayMessages] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const user_name = localStorage.getItem("user_name");
    if (user_name) {
      setUserName(user_name);
    }
  }, []);

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-topbar">
        <Row className="align-items-center justify-content-between">
          <Col>
            <h3 className="dashboard-heading text-center">
              Welcome to Dashboard
            </h3>
          </Col>
        </Row>

        {birthdayMessages.length > 0 && (
          <Card className="dashboard-card birthday-card">
            {birthdayMessages.map((message, index) => (
              <Alert key={index} variant="success" className="birthday-alert">
                {message}
              </Alert>
            ))}
          </Card>
        )}
      </div>

      <Row className="dashboard-row">
        <Col xs={12} className="dashboard-col">
          <Card className="dashboard-card">
            <MarkAttendance
              userName={userName}
              setBirthdayMessages={setBirthdayMessages}
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeeDashboard;
