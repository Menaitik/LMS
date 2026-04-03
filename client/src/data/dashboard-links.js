
import { ACCOUNT_TYPE } from "../utils/constants";
export const sidebarLinks = [
  // ── Student links (order: Enrolled Courses → Learning Path → Cart → My Certificates → My Profile) ──
  {
    id: 5,
    name: "Enrolled Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },
  {
    id: 9,
    name: "Learning Path",
    path: "/dashboard/learning-path",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscCompass",
  },
  {
    id: 6,
    name: "Cart",
    path: "/dashboard/cart",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscBookmark",
  },
  {
    id: 11,
    name: "My Certificates",
    path: "/dashboard/my-certificates",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscVerified",
  },
  {
    id: 13,
    name: "Payment History",
    path: "/dashboard/payment-history",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscCreditCard",
  },

  // ── Instructor links (order: Dashboard → My Courses → Add Course) ──
  {
    id: 2,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 3,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 4,
    name: "Add Course",
    path: "/dashboard/add-course",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },

  // ── Shared ──
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },

  // ── Admin links ──
  {
    id: 7,
    name: "Admin Panel",
    path: "/dashboard/admin-panel",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscHistory",
  },
  {
    id: 8,
    name: "Add Category",
    path: "/dashboard/create-category",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscAdd",
  },
  {
    id: 10,
    name: "User Management",
    path: "/dashboard/user-management",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscPerson",
  },
  {
    id: 12,
    name: "Platform Stats",
    path: "/dashboard/platform-stats",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscGraph",
  },
  {
    id: 14,
    name: "All Courses",
    path: "/dashboard/admin-courses",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscBook",
  },
  {
    id: 15,
    name: "Payments",
    path: "/dashboard/admin-payments",
    type: ACCOUNT_TYPE.ADMIN,
    icon: "VscCreditCard",
  },
];

