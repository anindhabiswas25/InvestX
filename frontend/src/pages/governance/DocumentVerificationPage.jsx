import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink,
  FiArrowLeft,
} from "react-icons/fi";
import { getAttestations } from "../../services/governance.api";
import api from "../../services/api";

const STELLAR_EXPLORER_BASE = "https://stellar.expert/explorer/testnet";

const DocumentVerificationPage = () => {
  const { businessId } = useParams();
  const [business, setBusiness] = useState(null);
  const [attestationData, setAttestationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bizRes, attRes] = await Promise.all([
          api.get(`/api/businesses/${businessId}`),
          getAttestations(businessId).catch(() => null),
        ]);
        setBusiness(bizRes.data.data.business || bizRes.data.data);
        if (attRes?.data?.data) setAttestationData(attRes.data.data);
      } catch (err) {
        console.error("Failed to fetch verification data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Business not found.</p>
      </div>
    );
  }

  const docHashes = business.documentHashes || {};
  const docTypes = [
    { key: "gst", label: "GST Certificate" },
    { key: "pan", label: "PAN Card" },
    { key: "bankStatement", label: "Bank Statement" },
    { key: "registration", label: "Registration Document" },
    { key: "businessPhoto", label: "Business Photo" },
  ];

  const registeredDocs = docTypes.filter((d) => docHashes[d.key]?.hash);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <Link
        to={`/businesses/${businessId}`}
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-6"
      >
        <FiArrowLeft className="mr-1" /> Back to Business
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <FiShield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
            <p className="text-sm text-gray-500">
              Document Verification Record
            </p>
          </div>
        </div>

        {/* Document Hashes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  Document Type
                </th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  On-chain Hash
                </th>
                <th className="text-left py-3 px-2 text-gray-500 font-medium">
                  Registered
                </th>
                <th className="text-center py-3 px-2 text-gray-500 font-medium">
                  Verify
                </th>
              </tr>
            </thead>
            <tbody>
              {docTypes.map(({ key, label }) => {
                const doc = docHashes[key];
                const isRegistered = doc?.hash;
                return (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-3 px-2 font-medium text-gray-700">
                      {label}
                    </td>
                    <td className="py-3 px-2 font-mono text-xs text-gray-500">
                      {isRegistered
                        ? `0x${doc.hash.slice(0, 8)}...${doc.hash.slice(-6)}`
                        : "—"}
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {doc?.registeredAt
                        ? new Date(doc.registeredAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {isRegistered ? (
                        <div className="flex items-center justify-center space-x-1">
                          <FiCheckCircle className="text-green-500 w-4 h-4" />
                          {doc.txHash && (
                            <a
                              href={`${STELLAR_EXPLORER_BASE}/tx/${doc.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <FiExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <FiXCircle className="text-gray-300 w-4 h-4 mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            {registeredDocs.length === docTypes.length ? (
              <>
                <FiCheckCircle className="text-green-500" />
                <span className="text-green-700 font-medium">
                  All documents on-chain verified
                </span>
              </>
            ) : (
              <>
                <FiShield className="text-yellow-500" />
                <span className="text-yellow-700 font-medium">
                  {registeredDocs.length}/{docTypes.length} documents registered
                  on-chain
                </span>
              </>
            )}
          </div>
        </div>

        {/* Attestations */}
        {attestationData?.attestations?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Verification Attestations
            </h3>
            <div className="space-y-2">
              {attestationData.attestations.map((att, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    att.status === "VERIFIED"
                      ? "bg-green-50"
                      : att.status === "FAILED"
                        ? "bg-red-50"
                        : "bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {att.status === "VERIFIED" ? (
                      <FiCheckCircle className="text-green-500 w-4 h-4" />
                    ) : (
                      <FiXCircle className="text-red-500 w-4 h-4" />
                    )}
                    <span className="text-sm text-gray-700">{att.claim}</span>
                  </div>
                  <span className="text-xs text-gray-400">{att.method}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Notice */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>ℹ️ Privacy Notice:</strong> Document contents are private.
            These hashes prove documents exist and haven't been tampered with
            since registration. Anyone can verify integrity by comparing the
            hash of the original file against the on-chain record.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationPage;
