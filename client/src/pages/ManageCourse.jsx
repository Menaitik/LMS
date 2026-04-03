import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";
import CourseQuizzes from "../components/core/Dashboard/InstructorCourses/CourseQuizzes";
import CourseAnnouncements from "../components/core/Dashboard/InstructorCourses/CourseAnnouncements";
import CourseAssignments from "../components/core/Dashboard/InstructorCourses/CourseAssignments";
import { FiArrowLeft } from "react-icons/fi";

const TABS = ["Quizzes", "Assignments", "Announcements", "Students"];

export default function ManageCourse() {
  const { courseId } = useParams();
  const { token } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [tab, setTab] = useState("Quizzes");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", `${courseEndpoints.COURSE_DETAILS_API}/${courseId}`);
        if (res.data.success) setCourse(res.data.data);
      } catch { /* silent */ }
    };
    fetch();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-richblack-900 text-white p-6">
      <button onClick={() => navigate("/dashboard/my-courses")}
        className="flex items-center gap-2 text-richblack-300 hover:text-white text-sm mb-5 transition">
        <FiArrowLeft /> Back to My Courses
      </button>

      <h1 className="text-2xl font-bold mb-1">{course?.courseName || "Manage Course"}</h1>
      <p className="text-richblack-400 text-sm mb-6">{course?.courseDescription}</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-richblack-700 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t ? "border-b-2 border-yellow-400 text-yellow-400" : "text-richblack-300 hover:text-white"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {tab === "Quizzes" && <CourseQuizzes courseId={courseId} />}
        {tab === "Assignments" && <CourseAssignments courseId={courseId} />}
        {tab === "Announcements" && <CourseAnnouncements courseId={courseId} />}
        {tab === "Students" && <StudentProgress courseId={courseId} token={token} />}
      </div>
    </div>
  );
}

function StudentProgress({ courseId, token }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("POST",
          `${import.meta.env.VITE_APP_BASE_URL}/course/getFullCourseDetails`,
          { courseId }, { Authorization: `Bearer ${token}` }
        );
        if (res.data.success) {
          setStudents(res.data.data?.courseDetails?.studentsEnrolled || []);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, [courseId]);

  if (loading) return <p className="text-richblack-400 text-sm">Loading...</p>;

  return (
    <div>
      <p className="text-richblack-300 text-sm mb-4">{students.length} students enrolled</p>
      {students.length === 0 ? (
        <p className="text-richblack-400 text-sm">No students enrolled yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {students.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-richblack-800 rounded-lg px-4 py-3 border border-richblack-600">
              <img
                src={s.image || `https://api.dicebear.com/5.x/initials/svg?seed=${s.firstName}`}
                alt="" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-richblack-5">{s.firstName} {s.lastName}</p>
                <p className="text-xs text-richblack-400">{s.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
