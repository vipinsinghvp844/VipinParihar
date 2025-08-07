import React, { useState, useEffect } from "react";
import { Row, Col, Container, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";
import axios from "axios";

import TodayPresent from "../attendance/TodayPresent";
import TodayAbsent from "../attendance/TodayAbsent";
import TodayOnLeave from "../attendance/TodayOnLeave";
import TotalUsers from "../attendance/TotalUsers";
import MarkAttendance from "../attendance/MarkAttendance";

import { useDispatch } from "react-redux";
import {
  GetAttendanceDataAction,
  GetEmployeeLeaveDetailAction,
  GetTotalUserAction,
  GetLeavePolicyAction,
  GetOfficeShiftsAction,
} from "../../../redux/actions/EmployeeDetailsAction";
import { FetchAllUserProfileAction } from "../../../redux/actions/dev-aditya-action";

import "./CommonDasboard.css"; // ✅ Reuse existing CSS

const HrDashboard = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [birthdayMessages, setBirthdayMessages] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const user_name = localStorage.getItem("user_name");
    if (user_name) setUserName(user_name);
  }, []);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) setUserId(user_id);
    const date = new Date().toISOString().split("T")[0];
    setCurrentDate(date);
  }, []);

  useEffect(() => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      dispatch(GetEmployeeLeaveDetailAction());
      dispatch(GetTotalUserAction());
      dispatch(GetAttendanceDataAction(currentDate));
      dispatch(FetchAllUserProfileAction());
      dispatch(GetLeavePolicyAction());
      dispatch(GetOfficeShiftsAction());
    } catch (error) {
      console.error("Error fetching HR dashboard data", error);
    }
  }, []);

  return (
    <Container fluid className="dashboard-container">
      <div className="dashboard-topbar">
        <Row className="align-items-center justify-content-between">
          <Col>
            <h3 className="dashboard-heading text-center">
              Welcome to HR Dashboard
            </h3>
          </Col>
          <Col xs="auto" className="notification">
            <Link to="/notification">
              <IoIosNotifications className="notification-icon" />
            </Link>
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
        <Col xs={12} className="dashboard-col">
          <Card className="dashboard-card">
            <MarkAttendance userName={userName} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HrDashboard;
