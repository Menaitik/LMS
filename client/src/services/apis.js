const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// AUTH ENDPOINTS
export const endpoints = {
  VERIFYMAIL_API: BASE_URL + "/auth/verify-email",
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
};

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getUserEnrolledCourses",
  GET_ALL_INSTRUCTOR_DASHBOARD_DETAILS_API:
    BASE_URL + "/profile/getInstructorDashboardDetails",
};

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
};

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  ADD_COURSE_TO_CATEGORY_API: BASE_URL + "/course/addCourseToCategory",
  SEARCH_COURSES_API: BASE_URL + "/course/searchCourse",
  SUGGEST_COURSES_API: BASE_URL + "/course/suggest",
  CREATE_CATEGORY_API: BASE_URL + "/course/createCategory",
};

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
};

// CATAGORIES API
export const categories = {
  CATEGORIESPAGE_API: BASE_URL + "/course/categoryPageDetails",
  CATALOGPAGEDATA_API: BASE_URL + "/course/showAllCategories",
  CREATECATEGORY_API: BASE_URL + "/course/createCategory",
};

// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/contact/contactUs",
};

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updatePicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/change-password",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
};

// AI ENDPOINTS
export const aiEndpoints = {
  GENERATE_LEARNING_PATH_API: BASE_URL + "/ai/learning-path",
  ASK_DOUBT_API: BASE_URL + "/ai/ask-doubt",
  GENERATE_SUMMARY_API: BASE_URL + "/ai/summary",
  GENERATE_QUIZ_API: BASE_URL + "/ai/generate-quiz",
};

// NOTIFICATION ENDPOINTS
export const notificationEndpoints = {
  GET_NOTIFICATIONS_API: BASE_URL + "/notification",
  MARK_READ_API: (id) => BASE_URL + `/notification/${id}/read`,
  MARK_ALL_READ_API: BASE_URL + "/notification/read-all",
  DELETE_NOTIFICATION_API: (id) => BASE_URL + `/notification/${id}`,
};

// ADMIN ENDPOINTS
export const adminEndpoints = {
  GET_ALL_USERS_API: BASE_URL + "/admin/users",
  TOGGLE_USER_STATUS_API: (id) => BASE_URL + `/admin/users/${id}/toggle-status`,
  DELETE_USER_API: (id) => BASE_URL + `/admin/users/${id}`,
  GET_PLATFORM_STATS_API: BASE_URL + "/admin/stats",
  GET_ALL_COURSES_ADMIN_API: BASE_URL + "/admin/courses",
  DELETE_COURSE_ADMIN_API: (id) => BASE_URL + `/admin/courses/${id}`,
};

// ASSIGNMENT ENDPOINTS
export const assignmentEndpoints = {
  CREATE_ASSIGNMENT_API: BASE_URL + "/assignment",
  GET_COURSE_ASSIGNMENTS_API: (courseId) => BASE_URL + `/assignment/course/${courseId}`,
  UPDATE_ASSIGNMENT_API: (id) => BASE_URL + `/assignment/${id}`,
  DELETE_ASSIGNMENT_API: (id) => BASE_URL + `/assignment/${id}`,
  SUBMIT_ASSIGNMENT_API: (id) => BASE_URL + `/assignment/${id}/submit`,
  GET_MY_SUBMISSION_API: (id) => BASE_URL + `/assignment/${id}/my-submission`,
  GET_SUBMISSIONS_API: (id) => BASE_URL + `/assignment/${id}/submissions`,
  GRADE_SUBMISSION_API: (aId, sId) => BASE_URL + `/assignment/${aId}/submissions/${sId}/grade`,
};

// PAYMENT HISTORY ENDPOINTS
export const paymentHistoryEndpoints = {
  GET_MY_PAYMENTS_API: BASE_URL + "/payment-history/my",
  GET_ALL_PAYMENTS_API: BASE_URL + "/payment-history/all",
};

// QUIZ ENDPOINTS
export const quizEndpoints = {
  CREATE_QUIZ_API: BASE_URL + "/quiz",
  GET_COURSE_QUIZZES_API: (courseId) => BASE_URL + `/quiz/course/${courseId}`,
  GET_QUIZ_API: (quizId) => BASE_URL + `/quiz/${quizId}`,
  UPDATE_QUIZ_API: (quizId) => BASE_URL + `/quiz/${quizId}`,
  DELETE_QUIZ_API: (quizId) => BASE_URL + `/quiz/${quizId}`,
  SUBMIT_QUIZ_API: (quizId) => BASE_URL + `/quiz/${quizId}/submit`,
  GET_MY_ATTEMPTS_API: (quizId) => BASE_URL + `/quiz/${quizId}/my-attempts`,
  GET_QUIZ_ATTEMPTS_API: (quizId) => BASE_URL + `/quiz/${quizId}/attempts`,
};

// DISCUSSION ENDPOINTS
export const discussionEndpoints = {
  CREATE_DISCUSSION_API: BASE_URL + "/discussion",
  GET_COURSE_DISCUSSIONS_API: (courseId) => BASE_URL + `/discussion/course/${courseId}`,
  ADD_REPLY_API: (discussionId) => BASE_URL + `/discussion/${discussionId}/reply`,
  RESOLVE_DISCUSSION_API: (discussionId) => BASE_URL + `/discussion/${discussionId}/resolve`,
  DELETE_DISCUSSION_API: (discussionId) => BASE_URL + `/discussion/${discussionId}`,
};

// CERTIFICATE ENDPOINTS
export const certificateEndpoints = {
  GET_MY_CERTIFICATES_API: BASE_URL + "/certificate/my",
  GET_CERTIFICATE_API: (courseId) => BASE_URL + `/certificate/${courseId}`,
  VERIFY_CERTIFICATE_API: (certId) => BASE_URL + `/certificate/verify/${certId}`,
};

// ANNOUNCEMENT ENDPOINTS
export const announcementEndpoints = {
  CREATE_ANNOUNCEMENT_API: BASE_URL + "/announcement",
  GET_COURSE_ANNOUNCEMENTS_API: (courseId) => BASE_URL + `/announcement/course/${courseId}`,
  DELETE_ANNOUNCEMENT_API: (id) => BASE_URL + `/announcement/${id}`,
};
