import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const ApplyLeave = () => {
  const initialFormData = {
    start_date: "",
    end_date: "",
    paid_leave_days: 0,
    unpaid_leave_days: 0,
    reason_for_leave: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]:
        name === "paid_leave_days" || name === "unpaid_leave_days"
          ? Number(value)
          : value,
    };

    if (
      name === "start_date" ||
      name === "paid_leave_days" ||
      name === "unpaid_leave_days"
    ) {
      const { start_date, paid_leave_days, unpaid_leave_days } = {
        ...formData,
        ...updatedData,
      };
      if (start_date) {
        const total = Number(paid_leave_days) + Number(unpaid_leave_days) - 1;
        const end = new Date(start_date);
        end.setDate(end.getDate() + total);
        updatedData.end_date = end.toISOString().split("T")[0];
      }
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user_name = localStorage.getItem("user_name");
    const user_id = localStorage.getItem("user_id");

    if (!user_id || !user_name) {
      return toast.error("User not logged in.");
    }
    const today = new Date().toISOString().split("T")[0];
    const {
      start_date,
      end_date,
      paid_leave_days,
      unpaid_leave_days,
      reason_for_leave,
    } = formData;
    if (new Date(start_date) < new Date(today))
      return toast.info("Start date cannot be in the past.");
    if (new Date(start_date) > new Date(end_date))
      return toast.info("Start date must be before end date.");

    const payload = {
      username: user_name,
      apply_date: today,
      ...formData,
      status: "submitted",
      hr_note: "",
    };

    try {
      const response = await axios.post("http://localhost:5000/api/leave/add-leave", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      });
      toast.success("Leave request submitted successfully.");
     setFormData(initialFormData);

    } catch (err) {
      console.error(err);
      toast.error(err.response.data?.message || "Failed to apply leave");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col md={1}>
          <i
            className="bi bi-arrow-left-circle"
            onClick={() => window.history.back()}
            style={{ cursor: "pointer", fontSize: "32px", color: "#343a40" }}
          ></i>
        </Col>
        <Col md={9}>
          <h3 className="mt-2">Apply Leave</h3>
        </Col>
      </Row>

      <Card>
        <Card.Header as="h3" className="text-center">
          Leave Request
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>
                Paid Leave
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="number"
                  name="paid_leave_days"
                  min="0"
                  value={formData.paid_leave_days}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>
                Unpaid Leave
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="number"
                  name="unpaid_leave_days"
                  min="0"
                  value={formData.unpaid_leave_days}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>
                Start Date
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>
                End Date
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  readOnly
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={4}>
                Reason for Leave
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  as="textarea"
                  name="reason_for_leave"
                  rows={3}
                  value={formData.reason_for_leave}
                  onChange={handleChange}
                  required
                />
              </Col>
            </Form.Group>

            <Form.Group className="text-center">
              <Button variant="primary" type="submit">
                Submit Request
              </Button>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ApplyLeave;
