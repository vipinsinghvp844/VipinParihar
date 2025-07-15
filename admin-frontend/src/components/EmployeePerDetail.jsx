import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Alert,
  Row,
  Col,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { useParams } from "react-router-dom";

const EmployeePerDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [modalTitle, setModalTitle] = useState("");

  // Fetch employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/get-user-by-id/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            },
          }
        );
        setEmployee(response.data.data);
      } catch (err) {
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle edit button click
  const handleEdit = (section) => {
    setEditData(employee);
    setModalTitle(`Edit ${section}`);
    setShowModal(true);
  };

  // Save changes
  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/auth/updateuser/${id}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Refresh data after update
      const response = await axios.get(
        `http://localhost:5000/api/auth/get-user-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      setEmployee(response.data.data);
      setShowModal(false);
    } catch (err) {
      setError("Failed to save changes");
    }
  };

  // Update edit data when form fields change
  const handleChange = (e, path) => {
    const value = e.target.value;
    const keys = path.split(".");

    setEditData((prev) => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (loading) return <Spinner animation="border" className="m-5" />;
  if (error)
    return (
      <Alert variant="danger" className="m-5">
        {error}
      </Alert>
    );
  if (!employee)
    return (
      <Alert variant="warning" className="m-5">
        Employee not found
      </Alert>
    );

  return (
    <Container className="p-4">
      {/* Header with back button */}
      <Row className="mb-4 align-items-center">
        <Col xs="auto">
          <Button variant="light" onClick={() => window.history.back()}>
            <i className="bi bi-arrow-left"></i> Back
          </Button>
        </Col>
        <Col>
          <h2>Employee Details</h2>
        </Col>
      </Row>

      {/* Basic Info Section */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Basic Information</h5>
          <Button size="sm" onClick={() => handleEdit("Basic Info")}>
            Edit
          </Button>
        </Card.Header>
        <Card.Body>
          <DetailRow
            label="First Name"
            value={employee.personalInfo?.firstname}
          />
          <DetailRow
            label="Last Name"
            value={employee.personalInfo?.lastname}
          />
          <DetailRow label="Username" value={employee.username} />
          <DetailRow label="Email" value={employee.email} />
          <DetailRow label="Mobile" value={employee.personalInfo?.mobile} />
          <DetailRow
            label="Address"
            value={employee.additionalInfoDetail?.address}
          />
          <DetailRow label="Date of Birth" value={employee.personalInfo?.dob} />
        </Card.Body>
      </Card>

      {/* Employment Info Section */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Employment Information</h5>
          <Button size="sm" onClick={() => handleEdit("Employment Info")}>
            Edit
          </Button>
        </Card.Header>
        <Card.Body>
          <DetailRow
            label="Designation"
            value={employee.employmentInfo?.designation}
          />
          <DetailRow
            label="Department"
            value={employee.employmentInfo?.department}
          />
          <DetailRow
            label="Employment Type"
            value={employee.employmentInfo?.emloyeementType}
          />
          <DetailRow
            label="Date of Joining"
            value={employee.employmentInfo?.dateOfJoining}
          />
          <DetailRow label="Salary" value={employee.employmentInfo?.salary} />
        </Card.Body>
      </Card>

      {/* Bank Details Section */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Bank Details</h5>
          <Button size="sm" onClick={() => handleEdit("Bank Details")}>
            Edit
          </Button>
        </Card.Header>
        <Card.Body>
          <DetailRow label="Bank Name" value={employee.bankDetails?.bankName} />
          <DetailRow
            label="Account Number"
            value={employee.bankDetails?.accountNumber}
          />
          <DetailRow label="Branch" value={employee.bankDetails?.bankBranch} />
          <DetailRow label="IFSC Code" value={employee.bankDetails?.IFSC} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5>Additional Information</h5>
          <Button size="sm" onClick={() => handleEdit("Additional Info")}>
            Edit
          </Button>
        </Card.Header>
        <Card.Body>
          <DetailRow
            label="Graduation Year"
            value={employee.additionalInfoDetail?.graduationYear}
          />
          <DetailRow
            label="Previous Employer"
            value={employee.additionalInfoDetail?.previousEmpName}
          />
          <DetailRow
            label="Date of Leaving"
            value={employee.additionalInfoDetail?.dateOfLeaving}
          />
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {modalTitle === "Edit Basic Info" && (
              <>
                <FormField
                  label="First Name"
                  value={editData.personalInfo?.firstname || ""}
                  onChange={(e) => handleChange(e, "personalInfo.firstname")}
                />
                <FormField
                  label="Last Name"
                  value={editData.personalInfo?.lastname || ""}
                  onChange={(e) => handleChange(e, "personalInfo.lastname")}
                />
                <FormField
                  label="Username"
                  value={editData.username || ""}
                  onChange={(e) => handleChange(e, "username")}
                />
                <FormField
                  label="Email"
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => handleChange(e, "email")}
                />
              </>
            )}

            {modalTitle === "Edit Employment Info" && (
              <>
                <FormField
                  label="Designation"
                  value={editData.employmentInfo?.designation || ""}
                  onChange={(e) =>
                    handleChange(e, "employmentInfo.designation")
                  }
                />
                <FormField
                  label="Department"
                  value={editData.employmentInfo?.department || ""}
                  onChange={(e) => handleChange(e, "employmentInfo.department")}
                />
                <FormField
                  label="Salary"
                  type="number"
                  value={editData.employmentInfo?.salary || ""}
                  onChange={(e) => handleChange(e, "employmentInfo.salary")}
                />
              </>
            )}

            {modalTitle === "Edit Bank Details" && (
              <>
                <FormField
                  label="Bank Name"
                  value={editData.bankDetails?.bankName || ""}
                  onChange={(e) => handleChange(e, "bankDetails.bankName")}
                />
                <FormField
                  label="Account Number"
                  value={editData.bankDetails?.accountNumber || ""}
                  onChange={(e) => handleChange(e, "bankDetails.accountNumber")}
                />
              </>
            )}

            {modalTitle === "Edit Additional Info" && (
              <>
                <FormField
                  label="Graduation Year"
                  value={editData.additionalInfoDetail?.graduationYear || ""}
                  onChange={(e) =>
                    handleChange(e, "additionalInfoDetail.graduationYear")
                  }
                />
                <FormField
                  label="Previous Employer"
                  value={editData.additionalInfoDetail?.previousEmpName || ""}
                  onChange={(e) =>
                    handleChange(e, "additionalInfoDetail.previousEmpName")
                  }
                />
                <FormField
                  label="Date of Leaving"
                  value={editData.additionalInfoDetail?.dateOfLeaving || ""}
                  onChange={(e) =>
                    handleChange(e, "additionalInfoDetail.dateOfLeaving")
                  }
                />
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Helper component for displaying detail rows
const DetailRow = ({ label, value }) => (
  <p>
    <strong>{label}:</strong> {value || "-"}
  </p>
);

// Helper component for form fields
const FormField = ({ label, type = "text", value, onChange }) => (
  <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type={type} value={value} onChange={onChange} />
  </Form.Group>
);

export default EmployeePerDetail;
