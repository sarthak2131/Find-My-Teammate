import { useState } from "react";
import { X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReportModal({ isOpen, onClose, onSubmit, projectTitle }) {
  const [reason, setReason] = useState("");
  const [customDetail, setCustomDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const PRESET_REASONS = [
    "Spam or Advertisement",
    "Inappropriate/Offensive Content",
    "Not related to a Hackathon",
    "Harassment or Abusive Behavior",
    "Other (Specify below)"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason for reporting.");
      return;
    }

    const finalReason = reason === "Other (Specify below)" 
      ? `Other: ${customDetail.trim()}` 
      : reason + (customDetail.trim() ? ` - Details: ${customDetail.trim()}` : "");

    if (reason === "Other (Specify below)" && !customDetail.trim()) {
      setError("Please provide specific details for the 'Other' reason.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit(finalReason);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason("");
        setCustomDetail("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
        />

        {/* Modal content panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="festival-card relative z-10 w-full max-w-md overflow-hidden bg-white/95 p-6 shadow-festival dark:bg-slate-950/95"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl border border-slate-100 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-950 dark:text-white">
                Report Post
              </h3>
              <p className="text-xs text-slate-500">
                Help us keep our workspace safe and relevant.
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
            Reporting: <span className="font-bold text-brand-600 dark:text-brand-400">"{projectTitle}"</span>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-950 dark:text-white">Report Submitted</p>
              <p className="text-xs text-slate-500">The platform administrators will review this shortly.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Why are you reporting this?
                </label>
                <div className="space-y-1.5">
                  {PRESET_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setReason(r);
                        setError("");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-xs font-semibold transition ${
                        reason === r
                          ? "border-brand-500 bg-brand-500/10 text-brand-700 dark:border-brand-500 dark:text-brand-400"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span>{r}</span>
                      <span className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                        reason === r ? "bg-brand-500 border-brand-500" : "border-slate-300"
                      }`}>
                        {reason === r && <span className="h-1 w-1 rounded-full bg-white" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {(reason === "Other (Specify below)" || reason !== "") && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    value={customDetail}
                    onChange={(e) => setCustomDetail(e.target.value)}
                    placeholder="Provide details about why this post is inappropriate..."
                    className="input py-2 text-xs font-semibold resize-none"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-[11px] font-semibold text-red-600 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 py-2 text-xs font-bold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="inline mr-2 h-3.5 w-3.5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
