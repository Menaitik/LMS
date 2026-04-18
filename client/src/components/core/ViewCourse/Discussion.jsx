import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { apiConnector } from "../../../services/apiConnector";
import { discussionEndpoints } from "../../../services/apis";
import { toast } from "react-hot-toast";
import { FiSend, FiCheckCircle, FiMessageSquare, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function Discussion({ courseId, subSectionId }) {
  const { token } = useSelector((s) => s.auth);
  const { user } = useSelector((s) => s.profile);
  const [discussions, setDiscussions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [openReply, setOpenReply] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchDiscussions = async () => {
    try {
      const url = discussionEndpoints.GET_COURSE_DISCUSSIONS_API(courseId)
        + (subSectionId ? `?subSectionId=${subSectionId}` : "");
      const res = await apiConnector("GET", url, null, { Authorization: `Bearer ${token}` });
      if (res.data.success) setDiscussions(res.data.data);
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchDiscussions(); }, [courseId, subSectionId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const res = await apiConnector("POST", discussionEndpoints.CREATE_DISCUSSION_API,
        { courseId, subSectionId, title, content },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        setTitle(""); setContent("");
        fetchDiscussions();
        toast.success("Question posted!");
      }
    } catch { toast.error("Failed to post."); }
    setLoading(false);
  };

  const handleReply = async (discussionId) => {
    const text = replyContent[discussionId];
    if (!text?.trim()) return;
    try {
      const res = await apiConnector("POST", discussionEndpoints.ADD_REPLY_API(discussionId),
        { content: text },
        { Authorization: `Bearer ${token}` }
      );
      if (res.data.success) {
        setReplyContent((p) => ({ ...p, [discussionId]: "" }));
        setOpenReply(null);
        fetchDiscussions();
      }
    } catch { toast.error("Failed to reply."); }
  };

  const handleResolve = async (discussionId) => {
    try {
      await apiConnector("PATCH", discussionEndpoints.RESOLVE_DISCUSSION_API(discussionId),
        {}, { Authorization: `Bearer ${token}` }
      );
      fetchDiscussions();
    } catch { toast.error("Failed."); }
  };

  return (
    <div className="mt-4 rounded-xl border border-richblack-600 bg-richblack-800 overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-richblack-100 hover:bg-richblack-700 transition"
      >
        <span className="flex items-center gap-2">
          <FiMessageSquare className="text-yellow-400" />
          Q&amp;A / Discussion
          {discussions.length > 0 && (
            <span className="text-xs text-richblack-400">({discussions.length})</span>
          )}
        </span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-richblack-700">
          {/* Post form */}
          <form onSubmit={handlePost} className="mt-4 bg-richblack-700 rounded-xl p-4 flex flex-col gap-3 border border-richblack-600">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your question title..."
              className="bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question..."
              rows={3}
              className="bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-2 outline-none border border-richblack-600 focus:border-yellow-400 resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="self-end flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-richblack-900 font-semibold text-sm px-4 py-2 rounded-md transition"
            >
              <FiSend /> {loading ? "Posting..." : "Post Question"}
            </button>
          </form>

          {/* Discussion list */}
          {discussions.length === 0 ? (
            <p className="text-richblack-400 text-sm">No questions yet. Be the first to ask!</p>
          ) : (
            discussions.map((d) => (
              <div key={d._id} className={`bg-richblack-700 rounded-xl p-4 border ${d.isResolved ? "border-green-600/40" : "border-richblack-600"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img src={d.author?.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-xs text-richblack-300">
                      {d.author?.firstName} {d.author?.lastName}
                      {d.author?.accountType === "Instructor" && (
                        <span className="ml-1 text-yellow-400 font-semibold">· Instructor</span>
                      )}
                    </span>
                  </div>
                  {d.isResolved && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <FiCheckCircle /> Resolved
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-semibold text-richblack-5">{d.title}</p>
                <p className="mt-1 text-sm text-richblack-200">{d.content}</p>

                {d.replies.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 pl-4 border-l border-richblack-600">
                    {d.replies.map((r) => (
                      <div key={r._id} className="flex gap-2">
                        <img src={r.author?.image} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-richblack-300">
                            {r.author?.firstName}
                            {r.isInstructor && <span className="ml-1 text-yellow-400 font-semibold">· Instructor</span>}
                          </span>
                          <p className="text-sm text-richblack-100">{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => setOpenReply(openReply === d._id ? null : d._id)}
                    className="text-xs text-yellow-400 hover:underline"
                  >
                    Reply
                  </button>
                  {!d.isResolved && (d.author?._id === user?._id || user?.accountType === "Instructor") && (
                    <button onClick={() => handleResolve(d._id)} className="text-xs text-green-400 hover:underline">
                      Mark Resolved
                    </button>
                  )}
                </div>

                {openReply === d._id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={replyContent[d._id] || ""}
                      onChange={(e) => setReplyContent((p) => ({ ...p, [d._id]: e.target.value }))}
                      placeholder="Write a reply..."
                      className="flex-1 bg-richblack-800 text-richblack-5 text-sm rounded-md px-3 py-1.5 outline-none border border-richblack-600 focus:border-yellow-400"
                    />
                    <button
                      onClick={() => handleReply(d._id)}
                      className="bg-yellow-400 hover:bg-yellow-300 text-richblack-900 text-sm font-semibold px-3 py-1.5 rounded-md transition"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
