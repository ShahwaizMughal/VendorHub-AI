function Sidebar({ searchCount = 0, limit = 10 }) {
  const percent = Math.min((searchCount / limit) * 100, 100);

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-[#1E2A4A] min-h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="w-8 h-8 rounded-lg bg-[#0F9B8E] flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        <span className="font-bold text-white text-base tracking-tight">VendorHub AI</span>
      </div>

      <nav className="flex-1 px-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F9B8E]" />
          Dashboard
        </div>
      </nav>

      <div className="px-4 py-4 mx-3 mb-4 rounded-lg bg-white/5">
        <p className="text-xs text-white/50 mb-2">
          Free plan · {searchCount}/{limit} searches
        </p>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#0F9B8E] rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <button className="w-full text-xs font-semibold text-white bg-[#0F9B8E] hover:bg-[#0d8a7e] rounded-md py-2 transition-colors">
          Upgrade to Pro
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;