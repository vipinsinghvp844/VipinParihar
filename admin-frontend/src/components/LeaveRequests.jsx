import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Spinner,
  Row,
  Col,
  Collapse,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import LoaderSpiner from "./LoaderSpiner";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

const LeaveRequests = () => {
  const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [apiLimit, setApiLimit] = useState(10);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const senderId = queryParams.get("sender_id");
  const startDateLeave = queryParams.get("start_date");
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState("");
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    includePaidLeave: false,
    includeUnpaidLeave: false,
    status: "",
    search: "",
  });
  const currentDate = new Date().toISOString().split("T")[0];

  const fetchRequests = async (currentpage = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/leave/get-all-leave?page=${currentpage}&limit=${apiLimit}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      setRequests(response?.data?.data || []);
      const total = response?.data?.pagination?.totalPages || 1;
      const AllAPILimit = response?.data?.pagination?.limit || 10;
      setApiLimit(AllAPILimit);
      setTotalPages(total);
    } catch (error) {
      // console.error("Error fetching requests:", error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(page);
  }, [page]);
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  const handleAction = async (action) => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      const updatedRequest = {
        ...selectedRequest,
        status: action.toLowerCase(),
        hr_note: note,
      };

      await axios.put(
        `http://localhost:5000/api/leave/leave-decision/${selectedRequest._id}`,
        updatedRequest,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      toast.success("Leave request updated successfully");
      fetchRequests(); // Refresh list
      setSelectedRequest(null);
      setNote("");
      setModalType("");
    } catch (error) {
      toast.error(error.response.data.message);
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteRequest) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/leave/delete-leave/${deleteRequest._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      toast.success("Leave request deleted successfully");
      fetchRequests();
    } catch (error) {
      // console.error("Error deleting leave request:", error);
      toast.error(error.response.data.message);
    } finally {
      setShowDeleteModal(false);
      setDeleteRequest(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    return (
      (filters.status === "" || request.status === filters.status) &&
      (!filters.includePaidLeave || request.paid_leave_days > 0) &&
      (!filters.includeUnpaidLeave || request.unpaid_leave_days > 0) &&
      (filters.search === "" ||
        request.username
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        request.user_id
          ?.toLowerCase()
          .includes(filters.search.toLowerCase())) &&
      (filters.startDate === "" ||
        new Date(request.start_date) >= new Date(filters.startDate)) &&
      (filters.endDate === "" ||
        new Date(request.end_date) <= new Date(filters.endDate))
    );
  });
  

  return (
    <div className="container mt-4">
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i
            className="bi bi-arrow-left-circle"
            onClick={() => window.history.back()}
            style={{ cursor: "pointer", fontSize: "32px", color: "#343a40" }}
          ></i>
        </Col>
        <Col md={5}>
          <h3 className="mt-2">Leave Request</h3>
        </Col>
        <Col md={3} style={{ textAlign: "right" }}>
          <Button
            variant="light"
            onClick={() => setOpenFilters(!openFilters)}
            aria-controls="filter-collapse"
          >
            <i className="bi bi-filter" />
          </Button>
        </Col>
        <Col md={3} style={{ textAlign: "right" }}>
          <Link to={"/add-employee-leaves"}>
            <Button>Add Leaves</Button>
          </Link>
        </Col>
      </Row>

      <Collapse in={openFilters}>
        <div id="filter-collapse" className="mt-3">
          <Form className="mb-3">
            <Row>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Search by Employee Name or ID"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Check
                  type="checkbox"
                  label="Paid Leave"
                  checked={filters.includePaidLeave}
                  onChange={(e) =>
                    setFilters({ ...filters, includePaidLeave: e.target.checked })
                  }
                />
                <Form.Check
                  type="checkbox"
                  label="Unpaid Leave"
                  checked={filters.includeUnpaidLeave}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      includeUnpaidLeave: e.target.checked,
                    })
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </Col>
              <Col md={1}>
                <Button
                  variant="danger"
                  onClick={() =>
                    setFilters({
                      status: "",
                      paidLeave: "",
                      unPaidLeave: "",
                      startDate: "",
                      endDate: "",
                      search: "",
                    })
                  }
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Collapse>

      <Table striped bordered hover responsive className="table-custom">
        <thead>
          <tr>
            <th>No.</th>
            <th>Date</th>
            <th>Employee Name / ID</th>
            <th>Start</th>
            <th>End</th>
            <th>Paid Days</th>
            <th>Unpaid Days</th>
            <th>Total</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="11" className="text-center">
                <div
                  style={{ height: "200px" }}
                  className="d-flex justify-content-center align-items-center"
                >
                  <LoaderSpiner />
                </div>
              </td>
            </tr>
          ) : (
            filteredRequests.map((request, index) => {
              const isHighlighted =
                senderId?.trim() === request.user_id?.trim() &&
                startDateLeave?.trim() === request.start_date?.trim();

              return (
                <tr
                  key={request._id}
                  className={isHighlighted ? "highlighted-row" : ""}
                >
                  <td>{(page - 1) * apiLimit + index + 1}</td>
                  <td>{request?.apply_date?.split("T")[0]}</td>
                  <td>{`${request?.username}`}</td>
                  <td>{request?.start_date?.split("T")[0]}</td>
                  <td>{request?.end_date?.split("T")[0]}</td>
                  <td>{request?.paid_leave_days}</td>
                  <td>{request?.unpaid_leave_days}</td>
                  <td>{request?.total_leave_days}</td>
                  <td>{request?.reason_for_leave}</td>
                  <td>{request?.status}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelectedRequest(request);
                        setModalType("accepted");
                      }}
                      disabled={
                        new Date(request.start_date) < new Date(currentDate)
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelectedRequest(request);
                        setModalType("rejected");
                      }}
                      disabled={
                        new Date(request.start_date) < new Date(currentDate)
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setDeleteRequest(request);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                  <td>{request.hr_note}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      {/* Accept/Reject Modal */}
      <Modal
        show={!!selectedRequest}
        onHide={() => setSelectedRequest(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalType} Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="hrNote">
              <Form.Label>Note</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleAction(modalType)}>
            Save{" "}
            {loading && (
              <Spinner animation="border" size="sm" className="ms-2" />
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this leave request?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRequest}>
            Yes, Delete
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
    </div>
  );
};

export default LeaveRequests;
