import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllBusinesses } from "../../services/business.api";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import BusinessCard from "../../components/business/BusinessCard";
import SuccessStories from "../../components/common/SuccessStories";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatters";
import {
  FiSearch,
  FiDollarSign,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiGlobe,
  FiLink,
} from "react-icons/fi";

const HomePage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [stats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isConnected, connectWallet } = useWallet();

  useEffect(() => {
    const load = async () => {
      try {
        const [bizRes] = await Promise.allSettled([
          getAllBusinesses({ status: "fundraising", limit: 3 }),
        ]);
        if (bizRes.status === "fulfilled")
          setBusinesses(bizRes.value.data.data?.businesses || []);
        // Stats will be fetched from a public endpoint if available
        // For now, we'll skip the admin stats call on the public page
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Invest in Your Community.
            <br />
            Earn Together.
          </h1>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Connect your wallet, buy fractional tokens of verified local
            businesses, earn monthly dividends — all powered by Stellar
            blockchain smart contracts. No signup needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center justify-center"
              >
                <FiLink className="mr-2" /> Connect Wallet to Invest
              </button>
            ) : (
              <Link
                to="/explore"
                className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center justify-center"
              >
                <FiSearch className="mr-2" /> Explore & Invest Now
              </Link>
            )}
            <Link
              to="/raise-funds"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 flex items-center justify-center"
            >
              Raise Funds for Your Business
            </Link>
          </div>
          {isConnected && user && (
            <p className="text-primary-200 text-sm mt-4">
              Connected as {user.name} — Ready to invest!
            </p>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiSearch className="text-3xl text-primary-600" />,
                title: "Discover a Local Business",
                desc: "Browse verified, AI-scored businesses in your area",
              },
              {
                icon: <FiDollarSign className="text-3xl text-primary-600" />,
                title: "Invest Any Amount",
                desc: "Buy fractional tokens starting from ₹100",
              },
              {
                icon: <FiTrendingUp className="text-3xl text-primary-600" />,
                title: "Earn Monthly Returns",
                desc: "Smart contracts automatically distribute your share of profits",
              },
            ].map((s, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-gray-50">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {s.icon}
                </div>
                <div className="text-sm text-primary-600 font-bold mb-2">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-12 bg-gray-900 text-white px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">
                {stats.totalActiveCampaigns || 0}
              </div>
              <div className="text-gray-400 text-sm">Active Businesses</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {stats.totalInvestors || 0}
              </div>
              <div className="text-gray-400 text-sm">Investors</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {formatCurrency(stats.totalAmountInvestedINR || 0)}
              </div>
              <div className="text-gray-400 text-sm">Invested</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {formatCurrency(stats.totalDividendsDistributedINR || 0)}
              </div>
              <div className="text-gray-400 text-sm">Dividends Paid</div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Businesses
            </h2>
            <Link
              to="/explore"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => (
                <BusinessCard key={b._id} business={b} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No businesses currently fundraising
            </p>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <SuccessStories />

      {/* Why Stellar */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powered by Stellar Blockchain
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiZap className="text-3xl text-yellow-500" />,
                title: "Fast",
                desc: "5-second finality for real-time transactions",
              },
              {
                icon: <FiShield className="text-3xl text-blue-500" />,
                title: "Cheap",
                desc: "Near-zero gas fees — distribute to 1000 investors for < $1",
              },
              {
                icon: <FiGlobe className="text-3xl text-green-500" />,
                title: "Transparent",
                desc: "Every transaction permanently recorded on-chain",
              },
            ].map((f, i) => (
              <div key={i} className="text-center p-6 rounded-xl border">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
