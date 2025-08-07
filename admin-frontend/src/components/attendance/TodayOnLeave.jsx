import React, { useState, useEffect } from "react";
import { Spinner, Alert, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { FaUserTimes } from "react-icons/fa";

function TodayOnLeave() {
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [leaveUserNames, setLeaveUserNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toISOString().split("T")[0];
  

  useEffect(() => {
    fetchOnLeaveCount();
  }, []);

  const fetchOnLeaveCount = async () => {
    setLoading(true);
    try {
      const leaveResponse = await axios.get(
        `http://localhost:5000/api/leave/leave-count-user/${currentDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      const leaveData = leaveResponse.data || [];
      setOnLeaveCount(leaveData.totalLeavedUsers);
      setLeaveUserNames(leaveData.users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave data:", error);
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
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                onLeaveCount
              )}
            </h3>
          </div>
        </Card.Body>
      </OverlayTrigger>
    </Card>
  );
}

export default TodayOnLeave;
