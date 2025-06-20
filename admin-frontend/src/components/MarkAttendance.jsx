import React, { useState, useEffect, useRef } from "react";
import { Button, Table, Container, Row, Col, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the toastify CSS
import LoaderSpiner from "./LoaderSpiner";
import "./MarkAttendance.css";
import {
  GetAttendanceDataActionByIdAndDate,
  submitAttendanceAction,
} from "../../redux/actions/EmployeeDetailsAction";
import { useDispatch, useSelector } from "react-redux";
import { LoginUserAction } from "../../redux/actions/dev-aditya-action";
import { setValueForSideBarClick } from "../../redux/redecer/EmployeeDetailReducers";

const MarkAttendance = () => {
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [checkInDisabled, setCheckInDisabled] = useState(false);
  const [checkOutDisabled, setCheckOutDisabled] = useState(true);
  const [breakInDisabled, setBreakInDisabled] = useState(true);
  const [breakOutDisabled, setBreakOutDisabled] = useState(true);
  const [totalBreakDuration, setTotalBreakDuration] = useState(0);
  const [totalWorkDuration, setTotalWorkDuration] = useState(0);
  const userName = localStorage.getItem("user_name");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const [breakInTimes, setBreakInTimes] = useState([]);
  const [breakOutTimes, setBreakOutTimes] = useState([]);
  const [disableButton, setDisableButton] = useState(false);
  const token = useSelector(({ AllReducers }) => AllReducers.token);

  const ValueForSideBarClick = useSelector(
    (state) => state.EmployeeDetailReducers.ValueForSideBarClick
  );

  const [time, setTime] = useState("");
  const intervalRef = useRef(null);
  const [timeDisabled, setTimeDisabled] = useState(false);

  useEffect(() => {
    setTimeDisabled(true);

    intervalRef.current = setInterval(() => {
      const localTime = new Intl.DateTimeFormat("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }).format(new Date());

      setTime(localTime);
    }, 1000);

    setTimeDisabled(false);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const currentDate = getCurrentDate();

  function convertTo12HourFormat(time24) {
    if (!time24) return "--:--";
    let [hours, minutes, seconds] = time24.split(":");
    hours = parseInt(hours, 10);

    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${minutes}:${seconds} ${period} `;
  }

  const fetchData = async () => {
    try {
      const requestData = {
        email: localStorage.getItem("user_email"),
        password: localStorage.getItem("password"),
      };

      if (ValueForSideBarClick == 0) {
        dispatch(LoginUserAction(requestData)).then(async (response1) => {
          dispatch(setValueForSideBarClick(1));
          if (token) {
            performDataAction();
          }
        });
      } else {
        if (token) {
          performDataAction();
        }
      }
    } catch (error) {
      console.error("Error fetching data", error);
      toast.error(
        "Failed to fetch attendance records please hard refresh the page"
      );
    }
  };

  async function performDataAction() {
    try {
      const response = await dispatch(GetAttendanceDataActionByIdAndDate());
      setIsLoading(false);

      const breakInArray = [];
      const breakOutArray = [];

      response.forEach((entry) => {
        if (entry.clockInTime) {
          setCheckInTime(convertTo12HourFormat(entry.clockInTime));
          setCheckInDisabled(true);
          setBreakInDisabled(false);
          setCheckOutDisabled(false);
        }

        if (entry.clockOutTime) {
          setCheckOutTime(convertTo12HourFormat(entry.clockOutTime));
          setCheckOutDisabled(true);
          setBreakInDisabled(true);
          setBreakOutDisabled(true);
        }

        if (entry.breaks && entry.breaks.length > 0) {
          entry.breaks.forEach((brk) => {
            if (brk.breakInTime) {
              breakInArray.push(convertTo12HourFormat(brk.breakInTime));
            }
            if (brk.breakOutTime) {
              breakOutArray.push(convertTo12HourFormat(brk.breakOutTime));
            }

            if (brk.breakInTime && !brk.breakOutTime) {
              setBreakInDisabled(true);
              setBreakOutDisabled(false);
              setCheckOutDisabled(true);
            }

            if (brk.breakOutTime) {
              setBreakOutDisabled(true);
              setBreakInDisabled(false);
              setCheckOutDisabled(false);
            }
          });
        }

        if (entry.totalBreak && entry.totalBreak !== "0m") {
          setTotalBreakDuration(entry.totalBreak);
        }
        if (entry.totalWork && entry.totalWork !== "0m") {
          setTotalWorkDuration(entry.totalWork);
        }
      });

      setBreakInTimes(breakInArray);
      setBreakOutTimes(breakOutArray);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      toast.error("Failed to fetch attendance records. Please refresh.");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, []);
  const handleAction = (action) => {
    setModalAction(action);
    setModalVisible(true);
  };

  const confirmAction = async () => {
    setModalVisible(false);
    setDisableButton(false);
    setIsLoading(true);
   
    const payload = {
      username: userName,
      date: currentDate,
    };

    if (modalAction === "clock_in") {
      payload.clockInTime = new Date().toISOString();
    } else if (modalAction === "clock_out") {
      payload.clockOutTime = new Date().toISOString();
    } else if (modalAction === "break_in") {
      payload.breakInTime = new Date().toISOString();
    } else if (modalAction === "break_out") {
      payload.breakOutTime = new Date().toISOString();
    }

    try {
      const response = await dispatch(submitAttendanceAction(payload));

      if (modalAction === "clock_in") {
        setCheckInTime(time);
        setCheckInDisabled(true);
        setBreakInDisabled(false); 
        setCheckOutDisabled(false); 
        toast.success("Checked in successfully!");
      } else if (modalAction === "clock_out") {
        setCheckOutTime(time);
        setCheckOutDisabled(true);
        setBreakInDisabled(true);
        setBreakOutDisabled(true);
        toast.success("Checked out successfully!");
      } else if (modalAction === "break_in") {
        setBreakInTimes(time);
        setBreakInDisabled(true);
        setBreakOutDisabled(false);
        setCheckOutDisabled(true); 
        toast.info("Break started successfully!");
      } else if (modalAction === "break_out") {
        setBreakOutTimes(time);
        setBreakOutDisabled(true);
        setBreakInDisabled(false);
        setCheckOutDisabled(false); 
        toast.info("Break ended successfully!");
      }

      fetchData();
    } catch (error) {
      console.error("Error performing action", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      {isLoading && (
        <div className="loader-overlay">
          <LoaderSpiner />
        </div>
      )}
      <Container fluid className="border rounded shadow-sm">
        <Row className="p-3 mb-4">
          <Col>
            <Button
              onClick={() => handleAction("clock_in")}
              disabled={isLoading || checkInDisabled || disableButton}
              className="btn btn-success w-100 d-flex flex-column align-items-center p-3"
            >
              <i className="bi bi-box-arrow-in-right"></i>
              <p className="mb-0">
                {checkInTime || convertTo12HourFormat(time)}
              </p>
              <p className="mb-0">Check In</p>
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => handleAction("clock_out")}
              disabled={checkOutDisabled || disableButton}
              className="btn btn-primary w-100 d-flex flex-column align-items-center p-3"
            >
              <i className="bi bi-box-arrow-in-left"></i>
              <p className="mb-0">
                {checkOutTime || convertTo12HourFormat(time)}
              </p>
              <p className="mb-0">Check Out</p>
            </Button>
          </Col>
        </Row>
        <Row className="p-3 mb-4">
          <Col>
            <Button
              onClick={() => handleAction("break_in")}
              disabled={breakInDisabled || disableButton}
              className="btn btn-warning w-100 d-flex flex-column align-items-center p-3"
            >
              <i className="bi bi-box-arrow-in-right"></i>
              <p className="mb-0">
                {breakInTimes || convertTo12HourFormat(time)}
              </p>
              <p className="mb-0">Break In</p>
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => handleAction("break_out")}
              disabled={breakOutDisabled || disableButton}
              className="btn btn-danger w-100 d-flex flex-column align-items-center p-3"
            >
              <i className="bi bi-box-arrow-in-left"></i>
              <p className="mb-0">
                {breakOutTimes || convertTo12HourFormat(time)}
              </p>
              <p className="mb-0">Break Out</p>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Check In</th>
                  <th>Break In</th>
                  <th>Break Out</th>
                  <th>Total Break Duration</th>
                  <th>Total Work Duration</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {breakInTimes.length > 0 ? (
                  breakInTimes.map((breakIn, index) => (
                    <tr key={index}>
                      {index === 0 ? (
                        <>
                          <td rowSpan={breakInTimes.length}>
                            {checkInTime || "--:--:--"}
                          </td>
                          <td>{breakIn}</td>
                          <td>{breakOutTimes[index] || "--:--:--"}</td>
                          <td rowSpan={breakInTimes.length}>
                            {totalBreakDuration}
                          </td>
                          <td rowSpan={breakInTimes.length}>
                            {totalWorkDuration}
                          </td>
                          <td rowSpan={breakInTimes.length}>
                            {checkOutTime || "--:--:--"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{breakIn}</td>
                          <td>{breakOutTimes[index] || "--:--:--"}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>{checkInTime || "--:--:--"}</td>
                    <td>--:--:--</td>
                    <td>--:--:--</td>
                    <td>{totalBreakDuration}</td>
                    <td>{totalWorkDuration}</td>
                    <td>{checkOutTime || "--:--:--"}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>

      <div className="modaldiv">
        <Modal
          show={modalVisible}
          onHide={() => setModalVisible(false)}
          className="btnmodal"
          centered
        >
          <div className="text-center hellooo">
            <i
              className="bi bi-patch-question"
              style={{ fontSize: "80px", color: "red", marginBottom: "20px" }}
            ></i>

            <Modal.Body>
              Are you sure you want to proceed with{" "}
              {modalAction ? modalAction.replace("_", " ") : ""}?
            </Modal.Body>

            <Button
              className="mb-4 me-3"
              variant="secondary"
              onClick={() => setModalVisible(false)}
            >
              Cancel
            </Button>
            <Button className="mb-4" variant="primary" onClick={confirmAction}>
              Confirm
            </Button>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default MarkAttendance;
