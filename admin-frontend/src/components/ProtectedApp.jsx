import React, { useState, useEffect } from "react";
import "../App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ChatBox2 from "./ChatBox2.jsx";
import { Container, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import AdDashboard from "./AdDashboard";
import HrDashboard from "./HrDashboard";
import HrShift from "./HrShift";
import LeaveRequests from "./LeaveRequests";
import LeaveEntitlements from "./LeaveEntitlements";
import AllEmpDetails from "./AllEmpDetails";
import AddNewEmployee from "./AddNewEmployee";
import AddAttendance from "./AddAttendance";
import ManageHolidays from "./HrManageHolidays";
import LeavePolicies from "./HrLeavePolicies";
import EmployeeAttDetails from "./EmployeeAttDetails";
import EmployeeDashboard from "./EmDashboard";
import EmployeeViewLeave from "./EmployeeViewLeave";
import ApplyLeave from "./EmApplyLeave";
import Holidays from "./EmHolidays";
import OurShift from "./OurShift";
import Login from "./Login";
import RequestPasswordReset from "./RequestPasswordReset";
import ResetPassword from "./ResetPassword";
import Sidebar from "./Sidebar";
import EditEmployee from "./EditEmployee";
import LeaveBalance from "./LeaveBalance";
import Notification from "./Notification";
import BirthdayMessages from "./BirthdayMessages";
import AttendanceCsv from "./AttendanceCsv";
import ManageYourAccount from "./ManageYourAccount";
import OverviewAttendance from "./OverviewAttendance";
import ManageAttendance from "./ManageAttendance";
import AttendanceRecord from "./AttendanceRecord";
import DateCalendar from "./DateCalendar";
import AddEmployeeDetails from "./AddEmployeeDetails";
import EmployeePerDetail from "./EmployeePerDetail";
import OfferLetter from "./OfferLetter";
import ManageDocument from "./ManageDocument";
import ExperienceLetter from "./ExperienceLetter";
import NocLetter from "./NocLetter";
import EmDocuments from "./EmDocuments.jsx";
import { WebSocketProvider } from "./WebSocketProvider";
import AdminAddEmpLeave from "./AdminAddEmpLeave.jsx";
import AddEmployee from "./AddEmployee";
import ViewProfileInChats from "./viewProfileInChats.jsx";

function ProtectedApp({ userRole, userId, onLogout }) {
  // const location = useLocation();

  return (
    <WebSocketProvider>
      {/* <Layout userRole={userRole} onLogout={onLogout}> */}
        <Routes>
          <Route path="/admin-dashboard" element={<AdDashboard />} />
          <Route path="/hr-dashboard" element={<HrDashboard />} />
          <Route
            path="/employee-dashboard"
            element={<EmployeeDashboard userId={userId} />}
          />
          <Route path="/shifts" element={<HrShift />} />
          <Route path="/leave-requests" element={<LeaveRequests />} />
          <Route path="/leave-policies" element={<LeavePolicies />} />
          <Route path="/leave-balance" element={<LeaveBalance />} />
          <Route path="/leave-entitlements" element={<LeaveEntitlements />} />
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
          <Route path="/manage-your-account" element={<ManageYourAccount />} />
          <Route path="/today-attendance" element={<OverviewAttendance />} />
          <Route path="/manage-attendance" element={<ManageAttendance />} />
          <Route path="/my-attendance" element={<AttendanceRecord />} />
          <Route path="/Calender" element={<DateCalendar />} />
          {/* <Route
                    path="/add-employee-details"
                    element={<AddEmployeeDetails />}
                  /> */}
          <Route path="/personal-detail/:id" element={<EmployeePerDetail />} />
          <Route path="/offer-letter" element={<OfferLetter />} />
          <Route path="/experience-letter" element={<ExperienceLetter />} />
          <Route path="/noc-letter" element={<NocLetter />} />
          <Route path="/manage-documents" element={<ManageDocument />} />
          <Route path="/documents" element={<EmDocuments />} />
          <Route path="/chat" element={<ChatBox2 />} />
          <Route path="/profile" element={<ViewProfileInChats />} />
        </Routes>
      {/* </Layout> */}
    </WebSocketProvider>
  );
}

export default ProtectedApp;
