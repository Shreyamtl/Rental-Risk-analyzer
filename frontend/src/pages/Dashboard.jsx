import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import UploadBox from "../components/UploadBox";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/agreements");
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault(); // stop the Link navigation from firing
    e.stopPropagation();

    const confirmed = window.confirm("Delete this analysis? This can't be undone.");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/agreements/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Failed to delete agreement", err);
      alert("Couldn't delete this analysis. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const statusStyle = {
    completed: "bg-stamp-tint text-stamp-green dark:bg-stamp-green/20 dark:text-stamp-green",
    processing: "bg-highlighter-tint text-highlighter dark:bg-highlighter/20 dark:text-highlighter",
    failed: "bg-redline-tint text-redline dark:bg-redline/20 dark:text-redline",
  };

  return (
    <div>
      <UploadBox />
      <div className="bg-paper dark:bg-ink-800 px-8 py-7 rounded shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        <h3 className="text-ink-900 dark:text-paper text-lg mb-1">Past Analyses</h3>
        {loading ? (
          <p className="text-muted dark:text-paper/60 text-sm mt-2">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-muted dark:text-paper/60 text-sm mt-2">No agreements analyzed yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5 mt-4">
            {history.map((item) => (
              <Link
                to={`/analysis/${item._id}`}
                key={item._id}
                className="flex justify-between items-center px-4.5 py-3.5 border border-[#E4DFCE] dark:border-white/10 rounded-sm text-sm text-ink-900 dark:text-paper hover:border-seal dark:hover:border-seal hover:bg-paper-dim dark:hover:bg-ink-900/40 transition-colors group"
              >
                <span className="truncate flex-1">{item.originalFileName}</span>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-mono uppercase ${statusStyle[item.status]}`}>
                    {item.status}
                  </span>
                  {item.overallRiskScore !== undefined && (
                    <span className="font-mono text-xs text-muted dark:text-paper/50">
                      Risk: {item.overallRiskScore}/100
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    disabled={deletingId === item._id}
                    aria-label="Delete analysis"
                    className="opacity-0 group-hover:opacity-100 text-ink-400 dark:text-paper/70 ml-8 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-xs font-medium px-2.5 py-1 rounded-md border border-transparent hover:border-red-200 dark:hover:border-red-800/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {deletingId === item._id ? "..." : "Delete"}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
