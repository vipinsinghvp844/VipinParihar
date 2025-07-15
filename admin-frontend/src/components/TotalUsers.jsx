import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Alert, Card } from "react-bootstrap";
import { FaUsers } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { GetTotalUserAction } from "../../redux/actions/EmployeeDetailsAction";

const TotalUsers = ({ setBirthdayMessages }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const dispatch = useDispatch();
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { TotalUsers } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsersCount = async () => {
      setIsLoading(true);
      try {
        const userCount = await axios.get(`http://localhost:5000/api/auth/user-count`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authtoken")}`,
          },
        });
        setTotalUsers(userCount.data.total);
        setIsLoading(false);
      } catch (err) {
        console.log(err, "Failed to fetch user count");
      }
    }
    fetchUsersCount();

  }, [TotalUsers]);
  return (
    <Card className="text-center shadow-sm border-0 rounded p-0">
      <Card.Body>
        <Card.Title>Total Users</Card.Title>
        <div className="d-flex flex-column align-items-center">
          <FaUsers size={50} color="#10b981" />
          <h3 className="mt-2" style={{ color: "#10b981", fontSize: "2rem" }}>
            {isLoading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              totalUsers
            )}
          </h3>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TotalUsers;
