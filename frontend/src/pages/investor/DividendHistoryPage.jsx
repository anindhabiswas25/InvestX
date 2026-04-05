import React, { useState, useEffect } from "react";
import { getMyDividendEarnings } from "../../services/investment.api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  formatCurrency,
  formatDate,
  getStellarExplorerUrl,
} from "../../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiExternalLink, FiDownload } from "react-icons/fi";

const DividendHistoryPage = () => {
  const [earnings, setEarnings] = useState([]);
  const [totalEarnedINR, setTotalEarnedINR] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyDividendEarnings();
        const data = res.data.data;
        setEarnings(data?.payoutHistory || []);
        setTotalEarnedINR(data?.totalEarnedINR || 0);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const totalEarned = totalEarnedINR;

  // Monthly chart data
  const monthlyData = {};
  earnings.forEach((e) => {
    const key = `${e.year}-${String(e.month).padStart(2, "0")}`;
    monthlyData[key] = (monthlyData[key] || 0) + (e.payoutAmountINR || 0);
  });
  const chartData = Object.entries(monthlyData)
    .sort()
    .map(([month, amount]) => ({ month, amount }));

  const exportCSV = () => {
    const headers = "Date,Month,Year,Amount,TX Hash\n";
    const rows = earnings
      .map(
        (e) =>
          `${formatDate(e.distributedAt)},${e.month},${e.year},${e.payoutAmountINR || 0},${e.txHash || ""}`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dividend-history.csv";
    a.click();
  };

  if (loading) return <LoadingSpinner message="Loading dividend history..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Dividend Earnings
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Total Lifetime Earnings:{" "}
              <span className="text-green-600 font-bold text-lg">
                {formatCurrency(totalEarned)}
              </span>
            </p>
          </div>
          {earnings.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center text-sm text-primary-600 font-medium hover:underline"
            >
              <FiDownload className="mr-1" /> Download CSV
            </button>
          )}
        </div>

        {/* Monthly Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Earnings
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="amount" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        {earnings.length > 0 ? (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Period
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    Amount (INR)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    XLM
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                    TX ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(e.distributedAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {e.month}/{e.year}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-semibold">
                      {formatCurrency(e.payoutAmountINR)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(e.payoutAmountXLM || e.payoutAmountCELO)?.toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      {e.txHash ? (
                        <a
                          href={getStellarExplorerUrl("tx", e.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline flex items-center text-xs"
                        >
                          {e.txHash.slice(0, 8)}...{" "}
                          <FiExternalLink className="ml-1" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            No dividend records yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DividendHistoryPage;
