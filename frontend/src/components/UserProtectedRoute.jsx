import React, { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Route protection wrapper for authenticated user tabs.
 * If user is not logged in, prevents URL copy-paste bypass
 * and redirects immediately to /login.
 */
const UserProtectedRoute = () => {
  const location = useLocation();

  const isAuthenticated = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      const parsed = JSON.parse(userStr);
      return Boolean(parsed && (parsed._id || parsed.id || parsed.userId || parsed.email || parsed.token));
    } catch {
      localStorage.removeItem('user');
      return false;
    }
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default UserProtectedRoute;
