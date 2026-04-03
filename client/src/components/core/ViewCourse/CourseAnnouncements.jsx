import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { announcementEndpoints } from "../../../services/apis";
import { FiChevronDown, FiChevronUp, FiBell } from "react-icons/fi";

export default function CourseAnnouncements({ courseId }) {
  const { token } = useSelector((s) => s.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", announcementEndpoints.GET_COURSE_ANNOUNCEMENTS_API(courseId),
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) setAnnouncements(res.data.data);
      } catch { /* silent */ }
    };
    if (courseId) fetch();
  }, [courseId]);

  if (announcements.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-richblack-600 bg-richblack-800 overflow-hidden">
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-richblack-100 hover:bg-richblack-700 transition">
        <span className="flex items-center gap-2">
          <FiBell className="text-yellow-400" />
          Announcements ({announcements.length})
        </span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {open && (
        <div className="px-5 pb-4 flex flex-col gap-3">
          {announcements.map((a) => (
            <div key={a._id} className="bg-richblack-700 rounded-lg p-4 border border-richblack-600">
              <div className="flex items-center gap-2 mb-1">
                <img src={a.author?.image} alt="" className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs text-richblack-300">
                  {a.author?.firstName} {a.author?.lastName} · {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-semibold text-richblack-5">{a.title}</p>
              <p className="text-sm text-richblack-200 mt-1">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
