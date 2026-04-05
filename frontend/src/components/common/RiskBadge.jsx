import React from 'react';

const colors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

const RiskBadge = ({ rating }) => {
  const cls = colors[rating] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
      {rating || 'N/A'}
    </span>
  );
};

export default RiskBadge;
