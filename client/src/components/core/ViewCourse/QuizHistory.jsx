import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { quizEndpoints } from "../../../services/apis";
import { FiChevronDown, FiChevronUp, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function QuizHistory({ quizId, quizTitle }) {
  const { token } = useSelector((s) => s.auth);
  const [attempts, setAttempts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", quizEndpoints.GET_MY_ATTEMPTS_API(quizId),
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) setAttempts(res.data.data);
      } catch { /* silent */ }
    };
    if (quizId) fetch();
  }, [quizId]);

  if (attempts.length === 0) return null;

  return (
    <div className="mt-2 rounded-lg border border-richblack-600 overflow-hidden">
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-richblack-700 text-sm text-richblack-200 hover:bg-richblack-600 transition">
        <span>My Attempts ({attempts.length})</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && (
        <div className="flex flex-col divide-y divide-richblack-700">
          {attempts.map((a, i) => (
            <div key={a._id} className="flex items-center justify-between px-4 py-2.5 bg-richblack-800">
              <span className="text-xs text-richblack-400">Attempt {attempts.length - i}</span>
              <span className={`text-sm font-semibold ${a.passed ? "text-green-400" : "text-red-400"}`}>
                {a.score}%
              </span>
              <span className="flex items-center gap-1 text-xs">
                {a.passed
                  ? <><FiCheckCircle className="text-green-400" /> Passed</>
                  : <><FiXCircle className="text-red-400" /> Failed</>}
              </span>
              <span className="text-xs text-richblack-500">
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
