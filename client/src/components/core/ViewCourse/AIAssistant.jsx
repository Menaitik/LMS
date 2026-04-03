import { useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { aiEndpoints } from "../../../services/apis";
import { toast } from "react-hot-toast";
import { FiCpu, FiMessageSquare, FiFileText, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function AIAssistant({ subSectionId }) {
  const { token } = useSelector((s) => s.auth);
  const [tab, setTab] = useState("doubt"); // "doubt" | "summary"
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDoubt = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await apiConnector("POST", aiEndpoints.ASK_DOUBT_API,
        { question, subSectionId },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) setAnswer(res.data.answer);
      else toast.error(res.data.message);
    } catch { toast.error("AI service unavailable."); }
    setLoading(false);
  };

  const handleSummary = async () => {
    setLoading(true);
    setSummary("");
    try {
      const res = await apiConnector("POST", aiEndpoints.GENERATE_SUMMARY_API,
        { subSectionId },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) setSummary(res.data.summary);
      else toast.error(res.data.message);
    } catch { toast.error("AI service unavailable."); }
    setLoading(false);
  };

  return (
    <div className="mt-4 rounded-xl border border-richblack-600 bg-richblack-800 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-yellow-400 hover:bg-richblack-700 transition"
      >
        <span className="flex items-center gap-2"><FiCpu /> AI Assistant</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-richblack-600 pb-2">
            <button
              onClick={() => setTab("doubt")}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition ${tab === "doubt" ? "bg-yellow-400 text-richblack-900 font-semibold" : "text-richblack-300 hover:text-white"}`}
            >
              <FiMessageSquare /> Ask a Doubt
            </button>
            <button
              onClick={() => setTab("summary")}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition ${tab === "summary" ? "bg-yellow-400 text-richblack-900 font-semibold" : "text-richblack-300 hover:text-white"}`}
            >
              <FiFileText /> Summarize
            </button>
          </div>

          {tab === "doubt" && (
            <div className="flex flex-col gap-3">
              <form onSubmit={handleDoubt} className="flex gap-2">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about this lecture..."
                  className="flex-1 bg-richblack-700 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 py-2 rounded-md transition shrink-0"
                >
                  {loading ? "..." : "Ask"}
                </button>
              </form>
              {answer && (
                <div className="bg-richblack-700 rounded-lg p-4 text-sm text-richblack-100 whitespace-pre-wrap leading-relaxed">
                  {answer}
                </div>
              )}
            </div>
          )}

          {tab === "summary" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSummary}
                disabled={loading}
                className="self-start bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 py-2 rounded-md transition"
              >
                {loading ? "Generating..." : "Generate Summary"}
              </button>
              {summary && (
                <div className="bg-richblack-700 rounded-lg p-4 text-sm text-richblack-100 whitespace-pre-wrap leading-relaxed">
                  {summary}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
