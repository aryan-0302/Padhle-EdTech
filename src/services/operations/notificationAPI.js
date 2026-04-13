import { apiConnector } from "../apniconnect.js";
import { notificationEndpoints } from "../apis.js";
import {
  setNotifications,
  setUnreadCount,
  setNotificationLoading,
  markOneReadLocal,
  markAllReadLocal,
} from "../../slices/notificationSlice.js";

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

export function loadNotifications() {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) return;
    dispatch(setNotificationLoading(true));
    try {
      const res = await apiConnector(
        "GET",
        notificationEndpoints.NOTIFICATIONS_API,
        null,
        authHeader(token)
      );
      if (res.data.success) {
        dispatch(setNotifications(res.data.data || []));
      }
    } catch (e) {
      console.error("loadNotifications", e);
    } finally {
      dispatch(setNotificationLoading(false));
    }
  };
}

export function loadUnreadCount() {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) return;
    try {
      const res = await apiConnector(
        "GET",
        notificationEndpoints.NOTIFICATIONS_UNREAD_API,
        null,
        authHeader(token)
      );
      if (res.data.success) {
        dispatch(setUnreadCount(res.data.count ?? 0));
      }
    } catch (e) {
      console.error("loadUnreadCount", e);
    }
  };
}

export function markNotificationRead(notificationId) {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) return;
    try {
      await apiConnector(
        "PATCH",
        notificationEndpoints.NOTIFICATION_READ_API(notificationId),
        null,
        authHeader(token)
      );
      dispatch(markOneReadLocal(notificationId));
    } catch (e) {
      console.error("markNotificationRead", e);
    }
  };
}

export function markAllNotificationsRead() {
  return async (dispatch, getState) => {
    const token = getState().auth.token;
    if (!token) return;
    try {
      await apiConnector(
        "POST",
        notificationEndpoints.NOTIFICATIONS_READ_ALL_API,
        {},
        authHeader(token)
      );
      dispatch(markAllReadLocal());
    } catch (e) {
      console.error("markAllNotificationsRead", e);
    }
  };
}

export function requestCartReminder(courseIds) {
    return async (dispatch, getState) => {
      const token = getState().auth.token;
      if (!token || !courseIds?.length) return;
      try {
        await apiConnector(
          "POST",
          notificationEndpoints.NOTIFICATION_CART_REMINDER_API,
          { courseIds },
          authHeader(token)
        );
        await dispatch(loadUnreadCount());
      } catch (e) {
        console.error("requestCartReminder", e);
      }
    };
  }