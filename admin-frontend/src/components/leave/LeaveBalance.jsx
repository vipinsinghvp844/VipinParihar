import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Row, Col } from "react-bootstrap";
import LoaderSpiner from "../common/LoaderSpiner";
import {
  GetLeavePolicyAction,
  GetEmployeeLeaveDetailAction,
} from "../../../redux/actions/EmployeeDetailsAction";
import "./LeaveBalance.css";

const LeaveBalance = () => {
  const dispatch = useDispatch();
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const leavePolicies = useSelector(
    ({ EmployeeDetailReducers }) =>
      EmployeeDetailReducers.TotalLeavePolicy || []
  );
  const leaveRequests = useSelector(
    ({ EmployeeDetailReducers }) =>
      EmployeeDetailReducers.TotalEmployeeInLeave || []
  );

  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    dispatch(GetLeavePolicyAction());
    dispatch(GetEmployeeLeaveDetailAction());
  }, [dispatch]);

  useEffect(() => {
    if (leavePolicies.length > 0 && leaveRequests.length > 0) {
      calculateLeaveBalances();
    }
  }, [leavePolicies, leaveRequests]);

  const calculateLeaveBalances = () => {
    try {
      const balances = leaveRequests
        .filter((request) => request.status === "Accept")
        .map((request) => {
          const policy = leavePolicies.find(
            (policy) =>
              policy.leave_type === request.leave_type &&
              policy.leave_year === currentYear
          );

          if (policy) {
            const totalLeave = parseInt(policy.leave_days, 10);
            const takenLeave = leaveRequests
              .filter(
                (req) =>
                  req.user_id === request.user_id &&
                  req.leave_type === request.leave_type &&
                  req.status === "Accept"
              )
              .reduce(
                (sum, req) => sum + parseInt(req.total_leave_days, 10),
                0
              );

            return {
              user_id: request.user_id,
              user_name: request.user_name,
              leave_type: request.leave_type,
              year: policy.leave_year,
              total_leave: totalLeave,
              taken_leave: takenLeave,
              balance_leave: totalLeave - takenLeave,
            };
          }
          return null;
        })
        .filter(Boolean);

      const uniqueBalances = balances.reduce((acc, current) => {
        const existing = acc.find(
          (item) =>
            item.user_id === current.user_id &&
            item.leave_type === current.leave_type
        );
        return existing ? acc : [...acc, current];
      }, []);

      setLeaveBalances(uniqueBalances);
    } catch (error) {
      setError("Error calculating leave balances.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-balance-container">
      <Row className="mb-4 d-flex">
        <Col md={1}>
          <i
            className="bi bi-arrow-left-circle"
            onClick={() => window.history.back()}
            style={{ cursor: "pointer", fontSize: "32px", color: "#343a40" }}
          ></i>
        </Col>
        <Col md={9}>
          <h3 className="mt-2">Employee Leave Balance</h3>
        </Col>
      </Row>
      <h2 className="leave-balance-header">Leave Balance</h2>
      <Table striped bordered hover className="leave-balance-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>User Name</th>
            <th>Year</th>
            <th>Total Leave</th>
            <th>Leave Taken</th>
            <th>Leave Type</th>
            <th>Balance Leave</th>
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
          ) : leaveBalances.length > 0 ? (
            leaveBalances.map((balance) => (
              <tr key={`${balance.user_id}-${balance.leave_type}`}>
                <td>{balance.user_id}</td>
                <td>{balance.user_name}</td>
                <td>{balance.year}</td>
                <td>{balance.total_leave}</td>
                <td>{balance.taken_leave}</td>
                <td>{balance.leave_type}</td>
                <td>{balance.balance_leave}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                <h4>No Employee Can Take Leave</h4>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default LeaveBalance;
