import React from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';

export type CartItem = {
  name: string;
  category: string;
  price: string;
  image: string;
  tag?: string;
  quantity: number;
  selectedSize?: string;
};

type CartPageProps = {
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onNavigateHome: () => void;
  whatsappNumber: string;
};

export const parsePrice = (priceStr: string): number => {
  const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

export const formatPrice = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateHome,
  whatsappNumber,
}) => {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );

  const generateWhatsAppOrderLink = () => {
    let message = `*Hi Akshat Enterprises, I would like to place an order from your website:*\n\n`;
    cart.forEach((item, idx) => {
      const itemSubtotal = parsePrice(item.price) * item.quantity;
      message += `${idx + 1}. *${item.name}*\n`;
      message += `   • Category: ${item.category}\n`;
      if (item.selectedSize) {
        message += `   • Size: ${item.selectedSize}\n`;
      }
      message += `   • Qty: ${item.quantity} × ${item.price} = ${formatPrice(itemSubtotal)}\n\n`;
    });
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Total Order Value:* ${formatPrice(subtotal)} (${totalItemsCount} ${totalItemsCount === 1 ? 'pair' : 'pairs'})\n\n`;
    message += `Please check availability and share delivery/payment details. Thank you!`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="cart-page-wrapper section-pad">
      {/* Top Header / Breadcrumb */}
      <div className="cart-header">
        <button
          className="cart-back-btn"
          onClick={onNavigateHome}
          aria-label="Back to store"
        >
          <ArrowLeft size={18} /> Back to Collection
        </button>
        <div className="cart-title-block">
          <p className="eyebrow">
            <span className="eyebrow-line" /> Order Selection
          </p>
          <h1>
            Your Shopping <em>Cart</em>
          </h1>
          <p className="cart-subtitle">
            {totalItemsCount > 0
              ? `You have ${totalItemsCount} ${totalItemsCount === 1 ? 'pair' : 'pairs'} ready for direct WhatsApp confirmation.`
              : 'Your cart is currently empty.'}
          </p>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <div className="cart-empty-icon">
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>
            Explore our curated range of safety footwear, gum boots, and daily sneakers.
          </p>
          <button className="button button-dark" onClick={onNavigateHome}>
            Explore Footwear Collection <ArrowUpRight size={18} />
          </button>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Items List */}
          <div className="cart-items-column">
            <div className="cart-items-header">
              <span>Product Details</span>
              <span>Quantity & Price</span>
            </div>

            <div className="cart-items-list">
              {cart.map((item, index) => {
                const itemTotal = parsePrice(item.price) * item.quantity;
                return (
                  <article className="cart-item-card" key={`${item.name}-${item.selectedSize || index}`}>
                    <div className="cart-item-thumb">
                      <img src={item.image} alt={item.name} />
                      {item.tag && <span className="cart-item-tag">{item.tag}</span>}
                    </div>

                    <div className="cart-item-info">
                      <div className="cart-item-meta">
                        <span className="cart-item-category">{item.category}</span>
                        <h3>{item.name}</h3>
                        <span className="cart-item-unit-price">
                          {item.price} <small>per pair</small>
                        </span>
                        {item.selectedSize && (
                          <span className="cart-item-size-badge">
                            Size: <strong>{item.selectedSize}</strong>
                          </span>
                        )}
                      </div>

                      <div className="cart-item-actions">
                        <div className="cart-stepper" aria-label="Quantity Controls">
                          <button
                            onClick={() => onUpdateQuantity(index, -1)}
                            aria-label="Decrease quantity"
                            title="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="cart-quantity">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(index, 1)}
                            aria-label="Increase quantity"
                            title="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <div className="cart-item-total-price">
                          <strong>{formatPrice(itemTotal)}</strong>
                        </div>

                        <button
                          className="cart-remove-btn"
                          onClick={() => onRemoveItem(index)}
                          aria-label={`Remove ${item.name}`}
                          title="Remove item"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-actions-strip">
              <button className="cart-clear-btn" onClick={onClearCart}>
                Clear entire cart
              </button>
              <button className="text-link" onClick={onNavigateHome}>
                + Add more pairs from store
              </button>
            </div>
          </div>

          {/* Pricing & Checkout Summary */}
          <div className="cart-summary-column">
            <div className="cart-summary-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Total Pairs</span>
                <strong>{totalItemsCount}</strong>
              </div>

              <div className="summary-row">
                <span>Wholesale Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <div className="summary-row">
                <span>Estimated Delivery</span>
                <span className="summary-free">Navi Mumbai Delivery Available</span>
              </div>

              <div className="summary-row">
                <span>GST & In-store Taxes</span>
                <span className="summary-included">Included in Price</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total-row">
                <div>
                  <span className="summary-total-label">Grand Total</span>
                  <small>All taxes & wholesale discount included</small>
                </div>
                <strong className="summary-total-value">{formatPrice(subtotal)}</strong>
              </div>

              <div className="cart-trust-badges">
                <div>
                  <ShieldCheck size={16} />
                  <span>Verified Store Quality</span>
                </div>
                <div>
                  <Truck size={16} />
                  <span>Direct Janta Market Dispatch</span>
                </div>
                <div>
                  <CheckCircle2 size={16} />
                  <span>100% Genuine Pairs</span>
                </div>
              </div>

              <a
                className="button button-dark cart-checkout-btn"
                href={generateWhatsAppOrderLink()}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> Confirm Order on WhatsApp
              </a>

              <p className="cart-checkout-note">
                Orders are verified directly with our Turbhe store team. Sizing, payment, and delivery pin-codes will be confirmed on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
