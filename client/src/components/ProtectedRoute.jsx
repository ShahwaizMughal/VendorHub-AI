
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, selectIsInitialized } from '../store/slices/authSlice';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
