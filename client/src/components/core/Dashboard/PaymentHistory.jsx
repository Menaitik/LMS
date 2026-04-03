import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { paymentHistoryEndpoints } from "../../../services/apis";
import { FiCreditCard } from "react-icons/fi";

const statusColor = {
  success: "bg-green-900/40 text-green-400",
  pending: "bg-yellow-900/40 text-yellow-400",
  failed: "bg-red-900/40 text-red-400",
};

export default function PaymentHistory() {
  const { token } = useSelector((s) => s.auth);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", paymentHistoryEndpoints.GET_MY_PAYMENTS_API,
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) setRecords(res.data.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-6 text-richblack-300">Loading...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiCreditCard className="text-yellow-400" /> Payment History
      </h1>

      {records.length === 0 ? (
        <div className="text-center py-16 text-richblack-400">
          <FiCreditCard className="text-5xl mx-auto mb-3 text-richblack-600" />
          <p>No payment records yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-richblack-600">
          <table className="w-full text-sm">
            <thead className="bg-richblack-700 text-richblack-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Courses</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-richblack-700">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-richblack-700/40 transition">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {r.courses?.map((c) => (
                        <div key={c._id} className="flex items-center gap-2">
                          {c.thumbnail && <img src={c.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />}
                          <span className="text-richblack-5 text-xs">{c.courseName}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-yellow-400">₹{r.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-richblack-400 text-xs font-mono">{r.orderId?.slice(0, 16)}...</td>
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
