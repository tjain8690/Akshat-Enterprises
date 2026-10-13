import { useState, useEffect } from 'react';
import {
  X,
  Star,
  Minus,
  Plus,
  Heart,
  Truck,
  ShoppingCart,
  Check,
  Footprints,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import type { Product } from '../types';
import { whatsappLink } from '../constants';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity?: number) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

/**
 * Returns at least 4 photos with different angles for any product.
 */
export function getProductAngles(product: Product): string[] {
  const images = [product.image, ...(product.images || [])].filter(Boolean);
  if (images.length >= 4) return images;

  // Curated angle fallback photos based on category/department to guarantee 4 angles
  const shoeAngles = [
    '/images/sport_shoes_lifestyle.jpg',
    '/images/black_sneakers_product.jpg',
    '/images/brown_boots_product.jpg',
    '/images/Leather_image.jpg',
  ];
  const jacketAngles = [
    '/images/jacket.png',
    '/images/tool_kjacket.png',
    '/images/top_jacket.png',
    '/images/used_jacket.png',
  ];
  const capAngles = [
    '/images/category_cap.jpg',
    '/images/category_accessories.jpg',
    '/images/image.png',
    '/images/image copy.png',
  ];

  const pool =
    product.department === 'Jackets'
      ? jacketAngles
      : product.department === 'Accessories'
      ? capAngles
      : shoeAngles;

  const result = [...images];
  for (const angle of pool) {
    if (result.length >= 4) break;
    if (!result.includes(angle)) {
      result.push(angle);
    }
  }
  return result;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductDetailModalProps) {
  const angles = getProductAngles(product);
  const [selectedAngleIdx, setSelectedAngleIdx] = useState(0);

  // Default sizes: if product.sizes exists use them, otherwise footwear numeric sizes like in design (40, 41, 42...)
  const defaultSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ['40', '41', '42', '43', '44', '45', '46', '47'];

  const [selectedSize, setSelectedSize] = useState<string>(
    defaultSizes[1] || defaultSizes[0] || '41'
  );
  const [sizeUnit, setSizeUnit] = useState<'EU' | 'US' | 'CM'>('EU');

  // Color options
  const defaultColors =
    product.colors && product.colors.length > 0
      ? product.colors
      : ['Green', 'Stealth Grey', 'Tan Coral'];
  const [selectedColor, setSelectedColor] = useState<string>(defaultColors[0]);

  // Quantity stepper
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    onAddToCart(product, selectedSize, quantity);
    // Instant direct WhatsApp order confirmation
    const message = `Hi Akshat Enterprises, I would like to buy:
Product: ${product.name}
Price: ${product.price}
Quantity: ${quantity}
Size: ${selectedSize} (${sizeUnit})
Color: ${selectedColor}
Please confirm availability and dispatch!`;
    window.open(whatsappLink(message), '_blank');
    onClose();
  };

  // Dynamic light tint background for the main product view (matches design photo)
  const bgTint =
    selectedColor.toLowerCase().includes('green') ||
    product.name.toLowerCase().includes('relax')
      ? '#eef7d5'
      : '#f3f4ea';

  return (
    <div
      className="ax-detail-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
    >
      <div
        className="ax-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header / Breadcrumbs & Close ── */}
        <div className="ax-detail-topbar">
          <nav className="ax-detail-breadcrumbs" aria-label="Breadcrumb">
            <span>Shop</span>
            <span className="ax-breadcrumb-sep">›</span>
            <span>{product.department || 'Best Shoes'}</span>
            <span className="ax-breadcrumb-sep">›</span>
            <strong>{product.name}</strong>
          </nav>
          <button
            type="button"
            className="ax-detail-close-btn"
            onClick={onClose}
            aria-label="Close product details"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Main Two-Column Product Details Grid ── */}
        <div className="ax-detail-grid">
          {/* ── Left Column: Main Photo & 4 Angle Thumbnails ── */}
          <div className="ax-detail-gallery">
            {/* Big Main Angle Photo */}
            <div
              className="ax-detail-main-frame"
              style={{ backgroundColor: bgTint }}
            >
              <img
                src={angles[selectedAngleIdx] || product.image}
                alt={`${product.name} - Angle ${selectedAngleIdx + 1}`}
                className="ax-detail-main-img"
              />
            </div>

            {/* Row of 4 Different Angle Photos */}
            <div className={`ax-detail-thumbs-row${angles.length > 4 ? ' has-more' : ''}`}>
              {angles.slice(0, 4).map((thumbUrl, idx) => (
                <button
                  key={`angle-${idx}`}
                  type="button"
                  className={`ax-detail-thumb-tile${idx === selectedAngleIdx ? ' active' : ''}`}
                  onClick={() => setSelectedAngleIdx(idx)}
                  aria-label={`View angle photo ${idx + 1}`}
                >
                  <img src={thumbUrl} alt={`Angle ${idx + 1}`} />
                </button>
              ))}

              {/* Optional "+ 4more" tile if there are additional photos */}
              {angles.length > 4 && (
                <button
                  type="button"
                  className="ax-detail-more-tile"
                  onClick={() =>
                    setSelectedAngleIdx((prev) => (prev + 1) % angles.length)
                  }
                  title="Next photo angle"
                >
                  +{angles.length - 4} more
                </button>
              )}
            </div>
          </div>

          {/* ── Right Column: Info, Price, Color, Sizes & Actions ── */}
          <div className="ax-detail-info">
            {/* Brand Header Chip */}
            <div className="ax-detail-brand-badge">
              <span className="ax-brand-icon-box">
                <Footprints size={15} />
              </span>
              <span className="ax-brand-badge-name">
                {product.department === 'Jackets'
                  ? 'APEX Workwear'
                  : 'PulseSneaks'}
              </span>
            </div>

            {/* Product Title */}
            <h1 id="product-detail-title" className="ax-detail-title">
              {product.name}
            </h1>

            {/* Star Rating & Review Count */}
            <div className="ax-detail-reviews-row">
              <div className="ax-detail-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill="#f59e0b"
                    stroke="#f59e0b"
                  />
                ))}
              </div>
              <span className="ax-detail-review-count">
                {product.reviewsCount ? `${product.reviewsCount}k+` : '25k+'} Total Reviews
              </span>
            </div>

            {/* Product Description */}
            <div className="ax-detail-desc-block">
              <h3 className="ax-detail-desc-heading">Product Description</h3>
              <p className="ax-detail-desc-text">
                Sleek and stylish, these {product.category.toLowerCase()} feature a breathable build
                for comfort and a cushioned sole for all-day support, making them perfect for both
                casual outings and active adventures. Built with durable high-traction materials
                for an exceptional look and feel.
              </p>
            </div>

            {/* Big Bold Price Display */}
            <div className="ax-detail-price-row">
              <strong className="ax-detail-price">{product.price}</strong>
              {product.originalPrice && (
                <del className="ax-detail-orig-price">{product.originalPrice}</del>
              )}
            </div>

            {/* Color Selection with Swatches */}
            <div className="ax-detail-color-section">
              <div className="ax-detail-color-header">
                <span>Color</span>
                <span className="ax-breadcrumb-sep">›</span>
                <strong className="ax-detail-active-color">{selectedColor}</strong>
              </div>
              <div className="ax-detail-color-swatches">
                {defaultColors.slice(0, 3).map((col, idx) => (
                  <button
                    key={col}
                    type="button"
                    className={`ax-detail-color-btn${selectedColor === col ? ' active' : ''}`}
                    onClick={() => {
                      setSelectedColor(col);
                      // Switch to another angle or image to reflect color change
                      if (angles[idx]) setSelectedAngleIdx(idx % angles.length);
                    }}
                    title={`Select color: ${col}`}
                  >
                    <img
                      src={angles[idx % angles.length] || product.image}
                      alt={col}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Chart Header & Unit Switcher */}
            <div className="ax-detail-size-section">
              <div className="ax-detail-size-header">
                <button
                  type="button"
                  className="ax-detail-size-chart-link"
                  onClick={() => setShowSizeChart(!showSizeChart)}
                >
                  Size Chart
                </button>
                <div className="ax-detail-unit-pills">
                  {(['EU', 'US', 'CM'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      className={`ax-detail-unit-pill${sizeUnit === unit ? ' active' : ''}`}
                      onClick={() => setSizeUnit(unit)}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Chart Popup Helper */}
              {showSizeChart && (
                <div className="ax-detail-chart-tooltip">
                  <small>
                    Standard sizing guide: EU 40 ≈ IND 6 · EU 41 ≈ IND 7 · EU 42 ≈ IND 8 · EU 43 ≈ IND 9 · EU 44 ≈ IND 10.
                  </small>
                </div>
              )}

              {/* Grid of Rounded Size Buttons */}
              <div className="ax-detail-sizes-grid">
                {defaultSizes.map((size) => {
                  const cleanSize = size.replace('IND ', '');
                  const isSelected = selectedSize === size || selectedSize === cleanSize;
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`ax-detail-size-btn${isSelected ? ' active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {cleanSize}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper Pill */}
            <div className="ax-detail-stepper-wrap">
              <div className="ax-detail-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="ax-detail-stepper-val">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Action Buttons Row: Buy Now + Add To Cart + Wishlist */}
            <div className="ax-detail-actions-row">
              <button
                type="button"
                className="ax-detail-buy-btn"
                onClick={handleBuyNow}
              >
                <Zap size={16} /> Buy Now
              </button>

              <button
                type="button"
                className={`ax-detail-cart-btn${justAdded ? ' added' : ''}`}
                onClick={handleAddToCartClick}
              >
                {justAdded ? (
                  <>
                    <Check size={16} /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} /> Add To Cart
                  </>
                )}
              </button>

              <button
                type="button"
                className={`ax-detail-wish-btn${isWishlisted ? ' active' : ''}`}
                onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                title="Wishlist"
              >
                <Heart
                  size={19}
                  fill={isWishlisted ? '#e5322d' : 'none'}
                  stroke={isWishlisted ? '#e5322d' : 'currentColor'}
                />
              </button>
            </div>

            {/* Free Delivery Notice */}
            <div className="ax-detail-delivery-note">
              <Truck size={15} />
              <span>Free Delivery On Orders Over ₹999 · Turbhe Store Pickup Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
