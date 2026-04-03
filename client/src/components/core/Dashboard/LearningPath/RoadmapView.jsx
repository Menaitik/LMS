import CourseCard from "./CourseCard";

// Skeleton placeholder matching CourseCard shape
const SkeletonCard = () => (
  <div className="flex gap-4 rounded-xl border border-richblack-700 bg-richblack-800 p-4 shadow-md animate-pulse">
    <div className="flex-shrink-0">
      <div className="h-24 w-36 rounded-lg bg-richblack-600" />
    </div>
    <div className="flex flex-1 flex-col gap-3">
      <div className="h-4 w-2/3 rounded bg-richblack-600" />
      <div className="h-3 w-full rounded bg-richblack-700" />
      <div className="h-3 w-4/5 rounded bg-richblack-700" />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-richblack-600" />
        <div className="h-8 w-24 rounded-md bg-richblack-600" />
      </div>
    </div>
  </div>
);

const RoadmapView = ({ roadmap, loading, error, enrolledCourseIds, onEnroll, onRetry }) => {
  // Loading state — show 3 skeleton tiles
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6 text-center">
        <p className="text-sm text-pink-200">{error.message}</p>
        {error.is5xx && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-md bg-yellow-50 px-5 py-2 text-sm font-medium text-richblack-900 hover:bg-yellow-25 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Not yet generated
  if (roadmap === null) {
    return null;
  }

  // Empty roadmap
  if (roadmap.length === 0) {
    return (
      <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6 text-center">
        <p className="text-sm text-richblack-300">
          We couldn't find matching courses for your goal. Try rephrasing your goal.
        </p>
      </div>
    );
  }

  // Normalise enrolledCourseIds to a Set for O(1) lookup
  const enrolledSet =
    enrolledCourseIds instanceof Set
      ? enrolledCourseIds
      : new Set((enrolledCourseIds || []).map((id) => String(id)));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-richblack-5">
        Courses Available for Your Goal
      </h2>
      <div className="flex flex-col gap-4">
        {roadmap.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            isEnrolled={enrolledSet.has(String(course._id))}
            onEnroll={onEnroll}
          />
        ))}
      </div>
    </div>
  );
};

export default RoadmapView;
