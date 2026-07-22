import { useState } from "react";
import api from "../api/axiosConfig";

export default function FlaggedClauseCard({ clause, agreementId, clauseIndex }) {
  const [feedback, setFeedback] = useState(clause.feedback || null);
  const [sending, setSending] = useState(false);

  const styles = {
    high: {
      bg: "bg-redline-tint dark:bg-redline/25",
      text: "text-redline dark:text-redline-bright",
      border: "border-redline dark:border-redline-bright",
    },
    medium: {
      bg: "bg-highlighter-tint dark:bg-highlighter/25",
      text: "text-highlighter dark:text-highlighter-bright",
      border: "border-highlighter dark:border-highlighter-bright",
    },
    low: {
      bg: "bg-stamp-tint dark:bg-stamp-green/25",
      text: "text-stamp-green dark:text-stamp-green-bright",
      border: "border-stamp-green dark:border-stamp-green-bright",
    },
  };
  const s = styles[clause.riskLevel];

  const sendFeedback = async (value) => {
    const newValue = feedback === value ? null : value;
    setFeedback(newValue);
    setSending(true);
    try {
      await api.patch(`/agreements/${agreementId}/feedback/${clauseIndex}`, { feedback: newValue });
    } catch (err) {
      console.error("Feedback failed", err);
      setFeedback(feedback);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`bg-paper-dim dark:bg-seal/75 p-5 rounded-sm border-l-4 ${s.border}`}>
      <div className="flex gap-3 items-center mb-2.5">
        <span className={`${s.bg} ${s.text} px-2.5 py-1 rounded-sm text-[0.68rem] font-mono font-semibold tracking-wide`}>
          {clause.riskLevel.toUpperCase()}
        </span>
        <span className="capitalize font-semibold text-ink-900 dark:text-paper text-sm">
          {clause.category.replace(/_/g, " ")}
        </span>
      </div>

      {clause.extractedText && (
        <p className="italic text-muted dark:text-paper/60 text-sm mb-2 pl-3 border-l-2 border-[#D8D3C2] dark:border-white/20">
          "{clause.extractedText}"
        </p>
      )}

      <p className="text-sm leading-relaxed text-ink-900 dark:text-paper/90">{clause.plainLanguageExplanation}</p>

      <div className="flex items-center justify-between mt-3">
        {clause.similarityScore ? (
          <p className="text-xs text-muted dark:text-paper/50 font-mono">
            Match confidence: {(clause.similarityScore * 100).toFixed(0)}%
          </p>
        ) : (
          <span />
        )}

        {agreementId && clauseIndex !== undefined && (
          <div className="flex gap-2">
            <button
              onClick={() => sendFeedback("helpful")}
              disabled={sending}
              className={`text-xs px-2.5 py-1 rounded-sm border transition-colors ${
                feedback === "helpful"
                  ? "bg-stamp-tint dark:bg-stamp-green/15 border-stamp-green dark:border-stamp-green-bright text-stamp-green dark:text-stamp-green-bright font-semibold"
                  : "border-[#D8D3C2] dark:border-white/25 text-muted dark:text-paper/60 hover:border-stamp-green dark:hover:border-stamp-green-bright dark:hover:text-stamp-green-bright"
              }`}
            >
            Helpful
            </button>
            <button
              onClick={() => sendFeedback("not_helpful")}
              disabled={sending}
              className={`text-xs px-2.5 py-1 rounded-sm border transition-colors ${
                feedback === "not_helpful"
                  ? "bg-redline-tint dark:bg-redline/25 border-redline dark:border-redline-bright text-redline dark:text-redline-bright font-semibold"
                  : "border-[#D8D3C2] dark:border-white/25 text-muted dark:text-paper/60 hover:border-redline dark:hover:border-redline-bright dark:hover:text-redline-bright"
              }`}
            >
             Not helpful
            </button>
          </div>
        )}
      </div>
    </div>
  );
}