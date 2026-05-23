import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0 },
  reducers: {
    addNotification(state, { payload }) {
      state.items.unshift(payload);
      state.unread += 1;
    },
    setNotifications(state, { payload }) {
      state.items  = payload.items;
      state.unread = payload.unread;
    },
    setUnreadCount(state, { payload }) {
      state.unread = payload;
    },
    clearUnread(state) {
      state.unread = 0;
      state.items  = state.items.map(n => ({ ...n, isRead: true }));
    },
  },
});

export const { addNotification, setNotifications, setUnreadCount, clearUnread } = notificationsSlice.actions;
export const selectNotifications = (s) => s.notifications.items;
export const selectUnread        = (s) => s.notifications.unread;

export default notificationsSlice.reducer;
