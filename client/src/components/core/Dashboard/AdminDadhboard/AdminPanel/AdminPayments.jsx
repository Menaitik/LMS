import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../../../services/apiConnector";
import { paymentHistoryEndpoints } from "../../../../../services/apis";

const statusColor = {
  success: "bg-green-900/40 text-green-400",
  pending: "bg-yellow-900/40 text-yellow-400",
  failed: "bg-red-900/40 text-red-400",
};

export default function AdminPayments() {
  const { token } = useSelector((s) => s.auth);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", paymentHistoryEndpoints.GET_ALL_PAYMENTS_API,
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) { setRecords(res.data.data); setTotal(res.data.total); }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  const totalRevenue = records.filter((r) => r.status === "success").reduce((a, r) => a + r.amount, 0);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">Payments</h1>
      <div className="flex gap-4 mb-6">
        <div className="bg-richblack-800 border border-richblack-600 rounded-xl px-5 py-4">
          <p className="text-xs text-richblack-400">Total Transactions</p>
          <p className="text-2xl font-bold text-yellow-400">{total}</p>
        </div>
        <div className="bg-richblack-800 border border-richblack-600 rounded-xl px-5 py-4">
          <p className="text-xs text-richblack-400">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-richblack-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-richblack-600">
          <table className="w-full text-sm">
            <thead className="bg-richblack-700 text-richblack-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Courses</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-richblack-700/40 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={r.student?.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-richblack-5 text-xs font-medium">{r.student?.firstName} {r.student?.lastName}</p>
                        <p className="text-richblack-400 text-xs">{r.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-richblack-300 text-xs">
                    {r.courses?.map((c) => c.courseName).join(", ")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-yellow-400">₹{r.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-richblack-400 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
