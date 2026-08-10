function RecentSearches({ searches, onSelect }) {
  if (!searches || searches.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 relative">
      {searches.map((s) => (
        <button
          key={s._id}
          onClick={() => onSelect(s.query)}
          className="text-xs bg-white/10 text-white/70 px-3 py-1.5 rounded-full hover:bg-white/20 hover:text-white transition-colors"
        >
          {s.query}
        </button>
      ))}
    </div>
  );
}

export default RecentSearches;