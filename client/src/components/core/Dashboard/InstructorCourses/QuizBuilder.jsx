import { useState } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { quizEndpoints, aiEndpoints } from "../../../../services/apis";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2, FiCpu } from "react-icons/fi";

const emptyQuestion = () => ({
  questionText: "",
  options: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  explanation: "",
});

export default function QuizBuilder({ courseId, subSectionId, onClose, onCreated }) {
  const { token } = useSelector((s) => s.auth);
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(60);
  const [timeLimit, setTimeLimit] = useState(0);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiCount, setAiCount] = useState(5);

  const handleAIGenerate = async () => {
    if (!subSectionId) return toast.error("Pass a subSectionId prop to generate from lecture content.");
    setAiGenerating(true);
    try {
      const res = await apiConnector("POST", aiEndpoints.GENERATE_QUIZ_API,
        { subSectionId, count: aiCount },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data.success && res.data.questions?.length) {
        setQuestions(res.data.questions);
        toast.success(`Generated ${res.data.questions.length} questions!`);
      } else {
        toast.error(res.data.message || "No questions generated.");
      }
    } catch { toast.error("AI generation failed."); }
    setAiGenerating(false);
  };

  const updateQuestion = (qi, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qi] = { ...updated[qi], [field]: value };
      return updated;
    });
  };

  const updateOption = (qi, oi, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qi].options];
      if (field === "isCorrect") {
        opts.forEach((_, i) => (opts[i] = { ...opts[i], isCorrect: i === oi }));
      } else {
        opts[oi] = { ...opts[oi], [field]: value };
      }
      updated[qi] = { ...updated[qi], options: opts };
      return updated;
    });
  };

  const addQuestion = () => setQuestions((p) => [...p, emptyQuestion()]);
  const removeQuestion = (qi) => setQuestions((p) => p.filter((_, i) => i !== qi));

  const handleSubmit = async (publish = false) => {
    if (!title.trim()) return toast.error("Quiz title is required.");
    for (const q of questions) {
      if (!q.questionText.trim()) return toast.error("All questions need text.");
      if (!q.options.some((o) => o.isCorrect)) return toast.error("Each question needs a correct answer.");
      if (q.options.some((o) => !o.text.trim())) return toast.error("All options need text.");
    }
    setLoading(true);
    try {
      const res = await apiConnector("POST", quizEndpoints.CREATE_QUIZ_API,
        { courseId, title, questions, passingScore, timeLimit, isPublished: publish },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        toast.success(publish ? "Quiz published!" : "Quiz saved as draft.");
        onCreated?.(res.data.data);
        onClose?.();
      }
    } catch { toast.error("Failed to create quiz."); }
    setLoading(false);
  };

  return (
    <div className="bg-richblack-800 rounded-2xl p-6 border border-richblack-600 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Create Quiz</h2>
        {onClose && (
          <button onClick={onClose} className="text-richblack-300 hover:text-white text-xl">✕</button>
        )}
      </div>

      {/* AI Generate strip */}
      <div className="flex items-center gap-3 bg-richblack-700 rounded-xl px-4 py-3 border border-richblack-600">
        <FiCpu className="text-yellow-400 text-lg shrink-0" />
        <span className="text-sm text-richblack-200 flex-1">Generate questions from lecture content using AI</span>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-richblack-400">Questions:</label>
          <input type="number" min={1} max={10} value={aiCount}
            onChange={(e) => setAiCount(Number(e.target.value))}
            className="w-14 bg-richblack-800 text-richblack-5 text-sm rounded px-2 py-1 outline-none border border-richblack-600 focus:border-yellow-400 text-center" />
          <button onClick={handleAIGenerate} disabled={aiGenerating}
            className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-richblack-900 font-semibold text-sm px-3 py-1.5 rounded-lg transition">
            <FiCpu /> {aiGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="text-xs text-richblack-300 mb-1 block">Quiz Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Module 1 Quiz"
            className="w-full bg-richblack-700 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400" />
        </div>
        <div>
          <label className="text-xs text-richblack-300 mb-1 block">Passing Score (%)</label>
          <input type="number" min={0} max={100} value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full bg-richblack-700 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400" />
        </div>
        <div>
          <label className="text-xs text-richblack-300 mb-1 block">Time Limit (min, 0=none)</label>
          <input type="number" min={0} value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full bg-richblack-700 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400" />
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-4">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-richblack-700 rounded-xl p-4 border border-richblack-600">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs text-richblack-300 font-semibold">Q{qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)} className="text-pink-400 hover:text-pink-300">
                  <FiTrash2 />
                </button>
              )}
            </div>
            <input value={q.questionText}
              onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
              placeholder="Question text..."
              className="w-full bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={opt.isCorrect}
                    onChange={() => updateOption(qi, oi, "isCorrect", true)}
                    className="accent-yellow-400 shrink-0" title="Mark as correct" />
                  <input value={opt.text}
                    onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-1.5 outline-none border border-richblack-600 focus:border-yellow-400" />
                </div>
              ))}
            </div>
            <input value={q.explanation}
              onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
              placeholder="Explanation (optional, shown after submit)"
              className="w-full bg-richblack-800 text-richblack-400 text-xs rounded-md px-3 py-1.5 outline-none border border-richblack-600 focus:border-yellow-400" />
          </div>
        ))}
      </div>

      <button onClick={addQuestion}
        className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition self-start">
        <FiPlus /> Add Question
      </button>

      <div className="flex gap-3 justify-end">
        <button onClick={() => handleSubmit(false)} disabled={loading}
          className="border border-richblack-500 text-richblack-100 hover:text-white px-5 py-2 rounded-lg text-sm transition">
          Save Draft
        </button>
        <button onClick={() => handleSubmit(true)} disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-5 py-2 rounded-lg text-sm transition">
          {loading ? "Saving..." : "Publish Quiz"}
        </button>
      </div>
    </div>
  );
}
