import React, { useState, useEffect } from "react";
import {
  getPendingApplications,
  generateAIScore,
  approveBusiness,
  rejectBusiness,
} from "../../services/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import RiskBadge from "../../components/common/RiskBadge";
import {
  formatCurrency,
  formatDate,
  getStellarExplorerUrl,
} from "../../utils/formatters";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiXCircle,
  FiCpu,
  FiAlertTriangle,
  FiExternalLink,
} from "react-icons/fi";

const BusinessApprovalPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [aiLoading, setAiLoading] = useState(null);
  const [approveLoading, setApproveLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [aiReport, setAiReport] = useState({});
  const [approveResult, setApproveResult] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPendingApplications();
        setApplications(res.data.data?.businesses || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleAIScore = async (bizId) => {
    setAiLoading(bizId);
    try {
      const res = await generateAIScore(bizId);
      setAiReport((p) => ({
        ...p,
        [bizId]: res.data.data?.aiAnalysis || res.data.data,
      }));
      toast.success("AI report generated!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "AI analysis failed",
      );
    } finally {
      setAiLoading(null);
    }
  };

  const handleApprove = async (bizId) => {
    setApproveLoading(bizId);
    try {
      const res = await approveBusiness(bizId);
      setApproveResult((p) => ({ ...p, [bizId]: res.data.data }));
      setApplications((p) => p.filter((a) => a._id !== bizId));
      toast.success("Business approved! Token deployed on Stellar.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Approval failed",
      );
    } finally {
      setApproveLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectBusiness(rejectModal, rejectReason);
      setApplications((p) => p.filter((a) => a._id !== rejectModal));
      toast.info("Application rejected");
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Rejection failed",
      );
    } finally {
      setRejectModal(null);
      setRejectReason("");
    }
  };

  if (loading) return <LoadingSpinner message="Loading applications..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Pending Business Applications
        </h1>

        {/* Approve success messages */}
        {Object.entries(approveResult).map(([bizId, data]) => (
          <div
            key={bizId}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"
          >
            <p className="text-sm text-green-800 font-medium">
              Business Approved! Token created on Stellar Testnet.
            </p>
            {data?.contractAddress && (
              <a
                href={getStellarExplorerUrl("token", data.contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-700 hover:underline flex items-center mt-1"
              >
                View Token on Stellar Explorer{" "}
                <FiExternalLink className="ml-1" />
              </a>
            )}
          </div>
        ))}

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-xl border overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpanded(expanded === app._id ? null : app._id)
                  }
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.name}</h3>
                    <p className="text-sm text-gray-500">
                      {app.category} | {app.location?.city},{" "}
                      {app.location?.state} | Submitted{" "}
                      {formatDate(app.createdAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Owner: {app.ownerId?.name || "N/A"} | Goal:{" "}
                      {formatCurrency(app.fundingGoal)}
                    </p>
                  </div>
                  <span className="text-sm text-primary-600 font-medium">
                    {expanded === app._id ? "Collapse" : "Review"}
                  </span>
                </div>

                {/* Expanded Details */}
                {expanded === app._id && (
                  <div className="border-t p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Monthly Revenue</span>
                        <div className="font-semibold">
                          {formatCurrency(
                            app.financials?.averageMonthlyRevenue,
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Profit Margin</span>
                        <div className="font-semibold">
                          {app.financials?.profitMargin}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue Share</span>
                        <div className="font-semibold">
                          {app.revenueSharePercentage}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration</span>
                        <div className="font-semibold">
                          {app.revenueSharingDuration} months
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Token Price</span>
                        <div className="font-semibold">
                          {formatCurrency(app.tokenDetails?.tokenPrice)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Years Operating</span>
                        <div className="font-semibold">
                          {app.yearsInOperation || "N/A"}
                        </div>
                      </div>
                    </div>

                    {app.description && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {app.description}
                      </div>
                    )}

                    {/* AI Report */}
                    {aiReport[app._id] && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">
                          AI Analysis Report
                        </h4>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-700">
                              {aiReport[app._id].creditScore ||
                                aiReport[app._id].score ||
                                "N/A"}
                            </span>
                          </div>
                          <div>
                            <RiskBadge rating={aiReport[app._id].riskRating} />
                            <p className="text-sm text-blue-700 mt-1 font-medium">
                              {aiReport[app._id].recommendation}
                            </p>
                          </div>
                        </div>
                        {aiReport[app._id].positiveFactors?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-green-700 mb-1">
                              Positive Factors:
                            </p>
                            {aiReport[app._id].positiveFactors.map((f, i) => (
                              <div
                                key={i}
                                className="flex items-start space-x-1 text-xs text-gray-700"
                              >
                                <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />{" "}
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {aiReport[app._id].riskFactors?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-orange-700 mb-1">
                              Risk Factors:
                            </p>
                            {aiReport[app._id].riskFactors.map((f, i) => (
                              <div
                                key={i}
                                className="flex items-start space-x-1 text-xs text-gray-700"
                              >
                                <FiAlertTriangle className="text-orange-500 mt-0.5 flex-shrink-0" />{" "}
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleAIScore(app._id)}
                        disabled={aiLoading === app._id}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        <FiCpu className="mr-1" />{" "}
                        {aiLoading === app._id
                          ? "Analyzing..."
                          : "Generate AI Report"}
                      </button>
                      <button
                        onClick={() => handleApprove(app._id)}
                        disabled={approveLoading === app._id}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        <FiCheckCircle className="mr-1" />{" "}
                        {approveLoading === app._id
                          ? "Creating Tokens on Stellar..."
                          : "Approve & Create Tokens"}
                      </button>
                      <button
                        onClick={() => setRejectModal(app._id)}
                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        <FiXCircle className="mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            No pending applications.
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
                rows={3}
                placeholder="Reason for rejection..."
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRejectModal(null)}
                  className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessApprovalPage;
