import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI";
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../slices/viewCourseSlice";
import VideoDetailSidebar from "../components/core/ViewCourse/VideoDetailSidebar";
import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const SIDEBAR_W = 300;

const ViewCourse = () => {
  const [reviewModal, setReviewModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { courseId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCourseData = async () => {
      const courseData = await getFullDetailsOfCourse(courseId, token);
      dispatch(setCourseSectionData(courseData?.courseDetails?.courseContent));
      dispatch(setEntireCourseData(courseData.courseDetails));
      dispatch(setCompletedLectures(courseData.completedVideos));
      let lectures = 0;
      courseData?.courseDetails?.courseContent?.forEach((sec) => {
        lectures += sec.subSection.length;
      });
      dispatch(setTotalNoOfLectures(lectures));
    };
    fetchCourseData();
  }, [courseId, token, dispatch]);

  return (
    <>
      <div className="flex w-full bg-richblack-900 min-h-screen">

        {/* ── Desktop Sidebar ── */}
        <div
          className="hidden md:block fixed top-[3.5rem] bottom-0 bg-richblack-900 border-r border-richblack-700 overflow-hidden transition-all duration-300 ease-in-out z-30"
          style={{ width: sidebarOpen ? SIDEBAR_W : 0, minWidth: 0 }}
        >
          <div
            className="h-full overflow-y-auto"
            style={{
              width: SIDEBAR_W,
              opacity: sidebarOpen ? 1 : 0,
              pointerEvents: sidebarOpen ? "auto" : "none",
              visibility: sidebarOpen ? "visible" : "hidden",
              transition: "opacity 0.2s",
            }}
          >
            <VideoDetailSidebar setReviewModal={setReviewModal} />
          </div>
        </div>

        {/* ── Toggle button (desktop) ── */}
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="hidden md:flex fixed z-40 items-center justify-center w-6 h-12 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 rounded-r-lg transition-all duration-300 ease-in-out"
          style={{ top: "50%", transform: "translateY(-50%)", left: sidebarOpen ? SIDEBAR_W : 0 }}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <FiChevronLeft className="text-richblack-200 text-sm" />
          ) : (
            <FiChevronRight className="text-richblack-200 text-sm" />
          )}
        </button>

        {/* ── Main Content ── */}
        <div
          className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
          style={{ marginLeft: sidebarOpen ? SIDEBAR_W : 0 }}
        >
          <div className="mt-[3.5rem] md:mt-0">
            <Outlet />
          </div>

          {/* Mobile sidebar — always visible below video */}
          <div className="block md:hidden mt-0">
            <VideoDetailSidebar setReviewModal={setReviewModal} />
          </div>
        </div>
      </div>

      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </>
  );
};

export default ViewCourse;
