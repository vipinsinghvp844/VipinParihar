// components/Layout.jsx
import React from "react";
import { Container } from "react-bootstrap";
import Sidebar from "./common/Sidebar";
import Header from "./common/Header";
import { useLocation } from "react-router-dom";

const Layout = ({ children, userRole, handleLogout }) => {
  const location = useLocation();
  const path = location.pathname;

  // Check: Auth pages only
  const isAuthPage =
    path === "/" ||
    path === "/request-password-reset" ||
    path.startsWith("/reset-password");

  const isAuthenticated = !!userRole; // true if user is logged in

  return (
    <Container fluid className="p-0">
      {/* Auth Pages: Only show children */}
      {isAuthPage && children}

      {/* Protected pages */}
      {!isAuthPage && isAuthenticated && (
        <main className="main">
          <Sidebar userRole={userRole} />
          <div className="right-main-box">
            <Header userRole={userRole} onLogout={handleLogout} />
            {children}
          </div>
        </main>
      )}
    </Container>
  );
};


export default Layout;
