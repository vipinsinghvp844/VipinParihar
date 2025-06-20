import React, { useState, useEffect } from "react";
import { Spinner, Alert, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { FaUserTimes } from "react-icons/fa";

function TodayOnLeave() {
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [leaveUserNames, setLeaveUserNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDate = new Date().toISOString().split("T")[0]; // Format to YYYY-MM-DD

  useEffect(() => {
    fetchOnLeaveCount();
  }, []);

  const fetchOnLeaveCount = async () => {
    try {
      const leaveResponse = await axios.get(
        `${import.meta.env.VITE_API_LEAVE}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      const leaveData = leaveResponse.data || [];
      // console.log(leaveData)
      // const absentUserIds = nonAdminUserIds.filter(
      //   (userId) => !presentOrOnLeaveUserIds.has(userId)
      // );

      // const absentUserNames = nonAdminUsers
      //   .filter((user) => absentUserIds.includes(user.id.toString()))
      //   .map((user) => user.username);
      // Filter leaves that are accepted and active for the current date
      const onLeaveUsers = leaveData.filter((leave) => {
        const startDate = new Date(leave.start_date)
          .toISOString()
          .split("T")[0];
        const endDate = new Date(leave.end_date).toISOString().split("T")[0];
        return (
          leave.status === "Accept" &&
          startDate <= currentDate &&
          endDate >= currentDate
        );
      });

      setOnLeaveCount(onLeaveUsers.length);
      setLeaveUserNames(onLeaveUsers.map((user) => user.user_name));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave data:", error);
      setError("Error fetching leave data. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <Card className="text-center shadow-sm border-0 rounded p-0">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="tooltip">
                {leaveUserNames.length > 0
                  ? leaveUserNames.join(", ")
                  : "No Leaves users"}
          </Tooltip>
        }
      >
        <Card.Body>
          <Card.Title>Today Leave</Card.Title>
          <div className="d-flex flex-column align-items-center">
            <FaUserTimes size={50} color="#a855f7" />
            <h3 className="mt-2" style={{ color: "#a855f7", fontSize: "2rem" }}>
              {onLeaveCount}
            </h3>
          </div>
        </Card.Body>
      </OverlayTrigger>
    </Card>
  );
}

export default TodayOnLeave;
