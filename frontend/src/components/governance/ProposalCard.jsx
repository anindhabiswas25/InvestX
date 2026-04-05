import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiXCircle, FiUsers, FiTrendingUp, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  passed: 'bg-blue-100 text-blue-800',
  executed: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-600',
};

const STATUS_ICONS = {
  active: <FiClock className="mr-1" />,
  passed: <FiCheckCircle className="mr-1" />,
  executed: <FiCheckCircle className="mr-1" />,
  rejected: <FiXCircle className="mr-1" />,
  expired: <FiClock className="mr-1" />,
};

const TYPE_LABELS = {
  BUSINESS_APPROVAL: 'Business Approval',
  REVENUE_VERIFICATION: 'Revenue Verification',
  PARAMETER_CHANGE: 'Parameter Change',
  EMERGENCY_DELIST: 'Emergency Delist',
};

const ProposalCard = ({ proposal }) => {
  const business = proposal.businessId;
  const status = proposal.status || 'active';
  const timeLeft = proposal.votingEndsAt ? new Date(proposal.votingEndsAt) - new Date() : 0;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
  const minsLeft = Math.max(0, Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
  const isExpired = timeLeft <= 0 && status === 'active';

  // Calculate vote stats
  const upvotes = parseInt(proposal.upvoteWeight || 0);
  const downvotes = parseInt(proposal.downvoteWeight || 0);
  const totalVotes = upvotes + downvotes;
  const approvalPercent = totalVotes > 0
    ? Math.round((upvotes / totalVotes) * 100)
    : 0;
  
  const voterCount = proposal.liveVoterCount || proposal.voterCount || proposal.totalVoters || 0;
  const quorumMet = proposal.quorumMet !== undefined ? proposal.quorumMet : voterCount >= 3;

  return (
    <Link
      to={`/governance/proposals/${proposal.proposalId}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {TYPE_LABELS[proposal.proposalType] || proposal.proposalType}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.active}`}>
            {STATUS_ICONS[status]}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Business Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {business?.name || `Proposal #${proposal.proposalId}`}
        </h3>
        {business?.category && (
          <p className="text-sm text-gray-500 mb-3">{business.category} • {business.location?.city ? `${business.location.city}, ${business.location.state}` : (typeof business.location === 'string' ? business.location : 'India')}</p>
        )}

        {/* Vote Distribution */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center text-green-600">
                <FiThumbsUp className="mr-1" /> {upvotes}
              </span>
              <span className="flex items-center text-red-600">
                <FiThumbsDown className="mr-1" /> {downvotes}
              </span>
            </div>
            <span className={`font-semibold ${approvalPercent >= 60 ? 'text-green-600' : 'text-red-500'}`}>
              {approvalPercent}% FOR
            </span>
          </div>
          
          {/* Visual Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div className="flex h-full">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${totalVotes > 0 ? (upvotes / totalVotes) * 100 : 0}%` }}
              />
              <div
                className="bg-red-400 transition-all duration-500"
                style={{ width: `${totalVotes > 0 ? (downvotes / totalVotes) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <FiUsers className="mr-1" />
            <span>{voterCount} {voterCount === 1 ? 'voter' : 'voters'}</span>
          </div>

          {status === 'active' && !isExpired && (
            <div className="flex items-center text-orange-600">
              <FiClock className="mr-1" />
              <span>{hoursLeft}h {minsLeft}m left</span>
            </div>
          )}

          {isExpired && (
            <span className="text-xs text-red-500 font-medium">Ready to finalize</span>
          )}

          {(status === 'passed' || status === 'executed') && (
            <div className="flex items-center text-green-600">
              <FiTrendingUp className="mr-1" />
              <span>Approved</span>
            </div>
          )}
        </div>

        {/* Quorum indicator */}
        {status === 'active' && (
          <div className="mt-2">
            {quorumMet ? (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">✓ Quorum met ({voterCount}/3)</span>
            ) : (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">⏳ Needs {3 - voterCount} more vote{3 - voterCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProposalCard;
