import React, { useState, useEffect } from "react";
import { Table, Container, Row, Col, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import LoaderSpiner from "../common/LoaderSpiner";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import CustomDropdown from "../utils/CustomDropdown";

const padZero = (num) => num.toString().padStart(2, "0");

const EmployeeAttendance = () => {
  const { userId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const monthNames = [
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
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };
  const months = monthNames.map((label, index) => ({
    label,
    value: index + 1,
  }));
  const years = Array.from({ length: 5 }, (_, i) => {
    const y = selectedYear - 2 + i;
    return { label: y.toLocaleString(), value: y };
  });

  const employeeName = location.state?.name || "Employee";
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
  const formattedMonth = selectedMonth.toString().padStart(2, "0");

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const data = await axios.get(
          `${
            import.meta.env.VITE_API_GET_ATTENDANCE
          }?userId=${userId}&month=${formattedMonth}&year=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        const attData = data.data.data;

        const formattedData = attData.map((record) => ({
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

        setAttendanceData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, formattedMonth, selectedYear]);

  return (
    <Container className="border rounded shadow-sm">
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
          <h3 className="mt-2">Attendance Records for {employeeName}</h3>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <CustomDropdown
            title={`Month: ${monthNames[selectedMonth - 1]}`}
            options={months}
            onSelect={handleMonthChange}
          />
          <CustomDropdown
            title={`Year: ${selectedYear}`}
            options={years}
            onSelect={handleYearChange}
          />
        </Col>
      </Row>
      <Row>
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
            ) : attendanceData.length > 0 ? (
              attendanceData.map((record, index) => (
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
      </Row>
    </Container>
  );
};

export default EmployeeAttendance;
