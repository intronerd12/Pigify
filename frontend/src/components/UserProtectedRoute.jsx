import React, { useMemo, useEffect, Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';

/**
 * Pre-fetch all user tab chunks on idle so clicking tabs is 0ms delay.
 */
const prefetchUserTabChunks = () => {
  const idleFn = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
  idleFn(() => {
    import('../pages/Home').catch(() => {});
    import('../pages/AiAnalysis').catch(() => {});
    import('../pages/SortingGrading').catch(() => {});
    import('../pages/Overview').catch(() => {});
    import('../pages/Environment').catch(() => {});
    import('../pages/CommunityForum').catch(() => {});
  });
};

/**
 * Route protection wrapper for authenticated user tabs.
 * If user is not logged in, prevents URL copy-paste bypass
 * and redirects immediately to /login.
 * Wraps user tab outlet in Suspense to prevent top-level layout unmounting.
 */
const UserProtectedRoute = () => {
  const location = useLocation();

  useEffect(() => {
    prefetchUserTabChunks();
  }, []);

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

  return (
    <Suspense fallback={<PageLoader label="Loading Swine Module..." />}>
      <Outlet />
    </Suspense>
  );
};

export default UserProtectedRoute;
