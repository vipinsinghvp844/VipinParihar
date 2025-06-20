import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
const AdminAddEmpLeave = () => {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveDays, setLevaDays] = useState({
    unpaidLeave: 0,
    paidLeave: 0,
  });
  const [reasonForLeave, setReasonForLeave] = useState("");
  const { TotalUsers } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  const formatEndDate = (value, paidLeave, unpaidLeave) => {
  let selectedDate = new Date(value);
  let totalLeaveDays = (Number(paidLeave) || 0) + (Number(unpaidLeave) || 0) - 1;
  selectedDate.setDate(selectedDate.getDate() + totalLeaveDays);
  return selectedDate.toISOString().split("T")[0];
};
  const currentDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    setDate(currentDate);

    const storedUserRole = localStorage.getItem("role");
    setUserRole(storedUserRole || "");

    const fetchEmployees =  () => {
      try {
        const employeeUsers = TotalUsers?.filter(
          (user) => user.role === "employee" || user.role === "hr"
        );
        setEmployees(employeeUsers || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleUserSelection = async (employee) => {
    setUserName(employee.username);
    setUserId(employee.id);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    let employeeId = userId;
    const currentUserRole = localStorage.getItem("role");
    e.preventDefault();
   if (userRole !== "employee" && localStorage.getItem("role") === "hr") {
     toast.info("Admin can only add leaves for employees.");
     return;
   }
    try {
      const payload = {
        user_id: employeeId,
        user_name: userName,
        apply_date: currentDate,
        start_date: startDate,
        end_date: endDate,
        reason_for_leave: reasonForLeave,
        total_leave_days:
          (parseInt(leaveDays?.paidLeave) || 0) +
          (parseInt(leaveDays?.unpaidLeave) || 0),
        paid_leave_days: parseInt(leaveDays?.paidLeave) || 0,
        status: "Pending",
        actions: "Submitted",
        hr_note: "",
      };

      await axios.post(`${import.meta.env.VITE_API_LEAVE}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      });
      // setMessage("leave added successfully!");
      toast.success("Leave added successfully!");
      // Reset the form
      setUserName("");
      setUserId("");
      setShowDropdown(false);
    } catch (error) {
      setMessage("Error adding leaves. Please try again.");
      console.error("Error adding leaves:", error);
    }
  };
  

  return (
    <Container className="add-attendance-container">
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
        <Col md={8}>
          <h3 className="mt-2">Add Leave Request</h3>
        </Col>
      </Row>
      {message && <Alert variant="info">{message}</Alert>}
      <Form onSubmit={handleSubmit} style={{ overflow: "hidden" }}>
        <Form.Group controlId="formUserName">
          <Form.Label>User Name</Form.Label>
          <div className="dropdown-wrapper">
            <Form.Control
              type="text"
              placeholder="Click to select user name"
              value={userName}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              readOnly
              // onChange={(e) => setUserName(e.target.value)}
              // onClick={() => setShowDropdown(!showDropdown)}
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
          <Form.Label column sm={4}>
            Paid Leave
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="number"
              min="0"
              value={leaveDays?.paidLeave}
              onChange={(e) => {
                e.preventDefault();
                let value = e.target.value.trim()
                  ? parseInt(e.target.value, 10)
                  : 0;

                if (!isNaN(value) && value >= 0) {
                  setLevaDays((prev) => ({
                    ...prev,
                    paidLeave: value,
                  }));
                }
                if (startDate) {
                  let formattedEndDate = formatEndDate(
                    startDate,
                    value,
                    leaveDays?.unpaidLeave
                  );
                  if (formattedEndDate) {
                    setEndDate(formattedEndDate);
                  }
                }
              }}
              required
            />
          </Col>
          <Form.Label column sm={4}>
            Unpaid Leave
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="number"
              min="0"
              value={leaveDays?.unpaidLeave}
              onChange={(e) => {
                e.preventDefault();
                const value = parseInt(e.target.value, 10) || 0;
                if (value >= 0) {
                  setLevaDays((prev) => ({
                    ...prev,
                    unpaidLeave: value,
                  }));
                }

                if (startDate) {
                  let formattedEndDate = formatEndDate(
                    startDate,
                    leaveDays?.paidLeave,
                    value
                  );
                  setEndDate(formattedEndDate);
                }
              }}
              required
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="startDate" className="mb-3">
          <Form.Label column sm={4}>
            Start Date
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => {
                let formattedEndDate = formatEndDate(
                  e.target.value,
                  leaveDays?.paidLeave,
                  leaveDays?.unpaidLeave
                );
                setEndDate(formattedEndDate);
                setStartDate(e.target.value);
              }}
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="endDate" className="mb-3">
          <Form.Label column sm={4}>
            End Date
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              readOnly
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="reasonForLeave" className="mb-3">
          <Form.Label column sm={4}>
            Reason for Leave
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              as="textarea"
              rows={3}
              value={reasonForLeave}
              onChange={(e) => setReasonForLeave(e.target.value)}
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="text-center">
          <Col>
            <Button variant="primary" type="submit">
              Submit Request
            </Button>
          </Col>
        </Form.Group>
      </Form>
    </Container>
  );
};

export default AdminAddEmpLeave;
