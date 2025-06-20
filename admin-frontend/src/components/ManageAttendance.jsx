import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Alert,
  Spinner,
  Row,
  Col,
  Offcanvas,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import AddAttendance from "./AddAttendance";
import LoaderSpiner from "./LoaderSpiner";
import "./ManageAttendance.css"; // Import the custom CSS file
import { useDispatch, useSelector } from "react-redux";

const ManageAttendance = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Items to show per page
  const [employees, setEmployees] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState("false");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const dispatch = useDispatch();
  const { TotalUsers, TotalAttendance, TotalEmployeeInLeave } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        // const response = await axios.get(
        //   `${import.meta.env.VITE_API_CUSTOM_USERS}`
        // );
        const employeeUsers = TotalUsers.filter(
          (user) => user.role === "employee" || user.role === "hr"
        );
        // console.log(employeeUsers, "======check hr");

        setEmployees(employeeUsers);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setErrorMessage("Failed to fetch employees.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAttendanceDetails = async (userId) => {
    try {
      // const response = await axios.get(
      //   `${import.meta.env.VITE_API_CUSTOM_USERS}/${userId}`, {
      //     headers: {
      //       Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
      //     }
      //   }
      // );
      navigate(`/employee-attendance/${userId}`, {
        state: {
          attendanceDetails: employees,
        },
      });
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      setErrorMessage("Failed to fetch attendance details.");
    }
  };
  const handlePersonalDetails = async (userId) => {
    try {
      // const response = await axios.get(
      //   `${import.meta.env.VITE_API_CUSTOM_USERS}/${userId}`
      // );
      navigate(`/personal-detail/${userId}`, {
        state: {
          personalDetails: employees,
        },
      });
    } catch (error) {
      console.error("Error fetching personal details:", error);
      setErrorMessage("Failed to fetch personal details.");
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = employees.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  // console.log(totalPages, "pagepage");

  return (
    <Container className="manage-attendance-container">
      <Row className="mb-4 mt-2 d-flex align-items-center">
        <Col xs={2} md={1}>
          <i
            className="bi bi-arrow-left-circle back-icon"
            onClick={() => window.history.back()}
          ></i>
        </Col>
        <Col xs={8} md={9} className="text-center text-md-left">
          <h3 className="mt-2">Manage Attendance</h3>
        </Col>
        <Col xs={12} md={2} className="text-right text-md-left">
          <Button variant="primary" onClick={handleShow}>
            Add Attendance
          </Button>
          <Offcanvas show={show} onHide={handleClose} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Add Attendance</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <AddAttendance />
            </Offcanvas.Body>
          </Offcanvas>
        </Col>
      </Row>
      <Row className="check">
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center">
            <LoaderSpiner animation="border" />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>No.</th>
                <th>User ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((employee, index) => (
                <tr key={employee.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{employee.id}</td>
                  <td>{employee.first_name}</td>
                  <td>{employee.last_name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.mobile}</td>
                  <td>{employee.role}</td>
                  <td>
                    <Button
                      variant="info"
                      className="action-button"
                      onClick={() => handlePersonalDetails(employee.id)}
                      title="View Personal Report"
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="info"
                      className="action-button"
                      onClick={() => handleAttendanceDetails(employee.id)}
                      title="View Attendance Report"
                    >
                      <i className="bi bi-calendar-check"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <div>
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index + 1}
              variant="light"
              className={`page-button ${
                currentPage === index + 1 ? "active" : ""
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </Row>
    </Container>
  );
};

export default ManageAttendance;
