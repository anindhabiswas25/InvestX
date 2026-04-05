import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyVotes } from "../../services/governance.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiExternalLink,
  FiAward,
} from "react-icons/fi";

const MyVotesPage = () => {
  const [votes, setVotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyVotes();
        setVotes(res.data.data?.votes || []);
        setStats(res.data.data?.stats || {});
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load votes");
      }
      setLoading(false);
    };
    load();
  }, []);

  // Helper: Convert numeric proposal status to label
  const getStatusLabel = (status) => {
    const labels = { 0: 'Active', 1: 'Passed', 2: 'Rejected', 3: 'Executed' };
    return labels[status] ?? 'Unknown';
  };

  // Helper: Determine if vote was "correct" (aligned with majority/outcome)
  const getVoteCorrectness = (vote) => {
    const { support, proposalStatus } = vote;
    
    // Still active - pending
    if (proposalStatus === 0) return null;
    
    // Correct if: voted FOR and it passed/executed, OR voted AGAINST and it was rejected
    const isCorrect = (support && (proposalStatus === 1 || proposalStatus === 3)) || 
                      (!support && proposalStatus === 2);
    
    return isCorrect;
  };

  if (loading) return <LoadingSpinner message="Loading your votes..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/governance"
          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6"
        >
          <FiArrowLeft className="mr-1" /> Back to Governance
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          My Vote History
        </h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Votes",
                value: stats.totalVotes || 0,
                color: "text-indigo-600 bg-indigo-100",
              },
              {
                label: "Votes FOR",
                value: stats.votesFor || 0,
                color: "text-green-600 bg-green-100",
              },
              {
                label: "Votes AGAINST",
                value: stats.votesAgainst || 0,
                color: "text-red-600 bg-red-100",
              },
              {
                label: "Success Rate",
                value: `${stats.successRate || 0}%`,
                color: "text-blue-600 bg-blue-100",
              },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border p-4">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vote List */}
        {votes.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <FiAward className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">
              No Votes Yet
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Head to{" "}
              <Link
                to="/governance"
                className="text-indigo-600 hover:underline"
              >
                active proposals
              </Link>{" "}
              to cast your first vote!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {votes.map((vote, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Vote direction */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      vote.support
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {vote.support ? <FiThumbsUp /> : <FiThumbsDown />}
                  </div>
                  <div>
                    <Link
                      to={`/governance/proposals/${vote.proposalId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {vote.businessName || `Proposal #${vote.proposalId}`}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {vote.proposalType?.replace("_", " ")} •{" "}
                      {vote.votedAt ? new Date(vote.votedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Correctness */}
                  {(() => {
                    const isCorrect = getVoteCorrectness(vote);
                    if (isCorrect === null) {
                      return (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      );
                    } else if (isCorrect) {
                      return (
                        <span className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <FiCheckCircle className="mr-1" /> Majority
                        </span>
                      );
                    } else {
                      return (
                        <span className="flex items-center text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                          <FiXCircle className="mr-1" /> Minority
                        </span>
                      );
                    }
                  })()}

                  {/* Proposal status */}
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      vote.proposalStatus === 1 || vote.proposalStatus === 3
                        ? "bg-blue-50 text-blue-700"
                        : vote.proposalStatus === 2
                          ? "bg-red-50 text-red-600"
                          : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {getStatusLabel(vote.proposalStatus)}
                  </span>

                  {/* Tx link */}
                  {vote.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${vote.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-indigo-500"
                    >
                      <FiExternalLink />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVotesPage;
