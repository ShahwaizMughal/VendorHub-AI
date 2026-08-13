import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVerifyEmailMutation } from '../../../store/api/authApi';
import { AuthCard } from '../components/AuthCard';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifyEmailMutation();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthCard title="Email Verification" subtitle="Activating your VendorHub AI account">
        <div className="text-center py-6">
          {isLoading && (
            <div className="flex flex-col items-center">
              <FiLoader className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <p className="text-sm text-slate-300">Verifying your token...</p>
            </div>
          )}

          {isSuccess && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Verified Successfully!</h3>
              <p className="text-xs text-slate-400 mb-6">
                Your email address has been verified. You may now log in to access your dashboard.
              </p>
              <Link
                to="/login"
                className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg"
              >
                Proceed to Login
              </Link>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-4">
                <FiXCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Verification Failed</h3>
              <p className="text-xs text-red-300 mb-6">
                {error?.data?.error?.message || 'Verification link is invalid or has expired.'}
              </p>
              <Link
                to="/login"
                className="px-6 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </AuthCard>
    </div>
  );
};

export default VerifyEmailPage;
