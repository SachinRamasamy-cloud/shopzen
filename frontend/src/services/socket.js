import { io } from 'socket.io-client';
import { store } from '../app/store.js';
import { addNotification, setUnreadCount } from '../features/notifications/notificationsSlice.js';

let socket = null;

export const connectSocket = () => {
  const token = store.getState().auth.accessToken;
  if (!token || socket?.connected) return;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[socket] connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[socket] error:', err.message);
  });

  // Notifications
  socket.on('notification', (notification) => {
    store.dispatch(addNotification(notification));
  });

  socket.on('unreadCount', (count) => {
    store.dispatch(setUnreadCount(count));
  });

  socket.on('notificationsCleared', () => {
    store.dispatch(setUnreadCount(0));
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const emitMarkRead = () => {
  socket?.emit('markNotificationsRead');
};

// Subscribe to order updates (returns unsubscribe fn)
export const onOrderUpdate = (cb) => {
  socket?.on('orderUpdated', cb);
  return () => socket?.off('orderUpdated', cb);
};

// Subscribe to delivery location (returns unsubscribe fn)
export const onDeliveryLocation = (cb) => {
  socket?.on('deliveryLocation', cb);
  return () => socket?.off('deliveryLocation', cb);
};

export const emitLocationUpdate = (data) => {
  socket?.emit('locationUpdate', data);
};
