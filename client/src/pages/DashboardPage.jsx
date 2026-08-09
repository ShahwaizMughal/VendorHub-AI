import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiSettings, FiShield, FiBriefcase, FiShoppingBag } from 'react-icons/fi';

export const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  console.log("User:", user);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100">
      {/* Welcome Hero Card */}
      <div className="p-8 bg-linear-to-r from-indigo-900/40 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-3xl shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-semibold text-indigo-300 mb-3">
              <FiShield className="w-3.5 h-3.5" />
              Role: <span className="uppercase font-mono">{user?.role}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Access AI-assisted B2B sourcing, supplier discovery, and store management capabilities.
            </p>
          </div>

          <Link
            to="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <FiSettings className="w-4 h-4 text-emerald-400" />
            Manage Settings
          </Link>
        </div>
      </div>

      {/* Account Verification & Role Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Email Verification</h3>
            {user?.isVerified ? (
              <FiCheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <FiAlertCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <p className="text-xl font-bold text-white mb-1">
            {user?.isVerified ? 'Verified' : 'Unverified'}
          </p>
          <p className="text-xs text-slate-400">
            {user?.isVerified
              ? 'Your email address is active and verified.'
              : 'Please check your inbox to verify your email address.'}
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Current Plan</h3>
            <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              {user?.plan || 'Free'}
            </span>
          </div>
          <p className="text-xl font-bold text-white mb-1 uppercase">{user?.plan || 'Free'} Tier</p>
          <p className="text-xs text-slate-400">Standard access to search and supplier directory.</p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Account Type</h3>
            {user?.role === 'vendor' ? (
              <FiBriefcase className="w-5 h-5 text-indigo-400" />
            ) : (
              <FiShoppingBag className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <p className="text-xl font-bold text-white mb-1 capitalize">{user?.role} Profile</p>
          <p className="text-xs text-slate-400">
            {user?.role === 'vendor' && user?.companyName
              ? `Company: ${user.companyName}`
              : 'Standard buyer procurement tools enabled.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
