import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { certificateEndpoints } from "../services/apis";

export default function Certificate() {
  const { courseId } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", certificateEndpoints.GET_CERTIFICATE_API(courseId),
          null, { Authorization: `Bearer ${token}` }
        );
        if (res.data.success) setCert(res.data.data);
        else setError(res.data.message);
      } catch (e) {
        setError(e?.response?.data?.message || "Could not load certificate.");
      }
      setLoading(false);
    };
    fetch();
  }, [courseId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4 px-4">
      <p className="text-pink-400 text-lg text-center">{error}</p>
      <p className="text-richblack-300 text-sm text-center">Complete all lectures to earn your certificate.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-richblack-800 to-richblack-700 border-2 border-yellow-400 rounded-2xl p-10 max-w-2xl w-full text-center shadow-2xl">
        <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-2">Certificate of Completion</p>
        <h1 className="text-3xl font-bold text-white mt-4">
          {cert.student?.firstName} {cert.student?.lastName}
        </h1>
        <p className="text-richblack-200 mt-3 text-base">has successfully completed</p>
        <h2 className="text-2xl font-semibold text-yellow-300 mt-3">{cert.course?.courseName}</h2>
        <p className="text-richblack-300 text-sm mt-6">
          Issued on {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <p className="text-richblack-500 text-xs mt-2 break-all">Certificate ID: {cert.certificateId}</p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-6 py-2 rounded-lg transition"
          >
            Print / Save PDF
          </button>
          <a
            href={`/verify-certificate/${cert.certificateId}`}
            target="_blank"
            rel="noreferrer"
            className="border border-richblack-500 text-richblack-100 hover:text-white px-6 py-2 rounded-lg transition text-sm"
          >
            Verify
          </a>
        </div>
      </div>
    </div>
  );
}
