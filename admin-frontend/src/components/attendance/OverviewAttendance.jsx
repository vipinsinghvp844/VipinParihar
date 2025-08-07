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
import LoaderSpiner from "../common/LoaderSpiner";
import { useDispatch, useSelector } from "react-redux";
import { GetAttendanceDataActionByDate } from "../../../redux/actions/EmployeeDetailsAction";
import EditEmployeeAttendance from "../employee/EditEmployeeAttendance";
import CustomDropdown from "../utils/CustomDropdown";

function OverviewAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const dispatch = useDispatch();
  const padZero = (num) => num.toString().padStart(2, "0");
  const [viewDate, setViewDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleDateChange = (date) => {
    setViewDate(date);
  };
  const formatDateReadable = (dateStr) => {
    const months = [
      "jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };
  const dates = [...Array(7).keys()].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const iso = date.toISOString().split("T")[0];
    return {
      value: iso,
      label: formatDateReadable(iso),
    };
  });

  useEffect(() => {
    setIsLoading(true);
    const fetchAttendanceRecords = async () => {
      try {
        const data = await dispatch(GetAttendanceDataActionByDate(viewDate));

        const sortedData = data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        const formattedData = sortedData.map((record) => ({
          user_id: record.user_id,
          username: record.username,
          date: new Date(record.date).toLocaleDateString("en-IN"),
          clock_in: record.clockInTime
            ? convertTo12Hour(new Date(record.clockInTime))
            : "NA",
          clock_out: record.clockOutTime
            ? convertTo12Hour(new Date(record.clockOutTime))
            : "NA",
          total_work: record.totalWork || "0m",
          total_break: record.totalBreak,
          breaks:
            record.breaks?.map((brk) => ({
              break_in: brk.breakInTime
                ? convertTo12Hour(new Date(brk.breakInTime))
                : "N/A",
              break_out: brk.breakOutTime
                ? convertTo12Hour(new Date(brk.breakOutTime))
                : "N/A",
              durations: brk.durations || "0m",
            })) || [],
        }));

        setAttendanceRecords(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAttendanceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [viewDate]);

  const convertTo12Hour = (dateObj) => {
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return "Invalid Time";
    }

    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${padZero(hours)}:${padZero(minutes)} ${period}`;
  };

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
        <Col md={7}>
          <h3 className="mt-2">Today Attendance</h3>
        </Col>
        <Col md={2}>
          <CustomDropdown
            title={`Date: ${formatDateReadable(viewDate)}`}
            options={dates}
            onSelect={handleDateChange}
          />
        </Col>
        <Col md={2}>
          <Button onClick={handleShow}>Edit Attendance</Button>
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
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>User Name</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Total Work</th>
            <th>Break In</th>
            <th>Break Out</th>
            <th>Durations</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
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
              <React.Fragment key={index}>
                <tr>
                  <td>{record.date}</td>
                  <td>{record.username}</td>
                  <td>{record.clock_in}</td>
                  <td>{record.clock_out}</td>
                  <td>{record.total_work || 0}</td>
                  <td colSpan="3">
                    {record.breaks.length === 0 ? (
                      "No Breaks"
                    ) : (
                      <Table bordered size="sm">
                        <tbody>
                          {record.breaks.map((breakItem, breakIndex) => (
                            <tr key={breakIndex}>
                              <td>{breakItem.break_in}</td>
                              <td>{breakItem.break_out}</td>
                              <td>{breakItem.durations}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No data available for the selected month and year.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default OverviewAttendance;
