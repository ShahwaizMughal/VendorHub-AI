import { motion } from 'framer-motion';

export const AuthCard = ({ title, subtitle, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl shadow-indigo-950/20 text-slate-100"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
};

export default AuthCard;
