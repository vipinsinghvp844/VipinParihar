import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoaderSpiner from "./LoaderSpiner";

function EmDocuments() {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDocuments();
  }, []);

  const userId = localStorage.getItem('user_id');

  const fetchDocuments = async () => {
    setIsLoading(true);
    
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_LETTER}/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      }
    );
    setDocuments(response.data);
  } catch (error) {
    if (error.response && error.response.status === 403) {
      setStatus("You do not have permission to view these documents.");
    } else {
      // setStatus("No document Available");
      toast.info(`No document Available`);
    }
  } finally {
    setIsLoading(false);
  }
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
        <Col md={9}>
          <h3 className="mt-2">Employee Documents</h3>
        </Col>
      </Row>
      {/* {status && <p className="text-danger">{status}</p>} */}
      <Table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Description</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="3" className="text-center">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
                >
                  <LoaderSpiner />
                </div>
              </td>
            </tr>
          ) : documents.length > 0 ? (
            documents.map((doc, index) => (
              <React.Fragment key={index}>
                {doc.offer_letter && (
                  <tr>
                    <td>Offer Letter</td>
                    <td>Offer of Employment for the position of Developer.</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleDownload(doc.offer_letter, "Offer_Letter")
                        }
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                )}
                {doc.experience_letter && (
                  <tr>
                    <td>Experience Letter</td>
                    <td>Experience letter details.</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleDownload(
                            doc.experience_letter,
                            "Experience_Letter"
                          )
                        }
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                )}
                {doc.noc && (
                  <tr>
                    <td>NOC</td>
                    <td>No Objection Certificate details.</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleDownload(doc.noc, "NOC")}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No document available
              </td>
            </tr>
          )}
        </tbody> 
      </Table>
    </Container>
  );

  function handleDownload(content, fileName) {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName}.txt`;
    document.body.appendChild(element);
    element.click();
  }
}

export default EmDocuments;
