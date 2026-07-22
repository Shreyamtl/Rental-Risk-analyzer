import { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function UploadBox() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError("");
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one page/file");
      return;
    }
    setLoading(true);
    setError("");
    const formData = new FormData();
    files.forEach((file) => formData.append("agreement", file));
    try {
      const { data } = await api.post("/agreements/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/analysis/${data.agreement._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-paper dark:bg-ink-900 p-9 rounded shadow-[0_12px_40px_rgba(0,0,0,0.3)] border-t-4 border-seal mb-8">
      <h2 className="text-ink-800 dark:text-paper text-xl mb-1">Upload Rental Agreement</h2>
      <p className="text-muted dark:text-paper/60 text-sm mb-5">
        Supported: JPG, PNG, PDF — select all pages together (multi-select allowed)
      </p>

      <input
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        multiple
        onChange={handleFileChange}
        className="block w-full p-6 border-2 border-dashed border-[#C9C2A8] dark:border-white/20 rounded-sm bg-[#FFFEF9] dark:bg-ink-900 dark:text-paper mb-4 text-sm cursor-pointer"
      />

      {files.length > 0 && (
        <p className="text-sm text-ink-900 dark:text-paper bg-paper-dim dark:bg-ink-900/70 px-3 py-2.5 rounded-sm mb-4 font-mono">
          Selected {files.length} page{files.length > 1 ? "s" : ""}: {files.map((f) => f.name).join(", ")}
        </p>
      )}
      {error && <p className="text-redline text-sm mb-3">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-seal text-ink-900 px-6 py-3.5 rounded-sm font-semibold text-sm disabled:bg-[#8a8a7c] disabled:cursor-not-allowed hover:not-disabled:-translate-y-0.5 transition-all"
      >
        {loading ? "Analyzing... this may take 30-90s" : "Analyze Agreement"}
      </button>

      <p className="text-xs text-muted dark:text-paper/50 italic mt-5 pt-3 border-t border-dashed border-[#D8D3C2] dark:border-white/15">
        This tool provides informational analysis only and is not a substitute for professional legal advice.
      </p>
    </div>
  );
}