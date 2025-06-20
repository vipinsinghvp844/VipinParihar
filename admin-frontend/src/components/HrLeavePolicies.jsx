import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Table, Button, Container, Row, Col } from 'react-bootstrap';
import './HrLeavePolicies.css';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import LoaderSpiner from "./LoaderSpiner";

const LeavePolicies = () => {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [form, setForm] = useState({
    leave_type: '',
    leave_days: '',
    leave_year: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeavePolicies();
  }, []);

  const fetchLeavePolicies = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_LEAVE_POLICIES}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
        },
      });
      // Convert leave_year to a date format if necessary
      const formattedPolicies = response.data.map((policy) => ({
        ...policy,
        leave_year: policy.leave_year ? format(parseISO(policy.leave_year), 'yyyy-MM-dd') : '',
      }));
      setLeavePolicies(formattedPolicies);
    } catch (error) {
      console.error('Error fetching leave policies:', error);
    } finally { 
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`${import.meta.env.VITE_API_LEAVE_POLICIES}/${editId}`, form, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
          },
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_LEAVE_POLICIES}`, form, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
          },
        });
      }
      setForm({
        leave_type: '',
        leave_days: '',
        leave_year: '',
      });
      setEditMode(false);
      setEditId(null);
      toast.success("Leave Policy Add Succesfully");
      fetchLeavePolicies();
    } catch (error) {
      console.error('Error saving leave policy:', error);
    }
  };

  const handleEdit = (policy) => {
    setForm({
      leave_type: policy.leave_type,
      leave_days: policy.leave_days,
      leave_year: format(parseISO(policy.leave_year), 'yyyy-MM-dd'),
    });
    setEditMode(true);
    setEditId(policy.id);
    toast.update("Leave policy updated")
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_LEAVE_POLICIES}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authtoken')}`,
        },
      });
      fetchLeavePolicies();
      toast.delete("Leave Policy Deleted Successfully")
    } catch (error) {
      console.error('Error deleting leave policy:', error);
    }
  };

  return (
    <Container className="leave-policies-container">
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i
            className="bi bi-arrow-left-circle"
            onClick={() => window.history.back()}
            style={{
              cursor: 'pointer',
              fontSize: '32px',
              color: '#343a40',
            }}
          ></i>
        </Col>
        <Col md={9}>
          <h3 className="mt-2">Add Leave Policy</h3>
        </Col>
      </Row>

      <Row>
        <Form className="leave-policies-form" onSubmit={handleSubmit}>
          <Form.Group controlId="leaveType">
            <Form.Label>Leave Type:</Form.Label>
            <Form.Control
              type="text"
              name="leave_type"
              value={form.leave_type}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="leaveDays">
            <Form.Label>Leave Days:</Form.Label>
            <Form.Control
              type="number"
              name="leave_days"
              value={form.leave_days}
              onChange={handleChange}
              min="1" // Ensure positive numbers
              required
            />
          </Form.Group>

          <Form.Group controlId="leaveYear">
            <Form.Label>Leave Year:</Form.Label>
            <Form.Control
              type="date"
              name="leave_year"
              value={form.leave_year}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {editMode ? 'Update' : 'Add'} Leave Policy
          </Button>
        </Form>
      </Row>

      <Row>
        <h3>Existing Leave Policies</h3>
        <Table className="leave-policies-table" striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Leave Type</th>
              <th>Leave Days</th>
              <th>Leave Year</th>
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
            ) : leavePolicies.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <h4>No Leave Policy </h4>
                </td>
              </tr>
            ) : (
            leavePolicies.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.id}</td>
                <td>{policy.leave_type}</td>
                <td>{policy.leave_days}</td>
                <td>{policy.leave_year}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(policy)}>
                    Edit
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(policy.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </Table>
      </Row>
    </Container>
  );
};

export default LeavePolicies;
