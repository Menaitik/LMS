import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { quizEndpoints } from "../../../../services/apis";
import { toast } from "react-hot-toast";
import { FiTrash2, FiEye, FiEyeOff, FiPlus } from "react-icons/fi";
import QuizBuilder from "./QuizBuilder";

export default function CourseQuizzes({ courseId }) {
  const { token } = useSelector((s) => s.auth);
  const [quizzes, setQuizzes] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const res = await apiConnector("GET", quizEndpoints.GET_COURSE_QUIZZES_API(courseId),
        null, { Authorization: `Bearer ${token}` });
      if (res.data.success) setQuizzes(res.data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { if (courseId) fetchQuizzes(); }, [courseId]);

  const togglePublish = async (quiz) => {
    try {
      const res = await apiConnector("PUT", quizEndpoints.UPDATE_QUIZ_API(quiz._id),
        { isPublished: !quiz.isPublished }, { Authorization: `Bearer ${token}` });
      if (res.data.success) {
        setQuizzes((p) => p.map((q) => q._id === quiz._id ? res.data.data : q));
        toast.success(res.data.data.isPublished ? "Quiz published." : "Quiz unpublished.");
      }
    } catch { toast.error("Failed."); }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await apiConnector("DELETE", quizEndpoints.DELETE_QUIZ_API(quizId),
        null, { Authorization: `Bearer ${token}` });
      setQuizzes((p) => p.filter((q) => q._id !== quizId));
      toast.success("Quiz deleted.");
    } catch { toast.error("Failed."); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Quizzes</h3>
        <button onClick={() => setShowBuilder((p) => !p)}
          className="flex items-center gap-1 text-sm bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-3 py-1.5 rounded-lg transition">
          <FiPlus /> {showBuilder ? "Cancel" : "New Quiz"}
        </button>
      </div>

      {showBuilder && (
        <QuizBuilder courseId={courseId} onClose={() => setShowBuilder(false)} onCreated={() => { fetchQuizzes(); setShowBuilder(false); }} />
      )}

      {quizzes.length === 0 && !showBuilder ? (
        <p className="text-richblack-400 text-sm">No quizzes yet. Create one above.</p>
      ) : quizzes.map((q) => (
        <div key={q._id} className="bg-richblack-700 rounded-xl p-4 border border-richblack-600 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-richblack-5">{q.title}</p>
            <p className="text-xs text-richblack-400 mt-0.5">
              {q.questions.length} questions · Pass: {q.passingScore}%
              {q.timeLimit > 0 && ` · ${q.timeLimit} min`}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${q.isPublished ? "bg-green-900/40 text-green-400" : "bg-richblack-600 text-richblack-300"}`}>
              {q.isPublished ? "Published" : "Draft"}
            </span>
            <button onClick={() => togglePublish(q)} title={q.isPublished ? "Unpublish" : "Publish"}
              className="text-richblack-300 hover:text-yellow-400 transition text-lg">
              {q.isPublished ? <FiEyeOff /> : <FiEye />}
            </button>
            <button onClick={() => deleteQuiz(q._id)} className="text-richblack-400 hover:text-red-400 transition">
              <FiTrash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
