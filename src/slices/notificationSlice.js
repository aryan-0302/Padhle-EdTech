import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload;
    },
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    setNotificationLoading(state, action) {
      state.loading = action.payload;
    },
    markOneReadLocal(state, action) {
      const id = action.payload;
      state.items = state.items.map((n) =>
        n._id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
      );
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markAllReadLocal(state) {
      const now = new Date().toISOString();
      state.items = state.items.map((n) => ({ ...n, readAt: n.readAt || now }));
      state.unreadCount = 0;
    },
    clearNotifications() {
      state.items = [];
      state.unreadCount = 0;
      state.loading = false;
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  setNotificationLoading,
  markOneReadLocal,
  markAllReadLocal,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;