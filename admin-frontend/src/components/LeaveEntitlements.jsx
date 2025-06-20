import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Spinner, Container, Row, Col } from "react-bootstrap";
import LoaderSpiner from "./LoaderSpiner";

const LeaveEntitlements = () => {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear().toString(); // Assume current year is 2024
  const userId = localStorage.getItem("user_id"); // Retrieve user ID from localStorage

  useEffect(() => {
    fetchLeavePolicies();
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    if (leavePolicies.length > 0 && leaveRequests.length > 0) {
      calculateLeaveBalances();
    }
  }, [leavePolicies, leaveRequests]);

  const fetchLeavePolicies = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LEAVE_POLICIES}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      setLeavePolicies(response.data);
    } catch (error) {
      setError("Error fetching leave policies.");
      console.error("Error fetching leave policies:", error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_LEAVE}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
        },
      });
      setLeaveRequests(response.data);
    } catch (error) {
      setError("Error fetching leave requests.");
      console.error("Error fetching leave requests:", error);
    }
  };

  const calculateLeaveBalances = () => {
    if (!userId) {
      setLoading(false);
      setError("No user ID found.");
      return;
    }

    const balances = leavePolicies.map((policy) => {
      const totalLeave = parseInt(policy.leave_days);

      // Calculate taken leaves for this policy
      const takenLeave = leaveRequests
        .filter(
          (request) =>
            request.user_id === userId &&
            request.leave_type === policy.leave_type &&
            request.status === "Accept" &&
            policy.leave_year === currentYear
        )
        .reduce((sum, req) => sum + parseInt(req.total_leave_days), 0);

      const balanceLeave = totalLeave - takenLeave;

      return {
        leave_type: policy.leave_type,
        year: policy.leave_year,
        total_leave: totalLeave,
        taken_leave: takenLeave,
        balance_leave: balanceLeave,
      };
    });

    setLeaveBalances(balances);
    setLoading(false);
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col className="d-flex text-center">
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
          <h3 className="mt-2">Leave Balance</h3>
        </Col>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Year</th>
                <th>Total Leave</th>
                <th>Leave Taken</th>
                <th>Balance Leave</th>
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
              ) : leaveBalances.length > 0 ? (
                leaveBalances.map((balance, index) => (
                  <tr key={index}>
                    <td>{balance.leave_type}</td>
                    <td>{balance.year}</td>
                    <td>{balance.total_leave}</td>
                    <td>{balance.taken_leave}</td>
                    <td>{balance.balance_leave}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Leave Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default LeaveEntitlements;
