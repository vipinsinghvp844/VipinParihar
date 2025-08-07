import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import "./Header.css";
import { useDispatch, useSelector } from "react-redux";
import {
  LoginUserAction,
  FetchUserProfileAction,
} from "../../../redux/actions/dev-aditya-action";
import {
  fetchNotificationsAll,
  unseenUserandMessagecount,
} from "../../../redux/actions/EmployeeDetailsAction";
import { useSocket } from "../WebSocketProvider";

const Header = ({ onLogout }) => {
  const { TotalNotifications, AllUnseenUserAndMessages } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );
  const socket = useSocket();
  // const [unreadUserCount, setUnreadUserCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileImage, setProfileImage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user_name = localStorage.getItem("user_name");
 const placeholderImage = import.meta.env.VITE_PLACEHOLDER_IMAGE;
  const popupRef = useRef(null);
  const { loginUserProfile, loginUserData } = useSelector(
    ({ AllReducers }) => AllReducers
  );


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        await dispatch(
          fetchNotificationsAll(1, (res) => {
            // console.log(res, "====res 7878");
          })
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (Array.isArray(TotalNotifications)) {
      const unreadNotifications = TotalNotifications.filter(
        (notif) => notif.is_read === "0"
      );
      // console.log(unreadNotifications, "====unreadNotifications 7878");
      setUnreadCount(unreadNotifications.length);
    }
  }, [TotalNotifications]);


  //unseen user and messages count 
  useEffect(() => {
    const fetchUnseenUserandMessegesCount = async () => {
      try {
        await dispatch(
          unseenUserandMessagecount((res) => {
            // console.log(res, "====res 7878");
          })
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchUnseenUserandMessegesCount();
  }, []);

  useEffect(() => {
    if (window.performance) {
      if (performance.navigation.type == 1) {
        const requestData = {
          email: localStorage.getItem("user_email"),
          password: localStorage.getItem("password"),
        };

        dispatch(LoginUserAction(requestData))
          .then(async (response1) => {})
          .catch((error) => {
            console.log("error", error);
          });
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileImage = await dispatch(FetchUserProfileAction());
// console.log(profileImage,"==============================");

        setProfileImage(profileImage?.data?.profile?.profile_image);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleLogout = async () => {
    const authtoken = localStorage.getItem("authtoken");
    const userId = localStorage.getItem("user_id");
if (socket && userId) {
  socket.emit("user-logout", userId);
}
    if (authtoken) {
      try {
        await axios.post(
          `http://localhost:5000/api/auth/logout`,{},
          { headers: { Authorization: `Bearer ${authtoken}` } }
        );

        onLogout();
        navigate("/");
      } catch (error) {
        console.error("Error updating offline status:", error);
      }
    }
    localStorage.clear();
    navigate("/");
  };

  const handleManageAccountClick = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Container fluid className="sticky-top bg-white pb-0 pt-0">
        <Row>
          <Col className="d-flex justify-content-end">
            <div className=" d-flex align-items-center me-5">
              <Link to="/notification">
                <i className="bi bi-bell"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
            </div>
            <div className="d-flex align-items-center me-5">
              <Link to="/chat" className="position-relative">
                <i className="bi bi-chat"></i>
                {AllUnseenUserAndMessages?.length > 0 &&
                  AllUnseenUserAndMessages[0]?.unread_senders_count > 0 && (
                    <span className="chat-badge">
                      {AllUnseenUserAndMessages[0].unread_senders_count}
                    </span>
                  )}
              </Link>
            </div>

            <div className="profile-container">
              <div
                className="profile-image-container d-flex"
                onClick={() => setShowPopup(!showPopup)}
              >
                <img
                  src={loginUserProfile || placeholderImage}
                  alt="Logged in user"
                  className="profile-image"
                />
                <h5 className="mt-1 USERNAMEHEAD">
                  {loginUserData?.name}{" "}
                  <i className="bi bi-chevron-down"></i>
                </h5>
              </div>
              {showPopup && (
                <div className="popup-dropdown" ref={popupRef}>
                  <FaTimes
                    className="popup-close"
                    onClick={() => setShowPopup(false)}
                  />
                  <img
                    src={loginUserProfile || placeholderImage}
                    alt="Profile"
                    className="popup-profile-image"
                  />
                  <h5>{loginUserData?.username}</h5>
                  <p>{loginUserData?.email}</p>
                  <Link
                    to="/manage-your-account"
                    className="manage-account-link"
                    onClick={handleManageAccountClick}
                  >
                    Manage Your Account
                  </Link>
                  <Button
                    variant="danger"
                    onClick={handleLogout}
                    className="popup-logout-button"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Header;
