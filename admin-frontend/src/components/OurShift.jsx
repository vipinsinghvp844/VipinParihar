import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import LoaderSpiner from "./LoaderSpiner";

function OurShift() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
const padZero = (num) => num.toString().padStart(2, "0");

  const convertTo12Hour = (time24) => {
    let [hours, minutes] = time24.split(":").map(Number);
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${padZero(hours)}:${padZero(minutes)} ${period}`;
  };
  
  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_SHIFTS}`);
      setShifts(response.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container className="my-4">
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
          <h3 className="mt-2">Office Shifts</h3>
        </Col>
      </Row>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Shift Name</th>
              <th>Office In Time</th>
              <th>Office Out Time</th>
              <th>Total office Time</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px" }}
                  >
                    <LoaderSpiner />
                  </div>
                </td>
              </tr>
            ) : shifts.length > 0 ? (
            shifts.map((shift) => (
              <tr key={shift.id}>
                <td>{shift.shift_name}</td>
                <td>{convertTo12Hour(shift.start_time)}</td>
                <td>{convertTo12Hour(shift.end_time)}</td>
                <td>{shift.total_time}</td>
                <td>{shift.updated_at}</td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No Attendance Record for this month
                </td>
              </tr>
            )}
          </tbody>
        </Table>
    </Container>
  );
}

export default OurShift;
