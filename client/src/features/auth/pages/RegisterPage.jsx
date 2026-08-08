import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegisterMutation } from '../../../store/api/authApi';
import { AuthCard } from '../components/AuthCard';
import { RoleToggle } from '../components/RoleToggle';
import { FiUser, FiMail, FiLock, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const [role, setRole] = useState('buyer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        ...(role === 'vendor' ? { companyName: formData.companyName } : {})
      };

      await registerUser(payload).unwrap();
      setIsSubmitted(true);
      toast.success('Registration successful!');
    } catch (err) {
      const msg = err.data?.error?.message || err.data?.message || 'Registration failed';
      toast.error(msg);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <AuthCard title="Verify Your Email" subtitle="One step remaining to activate your account">
          <div className="text-center py-4">
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              We have sent a verification link to <span className="font-semibold text-white">{formData.email}</span>. Please check your inbox and confirm your email.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-950/50"
            >
              Proceed to Sign In
            </Link>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <AuthCard title="Create Account" subtitle="Join VendorHub AI supplier discovery platform">
        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleToggle role={role} onChange={setRole} />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

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

          {role === 'vendor' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company / Business Name</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Acme Industrial Supplies"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <input
                type="password"
                name="password"
                required
                minLength={8}
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
            className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 font-semibold text-white text-sm rounded-xl shadow-lg shadow-indigo-950/50 disabled:opacity-50 transition-all mt-4"
          >
            {isLoading ? 'Creating Account...' : `Register as ${role === 'vendor' ? 'Vendor' : 'Buyer'}`}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </div>
      </AuthCard>
    </div>
  );
};

export default RegisterPage;
