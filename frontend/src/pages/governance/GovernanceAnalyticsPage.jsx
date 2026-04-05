import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getGovernanceStats,
  getLeaderboard,
  getProposals,
} from "../../services/governance.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiBarChart2,
  FiArrowLeft,
  FiTrendingUp,
} from "react-icons/fi";

const GovernanceAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentProposals, setRecentProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, leaderRes, proposalsRes] = await Promise.all([
          getGovernanceStats(),
          getLeaderboard(),
          getProposals({ limit: 10 }),
        ]);
        setStats(statsRes.data?.data);
        setLeaderboard(leaderRes.data?.data?.leaderboard || []);
        setRecentProposals(proposalsRes.data?.data?.proposals || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading)
    return <LoadingSpinner message="Loading governance analytics..." />;

  const statCards = [
    {
      icon: <FiBarChart2 />,
      label: "Total Proposals",
      value: stats?.totalProposals || 0,
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: <FiActivity />,
      label: "Active Proposals",
      value: stats?.activeProposals || 0,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      icon: <FiCheckCircle />,
      label: "Passed",
      value: stats?.passedProposals || 0,
      color: "text-green-600 bg-green-100",
    },
    {
      icon: <FiXCircle />,
      label: "Rejected",
      value: stats?.rejectedProposals || 0,
      color: "text-red-600 bg-red-100",
    },
    {
      icon: <FiUsers />,
      label: "Unique Voters",
      value: stats?.uniqueVoters || 0,
      color: "text-purple-600 bg-purple-100",
    },
    {
      icon: <FiTrendingUp />,
      label: "Total Votes Cast",
      value: stats?.totalVotes || 0,
      color: "text-indigo-600 bg-indigo-100",
    },
  ];

  const statusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-700";
      case "passed":
      case "executed":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/governance"
            className="text-gray-400 hover:text-primary-600 transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Governance Analytics
            </h1>
            <p className="text-sm text-gray-500">
              Platform health, voter participation, and proposal history
            </p>
          </div>
        </div>

        {/* Platform Health Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 text-center">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${s.color}`}
              >
                {s.icon}
              </div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiCheckCircle className="text-green-600" />
              <h3 className="font-semibold text-gray-900">Approval Rate</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats?.approvalRate || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Of all finalized proposals that passed
            </p>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiBarChart2 className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">
                Avg. Vote Approval
              </h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.avgApprovalPercent || 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Average upvote percentage across all proposals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voter Leaderboard */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiAward className="text-yellow-500" /> Top Voters
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                      #
                    </th>
                    <th className="text-left px-4 py-2 text-gray-500 font-medium">
                      Wallet
                    </th>
                    <th className="text-center px-4 py-2 text-gray-500 font-medium">
                      Votes
                    </th>
                    <th className="text-center px-4 py-2 text-gray-500 font-medium">
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-400"
                      >
                        No votes recorded yet
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((v, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {i === 0
                            ? "🥇"
                            : i === 1
                              ? "🥈"
                              : i === 2
                                ? "🥉"
                                : i + 1}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {v.walletAddress}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {v.totalVotes}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              v.accuracy >= 70
                                ? "bg-green-100 text-green-700"
                                : v.accuracy >= 40
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {v.accuracy}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Proposal History */}
          <div className="bg-white rounded-xl border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiActivity className="text-blue-500" /> Recent Proposals
              </h2>
            </div>
            <div className="divide-y">
              {recentProposals.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  No proposals yet
                </div>
              ) : (
                recentProposals.map((p) => (
                  <Link
                    key={p._id || p.proposalId}
                    to={`/governance/proposals/${p.proposalId}`}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400">
                            #{p.proposalId}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`}
                          >
                            {p.status}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {p.proposalType?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mt-1 truncate">
                          {p.businessId?.name ||
                            `Business proposal #${p.proposalId}`}
                        </p>
                      </div>
                      {p.upvotePercent !== undefined &&
                        p.status !== "active" && (
                          <div className="text-right ml-4">
                            <div className="text-sm font-semibold text-gray-700">
                              {p.upvotePercent}%
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {p.totalVoters || 0} voters
                            </div>
                          </div>
                        )}
                    </div>
                  </Link>
                ))
              )}
            </div>
            {recentProposals.length > 0 && (
              <div className="p-3 border-t text-center">
                <Link
                  to="/governance"
                  className="text-xs text-primary-600 hover:underline"
                >
                  View all proposals →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Governance Parameters */}
        {stats?.governanceParams && (
          <div className="mt-8 bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Governance Parameters
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Voting Duration</div>
                <div className="font-semibold">
                  {stats.governanceParams.VOTING_DURATION_MINUTES ||
                    (stats.governanceParams.VOTING_DURATION_DAYS &&
                      `${stats.governanceParams.VOTING_DURATION_DAYS} days`)}{" "}
                  {stats.governanceParams.VOTING_DURATION_MINUTES ? "min" : ""}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Min. Quorum</div>
                <div className="font-semibold">
                  {stats.governanceParams.MIN_QUORUM_VOTERS} voters
                </div>
              </div>
              <div>
                <div className="text-gray-500">Approval Threshold</div>
                <div className="font-semibold">
                  {stats.governanceParams.APPROVAL_THRESHOLD_PERCENT}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernanceAnalyticsPage;
