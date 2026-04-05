import React, { useState, useEffect } from "react";
import {
  getPendingRevenueReports,
  verifyRevenue,
  distributeDividends,
} from "../../services/admin.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  formatCurrency,
  formatDate,
  formatXLM,
  getStellarExplorerUrl,
} from "../../utils/formatters";
import { toast } from "react-toastify";
import { FiCheckCircle, FiSend, FiExternalLink } from "react-icons/fi";

const RevenueVerificationPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyAmounts, setVerifyAmounts] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [distribResults, setDistribResults] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPendingRevenueReports();
        const data = res.data.data?.records || [];
        setReports(data);
        const initAmounts = {};
        data.forEach((r) => {
          initAmounts[r._id] = r.reportedRevenue || 0;
        });
        setVerifyAmounts(initAmounts);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleVerify = async (recordId) => {
    setActionLoading(`verify-${recordId}`);
    try {
      await verifyRevenue(recordId, Number(verifyAmounts[recordId]));
      setReports((p) =>
        p.map((r) =>
          r._id === recordId
            ? {
                ...r,
                status: "admin_verified",
                revenueVerified: verifyAmounts[recordId],
              }
            : r,
        ),
      );
      toast.success("Revenue verified! Ready to distribute dividends.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDistribute = async (recordId) => {
    setActionLoading(`distribute-${recordId}`);
    try {
      const res = await distributeDividends(recordId);
      setDistribResults((p) => ({ ...p, [recordId]: res.data.data }));
      setReports((p) =>
        p.map((r) => (r._id === recordId ? { ...r, status: "completed" } : r)),
      );
      toast.success("Dividends distributed on Stellar!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading revenue reports..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Revenue Verification & Dividend Distribution
        </h1>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="bg-white rounded-xl border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {report.businessId?.name || "Business"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Submitted: {formatDate(report.createdAt)} | Month:{" "}
                      {report.month}/{report.year}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      report.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : report.status === "admin_verified"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Reported Revenue</span>
                    <div className="font-semibold">
                      {formatCurrency(report.reportedRevenue)}
                    </div>
                  </div>
                  {report.revenueVerified != null && (
                    <div>
                      <span className="text-gray-500">Verified Revenue</span>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(report.revenueVerified)}
                      </div>
                    </div>
                  )}
                  {(report.dividendDepositAmountCELO > 0 ||
                    report.dividendDepositAmountXLM > 0) && (
                    <div>
                      <span className="text-gray-500">Dividend Deposited</span>
                      <div className="font-semibold text-purple-600">
                        {formatXLM(
                          report.dividendDepositAmountCELO ||
                            report.dividendDepositAmountXLM,
                        )}
                      </div>
                    </div>
                  )}
                  {report.totalDividendPool > 0 && (
                    <div>
                      <span className="text-gray-500">Dividend Pool (INR)</span>
                      <div className="font-semibold">
                        {formatCurrency(report.totalDividendPool)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dividend Deposit Transaction */}
                {report.dividendDepositTxHash && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-purple-700 mb-1">
                      Business Owner Dividend Payment
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-600">
                        {formatXLM(
                          report.dividendDepositAmountCELO ||
                            report.dividendDepositAmountXLM,
                        )}{" "}
                        deposited
                      </span>
                      <a
                        href={getStellarExplorerUrl(
                          "tx",
                          report.dividendDepositTxHash,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline inline-flex items-center"
                      >
                        View Tx <FiExternalLink className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}

                {report.notes && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="text-gray-500 font-medium">Notes: </span>
                    {report.notes}
                  </div>
                )}

                {/* Document Link */}
                {report.proofDocumentUrl && (
                  <a
                    href={report.proofDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline flex items-center mb-4"
                  >
                    <FiExternalLink className="mr-1" /> View Supporting Document
                  </a>
                )}

                {/* Verify Section */}
                {report.status === "pending" && (
                  <div className="border-t pt-4 mt-4 flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Verified Amount (INR)
                      </label>
                      <input
                        type="number"
                        value={verifyAmounts[report._id] || ""}
                        onChange={(e) =>
                          setVerifyAmounts((p) => ({
                            ...p,
                            [report._id]: e.target.value,
                          }))
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => handleVerify(report._id)}
                      disabled={actionLoading === `verify-${report._id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center whitespace-nowrap"
                    >
                      <FiCheckCircle className="mr-1" />{" "}
                      {actionLoading === `verify-${report._id}`
                        ? "Verifying..."
                        : "Verify Revenue"}
                    </button>
                  </div>
                )}

                {/* Distribute Section */}
                {report.status === "admin_verified" && (
                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={() => handleDistribute(report._id)}
                      disabled={actionLoading === `distribute-${report._id}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      <FiSend className="mr-1" />{" "}
                      {actionLoading === `distribute-${report._id}`
                        ? "Distributing on Stellar..."
                        : "Distribute Dividends"}
                    </button>
                  </div>
                )}

                {/* Distribution Result */}
                {distribResults[report._id] && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium">
                      Dividends distributed successfully!
                    </p>
                    {distribResults[report._id].summary && (
                      <p className="text-xs text-green-600 mt-1">
                        {distribResults[report._id].summary.successful || 0}{" "}
                        successful payouts,{" "}
                        {distribResults[report._id].summary.failed || 0} failed
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            No pending revenue reports.
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueVerificationPage;
