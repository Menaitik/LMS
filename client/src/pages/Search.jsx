import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiConnector } from "../services/apiConnector";
import { courseEndpoints } from "../services/apis";
import { FiSearch, FiStar } from "react-icons/fi";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiConnector("POST", courseEndpoints.SEARCH_COURSES_API, {
          searchQuery: query,
        });
        if (res.data.success) setCourses(res.data.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, [query]);

  return (
    <div className="min-h-screen bg-richblack-900 text-white pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-richblack-400 text-sm mb-1">Search results for</p>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiSearch className="text-yellow-400" />
            "{query}"
          </h1>
          {!loading && (
            <p className="text-richblack-400 text-sm mt-1">
              {courses.length} {courses.length === 1 ? "course" : "courses"} found
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-richblack-800 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <FiSearch className="text-5xl text-richblack-600 mx-auto mb-4" />
            <p className="text-richblack-300 text-lg">No courses found for "{query}"</p>
            <p className="text-richblack-500 text-sm mt-2">Try different keywords or browse categories</p>
            <Link to="/" className="inline-block mt-5 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold px-5 py-2 rounded-lg transition text-sm">
              Browse All Courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const avgRating = course.ratingAndReviews?.length
    ? (course.ratingAndReviews.reduce((a, r) => a + (r.rating || 0), 0) / course.ratingAndReviews.length).toFixed(1)
    : null;

  return (
    <Link to={`/courses/${course._id}`}
      className="bg-richblack-800 border border-richblack-600 rounded-xl overflow-hidden hover:border-richblack-500 hover:shadow-lg transition-all group">
      <div className="relative">
        <img src={course.thumbnail} alt={course.courseName}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
          course.level === "Beginner" ? "bg-green-900/80 text-green-300" :
          course.level === "Intermediate" ? "bg-yellow-900/80 text-yellow-300" :
          "bg-red-900/80 text-red-300"
        }`}>
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-richblack-5 line-clamp-2 text-sm leading-snug">{course.courseName}</h3>
        <p className="text-xs text-richblack-400 mt-1">
          {course.instructor?.firstName} {course.instructor?.lastName}
        </p>
        <div className="flex items-center justify-between mt-3">
          {avgRating ? (
            <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
              <FiStar /> {avgRating}
              <span className="text-richblack-400 font-normal">({course.ratingAndReviews.length})</span>
            </span>
          ) : (
            <span className="text-xs text-richblack-500">No ratings yet</span>
          )}
          <span className="text-sm font-bold text-yellow-400">
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </span>
        </div>
        {course.tag?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {course.tag.slice(0, 3).map((t, i) => (
              <span key={i} className="text-[10px] bg-richblack-700 text-richblack-300 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
