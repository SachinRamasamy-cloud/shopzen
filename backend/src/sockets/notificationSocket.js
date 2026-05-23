import Notification from '../models/Notification.js';

export const registerNotificationSockets = (io, socket) => {
  // Mark notifications as read
  socket.on('markNotificationsRead', async () => {
    try {
      await Notification.updateMany(
        { user: socket.user.id, isRead: false },
        { $set: { isRead: true } }
      );
      socket.emit('notificationsCleared');
    } catch (err) {
      console.error('[socket] markNotificationsRead error:', err.message);
    }
  });

  // Get unread count on connect
  Notification.countDocuments({ user: socket.user.id, isRead: false })
    .then(count => socket.emit('unreadCount', count))
    .catch(() => {});
};

// Utility: emit notification to a user (used outside socket context)
export const emitNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};
