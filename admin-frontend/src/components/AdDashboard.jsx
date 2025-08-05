import React, {useEffect, useState} from 'react';
import { Col, Container, Row, Card, Alert } from 'react-bootstrap';
import TotalUsers from "./TotalUsers";
import TodayPresent from "./TodayPresent";
import TodayOnLeave from "./TodayOnLeave";
import TodayAbsent from "./TodayAbsent";
import './AdDashboard.css'; // Import custom CSS
import { useDispatch } from 'react-redux';


const AdDashboard = () => {
  const [birthdayMessages, setBirthdayMessages] = useState("");
  const dispatch = useDispatch();
 

  return (
    <Container fluid className="p-">
      <div className="topbar">
        <Row className="align-items-center">
          <Col>
            <h3 className="text-center">Welcome to Dashboard</h3>
          </Col>
          {birthdayMessages.length > 0 && (
            <Card className="text-center shadow-sm border-0 rounded p-3 mt-3">
              {birthdayMessages.map((message, index) => (
                <Alert key={index} variant="success">
                  {message}
                </Alert>
              ))}
            </Card>
          )}
        </Row>
      </div>
      <Row className="mb-4">
        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="dashboard-card">
            <TotalUsers setBirthdayMessages={setBirthdayMessages} />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="dashboard-card">
            <TodayPresent />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="dashboard-card">
            <TodayOnLeave />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="dashboard-card">
            <TodayAbsent />
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3">
          <Card className="dashboard-card">
            <h2 className="card-title">Public Holidays</h2>
            <iframe
              src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FKolkata&showPrint=0&src=dmlwaW5zaW5naHZwODQ0QGdtYWlsLmNvbQ&src=M2VjZjEzZjUyNGE2YWM2YTlhMzc2ZTNlYzRiMGZhNGMxM2VkMDc2MGI0NDcxNGRhZjc1NjMzNTIwYWRkOTMzN0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4tZ2IuaW5kaWFuI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4tZ2IudWsjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&src=aHQzamxmYWFjNWxmZDYyNjN1bGZoNHRxbDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&color=%23039BE5&color=%23616161&color=%230B8043&color=%234285F4&color=%23B39DDB"
              className="calendercss"
            ></iframe>
          </Card>
        </Col>
        <Col xs={12} md={6} className="mb-3">
          <Card className="dashboard-card">
            <h2 className="card-title">Announcements</h2>
            {/* Add Announcements content here */}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdDashboard;
