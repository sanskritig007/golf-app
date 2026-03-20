import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ isProtected = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container py-20 text-center text-primary">Loading...</div>;
  }

  // If the route is protected but the user is NOT logged in
  if (isProtected && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the route is for guests only (like login/signup) but they ARE logged in
  if (!isProtected && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
