import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import axios from "axios";
import "./EmApplyLeave.css"; // Assuming you have a custom CSS file for additional styles
import { toast } from "react-toastify";

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveDays, setLevaDays] = useState({
    unpaidLeave: 0,
    paidLeave: 0,
  })
  const [reasonForLeave, setReasonForLeave] = useState("");
  const [error, setError] = useState("");
  // const [successMessage, setSuccessMessage] = useState("");
  const [applyDate, setApplyDate] = useState("");
  const currentDate = new Date().toISOString().split("T")[0];


  // useEffect(() => {
  //   fetchLeaveRequests()
  // } ,[])

  const isDateInPast = (date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const givenDate = new Date(date).setHours(0, 0, 0, 0);
    return givenDate < today;
  };

  const isStartDateBeforeEndDate = (startDate, endDate) => {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    return start <= end;
  };

  const checkExistingLeaveRequests = async (userId, startDate, endDate) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LEAVE}/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          }
        }
      );
      const leaveRequests = response.data;
      // console.log(leaveRequests,"hsdjjfhhjsdgsjchecjkkkkkkk");


      // Check if any leave requests overlap with the new request
      return leaveRequests.some((request) => {
        const requestStart = new Date(request.start_date);
        const requestEnd = new Date(request.end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        return newStart <= requestEnd && newEnd >= requestStart;
      });
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      return false;
    }
  };

  
  const handleSubmit = async (event) => {

    event.preventDefault();

    const user_name = localStorage.getItem("user_name");
    const user_id = localStorage.getItem("user_id");

    if (!user_id || !user_name) {
      setError("User not logged in. Please log in and try again.");
      return;
    }

    // Check if start date is in the past
    if (isDateInPast(startDate)) {
      // setError("Start date cannot be in the past.");
      toast.info("Start date cannot be in the past.");
      return;
    }

    if (!isStartDateBeforeEndDate(startDate, endDate)) {
      // setError("Start date cannot be after end date.");
      toast.info("Start date cannot be after end date.");

      return;
    }

    // Check for existing leave requests
    const hasExistingRequest = await checkExistingLeaveRequests(
      user_id,
      startDate,
      endDate
    );
    if (hasExistingRequest) {
      // setError("Leave request already exists for the specified dates.");
      toast.warn("Leave request already exists for the specified dates.");

      return;
    }

    const newLeaveRequest = {
      "user_id": user_id,
      "user_name": user_name,
      "apply_date": currentDate,
      "start_date": startDate,
      "end_date": endDate,
      "reason_for_leave": reasonForLeave,
      "total_leave_days": (parseInt(leaveDays?.paidLeave) || 0) + (parseInt(leaveDays?.unpaidLeave) || 0),
      "paid_leave_days": parseInt(leaveDays?.paidLeave) || 0,
      "status": "Pending",
      "actions": "Submitted",
      "hr_note": ""
    };

    // console.log('set Paid leave days', newLeaveRequest)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_LEAVE}`,
        newLeaveRequest, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          }
        }
      );
      // console.log("Leave request submitted:", response.data);
      // setSuccessMessage("Leave request submitted successfully.");
      toast.success("Leave request submitted successfully.");
      // setLeaveType({
      //   unpaidLeave: 0,
      //   paidLeave: 0,
      // })
      // setLeaveType("");
      // setApplyDate("");
      // setStartDate("");
      // setEndDate("");
      // setReasonForLeave("");
      // // setIsPaidLeave(false);
      // // setIsUnpaidLeave(false);
      // setError("");
      // setLevaDays({
      //   unpaidLeave: 0,
      //   paidLeave: 0,
      // })
    } catch (error) {
      console.error("Error submitting leave request:", error);
      // setError("Error submitting leave request. Please try again later.");
      toast.error("Error submitting leave request. Please try again later.");
    }
  };

  const formateEndDate = (value , paidLeave , unPaidLeave) => {
    // console.log('formateEndDate' , value)
    let selectedDate = new Date(value);
    let paidLeaveNumber = Number(paidLeave) || 0;
    let unpaidLeavenumber = Number(unPaidLeave) || 0;
    let totalLeaveDays = (paidLeaveNumber || unpaidLeavenumber) ? paidLeaveNumber + unpaidLeavenumber - 1 : 0;
    // console.log('formateEndDate', totalLeaveDays)
    selectedDate.setDate(selectedDate.getDate() + totalLeaveDays);
    let formattedEndDate = selectedDate.toISOString().split('T')[0];
    return formattedEndDate

  }
  
  // const fetchLeaveRequests = async () => {
  //   try {
  //     const response = await axios.get(`${import.meta.env.VITE_API_LEAVE}`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
  //       },
  //     });
  //     // setLeaveRequests(response.data)
  //           const takenLeave = response.data
  //       .filter(
  //         (request) =>
  //           request.user_id === userId &&
  //           request.leave_type === policy.leave_type &&
  //           request.status === "Accept" &&
  //           policy.leave_year === currentYear
  //       )
  //       .reduce((sum, req) => sum + parseInt(req.total_leave_days), 0);

  //     const balanceLeave = totalLeave - takenLeave;
  //   } catch (error) {
  //     setError("Error fetching leave requests.");
  //     console.error("Error fetching leave requests:", error);
  //   }
  // };

  return (
    <Container className="mt-4 ">
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
          <h3 className="mt-2">Apply Leave</h3>
        </Col>
      </Row>
      <Row className="">
        <Card>
          <Card.Header as="h3" className="text-center">
            Leave Requests
          </Card.Header>
          <Card.Body>

            <Form onSubmit={handleSubmit}>
              <Form.Group as={Row} controlId="PaidLeave" className="mb-3">
                <Form.Label column sm={4}>Paid Leave</Form.Label>
                <Col sm={8}>
                  <Form.Control
                    type="number"
                    min="0"
                    value={leaveDays?.paidLeave}
                    onChange={(e) => {
                      e.preventDefault()
                      let value = e.target.value.trim() ? parseInt(e.target.value, 10) : 0;
              
                      if (!isNaN(value) && value >= 0) {
                        setLevaDays((prev) => ({
                          ...prev,
                          paidLeave: value
                        }));
                      }
                      if (startDate) {
                        let formattedEndDate = formateEndDate(startDate , value , leaveDays?.unpaidLeave);
                        if (formattedEndDate) {
                          setEndDate(formattedEndDate);
                        }
                      }
                    }}
                    required
                  />
                </Col>
              </Form.Group>


              <Form.Group as={Row} controlId="UnpaidLeave" className="mb-3">
                <Form.Label column sm={4}>
                  Unpaid Leave
                </Form.Label>
                <Col sm={8}>
                  <Form.Control
                    type="number"
                    min="0"
                    value={leaveDays?.unpaidLeave}
                    onChange={(e) => {
                      e.preventDefault()
                      const value = parseInt(e.target.value, 10) || 0;
                      if (value >= 0) {
                        setLevaDays((prev) => ({
                          ...prev,
                          unpaidLeave: value
                        }));
                      }

                      if (startDate) {
                        let formattedEndDate = formateEndDate(startDate , leaveDays?.paidLeave , value)
                        setEndDate(formattedEndDate);
                      }
                    }}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="startDate" className="mb-3">
                <Form.Label column sm={4}>
                  Start Date
                </Form.Label>
                <Col sm={8}>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      let formattedEndDate = formateEndDate(e.target.value , leaveDays?.paidLeave , leaveDays?.unpaidLeave)
                      setEndDate(formattedEndDate);
                      setStartDate(e.target.value);
                    }}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="endDate" className="mb-3">
                <Form.Label column sm={4}>
                  End Date
                </Form.Label>
                <Col sm={8}>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    readOnly
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="reasonForLeave" className="mb-3">
                <Form.Label column sm={4}>
                  Reason for Leave
                </Form.Label>
                <Col sm={8}>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reasonForLeave}
                    onChange={(e) => setReasonForLeave(e.target.value)}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="text-center">
                <Col>
                  <Button variant="primary" type="submit">
                    Submit Request
                  </Button>
                </Col>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
};

export default ApplyLeave;
