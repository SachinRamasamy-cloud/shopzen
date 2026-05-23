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
    <div className="py-4 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Shopping Cart</h1>
      <Empty icon="🛒" title="Your cart is currently empty" description="Look around for products and add them to your cart to checkout."
        action={<Link to="/products" className="btn-primary btn">Start Shopping</Link>}
      />
    </div>
  );

  return (
    <div className="py-4 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">
            Shopping Cart
          </h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">{items.length} unique items selected</p>
        </div>
        <button onClick={() => dispatch(clearCart())} className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
          Clear Cart
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map(item => {
            const p = item.product;
            const img = p.images?.[0]?.url || p.images?.[0] || null;
            return (
              <div key={item._key} className="flex gap-5 p-5 bg-surface/20 backdrop-blur-md border border-border/80 rounded-2xl hover:border-primary/45 transition-all shadow-glass">
                {/* Image */}
                <div className="w-20 h-20 flex-shrink-0 bg-tag/30 rounded-xl overflow-hidden border border-border/80 flex items-center justify-center p-1">
                  {img ? <img src={img} alt={p.title} className="w-full h-full object-contain rounded-lg hover:scale-[1.03] transition-transform" /> :
                    <div className="w-full h-full flex items-center justify-center text-muted/50 text-xl">□</div>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Link to={`/product/${p._id}`} className="font-heading font-bold text-sm text-ink hover:text-primary transition-colors line-clamp-1">
                    {p.title}
                  </Link>
                  {item.variant && (
                    <span className="inline-block font-mono text-[9px] uppercase tracking-wider bg-primary/10 border border-primary/20 text-indigo-300 px-2 py-0.5 rounded-md">
                      {item.variant.name}: {item.variant.value}
                    </span>
                  )}
                  <p className="font-heading font-extrabold text-sm text-indigo-400">{formatCurrency(p.price)}</p>
                </div>

                {/* Qty & Remove */}
                <div className="flex flex-col items-end justify-between py-0.5">
                  <button onClick={() => dispatch(removeFromCart(item._key))}
                    className="text-xs text-muted/70 hover:text-rose-400 transition-colors w-6 h-6 flex items-center justify-center rounded-lg hover:bg-rose-500/10">✕</button>
                  <div className="flex items-center gap-1 bg-surface/30 border border-border/80 rounded-xl p-0.5">
                    <button onClick={() => dispatch(updateQuantity({ key: item._key, quantity: item.quantity - 1 }))}
                      className="w-7 h-7 rounded-lg text-xs flex items-center justify-center hover:bg-tag text-subtle hover:text-ink transition-colors">−</button>
                    <span className="w-8 text-center font-mono font-bold text-xs text-ink">{item.quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ key: item._key, quantity: item.quantity + 1 }))}
                      className="w-7 h-7 rounded-lg text-xs flex items-center justify-center hover:bg-tag text-subtle hover:text-ink transition-colors">+</button>
                  </div>
                  <span className="font-heading font-bold text-xs text-ink">{formatCurrency(p.price * item.quantity)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-surface/20 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-glass space-y-6 h-fit">
          <div>
            <h2 className="font-heading text-base font-bold text-ink">Order Summary</h2>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">ESTIMATED TOTAL COSTS</p>
          </div>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item._key} className="flex justify-between text-xs text-subtle">
                <span className="truncate pr-4 font-medium">{item.product.title} <span className="text-muted">×{item.quantity}</span></span>
                <span className="font-mono text-ink/90 font-medium shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/60 pt-4 space-y-2.5">
            <div className="flex justify-between font-bold text-sm text-ink">
              <span>Subtotal</span>
              <span className="font-heading text-indigo-400">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-subtle">
              <span>GST Tax (18%)</span>
              <span className="font-mono text-ink/80">{formatCurrency(total * 0.18)}</span>
            </div>
          </div>
          <Button onClick={() => navigate('/checkout')} className="w-full btn-lg">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
