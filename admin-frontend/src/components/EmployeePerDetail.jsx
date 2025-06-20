import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Alert,
  Col,
  Row,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom"; // Assuming you're using React Router for navigation
import { useDispatch, useSelector } from "react-redux";

const EmployeePerDetail = () => {
  const { id } = useParams(); // Get employee ID from URL parameters
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [basicInfo, setBasicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentEditData, setCurrentEditData] = useState({});
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState(""); // To determine which type of data is being edited
  const dispatch = useDispatch();
  const {
    TotalUsers,
    TotalAttendance,
    TotalEmployeeInLeave,
    GetEmployeeInfoAll,
  } = useSelector(({ EmployeeDetailReducers }) => EmployeeDetailReducers);
  // console.log(GetEmployeeInfoAll, "GetEmployeeInfoAll=====================");

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_PERSONAL_INFO}/${id}`
        );
        // console.log(response.data);

        // const data = response.data;
        // if (data.date_of_leaving !== "0000-00-00") {
        //   data.status = "Inactive";
        // } else {
        //   data.status = "Active";
        // }
        setEmployeeDetails(response.data);
        // console.log("Employee Details:", response.data);
      } catch (error) {
        setError("Error fetching employee details.");
        console.error("Error fetching employee details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  useEffect(() => {
    const fetchBasicDetails = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_CUSTOM_USERS}/${id}`
        );
        setBasicInfo(response.data);
        // console.log("Basic Info:", response.data);
      } catch (error) {
        setError("Error fetching basic info.");
        console.error("Error fetching basic info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBasicDetails();
  }, [id]);

  const handleEdit = (data, title, type) => {
    setCurrentEditData(data);
    setModalTitle(title);
    setModalType(type);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === "Basic Info") {
        await axios.put(
          `${import.meta.env.VITE_API_CUSTOM_USERS}/${id}`,
          currentEditData
        );
      } else if (
        (modalType === "Personal Information", "Bank Details", "Other Details")
      ) {
        // if (currentEditData.date_of_leaving !== "0000-00-00") {
        //   currentEditData.status = "Inactive";
        // } else {
        //   currentEditData.status = "Active";
        // }
        await axios.put(
          `${import.meta.env.VITE_API_PERSONAL_INFO}/${id}`,
          currentEditData
        );
      }

      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving data:", error);
      setError("Error saving data.");
    }
  };

  // if (loading) return <p>Loading...</p>;
  // if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="p-5">
      <Row className="mb-4">
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
        <Col md={10}>
          <h3 className="mt-2">Employee Details</h3>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Basic Info</Card.Title>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    handleEdit(basicInfo, "Edit Basic Info", "Basic Info")
                  }
                >
                  Edit
                </Button>
              </div>
              {basicInfo ? (
                <>
                  <Card.Text>
                    <strong>First Name:</strong> {basicInfo.first_name}
                  </Card.Text>
                  <Card.Text>
                    <strong>Last Name:</strong> {basicInfo.last_name}
                  </Card.Text>
                  <Card.Text>
                    <strong>Employee Username:</strong> {basicInfo.username}
                  </Card.Text>
                  <Card.Text>
                    <strong>Employee Email:</strong> {basicInfo.email}
                  </Card.Text>
                  <Card.Text>
                    <strong>Employee Mobile:</strong> {basicInfo.mobile}
                  </Card.Text>
                  <Card.Text>
                    <strong>Employee Address:</strong> {basicInfo.address}
                  </Card.Text>
                  <Card.Text>
                    <strong>Employee DOB:</strong> {basicInfo.dob}
                  </Card.Text>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Spinner />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Personal Information</Card.Title>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    handleEdit(
                      employeeDetails,
                      "Edit Personal Information",
                      "Personal Information"
                    )
                  }
                >
                  Edit
                </Button>
              </div>
              {employeeDetails ? (
                <>
                  <Card.Text>
                    <strong>Position:</strong> {employeeDetails.position}
                  </Card.Text>
                  <Card.Text>
                    <strong>Department:</strong> {employeeDetails.department}
                  </Card.Text>
                  <Card.Text>
                    <strong>Duty Type:</strong> {employeeDetails.duty_type}
                  </Card.Text>
                  <Card.Text>
                    <strong>Date of Joining:</strong>{" "}
                    {employeeDetails.date_of_joining}
                  </Card.Text>
                  <Card.Text>
                    <strong>Salary:</strong> {employeeDetails.basic_salary}
                  </Card.Text>
                  <Card.Text>
                    <strong>Date of Leaving:</strong>{" "}
                    {employeeDetails.date_of_leaving}
                  </Card.Text>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Spinner />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Bank Details</Card.Title>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    handleEdit(
                      employeeDetails,
                      "Edit Bank Details",
                      "Bank Details"
                    )
                  }
                >
                  Edit
                </Button>
              </div>
              {employeeDetails ? (
                <>
                  <Card.Text>
                    <strong>Bank Name:</strong> {employeeDetails.name_of_bank}
                  </Card.Text>
                  <Card.Text>
                    <strong>Name in Bank:</strong>{" "}
                    {employeeDetails.name_in_bank}
                  </Card.Text>
                  <Card.Text>
                    <strong>Account Number:</strong>{" "}
                    {employeeDetails.account_number}
                  </Card.Text>
                  <Card.Text>
                    <strong>Branch:</strong> {employeeDetails.branch}
                  </Card.Text>
                  <Card.Text>
                    <strong>IFSC Code:</strong> {employeeDetails.ifsc_code}
                  </Card.Text>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Spinner />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Others</Card.Title>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    handleEdit(
                      employeeDetails,
                      "Edit Other Details",
                      "Other Details"
                    )
                  }
                >
                  Edit
                </Button>
              </div>
              {employeeDetails ? (
                <>
                  <Card.Text>
                    <strong>Employment Type:</strong>{" "}
                    {employeeDetails.employment_type}
                  </Card.Text>
                  <Card.Text>
                    <strong>Graduation Subject:</strong>{" "}
                    {employeeDetails.graduation_subject}
                  </Card.Text>
                  <Card.Text>
                    <strong>Graduation Year:</strong>{" "}
                    {employeeDetails.graduation_year}
                  </Card.Text>
                  <Card.Text>
                    <strong>Previous Employer Name:</strong>{" "}
                    {employeeDetails.previous_employer_name}
                  </Card.Text>
                  <Card.Text>
                    <strong>Professional Course Subject:</strong>{" "}
                    {employeeDetails.professional_course_subject}
                  </Card.Text>
                  <Card.Text>
                    <strong>Professional Course Year:</strong>{" "}
                    {employeeDetails.professional_course_year}
                  </Card.Text>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <Spinner />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {modalType === "Basic Info" && basicInfo && (
              <>
                <Form.Group controlId="first_name">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.first_name || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        first_name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="last_name">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.last_name || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        last_name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="username">
                  <Form.Label>Employee Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.username || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        username: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="email">
                  <Form.Label>Employee Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={currentEditData.email || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        email: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="mobile">
                  <Form.Label>Employee Mobile</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.mobile || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        mobile: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="address">
                  <Form.Label>Employee Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.address || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        address: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="dob">
                  <Form.Label>Employee DOB</Form.Label>
                  <Form.Control
                    type="date"
                    value={currentEditData.dob || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        dob: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </>
            )}
            {modalType === "Personal Information" && employeeDetails && (
              <>
                <Form.Group controlId="position">
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.position || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        position: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="department">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.department || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        department: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="duty_type">
                  <Form.Label>Duty Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.duty_type || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        duty_type: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="date_of_joining">
                  <Form.Label>Date of Joining</Form.Label>
                  <Form.Control
                    type="date"
                    value={currentEditData.date_of_joining || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        date_of_joining: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="basic_salary">
                  <Form.Label>Salary</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentEditData.basic_salary || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        basic_salary: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="status">
                  {/* <Form.Label>Status</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.status || ''}
                    readOnly // Make this field read-only to prevent manual changes
                  /> */}
                </Form.Group>
                <Form.Group controlId="date_of_leaving">
                  <Form.Label>Date of Leaving</Form.Label>
                  <Form.Control
                    type="date"
                    value={currentEditData.date_of_leaving || ""}
                    onChange={(e) => {
                      const newDateOfLeaving = e.target.value;
                      setCurrentEditData({
                        ...currentEditData,
                        date_of_leaving: newDateOfLeaving,
                        // status: newDateOfLeaving ? "Inactive" : "Active" // Automatically update status
                      });
                    }}
                  />
                </Form.Group>
              </>
            )}
            {modalType === "Bank Details" && employeeDetails && (
              <>
                <Form.Group controlId="name_of_bank">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.name_of_bank || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        name_of_bank: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="name_in_bank">
                  <Form.Label>Name in Bank</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.name_in_bank || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        name_in_bank: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="account_number">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.account_number || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        account_number: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="branch">
                  <Form.Label>Branch</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.branch || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        branch: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="ifsc_code">
                  <Form.Label>IFSC Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.ifsc_code || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        ifsc_code: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </>
            )}
            {modalType === "Other Details" && employeeDetails && (
              <>
                <Form.Group controlId="employment_type">
                  <Form.Label>Employment Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.employment_type || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        employment_type: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="graduation_subject">
                  <Form.Label>Graduation Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.graduation_subject || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        graduation_subject: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="graduation_year">
                  <Form.Label>Graduation Year</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.graduation_year || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        graduation_year: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="previous_employer_name">
                  <Form.Label>Previous Employer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.previous_employer_name || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        previous_employer_name: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="professional_course_subject">
                  <Form.Label>Professional Course Subject</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.professional_course_subject || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        professional_course_subject: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="professional_course_year">
                  <Form.Label>Professional Course Year</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentEditData.professional_course_year || ""}
                    onChange={(e) =>
                      setCurrentEditData({
                        ...currentEditData,
                        professional_course_year: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmployeePerDetail;
