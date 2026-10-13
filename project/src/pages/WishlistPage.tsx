import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
  Eye,
  MessageCircle,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import type { Product, CartItem } from '../types';
import { whatsappLink, shareToWhatsAppLink } from '../constants';

interface WishlistPageProps {
  wishlist: string[];
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, size?: string, quantity?: number) => void;
  onToggleWishlist: (productId: string) => void;
  onClearWishlist?: () => void;
  onNavigateHome: () => void;
  onQuickView?: (product: Product) => void;
  dark?: boolean;
}

export function WishlistPage({
  wishlist,
  products,
  cart: _cart,
  onAddToCart,
  onToggleWishlist,
  onClearWishlist,
  onNavigateHome,
  onQuickView,
  dark: _dark,
}: WishlistPageProps) {
  // Find products that match wishlist IDs
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  // Selected size per product
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [allAdded, setAllAdded] = useState(false);

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAdd = (product: Product) => {
    const chosenSize = selectedSizes[product.id] || product.sizes?.[0] || 'IND 8';
    onAddToCart(product, chosenSize, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach((p) => {
      const chosenSize = selectedSizes[p.id] || p.sizes?.[0] || 'IND 8';
      onAddToCart(p, chosenSize, 1);
    });
    setAllAdded(true);
    setTimeout(() => setAllAdded(false), 2500);
  };

  const generateWishlistMessage = (forOwner: boolean) => {
    let msg = forOwner
      ? `*Hi Akshat Enterprises, I have selected these ${wishlistedProducts.length} items from your catalog for bulk order / quotation:*\n\n`
      : `📦 *MY SAVED FOOTWEAR WISHLIST LIST*\n🏢 Akshat Enterprises Catalog\n📅 Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n`;

    wishlistedProducts.forEach((item, idx) => {
      const chosenSize = selectedSizes[item.id] || item.sizes?.[0] || 'Standard';
      msg += `${idx + 1}. *${item.name}*\n`;
      msg += `   • Category: ${item.category}\n`;
      msg += `   • Size: ${chosenSize}\n`;
      msg += `   • Price: ${item.price}\n\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 *Total Selected:* ${wishlistedProducts.length} ${wishlistedProducts.length === 1 ? 'item' : 'items'}\n`;
    if (forOwner) {
      msg += `Please check sizes, stock availability, and share wholesale pricing details. Thank you!`;
    } else {
      msg += `Akshat Enterprises • Janta Market, Turbhe, Navi Mumbai`;
    }
    return msg;
  };

  const handleCopyWishlist = () => {
    const text = generateWishlistMessage(false);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="ax-wishlist-page">
      <div className="ax-container">
        {/* Top Navigation & Header */}
        <div className="ax-wishlist-topbar">
          <button
            type="button"
            className="ax-wishlist-back-btn"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={16} /> Back to Store
          </button>

          <div className="ax-wishlist-heading-wrap">
            <div className="ax-wishlist-title-row">
              <span className="ax-wishlist-icon-pill">
                <Heart size={20} fill="#e5322d" stroke="#e5322d" />
              </span>
              <h1 className="ax-wishlist-title">My Wishlist</h1>
              {wishlistedProducts.length > 0 && (
                <span className="ax-wishlist-count-badge">
                  {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="ax-wishlist-subtitle">
              Your saved footwear and apparel essentials. Save to your own WhatsApp, or send directly to Akshat Enterprises for quotation.
            </p>
          </div>

          {wishlistedProducts.length > 0 && onClearWishlist && (
            <button
              type="button"
              className="ax-wishlist-clear-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your wishlist?')) {
                  onClearWishlist();
                }
              }}
            >
              <Trash2 size={14} /> Clear Wishlist
            </button>
          )}
        </div>

        {/* ── RETAILER BULK ACTIONS STRIP ── */}
        {wishlistedProducts.length > 0 && (
          <div className="ax-wishlist-retailer-panel">
            <div className="ax-retailer-panel-header">
              <div>
                <strong>Retailer &amp; Buyer Quick Actions ({wishlistedProducts.length} items)</strong>
                <p>Export your selection straight to WhatsApp or move all to cart without login.</p>
              </div>
            </div>
            <div className="ax-retailer-panel-buttons">
              <a
                className="ax-retailer-btn ax-retailer-wa-owner"
                href={whatsappLink(generateWishlistMessage(true))}
                target="_blank"
                rel="noreferrer"
                title="Send whole list directly to Akshat Enterprises (8690041886)"
              >
                <MessageCircle size={17} /> Send Inquiry to Store (WhatsApp)
              </a>

              <a
                className="ax-retailer-btn ax-retailer-wa-self"
                href={shareToWhatsAppLink(generateWishlistMessage(false))}
                target="_blank"
                rel="noreferrer"
                title="Opens WhatsApp so you can send/save to 'Message Yourself' or your notes"
              >
                <Share2 size={16} /> Save List to My WhatsApp
              </a>

              <button
                type="button"
                className="ax-retailer-btn ax-retailer-cart-all"
                onClick={handleAddAllToCart}
              >
                <ShoppingCart size={16} /> {allAdded ? 'All Added to Cart!' : 'Add All to Cart'}
              </button>

              <button
                type="button"
                className="ax-retailer-btn ax-retailer-copy"
                onClick={handleCopyWishlist}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied to Clipboard!' : 'Copy List Text'}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {wishlistedProducts.length === 0 ? (
          <div className="ax-wishlist-empty-card">
            <div className="ax-wishlist-empty-circle">
              <Heart size={44} stroke="#e5322d" strokeWidth={1.5} />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>
              Explore our trending collections, discover high-performance footwear, jackets, and accessories, and tap the heart icon to save your favorites!
            </p>
            <button
              type="button"
              className="ax-btn ax-btn-dark ax-wishlist-explore-btn"
              onClick={onNavigateHome}
            >
              Discover Collections <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="ax-wishlist-grid">
            {wishlistedProducts.map((product) => {
              const currentSize =
                selectedSizes[product.id] || product.sizes?.[0] || 'IND 8';
              const isAdded = !!addedIds[product.id];

              return (
                <article key={product.id} className="ax-wishlist-card">
                  {/* Card Media */}
                  <div
                    className="ax-wishlist-media"
                    onClick={() => onQuickView && onQuickView(product)}
                  >
                    {product.tag && (
                      <span className="ax-card-badge">{product.tag}</span>
                    )}

                    {/* Remove Heart Button */}
                    <button
                      type="button"
                      className="ax-wishlist-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product.id);
                      }}
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>

                    <img
                      src={product.image}
                      alt={product.name}
                      className="ax-wishlist-img"
                    />

                    {onQuickView && (
                      <button
                        type="button"
                        className="ax-wishlist-quick-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                      >
                        <Eye size={13} /> View 4 Angles
                      </button>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="ax-wishlist-body">
                    <span className="ax-wishlist-cat">
                      {product.department} · {product.category}
                    </span>

                    <h3
                      className="ax-wishlist-product-name"
                      onClick={() => onQuickView && onQuickView(product)}
                    >
                      {product.name}
                    </h3>

                    {/* Price Row */}
                    <div className="ax-wishlist-price-row">
                      <strong className="ax-wishlist-price">{product.price}</strong>
                      {product.originalPrice && (
                        <span className="ax-wishlist-orig-price">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="ax-wishlist-sizes-wrap">
                        <span className="ax-wishlist-size-label">Size:</span>
                        <div className="ax-wishlist-sizes-list">
                          {product.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`ax-wishlist-size-pill${currentSize === s ? ' active' : ''}`}
                              onClick={() => handleSizeSelect(product.id, s)}
                            >
                              {s.replace('IND ', '')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="ax-wishlist-actions">
                      <button
                        type="button"
                        className={`ax-wishlist-cart-btn${isAdded ? ' added' : ''}`}
                        onClick={() => handleAdd(product)}
                      >
                        <ShoppingCart size={15} />
                        {isAdded ? 'Added to Cart!' : 'Add to Cart'}
                      </button>

                      <a
                        href={whatsappLink(
                          `Hi Akshat Enterprises, I have saved ${product.name} (${product.price}, Size: ${currentSize}) in my wishlist. Please share order details.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="ax-wishlist-wa-btn"
                        title="Direct WhatsApp Enquiry"
                      >
                        <MessageCircle size={15} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Trust Guarantee Perks */}
        <div className="ax-wishlist-perks">
          <div className="ax-perk-item">
            <Truck size={20} />
            <div>
              <strong>Fast Store Dispatch</strong>
              <p>Free delivery on orders over ₹999 across Mumbai & Navi Mumbai</p>
            </div>
          </div>
          <div className="ax-perk-item">
            <ShieldCheck size={20} />
            <div>
              <strong>100% Genuine Quality</strong>
              <p>Direct from Akshat Enterprises APEX Turbhe Store</p>
            </div>
          </div>
          <div className="ax-perk-item">
            <Sparkles size={20} />
            <div>
              <strong>Instant WhatsApp Help</strong>
              <p>Dedicated customer support & custom bulk footwear sizing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
