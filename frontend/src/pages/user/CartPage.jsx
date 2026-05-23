import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCart, selectCartTotal,
  removeFromCart, updateQuantity, clearCart,
} from '../../features/cart/cartSlice.js';
import { formatCurrency } from '../../utils/index.js';
import { Empty } from '../../components/ui/index.jsx';
import Button from '../../components/ui/Button.jsx';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items    = useSelector(selectCart);
  const total    = useSelector(selectCartTotal);

  if (!items.length) return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-6">Cart</h1>
      <Empty icon="⊡" title="Your cart is empty" description="Browse products and add items to your cart."
        action={<Link to="/products" className="btn-primary btn">Browse Products</Link>}
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">Cart <span className="text-subtle font-normal text-base">({items.length} items)</span></h1>
        <button onClick={() => dispatch(clearCart())} className="text-xs text-muted hover:text-ink transition-colors">
          Clear cart
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => {
            const p = item.product;
            const img = p.images?.[0]?.url || p.images?.[0] || null;
            return (
              <div key={item._key} className="flex gap-4 p-4 bg-surface border border-border rounded">
                {/* Image */}
                <div className="w-20 h-20 flex-shrink-0 bg-tag rounded overflow-hidden border border-border">
                  {img ? <img src={img} alt={p.title} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-muted">□</div>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p._id}`} className="font-medium text-sm text-ink hover:underline line-clamp-1">
                    {p.title}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-muted mt-0.5">{item.variant.name}: {item.variant.value}</p>
                  )}
                  <p className="font-mono text-sm font-semibold text-ink mt-1">{formatCurrency(p.price)}</p>
                </div>

                {/* Qty & Remove */}
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => dispatch(removeFromCart(item._key))}
                    className="text-xs text-muted hover:text-ink transition-colors">✕</button>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => dispatch(updateQuantity({ key: item._key, quantity: item.quantity - 1 }))}
                      className="w-6 h-6 border border-border rounded text-xs flex items-center justify-center hover:bg-tag">−</button>
                    <span className="w-7 text-center font-mono text-xs">{item.quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ key: item._key, quantity: item.quantity + 1 }))}
                      className="w-6 h-6 border border-border rounded text-xs flex items-center justify-center hover:bg-tag">+</button>
                  </div>
                  <span className="font-mono text-xs text-subtle">{formatCurrency(p.price * item.quantity)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-surface border border-border rounded p-5 h-fit">
          <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item._key} className="flex justify-between text-xs text-subtle">
                <span className="truncate pr-2">{item.product.title} ×{item.quantity}</span>
                <span className="font-mono">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 mb-5">
            <div className="flex justify-between font-medium text-sm">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-subtle mt-1">
              <span>Tax (18% GST)</span>
              <span className="font-mono">{formatCurrency(total * 0.18)}</span>
            </div>
          </div>
          <Button onClick={() => navigate('/checkout')} className="w-full">
            Proceed to Checkout →
          </Button>
        </div>
      </div>
    </div>
  );
}
