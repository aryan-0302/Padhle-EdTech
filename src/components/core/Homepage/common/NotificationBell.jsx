import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";
import {
  loadNotifications,
  loadUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  requestCartReminder,
} from "../../../../services/operations/notificationAPI.js";
import { ACCOUNT_TYPE } from "../../../../../utils/constant.js";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString();
}

export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.profile.user);
  const { items, unreadCount, loading } = useSelector((s) => s.notifications);
  const { totalItems, cart } = useSelector((s) => s.cart);

  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cartReminderSent = useRef(false);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!token) return;
    dispatch(loadUnreadCount());
  }, [token, dispatch]);

  useEffect(() => {
    if (
      token &&
      user?.accountType === ACCOUNT_TYPE.STUDENT &&
      totalItems > 0 &&
      cart?.length &&
      !cartReminderSent.current
    ) {
      cartReminderSent.current = true;
      dispatch(requestCartReminder(cart.map((c) => c._id)));
    }
  }, [token, user?.accountType, totalItems, cart, dispatch]);

  const openPanel = () => {
    setOpen((o) => !o);
    if (!open && token) {
      dispatch(loadNotifications());
      dispatch(loadUnreadCount());
    }
  };

  const onItemClick = (n) => {
    dispatch(markNotificationRead(n._id));
    const cid = n.metadata?.courseId;
    if (n.type === "CART_REMINDER") {
        navigate("/dashboard/cart");
      } else if (n.type === "NEW_COURSE_REVIEW" && cid) {
        navigate(`/courses/${cid}`);
      } else if (n.type === "NEW_STUDENT_ENROLLMENT" && cid) {
        navigate(`/dashboard/edit-course/${cid}`);
      } else if (cid) {
        navigate(`/courses/${cid}`);
      }
    setOpen(false);
  };

  if (!token) return null;

  const badge = unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={openPanel}
        className="relative rounded-full bg-richblack-800 p-2 text-richblack-5 hover:bg-richblack-700"
        aria-label="Notifications"
      >
        <IoNotificationsOutline className="h-5 w-5" />
        {badge != null && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-yellow-50 px-1 text-[10px] font-bold text-richblack-900">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[2000] mt-2 w-[min(100vw-2rem,22rem)] rounded-lg border border-richblack-700 bg-richblack-800 shadow-lg">
          <div className="flex items-center justify-between border-b border-richblack-700 px-3 py-2">
            <p className="text-sm font-semibold text-richblack-5">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(markAllNotificationsRead())}
                className="text-xs text-yellow-50 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-richblack-100">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-richblack-100">
                No notifications yet
              </p>
            ) : (
                items.map((n) => {
                    const unread = !n.readAt;
                    return (
                      <button
                        key={n._id}
                        type="button"
                        onClick={() => onItemClick(n)}
                        className={`w-full border-b border-richblack-700 py-2.5 pl-2 pr-3 text-left last:border-0 transition-colors ${
                          unread
                            ? "border-l-4 border-l-yellow-50 bg-yellow-50/[0.08] hover:bg-yellow-50/[0.12]"
                            : "border-l-4 border-l-transparent pl-[14px] hover:bg-richblack-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 pl-1">
                          <p className="text-sm font-medium text-richblack-5">{n.title}</p>
                          {unread && (
                            <span className="shrink-0 rounded-full bg-yellow-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-richblack-900">
                              New
                            </span>
                          )}
                        </div>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 pl-1 text-xs text-richblack-100">{n.body}</p>
                        )}
                        <p className="mt-1 pl-1 text-[10px] text-richblack-300">
                          {formatTime(n.createdAt)}
                        </p>
                      </button>
                    );
                  })
            )}
          </div>
        </div>
      )}
    </div>
  );
}