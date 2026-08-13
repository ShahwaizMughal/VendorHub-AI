import { useState, useEffect } from 'react';
import api from '../lib/axios';
import VendorCard from '../components/VendorCard';
import VendorCardSkeleton from '../components/VendorCardSkeleton';
import RecentSearches from '../components/RecentSearches';
import FilterSidebar from '../components/features/FilterSidebar';
import Sidebar from '../components/layout/Sidebar';

export function BuyerSearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState({
    activeRfqs: 0,
    pendingQuotes: 0,
    orders: 0,
    savedVendors: 0,
    searchCountThisMonth: 0,
  });
  const [recentSearches, setRecentSearches] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/buyer');
      setDashboard(res.data.data);
      setRecentSearches(res.data.data.recentSearches || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDefaultVendors = async (currentFilters) => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilters.country) params.country = currentFilters.country;
      if (currentFilters.industry) params.industry = currentFilters.industry;
      if (currentFilters.certifications && currentFilters.certifications.length > 0) {
        params.certifications = currentFilters.certifications.join(',');
      }

      const res = await api.get('/search/default', { params });
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Standard fetch-on-mount pattern used throughout this codebase;
  // migrating to Suspense-based data fetching is a real architectural
  // change, not a foundation/integration fix, so it's out of scope here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
    fetchDefaultVendors({});
  }, []);

  const runSearch = async (searchQuery, searchFilters) => {
    if (searchQuery.trim().length < 3) {
      setError('Please enter at least 3 characters to search.');
      return;
    }
    if (searchQuery.trim().length > 300) {
      setError('Search query is too long (max 300 characters).');
      return;
    }
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.post('/search/ai', { query: searchQuery, filters: searchFilters });
      setResults(res.data.data);
      fetchDashboard();
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    runSearch(query, filters);
  };

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    if (query.trim().length >= 3) {
      runSearch(query, newFilters);
    } else {
      fetchDefaultVendors(newFilters);
    }
  };

  const handleFilterClear = () => {
    setFilters({});
    if (query.trim().length >= 3) {
      runSearch(query, {});
    } else {
      fetchDefaultVendors({});
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <Sidebar searchCount={dashboard.searchCountThisMonth} />

      <div className="flex-1 min-w-0">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F9B8E] flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-[#12172B] text-lg tracking-tight">VendorHub AI</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">Buyer Dashboard</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F9B8E] to-[#1E2A4A] flex items-center justify-center text-white text-xs font-semibold">
                AF
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#12172B] tracking-tight">Welcome back</h1>
            <p className="text-slate-500 mt-1">Here's what's happening with your sourcing today.</p>
          </div>

          {/* Search hero */}
          <div className="relative overflow-hidden bg-[#1E2A4A] rounded-2xl p-7 mb-6 shadow-sm">
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#0F9B8E] opacity-20 blur-2xl pointer-events-none" />
            <label className="text-sm font-medium text-white/70 mb-2 block relative">
              Describe what you're sourcing
            </label>
            <div className="flex gap-3 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Need 10,000 cotton t-shirts manufactured in Pakistan"
                className="flex-1 border-none rounded-lg px-4 py-3 text-white placeholder:text-white/40 bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#0F9B8E]"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-[#0F9B8E] hover:bg-[#0d8a7e] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && <p className="text-sm text-red-300 mt-2 relative">{error}</p>}

            <RecentSearches
              searches={recentSearches}
              onSelect={(q) => {
                setQuery(q);
              }}
            />
          </div>

          {/* Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active RFQs', value: dashboard.activeRfqs },
              { label: 'Pending Quotes', value: dashboard.pendingQuotes },
              { label: 'Orders', value: dashboard.orders },
              { label: 'Saved Vendors', value: dashboard.savedVendors, accent: true },
            ].map((widget) => (
              <div key={widget.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-medium text-slate-400">{widget.label}</p>
                <p className={`text-2xl font-bold mt-2 ${widget.accent ? 'text-[#0F9B8E]' : 'text-[#12172B]'}`}>
                  {widget.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <FilterSidebar onApply={handleFilterApply} onClear={handleFilterClear} />

            <div className="flex-1">
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-[#12172B]">
                    {loading
                      ? 'Finding matches...'
                      : searched
                      ? `${results.length} vendors found`
                      : `Browse vendors (${results.length})`}
                  </h2>
                  {!loading && results.length > 0 && (
                    <span className="text-xs text-slate-400">Sorted by match</span>
                  )}
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <VendorCardSkeleton key={i} />
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <p className="text-slate-500">No vendors matched your search. Try broadening your search terms.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((vendor) => (
                      <VendorCard key={vendor._id} vendor={vendor} onSaveChange={fetchDashboard} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

