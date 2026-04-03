import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { assignmentEndpoints } from "../../../../services/apis";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2, FiEye, FiEyeOff, FiUsers } from "react-icons/fi";

export default function CourseAssignments({ courseId }) {
  const { token } = useSelector((s) => s.auth);
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxScore: 100 });
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [grading, setGrading] = useState({});

  const fetchAssignments = async () => {
    try {
      const res = await apiConnector("GET", assignmentEndpoints.GET_COURSE_ASSIGNMENTS_API(courseId),
        null, { Authorization: `Bearer ${token}` });
      if (res.data.success) setAssignments(res.data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { if (courseId) fetchAssignments(); }, [courseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error("Title and description required.");
    try {
      const res = await apiConnector("POST", assignmentEndpoints.CREATE_ASSIGNMENT_API,
        { courseId, ...form }, { Authorization: `Bearer ${token}` });
      if (res.data.success) {
        toast.success("Assignment created.");
        setForm({ title: "", description: "", dueDate: "", maxScore: 100 });
        setShowForm(false);
        fetchAssignments();
      }
    } catch { toast.error("Failed."); }
  };

  const togglePublish = async (a) => {
    try {
      const res = await apiConnector("PUT", assignmentEndpoints.UPDATE_ASSIGNMENT_API(a._id),
        { isPublished: !a.isPublished }, { Authorization: `Bearer ${token}` });
      if (res.data.success) {
        setAssignments((p) => p.map((x) => x._id === a._id ? res.data.data : x));
        toast.success(res.data.data.isPublished ? "Published." : "Unpublished.");
      }
    } catch { toast.error("Failed."); }
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await apiConnector("DELETE", assignmentEndpoints.DELETE_ASSIGNMENT_API(id),
        null, { Authorization: `Bearer ${token}` });
      setAssignments((p) => p.filter((a) => a._id !== id));
      toast.success("Deleted.");
    } catch { toast.error("Failed."); }
  };

  const loadSubmissions = async (assignmentId) => {
    try {
      const res = await apiConnector("GET", assignmentEndpoints.GET_SUBMISSIONS_API(assignmentId),
        null, { Authorization: `Bearer ${token}` });
      if (res.data.success) { setSubmissions(res.data.data); setViewSubmissions(assignmentId); }
    } catch { toast.error("Failed to load submissions."); }
  };

  const handleGrade = async (assignmentId, submissionId) => {
    const { grade, feedback } = grading[submissionId] || {};
    try {
      await apiConnector("PATCH", assignmentEndpoints.GRADE_SUBMISSION_API(assignmentId, submissionId),
        { grade: Number(grade), feedback }, { Authorization: `Bearer ${token}` });
      toast.success("Graded.");
      loadSubmissions(assignmentId);
    } catch { toast.error("Failed."); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Assignments</h3>
        <button onClick={() => setShowForm((p) => !p)}
          className="flex items-center gap-1 text-sm bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-3 py-1.5 rounded-lg transition">
          <FiPlus /> {showForm ? "Cancel" : "New Assignment"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-richblack-700 rounded-xl p-4 border border-richblack-600 flex flex-col gap-3">
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Assignment title *"
            className="bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400" />
          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Description / instructions *" rows={3}
            className="bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-richblack-400 mb-1 block">Due Date (optional)</label>
              <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-xs text-richblack-400 mb-1 block">Max Score</label>
              <input type="number" value={form.maxScore} onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))}
                className="w-full bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400" />
            </div>
          </div>
          <button type="submit" className="self-end bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-5 py-2 rounded-lg transition">
            Create Assignment
          </button>
        </form>
      )}

      {assignments.length === 0 && !showForm ? (
        <p className="text-richblack-400 text-sm">No assignments yet.</p>
      ) : assignments.map((a) => (
        <div key={a._id}>
          <div className="bg-richblack-700 rounded-xl p-4 border border-richblack-600 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-richblack-5">{a.title}</p>
              <p className="text-xs text-richblack-400 mt-0.5 line-clamp-2">{a.description}</p>
              {a.dueDate && (
                <p className="text-xs text-richblack-500 mt-1">
                  Due: {new Date(a.dueDate).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${a.isPublished ? "bg-green-900/40 text-green-400" : "bg-richblack-600 text-richblack-300"}`}>
                {a.isPublished ? "Published" : "Draft"}
              </span>
              <button onClick={() => loadSubmissions(a._id)} title="View submissions"
                className="text-richblack-300 hover:text-yellow-400 transition"><FiUsers /></button>
              <button onClick={() => togglePublish(a)} title={a.isPublished ? "Unpublish" : "Publish"}
                className="text-richblack-300 hover:text-yellow-400 transition text-lg">
                {a.isPublished ? <FiEyeOff /> : <FiEye />}
              </button>
              <button onClick={() => deleteAssignment(a._id)} className="text-richblack-400 hover:text-red-400 transition">
                <FiTrash2 />
              </button>
            </div>
          </div>

          {viewSubmissions === a._id && (
            <div className="mt-2 bg-richblack-800 rounded-xl border border-richblack-600 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">Submissions ({submissions.length})</p>
                <button onClick={() => setViewSubmissions(null)} className="text-richblack-400 hover:text-white text-xs">Close</button>
              </div>
              {submissions.length === 0 ? (
                <p className="text-richblack-400 text-sm">No submissions yet.</p>
              ) : submissions.map((s) => (
                <div key={s._id} className="border-b border-richblack-700 py-3 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={s.student?.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-sm text-richblack-5">{s.student?.firstName} {s.student?.lastName}</span>
                    {s.grade !== null && s.grade !== undefined && (
                      <span className="ml-auto text-xs text-yellow-400 font-semibold">{s.grade}/{a.maxScore}</span>
                    )}
                  </div>
                  <p className="text-xs text-richblack-300 bg-richblack-700 rounded p-2 mb-2">{s.content}</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Grade"
                      value={grading[s._id]?.grade || ""}
                      onChange={(e) => setGrading((p) => ({ ...p, [s._id]: { ...p[s._id], grade: e.target.value } }))}
                      className="w-20 bg-richblack-700 text-richblack-5 text-xs rounded px-2 py-1 outline-none border border-richblack-600 focus:border-yellow-400" />
                    <input placeholder="Feedback"
                      value={grading[s._id]?.feedback || ""}
                      onChange={(e) => setGrading((p) => ({ ...p, [s._id]: { ...p[s._id], feedback: e.target.value } }))}
                      className="flex-1 bg-richblack-700 text-richblack-5 text-xs rounded px-2 py-1 outline-none border border-richblack-600 focus:border-yellow-400" />
                    <button onClick={() => handleGrade(a._id, s._id)}
                      className="bg-yellow-400 hover:bg-yellow-300 text-richblack-900 text-xs font-semibold px-3 py-1 rounded transition">
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
