import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { announcementEndpoints } from "../../../../services/apis";
import { toast } from "react-hot-toast";
import { FiTrash2, FiSend } from "react-icons/fi";

export default function CourseAnnouncements({ courseId }) {
  const { token } = useSelector((s) => s.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    try {
      const res = await apiConnector("GET", announcementEndpoints.GET_COURSE_ANNOUNCEMENTS_API(courseId),
        null, { Authorization: `Bearer ${token}` });
      if (res.data.success) setAnnouncements(res.data.data);
    } catch { /* silent */ }
  };

  useEffect(() => { if (courseId) fetch(); }, [courseId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const res = await apiConnector("POST", announcementEndpoints.CREATE_ANNOUNCEMENT_API,
        { courseId, title, content }, { Authorization: `Bearer ${token}` });
      if (res.data.success) {
        toast.success("Announcement posted!");
        setTitle(""); setContent("");
        fetch();
      }
    } catch { toast.error("Failed to post."); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await apiConnector("DELETE", announcementEndpoints.DELETE_ANNOUNCEMENT_API(id),
        null, { Authorization: `Bearer ${token}` });
      setAnnouncements((p) => p.filter((a) => a._id !== id));
      toast.success("Deleted.");
    } catch { toast.error("Failed."); }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-white">Announcements</h3>

      <form onSubmit={handlePost} className="bg-richblack-700 rounded-xl p-4 flex flex-col gap-3 border border-richblack-600">
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title..."
          className="bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement..."
          rows={3}
          className="bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400 resize-none" />
        <button type="submit" disabled={loading}
          className="self-end flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 py-2 rounded-md transition">
          <FiSend /> {loading ? "Posting..." : "Post"}
        </button>
      </form>

      {announcements.length === 0 ? (
        <p className="text-richblack-400 text-sm">No announcements yet.</p>
      ) : announcements.map((a) => (
        <div key={a._id} className="bg-richblack-700 rounded-xl p-4 border border-richblack-600">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-richblack-5">{a.title}</p>
              <p className="text-xs text-richblack-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => handleDelete(a._id)} className="text-richblack-400 hover:text-red-400 transition shrink-0">
              <FiTrash2 />
            </button>
          </div>
          <p className="mt-2 text-sm text-richblack-200">{a.content}</p>
        </div>
      ))}
    </div>
  );
}
