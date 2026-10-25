import React, { useState, useEffect, useMemo } from 'react';
import { X, Minus, Plus, Check, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';

interface QuickAddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onBatchAddToCart?: (product: Product, items: { size: string; quantity: number }[]) => void;
  onViewDetails?: (productId: string) => void;
}

export const QuickAddToCartModal: React.FC<QuickAddToCartModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBatchAddToCart,
  onViewDetails,
}) => {
  // Available sizes from product or fallback to standard UK/IND footwear sizes
  const sizes = useMemo(() => {
    if (!product || !product.sizes || product.sizes.length === 0) {
      return ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10'];
    }
    return product.sizes;
  }, [product]);

  // Multi-size quantities dictionary: { 'IND 6': 8, 'IND 7': 10, ... }
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  // Success state on add
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Sync state whenever product changes
  useEffect(() => {
    if (product) {
      const initialMap: Record<string, number> = {};
      sizes.forEach((s) => {
        initialMap[s] = 0;
      });
      setSizeQuantities(initialMap);
      setAddedSuccess(false);
    }
  }, [product, sizes]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll on iOS Safari and desktop while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Numerical price calculations
  const numericPrice = typeof product.price === 'number'
    ? product.price
    : parseInt(String(product.price).replace(/[^0-9]/g, ''), 10) || 999;

  // Wholesale multi-size total count & price
  const totalPairs = Object.values(sizeQuantities).reduce((acc, qty) => acc + (qty || 0), 0);
  const totalPrice = totalPairs * numericPrice;

  const isFootwear = product.department !== 'Jackets' && product.department !== 'Accessories' && product.department !== 'Apparel';
  const unitLabel = isFootwear ? 'pair' : 'item';
  const unitLabelPlural = isFootwear ? 'pairs' : 'items';

  // Handle multi-size quantity changes
  const handleSizeQtyChange = (size: string, delta: number) => {
    setSizeQuantities((prev) => {
      const cur = prev[size] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [size]: next };
    });
  };

  const handleSizeQtyDirectInput = (size: string, val: string) => {
    const num = parseInt(val, 10);
    const validNum = !isNaN(num) ? Math.max(0, Math.min(9999, num)) : 0;
    setSizeQuantities((prev) => ({ ...prev, [size]: validNum }));
  };

  // Quick preset loader
  const setPredefinedBox = (multiplier: number) => {
    setSizeQuantities((prev) => {
      const updated: Record<string, number> = {};
      sizes.forEach((s) => {
        updated[s] = multiplier;
      });
      return updated;
    });
  };

  // Submit handler
  const handleCommitAddToCart = () => {
    let itemsToAdd = Object.entries(sizeQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([size, quantity]) => ({ size, quantity }));

    if (itemsToAdd.length === 0) {
      // If user hasn't selected a count yet, default to 1 unit of first size
      const defaultSz = sizes[0] || 'Standard';
      itemsToAdd = [{ size: defaultSz, quantity: 1 }];
    }

    if (onBatchAddToCart) {
      onBatchAddToCart(product, itemsToAdd);
    } else {
      itemsToAdd.forEach((item) => {
        onAddToCart(product, item.size, item.quantity);
      });
    }

    setAddedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (onViewDetails) {
      onViewDetails(product.id);
    } else {
      window.history.pushState(null, '', `/product-description?id=${product.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formattedPrice = `₹${numericPrice.toLocaleString('en-IN')}`;

  return (
    <div
      className="ax-qa-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-modal-title"
    >
      <div
        className="ax-qa-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button on Top Right */}
        <button
          type="button"
          className="ax-qa-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* ── Product Header Row ── */}
        <div className="ax-qa-header">
          <div className="ax-qa-thumb-wrap">
            <img
              src={product.image}
              alt={product.name}
              className="ax-qa-thumb"
            />
          </div>
          <div className="ax-qa-header-meta">
            <h2 id="qa-modal-title" className="ax-qa-title" title={product.name}>
              {product.name}
            </h2>
            <div className="ax-qa-color-dept">
              <span>Colour: <strong>{product.colors?.[0] || 'Black / Standard'}</strong></span>
              {product.department && <span className="ax-qa-dot">•</span>}
              {product.department && <span>{product.department}</span>}
            </div>
            <a
              href={`/product-description?id=${product.id}`}
              className="ax-qa-details-link"
              onClick={handleDetailsClick}
            >
              See all item details
            </a>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="ax-qa-divider" />

        {/* ── Multiple Selection Options (No headline, modern design) ── */}
        <div className="ax-qa-selection-container">
          <div className="ax-qa-options-list">
            {sizes.map((s) => {
              const qty = sizeQuantities[s] || 0;
              const isSelected = qty > 0;
              const rowSubtotal = qty * numericPrice;

              return (
                <div
                  key={s}
                  className={`ax-qa-option-row${isSelected ? ' is-selected' : ''}`}
                >
                  <div className="ax-qa-option-info">
                    <span className="ax-qa-size-pill">{s}</span>
                    <span className="ax-qa-rate-text">{formattedPrice} / {unitLabel}</span>
                  </div>

                  <div className="ax-qa-option-controls">
                    <div className="ax-qa-modern-stepper">
                      <button
                        type="button"
                        onClick={() => handleSizeQtyChange(s, -1)}
                        disabled={qty <= 0}
                        className="ax-qa-step-btn"
                        aria-label={`Decrease ${s}`}
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="9999"
                        value={qty === 0 ? '' : qty}
                        placeholder="0"
                        onChange={(e) => handleSizeQtyDirectInput(s, e.target.value)}
                        className="ax-qa-step-val"
                        aria-label={`Quantity for ${s}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleSizeQtyChange(s, 1)}
                        className="ax-qa-step-btn ax-qa-step-btn-plus"
                        aria-label={`Increase ${s}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="ax-qa-row-subtotal">
                      {isSelected ? (
                        <span className="ax-qa-subtotal-tag">
                          ₹{rowSubtotal.toLocaleString('en-IN')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Carton Presets */}
          <div className="ax-qa-presets-wrap">
            <span className="ax-qa-presets-label">Presets:</span>
            <div className="ax-qa-presets-group">
              <button
                type="button"
                className="ax-qa-preset-pill"
                onClick={() => setPredefinedBox(6)}
              >
                6 {unitLabelPlural}
              </button>
              <button
                type="button"
                className="ax-qa-preset-pill"
                onClick={() => setPredefinedBox(10)}
              >
                10 {unitLabelPlural}
              </button>
              <button
                type="button"
                className="ax-qa-preset-pill"
                onClick={() => setPredefinedBox(12)}
              >
                12 {unitLabelPlural}
              </button>
              <button
                type="button"
                className="ax-qa-preset-pill reset"
                onClick={() => setPredefinedBox(0)}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Modern Live Summary */}
          {totalPairs > 0 && (
            <div className="ax-qa-modern-summary">
              <div className="ax-qa-summary-stat">
                <span className="ax-qa-summary-muted">Total Selected:</span>
                <span className="ax-qa-summary-value">{totalPairs} {totalPairs === 1 ? unitLabel : unitLabelPlural}</span>
              </div>
              <div className="ax-qa-summary-stat">
                <span className="ax-qa-summary-muted">Wholesale Total:</span>
                <span className="ax-qa-summary-price">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="ax-qa-footer-actions">
          <button
            type="button"
            className="ax-qa-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`ax-qa-add-btn${addedSuccess ? ' success' : ''}`}
            onClick={handleCommitAddToCart}
          >
            {addedSuccess ? (
              <>
                <Check size={18} /> Added to Cart!
              </>
            ) : totalPairs > 0 ? (
              <>
                <ShoppingBag size={18} /> Add {totalPairs} {totalPairs === 1 ? unitLabel : unitLabelPlural} to Cart • ₹{totalPrice.toLocaleString('en-IN')}
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
