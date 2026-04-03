import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { certificateEndpoints } from "../services/apis";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiConnector("GET", certificateEndpoints.VERIFY_CERTIFICATE_API(certificateId));
        if (res.data.success) setCert(res.data.data);
        else setError("Certificate not found.");
      } catch {
        setError("Certificate not found or invalid.");
      }
    };
    fetch();
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-richblack-900 flex items-center justify-center p-6">
      {error ? (
        <div className="text-center">
          <p className="text-pink-400 text-xl font-semibold">Invalid Certificate</p>
          <p className="text-richblack-300 mt-2">{error}</p>
        </div>
      ) : cert ? (
        <div className="bg-richblack-800 border border-green-500 rounded-2xl p-8 max-w-lg w-full text-center">
          <div className="text-green-400 text-4xl mb-4">✓</div>
          <p className="text-green-400 font-semibold text-lg">Valid Certificate</p>
          <h2 className="text-white text-xl font-bold mt-3">
            {cert.student?.firstName} {cert.student?.lastName}
          </h2>
          <p className="text-richblack-200 mt-2">completed</p>
          <p className="text-yellow-300 font-semibold mt-1">{cert.course?.courseName}</p>
          <p className="text-richblack-400 text-sm mt-4">
            Issued: {new Date(cert.issuedAt).toLocaleDateString()}
          </p>
          <p className="text-richblack-500 text-xs mt-1 break-all">ID: {cert.certificateId}</p>
        </div>
      ) : (
        <p className="text-white">Verifying...</p>
      )}
    </div>
  );
}
