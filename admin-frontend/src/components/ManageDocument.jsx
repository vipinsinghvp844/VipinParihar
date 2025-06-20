import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import jsPDF from 'jspdf';

function ManageDocument() {
  const [users, setUsers] = useState([]); 
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "edit" or "preview"
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_CUSTOM_USERS, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      });
      const filteredUsers = response.data.filter(
        (user) => user.role === "employee" || user.role === "hr"
      );
      setUsers(filteredUsers);
    } catch (error) {
      setStatus("Error fetching users.");
    }
  };

  const handleEdit = (user, documentType) => {
    fetchDocumentData(user.id, documentType, "edit");
  };

  const handlePreview = (user, documentType) => {
    fetchDocumentData(user.id, documentType, "preview");
  };
  const handleDownload = (userId, documentType) => { 
   axios
     .get(`${import.meta.env.VITE_API_LETTER}/${userId}/${documentType}`, {
       headers: {
         Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
       },
     })
     .then((response) => {
       // Let's assume response.data contains the HTML or text content
       const doc = new jsPDF();
       doc.text(20, 20, response.data); // Insert the text into PDF

       // Download the PDF
       doc.save(`${documentType}.pdf`);
     })
     .catch((error) => {
       setStatus("Error downloading document.");
       console.error("Error downloading document:", error);
     });
  }

  const handleDelete = (userId, documentType) => {
    axios
      .delete(`${import.meta.env.VITE_API_LETTER}/${userId}/${documentType}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      })
      .then(() => {
        setStatus("Document deleted successfully.");
        // Optionally, refresh the user list or remove the document from UI
      })
      .catch((error) => {
        setStatus("Error deleting document.");
      });
  };

  const fetchDocumentData = async (userId, documentType, actionType) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LETTER}/${userId}/${documentType}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      // console.log("Fetched document data:", response.data); // Debugging
      setSelectedDocument({ userId, documentType });
      setDocumentContent(response.data || ""); // Ensure content is set
      setModalType(actionType);
      setShowModal(true);
    } catch (error) {
      setStatus("Error fetching document data.");
      console.error("Error fetching document data:", error); // Debugging
    }
  };
  const handleSaveChanges = async () => {
    // console.log("Selected Document:", selectedDocument); // Debugging
    // console.log("Document Content:", documentContent); // Debugging

    if (
      !selectedDocument ||
      !selectedDocument.userId ||
      !selectedDocument.documentType ||
      !documentContent
    ) {
      setStatus(
        "Missing parameters: userId, documentType, or documentContent."
      );
      return;
    }

    try {
      const url = `${import.meta.env.VITE_API_LETTER}/${
        selectedDocument.userId
      }/${selectedDocument.documentType}`;
      // console.log("PUT request URL:", url); // Debugging

      await axios.put(
        url,
        { content: documentContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
            "Content-Type": "application/json", // Ensure content type is set
          },
        }
      );
      setStatus("Document updated successfully.");
      fetchUsers(); // Refresh the list to reflect changes
      closeModal();
    } catch (error) {
      setStatus("Error updating document.");
      console.error(
        "Error updating document:",
        error.response ? error.response.data : error.message
      ); // Debugging
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
    setDocumentContent("");
  };

  return (
    <Container>
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
        <Col md={7}>
          <h3 className="mt-2">Manage Document</h3>
        </Col>
        <Col className="text-center mt-3">
          <Button href="/offer-letter">Add Offer</Button>
          <Button href="/experience-letter">Add Experience</Button>
          <Button href="/noc-letter">Add NOC</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>No.</th>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Offer Letter</th>
                <th>Experience Letter</th>
                <th>NOC</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <i
                      className="bi bi-pencil-square"
                      onClick={() => handleEdit(user, "offer_letter")}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-eye"
                      onClick={() => handlePreview(user, "offer_letter")}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-trash"
                      onClick={() => handleDelete(user.id, "offer_letter")}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <button onClick={() => handleDownload(user.id, "offer_letter")}>Download</button>
                  </td>
                  <td>
                    <i
                      className="bi bi-pencil-square"
                      onClick={() => handleEdit(user, "experience_letter")}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-eye"
                      onClick={() => handlePreview(user, "experience_letter")}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-trash"
                      onClick={() => handleDelete(user.id, "experience_letter")}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </td>
                  <td>
                    <i
                      className="bi bi-pencil-square"
                      onClick={() => handleEdit(user, "noc")}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-eye"
                      onClick={() => handlePreview(user, "noc")}
                      style={{ cursor: "pointer" }}
                    ></i>
                    <i
                      className="bi bi-trash"
                      onClick={() => handleDelete(user.id, "noc")}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      {status && <div className="mt-3">{status}</div>}

      {/* Modal for Edit/Preview */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "edit" ? "Edit Document" : "Preview Document"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "edit" ? (
            <Form>
              <Form.Group controlId="formDocumentContent">
                <Form.Label>Document Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={20} // Adjust this based on your content size
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                />
              </Form.Group>
            </Form>
          ) : (
            <div>
              <pre>{documentContent}</pre>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          {modalType === "edit" && (
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageDocument;
