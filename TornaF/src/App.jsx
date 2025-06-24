import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./components/AuthContext.jsx";

import Layout from "./components/Layout/layout.jsx";
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const location = useLocation();
  const { currentUser, authLoading } = useAuth();

  if (authLoading) return <div className="p-4">Checking Authentication...</div>;

  // Prevent logged-in users from visiting login/register
  if (currentUser && ["/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* Layout wraps all child routes with Navbar */}
      <Route path="/" element={<Layout />}>
        {/* Root Route: Dashboard or Landing */}
        <Route index element={currentUser ? <Dashboard /> : <Landing />} />

        {/* Auth Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Signup />} />

        {/* Optional Protected Logout */}
        <Route
          path="logout"
          element={currentUser ? <Logout /> : <Navigate to="/login" replace />}
        />
      </Route>
    </Routes>
  );
}
