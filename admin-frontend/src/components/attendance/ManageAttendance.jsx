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
import AddAttendance from "../attendance/AddAttendance";
import LoaderSpiner from "../common/LoaderSpiner";
import "./ManageAttendance.css"; // Import the custom CSS file
import { useSelector } from "react-redux";

const ManageAttendance = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [employees, setEmployees] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { TotalUsers } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const employeeUsers = TotalUsers;
        console.log(employeeUsers, "employeeusers");

        setEmployees(employeeUsers);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setErrorMessage("Failed to fetch employees.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [TotalUsers]);

  const handleAttendanceDetails = async (userId) => {
    try {
      const user = employees.find((emp) => emp._id === userId);
      navigate(`/employee-attendance/${userId}`, {
        state: {
          name: user ? user.firstname + " " + user.lastname : "Unknown User",
        },
      });
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      setErrorMessage("Failed to fetch attendance details.");
    }
  };
  const handlePersonalDetails = async (userId) => {
    try {
      navigate(`/personal-detail/${userId}`);
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
            <LoaderSpiner />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>No.</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((employee, index) => {
                const {
                  personalInfo = {},
                  // employmentInfo = {},
                  // bankDetails = {},
                } = employee;
                return (
                  <tr key={employee.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{personalInfo.firstname}</td>
                    <td>{personalInfo.lastname}</td>
                    <td>{employee.email}</td>
                    <td>{personalInfo.mobile}</td>
                    <td>{employee.role}</td>
                    <td>
                      <Button
                        variant="info"
                        className="action-button"
                        onClick={() => handlePersonalDetails(employee._id)}
                        title="View Personal Report"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="info"
                        className="action-button"
                        onClick={() => handleAttendanceDetails(employee._id)}
                        title="View Attendance Report"
                      >
                        <i className="bi bi-calendar-check"></i>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <div>
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "primary" : "light"}
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
