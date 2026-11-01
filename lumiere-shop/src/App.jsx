import { useState, useEffect, useMemo } from "react";

// ─── CUSTOMER DATA FROM CSV ───────────────────────────────────────────────────
const CUSTOMERS = {
  "12409": { segment: "Champions", clv: 26457, incentive: "🏆 VIP Platinum Membership", details: "Exclusive early product access + 5× loyalty points + free priority shipping", discount: 0, tier: "Platinum" },
  "12415": { segment: "Champions", clv: 77875, incentive: "🏆 VIP Platinum Membership", details: "Exclusive early product access + 5× loyalty points + free priority shipping", discount: 0, tier: "Platinum" },
  "12347": { segment: "Loyal Customers", clv: 2647, incentive: "🎯 Loyalty Bonus", details: "Buy 2 get 1 free on favourite category + referral reward (£10 off next order)", discount: 10, tier: "Gold" },
  "12349": { segment: "Loyal Customers", clv: 3099, incentive: "💎 Loyalty Tier Upgrade Offer", details: "Upgrade to Champions tier if 2 more purchases in 60 days + 500 bonus points", discount: 10, tier: "Gold" },
  "12346": { segment: "At-Risk / Churners", clv: 62, incentive: "📧 Re-Engagement Email", details: "Personalised product recommendations + 10% off expiring in 7 days", discount: 10, tier: "Standard" },
  "12351": { segment: "At-Risk / Churners", clv: 301, incentive: "🔔 Win-Back Offer", details: '"We have saved your cart!" email + 15% off + free delivery on next order', discount: 15, tier: "Standard" },
  "12422": { segment: "Champions", clv: 26602, incentive: "🏆 VIP Platinum Membership", details: "Exclusive early product access + 5× loyalty points + free priority shipping", discount: 0, tier: "Platinum" },
  "12356": { segment: "Loyal Customers", clv: 9379, incentive: "💎 Loyalty Tier Upgrade Offer", details: "Upgrade to Champions tier if 2 more purchases in 60 days + 500 bonus points", discount: 10, tier: "Gold" },
};
const DEFAULT_CUSTOMER_ID = "12409";

// ─── PRODUCT CATALOGUE ────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Linen Throw Blanket", price: 68, category: "Home Textiles", emoji: "🛋️", badge: "Bestseller", desc: "Stonewashed 100% European linen. Naturally softened with age.", rating: 4.8, reviews: 312, stock: 14, exclusive: false },
  { id: 2, name: "Reed Diffuser Set", price: 44, category: "Fragrance", emoji: "🌿", badge: "New", desc: "Hand-poured with essential oils. 90-day scent longevity.", rating: 4.6, reviews: 187, stock: 28, exclusive: false },
  { id: 3, name: "Ceramic Dinner Set", price: 195, category: "Kitchen", emoji: "🍽️", badge: null, desc: "Set of 4. Speckled stoneware fired at 1280°C. Dishwasher safe.", rating: 4.9, reviews: 94, stock: 7, exclusive: false },
  { id: 4, name: "Beeswax Pillar Candles", price: 32, category: "Fragrance", emoji: "🕯️", badge: "Limited", desc: "Pure beeswax. Burns 40% longer than paraffin. Set of 3.", rating: 4.7, reviews: 443, stock: 31, exclusive: false },
  { id: 5, name: "Oak Serving Board", price: 86, category: "Kitchen", emoji: "🪵", badge: null, desc: "Solid English oak with leather hanging strap. Pre-oiled.", rating: 4.8, reviews: 208, stock: 19, exclusive: false },
  { id: 6, name: "Merino Wool Cushion", price: 75, category: "Home Textiles", emoji: "🛏️", badge: null, desc: "500g merino fill. Removable cover in natural undyed wool.", rating: 4.5, reviews: 156, stock: 22, exclusive: false },
  { id: 7, name: "Handblown Glass Vase", price: 120, category: "Décor", emoji: "🏺", badge: "Exclusive", desc: "Individually mouth-blown by artisans in Yorkshire. No two alike.", rating: 4.9, reviews: 67, stock: 5, exclusive: true },
  { id: 8, name: "Soy Wax Gift Set", price: 55, category: "Fragrance", emoji: "✨", badge: "Gift", desc: "Four 8oz candles in seasonal scents. Gift-boxed with ribbon.", rating: 4.7, reviews: 289, stock: 18, exclusive: false },
  { id: 9, name: "Woven Storage Basket", price: 48, category: "Décor", emoji: "🧺", badge: null, desc: "Hand-woven seagrass with cotton lining. Stackable.", rating: 4.4, reviews: 173, stock: 33, exclusive: false },
  { id: 10, name: "Copper Watering Can", price: 98, category: "Garden", emoji: "🪴", badge: "Exclusive", desc: "Hammered copper. Develops a natural patina over time.", rating: 4.9, reviews: 41, stock: 8, exclusive: true },
  { id: 11, name: "Wool Rug — Small", price: 165, category: "Home Textiles", emoji: "🎨", badge: null, desc: "Hand-tufted New Zealand wool. 90×150cm. Certified natural dyes.", rating: 4.8, reviews: 129, stock: 11, exclusive: false },
  { id: 12, name: "Reclaimed Wood Clock", price: 82, category: "Décor", emoji: "🕐", badge: "New", desc: "Dial cut from a single slab of reclaimed elm. Silent quartz movement.", rating: 4.6, reviews: 88, stock: 16, exclusive: false },
];

const CATEGORIES = ["All", "Home Textiles", "Kitchen", "Fragrance", "Décor", "Garden"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function applyDiscount(price, pct) {
  return pct > 0 ? +(price * (1 - pct / 100)).toFixed(2) : price;
}
function fmt(n) { return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function Stars({ r }) {
  return <span style={{ color: "#f59e0b", fontSize: 12 }}>{"★".repeat(Math.floor(r))}{"☆".repeat(5 - Math.floor(r))}</span>;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#111827", color: "#f9fafb", padding: "12px 22px", borderRadius: 10, fontSize: 14, boxShadow: "0 8px 32px #0008", zIndex: 9999, display: "flex", alignItems: "center", gap: 10, border: "1px solid #374151", animation: "slideUp .25s ease" }}>
      <span style={{ color: "#86efac" }}>✓</span> {msg}
      <style>{`@keyframes slideUp{from{transform:translateX(-50%) translateY(16px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function Badge({ text }) {
  if (!text) return null;
  const colors = { Bestseller: "#2563eb", New: "#059669", Limited: "#dc2626", Exclusive: "#7c3aed", Gift: "#db2777" };
  return <span style={{ background: colors[text] || "#6b7280", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>{text}</span>;
}

function ProductCard({ product, customer, onAdd, onView }) {
  const disc = customer?.discount || 0;
  const finalPrice = applyDiscount(product.price, disc);
  const isExclusive = product.exclusive;
  const canSee = !isExclusive || customer?.tier === "Platinum";

  if (!canSee) {
    return (
      <div style={{ background: "#f9fafb", borderRadius: 14, padding: 24, border: "2px dashed #e5e7eb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 8, textAlign: "center" }}>
        <span style={{ fontSize: 32 }}>🔒</span>
        <div style={{ fontWeight: 700, color: "#374151", fontSize: 15 }}>{product.name}</div>
        <div style={{ color: "#9ca3af", fontSize: 13 }}>Exclusive to Platinum Members</div>
        <div style={{ color: "#7c3aed", fontSize: 12, marginTop: 4 }}>Reach Platinum tier to unlock</div>
      </div>
    );
  }

  return (
    <div onClick={() => onView(product)} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f3f4f6", overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s, transform .2s", boxShadow: "0 1px 4px #0001" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px #0002"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px #0001"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ background: "linear-gradient(135deg, #fafafa, #f0f0eb)", height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative" }}>
        {product.emoji}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          <Badge text={product.badge} />
          {product.stock <= 8 && <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 10, padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>Only {product.stock} left</span>}
        </div>
        {disc > 0 && <span style={{ position: "absolute", top: 10, right: 10, background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>−{disc}%</span>}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ color: "#9ca3af", fontSize: 11, marginBottom: 3, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{product.category}</div>
        <div style={{ fontWeight: 700, color: "#111827", fontSize: 15, marginBottom: 5 }}>{product.name}</div>
        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>{product.desc.slice(0, 60)}…</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Stars r={product.rating} />
          <span style={{ color: "#9ca3af", fontSize: 11 }}>{product.rating} ({product.reviews})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {disc > 0 ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontWeight: 800, color: "#111827", fontSize: 17 }}>{fmt(finalPrice)}</span>
                <span style={{ color: "#d1d5db", textDecoration: "line-through", fontSize: 13 }}>{fmt(product.price)}</span>
              </div>
            ) : (
              <span style={{ fontWeight: 800, color: "#111827", fontSize: 17 }}>{fmt(product.price)}</span>
            )}
          </div>
          <button onClick={e => { e.stopPropagation(); onAdd(product); }} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}

function CartSidebar({ items, customer, onClose, onRemove, onQty, onCheckout }) {
  const disc = customer?.discount || 0;
  const subtotal = items.reduce((s, i) => s + applyDiscount(i.price, disc) * i.qty, 0);
  const shipping = subtotal > 75 || customer?.tier === "Platinum" ? 0 : 4.99;
  const loyalty = customer?.tier === "Platinum" ? Math.floor(subtotal * 5) : Math.floor(subtotal);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "#00000055" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 400, background: "#fff", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px #0003" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Your Bag <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 14 }}>({items.reduce((s, i) => s + i.qty, 0)})</span></div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>

        {customer && (
          <div style={{ background: customer.tier === "Platinum" ? "#faf5ff" : "#fffbeb", padding: "10px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{customer.tier === "Platinum" ? "👑" : "⭐"}</span>
            <span style={{ fontSize: 12, color: customer.tier === "Platinum" ? "#7c3aed" : "#92400e", fontWeight: 600 }}>
              {customer.incentive} — {disc > 0 ? `${disc}% off applied` : "Reward-based savings"}
            </span>
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <div style={{ fontWeight: 600 }}>Your bag is empty</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Add something beautiful</div>
            </div>
          ) : items.map(item => (
            <div key={item.id} style={{ display: "flex", gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #f9fafb" }}>
              <div style={{ width: 64, height: 64, background: "#f9fafb", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{item.name}</div>
                <div style={{ color: "#9ca3af", fontSize: 12, margin: "2px 0 8px" }}>{item.category}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => onQty(item.id, -1)} style={{ width: 26, height: 26, border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: "pointer", fontWeight: 700 }}>−</button>
                    <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => onQty(item.id, 1)} style={{ width: 26, height: 26, border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: "pointer", fontWeight: 700 }}>+</button>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{fmt(applyDiscount(item.price, disc) * item.qty)}</div>
                    {disc > 0 && <div style={{ color: "#d1d5db", textDecoration: "line-through", fontSize: 11 }}>{fmt(item.price * item.qty)}</div>}
                  </div>
                </div>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", alignSelf: "flex-start", fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13 }}>
                <span>Subtotal</span><span style={{ color: "#111827", fontWeight: 500 }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 13 }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? "#059669" : "#111827", fontWeight: 500 }}>
                  {shipping === 0 ? "Free" : fmt(shipping)}
                </span>
              </div>
              {customer?.tier === "Platinum" && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#7c3aed", fontSize: 13 }}>
                  <span>Points earned</span><span style={{ fontWeight: 600 }}>+{loyalty} pts</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, paddingTop: 8, borderTop: "1px solid #f3f4f6", marginTop: 4 }}>
                <span>Total</span><span>{fmt(subtotal + shipping)}</span>
              </div>
            </div>
            <button onClick={onCheckout} style={{ width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "14px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Checkout →
            </button>
            {shipping > 0 && <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 8 }}>
              Add {fmt(75 - subtotal)} more for free delivery
            </div>}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({ product, customer, onClose, onAdd }) {
  const disc = customer?.discount || 0;
  const finalPrice = applyDiscount(product.price, disc);
  const [qty, setQty] = useState(1);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "#00000066" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, width: 640, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto", padding: 32 }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#f9fafb", border: "none", borderRadius: 99, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#6b7280" }}>×</button>
        <div style={{ display: "flex", gap: 28 }}>
          <div style={{ width: 220, height: 220, background: "linear-gradient(135deg, #fafafa, #f0f0eb)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, flexShrink: 0 }}>
            {product.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <Badge text={product.badge} />
              {product.exclusive && <Badge text="Exclusive" />}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{product.category}</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#111827" }}>{product.name}</h2>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
              <Stars r={product.rating} />
              <span style={{ color: "#6b7280", fontSize: 13 }}>{product.rating} · {product.reviews} reviews</span>
            </div>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7, margin: "0 0 16px" }}>{product.desc}</p>

            {disc > 0 && (
              <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 13, color: "#854d0e" }}>
                {disc}% member discount applied to your account
              </div>
            )}

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>{fmt(finalPrice * qty)}</span>
              {disc > 0 && <span style={{ color: "#d1d5db", textDecoration: "line-through", fontSize: 16 }}>{fmt(product.price * qty)}</span>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: "10px 16px", border: "none", background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>−</button>
                <span style={{ padding: "10px 20px", fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ padding: "10px 16px", border: "none", background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>+</button>
              </div>
              <button onClick={() => { onAdd(product, qty); onClose(); }} style={{ flex: 1, background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Add to Bag
              </button>
            </div>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>
              {product.stock <= 8 ? <span style={{ color: "#dc2626" }}>⚡ Only {product.stock} in stock</span> : `✓ In stock · Ships in 2–3 days`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ items, customer, onClose, onComplete }) {
  const disc = customer?.discount || 0;
  const subtotal = items.reduce((s, i) => s + applyDiscount(i.price, disc) * i.qty, 0);
  const shipping = subtotal > 75 || customer?.tier === "Platinum" ? 0 : 4.99;
  const total = subtotal + shipping;
  const [step, setStep] = useState(1);
  const [name, setName] = useState(customer ? `Customer #${Object.keys(CUSTOMERS).find(k => CUSTOMERS[k] === customer) || ""}` : "");
  const [addr, setAddr] = useState("");
  const [card, setCard] = useState("");
  const [placing, setPlacing] = useState(false);

  function placeOrder() {
    if (!addr || !card) return;
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setStep(3); }, 1600);
  }

  const inp = (val, set, ph, type = "text") => (
    <input value={val} onChange={e => set(e.target.value)} placeholder={ph} type={type}
      style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "#00000066" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, width: 480, maxWidth: "95vw", padding: 32 }}>
        {step < 3 && <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>×</button>}

        {step === 1 && (
          <>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800 }}>Delivery Details</h2>
            {inp(name, setName, "Full name")}
            {inp(addr, setAddr, "Delivery address")}
            <input placeholder="Postcode" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => setStep(2)} style={{ width: "100%", background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 16 }}>Continue to Payment →</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Payment</h2>
            <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>All transactions are encrypted & secure</div>
            {inp(card, setCard, "Card number", "text")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input placeholder="MM/YY" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
              <input placeholder="CVV" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
            </div>
            <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", margin: "16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#6b7280", fontSize: 13 }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#6b7280", fontSize: 13 }}><span>Shipping</span><span style={{ color: shipping === 0 ? "#059669" : undefined }}>{shipping === 0 ? "Free" : fmt(shipping)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, paddingTop: 8, borderTop: "1px solid #e5e7eb" }}><span>Total</span><span>{fmt(total)}</span></div>
            </div>
            {customer && <div style={{ background: "#fffbeb", border: "1px solid #fde047", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#92400e", marginBottom: 14 }}>
              {customer.incentive} applied to this order
            </div>}
            <button onClick={placeOrder} disabled={placing} style={{ width: "100%", background: placing ? "#9ca3af" : "#111827", color: "#fff", border: "none", borderRadius: 10, padding: 14, fontWeight: 700, fontSize: 15, cursor: placing ? "not-allowed" : "pointer" }}>
              {placing ? "Processing…" : `Pay ${fmt(total)}`}
            </button>
          </>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Order Confirmed!</h2>
            <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Thank you! Your order of {fmt(total)} has been placed.<br />
              {customer?.tier === "Platinum" ? "Your VIP order ships tomorrow with priority delivery." : "Expected delivery in 3–5 business days."}
            </div>
            {customer && (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#14532d" }}>
                {customer.tier === "Platinum" ? `+${Math.floor(total * 5)} points added to your Platinum account 🏆` : customer.details}
              </div>
            )}
            <button onClick={() => { onComplete(); onClose(); }} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "12px 32px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Back to Shop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [customerId, setCustomerId] = useState(DEFAULT_CUSTOMER_ID);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [toast, setToast] = useState(null);
  const [loginId, setLoginId] = useState(DEFAULT_CUSTOMER_ID);

  const customer = CUSTOMERS[customerId] || null;

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    setToast(`${product.name} added to your bag`);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const changeQty = (id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const filteredProducts = useMemo(() => {
    let p = PRODUCTS.filter(pr => {
      if (category !== "All" && pr.category !== category) return false;
      if (search && !pr.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sort === "price-asc") p = [...p].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") p = [...p].sort((a, b) => b.price - a.price);
    if (sort === "rating") p = [...p].sort((a, b) => b.rating - a.rating);
    return p;
  }, [category, search, sort]);

  const tierStyle = {
    Platinum: { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe", icon: "👑" },
    Gold: { bg: "#fffbeb", text: "#92400e", border: "#fde68a", icon: "⭐" },
    Standard: { bg: "#f9fafb", text: "#374151", border: "#e5e7eb", icon: "🛍️" },
  };
  const ts = customer ? tierStyle[customer.tier] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#111827" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 60, gap: 20 }}>
          <div onClick={() => setPage("home")} style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5, cursor: "pointer", color: "#111827" }}>
            Lumi<span style={{ color: "#7c3aed" }}>ère</span>
          </div>
          <div style={{ flex: 1, display: "flex", gap: 4 }}>
            {["home", "shop", "about"].map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ background: "none", border: "none", padding: "6px 12px", color: page === p ? "#111827" : "#9ca3af", fontWeight: page === p ? 700 : 400, cursor: "pointer", fontSize: 14, borderRadius: 6, textTransform: "capitalize" }}>{p === "home" ? "Home" : p === "shop" ? "Shop" : "About"}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Login selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", borderRadius: 8, padding: "5px 10px" }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Customer:</span>
              <select value={loginId} onChange={e => { setLoginId(e.target.value); setCustomerId(e.target.value); }}
                style={{ background: "none", border: "none", fontSize: 12, color: "#374151", cursor: "pointer", fontWeight: 600 }}>
                {Object.keys(CUSTOMERS).map(id => (
                  <option key={id} value={id}>#{id} — {CUSTOMERS[id].tier}</option>
                ))}
                <option value="guest">Guest</option>
              </select>
            </div>

            {customer && (
              <div style={{ background: ts.bg, border: `1px solid ${ts.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12, color: ts.text, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                {ts.icon} {customer.tier}
              </div>
            )}

            <button onClick={() => setShowCart(true)} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              🛒 {cartCount > 0 ? <span style={{ background: "#7c3aed", borderRadius: 99, padding: "1px 6px", fontSize: 11 }}>{cartCount}</span> : "Bag"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HOME PAGE ───────────────────────────────── */}
      {page === "home" && (
        <>
          {/* Hero */}
          <div style={{ background: "linear-gradient(135deg, #faf9f7 60%, #f0ebff)", padding: "72px 24px", textAlign: "center" }}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              {customer && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: ts.bg, border: `1px solid ${ts.border}`, borderRadius: 99, padding: "6px 16px", marginBottom: 20, fontSize: 13, color: ts.text, fontWeight: 600 }}>
                  {ts.icon} {customer.incentive}
                </div>
              )}
              <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2, margin: "0 0 16px", lineHeight: 1.1 }}>
                Objects that make<br /><span style={{ color: "#7c3aed" }}>home feel different.</span>
              </h1>
              <p style={{ color: "#6b7280", fontSize: 18, lineHeight: 1.6, margin: "0 0 32px" }}>
                Thoughtfully sourced homeware and gifts, curated for people with a distinct point of view.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setPage("shop")} style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
                  Shop Now →
                </button>
                {customer?.discount > 0 && (
                  <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "14px 20px", fontWeight: 700, color: "#854d0e", fontSize: 15 }}>
                    Your {customer.discount}% discount is active 🎉
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personalised offer banner */}
          {customer && (
            <div style={{ background: customer.tier === "Platinum" ? "#1e1b4b" : "#111827", color: "#fff", padding: "18px 24px" }}>
              <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{ts.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{customer.incentive}</div>
                    <div style={{ color: "#9ca3af", fontSize: 13 }}>{customer.details}</div>
                  </div>
                </div>
                <button onClick={() => setPage("shop")} style={{ background: "#7c3aed", border: "none", color: "#fff", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
                  Claim Offer →
                </button>
              </div>
            </div>
          )}

          {/* Featured products */}
          <div style={{ maxWidth: 1200, margin: "56px auto", padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Featured this week</h2>
              <button onClick={() => setPage("shop")} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>View all →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {PRODUCTS.filter(p => !p.exclusive || customer?.tier === "Platinum").slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} customer={customer} onAdd={addToCart} onView={setViewProduct} />
              ))}
            </div>
          </div>

          {/* Category strip */}
          <div style={{ background: "#faf9f7", padding: "48px 24px", borderTop: "1px solid #f3f4f6" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", letterSpacing: -0.3 }}>Browse by category</h2>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { cat: "Home Textiles", emoji: "🛋️", desc: "Linen, wool & cotton" },
                  { cat: "Kitchen", emoji: "🍽️", desc: "Ceramics & serving" },
                  { cat: "Fragrance", emoji: "🕯️", desc: "Candles & diffusers" },
                  { cat: "Décor", emoji: "🏺", desc: "Vases, baskets & clocks" },
                  { cat: "Garden", emoji: "🪴", desc: "Copper & terracotta" },
                ].map(c => (
                  <div key={c.cat} onClick={() => { setCategory(c.cat); setPage("shop"); }} style={{ background: "#fff", borderRadius: 12, padding: "18px 22px", border: "1px solid #f3f4f6", cursor: "pointer", flex: "1 1 160px", transition: "box-shadow .2s" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px #0001"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{c.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.cat}</div>
                    <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── SHOP PAGE ───────────────────────────────── */}
      {page === "shop" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Shop</h1>
              <div style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>{filteredProducts.length} products</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", width: 200 }} />
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>
                <option value="default">Sort: Featured</option>
                <option value="price-asc">Price: Low–High</option>
                <option value="price-desc">Price: High–Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 16px", borderRadius: 99, border: `1.5px solid ${category === c ? "#111827" : "#e5e7eb"}`, background: category === c ? "#111827" : "#fff", color: category === c ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{c}</button>
            ))}
          </div>

          {/* Discount banner */}
          {customer?.discount > 0 && (
            <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 12, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#854d0e", fontWeight: 600 }}>
              🎉 Your {customer.discount}% member discount is active on all items below
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} customer={customer} onAdd={addToCart} onView={setViewProduct} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>Nothing found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try a different search or category</div>
            </div>
          )}
        </div>
      )}

      {/* ── ABOUT PAGE ───────────────────────────────── */}
      {page === "about" && (
        <div style={{ maxWidth: 800, margin: "64px auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>About <span style={{ color: "#7c3aed" }}>Lumière</span></h1>
          <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
            Lumière is an independent British homeware retailer, founded on the belief that the objects you live with every day deserve to be beautiful, well-made, and ethically sourced.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
            {[
              { icon: "🌿", title: "Sustainably Sourced", desc: "Every product is chosen for longevity and provenance. We work directly with artisans across the UK and Europe." },
              { icon: "🚚", title: "Free Delivery over £75", desc: "Fast, carbon-neutral delivery on all UK orders. Platinum members get priority shipping on every order." },
              { icon: "♻️", title: "Returns on Us", desc: "Not right? Free 30-day returns, no questions asked. We also offer free exchanges for sizing." },
              { icon: "💜", title: "Loyalty Rewards", desc: "Every purchase earns points. Champions and loyal customers unlock exclusive early access, bonuses, and VIP perks." },
            ].map(c => (
              <div key={c.title} style={{ background: "#f9fafb", borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{c.title}</div>
                <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          {customer && (
            <div style={{ background: ts.bg, border: `1.5px solid ${ts.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: ts.text, marginBottom: 8 }}>{ts.icon} Your Membership: {customer.tier}</div>
              <p style={{ color: "#4b5563", margin: "0 0 12px", lineHeight: 1.7 }}>{customer.details}</p>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ background: "#fff", borderRadius: 8, padding: "10px 16px" }}>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>Customer CLV</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>£{customer.clv.toLocaleString()}</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 8, padding: "10px 16px" }}>
                  <div style={{ color: "#9ca3af", fontSize: 11 }}>Segment</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{customer.segment}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {showCart && (
        <CartSidebar items={cart} customer={customer} onClose={() => setShowCart(false)}
          onRemove={removeFromCart} onQty={changeQty} onCheckout={() => { setShowCart(false); setShowCheckout(true); }} />
      )}

      {showCheckout && (
        <CheckoutModal items={cart} customer={customer} onClose={() => setShowCheckout(false)}
          onComplete={() => setCart([])} />
      )}

      {viewProduct && (
        <ProductModal product={viewProduct} customer={customer} onClose={() => setViewProduct(null)} onAdd={addToCart} />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* FOOTER */}
      <footer style={{ background: "#111827", color: "#9ca3af", padding: "40px 24px", marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 20, marginBottom: 8 }}>Lumi<span style={{ color: "#a78bfa" }}>ère</span></div>
            <div style={{ fontSize: 13, maxWidth: 240 }}>Beautiful homeware for people with a distinct point of view.</div>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Shop</div>
              {CATEGORIES.filter(c => c !== "All").map(c => <div key={c} style={{ marginBottom: 6, fontSize: 13, cursor: "pointer" }} onClick={() => { setCategory(c); setPage("shop"); }}>{c}</div>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 600, marginBottom: 10, fontSize: 13 }}>Customer Tiers</div>
              {[["👑 Platinum", "Top spenders, VIP perks"], ["⭐ Gold", "Loyal buyers, 10% off"], ["🛍️ Standard", "Welcome discount on return"]].map(([t, d]) => (
                <div key={t} style={{ marginBottom: 8 }}>
                  <div style={{ color: "#d1d5db", fontSize: 13 }}>{t}</div>
                  <div style={{ fontSize: 11 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid #374151", fontSize: 12, textAlign: "center" }}>
          © 2025 Lumière Home & Gifts · Powered by RFM customer segmentation · {PRODUCTS.length} products · 4,285 customers
        </div>
      </footer>
    </div>
  );
}

