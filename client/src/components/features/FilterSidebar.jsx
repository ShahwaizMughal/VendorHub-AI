import { useState } from 'react';

const COUNTRIES = ['Pakistan', 'Bangladesh', 'China', 'India', 'Vietnam'];
const INDUSTRIES = ['Textiles', 'Electronics', 'Furniture', 'Agriculture', 'Chemicals'];
const CERTIFICATIONS = ['ISO 9001', 'ISO 14001', 'BSCI', 'Oeko-Tex'];

function FilterSidebar({ onApply, onClear }) {
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [moqMax, setMoqMax] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [leadTimeMax, setLeadTimeMax] = useState('');

  const toggleCertification = (cert) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handleApply = () => {
    onApply({
      country: country || undefined,
      industry: industry || undefined,
      moqMax: moqMax ? Number(moqMax) : undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      certifications: certifications.length ? certifications : undefined,
      leadTimeMax: leadTimeMax ? Number(leadTimeMax) : undefined,
    });
  };

  const handleClear = () => {
    setCountry('');
    setIndustry('');
    setMoqMax('');
    setPriceMin('');
    setPriceMax('');
    setCertifications([]);
    setLeadTimeMax('');
    onClear();
  };

  const activeCount = [country, industry, moqMax, priceMin, priceMax, leadTimeMax]
    .filter(Boolean).length + certifications.length;

  const fieldClass =
    'w-full h-10 text-sm border border-slate-300 rounded-lg px-3 text-[#12172B] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#0F9B8E] focus:border-[#0F9B8E] transition-colors';

  const labelClass = 'text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2';

  return (
    <div className="w-full sm:w-72 bg-white border border-slate-200 rounded-xl p-6 space-y-7 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#12172B]">Filters</h3>
        {activeCount > 0 && (
          <span className="text-xs font-medium bg-[#0F9B8E]/10 text-[#0F9B8E] px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
        )}
      </div>

      <div>
        <label className={labelClass}>Country</label>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={fieldClass}>
          <option value="">Any</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Industry</label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={fieldClass}>
          <option value="">Any</option>
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Max MOQ</label>
        <input
          type="number"
          min="1"
          value={moqMax}
          onChange={(e) => setMoqMax(e.target.value)}
          placeholder="e.g. 5000"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Price range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min"
            className={fieldClass}
          />
          <span className="text-slate-400 text-sm">–</span>
          <input
            type="number"
            min="0"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Certifications</label>
        <div className="space-y-3">
          {CERTIFICATIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={certifications.includes(cert)}
                onChange={() => toggleCertification(cert)}
                className="w-4 h-4 rounded border-slate-300 text-[#0F9B8E] focus:ring-[#0F9B8E] accent-[#0F9B8E]"
              />
              {cert}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Max lead time (days)</label>
        <input
          type="number"
          min="1"
          value={leadTimeMax}
          onChange={(e) => setLeadTimeMax(e.target.value)}
          placeholder="e.g. 30"
          className={fieldClass}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleApply}
          className="flex-1 h-10 bg-[#0F9B8E] text-white text-sm font-medium rounded-lg hover:bg-[#0d8a7e] active:bg-[#0b756b] transition-colors"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="flex-1 h-10 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default FilterSidebar;