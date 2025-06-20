import React, { useState, useEffect } from "react";
// import "../App.css";
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
import { useDispatch, useSelector } from "react-redux";
import { GetEmployeeLeaveDetailAction } from "../../redux/actions/EmployeeDetailsAction";
import LoaderSpiner from "./LoaderSpiner";
import { toast } from "react-toastify";
import { Link, useLocation } from "react-router-dom";

const LeaveRequests = ({ setPendingCount }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const senderId = queryParams.get("sender_id");
  const startDateLeave = queryParams.get("start_date");
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState("");
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toISOString().split("T")[0];
  const { TotalEmployeeInLeave } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  const dispatch = useDispatch();
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("user_name");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequest, setDeleteRequest] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    status: "",
    search: "",
  });
  const [openFilters, setOpenFilters] = useState(false);

  const filteredRequests = requests.filter((request) => {
    return (
      (filters.status === "" || request.status === filters.status) &&
      (filters.leaveType === "" || request.leave_type === filters.leaveType) &&
      (filters.search === "" ||
        request.user_name
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        request.user_id.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.startDate === "" ||
        new Date(request.start_date) >= new Date(filters.startDate)) &&
      (filters.endDate === "" ||
        new Date(request.end_date) <= new Date(filters.endDate))
    );
  });
//   const matchedRequests = filteredRequests.filter(
//     (request) =>
//       senderId?.trim() === request.user_id?.trim() &&
//       startDateLeave?.trim() === request.start_date?.trim()
//   );
// if (matchedRequests.length === 0 && filteredRequests.length > 0) {
//   toast.warning("A leave request was sent but has been deleted.");
// }
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await dispatch(GetEmployeeLeaveDetailAction());
      setRequests(
        response.map((request) => ({
          ...request,
          totalLeaveDays: calculateTotalLeaveDays(
            request.start_date,
            request.end_date
          ),
        }))
      );
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAndProcessRequests = async () => {
      setLoading(true);

      try {
        let fetchedRequests = [];

        if (role === "hr") {
          fetchedRequests = TotalEmployeeInLeave.filter(
            (item) => item.user_name !== userName
          );
        } else {
          fetchedRequests = TotalEmployeeInLeave;
        }

        const updatedRequests = fetchedRequests.map((request) => {
          const validRequest = {
            id: request.id || "",
            apply_date: request.apply_date || "N/A",
            user_name: request.user_name || "Unknown",
            user_id: request.user_id || "N/A",
            leave_type: request.leave_type || "N/A",
            start_date: request.start_date || null,
            end_date: request.end_date || null,
            reason_for_leave: request.reason_for_leave || "No reason provided",
            status: request.status || "Pending",
            hr_note: request.hr_note || "",
            totalLeaveDays: calculateTotalLeaveDays(
              request.start_date,
              request.end_date
            ),
          };

          if (
            validRequest.status === "Pending" &&
            validRequest.end_date &&
            new Date(validRequest.end_date) < new Date()
          ) {
            validRequest.status = "Reject";
            validRequest.hr_note = "Auto-rejected as the leave date has passed";

            axios
              .put(
                `${import.meta.env.VITE_API_LEAVE}/${validRequest.id}`,
                validRequest,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "authtoken"
                    )}`,
                  },
                }
              )
              .catch((error) =>
                console.error("Error auto-rejecting leave request:", error)
              );
          }

          return validRequest;
        });

        setRequests(updatedRequests);

        // Calculate pending leave requests
        const pendingCount = updatedRequests.filter(
          (request) => request.status === "Pending"
        ).length;
        setPendingCount(pendingCount);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessRequests();
  }, [TotalEmployeeInLeave, userName, role, setPendingCount]);

  const calculateTotalLeaveDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0; // Handle missing dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0; // Handle invalid dates
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleAction = (action) => {
    setLoading(true);
    const updatedRequest = {
      ...selectedRequest,
      status: action,
      hr_note: note,
      totalLeaveDays: calculateTotalLeaveDays(
        selectedRequest.start_date,
        selectedRequest.end_date
      ),
    };

    axios
      .put(
        `${import.meta.env.VITE_API_LEAVE}/${selectedRequest.id}`,
        updatedRequest,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      )
      .then((response) => {
        const newRequests = requests.map((req) =>
          req.id === response.data.id ? response.data : req
        );
        setRequests(newRequests);
        toast.success("Leave request updated successfully");
        fetchRequests();
        setLoading(false);

        // Update pending count after the state is updated
        const newPendingCount = newRequests.filter(
          (request) => request.status === "Pending"
        ).length;
        setPendingCount(newPendingCount);

        setSelectedRequest(null);
        setNote("");
        setModalType("");
      })
      .catch((error) => {
        // console.error("Error updating leave request:", error);
        toast.error("Error updating leave request", error);
      });
  };

  const handleDeleteRequest = async () => {
    if (!deleteRequest) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_LEAVE}/${deleteRequest.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );

      const updatedRequests = requests.filter(
        (req) => req.id !== deleteRequest.id
      );
      setRequests(updatedRequests);
      toast.success("Leave request deleted successfully");
    } catch (error) {
      console.error("Error deleting leave request:", error);
      toast.error("Failed to delete leave request");
    } finally {
      setShowDeleteModal(false);
      setDeleteRequest(null);
    }
  };

  return (
    <div className="container mt-4">
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
        <Col md={5}>
          <h3 className="mt-2">Leave Request</h3>
        </Col>

        <Col md={3} style={{ textAlign: "right" }}>
          <Button
            variant="light"
            onClick={() => setOpenFilters(!openFilters)}
            aria-controls="filter-collapse"
          >
            <i className="bi bi-filter"> </i>
            {/* {openFilters ? "Hide Filters" : "Show Filters"} */}
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
          <Form className="mb-3 overflow-x-hidden">
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
                  <option value="Pending">Pending</option>
                  <option value="Accept">Approved</option>
                  <option value="Reject">Rejected</option>
                </Form.Select>
              </Col>

              <Col md={2}>
                <Form.Select
                  value={filters.leaveType}
                  onChange={(e) =>
                    setFilters({ ...filters, leaveType: e.target.value })
                  }
                >
                  <option value="">All Leave Types</option>
                  <option value="Paid Leave">Paid Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </Form.Select>
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
                      leaveType: "",
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
            <th>Employee Name/ID</th>
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason for Leave</th>
            <th>Total Leave Days</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="10" className="text-center">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
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
                  key={request.id}
                  className={isHighlighted ? "highlighted-row" : ""}
                >
                  <td>{index + 1}</td>
                  <td>{request.apply_date || "N/A"}</td>
                  <td>{`${request.user_name || "N/A"}/${
                    request.user_id || "N/A"
                  }`}</td>
                  <td>{request.leave_type || "N/A"}</td>
                  <td>{request.start_date || "N/A"}</td>
                  <td>{request.end_date || "N/A"}</td>
                  <td>{request.reason_for_leave || "N/A"}</td>
                  <td>
                    {calculateTotalLeaveDays(
                      request.start_date,
                      request.end_date
                    )}
                  </td>
                  <td>{request.status || "N/A"}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setModalType("Accept");
                      }}
                      className="me-2"
                      disabled={
                        new Date(request.start_date) < new Date(currentDate)
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setModalType("Reject");
                      }}
                      disabled={
                        new Date(request.start_date) < new Date(currentDate)
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setDeleteRequest(request);
                        setShowDeleteModal(true);
                      }}
                      disabled={
                        new Date(request.start_date) < new Date(currentDate)
                      }
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
          <Button
            variant="primary"
            onClick={() => handleAction(modalType)}
            disabled={loading}
          >
            Save
            {loading && (
              <Spinner animation="border" size="sm" className="ms-2" />
            )}
          </Button>
        </Modal.Footer>
      </Modal>
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
    </div>
  );
};

export default LeaveRequests;
