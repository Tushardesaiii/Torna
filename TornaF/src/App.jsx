import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./components/AuthContext.jsx";

import Layout from "./components/Layout/layout.jsx";
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DocumentEdit from "./pages/DocumentEdit.jsx";

export default function App() {
  const location = useLocation();
  const { currentUser, authLoading } = useAuth();

  if (authLoading) return <div className="p-4">Checking Authentication...</div>;

  if (currentUser && ["/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={currentUser ? <Dashboard /> : <Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Signup />} />
        <Route
          path="logout"
          element={currentUser ? <Logout /> : <Navigate to="/login" replace />}
        />
        <Route
          path="documents/:id/edit"
          element={currentUser ? <DocumentEdit /> : <Navigate to="/login" replace state={{ from: location }} />}
        />
        <Route path="dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/login" replace />} />
        {/* Optional: fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
