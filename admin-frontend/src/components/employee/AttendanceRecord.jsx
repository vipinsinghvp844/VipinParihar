import React, { useState, useEffect } from "react";
import { Table, Container, Row, Col, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { GetAttendanceDataActionById } from "../../../redux/actions/EmployeeDetailsAction";
import LoaderSpiner from "../common/LoaderSpiner";

// Utility function to format time in HH:MM format
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  return `${padZero(hours)}:${padZero(mins)}`;
};

const padZero = (num) => num.toString().padStart(2, "0");

const CustomDropdown = ({ title, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Button onClick={() => setIsOpen(!isOpen)} variant="secondary">
        {title}
      </Button>
      {isOpen && (
        <div className="dropdown-menu show">
          {options.map((option, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AttendanceRecord = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const userId = localStorage.getItem("user_id");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // const { TotalAttendance } = useSelector(
  //   ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  // );

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

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const data = await dispatch(
          GetAttendanceDataActionById(selectedMonth, selectedYear)
        );

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

        setAttendanceData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAttendanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, selectedMonth, selectedYear]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const months = [...Array(12).keys()].map((month) => month + 1);
  const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i);

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
          <h3 className="mt-2">
            Attendance Records for {selectedMonth}/{selectedYear}
          </h3>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col className="d-flex justify-content-end">
          <CustomDropdown
            title={`Select Month: ${selectedMonth}`}
            options={months}
            onSelect={handleMonthChange}
          />
          <CustomDropdown
            title={`Select Year: ${selectedYear}`}
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

export default AttendanceRecord;
