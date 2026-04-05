import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlatformStats } from '../../services/admin.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { FiUsers, FiFileText, FiActivity, FiDollarSign, FiArrowRight, FiShield, FiCheckCircle } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPlatformStats();
        setStats(res.data.data);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading admin panel..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mb-6">System monitoring &mdash; governance decisions are handled by the community</p>

        {/* Governance Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <FiShield className="text-green-600 text-xl mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-800">Decentralized Governance Active</h3>
            <p className="text-sm text-green-700 mt-1">
              Business approvals and revenue verification are now handled by community voting (1 wallet = 1 vote). 
              Admin manual approve/reject has been retired.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <FiUsers />, label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-blue-600 bg-blue-100' },
            { icon: <FiFileText />, label: 'Pending Applications', value: stats?.businessesByStatus?.pending || 0, color: 'text-yellow-600 bg-yellow-100' },
            { icon: <FiActivity />, label: 'Active Campaigns', value: stats?.totalActiveCampaigns || 0, color: 'text-green-600 bg-green-100' },
            { icon: <FiDollarSign />, label: 'Total Dividends', value: formatCurrency(stats?.totalDividendsDistributedINR || 0), color: 'text-purple-600 bg-purple-100' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>{s.icon}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/governance" className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Governance Proposals</h3>
                <p className="text-sm text-gray-500 mt-1">View active community votes and proposal history</p>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </Link>
          <Link to="/governance/analytics" className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Governance Analytics</h3>
                <p className="text-sm text-gray-500 mt-1">Voter participation and platform health metrics</p>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </Link>
          <Link to="/admin" className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
                <p className="text-sm text-gray-500 mt-1">View users and manage KYC</p>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </Link>
        </div>

        {/* Deprecated Notice */}
        <div className="mt-8 bg-gray-100 rounded-xl p-4 text-center">
          <FiCheckCircle className="inline text-gray-400 mr-2" />
          <span className="text-sm text-gray-500">
            Manual business approvals and revenue verification have been replaced by on-chain governance. 
            All decisions are now made by registered users through community voting (1 wallet = 1 vote).
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
