import React, { useState, useEffect } from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { FaUserTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { GetEmployeeLeaveDetailAction, GetTotalUserAction } from "../../redux/actions/EmployeeDetailsAction";

function TodayAbsent() {
  const [absentCount, setAbsentCount] = useState(0);
  const [absentUsers, setAbsentUsers] = useState([]);
  const [absentUserIds, setAbsentUserIds] = useState([]);
  const currentDate = new Date().toISOString().split("T")[0]; // Format to YYYY-MM-DD
  const { TotalUsers, TotalAttendance, TotalEmployeeInLeave } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );

  // console.log(TotalEmployeeInLeave, "=====TotalUsers");

  const dispatch = useDispatch();

  useEffect(() => {
    fetchAbsentUsers();
  }, [ TotalAttendance]);

  const fetchAbsentUsers = async () => {
    try {
      // Fetch all users
      const usersData = await dispatch(GetTotalUserAction());
      // const usersData = TotalUsers || [];

      // Filter out users with the role of "admin"
      const nonAdminUsers = usersData.filter((user) => user.role !== "admin");
      const totalLeaveUsers = await dispatch(GetEmployeeLeaveDetailAction());
      const onLeaveUsers = totalLeaveUsers
        .filter((leave) => {
          const startDate = new Date(leave.start_date)
            .toISOString()
            .split("T")[0];
          const endDate = new Date(leave.end_date).toISOString().split("T")[0];
          return (
            leave.status === "Accept" &&
            startDate <= currentDate &&
            endDate >= currentDate
          );
        })
        .map((leave) => leave.user_id.toString()); // Convert IDs to strings

      // Initialize present users array
      const presentUsers = TotalAttendance.filter(
        (attendance) => attendance.date === currentDate
      ).map((attendance) => attendance.user_id.toString());

      // Calculate the list of absent users
      const nonAdminUserIds = nonAdminUsers.map((user) => user.id.toString()); // Convert IDs to strings

      const presentOrOnLeaveUserIds = new Set([
        ...presentUsers,
        ...onLeaveUsers,
      ]);
      // console.log(presentOrOnLeaveUserIds,"================================ppresentonleve");

      const absentUserIds = nonAdminUserIds.filter(
        (userId) => !presentOrOnLeaveUserIds.has(userId)
      );

      const absentUserNames = nonAdminUsers
        .filter((user) => absentUserIds.includes(user.id.toString()))
        .map((user) => user.username);

      setAbsentUserIds(absentUserIds);
      setAbsentCount(absentUserNames.length);

      setAbsentUsers(absentUserNames);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {}, []);

  return (
    <Card className="text-center shadow-sm border-0 rounded p-0">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="tooltip">
           
                {absentUsers.length > 0
                  ? absentUserIds && absentUsers.join(", ")
                  : "No absent users"}
             
          </Tooltip>
        }
      >
        <Card.Body>
          <Card.Title>Today Absent</Card.Title>
          <div className="d-flex flex-column align-items-center">
            <FaUserTimes size={50} color="#f43f5e" />
            <h3 className="mt-2" style={{ color: "#f43f5e", fontSize: "2rem" }}>
              {absentCount}
            </h3>
          </div>
        </Card.Body>
      </OverlayTrigger>
    </Card>
  );
}

export default TodayAbsent;
