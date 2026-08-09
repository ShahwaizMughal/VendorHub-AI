import { Link, Route, Routes } from "react-router-dom";
import RFQBuilder from "./pages/RFQBuilder";
import RFQDetail from "./pages/RFQDetail";
import QuoteComparison from "./pages/QuoteComparison";
import OrdersList from "./pages/OrdersList";
import OrderDetail from "./pages/OrderDetail";
import "./App.css";

function App() {
  return <div className="app-shell"><header className="navbar"><Link className="brand" to="/rfqs/new">VendorHub AI</Link><nav><Link to="/rfqs/new">New RFQ</Link><Link to="/orders">Orders</Link></nav></header><main className="content"><Routes><Route path="/" element={<RFQBuilder />} /><Route path="/rfqs/new" element={<RFQBuilder />} /><Route path="/rfqs/:id" element={<RFQDetail />} /><Route path="/rfqs/:id/quotes" element={<QuoteComparison />} /><Route path="/orders" element={<OrdersList />} /><Route path="/orders/:id" element={<OrderDetail />} /></Routes></main></div>;
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useRefreshMutation } from './store/api/authApi';
import { setCredentials, setInitialized } from './store/slices/authSlice';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './features/auth/pages/RegisterPage';
import LoginPage from './features/auth/pages/LoginPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import SettingsPage from './features/auth/pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';

export function App() {
  const dispatch = useDispatch();
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const result = await refresh().unwrap();
        if (result?.data?.accessToken && isMounted) {
          dispatch(setCredentials({ accessToken: result.data.accessToken }));
        }
      } catch (err) {
        // Silent refresh failed (no cookie or expired) - normal for unauthenticated users
        console.log("Silent refresh failed:", err);
      } finally {
        if (isMounted) {
          dispatch(setInitialized(true));
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [refresh, dispatch]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #1e293b',
            borderRadius: '0.75rem',
            fontSize: '0.875rem'
          }
        }}
      />
      <Navbar />

      <main className="w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
