import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export const DeactivateModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [confirmText, setConfirmText] = useState('');
  const inputRef = useRef(null);

  const handleClose = useCallback(() => {
    setConfirmText('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === 'deactivate';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-dialog-title"
          aria-describedby="deactivate-dialog-desc"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md p-6 bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl text-slate-100"
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg"
          >
            <FiX className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3 mb-4 text-red-400">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <FiAlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h3 id="deactivate-dialog-title" className="text-lg font-semibold text-white">
                Deactivate Account
              </h3>
              <p className="text-xs text-red-400">Soft Delete Action</p>
            </div>
          </div>

          <p id="deactivate-dialog-desc" className="text-sm text-slate-300 mb-4 leading-relaxed">
            Deactivating your account will soft-delete your profile, invalidate active sessions, and restrict access. You can restore your account at any time by logging in and requesting restoration.
          </p>

          <div className="mb-6">
            <label htmlFor="deactivateConfirmInput" className="block text-xs text-slate-400 mb-2">
              Type <span className="font-mono text-red-400 font-bold">deactivate</span> to confirm:
            </label>
            <input
              id="deactivateConfirmInput"
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="deactivate"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-red-500 text-white transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isConfirmed || isLoading}
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-lg shadow-red-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {isLoading ? 'Deactivating...' : 'Confirm Deactivation'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeactivateModal;
