import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../../services/apiConnector";
import { adminEndpoints } from "../../../../../services/apis";
import { FiUsers, FiBookOpen, FiUserCheck, FiTrendingUp } from "react-icons/fi";

export default function PlatformStats() {
  const { token } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", adminEndpoints.GET_PLATFORM_STATS_API,
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) setStats(res.data.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const cards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: <FiUsers />, color: "text-blue-400" },
    { label: "Students", value: stats.totalStudents, icon: <FiUserCheck />, color: "text-green-400" },
    { label: "Instructors", value: stats.totalInstructors, icon: <FiTrendingUp />, color: "text-yellow-400" },
    { label: "Total Courses", value: stats.totalCourses, icon: <FiBookOpen />, color: "text-purple-400" },
    { label: "Published Courses", value: stats.publishedCourses, icon: <FiBookOpen />, color: "text-emerald-400" },
  ] : [];

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>

      {loading ? (
        <p className="text-richblack-400">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-richblack-800 border border-richblack-600 rounded-2xl p-5 flex flex-col gap-2 hover:border-richblack-500 transition">
              <span className={`text-2xl ${c.color}`}>{c.icon}</span>
              <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-richblack-400">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
