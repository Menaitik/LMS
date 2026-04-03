import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../../services/apiConnector";
import { adminEndpoints } from "../../../../../services/apis";
import { toast } from "react-hot-toast";
import { FiSearch, FiTrash2, FiToggleLeft, FiToggleRight } from "react-icons/fi";

export default function UserManagement() {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append("search", search);
      if (accountType) params.append("accountType", accountType);

      const res = await apiConnector(
        "GET", `${adminEndpoints.GET_ALL_USERS_API}?${params}`,
        null, { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        setUsers(res.data.data);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch { toast.error("Failed to load users."); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, accountType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleStatus = async (userId) => {
    try {
      const res = await apiConnector(
        "PATCH", adminEndpoints.TOGGLE_USER_STATUS_API(userId),
        {}, { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers((p) => p.map((u) => u._id === userId ? { ...u, active: res.data.data.active } : u));
      }
    } catch { toast.error("Failed."); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      const res = await apiConnector(
        "DELETE", adminEndpoints.DELETE_USER_API(userId),
        null, { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        toast.success("User deleted.");
        setUsers((p) => p.filter((u) => u._id !== userId));
        setTotal((t) => t - 1);
      }
    } catch { toast.error("Failed."); }
  };

  const roleColor = { Student: "text-blue-400", Instructor: "text-yellow-400", Admin: "text-red-400" };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="flex flex-1 items-center bg-richblack-700 border border-richblack-600 rounded-lg px-3 gap-2 focus-within:border-yellow-400 transition">
            <FiSearch className="text-richblack-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="bg-transparent text-sm text-richblack-5 outline-none py-2 w-full placeholder:text-richblack-400"
            />
          </div>
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 rounded-lg transition">
            Search
          </button>
        </form>

        <select
          value={accountType}
          onChange={(e) => { setAccountType(e.target.value); setPage(1); }}
          className="bg-richblack-700 border border-richblack-600 text-sm text-richblack-100 rounded-lg px-3 py-2 outline-none focus:border-yellow-400"
        >
          <option value="">All Roles</option>
          <option value="Student">Students</option>
          <option value="Instructor">Instructors</option>
          <option value="Admin">Admins</option>
        </select>
      </div>

      <p className="text-richblack-400 text-sm mb-3">{total} users found</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-richblack-600">
        <table className="w-full text-sm">
          <thead className="bg-richblack-700 text-richblack-300 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-richblack-700">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-richblack-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-richblack-400">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-richblack-700/40 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <span className="font-medium text-richblack-5">{u.firstName} {u.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-richblack-300">{u.email}</td>
                <td className={`px-4 py-3 font-semibold ${roleColor[u.accountType] || ""}`}>{u.accountType}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.active ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                    {u.active ? "Active" : "Banned"}
                  </span>
                </td>
                <td className="px-4 py-3 text-richblack-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => toggleStatus(u._id)}
                      title={u.active ? "Ban user" : "Activate user"}
                      className={`text-lg transition ${u.active ? "text-green-400 hover:text-red-400" : "text-red-400 hover:text-green-400"}`}
                    >
                      {u.active ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
                      title="Delete user"
                      className="text-richblack-400 hover:text-red-400 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-richblack-600 rounded-lg disabled:opacity-40 hover:bg-richblack-700 transition"
          >
            Prev
          </button>
          <span className="text-sm text-richblack-300">Page {page} of {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 text-sm border border-richblack-600 rounded-lg disabled:opacity-40 hover:bg-richblack-700 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
