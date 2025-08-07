import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useFormik } from "formik";
import Spinner from "../common/LoaderSpiner";
import "./Login.css"; // Import the CSS file
import { LoginUserReduser } from "../../../redux/redecer/AllReducers";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchUserProfileAction,
  LoginUserAction,
} from "../../../redux/actions/dev-aditya-action";
import { setValueForSideBarClick } from "../../../redux/redecer/EmployeeDetailReducers";

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const store = useSelector(({ loginUser }) => {
    loginUser;
  });
  const { TotalUsers, TotalAttendance, TotalEmployeeInLeave } = useSelector(
    ({ EmployeeDetailReducers }) => EmployeeDetailReducers
  );

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().required().email(),
      password: Yup.string().required(),
    }),
    onSubmit: async (data, { setSubmitting }) => {
      setLoading(true);
      try {
        const user = await dispatch(LoginUserAction(data));

        const userRole =
          user.user.role && user.user.role ? user.user.role : null;
        if (userRole) {
          const profilePick = await dispatch(FetchUserProfileAction());
          // if (profilePick.status == 200) {
          onLogin(userRole);

          // Redirect based on the role
          if (userRole === "admin") {
            navigate("/admin-dashboard");
          } else if (userRole === "hr") {
            navigate("/hr-dashboard");
          } else if (userRole === "employee") {
            navigate("/employee-dashboard");
          } else {
            navigate("/default-dashboard");
          }
          // }
        }
      } catch (error) {
        if (error.response.data.code === "[jwt_auth] incorrect_password") {
          setErrorMessage("Invalid password. Please try again.");
          setShowPopup(true);
        } else if (error.response.data.code === "[jwt_auth] invalid_email") {
          setErrorMessage(
            "Invalid email address. Please check and try again. "
          );
          setShowPopup(true);
        } else {
          setErrorMessage("Login failed. Please try again later.");
        }
        setShowPopup(true);
        // console.log(error, "============error");
      } finally {
        setLoading(false);
        setSubmitting(false); // Ensure formik.isSubmitting is reset
      }
    },
  });

  useEffect(() => {
    let authToken = localStorage.getItem("authtoken");

    if (authToken) {
      let userRole = localStorage.getItem("role");

      dispatch(setValueForSideBarClick(0));

      onLogin(userRole);
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "hr") {
        navigate("/hr-dashboard");
      } else if (userRole === "employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/default-dashboard");
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === "Escape") {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showPopup]);

  return (
    <Container fluid className="maincontainer">
      <Row className="w-100">
        <Col
          md={4}
          className="mx-auto"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="cardcontainer">
            <h2 className="text-center mb-4">Login</h2>
            <Form onSubmit={formik.handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Control
                  name="email"
                  type="email"
                  placeholder="Type your username"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Control
                  name="password"
                  type="password"
                  placeholder="Type your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end mb-3">
                <Link
                  to="/request-password-reset"
                  className="forgot-password-link"
                >
                  Forget password?
                </Link>
              </div>
              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3 button-login"
                disabled={formik.isSubmitting}
              >
                LOGIN
              </Button>
            </Form>
            {loading && (
              <div className="overlay">
                <Spinner size={100} color="#fff" />
              </div>
            )}
            {showPopup && (
              <div className="popup">
                <div className="popup-content">
                  <span
                    className="popup-close"
                    onClick={() => setShowPopup(false)}
                  >
                    &times;
                  </span>
                  <p>{errorMessage}</p>
                  {/* <Link
                    variant="primary"
                    onClick={() => setShowPopup(false)}
                    to={"/request-password-reset"}
                    className="mx-2 "
                  >
                    Forget Your Password
                  </Link> */}
                  <Button onClick={() => setShowPopup(false)}>Try Again</Button>
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
