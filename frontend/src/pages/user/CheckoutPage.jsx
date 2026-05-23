import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCart, selectCartTotal } from '../../features/cart/cartSlice.js';
import { orderApi } from '../../api/orderApi.js';
import { formatCurrency, getErrMsg } from '../../utils/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const items   = useSelector(selectCart);
  const total   = useSelector(selectCartTotal);

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

  if (!items.length) return <div className="text-center py-24 text-subtle font-semibold">Your cart is empty. Please add products to check out.</div>;

  const tax = total * 0.18;

  return (
    <div className="py-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Secure Checkout</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Complete your transaction details</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Left: Address */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface/20 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-glass space-y-6">
            <div>
              <h2 className="font-heading text-base font-bold text-ink">Shipping Address</h2>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">Where should we deliver?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name *" placeholder="John Doe" value={address.name} onChange={e => updateAddr('name', e.target.value)} className="col-span-2" />
              <Input label="Address Line 1 *" placeholder="Street address, P.O. box, company name" value={address.line1} onChange={e => updateAddr('line1', e.target.value)} className="col-span-2" />
              <Input label="Address Line 2" placeholder="Apartment, suite, unit, building, floor, etc." value={address.line2} onChange={e => updateAddr('line2', e.target.value)} className="col-span-2" />
              <Input label="City *" placeholder="Mumbai" value={address.city} onChange={e => updateAddr('city', e.target.value)} />
              <Input label="State *" placeholder="Maharashtra" value={address.state} onChange={e => updateAddr('state', e.target.value)} />
              <Input label="Pincode *" placeholder="400001" value={address.pincode} onChange={e => updateAddr('pincode', e.target.value)} />
              <Input label="Phone Number" placeholder="+91 98765 43210" value={address.phone} onChange={e => updateAddr('phone', e.target.value)} />
            </div>
          </div>

          <div className="bg-surface/20 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-glass space-y-4">
            <div>
              <h2 className="font-heading text-sm font-bold text-ink">Coupon / Promo Code</h2>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">HAVE A VOUCHER?</p>
            </div>
            <div className="flex gap-2.5">
              <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                placeholder="PROMO100" className="input flex-1 font-mono uppercase tracking-widest" />
              <Button variant="outline" size="sm" className="rounded-xl">Apply Code</Button>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="bg-surface/20 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-glass space-y-6 h-fit">
          <div>
            <h2 className="font-heading text-base font-bold text-ink">Order Summary</h2>
            <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">COST BREAKDOWN</p>
          </div>
          <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
            {items.map(item => (
              <div key={item._key} className="flex justify-between text-xs text-subtle">
                <span className="truncate pr-4 font-medium">{item.product.title} <span className="text-muted">×{item.quantity}</span></span>
                <span className="font-mono text-ink/90 font-medium shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border/60 pt-4 space-y-2.5">
            <div className="flex justify-between text-xs text-subtle">
              <span>Subtotal</span>
              <span className="font-mono text-ink/80">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-subtle">
              <span>Tax (18% GST)</span>
              <span className="font-mono text-ink/80">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-ink pt-3 border-t border-border/60">
              <span>Total Cost</span>
              <span className="font-heading text-indigo-400 text-base">{formatCurrency(total + tax)}</span>
            </div>
          </div>
          <Button onClick={handleCheckout} loading={loading} className="w-full btn-lg">
            Pay with Stripe
          </Button>
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted/70">
            <span>🔒 Secured Stripe Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
