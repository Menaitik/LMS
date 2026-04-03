import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { quizEndpoints } from "../../../services/apis";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function CourseQuizList({ courseId }) {
  const { token } = useSelector((s) => s.auth);
  const [quizzes, setQuizzes] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", quizEndpoints.GET_COURSE_QUIZZES_API(courseId),
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) setQuizzes(res.data.data);
      } catch { /* silent */ }
    };
    if (courseId) fetch();
  }, [courseId]);

  if (quizzes.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-richblack-600 bg-richblack-800 overflow-hidden">
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-richblack-100 hover:bg-richblack-700 transition">
        <span>📝 Course Quizzes ({quizzes.length})</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {open && (
        <div className="px-5 pb-4 flex flex-col gap-2">
          {quizzes.map((q) => (
            <div key={q._id} className="flex items-center justify-between bg-richblack-700 rounded-lg px-4 py-3 border border-richblack-600">
              <div>
                <p className="text-sm font-medium text-richblack-5">{q.title}</p>
                <p className="text-xs text-richblack-400 mt-0.5 flex items-center gap-2">
                  {q.questions?.length} questions
                  {q.timeLimit > 0 && <span className="flex items-center gap-1"><FiClock /> {q.timeLimit} min</span>}
                  · Pass: {q.passingScore}%
                </p>
              </div>
              <Link to={`/quiz/${q._id}`}
                className="text-sm bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-3 py-1.5 rounded-lg transition shrink-0">
                Take Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
