import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../../services/apiConnector";
import { adminEndpoints } from "../../../../../services/apis";
import { toast } from "react-hot-toast";
import { FiTrash2, FiSearch } from "react-icons/fi";
import { MdCheckCircle, MdOutlineUnpublished } from "react-icons/md";

export default function AdminCourses() {
  const { token } = useSelector((s) => s.auth);
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      const res = await apiConnector("GET", `${adminEndpoints.GET_ALL_COURSES_ADMIN_API}?${params}`,
        null, { Authorization: `Bearer ${token}` });
      if (res.data.success) { setCourses(res.data.data); setTotal(res.data.total); }
    } catch { toast.error("Failed to load courses."); }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, [status]);

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course permanently?")) return;
    try {
      const res = await apiConnector("DELETE", adminEndpoints.DELETE_COURSE_ADMIN_API(courseId),
        null, { Authorization: `Bearer ${token}` });
      if (res.data.success) {
        toast.success("Course deleted.");
        setCourses((p) => p.filter((c) => c._id !== courseId));
        setTotal((t) => t - 1);
      }
    } catch { toast.error("Failed."); }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">All Courses</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <form onSubmit={(e) => { e.preventDefault(); fetchCourses(); }}
          className="flex gap-2 flex-1 min-w-[200px]">
          <div className="flex flex-1 items-center bg-richblack-700 border border-richblack-600 rounded-lg px-3 gap-2 focus-within:border-yellow-400 transition">
            <FiSearch className="text-richblack-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="bg-transparent text-sm text-richblack-5 outline-none py-2 w-full placeholder:text-richblack-400" />
          </div>
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 rounded-lg transition">
            Search
          </button>
        </form>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="bg-richblack-700 border border-richblack-600 text-sm text-richblack-100 rounded-lg px-3 py-2 outline-none focus:border-yellow-400">
          <option value="">All Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      <p className="text-richblack-400 text-sm mb-3">{total} courses</p>

      <div className="overflow-x-auto rounded-xl border border-richblack-600">
        <table className="w-full text-sm">
          <thead className="bg-richblack-700 text-richblack-300 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-left">Instructor</th>
              <th className="px-4 py-3 text-left">Students</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-richblack-700">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-richblack-400">Loading...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-richblack-400">No courses found.</td></tr>
            ) : courses.map((c) => (
              <tr key={c._id} className="hover:bg-richblack-700/40 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={c.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <span className="text-richblack-5 font-medium text-xs line-clamp-2">{c.courseName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-richblack-300 text-xs">
                  {c.instructor?.firstName} {c.instructor?.lastName}
                </td>
                <td className="px-4 py-3 text-richblack-300">{c.studentsEnrolled?.length || 0}</td>
                <td className="px-4 py-3 text-yellow-400 font-semibold">
                  {c.price === 0 ? "Free" : `₹${c.price}`}
                </td>
                <td className="px-4 py-3">
                  {c.status === "Published" ? (
                    <span className="flex items-center gap-1 text-xs text-green-400"><MdCheckCircle /> Published</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-pink-400"><MdOutlineUnpublished /> Draft</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => deleteCourse(c._id)}
                    className="text-richblack-400 hover:text-red-400 transition">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
