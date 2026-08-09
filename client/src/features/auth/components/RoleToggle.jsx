import { motion } from 'framer-motion';
import { FiShoppingBag, FiBriefcase } from 'react-icons/fi';

export const RoleToggle = ({ role, onChange }) => {
  return (
    <div
      role="tablist"
      aria-label="Account Role Selection"
      className="relative flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6"
    >
      <button
        type="button"
        role="tab"
        aria-selected={role === 'buyer'}
        aria-controls="buyer-panel"
        id="buyer-tab"
        onClick={() => onChange('buyer')}
        className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg ${
          role === 'buyer' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {role === 'buyer' && (
          <motion.div
            layoutId="roleTab"
            className="absolute inset-0 bg-linear-to-r from-indigo-600 to-indigo-500 rounded-lg shadow-md"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <FiShoppingBag className="w-4 h-4" aria-hidden="true" />
          Buyer Account
        </span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={role === 'vendor'}
        aria-controls="vendor-panel"
        id="vendor-tab"
        onClick={() => onChange('vendor')}
        className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg ${
          role === 'vendor' ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {role === 'vendor' && (
          <motion.div
            layoutId="roleTab"
            className="absolute inset-0 bg-linear-to-r from-indigo-600 to-indigo-500 rounded-lg shadow-md"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <FiBriefcase className="w-4 h-4" aria-hidden="true" />
          Vendor Storefront
        </span>
      </button>
    </div>
  );
};

export default RoleToggle;
