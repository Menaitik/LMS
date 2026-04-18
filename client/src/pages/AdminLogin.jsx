import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { endpoints } from "../services/apis";
import { setToken } from "../slices/authSlice";
import { setUser } from "../slices/profileSlice";
import { FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiConnector("POST", endpoints.ADMIN_LOGIN_API, { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        dispatch(setToken(token));
        dispatch(setUser({ ...user, image: user.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName}` }));
        localStorage.setItem("token", JSON.stringify(token));
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/dashboard/platform-stats");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/30 mb-4">
            <FiLock className="text-yellow-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-richblack-400 text-sm mt-1">Restricted access — authorized personnel only</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="bg-richblack-800 border border-richblack-600 rounded-2xl p-8 flex flex-col gap-5 shadow-2xl">

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-richblack-300 uppercase tracking-wider">Email</label>
            <div className="flex items-center bg-richblack-700 border border-richblack-600 rounded-lg px-3 gap-2 focus-within:border-yellow-400 transition">
              <FiMail className="text-richblack-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="bg-transparent text-sm text-richblack-5 outline-none py-3 w-full placeholder:text-richblack-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-richblack-300 uppercase tracking-wider">Password</label>
            <div className="flex items-center bg-richblack-700 border border-richblack-600 rounded-lg px-3 gap-2 focus-within:border-yellow-400 transition">
              <FiLock className="text-richblack-400 shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-transparent text-sm text-richblack-5 outline-none py-3 w-full placeholder:text-richblack-500"
              />
              <button type="button" onClick={() => setShowPass((p) => !p)}
                className="text-richblack-400 hover:text-richblack-200 transition shrink-0">
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 text-richblack-900 font-bold py-3 rounded-lg transition text-sm tracking-wide mt-1"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Panel"}
          </button>
        </form>

        <p className="text-center text-richblack-600 text-xs mt-6">
          This page is not publicly linked. Do not share this URL.
        </p>
      </div>
    </div>
  );
}
