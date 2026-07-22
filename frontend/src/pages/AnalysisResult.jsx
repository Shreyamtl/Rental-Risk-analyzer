import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import RiskScoreGauge from "../components/RiskScoreGauge";
import FlaggedClauseCard from "../components/FlaggedClauseCard";
import AgreementChat from "../components/AgreementChat";

export default function AnalysisResult() {
  const { id } = useParams();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const { data } = await api.get(`/agreements/${id}`);
        setAgreement(data);
      } catch (err) {
        setError("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };
    fetchAgreement();
  }, [id]);

  if (loading) return <p className="text-center text-paper mt-12">Loading analysis...</p>;
  if (error) return <p className="text-center text-redline mt-12">{error}</p>;
  if (!agreement) return null;

  return (
    <div className="bg-paper dark:bg-ink-900 p-10 rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <h2 className="flex items-center gap-18 text-ink-900 dark:text-paper text-2xl mb-6">
        <span>{agreement.originalFileName}</span>

        <button
          onClick={async () => {
            const token = localStorage.getItem("token");

            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/agreements/${id}/report`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `riskreport_${id}.pdf`;
            a.click();
          }}
          className="text-xl bg-paper-dim dark:bg-ink-800 text-seal/95 px-4 py-2 rounded-xl hover:opacity-90 cursor-pointer"
        >
          Download PDF Report
        </button>
      </h2>
      <div className="flex gap-10 items-center flex-wrap pb-8 mb-1 border-b border-dashed border-[#D8D3C2] dark:border-white/15">
        <RiskScoreGauge score={agreement.overallRiskScore || 0} />
        <div className="flex-1 min-w-[240px]">
          <h4 className="font-mono text-xs tracking-wider uppercase text-muted dark:text-paper/50 mb-3">Extracted Details</h4>
          <ul>
            {[
              ["Security Deposit", agreement.structuredClauses?.securityDeposit],
              ["Notice Period (Tenant)", agreement.structuredClauses?.noticePeriodTenant],
              ["Notice Period (Landlord)", agreement.structuredClauses?.noticePeriodLandlord],
              ["Lock-in Period", agreement.structuredClauses?.lockInPeriod],
            ].map(([label, value]) => (
              <li key={label} className="py-2 text-sm text-ink-900 dark:text-paper/90 border-b border-[#EFEBDD] dark:border-white/10">
                <strong className="text-ink-900 dark:text-paper">{label}:</strong> {value || "Not found"}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="text-ink-900 dark:text-paper text-lg mt-7 mb-4">
        Flagged Clauses ({agreement.flaggedClauses?.length || 0})
      </h3>
      {agreement.flaggedClauses?.length === 0 ? (
        <p className="text-muted dark:text-paper/60 text-sm">No significant risks flagged.</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {agreement.flaggedClauses?.map((clause, idx) => (
            <FlaggedClauseCard key={idx} clause={clause} agreementId={agreement._id} clauseIndex={idx} />
          ))}
        </div>
      )}

      <h3 className="text-ink-900 dark:text-paper text-lg mt-7 mb-4">Ask Your Questions</h3>
      <AgreementChat agreementId={agreement._id} />

      <p className="text-xs text-muted dark:text-paper/50 italic mt-6 pt-3 border-t border-dashed border-[#D8D3C2] dark:border-white/15">
        This analysis is informational only and not a substitute for professional legal advice.
      </p>
    </div>
  );
}