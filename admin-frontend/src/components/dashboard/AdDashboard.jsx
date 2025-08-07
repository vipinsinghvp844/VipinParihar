import React, { useEffect, useState } from "react";
import { Col, Container, Row, Card, Alert } from "react-bootstrap";
import TotalUsers from "../attendance/TotalUsers";
import TodayPresent from "../attendance/TodayPresent";
import TodayOnLeave from "../attendance/TodayOnLeave";
import TodayAbsent from "../attendance/TodayAbsent";
import "./CommonDasboard.css";
import { useDispatch } from "react-redux";

const AdDashboard = () => {
  const [birthdayMessages, setBirthdayMessages] = useState("");
  const dispatch = useDispatch();

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-topbar">
        <Row className="align-items-center">
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
        <Col xs={12} md={6} lg={3} className="dashboard-col">
          <Card className="dashboard-card">
            <TotalUsers setBirthdayMessages={setBirthdayMessages} />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3} className="dashboard-col">
          <Card className="dashboard-card">
            <TodayPresent />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3} className="dashboard-col">
          <Card className="dashboard-card">
            <TodayOnLeave />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3} className="dashboard-col">
          <Card className="dashboard-card">
            <TodayAbsent />
          </Card>
        </Col>
      </Row>

      <Row className="dashboard-row">
        <Col xs={12} md={6} className="dashboard-col">
          <Card className="dashboard-card">
            <h4 className="card-title">Public Holidays</h4>
            <iframe
              src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FKolkata&showPrint=0&src=dmlwaW5zaW5naHZwODQ0QGdtYWlsLmNvbQ&src=M2VjZjEzZjUyNGE2YWM2YTlhMzc2ZTNlYzRiMGZhNGMxM2VkMDc2MGI0NDcxNGRhZjc1NjMzNTIwYWRkOTMzN0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4tZ2IuaW5kaWFuI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4tZ2IudWsjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&src=aHQzamxmYWFjNWxmZDYyNjN1bGZoNHRxbDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23039BE5&color=%23616161&color=%230B8043&color=%234285F4&color=%23B39DDB"
              className="calendar-iframe"
              title="Google Calendar"
            ></iframe>
          </Card>
        </Col>
        <Col xs={12} md={6} className="dashboard-col">
          <Card className="dashboard-card">
            <h4 className="card-title">Announcements</h4>
            {/* Add Announcements content here */}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdDashboard;
