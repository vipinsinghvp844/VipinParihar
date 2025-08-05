// components/Layout.jsx
import React from "react";
import { Container } from "react-bootstrap";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const Layout = ({ children, userRole, handleLogout }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isPasswordChangePage = location.pathname === "/request-password-reset";

  return (
    <Container fluid className="p-0">
      {!isLoginPage && !isPasswordChangePage && (
        <>
          <main className="main">
            {userRole && <Sidebar userRole={userRole} />}
            <div className="right-main-box">
              <Header userRole={userRole} onLogout={handleLogout} />
              {children}
            </div>
          </main>
        </>
      )}
      {(isLoginPage || isPasswordChangePage) && children}
    </Container>
  );
};

export default Layout;
