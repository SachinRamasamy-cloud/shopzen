import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch { return []; }
};

const saveCart = (items) => localStorage.setItem('cart', JSON.stringify(items));

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addToCart(state, { payload }) {
      const { product, quantity = 1, variant } = payload;
      const key = variant ? `${product._id}-${JSON.stringify(variant)}` : product._id;
      const idx = state.items.findIndex(i =>
        (variant ? `${i.product._id}-${JSON.stringify(i.variant)}` : i.product._id) === key
      );
      if (idx >= 0) {
        state.items[idx].quantity = Math.min(state.items[idx].quantity + quantity, 10);
      } else {
        state.items.push({ product, quantity, variant, _key: key });
      }
      saveCart(state.items);
    },
    removeFromCart(state, { payload }) {
      state.items = state.items.filter(i => i._key !== payload);
      saveCart(state.items);
    },
    updateQuantity(state, { payload: { key, quantity } }) {
      const item = state.items.find(i => i._key === key);
      if (item) {
        if (quantity <= 0) state.items = state.items.filter(i => i._key !== key);
        else item.quantity = Math.min(quantity, 10);
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart([]);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export const selectCart = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotal = (s) =>
  s.cart.items.reduce((t, i) => t + i.product.price * i.quantity, 0);

export default cartSlice.reducer;
