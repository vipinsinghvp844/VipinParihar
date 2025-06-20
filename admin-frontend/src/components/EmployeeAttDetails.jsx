import React, { useState, useEffect } from "react";
import { Table, Container, Row, Col, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import LoaderSpiner from "./LoaderSpiner";
import { useParams } from "react-router-dom";
import axios from "axios";

const padZero = (num) => num.toString().padStart(2, "0");

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);

  return `${padZero(hours)}:${padZero(mins)}`;
};

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
const EmployeeAttendance = () => {
  const { userId } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const convertTo12Hour = (time24) => {
    let [hours, minutes] = time24.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
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
           }/${userId}/?month=${formattedMonth}&year=${selectedYear}`,
           {
             headers: {
               Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
             },
           }
         );

         const sortedData = data.data.sort(
           (a, b) => new Date(b.date) - new Date(a.date)
         );

         const combinedData = sortedData.reduce((acc, record) => {
           let userRecord = acc.find(
             (item) =>
               item.user_id === record.user_id && item.date === record.date
           );

           if (!userRecord) {
             userRecord = {
               user_id: record.user_id,
               user_name: record.user_name,
               date: record.date,
               clock_in: "N/A",
               clock_out: "N/A",
               total_work: "0.00",
               breaks: [], // Har break ko alag list me store karenge
             };
             acc.push(userRecord);
           }

           switch (record.type) {
             case "clock_in":
               userRecord.clock_in = convertTo12Hour(record.time);
               break;
             case "clock_out":
               userRecord.clock_out = convertTo12Hour(record.time);
               userRecord.total_work = formatDuration(record.total_work);
               break;
             case "break_in":
               userRecord.breaks.push({
                 break_in: convertTo12Hour(record.time),
                 break_out: "N/A",
                 total_break: "N/A",
               });
               break;
             case "break_out":
               let lastBreak = userRecord.breaks.find(
                 (b) => b.break_out === "N/A"
               );
               if (lastBreak) {
                 lastBreak.break_out = convertTo12Hour(record.time);
                 lastBreak.total_break = formatDuration(record.total_break);
               }
               break;
             default:
               break;
           }

           return acc;
         }, []);

         // Har user ke breaks ko time-wise sort karein (ascending order)
         combinedData.forEach((record) => {
           record.breaks.sort(
             (a, b) => new Date(a.break_in) - new Date(b.break_in)
           );
         });

         setAttendanceData(combinedData);
       } catch (error) {
         console.error("Error fetching data:", error);
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
          <h3 className="mt-2">Attendance Records for {userId}</h3>
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
              <th>Total Break</th>
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
                    <td>{record.user_name}</td>
                    <td>{record.clock_in}</td>
                    <td>{record.clock_out}</td>
                    <td>{record.total_work}</td>
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
                                <td>{breakItem.total_break}</td>
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
                  No attendance records found for this user.
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
