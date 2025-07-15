import React, { useState, useEffect } from "react";
import { Table, Button, Container, Alert, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import EditEmployee from "./EditEmployee";
import ToggleButton from "./ToggleButton";
import LoaderSpiner from "./LoaderSpiner";
import "./AllEmpDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GetTotalUserAction } from "../../redux/actions/EmployeeDetailsAction";
import { FetchAllUserProfileAction } from "../../redux/actions/dev-aditya-action";

const AllEmpDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);

 const placeholderImage = import.meta.env.VITE_PLACEHOLDER_IMAGE;
  const dispatch = useDispatch();

  const { AllProfilesImage = { profile: [] } } = useSelector(({ AllReducers }) => AllReducers);
  const { TotalUsers } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  useEffect(() => {
    dispatch(FetchAllUserProfileAction());
  }, [dispatch]);
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await dispatch(GetTotalUserAction());
        setEmployees(response?.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [dispatch]);

  const getProfileImage = (userId) => {
    const profile = AllProfilesImage?.profile?.find((item) => item.user_id === userId);
    return profile?.profile_image || placeholderImage; };

  const handleEditClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployeeId(null);
  };

  const toggleUserStatus = async (employeeId, currentState) => {
    const newState = currentState === "active" ? "inactive" : "active";
    const confirmToggle = window.confirm(
      `Are you sure you want to set the user state to ${newState}?`
    );

    if (confirmToggle) {
      try {
        await axios.put(
          `http://localhost:5000/api/auth/updateuser/${employeeId}`,
          { user_state: newState },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );

        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp._id === employeeId ? { ...emp, user_state: newState } : emp
          )
        );

        toast.success(`User state set to ${newState}.`);
      } catch (error) {
        console.error("Error updating user state:", error);
        toast.error("Error updating user state");
      }
    }
  };

  const userRole = localStorage.getItem("role");
  return (
      <Container className="all-emp-details">
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
            <h3 className="mt-2">All Employee Details</h3>
          </Col>
          <Col className="text-right">
            {(userRole === "admin" || userRole === "hr") && (
              <Link to={"/add-employee"}>
                <Button variant="warning" className="add-employee-button">
                  Add Employee
                </Button>
              </Link>
            )}
          </Col>
        </Row>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>No.</th>
              <th>Profile</th>
              <th>First Name</th>
              <th>DOB</th>
              <th>Address</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>UState</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px" }}
                  >
                    <LoaderSpiner />
                  </div>
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <tr key={employee._id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={getProfileImage(employee._id)}
                      alt={`Profile of ${employee.personalInfo.firstname}`}
                      className="popup-profile-image"
                      style={{ objectFit: "cover" }}
                    />
                  </td>
                  <td>{employee.personalInfo.firstname}</td>
                  <td>{employee.personalInfo.dob}</td>
                  <td>{employee?.additionalInfoDetail?.address}</td>
                  <td>{employee.email}</td>
                  <td>{employee.personalInfo.mobile}</td>
                  <td>{employee.role}</td>
                  <td>
                    <ToggleButton
                      checked={employee.user_state === "active"}
                      onToggle={() =>
                        toggleUserStatus(employee._id, employee.user_state)
                      }
                    />
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => handleEditClick(employee._id)}
                      className="edit-button"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <EditEmployee
          employeeId={selectedEmployeeId}
          show={showEditModal}
          handleClose={handleCloseEditModal}
        />
      </Container>
  );
};

export default AllEmpDetails;
