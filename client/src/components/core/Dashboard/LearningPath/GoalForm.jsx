import React, { useState } from "react";

const MAX_CHARS = 500;
const MIN_CHARS = 10;

const GoalForm = ({ onSubmit, loading }) => {
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (goal.length < MIN_CHARS) {
      setError("Please describe your goal in at least 10 characters.");
      return;
    }
    if (goal.length > MAX_CHARS) {
      setError("Goal description must be 500 characters or fewer.");
      return;
    }

    setError("");
    onSubmit(goal);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="learning-goal"
          className="text-sm font-medium text-richblack-5"
        >
          What do you want to learn?
        </label>

        <textarea
          id="learning-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. I want to become a MERN stack developer"
          rows={4}
          className="w-full rounded-lg bg-richblack-700 border border-richblack-600 px-4 py-3 text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
        />

        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-sm text-pink-200">{error}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-richblack-400 ml-auto">
            {goal.length} / {MAX_CHARS}
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-md bg-yellow-50 px-6 py-3 text-sm font-semibold text-richblack-900 transition-all duration-200 hover:bg-yellow-25 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-richblack-900 border-t-transparent" />
        )}
        {loading ? "Generating..." : "Generate Learning Path"}
      </button>
    </form>
  );
};

export default GoalForm;
