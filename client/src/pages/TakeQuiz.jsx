import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { quizEndpoints } from "../services/apis";
import { toast } from "react-hot-toast";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("token"));

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", quizEndpoints.GET_QUIZ_API(quizId),
          null, { Authorization: `Bearer ${token}` }
        );
        if (res.data.success) setQuiz(res.data.data);
        else toast.error(res.data.message);
      } catch { toast.error("Failed to load quiz."); }
      setLoading(false);
    };
    fetch();
  }, [quizId]);

  const handleSelect = (questionId, optionIndex) => {
    if (result) return; // locked after submit
    setAnswers((p) => ({ ...p, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const payload = {
      answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex,
      })),
      timeTaken,
    };
    try {
      const res = await apiConnector("POST", quizEndpoints.SUBMIT_QUIZ_API(quizId),
        payload, { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        setResult(res.data.data);
        toast.success(res.data.message);
      }
    } catch { toast.error("Submission failed."); }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading quiz...</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center text-pink-400">Quiz not found.</div>;

  return (
    <div className="min-h-screen bg-richblack-900 pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
        <p className="text-richblack-300 text-sm mb-6">
          {quiz.questions.length} questions · Passing score: {quiz.passingScore}%
          {quiz.timeLimit > 0 && ` · ${quiz.timeLimit} min`}
        </p>

        {/* Result banner */}
        {result && (
          <div className={`rounded-xl p-5 mb-6 text-center ${result.passed ? "bg-green-900/40 border border-green-500" : "bg-red-900/40 border border-red-500"}`}>
            <p className={`text-2xl font-bold ${result.passed ? "text-green-400" : "text-red-400"}`}>
              {result.passed ? "🎉 Passed!" : "❌ Failed"}
            </p>
            <p className="text-white text-lg mt-1">Score: {result.score}%</p>
            <p className="text-richblack-300 text-sm mt-1">
              {result.answers.filter((a) => a.isCorrect).length} / {quiz.questions.length} correct
            </p>
          </div>
        )}

        {/* Questions */}
        <div className="flex flex-col gap-6">
          {quiz.questions.map((q, qi) => {
            const submitted = !!result;
            const selectedIdx = answers[q._id];
            const gradedAnswer = result?.answers?.find((a) => a.questionId === q._id);
            const resultQuestion = result?.questions?.find((rq) => rq._id === q._id);

            return (
              <div key={q._id} className="bg-richblack-800 rounded-xl p-5 border border-richblack-600">
                <p className="text-richblack-5 font-medium mb-3">
                  {qi + 1}. {q.questionText}
                </p>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt, oi) => {
                    let cls = "border border-richblack-600 bg-richblack-700 text-richblack-100";
                    if (submitted && resultQuestion) {
                      const isCorrect = resultQuestion.options[oi]?.isCorrect;
                      const isSelected = selectedIdx === oi;
                      if (isCorrect) cls = "border border-green-500 bg-green-900/30 text-green-300";
                      else if (isSelected && !isCorrect) cls = "border border-red-500 bg-red-900/30 text-red-300";
                    } else if (selectedIdx === oi) {
                      cls = "border border-yellow-400 bg-yellow-400/10 text-yellow-300";
                    }

                    return (
                      <button
                        key={oi}
                        onClick={() => handleSelect(q._id, oi)}
                        className={`text-left px-4 py-2.5 rounded-lg text-sm transition-all ${cls}`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                {submitted && resultQuestion?.explanation && (
                  <p className="mt-3 text-xs text-richblack-300 italic">
                    💡 {resultQuestion.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-8 w-full bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold py-3 rounded-xl transition"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}

        {result && (
          <button
            onClick={() => navigate(-1)}
            className="mt-6 w-full border border-richblack-500 text-richblack-100 hover:text-white py-3 rounded-xl transition"
          >
            Back to Course
          </button>
        )}
      </div>
    </div>
  );
}
