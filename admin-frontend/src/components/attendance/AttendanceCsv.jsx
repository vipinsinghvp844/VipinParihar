import React, { useState, useEffect } from "react";
import { Table, Form, Container, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import "./AttendanceCsv.css";
import CustomDropdown from "../utils/CustomDropdown";

const AttendanceCsv = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [attendance, setAttendance] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
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

  const exportToCSV = () => {
    if (!attendance.length || daysInMonth === 0) return;

    let csvContent = "Sr No.,Username";

    for (let i = 1; i <= daysInMonth; i++) {
      csvContent += `,${i}`;
    }
    csvContent += ",Total Leave, Total Absent, Total Present\n";

    attendance.forEach((user, index) => {
      let row = `${index + 1},${user.username}`;
      for (let i = 1; i <= daysInMonth; i++) {
        row += `,${user[i] || "-"}`;
      }
      row += `,${user.totalPresent},${user.totalLeave},${user.totalAbsent}`;
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_${selectedMonth}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
  useEffect(() => {
    const fetchAttendanceCSV = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/CSV/get-csv-data?month=${selectedMonth}&year=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        setAttendance(response.data.data);
        setDaysInMonth(response.data.days);
      } catch (error) {
        console.log("Error fetching attendance data", error);
      }
    };

    fetchAttendanceCSV();
  }, [selectedMonth, selectedYear]);

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <>
      <Container fluid className={isFullScreen ? "fullscreen" : ""}>
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
            <h3 className="mt-2">Total Attendance Overview </h3>
          </Col>
        </Row>
        <Row className="mb-3 ">
          <Col className="d-flex justify-content-end">
            <div>
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
            </div>
            <Button variant="primary" onClick={handleToggleFullScreen}>
              {" "}
              {isFullScreen ? (
                <i className="bi bi-fullscreen-exit"></i>
              ) : (
                <i className="bi bi-fullscreen"></i>
              )}{" "}
            </Button>
            <Button
              variant="success"
              className="ms-2"
              onClick={exportToCSV}
              disabled={!attendance.length}
            >
              <i className="bi bi-download"></i> Export CSV
            </Button>
          </Col>
        </Row>
        <Table responsive>
          <thead>
            <tr>
              <th> Sr No. </th>
              <th>User Name</th>
              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i + 1}>{i + 1}</th>
              ))}
              <th>Total Leave</th>
              <th>Total Absent</th>
              <th>Total Present</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user.username}</td>

                {[...Array(daysInMonth)].map((_, day) => (
                  <td
                    key={day + 1}
                    className={
                      user[day + 1] === "P"
                        ? "bg-success text-white"
                        : user[day + 1] === "L"
                        ? "bg-warning"
                        : "bg-danger text-white"
                    }
                  >
                    {user[day + 1] || "-"}
                  </td>
                ))}
                <td className="fw-bold">{user.totalLeave}</td>
                <td className="fw-bold">{user.totalAbsent}</td>
                <td className="fw-bold">{user.totalPresent}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default AttendanceCsv;
