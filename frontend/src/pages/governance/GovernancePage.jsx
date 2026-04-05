import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getActiveProposals,
  getProposals,
  getGovernanceStats,
  getLeaderboard,
} from "../../services/governance.api";
import ProposalCard from "../../components/governance/ProposalCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  FiActivity,
  FiAward,
  FiBarChart2,
  FiCheckCircle,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

const GovernancePage = () => {
  const [tab, setTab] = useState("active");
  const [activeProposals, setActiveProposals] = useState([]);
  const [allProposals, setAllProposals] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [activeRes, allRes, statsRes, lbRes] = await Promise.allSettled([
          getActiveProposals(),
          getProposals({ limit: 50 }),
          getGovernanceStats(),
          getLeaderboard(),
        ]);
        if (activeRes.status === "fulfilled")
          setActiveProposals(activeRes.value.data.data?.proposals || []);
        if (allRes.status === "fulfilled")
          setAllProposals(allRes.value.data.data?.proposals || []);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (lbRes.status === "fulfilled")
          setLeaderboard(lbRes.value.data.data?.leaderboard || []);
      } catch (err) {
        console.error("Governance load error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const passedProposals = allProposals.filter(
    (p) => p.status === "passed" || p.status === "executed",
  );
  const rejectedProposals = allProposals.filter((p) => p.status === "rejected");

  if (loading) return <LoadingSpinner message="Loading governance..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Governance</h1>
            <p className="text-sm text-gray-500 mt-1">
              Vote on business proposals and shape the platform. 1 wallet = 1 vote.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <Link
              to="/governance/analytics"
              className="text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg font-medium hover:bg-primary-100 transition-colors flex items-center gap-1"
            >
              <FiBarChart2 /> Analytics
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              {
                icon: <FiActivity />,
                label: "Active Votes",
                value: stats.activeProposals,
                color: "text-green-600 bg-green-100",
              },
              {
                icon: <FiCheckCircle />,
                label: "Passed",
                value: stats.passedProposals,
                color: "text-blue-600 bg-blue-100",
              },
              {
                icon: <FiXCircle />,
                label: "Rejected",
                value: stats.rejectedProposals,
                color: "text-red-600 bg-red-100",
              },
              {
                icon: <FiUsers />,
                label: "Total Voters",
                value: stats.uniqueVoters,
                color: "text-purple-600 bg-purple-100",
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border p-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}
                >
                  {s.icon}
                </div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-6 w-fit">
          {[
            { key: "active", label: `Active (${activeProposals.length})` },
            { key: "results", label: "Results" },
            { key: "leaderboard", label: "Leaderboard" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "active" && (
          <div>
            {activeProposals.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <FiActivity className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">
                  No Active Proposals
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  New proposals will appear here when businesses complete
                  verification.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProposals.map((p) => (
                  <ProposalCard key={p.proposalId} proposal={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "results" && (
          <div className="space-y-6">
            {/* Passed */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FiCheckCircle className="mr-2 text-green-500" /> Approved
              </h3>
              {passedProposals.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No approved proposals yet.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {passedProposals.map((p) => (
                    <ProposalCard key={p.proposalId} proposal={p} />
                  ))}
                </div>
              )}
            </div>
            {/* Rejected */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FiXCircle className="mr-2 text-red-500" /> Rejected
              </h3>
              {rejectedProposals.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No rejected proposals yet.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedProposals.map((p) => (
                    <ProposalCard key={p.proposalId} proposal={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FiAward className="mr-2 text-indigo-500" /> Top Governance
                Participants
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                1 wallet = 1 vote. Rankings based on participation and accuracy.
              </p>
            </div>
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No votes have been cast yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Wallet</th>
                    <th className="px-4 py-3">Votes</th>
                    <th className="px-4 py-3">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leaderboard.map((v, i) => (
                    <tr key={i} className={i < 3 ? "bg-indigo-50/30" : ""}>
                      <td className="px-4 py-3 font-semibold">
                        {i === 0
                          ? "1st"
                          : i === 1
                            ? "2nd"
                            : i === 2
                              ? "3rd"
                              : i + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <a
                          href={`https://stellar.expert/explorer/testnet/account/${v.fullWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-600"
                        >
                          {v.walletAddress}
                        </a>
                      </td>
                      <td className="px-4 py-3">{v.totalVotes}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            v.accuracy >= 70
                              ? "text-green-600 font-medium"
                              : "text-gray-600"
                          }
                        >
                          {v.accuracy}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* My Votes Link */}
        <div className="mt-8 text-center">
          <Link
            to="/governance/my-votes"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <FiBarChart2 className="mr-1" />
            View My Vote History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GovernancePage;
