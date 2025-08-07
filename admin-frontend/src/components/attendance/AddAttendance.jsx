import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Container } from "react-bootstrap";
import axios from "axios";
import "./AddAttendance.css"; // Import the CSS file
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddAttendance = ({ currentUserRole }) => {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasClockedIn, setHasClockedIn] = useState(false);
   const { TotalUsers } = useSelector(
     ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  // console.log(TotalUsers, "TotalUsers======");
  

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setDate(currentDate);

    const storedUserRole = localStorage.getItem("role");
    setUserRole(storedUserRole || "");

    const fetchEmployees = async () => {
      try {
        const response = TotalUsers;
        const employeeUsers = response.filter(user => user.role === "employee" || user.role === "hr");
        setEmployees(employeeUsers);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

 const checkUserAttendance = async (userId, date) => {
   try {
     const response = await axios.get(`${import.meta.env.VITE_API_ATTENDANCE}`, {
       params: { user_id: userId, date },
       headers: {
         Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
       },
     }
     );

     const hasClockIn = response.data.some(record => record.type === "clock_in");
     setHasClockedIn(hasClockIn);
   } catch (error) {
     if (error.response && error.response.status === 404) {
       setHasClockedIn(false);
      //  console.log("No attendance found for this user and date.");
     } else {
       console.error("Error checking attendance:", error);
     }
   }
};

  const handleUserSelection = async (employee) => {
    setUserName(employee.username);
    setUserId(employee.id);
    setShowDropdown(false);
    
    await checkUserAttendance(employee.id, date); // Ensure state is updated before rendering
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentUserRole === "hr" && userRole !== "employee") {
      setMessage("HR can only add attendance for employees.");
      return;
    }
    try {
      const payload = {
        user_id: userId,
        user_name: userName,
        date,
        time: hasClockedIn ? clockOutTime : clockInTime,
        type: hasClockedIn ? "clock_out" : "clock_in",
      };

      await axios.post(`${import.meta.env.VITE_API_ATTENDANCE}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      });
      // setMessage("Attendance added successfully!");
      toast.success("Attendance added successfully!");
      // Reset the form
      setUserName("");
      setUserId("");
      setClockInTime("");
      setClockOutTime("");
      setHasClockedIn(false);
      setShowDropdown(false); // Hide dropdown after successful submission
    } catch (error) {
      toast.error("Error adding attendance. Please try again.");
      // setMessage("Error adding attendance. Please try again.");
      console.error("Error adding attendance:", error);
    }
  };

  return (
    <Container className="add-attendance-container">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formUserName">
          <Form.Label>User Name</Form.Label>
          <div className="dropdown-wrapper">
            <Form.Control
              type="text"
              placeholder="Click to select user name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onClick={() => setShowDropdown(!showDropdown)}
              required
            />
            {showDropdown && (
              <ul className="dropdown-menu">
                {employees.map((employee) => (
                  <li
                    key={employee.id}
                    className="dropdown-item"
                    onClick={() => handleUserSelection(employee)}
                  >
                    {employee.username}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Form.Group>
        <Form.Group controlId="formDate">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>
        {!hasClockedIn ? (
          <Form.Group controlId="formClockInTime">
            <Form.Label>Clock In Time</Form.Label>
            <Form.Control
              type="time"
              value={clockInTime}
              onChange={(e) => setClockInTime(e.target.value)}
              required
            />
          </Form.Group>
        ) : (
          <Form.Group controlId="formClockOutTime">
            <Form.Label>Clock Out Time</Form.Label>
            <Form.Control
              type="time"
              value={clockOutTime}
              onChange={(e) => setClockOutTime(e.target.value)}
              required
            />
          </Form.Group>
        )}
        <Button variant="primary" type="submit" className="submit-button">
          {hasClockedIn ? "Add Check Out Time" : "Add Check In Time"}
        </Button>
      </Form>
    </Container>
  );
};

export default AddAttendance;
