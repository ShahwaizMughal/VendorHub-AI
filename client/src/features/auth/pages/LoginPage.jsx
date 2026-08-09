import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation, useRestoreAccountMutation } from '../../../store/api/authApi';
import { AuthCard } from '../components/AuthCard';
import { FiMail, FiLock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [deactivatedAccount, setDeactivatedAccount] = useState(false);
  const [loginUser, { isLoading }] = useLoginMutation();
  const [restoreAccount, { isLoading: isRestoring }] = useRestoreAccountMutation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDeactivatedAccount(false);
    try {
      await loginUser(formData).unwrap();
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err) {
      const code = err.data?.error?.code;
      const msg = err.data?.error?.message || err.data?.message || 'Login failed';

      if (code === 'ACCOUNT_DELETED') {
        setDeactivatedAccount(true);
        toast.error('This account was deactivated');
      } else {
        toast.error(msg);
      }
    }
  };

  const handleRestoreAccount = async () => {
    try {
      await restoreAccount().unwrap();
      toast.success('Account restored successfully! Please log in.');
      setDeactivatedAccount(false);
    } catch (err) {
      console.log(err);
      toast.error('Failed to restore account. Please contact support.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthCard title="Welcome Back" subtitle="Sign in to your VendorHub AI workspace">
        {deactivatedAccount && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
            <div className="flex items-center gap-2 mb-2 font-semibold text-red-200">
              <FiAlertCircle className="w-4 h-4 text-red-400" />
              Account Deactivated
            </div>
            <p className="mb-3 leading-relaxed">
              Your account has been soft-deleted. Would you like to restore your account and regain access?
            </p>
            <button
              type="button"
              onClick={handleRestoreAccount}
              disabled={isRestoring}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
              {isRestoring ? 'Restoring...' : 'Restore Account'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 font-semibold text-white text-sm rounded-xl shadow-lg shadow-indigo-950/50 disabled:opacity-50 transition-all mt-4"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Register Now
          </Link>
        </div>
      </AuthCard>
    </div>
  );
};

export default LoginPage;
