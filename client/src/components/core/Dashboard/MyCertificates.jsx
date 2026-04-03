import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { certificateEndpoints } from "../../../services/apis";
import { Link } from "react-router-dom";
import { FiAward, FiExternalLink } from "react-icons/fi";

export default function MyCertificates() {
  const { token } = useSelector((s) => s.auth);
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", certificateEndpoints.GET_MY_CERTIFICATES_API,
          null, { Authorization: `Bearer ${token}` });
        if (res.data.success) setCerts(res.data.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-6 text-richblack-300">Loading...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiAward className="text-yellow-400" /> My Certificates
      </h1>

      {certs.length === 0 ? (
        <div className="text-center py-16 text-richblack-400">
          <FiAward className="text-5xl mx-auto mb-3 text-richblack-600" />
          <p className="text-lg">No certificates yet.</p>
          <p className="text-sm mt-1">Complete a course to earn your first certificate.</p>
          <Link to="/dashboard/enrolled-courses"
            className="inline-block mt-4 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-5 py-2 rounded-lg transition text-sm">
            View Enrolled Courses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert) => (
            <div key={cert._id}
              className="bg-gradient-to-br from-richblack-800 to-richblack-700 border border-yellow-400/30 rounded-2xl p-5 flex flex-col gap-3 hover:border-yellow-400/60 transition">
              {cert.course?.thumbnail && (
                <img src={cert.course.thumbnail} alt="" className="w-full h-32 object-cover rounded-lg" />
              )}
              <div>
                <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">Certificate of Completion</p>
                <h3 className="text-base font-bold text-white mt-1">{cert.course?.courseName}</h3>
                <p className="text-xs text-richblack-400 mt-1">
                  Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex gap-2 mt-auto">
                <Link to={`/dashboard/certificate/${cert.course?._id}`}
                  className="flex-1 text-center text-sm bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold py-2 rounded-lg transition">
                  View
                </Link>
                <a href={`/verify-certificate/${cert.certificateId}`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-1 text-sm border border-richblack-500 text-richblack-300 hover:text-white px-3 py-2 rounded-lg transition">
                  <FiExternalLink />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
