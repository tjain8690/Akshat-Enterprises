import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  MessageCircle,
  Check,
  Minus,
  Plus,
  Share2,
  ZoomIn,
  Award,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import type { Product, CartItem } from '../types';
import { whatsappLink, whatsappNumber } from '../constants';
import { getProductAngles } from '../components/ProductDetailModal';
import { ProductCard } from '../components/ProductCard';

interface ProductDescriptionPageProps {
  product: Product;
  allProducts: Product[];
  cart: CartItem[];
  wishlist: string[];
  onAddToCart: (product: Product, size: string, quantity?: number) => void;
  onToggleWishlist: (productId: string) => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onNavigateHome: () => void;
  navigateTo: (path: string) => void;
  onOpenZoomModal: (product: Product) => void;
  onOpenQuickAdd?: (product: Product) => void;
  dark?: boolean;
}

export function ProductDescriptionPage({
  product,
  allProducts,
  cart,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onUpdateQuantity,
  onNavigateHome,
  navigateTo,
  onOpenZoomModal,
  onOpenQuickAdd,
  dark,
}: ProductDescriptionPageProps) {
  const angles = getProductAngles(product);
  const [selectedAngleIdx, setSelectedAngleIdx] = useState(0);

  // Available sizes
  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'];

  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes[1] || availableSizes[0] || 'IND 8'
  );

  // Available colors
  const availableColors =
    product.colors && product.colors.length > 0
      ? product.colors
      : ['Stealth Black', 'Desert Tan', 'Slate Olive'];

  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0]);

  // Quantity stepper
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  // Calculate discount percentage
  const discountPercent = useMemo(() => {
    if (!product.originalPrice) return 30; // fallback default
    const orig = parseInt(product.originalPrice.replace(/[^0-9]/g, ''), 10);
    const curr = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(orig) && !isNaN(curr) && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return 30;
  }, [product.originalPrice, product.price]);

  // Related products in same category or department
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(
        (p) =>
          p.id !== product.id &&
          (p.category === product.category || p.department === product.department)
      )
      .slice(0, 4);
  }, [allProducts, product]);

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    onAddToCart(product, selectedSize, quantity);
    const msg = `Hi Akshat Enterprises, I want to purchase this item:
*Product:* ${product.name}
*Price:* ${product.price}
*Size:* ${selectedSize}
*Color:* ${selectedColor}
*Quantity:* ${quantity}
Please confirm availability and shipment details.`;
    window.open(whatsappLink(msg), '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Akshat Enterprises!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const angleLabels = [
    'Angle 1: Front Elevation',
    'Angle 2: Side Profile & Silhouette',
    'Angle 3: Sole & Grip Texture',
    'Angle 4: Macro Craftsmanship & Fit',
  ];

  // Specific description details tailored to categories
  const tailoredDescription = useMemo(() => {
    const dept = (product.department || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();
    const name = product.name;

    if (dept.includes('jacket') || cat.includes('jacket')) {
      return `Engineered for rigorous industrial conditions and modern urban wear, the ${name} combines heavy-duty weather resistance with breathable thermal insulation. Built with reinforced double-needle seam stitching, premium storm flaps, and high-tensile fasteners to provide long-lasting protection against wind, rain, and mechanical wear.`;
    }
    if (dept.includes('cap') || cat.includes('cap') || dept.includes('headwear')) {
      return `Precision-designed for supreme head protection and comfort, the ${name} features impact-absorbing shell architecture, sweat-wicking internal brow bands, and adjustable ergonomic anchoring. Certified for safety standards and all-day workplace resilience.`;
    }
    if (cat.includes('safety') || cat.includes('boot') || cat.includes('mud')) {
      return `Heavy-duty protection meets all-day occupational ergonomics in the ${name}. Crafted from high-density water-repellent leather, steel toe cap impact resistance, puncture-resistant midsoles, and oil/acid resistant deep tread lugs. Engineered to endure extreme worksite conditions without compromising stride comfort.`;
    }
    return `Designed for superior comfort, durability, and versatile street performance, the ${name} brings together premium breathable materials and cushioned shock-absorbing architecture. Finished with reinforced friction zones and an anti-fatigue insole for reliable day-to-night support.`;
  }, [product]);

  return (
    <div className="ax-pdp-page">
      {/* ── Breadcrumb & Navigation Bar ── */}
      <div className="ax-pdp-top-nav">
        <div className="ax-pdp-nav-container">
          <button
            type="button"
            className="ax-pdp-back-btn"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={16} />
            <span>Back to Catalog</span>
          </button>

          <nav className="ax-pdp-breadcrumbs" aria-label="Breadcrumb">
            <button type="button" onClick={onNavigateHome}>Shop</button>
            <span className="sep">/</span>
            <span>{product.department}</span>
            <span className="sep">/</span>
            <span>{product.category}</span>
            <span className="sep">/</span>
            <span className="active">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main Two-Column Showcase Section ── */}
      <div className="ax-pdp-container">
        <div className="ax-pdp-grid">
          {/* ── Left Column: 4-Angle Gallery Showcase ── */}
          <div className="ax-pdp-gallery-col">
            {/* Main Stage Frame */}
            <div className="ax-pdp-main-frame">
              {/* Badges */}
              <div className="ax-pdp-frame-badges">
                {discountPercent > 0 && (
                  <span className="ax-pdp-badge discount">-{discountPercent}% OFF</span>
                )}
                <span className="ax-pdp-badge hot">{product.tag || 'Bestseller'}</span>
              </div>

              {/* Main Image Showcase */}
              <div className="ax-pdp-img-wrap">
                <img
                  src={angles[selectedAngleIdx] || product.image}
                  alt={`${product.name} — ${angleLabels[selectedAngleIdx]}`}
                  className="ax-pdp-main-img"
                />
              </div>

              {/* Current Angle Label */}
              <div className="ax-pdp-angle-label">
                <span>{angleLabels[selectedAngleIdx] || `Photo ${selectedAngleIdx + 1} of 4`}</span>
              </div>
            </div>

            {/* 4 Interactive Angle Thumbnails */}
            <div className="ax-pdp-thumbs">
              {angles.map((angleUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`ax-pdp-thumb-card${idx === selectedAngleIdx ? ' active' : ''}`}
                  onClick={() => setSelectedAngleIdx(idx)}
                >
                  <img src={angleUrl} alt={`Angle ${idx + 1}`} />
                  <span className="thumb-caption">Angle {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Right Column: Product Description & Ordering ── */}
          <div className="ax-pdp-details-col">
            {/* Header info */}
            <div className="ax-pdp-header">
              <span className="ax-pdp-category-tag">
                {product.department} · {product.category}
              </span>
              <h1 className="ax-pdp-title">{product.name}</h1>

              {/* Star Rating & Verified Reviews */}
              <div className="ax-pdp-reviews-row">
                <div className="ax-pdp-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" stroke="#f59e0b" />
                  ))}
                </div>
                <span className="rating-score">5.0</span>
                <span className="review-count">({product.reviewsCount || 42} verified customer reviews)</span>
                <span className="recommend-badge">98% Recommend</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="ax-pdp-price-box">
              <div className="price-main">
                <span className="price-current">{product.price}</span>
                {product.originalPrice && (
                  <del className="price-orig">{product.originalPrice}</del>
                )}
                {discountPercent > 0 && (
                  <span className="price-save">Save {discountPercent}%</span>
                )}
              </div>
              <p className="price-note">
                Inclusive of all GST taxes · Free Express Shipping across India
              </p>
            </div>

            {/* In Stock & Dispatch Status */}
            <div className="ax-pdp-stock-status">
              <span className="status-dot in-stock" />
              <span>In Stock — Ready for same-day dispatch from Navi Mumbai hub</span>
            </div>

            {/* Product Overview & Description */}
            <div className="ax-pdp-desc-section">
              <h3 className="section-label">Product Description & Highlights</h3>
              <p className="desc-text">{tailoredDescription}</p>

              {/* Key Bullet Highlights */}
              <ul className="ax-pdp-feature-list">
                <li>
                  <Check size={16} className="feature-icon" />
                  <span>
                    <strong>Premium Material Grade:</strong> High-density weather & abrasion-resistant construction for extended longevity.
                  </span>
                </li>
                <li>
                  <Check size={16} className="feature-icon" />
                  <span>
                    <strong>Ergonomic Comfort Footbed:</strong> Dual-density cushioning protects joints and reduces fatigue during long shifts.
                  </span>
                </li>
                <li>
                  <Check size={16} className="feature-icon" />
                  <span>
                    <strong>Heavy-Duty Traction:</strong> Reinforced non-slip tread lugs provide reliable grip across oil, water, and uneven gravel.
                  </span>
                </li>
                <li>
                  <Check size={16} className="feature-icon" />
                  <span>
                    <strong>Multi-Angle Certified:</strong> Quality checked across all 4 build dimensions for precision stitching and fit.
                  </span>
                </li>
              </ul>
            </div>

            {/* Color Swatches */}
            <div className="ax-pdp-option-section">
              <div className="option-head">
                <span className="section-label">Select Color:</span>
                <strong className="selected-val">{selectedColor}</strong>
              </div>
              <div className="ax-pdp-color-swatches">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`ax-pdp-color-btn${selectedColor === color ? ' active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    <span
                      className="swatch-circle"
                      style={{
                        backgroundColor:
                          color.toLowerCase().includes('black')
                            ? '#1a1a1a'
                            : color.toLowerCase().includes('tan')
                            ? '#b38b59'
                            : color.toLowerCase().includes('olive') || color.toLowerCase().includes('green')
                            ? '#4b5320'
                            : '#64748b',
                      }}
                    />
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Multi-Size Action */}
            <div className="ax-pdp-option-section ax-pdp-qty-wrap">
              <div className="option-head">
                <span className="section-label">Quantity:</span>
                {onOpenQuickAdd && (
                  <button
                    type="button"
                    className="ax-pdp-multi-size-btn"
                    onClick={() => onOpenQuickAdd(product)}
                    title="Select multiple sizes and quantities for wholesale carton order"
                  >
                    <Layers size={14} />
                    <span>Wholesale Multi-Size Order</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart Actions */}
            <div className="ax-pdp-buy-section">
              <div className="ax-pdp-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="qty-val">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                className={`ax-pdp-add-btn${justAdded ? ' added' : ''}`}
                onClick={() => {
                  if (onOpenQuickAdd) {
                    onOpenQuickAdd(product);
                  } else {
                    handleAddToCartClick();
                  }
                }}
              >
                {justAdded ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Add to Cart
                  </>
                )}
              </button>

              {/* Wishlist Heart */}
              <button
                type="button"
                className={`ax-pdp-wish-btn${isWishlisted ? ' active' : ''}`}
                onClick={() => onToggleWishlist(product.id)}
                title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  size={19}
                  fill={isWishlisted ? '#e5322d' : 'none'}
                  stroke={isWishlisted ? '#e5322d' : 'currentColor'}
                />
              </button>

              {/* Share button */}
              <button
                type="button"
                className="ax-pdp-share-btn"
                onClick={handleShare}
                title="Share product link"
              >
                <Share2 size={17} />
                {copiedLink && <span className="copy-tooltip">Copied!</span>}
              </button>
            </div>

            {/* Direct Order on WhatsApp Only */}
            <div className="ax-pdp-direct-actions">
              <a
                href={whatsappLink(
                  `Hi Akshat Enterprises, I want to order ${product.name} (${product.price}, Color: ${selectedColor}, Qty: ${quantity}). Please share delivery & wholesale details.`
                )}
                target="_blank"
                rel="noreferrer"
                className="ax-pdp-whatsapp-btn"
                title="Direct WhatsApp Order"
              >
                <MessageCircle size={20} />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Trust Assurance Strip */}
            <div className="ax-pdp-perks-strip">
              <div className="perk-item">
                <Truck size={18} />
                <div>
                  <strong>Free Express Delivery</strong>
                  <p>Dispatched within 24 hours</p>
                </div>
              </div>
              <div className="perk-item">
                <RotateCcw size={18} />
                <div>
                  <strong>7 Days Easy Exchange</strong>
                  <p>Hassle-free size replacement</p>
                </div>
              </div>
              <div className="perk-item">
                <ShieldCheck size={18} />
                <div>
                  <strong>100% Genuine Quality</strong>
                  <p>Direct from verified workshop</p>
                </div>
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div className="ax-pdp-specs-box">
              <h4 className="specs-title">Technical Specifications</h4>
              <table className="ax-pdp-specs-table">
                <tbody>
                  <tr>
                    <th>Department</th>
                    <td>{product.department}</td>
                  </tr>
                  <tr>
                    <th>Category</th>
                    <td>{product.category}</td>
                  </tr>
                  <tr>
                    <th>Target Fit</th>
                    <td>Standard Indian/UK sizing, comfort padded ankle</td>
                  </tr>
                  <tr>
                    <th>Sole / Outsole</th>
                    <td>High-abrasion anti-slip molded rubber compound</td>
                  </tr>
                  <tr>
                    <th>Fastening</th>
                    <td>Heavy-duty reinforced eyelet lacing</td>
                  </tr>
                  <tr>
                    <th>Origin</th>
                    <td>Crafted in India · Certified ISO 9001 Facility</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Related Products Row ── */}
        {relatedProducts.length > 0 && (
          <div className="ax-pdp-related-section">
            <div className="related-head">
              <h3>More from {product.department}</h3>
              <p>Explore recommended matching gear curated for this style</p>
            </div>

            <div className="ax-product-grid">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  cart={cart}
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onOpenQuickAdd={onOpenQuickAdd}
                  onUpdateQuantity={onUpdateQuantity}
                  onQuickView={() => onOpenZoomModal(p)}
                  onViewProduct={(id) => navigateTo(`/product-description?id=${id}`)}
                  onOpenZoom={() => onOpenZoomModal(p)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
