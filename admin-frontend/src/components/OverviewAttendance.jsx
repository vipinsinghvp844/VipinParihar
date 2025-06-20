import React, { useState, useEffect } from "react";
import {
  Table,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Button,
  Offcanvas,
} from "react-bootstrap";
import LoaderSpiner from "./LoaderSpiner";
import { useDispatch, useSelector } from "react-redux";
import { GetAttendanceDataActionByDate } from "../../redux/actions/EmployeeDetailsAction";
import EditEmployeeAttendance from "./EditEmployeeAttendance";
function OverviewAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const currentDate = new Date().toISOString().split("T")[0]; // Format to YYYY-MM-DD
  const [isLoading, setIsLoading] = useState("false");
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    setIsLoading(true);
    try {
      const data = await dispatch(GetAttendanceDataActionByDate());

      const todayRecord = data.filter((record) => record.date === currentDate);

      const combinedData = todayRecord.reduce((acc, record) => {
        let userRecord = acc.find(
          (item) => item.user_id === record.user_id && item.date === record.date
        );

        if (!userRecord) {
          userRecord = {
            user_id: record.user_id,
            user_name: record.user_name,
            date: record.date,
            clock_in: "N/A",
            clock_out: "N/A",
            break_in: "N/A",
            break_out: "N/A",
            total_break_time: 0,
          };
          acc.push(userRecord);
        }

        switch (record.type) {
          case "clock_in":
            userRecord.clock_in = convertTo12HourFormat(record.time);
            break;
          case "clock_out":
            userRecord.clock_out = convertTo12HourFormat(record.time);
            break;
          case "break_in":
            userRecord.break_in = convertTo12HourFormat(record.time);
            break;
          case "break_out":
            userRecord.break_out = convertTo12HourFormat(record.time);
            break;
          default:
            break;
        }

        if (record.type === "break_out" && userRecord.break_in !== "N/A") {
          const breakDuration =
            (new Date(`1970-01-01T${record.time}Z`) -
              new Date(`1970-01-01T${userRecord.break_in}Z`)) /
            1000 /
            60; // duration in minutes
          userRecord.total_break_time += breakDuration;
        }

        return acc;
      }, []);

      setAttendanceRecords(combinedData);
      // setLoading(false);
    } finally {
      setIsLoading(false); // Set loading to false after fetching
    }
  };
  function convertTo12HourFormat(time24) {
    if (!time24) return "--:--"; // Handle null/undefined input gracefully
    let [hours, minutes, seconds] = time24.split(":"); // Split the time string
    hours = parseInt(hours, 10);

    const period = hours >= 12 ? "PM" : "AM"; // Determine AM or PM
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight

    return `${hours}:${minutes} ${period}`;
  }

  return (
    <Container className="my-4">
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i
            className="bi bi-arrow-left-circle"
            onClick={() => window.history.back()}
            style={{
              cursor: "pointer",
              fontSize: "32px",
              color: "#343a40",
            }}
          ></i>
        </Col>
        <Col md={9}>
          <h3 className="mt-2">Today Attendance</h3>
        </Col>
        <Col md={2}>
          <Button onClick={handleShow}>Edit Ateendance</Button>
        </Col>
        <Offcanvas show={show} onHide={handleClose} placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Edit Attendance</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <EditEmployeeAttendance />
          </Offcanvas.Body>
        </Offcanvas>
      </Row>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>No.</th>
            <th> ID</th>
            <th>Date</th>
            <th>Name</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Break In</th>
            <th>Break Out</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr className="">
              <td colSpan="9" className="text-center">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
                >
                  <LoaderSpiner />
                </div>
              </td>
            </tr>
          ) : attendanceRecords.length > 0 ? (
            attendanceRecords.map((record, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{record.user_id}</td>
                <td>{record.date}</td>
                <td>{record.user_name || "N/A"}</td>
                <td>{record.clock_in}</td>
                <td>{record.clock_out}</td>
                <td>{record.break_in}</td>
                <td>{record.break_out}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No Today Attendance
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default OverviewAttendance;
