import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CenterList from "../pages/CenterList";
import CenterDetails from "../pages/CenterDetails";
import AdminDashboard from "../pages/AdminDashboard";
import ProviderDashboard from "../pages/ProviderDashboard";
import MyAppointments from "../pages/MyAppointments";

const ProtectedRoute = ({ children, adminOnly = false, providerOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  if (providerOnly && user.role !== "provider" && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/centers" element={<CenterList />} />
      <Route path="/centers/:id" element={<CenterDetails />} />
      <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
      <Route path="/provider" element={<ProtectedRoute providerOnly><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
