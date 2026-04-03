import React from "react";
import { Link } from "react-router-dom";

const LEVEL_BADGE = {
  Beginner: "bg-green-700 text-green-100",
  Intermediate: "bg-yellow-700 text-yellow-100",
  Advanced: "bg-red-700 text-red-100",
};

const CourseCard = ({ course, isEnrolled, onEnroll }) => {
  const levelClass = LEVEL_BADGE[course?.level] || "bg-richblack-600 text-richblack-100";
  const description = course?.courseDescription
    ? course.courseDescription.slice(0, 120) +
      (course.courseDescription.length > 120 ? "..." : "")
    : "";

  return (
    <div className="flex gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-4 shadow-md">
      <div className="flex-shrink-0">
        <img
          src={course?.thumbnail}
          alt={course?.courseName}
          className="h-24 w-36 rounded-lg object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-richblack-5">
            {course?.courseName}
          </h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelClass}`}>
            {course?.level}
          </span>
        </div>

        <p className="text-sm text-richblack-300">{description}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-bold text-yellow-50">
            {course?.price === 0 ? "Free" : `₹${course?.price}`}
          </span>

          {isEnrolled ? (
            <Link
              to={`/view-course/${course?._id}`}
              className="rounded-md bg-richblack-700 px-4 py-1.5 text-sm font-medium text-richblack-5 hover:bg-richblack-600 transition-colors"
            >
              Go to Course
            </Link>
          ) : (
            <button
              onClick={() => onEnroll(course)}
              className="rounded-md bg-yellow-50 px-4 py-1.5 text-sm font-medium text-richblack-900 hover:bg-yellow-25 transition-colors"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
