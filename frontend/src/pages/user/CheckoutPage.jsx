import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCart, selectCartTotal, clearCart } from '../../features/cart/cartSlice.js';
import { orderApi } from '../../api/orderApi.js';
import { formatCurrency, getErrMsg } from '../../utils/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const items   = useSelector(selectCart);
  const total   = useSelector(selectCartTotal);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon]   = useState('');
  const [address, setAddress] = useState({
    name: '', line1: '', line2: '', city: '', state: '', country: 'India', pincode: '', phone: '',
  });

  const updateAddr = (k, v) => setAddress(p => ({ ...p, [k]: v }));

  const handleCheckout = async () => {
    if (!address.name || !address.line1 || !address.city || !address.pincode) {
      toast.error('Please fill in required address fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: items.map(i => ({
          product: i.product._id,
          quantity: i.quantity,
          variant: i.variant,
        })),
        shippingAddress: address,
        couponCode: coupon || undefined,
      };
      const { data } = await orderApi.createCheckout(payload);
      window.location.href = data.data.url; // Redirect to Stripe
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) return <div className="text-center py-16 text-subtle">Your cart is empty.</div>;

  const tax = total * 0.18;

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Address */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded p-5">
            <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-4">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name *" placeholder="John Doe" value={address.name} onChange={e => updateAddr('name', e.target.value)} className="col-span-2" />
              <Input label="Address Line 1 *" placeholder="Street address" value={address.line1} onChange={e => updateAddr('line1', e.target.value)} className="col-span-2" />
              <Input label="Address Line 2" placeholder="Apartment, suite, etc." value={address.line2} onChange={e => updateAddr('line2', e.target.value)} className="col-span-2" />
              <Input label="City *" placeholder="Mumbai" value={address.city} onChange={e => updateAddr('city', e.target.value)} />
              <Input label="State *" placeholder="Maharashtra" value={address.state} onChange={e => updateAddr('state', e.target.value)} />
              <Input label="Pincode *" placeholder="400001" value={address.pincode} onChange={e => updateAddr('pincode', e.target.value)} />
              <Input label="Phone" placeholder="+91 98765 43210" value={address.phone} onChange={e => updateAddr('phone', e.target.value)} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded p-5">
            <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-4">Coupon</h2>
            <div className="flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                placeholder="Enter coupon code" className="input flex-1" />
              <Button variant="outline" size="sm">Apply</Button>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="bg-surface border border-border rounded p-5 h-fit">
          <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item._key} className="flex justify-between text-xs text-subtle">
                <span className="truncate pr-2 max-w-[150px]">{item.product.title} ×{item.quantity}</span>
                <span className="font-mono">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-1.5 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-subtle">Subtotal</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-subtle">Tax (18%)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm pt-1.5 border-t border-border">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(total + tax)}</span>
            </div>
          </div>
          <Button onClick={handleCheckout} loading={loading} className="w-full">
            Pay with Stripe →
          </Button>
          <p className="text-center text-xs text-muted mt-3">Secured by Stripe</p>
        </div>
      </div>
    </div>
  );
}
