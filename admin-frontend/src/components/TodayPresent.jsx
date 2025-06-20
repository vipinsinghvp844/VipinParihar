import React, { useState, useEffect } from "react";
import { Spinner, Alert, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { GetAttendanceDataAction } from "../../redux/actions/EmployeeDetailsAction";
import { toast } from "react-toastify";
// import { GetAttendanceDataAction } from "../../redux/actions/dev-aditya-action";

function TodayPresent() {
  const [presentCount, setPresentCount] = useState(0);
  const [userNamePresent, setUserNamePresent] = useState([]);
  const dispatch = useDispatch();
  const currentDate = new Date().toISOString().split("T")[0]; // Format to YYYY-MM-DD
  const { TotalAttendance } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  // console.log(TotalAttendance, "======store 111111");

  useEffect(() => {
    fetchAttendanceCount();
  }, []);

  const fetchAttendanceCount = async () => {
    try {
      const currentDate = await new Date().toISOString().split("T")[0];
      await dispatch(GetAttendanceDataAction(currentDate));
    } catch (error) {
      // console.log("GetAttendanceDataAction function error");
      toast.error("Somthing Went Wrong");
    }
  };

  useEffect(() => {
    const presentUsers = TotalAttendance.filter(
      (attendance) =>
        attendance.date === currentDate && attendance.type === "clock_in"
    );
    const presentUserNmaes = TotalAttendance.filter(
      (attendance) =>
        attendance.date === currentDate && attendance.type === "clock_in"
    ).map((attendance) => attendance.user_name);

    // console.log(presentUsers);
    setPresentCount(presentUsers.length);
    setUserNamePresent(presentUserNmaes);
  }, [TotalAttendance]);

  return (
    <Card className="text-center shadow-sm border-0 rounded p-0">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="tooltip">
            {userNamePresent.length > 0
              ? userNamePresent.join(", ")
              : "No absent users"}
          </Tooltip>
        }
      >
        <Card.Body>
          <Card.Title>Today Present</Card.Title>
          <div className="d-flex flex-column align-items-center">
            <FaUsers size={50} color="#0891b2" />
            <h3 className="mt-2" style={{ color: "#0891b2", fontSize: "2rem" }}>
              {presentCount}
            </h3>
          </div>
        </Card.Body>
      </OverlayTrigger>
    </Card>
  );
}

export default TodayPresent;
