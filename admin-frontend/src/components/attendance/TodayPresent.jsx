import React, { useState, useEffect } from "react";
import { Spinner, Alert, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
// import { GetAttendanceDataAction } from "../../redux/actions/dev-aditya-action";

function TodayPresent() {
  const [presentCount, setPresentCount] = useState(0);
  const [userNamePresent, setUserNamePresent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceCount();
  }, []);

  const fetchAttendanceCount = async () => {
    setIsLoading(true);
    try {
      const currentDate = await new Date().toISOString().split("T")[0];
      const res = await axios.get(
        `http://localhost:5000/api/attendance/attendanc-count/${currentDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        }
      );
      
      setPresentCount(res.data.present.total);
      setUserNamePresent(res.data.present.users);
      setIsLoading(false);
    } catch (error) {
      console.log("GetAttendanceDataAction function error");
      toast.error("Somthing Went Wrong");
      setIsLoading(false);
    }
  };
  return (
    <Card className="text-center shadow-sm border-0 rounded p-0">
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="tooltip">
            {userNamePresent.length > 0
              ? userNamePresent.join(", ")
              : "No present users"}
          </Tooltip>
        }
      >
        <Card.Body>
          <Card.Title>Today Present</Card.Title>
          <div className="d-flex flex-column align-items-center">
            <FaUsers size={50} color="#0891b2" />
            <h3 className="mt-2" style={{ color: "#0891b2", fontSize: "2rem" }}>
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                presentCount
              )}
            </h3>
          </div>
        </Card.Body>
      </OverlayTrigger>
    </Card>
  );
}

export default TodayPresent;
