import React, { useState, useEffect } from "react";
import "../../App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ChatBox2 from "../chat/ChatBox2.jsx";
// import { Container, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
// import Header from "./Header";
import AdDashboard from "../dashboard/AdDashboard.jsx";
import HrDashboard from "../dashboard/HrDashboard.jsx";
import HrShift from "../holidays/HrShift.jsx";
import LeaveRequests from "../leave/LeaveRequests.jsx";
import LeaveEntitlements from "../leave/LeaveEntitlements.jsx";
import AllEmpDetails from "../employee/AllEmpDetails.jsx";
import AddNewEmployee from "../employee/AddNewEmployee.jsx";
import AddAttendance from "../attendance/AddAttendance.jsx";
import ManageHolidays from "../holidays/HrManageHolidays.jsx";
import LeavePolicies from "../holidays/HrLeavePolicies.jsx";
import EmployeeAttDetails from "../attendance/EmployeeAttDetails.jsx";
import EmployeeDashboard from "../dashboard/EmDashboard.jsx";
import EmployeeViewLeave from "../leave/EmployeeViewLeave.jsx";
import ApplyLeave from "../leave/EmApplyLeave.jsx";
import Holidays from "../holidays/EmHolidays.jsx";
import OurShift from "../OurShift.jsx";
import Login from "../auth/Login.jsx";
import RequestPasswordReset from "../auth/RequestPasswordReset.jsx";
import ResetPassword from "../auth/ResetPassword.jsx";
// import Sidebar from "./Sidebar";
import EditEmployee from "../employee/EditEmployee.jsx";
import LeaveBalance from "../leave/LeaveBalance.jsx";
import Notification from "../Notification.jsx";
import BirthdayMessages from "../BirthdayMessages.jsx";
import AttendanceCsv from "../attendance/AttendanceCsv.jsx";
import ManageYourAccount from "../ManageYourAccount.jsx";
import OverviewAttendance from "../attendance/OverviewAttendance.jsx";
import ManageAttendance from "../attendance/ManageAttendance.jsx";
import AttendanceRecord from "../employee/AttendanceRecord.jsx";
import DateCalendar from "../DateCalendar.jsx";
import AddEmployeeDetails from "../employee/AddEmployeeDetails.jsx";
import EmployeePerDetail from "../EmployeePerDetail.jsx";
import OfferLetter from "../OfferLetter.jsx";
import ManageDocument from "../ManageDocument.jsx";
import ExperienceLetter from "../ExperienceLetter.jsx";
import NocLetter from "../NocLetter.jsx";
import EmDocuments from "../employee/EmDocuments.jsx";
import { WebSocketProvider } from "../WebSocketProvider.jsx";
import AdminAddEmpLeave from "../employee/AdminAddEmpLeave.jsx";
import AddEmployee from "../employee/AddEmployee.jsx";
import ViewProfileInChats from "../viewProfileInChats.jsx";

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
