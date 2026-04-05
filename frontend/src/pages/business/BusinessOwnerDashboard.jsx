import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getMyBusinesses,
  submitRevenueReport,
  getPublicConfig,
} from "../../services/business.api";
import { useWallet } from "../../hooks/useWallet";
import ProgressBar from "../../components/common/ProgressBar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  formatCurrency,
  formatXLM,
  getStellarExplorerUrl,
} from "../../utils/formatters";
import {
  TransactionBuilder,
  BASE_FEE,
  Networks,
  Operation,
  Horizon,
  Asset,
  Memo,
} from "@stellar/stellar-sdk";
import { toast } from "react-toastify";
import { FiPlus, FiSend, FiCheckCircle, FiExternalLink } from "react-icons/fi";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  verifying: "bg-blue-100 text-blue-700",
  vote_required: "bg-indigo-100 text-indigo-700",
  voting: "bg-purple-100 text-purple-700",
  under_review: "bg-blue-100 text-blue-700",
  fundraising: "bg-green-100 text-green-700",
  funded: "bg-purple-100 text-purple-700",
  active: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  verification_failed: "bg-red-100 text-red-700",
};

// Descriptive messages for each status
const STATUS_MESSAGES = {
  pending: "Your application is pending. Verification will begin shortly.",
  verifying: "Our oracle is verifying your business documents and credentials...",
  vote_required: "Verification complete! Creating governance proposal for community vote...",
  voting: "Community members are voting on your application.",
  under_review: "Admin is reviewing your application.",
  fundraising: "Your business is live and accepting investments!",
  funded: "Congratulations! Your funding goal has been reached.",
  active: "Your business is active and operational.",
  rejected: "Unfortunately, your application was not approved.",
  verification_failed: "Document verification failed. Please contact support.",
};

const BusinessOwnerDashboard = () => {
  const { signAndSendTransaction, isConnected, walletAddress } = useWallet();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueForm, setRevenueForm] = useState({
    businessId: null,
    amount: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(1); // 1=enter amount, 2=paying, 3=done
  const [loadingMsg, setLoadingMsg] = useState("");
  const [lastTxHash, setLastTxHash] = useState("");
  const [platformConfig, setPlatformConfig] = useState({
    adminWalletAddress: "",
    dividendDistributorAddress: "",
    xlmInrRate: 40,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [bizRes, configRes] = await Promise.all([
          getMyBusinesses(),
          getPublicConfig(),
        ]);
        setBusinesses(bizRes.data.data?.businesses || []);
        if (configRes.data.data) {
          setPlatformConfig(configRes.data.data);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const getDividendCalc = (biz) => {
    const revenueAmount = Number(revenueForm.amount) || 0;
    if (revenueAmount <= 0) return null;
    const sharePercent = biz.revenueSharePercentage || 20;
    const dividendPoolINR = revenueAmount * (sharePercent / 100);
    const dividendPoolXLM =
      dividendPoolINR /
      (platformConfig.xlmInrRate || 40);
    return {
      dividendPoolINR,
      dividendPoolXLM: parseFloat(dividendPoolXLM.toFixed(6)),
      sharePercent,
    };
  };

  const handleRevenueSubmit = async (biz) => {
    if (!revenueForm.amount || Number(revenueForm.amount) <= 0) {
      toast.error("Enter a valid revenue amount");
      return;
    }
    if (!isConnected || !walletAddress) {
      toast.error("Please connect your Freighter wallet first");
      return;
    }

    const calc = getDividendCalc(biz);
    if (!calc) return;

    const destinationAddress = platformConfig.adminWalletAddress;
    if (!destinationAddress) {
      toast.error("Platform destination address not configured");
      return;
    }

    setSubmitting(true);
    setSubmitStep(2);
    try {
      const xlmAmountStr = Number(calc.dividendPoolXLM).toFixed(7);

      // Step 1: Load business owner's real Horizon account (for sequence number)
      setLoadingMsg("Loading your Stellar account...");
      const horizonServer = new Horizon.Server(HORIZON_URL);
      let ownerAccount;
      try {
        ownerAccount = await horizonServer.loadAccount(walletAddress);
      } catch {
        throw new Error(
          `Your Stellar account was not found on Testnet. ` +
            "Please fund it at: https://friendbot.stellar.org",
        );
      }

      // Step 2: Build the XLM payment transaction
      setLoadingMsg(`Building transaction for ${xlmAmountStr} XLM...`);
      const txBuilder = new TransactionBuilder(ownerAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: destinationAddress,
            asset: Asset.native(),
            amount: xlmAmountStr,
          }),
        )
        .addMemo(Memo.text("InvestX dividend"))
        .setTimeout(30);

      const txXDR = txBuilder.build().toXDR();

      // Step 3: Sign & submit via Freighter → Horizon
      setLoadingMsg("Requesting Freighter signature...");
      const txRes = await signAndSendTransaction(txXDR);

      setLoadingMsg("Transaction confirmed! Submitting revenue report...");
      setLastTxHash(txRes.txHash);

      // Step 4: Record revenue report on backend
      await submitRevenueReport(biz._id, {
        revenueAmount: Number(revenueForm.amount),
        txHash: txRes.txHash,
      });

      setSubmitStep(3);
      toast.success("Revenue report submitted with dividend payment!");
    } catch (err) {
      console.error("Revenue submission error:", err);
      toast.error(
        err?.response?.data?.message || err.message || "Transaction failed",
      );
      setSubmitStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRevenueForm({ businessId: null, amount: "", notes: "" });
    setSubmitStep(1);
    setLastTxHash("");
    setLoadingMsg("");
  };

  if (loading) return <LoadingSpinner message="Loading your businesses..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Businesses</h1>
          <Link
            to="/apply-funding"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center"
          >
            <FiPlus className="mr-1" /> Apply for Funding
          </Link>
        </div>

        {businesses.length > 0 ? (
          <div className="space-y-4">
            {businesses.map((biz) => {
              const calc =
                revenueForm.businessId === biz._id
                  ? getDividendCalc(biz)
                  : null;
              return (
                <div key={biz._id} className="bg-white rounded-xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {biz.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {biz.category} | {biz.location?.city},{" "}
                        {biz.location?.state}
                      </p>
                    </div>
                    <span
                                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                                        STATUS_STYLES[biz.status] || "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {biz.status?.replace(/_/g, " ")}
                                    </span>
                                  </div>

                                  {/* Status message for verification stages */}
                                  {STATUS_MESSAGES[biz.status] && (
                                    <div className={`text-sm p-3 rounded-lg mb-4 ${
                                      biz.status === 'verifying' ? 'bg-blue-50 text-blue-700' :
                                      biz.status === 'vote_required' ? 'bg-indigo-50 text-indigo-700' :
                                      biz.status === 'voting' ? 'bg-purple-50 text-purple-700' :
                                      biz.status === 'verification_failed' ? 'bg-red-50 text-red-700' :
                                      biz.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                      'bg-gray-50 text-gray-600'
                                    }`}>
                                      {biz.status === 'verifying' && (
                                        <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                                      )}
                                      {biz.status === 'vote_required' && (
                                        <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                                      )}
                                      {STATUS_MESSAGES[biz.status]}
                                      {biz.status === 'voting' && biz.proposalId && (
                                        <Link 
                                          to="/governance" 
                                          className="ml-2 text-purple-600 underline hover:text-purple-800"
                                        >
                                          View Vote (Proposal #{biz.proposalId})
                                        </Link>
                                      )}
                                    </div>
                                  )}

                  {biz.status === "fundraising" && (
                    <div className="mb-4">
                      <ProgressBar
                        raised={biz.raisedAmount}
                        goal={biz.fundingGoal}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {biz.investorCount || 0} investors
                      </p>
                    </div>
                  )}

                  {(biz.status === "active" || biz.status === "funded") && (
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Investors</div>
                        <div className="font-semibold">
                          {biz.investorCount || 0}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Raised</div>
                        <div className="font-semibold">
                          {formatCurrency(biz.raisedAmount)}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Goal</div>
                        <div className="font-semibold">
                          {formatCurrency(biz.fundingGoal)}
                        </div>
                      </div>
                    </div>
                  )}

                  {(biz.status === "active" || biz.status === "funded") && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Submit Monthly Revenue Report &amp; Pay Dividends
                      </h4>
                      {revenueForm.businessId === biz._id ? (
                        <div className="space-y-3">
                          {submitStep === 1 && (
                            <>
                              <input
                                type="number"
                                value={revenueForm.amount}
                                onChange={(e) =>
                                  setRevenueForm((p) => ({
                                    ...p,
                                    amount: e.target.value,
                                  }))
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                placeholder="Revenue amount (INR)"
                              />
                              {calc && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">
                                      Revenue Share ({calc.sharePercent}%)
                                    </span>
                                    <span className="font-semibold text-blue-800">
                                      {formatCurrency(calc.dividendPoolINR)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">
                                      XLM to Pay
                                    </span>
                                    <span className="font-semibold text-blue-800">
                                      {formatXLM(calc.dividendPoolXLM)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-600 mt-1">
                                    This XLM will be sent from your Freighter
                                    wallet to the platform. Admin will then
                                    distribute it to investors.
                                  </p>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRevenueSubmit(biz)}
                                  disabled={submitting || !revenueForm.amount}
                                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center"
                                >
                                  <FiSend className="mr-1" /> Pay &amp; Submit
                                  Report
                                </button>
                                <button
                                  onClick={resetForm}
                                  className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          )}

                          {submitStep === 2 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                              <p className="text-sm text-yellow-800 font-medium">
                                {loadingMsg}
                              </p>
                              <p className="text-xs text-yellow-600 mt-1">
                                Please do not close this page.
                              </p>
                            </div>
                          )}

                          {submitStep === 3 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-3">
                              <FiCheckCircle className="mx-auto text-green-500 text-4xl" />
                              <p className="text-sm text-green-800 font-semibold">
                                Revenue report submitted with dividend payment!
                              </p>
                              <div className="text-sm space-y-1">
                                <p className="text-green-700">
                                  Dividend:{" "}
                                  {formatCurrency(calc?.dividendPoolINR || 0)} (
                                  {formatXLM(calc?.dividendPoolXLM || 0)})
                                </p>
                                {lastTxHash && (
                                  <a
                                    href={getStellarExplorerUrl(
                                      "tx",
                                      lastTxHash,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:underline inline-flex items-center text-xs"
                                  >
                                    View Transaction{" "}
                                    <FiExternalLink className="ml-1" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs text-green-600">
                                Admin will verify and distribute to investors.
                              </p>
                              <button
                                onClick={resetForm}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRevenueForm({
                              businessId: biz._id,
                              amount: "",
                              notes: "",
                            });
                            setSubmitStep(1);
                          }}
                          className="text-sm text-primary-600 font-medium hover:underline"
                        >
                          Submit Revenue Report →
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link
                      to={`/businesses/${biz._id}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      View Public Page →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">
              You haven't listed any businesses yet.
            </p>
            <Link
              to="/apply-funding"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Apply for Funding
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;

