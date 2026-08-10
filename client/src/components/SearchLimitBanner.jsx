function SearchLimitBanner({ searchCount, limit = 10 }) {
  if (searchCount < limit) return null;

  const percent = Math.min((searchCount / limit) * 100, 100);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-amber-800">
          You've used <span className="font-semibold">{searchCount} of {limit}</span> free searches this month.
        </p>
        <button className="text-sm font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap flex items-center gap-1">
          Upgrade for unlimited <span aria-hidden>→</span>
        </button>
      </div>
      <div className="h-1.5 bg-amber-200/60 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default SearchLimitBanner;