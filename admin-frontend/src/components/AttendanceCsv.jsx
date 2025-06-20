import React, { useState, useEffect } from 'react';
import { Table, Form, Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isWithinInterval, isSunday} from 'date-fns';
import './AttendanceCsv.css';
import { useSelector } from 'react-redux';

const AttendanceCsv = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth()); // Default to current month
  const [year, setYear] = useState(new Date().getFullYear()); // Default to current year
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { TotalUsers, TotalAttendance } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = TotalUsers;
        const employeeUsers = response.filter(
          (user) => user.role === "employee" || user.role === "hr"
        );
        setEmployees(employeeUsers);
      } catch (error) {
        console.log('Error fetching employee data', error);
      }
    };

    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_GET_ATTENDANCE
          }?month=${month}&year=${year}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        setAttendance(response.data);
      } catch (error) {
        console.log('Error fetching attendance data', error);
      }
    };
 
    const fetchLeaveData = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_LEAVE, {
          params: { month: month + 1, year }, // Adjust month for API
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
          },
        });
        setLeaves(response.data);
      } catch (error) {
        console.log('Error fetching leave data', error);
      }
    };

    const fetchHolidays = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_HOLIDAYS, {
          params: { year }, // Adjust year for API
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
          },
        });
        setHolidays(response.data);
      } catch (error) {
        console.log('Error fetching holiday data', error);
      }
    };

    fetchEmployeeData();
    fetchAttendanceData();
    fetchLeaveData();
    fetchHolidays();
  }, [month, year]);
  

  const employeeList = Array.isArray(employees) ? employees : [];
  const attendanceList = Array.isArray(attendance) ? attendance : [];
  const leaveList = Array.isArray(leaves) ? leaves : [];
  const holidaysList = Array.isArray(holidays) ? holidays : [];

  // Get the first and last day of the selected month
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));

  // Generate an array of dates for the selected month
  const datesInMonth = eachDayOfInterval({ start, end });

  // Function to determine week-offs for the month
  const getWeekOffs = () => {
    const weekOffs = new Set();
    // let nextSaturdayIsWeekOff = false;
// console.log(weekOffs);
    datesInMonth.forEach(date => {
      if (isSunday(date)) {
        weekOffs.add(format(date, 'yyyy-MM-dd'));
      } 
    });

    return weekOffs;
  };


  const weekOffs = getWeekOffs();

  // Function to get attendance status for a given employee and date
  function getAttendanceStatus(employeeId, date) {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');

    // Check for attendance record
   const isPresent = attendanceList.some(
     (entry) =>
       entry.user_id === employeeId.toString() &&
       entry.date === formattedDate &&
       entry.type === "clock_in"
   );

   if (isPresent) return "P";

    // Check for holiday
    const isHoliday = holidaysList.some(
      (holiday) => holiday.holiday_date === formattedDate
    );

    if (isHoliday) {
      return 'H'; // Return 'H' if the date is a holiday
    }

    // Check if the date is a week-off
    if (weekOffs.has(formattedDate)) {
      return 'WO'; // 'W' for Week-Off
    }

    // Check for leave record
    const leaveRecord = leaveList.find(
      (entry) =>
        entry.user_id.toString() === employeeId.toString() &&
        entry.status === "Accept" &&
        entry.leave_type === "Paid Leave" &&
        entry.start_date &&
        entry.end_date &&
        isWithinInterval(new Date(formattedDate), {
          start: new Date(entry.start_date),
          end: new Date(entry.end_date),
        })
    );
    
     const leaveRecordUnpaid = leaveList.find(
       (entry) =>
         entry.user_id.toString() === employeeId.toString() && // Ensure same type
         entry.status === "Accept" &&
         entry.leave_type === "Unpaid Leave" &&
         entry.start_date && // Ensure date exists
         entry.end_date &&
         isWithinInterval(new Date(formattedDate), {
           start: new Date(entry.start_date),
           end: new Date(entry.end_date),
         })
     );
    
    

    if (leaveRecord) {

      return 'PL'; // Return 'L' if there is an accepted leave record for the date
    }
   else if (leaveRecordUnpaid) {
      return 'UL'
    }

    // Default to Absent if no record found
    return 'A';
  }

  // Function to calculate totals for present, absent, leave, and holiday days
  const calculateTotals = (employeeId) => {
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;
    let weekOffCount = 0;

    datesInMonth.forEach(date => {
      const status = getAttendanceStatus(employeeId, date);
      if (status === 'P') {
        presentCount++;
      } else if (status === 'A') {
        absentCount++;
      } else if (status === 'PL' || status === 'UL') {
        leaveCount++;
      } else if (status === 'H') {
        holidayCount++;
      } else if (status === 'WO') {
        weekOffCount++;
      }
    });

    return { presentCount, absentCount, leaveCount, holidayCount, weekOffCount };
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };


  return (
    <Container fluid className={isFullScreen ? 'fullscreen' : ''}>
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i className="bi bi-arrow-left-circle" onClick={() => window.history.back()} style={{
          cursor: "pointer",
          fontSize: "32px",
          color: "#343a40",
        }}></i>
        </Col>
        <Col md={9} >
          <h3 className="mt-2">Total Attendance Overview </h3>
        </Col>
        </Row>
      <Row className="my-3">
        <Col xs={12} md={3}>
          <Form.Group controlId="selectMonth">
            <Form.Label>Select Month:</Form.Label>
            <Form.Control as="select" value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{format(new Date(0, i), 'MMMM')}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col xs={12} md={3}>
          <Form.Group controlId="selectYear">
            <Form.Label>Select Year:</Form.Label>
            <Form.Control as="select" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))}>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={year - 5 + i}>{year - 5 + i}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col xs={12} md={6} className='d-flex align-items-end justify-content-end'>
        <div className='text-end'>
      <Button variant="primary" onClick={handleToggleFullScreen}>
        {isFullScreen ? <i className="bi bi-fullscreen-exit"></i> : <i className="bi bi-fullscreen"></i>}
          </Button>
          </div>
        </Col>
      </Row>
      <Row>
      <Table responsive bordered className="text-center mt-3">
        <thead>
          <tr>
            <th>Emp-ID</th>
            <th>Emp-Name</th>
            {datesInMonth.map(date => (
              <th key={date} colSpan="1">{format(date, 'd')}</th>
            ))}
            <th>Total Days</th>
            <th>Abs-<br/>ent</th>
            <th>Le-<br/>ave</th>
            <th>Pre-<br/>sent</th>
            <th>Holi-<br/>days</th>
            <th>Wk-Offs</th>
          </tr>
          <tr>
            <th colSpan="2"></th>
            {datesInMonth.map(date => (
              <th key={date} colSpan="1" className="fontsizetest">{format(date, 'EEE')}</th>
            ))}
            <th colSpan="6"></th>
          </tr>
        </thead>
        <tbody>
          {employeeList.map(employee => {
            const totals = calculateTotals(employee.id);
            return (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.username}</td>
                {datesInMonth.map(date => {
                  const formattedDate = format(date, 'yyyy-MM-dd');
                  const status = getAttendanceStatus(employee.id, formattedDate);
                  return (
                    <td
                      key={date}
                      className={
                        status === "P"
                          ? "bg-success text-white coustomclass"
                          : status === "A"
                          ? "bg-danger text-white coustomclass"
                          : status === "PL"
                          ? "bg-warning text-dark coustomclass"
                          : status === "UL"
                          ? "bg-info text-dark coustomclass"
                          : status === "H"
                          ? "bg-info text-white coustomclass"
                          : status === "WO"
                          ? "bg-secondary text-white coustomclass"
                          : "ram"
                      }
                    >
                      {status}
                    </td>
                  );
                })}
                <td>{datesInMonth.length}</td>
                <td>{totals.absentCount}</td>
                <td>{totals.leaveCount}</td>
                <td>{totals.presentCount}</td>
                <td>{totals.holidayCount}</td>
                <td>{totals.weekOffCount}</td>
              </tr>
            );
          })}
        </tbody>
        </Table>
        </Row>
    </Container>
  );
};

export default AttendanceCsv;
