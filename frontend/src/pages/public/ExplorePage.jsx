import React, { useState, useEffect } from 'react';
import { getAllBusinesses } from '../../services/business.api';
import BusinessCard from '../../components/business/BusinessCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiFilter, FiX } from 'react-icons/fi';

const CATEGORIES = [
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education', label: 'Education' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];
const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: '-raisedAmount', label: 'Most Funded' },
  { value: '-revenueSharePercentage', label: 'Highest Yield' },
];

const ExplorePage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ category: '', riskRating: '', sort: '-createdAt', status: 'fundraising' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, ...filters };
        Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
        const res = await getAllBusinesses(params);
        setBusinesses(res.data.data?.businesses || []);
        setTotalPages(res.data.data?.pagination?.pages || 1);
      } catch { }
      setLoading(false);
    };
    load();
  }, [page, filters]);

  const updateFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: p[key] === value ? '' : value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Explore Businesses</h1>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center text-sm text-primary-600 font-medium">
            {showFilters ? <FiX className="mr-1" /> : <FiFilter className="mr-1" />} Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={`md:block md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl border p-4 space-y-5 sticky top-20">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                {['fundraising', 'active'].map((s) => (
                  <label key={s} className="flex items-center space-x-2 py-1">
                    <input type="radio" checked={filters.status === s} onChange={() => updateFilter('status', s)} className="text-primary-600" />
                    <span className="text-sm text-gray-600 capitalize">{s}</span>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
                {CATEGORIES.map((c) => (
                  <label key={c.value} className="flex items-center space-x-2 py-1">
                    <input type="checkbox" checked={filters.category === c.value} onChange={() => updateFilter('category', c.value)} className="text-primary-600 rounded" />
                    <span className="text-sm text-gray-600">{c.label}</span>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Risk Rating</h3>
                {['LOW', 'MEDIUM', 'HIGH'].map((r) => (
                  <label key={r} className="flex items-center space-x-2 py-1">
                    <input type="checkbox" checked={filters.riskRating === r} onChange={() => updateFilter('riskRating', r)} className="text-primary-600 rounded" />
                    <span className="text-sm text-gray-600">{r}</span>
                  </label>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h3>
                <select value={filters.sort} onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Business Grid */}
          <div className="flex-1">
            {loading ? <LoadingSpinner /> : (
              businesses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businesses.map((b) => <BusinessCard key={b._id} business={b} />)}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)}
                          className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 text-gray-500">No businesses found matching your filters</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
