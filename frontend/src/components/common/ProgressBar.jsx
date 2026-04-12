import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ProgressBar = ({ raised = 0, goal = 1, percentage }) => {
  const pct = percentage != null ? percentage : Math.min(100, (raised / goal) * 100);
  const gradientColor =
    pct >= 80 ? 'linear-gradient(90deg, #10b981, #00F5D4)' :
    pct >= 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
    'linear-gradient(90deg, #7C4DFF, #00C6FF)';

  return (
    <div>
      <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, pct)}%`, background: gradientColor, boxShadow: pct > 0 ? '0 0 8px rgba(124,77,255,0.4)' : 'none' }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5">
        <span className="text-gray-400">{formatCurrency(raised)}</span> raised of {formatCurrency(goal)}
        <span className="ml-1 gradient-text font-semibold">({pct.toFixed(1)}%)</span>
      </p>
    </div>
  );
};

export default ProgressBar;
