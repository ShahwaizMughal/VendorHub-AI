import { useState } from 'react';
import api from '../lib/axios';

function getScoreColor(score) {
  if (score >= 90) return '#1E2A4A';
  if (score >= 80) return '#0F9B8E';
  return '#D97706';
}

function MatchRing({ score }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

function VendorCard({ vendor, onSaveChange }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Placeholder logo image until Dev 3's real Vendor model + Cloudinary upload is ready
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    vendor.companyName
  )}&background=1E2A4A&color=fff&bold=true&size=64`;

  const toggleSave = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/favorites/${vendor._id}`);
      setSaved(res.data.data.saved);
      if (onSaveChange) onSaveChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={avatarUrl}
            alt={vendor.companyName}
            className="w-11 h-11 rounded-full shrink-0 object-cover"
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-[#12172B] truncate">{vendor.companyName}</h3>
            <p className="text-xs text-slate-500">
              {vendor.country} · {vendor.industry}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">★ {vendor.rating}</p>
          </div>
        </div>
        {typeof vendor.matchScore === 'number' && <MatchRing score={vendor.matchScore} />}
      </div>

      {vendor.rationale && <p className="text-sm text-slate-600 mb-3">{vendor.rationale}</p>}

      {vendor.certifications && vendor.certifications.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {vendor.certifications.map((cert) => (
            <span
              key={cert}
              className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1"
            >
              {cert}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={toggleSave}
          disabled={loading}
          className={`flex-1 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            saved
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-[#0F9B8E] text-white hover:bg-[#0d8a7e]'
          }`}
        >
          {saved ? '✓ Saved' : 'Save vendor'}
        </button>
        <button
          className="flex-1 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          title="Vendor profile page coming once Dev 3's module ships"
        >
          View profile
        </button>
      </div>
    </div>
  );
}

export default VendorCard;