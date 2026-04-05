import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSuccessStories } from "../../services/business.api";
import { formatCurrency, formatXLM } from "../../utils/formatters";
import {
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiStar,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const RISK_COLORS = {
  low: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50",
  high: "text-red-600 bg-red-50",
};

const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSuccessStories();
        setStories(res.data.data?.stories || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (stories.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <FiCheckCircle /> Proven Track Record
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Successfully Funded Businesses
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Real local businesses that reached their funding goals, are now
            operating, and actively sharing profits with their investors
            on-chain.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{story.name}</h3>
                    <p className="text-emerald-100 text-sm">
                      {story.category} &bull; {story.city}, {story.state}
                    </p>
                  </div>
                  {story.aiCreditScore && (
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1 text-center">
                      <div className="text-lg font-bold">
                        {story.aiCreditScore}
                      </div>
                      <div className="text-[10px] uppercase tracking-wide opacity-80">
                        AI Score
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-emerald-100 text-xs mt-2">
                  by {story.ownerName}
                </p>
              </div>

              {/* Business Report */}
              <div className="p-5 space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Raised</div>
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(story.raisedAmount)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      of {formatCurrency(story.fundingGoal)} goal
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-0.5">
                      Investors
                    </div>
                    <div className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1">
                      <FiUsers className="text-primary-500" />{" "}
                      {story.investorCount}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {story.tokensSold || 0}/{story.totalTokens} tokens sold
                    </div>
                  </div>
                </div>

                {/* Dividends Report */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <FiTrendingUp /> Investor Returns
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total Dividends Paid
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {formatCurrency(story.totalDividendsPaidINR)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">On-chain (XLM)</span>
                      <span className="font-semibold text-emerald-700">
                        {formatXLM(
                          story.totalDividendsPaidXLM ||
                            story.totalDividendsPaidCELO,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Months Active</span>
                      <span className="font-semibold">
                        {story.monthsActive}
                      </span>
                    </div>
                    {story.avgMonthlyReturnPct > 0 && (
                      <div className="flex justify-between border-t border-emerald-200 pt-1.5 mt-1.5">
                        <span className="text-gray-600">
                          Avg Monthly Return
                        </span>
                        <span className="font-bold text-emerald-700">
                          {story.avgMonthlyReturnPct}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Investor Feedback Summary */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <FiStar /> Investor Feedback
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">
                        Funding goal reached —{" "}
                        {Math.round(
                          (story.raisedAmount / story.fundingGoal) * 100,
                        )}
                        % funded
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">
                        {story.investorCount} investor
                        {story.investorCount !== 1 ? "s" : ""} earning{" "}
                        {story.revenueSharePercentage}% revenue share
                      </span>
                    </div>
                    {story.totalDividendsPaidINR > 0 && (
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">
                          Dividends paid on-chain via smart contract
                        </span>
                      </div>
                    )}
                    {story.riskRating && (
                      <div className="flex items-center gap-2">
                        <FiAward className="text-blue-500 flex-shrink-0" />
                        <span className="text-gray-600">
                          Risk Rating:{" "}
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              RISK_COLORS[story.riskRating] ||
                              "text-gray-600 bg-gray-100"
                            }`}
                          >
                            {story.riskRating}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={`/businesses/${story._id}`}
                  className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700 pt-1 flex items-center justify-center gap-1"
                >
                  View Full Business Details <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
