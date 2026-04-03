import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../services/apiConnector";
import { notificationEndpoints } from "../../services/apis";
import { FiBell, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { token } = useSelector((s) => s.auth);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await apiConnector("GET", notificationEndpoints.GET_NOTIFICATIONS_API,
        null, { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnread(res.data.unreadCount);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // poll every 60s
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await apiConnector("PATCH", notificationEndpoints.MARK_ALL_READ_API,
        {}, { Authorization: `Bearer ${token}` }
      );
      setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await apiConnector("PATCH", notificationEndpoints.MARK_READ_API(n._id),
        {}, { Authorization: `Bearer ${token}` }
      );
      setNotifications((p) => p.map((x) => x._id === n._id ? { ...x, isRead: true } : x));
      setUnread((c) => Math.max(0, c - 1));
    }
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  if (!token) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-1 text-richblack-100 hover:text-white transition"
        aria-label="Notifications"
      >
        <FiBell className="text-[20px]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-richblack-800 border border-richblack-600 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-richblack-600">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-yellow-400 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-richblack-400 text-sm py-6">No notifications</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 border-b border-richblack-700 hover:bg-richblack-700 transition ${!n.isRead ? "bg-richblack-700/50" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-yellow-400 shrink-0" />}
                    <div className={!n.isRead ? "" : "pl-4"}>
                      <p className="text-sm font-medium text-richblack-5 line-clamp-1">{n.title}</p>
                      <p className="text-xs text-richblack-300 line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-xs text-richblack-500 mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
