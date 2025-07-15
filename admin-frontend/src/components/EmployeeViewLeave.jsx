import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Row, Col, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import LoaderSpiner from "./LoaderSpiner";
import { toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const EmployeeViewLeave = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [apiLimit, setApiLimit] = useState(10);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [updateRequestId, setUpdateRequestId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const token = localStorage.getItem("authtoken");
  const [leaveData, setLeaveData] = useState({
    start_date: "",
    end_date: "",
    paid_leave_days: 0,
    unpaid_leave_days: 0,
    reason_for_leave: "",
  });
  useEffect(() => {
    fetchLeaveData(page);
  }, [page]);

  const fetchLeaveData = async (currentpage = 1) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/leave/get-leave?page=${currentpage}&limit=${apiLimit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(response.data.data);
      const total = response.data.pagination.totalPages || 1;
      const AlLimit = response.data.pagination.limit || 10;
      setApiLimit(AlLimit);      
      setTotalPages(total);
    } catch (err) {
      toast.error("Error fetching leave data.");
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (event, value) => {
    setPage(value); // MUI provides 1-based page number
  };

  const handleDelete = (id, status) => {
    console.log(status);
    
    if (status !== "submitted") {
      toast.error("Leave already reviewed by HR. Deletion not allowed.");
      return;
    }
    setShowConfirm(true);
    setDeleteRequestId(id);
  };
  const handleUpdate = (id, status) => {
    if (status !== "submitted") {
      toast.error("Leave already reviewed by HR. Updation not allowed.");
      return;
    }
    const leave = requests.find((req) => req._id === id);
    if (leave) {
      setLeaveData({
        start_date: leave.start_date,
        end_date: leave.end_date,
        paid_leave_days: leave.paid_leave_days,
        unpaid_leave_days: leave.unpaid_leave_days,
        reason_for_leave: leave.reason_for_leave,
      });
    }
    setUpdateModal(true);
    setUpdateRequestId(id);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(
        `http://localhost:5000/api/leave/delete-leave/${deleteRequestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests((prev) => prev.filter((req) => req._id !== deleteRequestId));
      toast.success("Leave request deleted successfully");
    } catch (err) {
      toast.error("Failed to delete leave request");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
      setDeleteRequestId(null);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...leaveData, [name]: value };

    // Auto-calculate end date if start date or leave days change
    if (
      name === "start_date" ||
      name === "paid_leave_days" ||
      name === "unpaid_leave_days"
    ) {
      const total =
        Number(updated.paid_leave_days) + Number(updated.unpaid_leave_days) - 1;
      if (updated.start_date && total >= 0) {
        const newEndDate = new Date(updated.start_date);
        newEndDate.setDate(newEndDate.getDate() + total);
        updated.end_date = newEndDate.toISOString().split("T")[0];
      }
    }

    setLeaveData(updated);
  };
  
  const updateLeave = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `http://localhost:5000/api/leave/update-leave/${updateRequestId}`,
        leaveData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests((prev) => prev.filter((req) => req._id !== updateRequestId));
      toast.success("Leave request updated successfully");
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setUpdating(false);
      setUpdateModal(false);
      setUpdateRequestId(null);
    }
  };

  return (
    <Container>
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i
            className="bi bi-arrow-left-circle"
            onClick={() => window.history.back()}
            style={{ cursor: "pointer", fontSize: "32px", color: "#343a40" }}
          />
        </Col>
        <Col md={9}>
          <h3 className="mt-2">My Leave Requests</h3>
        </Col>
        <Col className="text-end">
          <Link to="/apply-leave">
            <Button className="btn-blue">Apply Leave</Button>
          </Link>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Paid</th>
            <th>Unpaid</th>
            <th>Total</th>
            <th>Reason</th>
            <th>Status</th>
            <th>HR Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="10" className="text-center">
                <LoaderSpiner />
              </td>
            </tr>
          ) : requests.length > 0 ? (
            requests.map((req, index) => (
              <tr key={req._id}>
                <td>{(page - 1) * apiLimit + index + 1}</td>
                <td>{new Date(req.apply_date).toLocaleDateString("en-GB")}</td>
                <td>{new Date(req.start_date).toLocaleDateString("en-GB")}</td>
                <td>{new Date(req.end_date).toLocaleDateString("en-GB")}</td>
                <td>{req.paid_leave_days}</td>
                <td>{req.unpaid_leave_days}</td>
                <td>{req.total_leave_days}</td>
                <td>{req.reason_for_leave}</td>
                <td>{req.status}</td>
                <td>{req.hr_note || "N/A"}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deleting}
                    onClick={() => handleDelete(req._id, req.status)}
                  >
                    Delete
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deleting}
                    onClick={() => handleUpdate(req._id, req.status)}
                  >
                    Update
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                No leave requests found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this request?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={updateModal} onHide={() => setUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                value={
                  leaveData.start_date
                    ? leaveData.start_date.substring(0, 10)
                    : ""
                }
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="Date"
                name="end_date"
                value={
                  leaveData.end_date ? leaveData.end_date.substring(0, 10) : ""
                }
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPaidLeave">
              <Form.Label>Paid Leave</Form.Label>
              <Form.Control
                type="number"
                name="paid_leave_days"
                value={leaveData.paid_leave_days}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUnpaidLeave">
              <Form.Label>Unpaid Leave</Form.Label>
              <Form.Control
                type="number"
                name="unpaid_leave_days"
                value={leaveData.unpaid_leave_days}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formReasonForLeave">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                type="text"
                name="reason_for_leave"
                value={leaveData.reason_for_leave}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setUpdateModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={updateLeave} disabled={updating}>
            {updating ? "Updating..." : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
      <div>
        <Stack spacing={2} className="mt-4">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
          />
        </Stack>
      </div>
    </Container>
  );
};

export default EmployeeViewLeave;
