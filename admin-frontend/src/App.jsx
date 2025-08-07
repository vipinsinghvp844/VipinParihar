import React, { useState, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";  
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/auth/Login.jsx";
import RequestPasswordReset from "./components/auth/RequestPasswordReset.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/Store.jsx";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import Layout from "./components/LayOut.jsx";
import ProtectedApp from "./components/common/ProtectedApp.jsx";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (role, id) => {
    setUserRole(role);
    setUserId(id);
    localStorage.setItem("user", JSON.stringify({ user: { role, id } }));
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserId(null);
    localStorage.clear();
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const role = parsed?.user?.role;
        const id = parsed?.user?.id;
        if (role && id) {
          setUserRole(role);
          setUserId(id);
        }
      } catch (e) {
        console.error("Invalid user JSON:", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
                  userId={userId}
                  onLogout={handleLogout}
                />
              }
            />
          </Routes>
        </Layout>
      </PersistGate>
      <ToastContainer />
    </Provider>
  );
}

export default App;
