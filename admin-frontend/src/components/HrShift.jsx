import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Col, Container, Row, Table, Button, Modal, Form } from 'react-bootstrap';
import './HrShift.css';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { GetOfficeShiftsAction } from "../../redux/actions/EmployeeDetailsAction";
import LoaderSpiner from "./LoaderSpiner"

function HrShift() {
  const [shifts, setShifts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newShiftName, setNewShiftName] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentShiftId, setCurrentShiftId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { TotalOfficeShifts } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  const dispatch = useDispatch();

  function convertTo12Hour(time24) {
    let [hours, minutes] = time24.split(":");
    let period = "AM";
    if (hours > 12) {
      hours = hours - 12;
      period = "PM";
    } else if (hours == 12) {
      period = "PM";
    } else if (hours == 0) {
      hours = 12;
    }
    return `${hours}:${minutes} ${period}`;
  }

  function convertTo24Hour(time12) {
    let [time, period] = time12.split(" ");
    let [hours, minutes] = time.split(":");

    if (period === "PM" && hours < 12) {
      hours = parseInt(hours) + 12;
    } else if (period === "AM" && hours == 12) {
      hours = "00";
    }

    return `${hours}:${minutes}`;
  }


  const fetchShifts = async () => {
    setIsLoading(true);
      try {
        // const response = TotalOfficeShifts;
        const response = await dispatch(GetOfficeShiftsAction());
        // Convert shift times to 12-hour format before setting state
        const formattedShifts = response.map((shift) => ({
          ...shift,
          start_time: convertTo12Hour(shift.start_time),
          end_time: convertTo12Hour(shift.end_time),
        }));
        setShifts(formattedShifts);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      } finally {
        setIsLoading(false);
      }
    };


  useEffect(() => {
    fetchShifts();
  }, []);

  const onDelete = async (shiftId) => {
    if (
      window.confirm("Are you sure you want to delete this shift permanently?")
    ) {
      deleteShift(shiftId);
      fetchShifts();
    }
  };

  const deleteShift = async (shiftId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_SHIFTS}/${shiftId}`);
      setShifts(shifts.filter((shift) => shift.id !== shiftId));
      toast.success("Shift deleted successfully");
    } catch (error) {
      console.error("Error deleting shift:", error);
    }
  };

  const onUpdate = (shift) => {
    setNewShiftName(shift.shift_name);
    setNewStartTime(shift.start_time);
    setNewEndTime(shift.end_time);
    setCurrentShiftId(shift.id);
    setIsUpdating(true);
    setShowModal(true);
  };

  const handleAddShift = async () => {
    try {
      // Convert new start and end times to 24-hour format for sending to API
      const newShift = {
        shift_name: newShiftName,
        start_time: convertTo24Hour(newStartTime),
        end_time: convertTo24Hour(newEndTime),
      };

      if (isUpdating) {
        await axios.put(
          `${import.meta.env.VITE_API_SHIFTS}/${currentShiftId}`,
          newShift
        );
      } else {
        await axios.post(`${import.meta.env.VITE_API_SHIFTS}`, newShift);
      }

      fetchShifts();
      setShowModal(false);
      setNewShiftName("");
      setNewStartTime("");
      setNewEndTime("");
      setIsUpdating(false);
      setCurrentShiftId(null);
      toast.success("Shift updated successfully");
    } catch (error) {
      toast.error("Error adding/updating shift:", error);
      console.error("Error adding/updating shift:", error);
    }
  };

  return (
    <Container className="hrshift-container">
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
          <h3 className="mt-2">Add Shifts</h3>
        </Col>
      </Row>
      <div className="hrshift-header">
        <h2>Office Shifts</h2>
        <Button className="add-shift-button" onClick={() => setShowModal(true)}>
          Add Shift
        </Button>
      </div>
      <Row>
        <Col>
          <Table striped bordered hover className="hrshift-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Shift Name</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Total Time</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Shift Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ height: "200px" }}
                    >
                      <LoaderSpiner />
                    </div>
                  </td>
                </tr>
              ) : shifts.length > 0 ? (
                shifts.map((shift, index) => (
                  <tr key={shift.id}>
                    <td>{index + 1}</td>
                    <td>{shift.shift_name}</td>
                    <td>{shift.start_time}</td>
                    <td>{shift.end_time}</td>
                    <td>{shift.total_time}</td>
                    <td>{shift.created_at}</td>
                    <td>{shift.updated_at}</td>
                    <td>{shift.shift_status}</td>
                    <td>
                      <Button variant="info" onClick={() => onUpdate(shift)}>
                        Update
                      </Button>{" "}
                      <Button
                        variant="danger"
                        onClick={() => onDelete(shift.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>No shifts found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            {isUpdating ? "Update Shift" : "Add New Shift"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formShiftName">
              <Form.Label>Shift Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter shift name"
                value={newShiftName}
                onChange={(e) => setNewShiftName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formStartTime">
              <Form.Label>Office In Time (e.g., 09:00 AM)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter office in time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formEndTime">
              <Form.Label>Office Out Time (e.g., 05:00 PM)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter office out time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddShift}>
            {isUpdating ? "Update Shift" : "Add Shift"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default HrShift;
