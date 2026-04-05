import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ProgressBar = ({ raised = 0, goal = 1, percentage }) => {
  const pct = percentage != null ? percentage : Math.min(100, (raised / goal) * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }}></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {formatCurrency(raised)} raised of {formatCurrency(goal)} goal ({pct.toFixed(1)}%)
      </p>
    </div>
  );
};

export default ProgressBar;
