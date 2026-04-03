import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import GoalForm from "../components/core/Dashboard/LearningPath/GoalForm";
import RoadmapView from "../components/core/Dashboard/LearningPath/RoadmapView";
import { generateLearningPath } from "../services/operations/aiAPI";
import { buyCourse } from "../services/operations/studentFeaturesApi";

const LearningPath = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [explanationOpen, setExplanationOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(
    () => user?.courses || []
  );

  const handleSubmit = async (submittedGoal) => {
    setGoal(submittedGoal);
    setLoading(true);
    setError(null);

    try {
      const result = await generateLearningPath(submittedGoal, token);
      setRoadmap(result.roadmap);
      setExplanation(result.explanation || "");
      setExplanationOpen(true);
    } catch (err) {
      const status = err?.response?.status;
      setError({
        message: err.message || "Something went wrong. Please try again.",
        is5xx: status >= 500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (goal) {
      handleSubmit(goal);
    }
  };

  const handleEnroll = (course) => {
    buyCourse(token, [course._id], user, navigate, dispatch).then(() => {
      setEnrolledCourseIds((prev) => [...prev, course._id]);
    });
  };

  return (
    <div className="mx-auto w-11/12 max-w-3xl py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-richblack-5">
          AI Learning Path Generator
        </h1>
        <p className="mt-2 text-sm text-richblack-300">
          Describe your learning goal and get a personalized course roadmap.
        </p>
      </div>

      <GoalForm onSubmit={handleSubmit} loading={loading} />

      {explanation && (
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden">
          <button
            onClick={() => setExplanationOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3 text-left text-sm font-medium text-richblack-5 hover:bg-richblack-700 transition-colors"
          >
            <span>Your Learning Roadmap</span>
            <span className="text-richblack-400 text-lg">{explanationOpen ? "▲" : "▼"}</span>
          </button>
          {explanationOpen && (
            <div className="px-5 py-4 text-sm text-richblack-200 border-t border-richblack-700 leading-relaxed whitespace-pre-wrap">
              {explanation}
            </div>
          )}
        </div>
      )}

      <RoadmapView
        roadmap={roadmap}
        loading={loading}
        error={error}
        enrolledCourseIds={enrolledCourseIds}
        onEnroll={handleEnroll}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default LearningPath;
