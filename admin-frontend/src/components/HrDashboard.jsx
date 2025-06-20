import React, { useState, useEffect } from "react";
import { Row, Col, Container, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import TodayPresent from "./TodayPresent";
import TodayAbsent from "./TodayAbsent";
import TodayOnLeave from "./TodayOnLeave";
import TotalUsers from "./TotalUsers";
import MarkAttendance from "./MarkAttendance";
import { IoIosNotifications } from "react-icons/io";
import "./HrDashboard.css"; // Import custom CSS for styling
import { useDispatch } from "react-redux";
import {
  GetAttendanceDataAction,
  GetEmployeeLeaveDetailAction,
  GetTotalUserAction,
  GetLeavePolicyAction,
  GetOfficeShiftsAction,
} from "../../redux/actions/EmployeeDetailsAction";
import { FetchAllUserProfileAction } from "../../redux/actions/dev-aditya-action";

const HrDashboard = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [birthdayMessages, setBirthdayMessages] = useState([]);
  const dispatch = useDispatch();
  useEffect(() => {
    const user_name = localStorage.getItem("user_name");

    if (user_name) {
      setUserName(user_name);
    }
  }, []);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (user_id) {
      setUserId(user_id);
    }
    const date = new Date();
    setCurrentDate(date.toISOString().split("T")[0]); // Format to YYYY-MM-DD
    if (userId) {
      // fetchAttendanceRecords(date);
    }
  }, [userId]);


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
      ("Error fetching All Detailed")
    }
  }, []);

  return (
    <Container fluid className="p-3 hr-dashboard-container">
      <div className="topbar">
        <Row className="align-items-center justify-content-between">
          <Col>
            <h3 className="text-center">Welcome to HR Dashboard</h3>
          </Col>
          <Col xs="auto" className="notification">
            <Link to={"/notification"}>
              <IoIosNotifications className="Notificationicon" />
            </Link>
          </Col>
        </Row>
      </div>

      {birthdayMessages.length > 0 && (
        <Card className="text-center shadow-sm border-0 rounded p-3 mt-3">
          {birthdayMessages.map((message, index) => (
            <Alert key={index} variant="success">
              {message}
            </Alert>
          ))}
        </Card>
      )}

      <Row className="g-3 p-3">
        <Col xs={12} md={6} lg={3}>
          <Card className="dashboard-card">
            <TotalUsers setBirthdayMessages={setBirthdayMessages} />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Card className="dashboard-card">
            <TodayPresent />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Card className="dashboard-card">
            <TodayOnLeave />
          </Card>
        </Col>
        <Col xs={12} md={6} lg={3}>
          <Card className="dashboard-card">
            <TodayAbsent />
          </Card>
        </Col>
      </Row>
      <MarkAttendance />
    </Container>
  );
};

export default HrDashboard;
