import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { selectIsAuthenticated } from './store/slices/authSlice';

import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import SettingsPage from './features/auth/pages/SettingsPage';

import DashboardPage from './pages/DashboardPage';
import { BuyerSearchPage } from './pages/BuyerSearchPage';
import RFQBuilder from './pages/RFQBuilder';
import RFQDetail from './pages/RFQDetail';
import QuoteComparison from './pages/QuoteComparison';
import OrdersList from './pages/OrdersList';
import OrderDetail from './pages/OrderDetail';

/** Shared chrome (Navbar) for every route except the buyer search page,
 * which already renders its own full header + sidebar. */
function NavbarLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

/** `/` has no fixed meaning in the SRS — send people somewhere sensible
 * based on whether they're logged in, rather than 404ing the root. */
function RootRedirect() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2 bg-slate-950 text-slate-100">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-slate-400">This page doesn&apos;t exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<NavbarLayout />}>
        {/* --- Public auth routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* --- Protected: any authenticated role --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* --- Protected: buyer-facing procurement workflow (SRS §3.4) --- */}
        <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
          <Route path="/rfq/new" element={<RFQBuilder />} />
          <Route path="/rfq/:id" element={<RFQDetail />} />
          <Route path="/rfq/:id/quotes" element={<QuoteComparison />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>
      </Route>

      {/* Standalone: renders its own header/sidebar, so it sits outside NavbarLayout */}
      <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
        <Route path="/search" element={<BuyerSearchPage />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
