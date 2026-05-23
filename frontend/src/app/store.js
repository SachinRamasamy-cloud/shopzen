import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import cartReducer from '../features/cart/cartSlice.js';
import notificationsReducer from '../features/notifications/notificationsSlice.js';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    cart:          cartReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
