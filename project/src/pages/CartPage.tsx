import React, { useState, useMemo } from 'react';
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
  Share2,
  Copy,
  Check,
} from 'lucide-react';

import type { Product } from '../types';

export type CartItem = {
  name: string;
  category: string;
  price: string;
  image: string;
  tag?: string;
  quantity: number;
  selectedSize?: string;
  availableSizes?: string[];
};

type CartPageProps = {
  cart: CartItem[];
  products?: Product[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onSetItemQuantity?: (index: number, quantity: number) => void;
  onUpdateItemSize?: (index: number, newSize: string) => void;
  onAddAnotherSize?: (itemName: string, newSize: string, quantity: number) => void;
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

export type GroupedCartProduct = {
  name: string;
  category: string;
  price: string;
  unitPrice: number;
  image: string;
  tag?: string;
  availableSizes: string[];
  totalQuantity: number;
  totalAmount: number;
  sizes: {
    originalIndex: number;
    selectedSize: string;
    quantity: number;
    itemTotal: number;
  }[];
};

export const CartPage: React.FC<CartPageProps> = ({
  cart,
  products = [],
  onUpdateQuantity,
  onSetItemQuantity,
  onUpdateItemSize,
  onAddAnotherSize,
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

  const [copied, setCopied] = useState(false);
  const [expandedAddProduct, setExpandedAddProduct] = useState<string | null>(null);
  const [newSizeChoice, setNewSizeChoice] = useState<string>('');
  const [newSizeQty, setNewSizeQty] = useState<number>(1);

  // Group cart items by product name so each shoe has one clean container
  const groupedCart = useMemo(() => {
    const groups: Record<string, GroupedCartProduct> = {};

    cart.forEach((item, index) => {
      const key = item.name;
      const unitPrice = parsePrice(item.price);
      const itemTotal = unitPrice * item.quantity;
      const matchedProduct = products.find((p) => p.name === item.name);
      const availableSizes =
        matchedProduct?.sizes && matchedProduct.sizes.length > 0
          ? matchedProduct.sizes
          : item.availableSizes && item.availableSizes.length > 0
          ? item.availableSizes
          : ['IND 5', 'IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'];

      if (!groups[key]) {
        groups[key] = {
          name: item.name,
          category: item.category,
          price: item.price,
          unitPrice,
          image: item.image,
          tag: item.tag,
          availableSizes,
          totalQuantity: 0,
          totalAmount: 0,
          sizes: [],
        };
      }

      groups[key].totalQuantity += item.quantity;
      groups[key].totalAmount += itemTotal;
      groups[key].sizes.push({
        originalIndex: index,
        selectedSize: item.selectedSize || availableSizes[0] || 'IND 8',
        quantity: item.quantity,
        itemTotal,
      });
    });

    return Object.values(groups);
  }, [cart, products]);

  const generateWhatsAppOrderLink = () => {
    let message = `*Hi Akshat Enterprises, I would like to place an order from your website:*\n\n`;
    cart.forEach((item, idx) => {
      const itemSubtotal = parsePrice(item.price) * item.quantity;
      message += `${idx + 1}. *${item.name}*\n`;
      message += `   • Category: ${item.category}\n`;
      if (item.selectedSize) {
        message += `   • Size: ${item.selectedSize}\n`;
      }
      message += `   • Qty: ${item.quantity} pairs × ${item.price} = ${formatPrice(itemSubtotal)}\n\n`;
    });
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Total Order Value:* ${formatPrice(subtotal)} (${totalItemsCount} ${totalItemsCount === 1 ? 'pair' : 'pairs'})\n\n`;
    message += `Please check availability and share delivery/payment details. Thank you!`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const generateShareWhatsAppLink = () => {
    let message = `📦 *MY SAVED FOOTWEAR ORDER LIST*\n`;
    message += `🏢 Akshat Enterprises Catalog Selection\n`;
    message += `📅 Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`;
    cart.forEach((item, idx) => {
      const itemSubtotal = parsePrice(item.price) * item.quantity;
      message += `${idx + 1}. *${item.name}*\n`;
      message += `   • Category: ${item.category}\n`;
      if (item.selectedSize) {
        message += `   • Size: ${item.selectedSize}\n`;
      }
      message += `   • Qty: ${item.quantity} pairs × ${item.price} = ${formatPrice(itemSubtotal)}\n\n`;
    });
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📊 *Total Quantity:* ${totalItemsCount} ${totalItemsCount === 1 ? 'pair' : 'pairs'}\n`;
    message += `💰 *Total Estimated Value:* ${formatPrice(subtotal)}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Store: Akshat Enterprises (Shop No. 7, Janta Market, Turbhe, Navi Mumbai)`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  const handleCopyCart = () => {
    let text = `📦 MY SAVED ORDER LIST - Akshat Enterprises\n\n`;
    cart.forEach((item, idx) => {
      const itemSubtotal = parsePrice(item.price) * item.quantity;
      text += `${idx + 1}. ${item.name} | Size: ${item.selectedSize || 'Standard'} | Qty: ${item.quantity} | Total: ${formatPrice(itemSubtotal)}\n`;
    });
    text += `\nTotal Pairs: ${totalItemsCount} | Total Value: ${formatPrice(subtotal)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
              <span>Product & Sizing Breakdown</span>
              <span>Subtotals</span>
            </div>

            <div className="cart-items-list">
              {groupedCart.map((group) => {
                const isMultiSize = group.sizes.length > 1;

                return (
                  <article className="cart-grouped-card" key={group.name}>
                    {/* Top Grouped Header */}
                    <div className="cart-grouped-top">
                      <div className="cart-item-thumb">
                        <img src={group.image} alt={group.name} />
                        {group.tag && <span className="cart-item-tag">{group.tag}</span>}
                      </div>

                      <div className="cart-grouped-meta">
                        {isMultiSize && (
                          <div className="cart-multi-size-tag">
                            <span>📦 Multi-Size Order: {group.totalQuantity} pairs of this shoe in cart</span>
                          </div>
                        )}
                        <span className="cart-item-category">{group.category}</span>
                        <h3 className="cart-grouped-title">{group.name}</h3>
                        <span className="cart-item-unit-price">
                          {group.price} <small>per pair</small>
                        </span>
                      </div>
                    </div>

                    {/* Sizing & Quantity Breakdown inside the single container */}
                    <div className="cart-grouped-sizes-box">
                      <div className="cart-grouped-sizes-header">
                        <span className="col-lbl-size">Size</span>
                        <span className="col-lbl-qty">Quantity</span>
                        <span className="col-lbl-subtotal">Subtotal</span>
                        <span className="col-lbl-remove"></span>
                      </div>

                      <div className="cart-grouped-sizes-list">
                        {group.sizes.map((sEntry) => (
                          <div
                            className="cart-size-row"
                            key={`${group.name}-${sEntry.selectedSize}-${sEntry.originalIndex}`}
                          >
                            <div className="cart-size-cell-size">
                              <select
                                className="cart-size-dropdown"
                                value={sEntry.selectedSize}
                                onChange={(e) =>
                                  onUpdateItemSize && onUpdateItemSize(sEntry.originalIndex, e.target.value)
                                }
                                title="Switch size"
                              >
                                {group.availableSizes.map((sz) => (
                                  <option key={sz} value={sz}>
                                    {sz}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="cart-size-cell-qty">
                              <div className="cart-stepper" aria-label="Quantity Controls">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(sEntry.originalIndex, -1)}
                                  aria-label="Decrease quantity"
                                  title="Decrease quantity"
                                >
                                  <Minus size={15} />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max="9999"
                                  className="cart-qty-num-input"
                                  value={sEntry.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val > 0 && onSetItemQuantity) {
                                      onSetItemQuantity(sEntry.originalIndex, val);
                                    }
                                  }}
                                  aria-label={`Quantity for ${group.name} size ${sEntry.selectedSize}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(sEntry.originalIndex, 1)}
                                  aria-label="Increase quantity"
                                  title="Increase quantity"
                                >
                                  <Plus size={15} />
                                </button>
                              </div>
                            </div>

                            <div className="cart-size-cell-subtotal">
                              <strong>{formatPrice(sEntry.itemTotal)}</strong>
                            </div>

                            <div className="cart-size-cell-action">
                              <button
                                type="button"
                                className="cart-remove-btn"
                                onClick={() => onRemoveItem(sEntry.originalIndex)}
                                aria-label={`Remove size ${sEntry.selectedSize}`}
                                title="Remove this size"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Another Size Inline Button / Form */}
                      <div className="cart-grouped-add-size-wrap">
                        <button
                          type="button"
                          className="cart-add-another-size-btn"
                          onClick={() => {
                            if (expandedAddProduct === group.name) {
                              setExpandedAddProduct(null);
                            } else {
                              const remaining = group.availableSizes.filter(
                                (sz) => !group.sizes.some((s) => s.selectedSize === sz)
                              );
                              setNewSizeChoice(remaining[0] || group.availableSizes[0] || 'IND 8');
                              setNewSizeQty(1);
                              setExpandedAddProduct(group.name);
                            }
                          }}
                        >
                          <Plus size={13} /> Add another size for this shoe
                        </button>

                        {expandedAddProduct === group.name && (
                          <div className="cart-inline-add-size-box">
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Size:</span>
                            <select
                              value={newSizeChoice}
                              onChange={(e) => setNewSizeChoice(e.target.value)}
                            >
                              {group.availableSizes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Qty:</span>
                            <input
                              type="number"
                              min="1"
                              max="9999"
                              className="cart-qty-num-input"
                              value={newSizeQty}
                              onChange={(e) => setNewSizeQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            />
                            <button
                              type="button"
                              className="cart-inline-add-btn"
                              onClick={() => {
                                if (onAddAnotherSize) {
                                  onAddAnotherSize(group.name, newSizeChoice, newSizeQty);
                                }
                                setExpandedAddProduct(null);
                              }}
                            >
                              + Add to Order
                            </button>
                            <button
                              type="button"
                              className="cart-inline-cancel-btn"
                              onClick={() => setExpandedAddProduct(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Shoe Total inside the container */}
                      <div className="cart-grouped-foot-total">
                        <span className="cart-grouped-foot-label">Total for this shoe:</span>
                        <span className="cart-grouped-foot-badge">
                          {group.totalQuantity} {group.totalQuantity === 1 ? 'pair' : 'pairs'} ({group.sizes.length} {group.sizes.length === 1 ? 'size' : 'sizes'})
                        </span>
                        <span className="cart-grouped-foot-divider">•</span>
                        <strong className="cart-grouped-foot-amount">{formatPrice(group.totalAmount)}</strong>
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

              <div className="cart-checkout-actions-block">
                <a
                  className="button button-dark cart-checkout-btn"
                  href={generateWhatsAppOrderLink()}
                  target="_blank"
                  rel="noreferrer"
                  title="Send complete order breakdown to Akshat Enterprises (8690041886)"
                >
                  <MessageCircle size={18} /> Confirm Order with Store (WhatsApp)
                </a>

                <a
                  className="button button-light cart-share-wa-btn"
                  href={generateShareWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  title="Opens WhatsApp so you can send/save to 'Message Yourself' or your own contacts"
                >
                  <Share2 size={16} /> Save / Message List to My WhatsApp
                </a>

                <button
                  type="button"
                  className="cart-copy-list-btn"
                  onClick={handleCopyCart}
                  title="Copy full text order summary"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Order Text to Clipboard'}</span>
                </button>
              </div>

              <p className="cart-checkout-note">
                Direct wholesale confirmation via WhatsApp with Turbhe store team. Sizing, payment, and delivery pin-codes will be confirmed in chat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
