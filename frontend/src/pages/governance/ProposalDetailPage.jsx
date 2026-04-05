import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getProposalById } from "../../services/governance.api";
import VotingPanel from "../../components/governance/VotingPanel";
import AttestationBadges from "../../components/governance/AttestationBadges";
import ZKProofBadge from "../../components/governance/ZKProofBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useWallet } from "../../hooks/useWallet";
import {
  formatDate,
  formatCurrency,
  getStellarExplorerUrl,
} from "../../utils/formatters";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink,
  FiShield,
  FiFileText,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-800 border-green-200",
  passed: "bg-blue-100 text-blue-800 border-blue-200",
  executed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  expired: "bg-gray-100 text-gray-600 border-gray-200",
};

const ProposalDetailPage = () => {
  const { id } = useParams();
  const { isConnected } = useWallet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await getProposalById(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load proposal");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds if proposal is active
  useEffect(() => {
    if (!autoRefresh || !data?.proposal || data.proposal.status !== 'active') return;
    
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, data, fetchData]);

  const handleVoteComplete = () => {
    // Refresh immediately after voting
    fetchData(true);
  };

  if (loading) return <LoadingSpinner message="Loading proposal..." />;
  if (error)
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 text-center">
        <p className="text-red-500">{error}</p>
        <Link
          to="/governance"
          className="text-indigo-600 hover:underline mt-4 inline-block"
        >
          Back to Governance
        </Link>
      </div>
    );

  const {
    proposal,
    onChainData,
    attestations,
    rangeProofs,
    verificationSummary,
    userVoteStatus,
  } = data;
  const business = proposal.businessId;
  const status = proposal.status;
  const timeLeft = proposal.votingEndsAt
    ? new Date(proposal.votingEndsAt) - new Date()
    : 0;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
  const isVotingOpen = status === "active" && timeLeft > 0;

  const upvotes = parseInt(onChainData?.upvoteWeight || 0);
  const downvotes = parseInt(onChainData?.downvoteWeight || 0);
  const totalVotes = upvotes + downvotes;
  const upPct = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
  const downPct = totalVotes > 0 ? Math.round((downvotes / totalVotes) * 100) : 0;
  const voterCount = onChainData?.voterCount || proposal.totalVoters || 0;
  const quorumMet = voterCount >= 3;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link
          to="/governance"
          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6"
        >
          <FiArrowLeft className="mr-1" /> Back to Governance
        </Link>

        {/* Proposal Header */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Proposal #{proposal.proposalId} •{" "}
                {proposal.proposalType?.replace("_", " ")}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {business?.name || `Proposal #${proposal.proposalId}`}
              </h1>
              {business && (
                <p className="text-sm text-gray-500 mt-1">
                  {business.category} •{" "}
                  {business.location?.city
                    ? `${business.location.city}, ${business.location.state}`
                    : typeof business.location === "string"
                      ? business.location
                      : "India"}
                  {business.revenueSharePercentage &&
                    ` • ${business.revenueSharePercentage}% revenue share`}
                </p>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[status]}`}
            >
              {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
          </div>

          {/* Timer */}
          {status === "active" && (
            <div
              className={`flex items-center justify-between mb-4 ${timeLeft > 0 ? "text-orange-600" : "text-red-600"}`}
            >
              <div className="flex items-center text-sm">
                <FiClock className="mr-1" />
                {timeLeft > 0
                  ? `${hoursLeft}h ${minsLeft}m left to vote (ends ${formatDate(proposal.votingEndsAt)})`
                  : "Voting period ended - ready to finalize"}
              </div>
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                title="Refresh vote counts"
              >
                <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          )}

          {/* Enhanced Vote Results */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <FiThumbsUp className="mr-1" />
                  <span>{upvotes} FOR ({upPct}%)</span>
                </div>
                <div className="flex items-center text-sm text-red-500 font-medium">
                  <FiThumbsDown className="mr-1" />
                  <span>{downvotes} AGAINST ({downPct}%)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiUsers className="text-gray-400" />
                <span className="font-medium">{voterCount}</span>
                <span className="text-gray-400">voters</span>
              </div>
            </div>
            
            {/* Visual Progress Bar with Gradient */}
            <div className="relative h-4 rounded-full overflow-hidden bg-gray-200 mb-2">
              <div className="absolute inset-0 flex">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 transition-all duration-700 ease-out"
                  style={{ width: `${upPct}%` }}
                />
                <div
                  className="bg-gradient-to-r from-red-400 to-red-600 transition-all duration-700 ease-out"
                  style={{ width: `${downPct}%` }}
                />
              </div>
              
              {/* 60% threshold marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 opacity-75"
                style={{ left: '60%' }}
                title="60% threshold required"
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-3">
                {quorumMet ? (
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    ✓ Quorum met ({voterCount}/3)
                  </span>
                ) : (
                  <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                    ⏳ Needs {3 - voterCount} more vote{3 - voterCount !== 1 ? 's' : ''}
                  </span>
                )}
                {upPct >= 60 ? (
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    ✓ Above threshold
                  </span>
                ) : (
                  <span className="text-gray-600">
                    60% threshold required
                  </span>
                )}
              </div>
              {status === 'active' && (
                <label className="flex items-center gap-1 text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs">Auto-refresh</span>
                </label>
              )}
            </div>
          </div>

          {/* On-chain tx link */}
          {proposal.onChainTxHash && (
            <a
              href={
                getStellarExplorerUrl
                  ? getStellarExplorerUrl("tx", proposal.onChainTxHash)
                  : `https://stellar.expert/explorer/testnet/tx/${proposal.onChainTxHash}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-gray-400 hover:text-indigo-500"
            >
              <FiExternalLink className="mr-1" /> View proposal creation tx
            </a>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Business Details + Attestations */}
          <div className="md:col-span-2 space-y-6">
            {/* Business Info */}
            {business && (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FiFileText className="mr-2 text-gray-400" /> Business Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Funding Goal</p>
                    <p className="font-medium">
                      {formatCurrency(business.fundingGoal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">AI Credit Score</p>
                    <p className="font-medium">
                      {business.aiCreditScore || "N/A"}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Risk Rating</p>
                    <p
                      className={`font-medium ${
                        business.riskRating === "low"
                          ? "text-green-600"
                          : business.riskRating === "medium"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {business.riskRating?.toUpperCase() || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Revenue Share</p>
                    <p className="font-medium">
                      {business.revenueSharePercentage || 0}%
                    </p>
                  </div>
                </div>
                <Link
                  to={`/businesses/${business._id}`}
                  className="text-xs text-indigo-600 hover:underline mt-3 inline-block"
                >
                  View full business page
                </Link>
              </div>
            )}

            {/* Attestations */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FiShield className="mr-2 text-blue-500" /> Oracle Attestations
              </h3>
              {attestations && attestations.length > 0 ? (
                <AttestationBadges attestations={attestations} />
              ) : (
                <p className="text-sm text-gray-400">
                  No attestations recorded yet.
                </p>
              )}
              {verificationSummary && verificationSummary.total > 0 && (
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>Total checks: {verificationSummary.total}</span>
                  <span className="text-green-600">
                    Verified: {verificationSummary.verified}
                  </span>
                  <span className="text-purple-600">
                    ZK Proofs: {verificationSummary.rangeProofs}
                  </span>
                </div>
              )}
            </div>

            {/* ZK Proofs */}
            {rangeProofs && rangeProofs.length > 0 && (
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  Zero-Knowledge Proofs
                </h3>
                <ZKProofBadge proofs={rangeProofs} />
              </div>
            )}
          </div>

          {/* Right: Voting Panel */}
          <div className="space-y-4">
            {isVotingOpen && isConnected ? (
              <VotingPanel
                proposalId={proposal.proposalId}
                userVoteStatus={userVoteStatus}
                onVoteComplete={handleVoteComplete}
              />
            ) : isVotingOpen && !isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
                <p className="text-sm text-yellow-800 font-medium">
                  Connect your wallet to vote
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  You need a Stellar wallet (Freighter) to participate in governance.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-600 font-medium">
                  Voting has ended
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Result:{" "}
                  <strong
                    className={
                      status === "passed" || status === "executed"
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {status?.toUpperCase()}
                  </strong>
                </p>
              </div>
            )}

            {/* Governance Params */}
            <div className="bg-gray-50 rounded-xl border p-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                Governance Rules
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li>• 1 wallet = 1 vote (equal weight)</li>
                <li>• Min 3 voters required</li>
                <li>• 60% approval to pass</li>
                <li>• 80% for emergency (5 voters)</li>
                <li>• Business approval: anyone can vote</li>
                <li>• Revenue verification: investors only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetailPage;
