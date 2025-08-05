import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ChatBox2 from "./components/ChatBox2.jsx";
import { Container, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import AdDashboard from "./components/AdDashboard";
import HrDashboard from "./components/HrDashboard";
import HrShift from "./components/HrShift";
import LeaveRequests from "./components/LeaveRequests";
import LeaveEntitlements from "./components/LeaveEntitlements";
import AllEmpDetails from "./components/AllEmpDetails";
import AddNewEmployee from "./components/AddNewEmployee";
import AddAttendance from "./components/AddAttendance";
import ManageHolidays from "./components/HrManageHolidays";
import LeavePolicies from "./components/HrLeavePolicies";
import EmployeeAttDetails from "./components/EmployeeAttDetails";
import EmployeeDashboard from "./components/EmDashboard";
import EmployeeViewLeave from "./components/EmployeeViewLeave";
import ApplyLeave from "./components/EmApplyLeave";
import Holidays from "./components/EmHolidays";
import OurShift from "./components/OurShift";
import Login from "./components/Login";
import RequestPasswordReset from "./components/RequestPasswordReset";
import ResetPassword from "./components/ResetPassword";
import Sidebar from "./components/Sidebar";
import EditEmployee from "./components/EditEmployee";
import LeaveBalance from "./components/LeaveBalance";
import Notification from "./components/Notification";
import BirthdayMessages from "./components/BirthdayMessages";
import AttendanceCsv from "./components/AttendanceCsv";
import ManageYourAccount from "./components/ManageYourAccount";
import OverviewAttendance from "./components/OverviewAttendance";
import ManageAttendance from "./components/ManageAttendance";
import AttendanceRecord from "./components/AttendanceRecord";
import DateCalendar from "./components/DateCalendar";
import AddEmployeeDetails from "./components/AddEmployeeDetails";
import EmployeePerDetail from "./components/EmployeePerDetail";
import OfferLetter from "./components/OfferLetter";
import ManageDocument from "./components/ManageDocument";
import ExperienceLetter from "./components/ExperienceLetter";
import NocLetter from "./components/NocLetter";
import EmDocuments from "./components/EmDocuments.jsx";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/Store.jsx";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
// import { WebSocketProvider } from "./components/WebSocketContext.jsx";
import { WebSocketProvider } from "./components/WebSocketProvider";
import AdminAddEmpLeave from "./components/AdminAddEmpLeave.jsx";
import AddEmployee from "./components/AddEmployee";
import ViewProfileInChats from "./components/viewProfileInChats.jsx";
import Layout from "./components/LayOut.jsx";
import ProtectedApp from "./components/ProtectedApp.jsx";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const handleLogin = (role, id) => {
    setUserRole(role);
    setUserId(id);
    localStorage.setItem("user", JSON.stringify({ roles: [role], id }));
  };
  const handleLogout = () => {
    setUserRole(null);
    setUserId(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const role = userData?.user?.role;

        if (role) {
          setUserRole(role);
        } else {
          console.error("Roles is not defined or not an array or is empty");
        }
        const id = userData?.user?.id;
        if (id) {
          setUserId(id);
        }
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }
  }, []);

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <Layout userRole={userRole} handleLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Login onLogin={handleLogin} />} />
                <Route
                  path="/request-password-reset"
                  element={<RequestPasswordReset />}
                />
                <Route
                  path="/reset-password/:key/:login"
                  element={<ResetPassword />}
                />
                <Route
                  path="/*"
                  element={
                    <ProtectedApp
                      userRole={userRole}
                      userId={userId}
                      onLogout={handleLogout}
                    />
                  }
                />
              </Routes>
            </Layout>
          </Router>
        </PersistGate>
      </Provider>

      <ToastContainer />
    </>
  );
}

export default App;
