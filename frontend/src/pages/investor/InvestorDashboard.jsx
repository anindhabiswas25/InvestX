import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getMyInvestments,
  getMyDividendEarnings,
  getOnChainPortfolio,
} from "../../services/investment.api";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  formatCurrency,
  formatDate,
  getStellarExplorerUrl,
} from "../../utils/formatters";
import {
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
  FiCalendar,
  FiExternalLink,
  FiAlertCircle,
  FiActivity,
  FiRefreshCw,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";

const InvestorDashboard = () => {
  const { user } = useAuth();
  const { isConnected, connectWallet } = useWallet();
  const [investments, setInvestments] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [onChain, setOnChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onChainLoading, setOnChainLoading] = useState(false);
  const [tab, setTab] = useState("onchain");

  useEffect(() => {
    const load = async () => {
      try {
        const [invRes, earnRes] = await Promise.allSettled([
          getMyInvestments(),
          getMyDividendEarnings(),
        ]);
        if (invRes.status === "fulfilled")
          setInvestments(invRes.value.data.data?.investments || []);
        if (earnRes.status === "fulfilled")
          setEarnings(earnRes.value.data.data?.payoutHistory || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const fetchOnChain = async () => {
    setOnChainLoading(true);
    try {
      const res = await getOnChainPortfolio();
      setOnChain(res.data.data);
    } catch (err) {
      console.error("On-chain fetch failed:", err);
    }
    setOnChainLoading(false);
  };

  useEffect(() => {
    if (isConnected && user) fetchOnChain();
    // eslint-disable-next-line
  }, [isConnected, user]);

  const totalInvested = investments.reduce(
    (s, i) => s + (i.totalAmountINR || 0),
    0,
  );
  const totalEarned = earnings.reduce(
    (s, e) => s + (e.payoutAmountINR || 0),
    0,
  );
  const activeCount = investments.filter(
    (i) => i.status === "confirmed" || i.status === "active",
  ).length;

  if (loading) return <LoadingSpinner message="Loading your portfolio..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Investor Dashboard
        </h1>

        {/* Banners */}
        {!isConnected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center">
            <FiAlertCircle className="text-blue-500 mr-2" />
            <span className="text-sm text-blue-800">
              Connect your Stellar wallet to invest.
            </span>
            <button
              onClick={connectWallet}
              className="ml-auto text-sm text-blue-700 font-medium hover:underline"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Governance Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center mb-2">
              <FiShield className="text-indigo-500 mr-2" />
              <h3 className="font-semibold text-gray-900">
                Governance & Voting
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Vote on business proposals to shape the platform. 1 wallet = 1 vote.
            </p>
            <div className="flex space-x-3">
              <Link
                to="/governance"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
              >
                <FiCheckCircle className="mr-1" /> Vote Now
              </Link>
              <Link
                to="/governance/my-votes"
                className="bg-white text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50"
              >
                My Votes
              </Link>
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center mb-2">
              <FiTrendingUp className="text-green-500 mr-2" />
              <h3 className="font-semibold text-gray-900">
                Portfolio Summary
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Invested</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Earned</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(onChain?.summary?.totalDividendsINR || totalEarned)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              icon: <FiDollarSign />,
              label: "Total Invested",
              value: formatCurrency(totalInvested),
              color: "text-blue-600 bg-blue-100",
            },
            {
              icon: <FiTrendingUp />,
              label: "Total Earned",
              value: formatCurrency(
                onChain?.summary?.totalDividendsINR || totalEarned,
              ),
              color: "text-green-600 bg-green-100",
            },
            {
              icon: <FiPieChart />,
              label: "Active Investments",
              value: activeCount,
              color: "text-purple-600 bg-purple-100",
            },
            {
              icon: <FiActivity />,
              label: "XLM Balance",
              value: onChain
                ? `${parseFloat(onChain.xlmBalance || 0).toFixed(4)} XLM`
                : "-",
              color: "text-yellow-600 bg-yellow-100",
            },
            {
              icon: <FiCalendar />,
              label: "Dividend Records",
              value: earnings.length,
              color: "text-orange-600 bg-orange-100",
            },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border p-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${s.color}`}
              >
                {s.icon}
              </div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setTab("onchain")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "onchain" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"}`}
          >
            On-Chain Portfolio
          </button>
          <button
            onClick={() => setTab("investments")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "investments" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"}`}
          >
            My Investments
          </button>
          <button
            onClick={() => setTab("dividends")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "dividends" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"}`}
          >
            Dividend History
          </button>
        </div>

        {/* On-Chain Portfolio Tab */}
        {tab === "onchain" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiActivity className="mr-2 text-primary-600" /> Live On-Chain
                Data
              </h2>
              <button
                onClick={fetchOnChain}
                disabled={onChainLoading}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`mr-1 ${onChainLoading ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </button>
            </div>

            {onChainLoading && !onChain ? (
              <div className="text-center py-12 text-gray-500">
                <FiRefreshCw className="animate-spin mx-auto text-2xl mb-2" />
                <p>Reading blockchain data...</p>
              </div>
            ) : onChain && onChain.holdings.length > 0 ? (
              <div className="space-y-4">
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-primary-200 text-xs">
                        XLM Balance
                      </div>
                      <div className="text-xl font-bold">
                        {parseFloat(onChain.xlmBalance || 0).toFixed(4)}
                      </div>
                    </div>
                    <div>
                      <div className="text-primary-200 text-xs">
                        Portfolio Value
                      </div>
                      <div className="text-xl font-bold">
                        {formatCurrency(onChain.summary.totalHoldingValueINR)}
                      </div>
                    </div>
                    <div>
                      <div className="text-primary-200 text-xs">
                        Total Profit (Dividends)
                      </div>
                      <div className="text-xl font-bold text-green-300">
                        {formatCurrency(onChain.summary.totalDividendsINR)}
                      </div>
                    </div>
                    <div>
                      <div className="text-primary-200 text-xs">
                        Dividends in XLM
                      </div>
                      <div className="text-xl font-bold text-green-300">
                        {(onChain.summary.totalDividendsXLM || 0).toFixed(6)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Holdings */}
                {onChain.holdings.map((h, i) => (
                  <div key={i} className="bg-white rounded-xl border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {h.businessName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {h.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            h.businessStatus === "active"
                              ? "bg-green-100 text-green-700"
                              : h.businessStatus === "fundraising"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {h.businessStatus}
                        </span>
                        <a
                          href={h.stellarExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <FiExternalLink />
                        </a>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs">
                          On-Chain Tokens
                        </span>
                        <span className="font-bold text-gray-900">
                          {h.onChainTokenBalance}
                        </span>
                        {h.onChainError && (
                          <span className="text-yellow-500 text-xs block">
                            (from DB)
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Ownership
                        </span>
                        <span className="font-bold text-primary-600">
                          {parseFloat(h.ownershipPercentage) > 0 &&
                          parseFloat(h.ownershipPercentage) < 0.01
                            ? "< 0.01"
                            : h.ownershipPercentage}
                          %
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Holding Value
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(h.holdingValueINR)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Profit Earned
                        </span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(h.totalDividendsEarned)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">
                          Revenue Share
                        </span>
                        <span className="font-bold text-gray-900">
                          {h.revenueSharePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <FiActivity className="mx-auto text-4xl mb-3 text-gray-300" />
                <p className="mb-2">No on-chain holdings found.</p>
                <p className="text-xs text-gray-400">
                  Invest in a business to see your live on-chain portfolio here.
                </p>
                <Link
                  to="/explore"
                  className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  Explore Businesses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Investments Tab */}
        {tab === "investments" &&
          (investments.length > 0 ? (
            <div className="space-y-4">
              {investments.map((inv) => (
                <div key={inv._id} className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {inv.businessId?.name || "Business"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {inv.businessId?.category} | Invested{" "}
                        {formatDate(inv.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${inv.status === "confirmed" ? "bg-green-100 text-green-700" : inv.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Amount</span>
                      <div className="font-semibold">
                        {formatCurrency(inv.totalAmountINR)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Tokens</span>
                      <div className="font-semibold">{inv.tokensPurchased}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">TX</span>
                      {inv.xlmTransactionHash ? (
                        <a
                          href={getStellarExplorerUrl("tx", inv.xlmTransactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline text-xs flex items-center"
                        >
                          View <FiExternalLink className="ml-1" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="mb-4">You haven't made any investments yet.</p>
              <Link
                to="/explore"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
              >
                Explore Businesses
              </Link>
            </div>
          ))}

        {/* Dividends Tab */}
        {tab === "dividends" &&
          (earnings.length > 0 ? (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Business
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      TX
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(e.distributedAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {typeof e.businessId === "object"
                          ? e.businessId?.name
                          : "Business"}
                      </td>
                      <td className="px-4 py-3 text-green-600 font-semibold">
                        {formatCurrency(e.payoutAmountINR)}
                      </td>
                      <td className="px-4 py-3">
                        {e.txHash ? (
                          <a
                            href={getStellarExplorerUrl("tx", e.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline flex items-center"
                          >
                            View <FiExternalLink className="ml-1" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t bg-gray-50 text-right">
                <span className="text-sm text-gray-500">Total Earned: </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(totalEarned)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              No dividend records yet.
            </div>
          ))}

        {/* Link to full dividend page */}
        {tab === "dividends" && earnings.length > 0 && (
          <div className="text-center mt-4">
            <Link
              to="/dividends"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              View Detailed Dividend History
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorDashboard;
