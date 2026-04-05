import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import RiskBadge from '../common/RiskBadge';
import { formatCurrency, calculateDaysRemaining } from '../../utils/formatters';
import { FiMapPin, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

const STATUS_CONFIG = {
  fundraising: { label: 'Fundraising', className: 'bg-yellow-100 text-yellow-700 border border-yellow-300' },
  funded:      { label: 'Funded',      className: 'bg-blue-100 text-blue-700 border border-blue-300' },
  active:      { label: 'Active',      className: 'bg-green-100 text-green-700 border border-green-300' },
  completed:   { label: 'Completed',   className: 'bg-purple-100 text-purple-700 border border-purple-300' },
};

const BusinessCard = ({ business }) => {
  const {
    _id, name, category, status,
    riskRating, aiCreditScore, raisedAmount = 0, fundingGoal = 0,
    revenueSharePercentage, fundingDeadline, photos,
    location, tokenDetails,
  } = business;

  const city = location?.city;
  const state = location?.state;
  const tokenPriceINR = tokenDetails?.tokenPrice;
  const daysLeft = calculateDaysRemaining(fundingDeadline);
  const imgSrc = photos?.[0]?.url || photos?.[0] || 'https://via.placeholder.com/400x200?text=Business';
  const statusCfg = STATUS_CONFIG[status] || { label: status || 'Unknown', className: 'bg-gray-100 text-gray-700 border border-gray-300' };
  const isFundraising = status === 'fundraising';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img src={imgSrc} alt={name} className="w-full h-40 object-cover" />
        <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.className}`}>
          {statusCfg.label}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-primary-600 font-medium uppercase">{category}</span>
          <RiskBadge rating={riskRating} />
        </div>
        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{name}</h3>
        <p className="text-xs text-gray-500 flex items-center mb-3">
          <FiMapPin className="mr-1" /> {city}, {state}
        </p>
        <ProgressBar raised={raisedAmount} goal={fundingGoal} />
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
          <div>AI Score: <span className="font-semibold text-gray-900">{aiCreditScore || 'N/A'}/100</span></div>
          <div>Yield: <span className="font-semibold text-gray-900">{revenueSharePercentage || 0}%</span></div>
          <div>Min: <span className="font-semibold text-gray-900">{formatCurrency(tokenPriceINR || 50)}</span></div>
          {isFundraising ? (
            <div className="flex items-center">
              <FiClock className="mr-1" /> {daysLeft} days left
            </div>
          ) : status === 'funded' ? (
            <div className="flex items-center text-blue-600">
              <FiCheckCircle className="mr-1" /> Fully Funded
            </div>
          ) : (
            <div className="flex items-center text-green-600">
              <FiTrendingUp className="mr-1" /> Operating
            </div>
          )}
        </div>
        <Link to={`/businesses/${_id}`} className="mt-3 block text-center bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BusinessCard;
