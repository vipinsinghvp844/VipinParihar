import React, { useState, useEffect } from "react";
import { Col, Row, Tabs, Tab, Container, Card, Alert } from "react-bootstrap";
import MarkAttendance from "./MarkAttendance.jsx";
import "./EmDashboard.css"; // Import custom CSS

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
    <Container fluid className="p-3">
      <div className="topbar">
        <Row className="align-items-center justify-content-between">
          <Col>
            <h3 className="text-center">Welcome to Dashboard</h3>
          </Col>
        </Row>
        {birthdayMessages.length > 0 && (
          <Card className="text-center shadow-sm border-0 rounded p-3 mt-3">
            {birthdayMessages.map((message, index) => (
              <Alert key={index} variant="success">
                {message}
              </Alert>
            ))}
          </Card>
        )}
      </div>
      <div className="mt-4">
        {/* <Card className="dashboard-card"> */}
        <MarkAttendance userName={userName} />
        {/* </Card> */}
      </div>
      {/* {setBirthdayMessages} */}
    </Container>
  );
}

export default EmployeeDashboard;
