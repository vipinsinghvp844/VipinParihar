import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ChatBox from "./components/ChatBox.jsx";
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
import { WebSocketProvider } from "./components/WebSocketContext.jsx";
import AdminAddEmpLeave from "./components/AdminAddEmpLeave.jsx";
import AddEmployee from "./components/AddEmployee";

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

  // Create a component to handle the layout
  const Layout = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === "/";
    const isPasswordChangePage =
      location.pathname === "/request-password-reset";

    return (
      <Container fluid className="p-0">
        {!isLoginPage && !isPasswordChangePage && (
          <>
            <main className="main">
              {userRole && (
                <Sidebar userRole={userRole} />
              )}
              <div className="right-main-box">
                <Header
                  userRole={userRole}
                  onLogout={handleLogout}
                />
                {children}
              </div>
            </main>
          </>
        )}
        {(isLoginPage || isPasswordChangePage) && children}
      </Container>
    );
  };

  return (
    <>
      <WebSocketProvider>
        <Router>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <Layout>
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
                  <Route path="/admin-dashboard" element={<AdDashboard />} />
                  <Route path="/hr-dashboard" element={<HrDashboard />} />
                  <Route
                    path="/employee-dashboard"
                    element={<EmployeeDashboard userId={userId} />}
                  />
                  <Route path="/shifts" element={<HrShift />} />
                  <Route
                    path="/leave-requests"
                    element={
                      <LeaveRequests/>
                    }
                  />
                  <Route path="/leave-policies" element={<LeavePolicies />} />
                  <Route path="/leave-balance" element={<LeaveBalance />} />
                  <Route
                    path="/leave-entitlements"
                    element={<LeaveEntitlements />}
                  />
                  <Route path="/all-employee" element={<AllEmpDetails />} />
                  <Route path="/edit-employee/:id" element={<EditEmployee />} />
                  <Route path="/add-attendance" element={<AddAttendance />} />
                  {/* <Route path="/add-employee" element={<AddNewEmployee />} /> */}
                  <Route path="/add-employee" element={<AddEmployee />} />

                  <Route path="/manage-holidays" element={<ManageHolidays />} />
                  <Route path="/notification" element={<Notification />} />
                  <Route
                    path="/employee-attendance/:userId"
                    element={<EmployeeAttDetails />}
                  />

                  <Route path="/my-leaves" element={<EmployeeViewLeave />} />
                  <Route path="/apply-leave" element={<ApplyLeave />} />
                  <Route path="/holidays" element={<Holidays />} />
                  <Route path="/our-shift" element={<OurShift />} />
                  <Route path="/birthday" element={<BirthdayMessages />} />
                  <Route path="/attendance-csv" element={<AttendanceCsv />} />
                  <Route
                    path="/manage-your-account"
                    element={<ManageYourAccount />}
                  />
                  <Route
                    path="/today-attendance"
                    element={<OverviewAttendance />}
                  />
                  <Route
                    path="/manage-attendance"
                    element={<ManageAttendance />}
                  />
                  <Route path="/my-attendance" element={<AttendanceRecord />} />
                  <Route path="/Calender" element={<DateCalendar />} />
                  {/* <Route
                    path="/add-employee-details"
                    element={<AddEmployeeDetails />}
                  /> */}
                  <Route
                    path="/personal-detail/:id"
                    element={<EmployeePerDetail />}
                  />
                  <Route path="/offer-letter" element={<OfferLetter />} />
                  <Route
                    path="/experience-letter"
                    element={<ExperienceLetter />}
                  />
                  <Route path="/noc-letter" element={<NocLetter />} />
                  <Route
                    path="/manage-documents"
                    element={<ManageDocument />}
                  />
                  <Route path="/documents" element={<EmDocuments />} />
                  <Route path="/chat" element={<ChatBox />} />
                </Routes>
              </Layout>
            </PersistGate>
          </Provider>
        </Router>
      </WebSocketProvider>
      <ToastContainer />
    </>
  );
}

export default App;
