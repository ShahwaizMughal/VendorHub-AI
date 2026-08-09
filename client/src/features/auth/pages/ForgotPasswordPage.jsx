import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../../store/api/authApi';
import { AuthCard } from '../components/AuthCard';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      setIsSent(true);
      toast.success('Reset link requested successfully');
    } catch (err) {
      toast.error(err.data?.error?.message || 'Request failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthCard title="Reset Password" subtitle="Enter your registered email address">
        {isSent ? (
          <div className="text-center py-4">
            <div className="mx-auto w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              If an account exists for <span className="font-semibold text-white">{email}</span>, a password reset link has been sent to your inbox.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-sm rounded-xl shadow-lg shadow-indigo-950/50 disabled:opacity-50 transition-all mt-4"
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </AuthCard>
    </div>
  );
};

export default ForgotPasswordPage;
