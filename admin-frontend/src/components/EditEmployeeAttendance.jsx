import React, { useState, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { GetTotalUserAction } from "../../redux/actions/EmployeeDetailsAction";
import { toast } from "react-toastify";

const EditEmployeeAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [prevAttendance, setPrevAttendance] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await dispatch(GetTotalUserAction());
        const employeeUsers = response.filter(
          (user) => user.role === "employee" || user.role === "hr"
        );
        setEmployees(employeeUsers);
      } catch (error) {
        console.error("Error fetching employees", error);
      }
    };
    fetchEmployees();
  }, [dispatch]);

  const formatAttendanceData = (data) => {
    let attendanceData = {
      clock_in: "",
      clock_in_record_id: "",
      break_in: "",
      break_in_record_id: "",
      break_out: "",
      break_out_record_id: "",
      clock_out: "",
      clock_out_record_id: "",
    };

    data.forEach((entry) => {
      switch (entry.type) {
        case "clock_in":
          attendanceData.clock_in = entry.time;
          attendanceData.clock_in_record_id = entry.id;
          break;
        case "break_in":
          attendanceData.break_in = entry.time;
          attendanceData.break_in_record_id = entry.id;
          break;
        case "break_out":
          attendanceData.break_out = entry.time;
          attendanceData.break_out_record_id = entry.id;
          break;
        case "clock_out":
          attendanceData.clock_out = entry.time;
          attendanceData.clock_out_record_id = entry.id;
          break;
        default:
          break;
      }
    });

    return attendanceData;
  };

  const fetchUserAttendance = async (userId, date) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_ATTENDANCE}`,
        {
          params: { user_id: userId, date },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      setAttendance(formatAttendanceData(response.data));
      setPrevAttendance(formatAttendanceData(response.data));
    } catch (error) {
      console.error("Error fetching attendance", error);
    }
  };

  const handleUserSelection = async (employee) => {
    setUserName(employee.username);
    setUserId(employee.id);
    setShowDropdown(false);
    if (date) {
      await fetchUserAttendance(employee.id, date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateRequests = [];
    const updatedTypes = [];

    if (attendance.clock_in_record_id && attendance.clock_in !==prevAttendance.clock_in) {
      updateRequests.push({
        user_id: userId,
        record_id: attendance.clock_in_record_id,
        time: attendance.clock_in,
      });
      updatedTypes.push("Check_in");
    }
    if (attendance.break_in_record_id && attendance.break_in !==prevAttendance.break_in) {
      updateRequests.push({
        user_id: userId,
        record_id: attendance.break_in_record_id,
        time: attendance.break_in,
      });
      updatedTypes.push("Break_in");
    }
    if (
      attendance.break_out_record_id &&
      attendance.break_out !== prevAttendance.break_out
    ) {
      updateRequests.push({
        user_id: userId,
        record_id: attendance.break_out_record_id,
        time: attendance.break_out,
        type: "break_out",
      });
      updatedTypes.push("Break_out");
    }
    if (
      attendance.clock_out_record_id &&
      attendance.break_out !== prevAttendance.clock_out
    ) {
      updateRequests.push({
        user_id: userId,
        record_id: attendance.clock_out_record_id,
        time: attendance.clock_out,
        type: "clock_out",
      });
      updatedTypes.push("Check_out");
    }
    if (updateRequests.length === 0) {
      toast.info("No changes detected!");
      return;
    }

    try {
      await Promise.all(
        updateRequests.map((payload) =>
          axios.put(`${import.meta.env.VITE_API_ATTENDANCE}`, payload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          })
        )
      );
      toast.success(`${updatedTypes.join(", ")} Attendance updated successfully!`);
    } catch (error) {
      console.error("Error updating attendance", error);
    }
  };

  return (
    <Container className="edit-attendance-container">
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formUserName">
          <Form.Label>User Name</Form.Label>
          <div className="dropdown-wrapper">
            <Form.Control
              type="text"
              placeholder="Click to select user"
              value={userName}
              readOnly
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
            onChange={(e) => {
              setDate(e.target.value);
              if (userId) fetchUserAttendance(userId, e.target.value);
            }}
            required
          />
        </Form.Group>
        <Form.Group controlId="formClockIn">
          <Form.Label>Clock In</Form.Label>
          <Form.Control
            type="time"
            value={attendance.clock_in || ""}
            onChange={(e) =>
              setAttendance({ ...attendance, clock_in: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="formBreakIn">
          <Form.Label>Break In</Form.Label>
          <Form.Control
            type="time"
            value={attendance.break_in || ""}
            onChange={(e) =>
              setAttendance({ ...attendance, break_in: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="formBreakOut">
          <Form.Label>Break Out</Form.Label>
          <Form.Control
            type="time"
            value={attendance.break_out || ""}
            onChange={(e) =>
              setAttendance({ ...attendance, break_out: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="formClockOut">
          <Form.Label>Clock Out</Form.Label>
          <Form.Control
            type="time"
            value={attendance.clock_out || ""}
            onChange={(e) =>
              setAttendance({ ...attendance, clock_out: e.target.value })
            }
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Update Attendance
        </Button>
      </Form>
    </Container>
  );
};
export default EditEmployeeAttendance;
