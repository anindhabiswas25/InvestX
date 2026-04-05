import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBusinessById } from "../../services/business.api";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";
import ProgressBar from "../../components/common/ProgressBar";
import RiskBadge from "../../components/common/RiskBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import InvestmentModal from "../../components/investor/InvestmentModal";
import {
  formatCurrency,
  calculateDaysRemaining,
  getStellarExplorerUrl,
} from "../../utils/formatters";
import {
  FiMapPin,
  FiUsers,
  FiCalendar,
  FiExternalLink,
  FiCheckCircle,
  FiAlertTriangle,
  FiLink,
  FiShield,
} from "react-icons/fi";

const BusinessDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isConnected, connectWallet } = useWallet();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBusinessById(id);
        setBusiness(res.data.data?.business || res.data.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading business details..." />;
  if (!business)
    return (
      <div className="text-center py-20 text-gray-500">Business not found</div>
    );

  const {
    name,
    category,
    description,
    yearsInOperation,
    riskRating,
    aiCreditScore,
    aiAnalysis,
    raisedAmount = 0,
    fundingGoal = 0,
    revenueSharePercentage,
    fundingDeadline,
    photos,
    status,
    revenueSharingDuration,
    documents,
    location,
    financials,
    tokenDetails,
  } = business;

  const city = location?.city;
  const state = location?.state;
  const averageMonthlyRevenue = financials?.averageMonthlyRevenue;
  const profitMargin = financials?.profitMargin;
  const tokenPriceINR = tokenDetails?.tokenPrice;
  const tokenContractAddress = tokenDetails?.contractAddress;

  const daysLeft = calculateDaysRemaining(fundingDeadline);

  const renderInvestButton = () => {
    if (!isConnected)
      return (
        <button
          onClick={connectWallet}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center"
        >
          <FiLink className="mr-2" /> Connect Wallet to Invest
        </button>
      );
    if (status !== "fundraising")
      return (
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
        >
          Fundraising Closed
        </button>
      );
    return (
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700"
      >
        Invest Now
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Photo Gallery */}
            {photos?.length > 0 && (
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-6">
                <img
                  src={photos[0]?.url || photos[0]}
                  alt={name}
                  className="col-span-2 h-64 w-full object-cover"
                />
                {photos.slice(1, 3).map((p, i) => (
                  <img
                    key={i}
                    src={p?.url || p}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                ))}
              </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-xl border p-6 mb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm text-primary-600 font-medium uppercase">
                    {category}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                  <p className="text-gray-500 flex items-center mt-1">
                    <FiMapPin className="mr-1" /> {city}, {state}
                  </p>
                </div>
                <RiskBadge rating={riskRating} />
              </div>
              {description && (
                <p className="text-gray-600 mt-4">{description}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Years Operating</div>
                  <div className="font-semibold">
                    {yearsInOperation || "N/A"}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Revenue Share</div>
                  <div className="font-semibold">
                    {revenueSharePercentage || 0}%
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">AI Score</div>
                  <div className="font-semibold text-primary-600">
                    {aiCreditScore || "N/A"}/100
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Investors</div>
                  <div className="font-semibold">
                    {business.investorCount || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Governance Status */}
            {[
              "verifying",
              "vote_required",
              "voting",
              "approved",
              "rejected",
            ].includes(status) && (
              <div
                className={`rounded-xl border p-5 mb-6 ${
                  status === "approved"
                    ? "bg-green-50 border-green-200"
                    : status === "rejected"
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FiShield
                    className={`text-lg ${
                      status === "approved"
                        ? "text-green-600"
                        : status === "rejected"
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  />
                  <h2 className="font-semibold text-gray-900">
                    Governance Status
                  </h2>
                </div>
                <p className="text-sm text-gray-700">
                  {status === "verifying" &&
                    "Documents are being verified by the oracle service. A governance vote will be created automatically."}
                  {status === "vote_required" &&
                    "Oracle verification complete. A community governance vote is being created."}
                  {status === "voting" &&
                    "This business is currently under community governance vote. Connected wallets can vote on approval (1 wallet = 1 vote)."}
                  {status === "approved" &&
                    "This business was approved by community governance vote. Fundraising is now active."}
                  {status === "rejected" &&
                    "This business was rejected by community governance vote."}
                </p>
                {(status === "voting" || status === "approved") &&
                  business.proposalId && (
                    <Link
                      to={`/governance/proposals/${business.proposalId}`}
                      className="inline-flex items-center mt-2 text-sm text-primary-600 hover:underline font-medium"
                    >
                      View Governance Proposal{" "}
                      <FiExternalLink className="ml-1" />
                    </Link>
                  )}
              </div>
            )}

            {/* Financial Overview */}
            <div className="bg-white rounded-xl border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Avg Monthly Revenue</span>
                  <div className="font-semibold">
                    {formatCurrency(averageMonthlyRevenue)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Profit Margin</span>
                  <div className="font-semibold">{profitMargin || 0}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Revenue Share</span>
                  <div className="font-semibold">
                    {revenueSharePercentage || 0}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Duration</span>
                  <div className="font-semibold">
                    {revenueSharingDuration || 0} months
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Token Price</span>
                  <div className="font-semibold">
                    {formatCurrency(tokenPriceINR)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Funding Goal</span>
                  <div className="font-semibold">
                    {formatCurrency(fundingGoal)}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {aiAnalysis && (
              <div className="bg-white rounded-xl border p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Analysis Report
                </h2>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-primary-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {aiCreditScore}
                    </span>
                  </div>
                </div>
                {aiAnalysis.positiveFactors?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-green-700 mb-2">
                      Positive Factors
                    </h3>
                    {aiAnalysis.positiveFactors.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start space-x-2 text-sm text-gray-600 mb-1"
                      >
                        <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />{" "}
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
                {aiAnalysis.riskFactors?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-orange-700 mb-2">
                      Risk Factors
                    </h3>
                    {aiAnalysis.riskFactors.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start space-x-2 text-sm text-gray-600 mb-1"
                      >
                        <FiAlertTriangle className="text-orange-500 mt-0.5 flex-shrink-0" />{" "}
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
                {aiAnalysis.recommendation && (
                  <p className="text-sm text-gray-600">
                    <strong>Recommendation:</strong> {aiAnalysis.recommendation}
                  </p>
                )}
              </div>
            )}

            {/* Token Contract */}
            {tokenContractAddress && (
              <div className="bg-white rounded-xl border p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  On-Chain Token
                </h2>
                <a
                  href={getStellarExplorerUrl("token", tokenContractAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:underline flex items-center"
                >
                  View on Stellar Explorer <FiExternalLink className="ml-1" />
                </a>
              </div>
            )}

            {/* Documents */}
            {documents?.length > 0 && (
              <div className="bg-white rounded-xl border p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Legal Documents
                </h2>
                {documents.map((d, i) => (
                  <a
                    key={i}
                    href={d.url || d}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary-600 hover:underline mb-1 flex items-center"
                  >
                    <FiExternalLink className="mr-1" /> Document {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Investment Panel */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border p-6 sticky top-20">
              <ProgressBar raised={raisedAmount} goal={fundingGoal} />
              <div className="flex justify-between text-sm text-gray-500 mt-3 mb-4">
                <span>
                  <FiUsers className="inline mr-1" />
                  {business.investorCount || 0} investors
                </span>
                <span>
                  <FiCalendar className="inline mr-1" />
                  {daysLeft} days left
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <div className="flex justify-between">
                  <span>Token Price</span>
                  <span className="font-semibold">
                    {formatCurrency(tokenPriceINR)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue Share</span>
                  <span className="font-semibold">
                    {revenueSharePercentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-semibold">
                    {revenueSharingDuration} mo
                  </span>
                </div>
              </div>
              {renderInvestButton()}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <InvestmentModal
          business={business}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            // Reload business data
            getBusinessById(id)
              .then((res) =>
                setBusiness(res.data.data?.business || res.data.data),
              )
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
};

export default BusinessDetailPage;
