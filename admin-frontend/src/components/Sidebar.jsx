import React, { useEffect, useState } from "react";
import { Nav, Container, Offcanvas, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css"; // Import custom CSS for styling

const Sidebar = ({ userRole, pendingCount }) => {
  const [userStatus, setUserStatus] = useState("active");
  const [show, setShow] = useState(false);
  const userId = localStorage.getItem("user_id");

  // useEffect(() => {
  //   const fetchUserStatus = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${import.meta.env.VITE_API_CUSTOM_USERS}/${userId}`
  //       );
  //       setUserStatus(response.data.user_state);
  //     } catch (error) {
  //       console.error("Error fetching user status:", error);
  //     }
  //   };

  //   fetchUserStatus();
  // }, [userId]);

  const toggleMenu = () => {
    if (window.innerWidth < 992) {
      setShow((prev) => !prev);
    }
  };
   const handleNavClick = () => {
     if (window.innerWidth < 992) {
       setShow(false);
     }
   };

  const sidebarItems = {
    admin: [
      {
        to: "/admin-dashboard",
        icon: "bi-house-door",
        label: "Admin Dashboard",
      },
      {
        to: "/today-attendance",
        icon: "bi-record-btn",
        label: "Today Attendance",
      },
      {
        to: "/manage-attendance",
        icon: "bi-kanban",
        label: "Manage Attendance",
      },
      { to: "/all-employee", icon: "bi-people", label: "All Employee" },
      {
        to: "/add-employee-details",
        icon: "bi-file-earmark-spreadsheet",
        label: "Add Employee Details",
      },
      { to: "/add-employee", icon: "bi-person-add", label: "Add User" },
      {
        to: "/leave-requests",
        icon: "bi-person-exclamation",
        label: "Leave Requests",
        badge: pendingCount,
      },
      {
        to: "/leave-policies",
        icon: "bi-person-exclamation",
        label: "Leave Policies",
      },
      {
        to: "/leave-balance",
        icon: "bi-person-exclamation",
        label: "Leave Balance",
      },
      { to: "/manage-holidays", icon: "bi-cassette", label: "Manage Holidays" },
      { to: "/shifts", icon: "bi-emoji-sunglasses", label: "Shifts" },
      {
        to: "/attendance-csv",
        icon: "bi-filetype-csv",
        label: "Attendance CSV",
      },
      {
        to: "/manage-documents",
        icon: "bi-file-earmark-check",
        label: "Manage Documents",
      },
    ],
    hr: [
      { to: "/hr-dashboard", icon: "bi-house-door", label: "HR Dashboard" },
      ...(userStatus === "active"
        ? [
            {
              to: "/today-attendance",
              icon: "bi-record-btn",
              label: "Today Attendance",
            },
            {
              to: "/manage-attendance",
              icon: "bi-kanban",
              label: "Manage Attendance",
            },
            {
              to: "/add-employee-details",
              icon: "bi-file-earmark-spreadsheet",
              label: "Add Employee Details",
            },
            { to: "/all-employee", icon: "bi-people", label: "All Employee" },
            {
              to: "/manage-holidays",
              icon: "bi-cassette",
              label: "Manage Holidays",
            },
            {
              to: "/my-leaves",
              icon: "bi-person-exclamation",
              label: "My Leaves",
            },
            {
              to: "/leave-requests",
              icon: "bi-person-exclamation",
              label: "Leave Requests",
              badge: pendingCount,
            },
            {
              to: "/leave-policies",
              icon: "bi-person-exclamation",
              label: "Leave Policies",
            },
            {
              to: "/leave-balance",
              icon: "bi-person-exclamation",
              label: "Leave Balance",
            },
            { to: "/shifts", icon: "bi-emoji-sunglasses", label: "Shifts" },
            {
              to: "/manage-documents",
              icon: "bi-file-earmark-check",
              label: "Manage Documents",
            },
            {
              to: "/attendance-csv",
              icon: "bi-calendar-check",
              label: "Attendance Csv",
            },
          ]
        : []),
      { to: "/documents", icon: "bi-file-earmark-check", label: "Documents" },
    ],
    employee: [
      {
        to: "/employee-dashboard",
        icon: "bi-house-door",
        label: "Employee Dashboard",
      },
      ...(userStatus === "active"
        ? [
            {
              to: "/my-Attendance",
              icon: "bi-person-add",
              label: "My Attendance",
            },
            {
              to: "/my-leaves",
              icon: "bi-person-exclamation",
              label: "My Leaves",
            },
            {
              to: "/leave-entitlements",
              icon: "bi-person-exclamation",
              label: "My Balance Leave",
            },
            {
              to: "/holidays",
              icon: "bi-arrow-up-right-circle",
              label: "Holidays",
            },
            { to: "/our-shift", icon: "bi-emoji-sunglasses", label: "Shift" },
          ]
        : []),
      { to: "/documents", icon: "bi-file-earmark-check", label: "Documents" },
    ],
  };

  const renderNavItems = () =>
    (sidebarItems[userRole] || []).map(({ to, icon, label, badge }, index) => (
      <Nav.Link
        key={`${to}-${index}`}
        as={Link}
        to={to}
        onClick={handleNavClick}
      >
        <i className={`bi ${icon}`}></i> {label}
        {badge && <span className="badge bg-danger">{badge}</span>}
      </Nav.Link>
    ));

  return (
    <>
      {/* Toggle Button for Mobile */}
      <Button
        variant="danger"
        onClick={toggleMenu}
        className="d-md-none togglemobile"
      >
        <i className="bi bi-list"></i>
      </Button>

      {/* Mobile Sidebar */}
      <Offcanvas
        show={show}
        onHide={toggleMenu}
        className="sidenav sidenavmobile"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="sidebar-logo">
            <img
              src="/assets/Docusoft-logo-red.svg"
              alt="HRM"
              className="img-fluid"
            />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column sidebar">{renderNavItems()}</Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop Sidebar (Always Visible) */}
      <div className="d-none d-md-block position-fixed sidenav">
        <Container fluid className="sidebar-container">
          <img
            src="/assets/Docusoft-logo-red.png"
            alt="HRM"
            className="sidebar-logo"
          />
          <Nav className="flex-column sidebar">{renderNavItems()}</Nav>
        </Container>
      </div>
    </>
  );
};

export default Sidebar;
