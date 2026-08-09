import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';
import { FiSettings, FiLogOut, FiShield, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [logout] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu on Escape key press or outside click for WCAG accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.log(err);
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-slate-100" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-xl"
        >
          <div className="p-2 bg-linear-to-tr from-indigo-600 to-emerald-500 rounded-xl shadow-lg shadow-indigo-950/50 group-hover:scale-105 transition-transform">
            <FiCpu className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-linear-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            VendorHub <span className="text-indigo-400 font-extrabold">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="User account menu"
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-md">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.name}'s profile avatar`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <span className="inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {user.role}
                  </span>
                </div>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  aria-label="User actions"
                  className="absolute right-0 mt-2 w-56 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-xs font-medium text-white truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <FiShield className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                    Dashboard
                  </Link>

                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <FiSettings className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    Account Settings
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <FiLogOut className="w-4 h-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-md shadow-indigo-950/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
