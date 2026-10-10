import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from 'lucide-react';
import type { Product, CartItem } from '../types';
import { COLOR_HEX, whatsappLink } from '../constants';
import { useNavigate } from 'react-router-dom';

export function ProductImageSlider({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const valid = images.filter(Boolean);
  if (valid.length === 0) return null;
  if (valid.length === 1) return <img src={valid[0]} alt={name} className="product-card-img" />;
  return (
    <div className="card-slider" onClick={(e) => e.stopPropagation()}>
      <img src={valid[idx]} alt={`${name} — view ${idx + 1}`} className="product-card-img" />
      <button
        type="button"
        className="slider-arrow slider-prev"
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + valid.length) % valid.length); }}
        aria-label="Previous image"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        type="button"
        className="slider-arrow slider-next"
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % valid.length); }}
        aria-label="Next image"
      >
        <ChevronRight size={14} />
      </button>
      <div className="slider-dots">
        {valid.map((_, i) => (
          <button
            type="button"
            key={i}
            className={`slider-dot${i === idx ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  cart: CartItem[];
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  onAddToCart?: (product: Product, size: string) => void;
  onUpdateQuantity?: (index: number, delta: number) => void;
  onQuickView?: (product: Product) => void;
  showDetails?: boolean;
}

export function ProductCard({
  product,
  cart,
  wishlist = [],
  onToggleWishlist,
  onAddToCart,
  onUpdateQuantity,
  onQuickView,
  showDetails = true,
}: ProductCardProps) {
  const navigate = useNavigate();
  const [cardSize, setCardSize] = useState<string>(product.sizes?.[0] || 'IND 8');
  const [justAdded, setJustAdded] = useState(false);

  // Cart matching (by name and optional size)
  const cartIdx = cart.findIndex((i) => i.name === product.name && (!i.selectedSize || i.selectedSize === cardSize));
  const cartEntry = cartIdx >= 0 ? cart[cartIdx] : null;

  const isWishlisted = wishlist.includes(product.id);

  // Calculate discount percentage if originalPrice exists
  const discountPercent = (() => {
    if (!product.originalPrice) return null;
    const orig = parseInt(product.originalPrice.replace(/[^0-9]/g, ''), 10);
    const curr = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(orig) && !isNaN(curr) && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return null;
  })();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, cardSize);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  return (
    <article className="porto-product-card" id={`product-${product.id}`}>
      {/* ── Card Image Frame ── */}
      <div className="porto-card-media">
        {/* Badges */}
        <div className="porto-badge-stack">
          {discountPercent ? (
            <span className="porto-badge porto-badge-discount">-{discountPercent}%</span>
          ) : product.tag ? (
            <span className="porto-badge porto-badge-tag">{product.tag}</span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`porto-wishlist-btn${isWishlisted ? ' active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title="Wishlist"
        >
          <Heart size={15} fill={isWishlisted ? '#f04c32' : 'none'} stroke={isWishlisted ? '#f04c32' : 'currentColor'} />
        </button>

        {/* Image / Image Slider */}
        <div className="porto-card-img-wrap">
          <ProductImageSlider images={[product.image, ...(product.images ?? [])]} name={product.name} />
        </div>

        {/* ── Slide-up Hover Action Bar (Signature Porto style) ── */}
        <div className="porto-hover-actions">
          {cartEntry ? (
            <div className="porto-qty-stepper" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="porto-qty-btn"
                onClick={() => onUpdateQuantity && onUpdateQuantity(cartIdx, -1)}
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="porto-qty-val">{cartEntry.quantity} in Cart</span>
              <button
                type="button"
                className="porto-qty-btn"
                onClick={() => onUpdateQuantity && onUpdateQuantity(cartIdx, 1)}
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`porto-add-cart-slide-btn${justAdded ? ' added' : ''}`}
              onClick={handleAdd}
            >
              <ShoppingCart size={15} />
              <span>{justAdded ? 'ADDED TO CART ✓' : 'ADD TO CART'}</span>
            </button>
          )}

          {onQuickView && (
            <button
              type="button"
              className="porto-quickview-btn"
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              aria-label="Quick View"
              title="Quick view"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Card Body Details ── */}
      <div className="porto-card-body">
        {/* Category Header */}
        <p className="porto-card-category">{product.department} · {product.category}</p>

        {/* Product Title */}
        <h3 className="porto-card-title">{product.name}</h3>

        {/* Star Rating */}
        <div className="porto-rating-row" aria-label={`Rating ${product.rating || 5} out of 5 stars`}>
          <div className="porto-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className="porto-star"
                fill="#f59e0b"
                stroke="#f59e0b"
              />
            ))}
          </div>
          <span className="porto-review-count">({product.reviewsCount || 12})</span>
        </div>

        {/* Price Row (Strikethrough original price + bold current price) */}
        <div className="porto-price-row">
          {product.originalPrice && (
            <span className="porto-orig-price">{product.originalPrice}</span>
          )}
          <strong className="porto-current-price">{product.price}</strong>
        </div>

        {/* Inline Size Pills */}
        {showDetails && product.sizes && product.sizes.length > 0 && (
          <div className="porto-size-pills">
            {product.sizes.slice(0, 5).map((s) => (
              <button
                type="button"
                key={s}
                className={`porto-size-pill${cardSize === s ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setCardSize(s); }}
              >
                {s.replace('IND ', '')}
              </button>
            ))}
            {product.sizes.length > 5 && (
              <span className="porto-size-more">+{product.sizes.length - 5}</span>
            )}
          </div>
        )}

        {/* Card Footer: WhatsApp Direct Action */}
        <div className="porto-card-footer">
          <a
            className="porto-enquire-link"
            href={whatsappLink(
              `Hi Akshat Enterprises, I want to enquire about ${product.name} (${product.price}, Size: ${cardSize}). Please share stock & delivery details.`
            )}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={13} /> Enquire on WhatsApp
          </a>

          {cartEntry && (
            <button
              type="button"
              className="porto-view-cart-btn"
              onClick={() => navigate('/cart')}
            >
              View Cart →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
