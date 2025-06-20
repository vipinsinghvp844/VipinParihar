import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Table,
} from "react-bootstrap";
import "./HrManageHolidays.css";
import { GetHolidayAction } from "../../redux/actions/EmployeeDetailsAction";
import { useDispatch, useSelector } from "react-redux";
import LoaderSpiner from "./LoaderSpiner";


const ManageHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({
    holiday_name: "",
    holiday_date: "",
    description: "",
    holiday_type: "Public Holiday",
    repeat_annually: false,
  });
   const [isLoading, setIsLoading] = useState(true); // Loading state
  const [showModal, setShowModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const userRole = localStorage.getItem("role");
  const dispatch = useDispatch();
  const { TotalHolidays } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      // const response = await axios.get(`${import.meta.env.VITE_API_HOLIDAYS}`, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
      //   }
      // });
      const response = await dispatch(GetHolidayAction());
      // console.log(response, '=====getHoliday');
      setHolidays(response);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewHoliday((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_HOLIDAYS}`,
        newHoliday, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          }
        }
      );
      // console.log('Holiday added:', response.data);
      fetchHolidays();
      setNewHoliday({
        holiday_name: "",
        holiday_date: "",
        description: "",
        holiday_type: "Public Holiday",
        repeat_annually: false,
      });
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const handleUpdateHoliday = async (id, updatedHoliday) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_HOLIDAYS}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          }
        },
        updatedHoliday
      );
      // console.log('Holiday updated:', response.data);
      fetchHolidays();
    } catch (error) {
      console.error("Error updating holiday:", error);
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_HOLIDAYS}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          }
        }
      );
      // console.log('Holiday deleted:', response.data);
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  const openModal = (holiday) => {
    setSelectedHoliday(holiday);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedHoliday(null);
    setShowModal(false);
  };

  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedHoliday((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveModalChanges = () => {
    if (selectedHoliday) {
      handleUpdateHoliday(selectedHoliday.id, selectedHoliday);
    }
    closeModal();
  };

  return (
    <Container className="manage-holidays-container">
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
          <h3 className="mt-2">Add Holidays</h3>
        </Col>
      </Row>
      <Form className="manage-holidays-form" onSubmit={handleAddHoliday}>
        <Row>
          <Col>
            <Form.Group controlId="holidayName">
              <Form.Label>Holiday Name</Form.Label>
              <Form.Control
                type="text"
                name="holiday_name"
                value={newHoliday.holiday_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="holidayDate">
              <Form.Label>Holiday Date</Form.Label>
              <Form.Control
                type="date"
                name="holiday_date"
                value={newHoliday.holiday_date}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={newHoliday.description}
            onChange={handleChange}
          />
        </Form.Group>
        <Row>
          <Col>
            <Form.Group controlId="holidayType">
              <Form.Label>Holiday Type</Form.Label>
              <Form.Control
                as="select"
                name="holiday_type"
                value={newHoliday.holiday_type}
                onChange={handleChange}
              >
                <option value="Public Holiday">Public Holiday</option>
                <option value="Company Holiday">Company Holiday</option>
                <option value="Other">Other</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="repeatAnnually">
              <Form.Label>Repeat Annually</Form.Label>
              <Form.Check
                type="checkbox"
                name="repeat_annually"
                checked={newHoliday.repeat_annually}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit">
          Add Holiday
        </Button>
      </Form>

      <h2>Holiday List</h2>
      <div className="manage-holidays-table">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Holiday Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "100px" }}
                  >
                    <LoaderSpiner />
                  </div>
                </td>
              </tr>
            ) : holidays.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <h4>No Holidays Available</h4>
                </td>
              </tr>
            ) : (
              holidays.map((holiday, index) => (
                <tr key={holiday.id}>
                  <td>{index + 1}</td>
                  <td>{holiday.holiday_date}</td>
                  <td>{holiday.holiday_name}</td>
                  <td>{holiday.holiday_type}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => openModal(holiday)}
                    >
                      Update
                    </Button>
                    {userRole !== "hr" && (
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteHoliday(holiday.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Update Holiday</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHoliday && (
            <Form>
              <Form.Group controlId="modalHolidayName">
                <Form.Label>Holiday Name</Form.Label>
                <Form.Control
                  type="text"
                  name="holiday_name"
                  value={selectedHoliday.holiday_name}
                  onChange={handleModalChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="modalHolidayDate">
                <Form.Label>Holiday Date</Form.Label>
                <Form.Control
                  type="date"
                  name="holiday_date"
                  value={selectedHoliday.holiday_date}
                  onChange={handleModalChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="modalDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={selectedHoliday.description}
                  onChange={handleModalChange}
                />
              </Form.Group>
              <Form.Group controlId="modalHolidayType">
                <Form.Label>Holiday Type</Form.Label>
                <Form.Control
                  as="select"
                  name="holiday_type"
                  value={selectedHoliday.holiday_type}
                  onChange={handleModalChange}
                >
                  <option value="Public Holiday">Public Holiday</option>
                  <option value="Company Holiday">Company Holiday</option>
                  <option value="Other">Other</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="modalRepeatAnnually">
                <Form.Label>Repeat Annually</Form.Label>
                <Form.Check
                  type="checkbox"
                  name="repeat_annually"
                  checked={selectedHoliday.repeat_annually}
                  onChange={handleModalChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={saveModalChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageHolidays;
