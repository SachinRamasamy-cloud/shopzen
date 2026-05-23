// orderSocket.js
export const registerOrderSockets = (io, socket) => {
  const { id: userId, role } = socket.user;

  // Delivery partner joins vendor rooms for their assigned vendors
  if (role === 'vendor') {
    socket.on('joinVendorRoom', ({ vendorId }) => {
      socket.join(`vendor:${vendorId}`);
    });
  }

  // Delivery partner location broadcast
  if (role === 'delivery') {
    socket.on('locationUpdate', ({ lat, lng, orderId, userId: targetUserId }) => {
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit('deliveryLocation', { lat, lng, orderId });
      }
    });
  }
};
