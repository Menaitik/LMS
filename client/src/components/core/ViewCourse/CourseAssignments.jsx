import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { assignmentEndpoints } from "../../../services/apis";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiChevronUp, FiClipboard, FiCheckCircle } from "react-icons/fi";

export default function CourseAssignments({ courseId }) {
  const { token } = useSelector((s) => s.auth);
  const [assignments, setAssignments] = useState([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(null);
  const [content, setContent] = useState({});
  const [mySubmissions, setMySubmissions] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", assignmentEndpoints.GET_COURSE_ASSIGNMENTS_API(courseId),
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) setAssignments(res.data.data);
      } catch { /* silent */ }
    };
    if (courseId) fetch();
  }, [courseId]);

  const loadMySubmission = async (assignmentId) => {
    if (mySubmissions[assignmentId] !== undefined) return;
    try {
      const res = await apiConnector("GET", assignmentEndpoints.GET_MY_SUBMISSION_API(assignmentId),
        null, { Authorization: `Bearer ${token}` });
      if (res.data.success) {
        setMySubmissions((p) => ({ ...p, [assignmentId]: res.data.data }));
      }
    } catch { /* silent */ }
  };

  const handleSubmit = async (assignmentId) => {
    if (!content[assignmentId]?.trim()) return toast.error("Please write your submission.");
    setSubmitting(assignmentId);
    try {
      const res = await apiConnector("POST", assignmentEndpoints.SUBMIT_ASSIGNMENT_API(assignmentId),
        { content: content[assignmentId] }, { Authorization: `Bearer ${token}` });
      if (res.data.success) {
        toast.success("Submitted!");
        setMySubmissions((p) => ({ ...p, [assignmentId]: { content: content[assignmentId] } }));
        setContent((p) => ({ ...p, [assignmentId]: "" }));
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Submission failed.");
    }
    setSubmitting(null);
  };

  if (assignments.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-richblack-600 bg-richblack-800 overflow-hidden">
      <button onClick={() => { setOpen((p) => !p); if (!open) assignments.forEach((a) => loadMySubmission(a._id)); }}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-richblack-100 hover:bg-richblack-700 transition">
        <span className="flex items-center gap-2"><FiClipboard className="text-yellow-400" /> Assignments ({assignments.length})</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {open && (
        <div className="px-5 pb-4 flex flex-col gap-4">
          {assignments.map((a) => {
            const submitted = mySubmissions[a._id];
            const isPastDue = a.dueDate && new Date() > new Date(a.dueDate);
            return (
              <div key={a._id} className="bg-richblack-700 rounded-xl p-4 border border-richblack-600">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-richblack-5">{a.title}</p>
                    {a.dueDate && (
                      <p className={`text-xs mt-0.5 ${isPastDue ? "text-red-400" : "text-richblack-400"}`}>
                        Due: {new Date(a.dueDate).toLocaleString()}
                        {isPastDue && " (Closed)"}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-richblack-400 shrink-0">Max: {a.maxScore} pts</span>
                </div>
                <p className="text-sm text-richblack-200 mb-3">{a.description}</p>

                {submitted ? (
                  <div className="bg-richblack-800 rounded-lg p-3 border border-green-600/30">
                    <p className="text-xs text-green-400 flex items-center gap-1 mb-1">
                      <FiCheckCircle /> Submitted
                      {submitted.grade !== null && submitted.grade !== undefined && (
                        <span className="ml-2 text-yellow-400 font-semibold">Grade: {submitted.grade}/{a.maxScore}</span>
                      )}
                    </p>
                    <p className="text-xs text-richblack-300">{submitted.content}</p>
                    {submitted.feedback && (
                      <p className="text-xs text-richblack-400 mt-1 italic">Feedback: {submitted.feedback}</p>
                    )}
                  </div>
                ) : !isPastDue ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={content[a._id] || ""}
                      onChange={(e) => setContent((p) => ({ ...p, [a._id]: e.target.value }))}
                      placeholder="Write your submission here..."
                      rows={3}
                      className="bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400 resize-none"
                    />
                    <button
                      onClick={() => handleSubmit(a._id)}
                      disabled={submitting === a._id}
                      className="self-end bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 py-2 rounded-lg transition"
                    >
                      {submitting === a._id ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-red-400">Submission deadline has passed.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
