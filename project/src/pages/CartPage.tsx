import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Award,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit3,
  Lock,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
} from 'lucide-react';

import type { Product } from '../types';
import { getCartUrl } from '../constants';

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
  onSetItemQuantity,
  onUpdateItemSize,
  onAddAnotherSize,
  onRemoveItem,
  onNavigateHome,
  whatsappNumber,
}) => {
  // State for collapsible view more sizes per product (> 3 sizes)
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});

  // Inline edit state for pencil icon
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Add another size form state
  const [addingSizeForProduct, setAddingSizeForProduct] = useState<string | null>(null);
  const [newSizeChoice, setNewSizeChoice] = useState<string>('');
  const [newSizeQuantity, setNewSizeQuantity] = useState<number>(1);

  // Group cart items by product name
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
          : ['Size 5', 'Size 6', 'Size 7', 'Size 8', 'Size 9', 'Size 10', 'Size 11'];

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
        selectedSize: item.selectedSize || availableSizes[0] || 'Size 8',
        quantity: item.quantity,
        itemTotal,
      });
    });

    return Object.values(groups);
  }, [cart, products]);

  const totalPairsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0
  );

  const generateWhatsAppOrderLink = () => {
    const cartUrl = getCartUrl();
    let message = `*Hi Akshat Enterprises, I would like to place an order:*\n\n`;
    groupedCart.forEach((group, idx) => {
      message += `${idx + 1}. *${group.name}* (${group.category})\n`;
      group.sizes.forEach((s) => {
        message += `   • ${s.selectedSize}: ${s.quantity} pairs × ${group.price} = ${formatPrice(s.itemTotal)}\n`;
      });
      message += `   *Subtotal:* ${formatPrice(group.totalAmount)} (${group.totalQuantity} pairs)\n\n`;
    });
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Total Amount:* ${formatPrice(subtotal)} (${totalPairsCount} pairs across ${groupedCart.length} products)\n`;
    message += `*Shipping:* Free Store Dispatch (Navi Mumbai)\n\n`;
    message += `Cart Link:\n${cartUrl}\n\n`;
    message += `Please confirm stock availability and share dispatch schedule. Thank you!`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="ax-cart-page">
      {/* Top Header */}
      <div className="ax-cart-header-row">
        <div>
          <div className="ax-cart-header-title-wrap">
            <h1 className="ax-cart-header-title">
              <ShoppingBag size={26} strokeWidth={2.2} />
              <span>My Cart</span>
            </h1>
            <span className="ax-cart-product-count-badge">
              {groupedCart.length} {groupedCart.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          <p className="ax-cart-header-subtitle">
            Review your items, sizes and quantities before checkout.
          </p>
        </div>

        <button
          type="button"
          className="ax-cart-continue-link"
          onClick={onNavigateHome}
        >
          <span>Continue Shopping</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="ax-empty-cart-card">
          <div className="ax-empty-cart-icon">
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Explore our curated range of safety shoes, gum boots, and daily footwear.</p>
          <button className="button button-dark" onClick={onNavigateHome}>
            Explore Footwear Collection <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="ax-cart-layout">
          {/* Left Column: Product Cards */}
          <div className="ax-products-column">
            {groupedCart.map((group) => {
              const isExpanded = !!expandedProducts[group.name];
              const hasMoreThanThree = group.sizes.length > 3;
              const displayedSizes =
                hasMoreThanThree && !isExpanded
                  ? group.sizes.slice(0, 3)
                  : group.sizes;
              const hiddenCount = group.sizes.length - 3;

              // Remaining sizes for add another size
              const remainingSizes = group.availableSizes.filter(
                (sz) => !group.sizes.some((s) => s.selectedSize === sz)
              );

              return (
                <article className="ax-product-card" key={group.name}>
                  {/* Product Header */}
                  <div className="ax-product-top">
                    <div className="ax-product-info-group">
                      <div className="ax-product-thumb">
                        <img src={group.image} alt={group.name} />
                      </div>
                      <div>
                        {group.tag && (
                          <span className="ax-product-tag">{group.tag}</span>
                        )}
                        <h2 className="ax-product-title">{group.name}</h2>
                        <span className="ax-product-category">
                          Category : <strong>{group.category}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="ax-product-top-price">
                      <strong>{formatPrice(group.totalAmount)}</strong>
                      <span>
                        ({group.totalQuantity} {group.totalQuantity === 1 ? 'pair' : 'pairs'})
                      </span>
                    </div>
                  </div>

                  {/* Sizing Rows Container */}
                  <div className="ax-sizes-container">
                    {displayedSizes.map((sEntry) => {
                      const isEditing = editingIndex === sEntry.originalIndex;

                      return (
                        <div key={`${sEntry.selectedSize}-${sEntry.originalIndex}`}>
                          <div className="ax-size-row">
                            {/* Left Group: Size Badge & Qty Dropdown */}
                            <div className="ax-size-left-group">
                              <span className="ax-size-pill">
                                {sEntry.selectedSize.startsWith('Size') || sEntry.selectedSize.startsWith('IND')
                                  ? sEntry.selectedSize
                                  : `Size ${sEntry.selectedSize}`}
                              </span>

                              <div className="ax-size-qty-wrapper">
                                <span>Qty {sEntry.quantity}</span>
                                <ChevronDown size={13} />
                                <select
                                  value={sEntry.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val > 0 && onSetItemQuantity) {
                                      onSetItemQuantity(sEntry.originalIndex, val);
                                    }
                                  }}
                                  aria-label={`Quantity for ${group.name} ${sEntry.selectedSize}`}
                                >
                                  {[
                                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 20, 24, 30, 48, 50, 100,
                                  ].map((q) => (
                                    <option key={q} value={q}>
                                      Qty {q}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Right Group: Right Top Corner (Edit & Delete) + Right Bottom (Price / pair) */}
                            <div className="ax-size-right-group">
                              <div className="ax-size-actions">
                                <button
                                  type="button"
                                  className={`ax-size-icon-btn ${isEditing ? 'active' : ''}`}
                                  onClick={() =>
                                    setEditingIndex(isEditing ? null : sEntry.originalIndex)
                                  }
                                  title="Edit size or type custom quantity"
                                  aria-label="Edit size"
                                >
                                  <Edit3 size={15} />
                                </button>

                                <button
                                  type="button"
                                  className="ax-size-icon-btn delete"
                                  onClick={() => onRemoveItem(sEntry.originalIndex)}
                                  title={`Remove ${sEntry.selectedSize}`}
                                  aria-label="Remove size"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>

                              <div className="ax-size-price-col">
                                <strong>
                                  {formatPrice(group.unitPrice * sEntry.quantity)}
                                </strong>
                                <small> / pair</small>
                              </div>
                            </div>
                          </div>

                          {/* Quick Inline Edit Drawer (Triggered by Pencil) */}
                          {isEditing && (
                            <div className="ax-size-inline-edit">
                              <div className="ax-size-inline-field">
                                <label>Change Size:</label>
                                <select
                                  value={sEntry.selectedSize}
                                  onChange={(e) => {
                                    if (onUpdateItemSize) {
                                      onUpdateItemSize(sEntry.originalIndex, e.target.value);
                                    }
                                  }}
                                >
                                  {group.availableSizes.map((sz) => (
                                    <option key={sz} value={sz}>
                                      {sz}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="ax-size-inline-field">
                                <label>Custom Qty:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="9999"
                                  value={sEntry.quantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (!isNaN(val) && val > 0 && onSetItemQuantity) {
                                      onSetItemQuantity(sEntry.originalIndex, val);
                                    }
                                  }}
                                />
                              </div>

                              <button
                                type="button"
                                className="ax-size-inline-done-btn"
                                onClick={() => setEditingIndex(null)}
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* View More Sizes / Collapse Dropdown (Core Feature: Triggered after 3 sizes) */}
                    {hasMoreThanThree && (
                      <button
                        type="button"
                        className="ax-view-more-sizes-btn"
                        onClick={() =>
                          setExpandedProducts((prev) => ({
                            ...prev,
                            [group.name]: !isExpanded,
                          }))
                        }
                      >
                        {isExpanded ? (
                          <>
                            <span>Collapse Sizes</span>
                            <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            <span>
                              View {hiddenCount} more {hiddenCount === 1 ? 'size' : 'sizes'}
                            </span>
                            <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    )}

                    {/* Add Another Size Button / Form */}
                    {addingSizeForProduct === group.name ? (
                      <div className="ax-add-size-box">
                        <div className="ax-add-size-inputs">
                          <div className="ax-add-size-item">
                            <label>Select Size</label>
                            <select
                              value={newSizeChoice}
                              onChange={(e) => setNewSizeChoice(e.target.value)}
                            >
                              {(remainingSizes.length > 0 ? remainingSizes : group.availableSizes).map(
                                (sz) => (
                                  <option key={sz} value={sz}>
                                    {sz}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="ax-add-size-item">
                            <label>Quantity</label>
                            <input
                              type="number"
                              min="1"
                              max="9999"
                              value={newSizeQuantity}
                              onChange={(e) =>
                                setNewSizeQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                              }
                            />
                          </div>
                        </div>

                        <div className="ax-add-size-btns">
                          <button
                            type="button"
                            className="ax-add-size-submit"
                            onClick={() => {
                              if (newSizeChoice && onAddAnotherSize) {
                                onAddAnotherSize(group.name, newSizeChoice, newSizeQuantity);
                              }
                              setAddingSizeForProduct(null);
                            }}
                          >
                            <Plus size={14} /> Add Size
                          </button>
                          <button
                            type="button"
                            className="ax-add-size-cancel"
                            onClick={() => setAddingSizeForProduct(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="ax-add-size-trigger-btn"
                        onClick={() => {
                          const remaining = group.availableSizes.filter(
                            (sz) => !group.sizes.some((s) => s.selectedSize === sz)
                          );
                          setNewSizeChoice(
                            remaining[0] || group.availableSizes[0] || 'Size 8'
                          );
                          setNewSizeQuantity(1);
                          setAddingSizeForProduct(group.name);
                        }}
                      >
                        <Plus size={15} />
                        <span>Add another size</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}

            {/* Bottom Multi-Size Notification Banner (Matching Reference Image) */}
            <div className="ax-cart-info-banner">
              <div className="ax-cart-info-icon">
                <Tag size={18} />
              </div>
              <div className="ax-cart-info-text">
                <strong>Multiple sizes & quantities are selected for some products.</strong>
                <span>You can edit the size or quantity by clicking the pencil icon or dropdown.</span>
              </div>
              <ChevronRight size={18} className="ax-cart-info-arrow" />
            </div>
          </div>

          {/* Right Column: Order Summary Card (Matching Reference Image) */}
          <div className="ax-summary-column">
            <div className="ax-summary-card">
              <h3 className="ax-summary-title">Order Summary</h3>

              <div className="ax-summary-rows">
                <div className="ax-summary-row">
                  <span>
                    Subtotal ({groupedCart.length} {groupedCart.length === 1 ? 'item' : 'items'})
                  </span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <div className="ax-summary-row">
                  <span>Shipping</span>
                  <strong className="shipping-free">Free</strong>
                </div>

                <div className="ax-summary-divider" />

                <div className="ax-summary-total-row">
                  <span>Total Amount</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
              </div>

              {/* Proceed to Checkout CTA Button */}
              <a
                className="ax-proceed-btn"
                href={generateWhatsAppOrderLink()}
                target="_blank"
                rel="noreferrer"
                title="Proceed to WhatsApp Order Confirmation"
              >
                <Lock size={16} />
                <span>Proceed to Checkout →</span>
              </a>

              {/* Trust Badges in Exact 3 Columns */}
              <div className="ax-trust-grid">
                <div className="ax-trust-col">
                  <ShieldCheck size={20} />
                  <span>
                    Secure
                    <br />
                    Payments
                  </span>
                </div>
                <div className="ax-trust-col">
                  <RotateCcw size={20} />
                  <span>
                    Easy
                    <br />
                    Returns
                  </span>
                </div>
                <div className="ax-trust-col">
                  <Award size={20} />
                  <span>
                    Trusted
                    <br />
                    Quality
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
