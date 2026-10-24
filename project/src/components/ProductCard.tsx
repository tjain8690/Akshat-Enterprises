import { useState, useRef, useMemo } from 'react';
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
  Check,
} from 'lucide-react';
import type { Product, CartItem } from '../types';
import { COLOR_HEX, whatsappLink } from '../constants';
import { useNavigate } from 'react-router-dom';

export function ProductImageSlider({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isSwipingRef = useRef(false);

  // Filter valid images and deduplicate
  const valid = useMemo(() => {
    const list = images.filter(Boolean);
    return Array.from(new Set(list));
  }, [images]);

  if (valid.length === 0) return null;
  if (valid.length === 1) {
    return <img src={valid[0]} alt={name} className="product-card-img" draggable={false} />;
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth > 0) {
      const current = Math.round(el.scrollLeft / el.clientWidth);
      if (current !== idx && current >= 0 && current < valid.length) {
        setIdx(current);
      }
    }
  };

  const scrollToIdx = (targetIdx: number) => {
    const nextIdx = (targetIdx + valid.length) % valid.length;
    setIdx(nextIdx);
    if (trackRef.current) {
      const width = trackRef.current.clientWidth;
      trackRef.current.scrollTo({
        left: nextIdx * width,
        behavior: 'smooth',
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diffX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
    const diffY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
    if (diffX > 8 && diffX > diffY) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (isSwipingRef.current) {
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 200);
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // If the touch was a horizontal swipe gesture, intercept click so modal isn't opened while swiping
    if (isSwipingRef.current) {
      e.stopPropagation();
      e.preventDefault();
      isSwipingRef.current = false;
    }
  };

  return (
    <div className="card-slider">
      {/* Horizontal smooth-scroll snap track for direct mobile touch swiping */}
      <div
        className="card-slider-track"
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClickCapture={handleClickCapture}
      >
        {valid.map((src, i) => (
          <div className="card-slider-slide" key={`${src}-${i}`}>
            <img
              src={src}
              alt={`${name} — view ${i + 1}`}
              className="product-card-img"
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next controls for desktop */}
      <button
        type="button"
        className="slider-arrow slider-prev"
        onClick={(e) => {
          e.stopPropagation();
          scrollToIdx(idx - 1);
        }}
        aria-label="Previous image"
      >
        <ChevronLeft size={14} />
      </button>

      <button
        type="button"
        className="slider-arrow slider-next"
        onClick={(e) => {
          e.stopPropagation();
          scrollToIdx(idx + 1);
        }}
        aria-label="Next image"
      >
        <ChevronRight size={14} />
      </button>

      {/* Pagination dots */}
      <div className="slider-dots">
        {valid.map((_, i) => (
          <button
            type="button"
            key={i}
            className={`slider-dot${i === idx ? ' active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              scrollToIdx(i);
            }}
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
  onOpenQuickAdd?: (product: Product) => void;
  onUpdateQuantity?: (index: number, delta: number) => void;
  onQuickView?: (product: Product) => void;
  onOpenZoom?: (product: Product) => void;
  onViewProduct?: (productId: string) => void;
  showDetails?: boolean;
}

export function ProductCard({
  product,
  cart,
  wishlist = [],
  onToggleWishlist,
  onAddToCart,
  onOpenQuickAdd,
  onUpdateQuantity,
  onQuickView,
  onOpenZoom,
  onViewProduct,
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
    if (onOpenQuickAdd) {
      onOpenQuickAdd(product);
      return;
    }
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

  // View button action -> redirects directly to /product-description page
  const handleViewDescription = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (onViewProduct) {
      onViewProduct(product.id);
    } else {
      window.history.pushState(null, '', `/product-description?id=${product.id}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Card / Image click action -> opens popup container showing clean images and details (Image 2)
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't trigger popup if user interacted with a button, link, slider control, or input
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    e.stopPropagation();
    if (onOpenZoom) {
      onOpenZoom(product);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <article
      className="ax-card"
      id={`product-${product.id}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* ── Card Media & Badges ── */}
      <div className="ax-card-media">
        {/* Left Badge: Hot / Discount / Tag */}
        {discountPercent ? (
          <span className="ax-card-badge discount">-{discountPercent}%</span>
        ) : product.tag ? (
          <span className="ax-card-badge">{product.tag}</span>
        ) : (
          <span className="ax-card-badge">Hot</span>
        )}

        {/* Right Floating Actions Column (Wishlist, Quick View, WhatsApp) - matching reference layout */}
        <div className="ax-card-media-actions" onClick={(e) => e.stopPropagation()}>
          {/* 1. Wishlist Heart Button */}
          <button
            type="button"
            className={`ax-card-action-btn wish${isWishlisted ? ' active' : ''}`}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title="Wishlist"
          >
            <Heart
              size={17}
              fill={isWishlisted ? '#e5322d' : 'none'}
              stroke={isWishlisted ? '#e5322d' : 'currentColor'}
            />
          </button>

          {/* 2. View Product Description Button (Redirects to /product-description) */}
          <button
            type="button"
            className="ax-card-action-btn view"
            onClick={handleViewDescription}
            aria-label="View Product Details"
            title="View Product Description"
          >
            <Eye size={17} />
          </button>

          {/* 3. WhatsApp Enquiry Button */}
          <a
            href={whatsappLink(
              `Hi Akshat Enterprises, I want to enquire about ${product.name} (${product.price}, Size: ${cardSize}). Please share stock & delivery details.`
            )}
            target="_blank"
            rel="noreferrer"
            className="ax-card-action-btn whatsapp"
            onClick={(e) => e.stopPropagation()}
            aria-label="Enquire on WhatsApp"
            title="Chat on WhatsApp"
          >
            <MessageCircle size={17} />
          </a>
        </div>

        {/* Product Image Slider: Clicking opens the clean Preview Popup */}
        <div
          className="ax-card-img"
          onClick={handleCardClick}
          title="Click to preview photos & angles"
        >
          <ProductImageSlider
            images={[product.image, ...(product.images ?? [])]}
            name={product.name}
          />
        </div>
      </div>

      {/* ── Card Body Details ── */}
      <div className="ax-card-body">
        {/* Category Subtitle */}
        <p className="ax-card-cat">{product.department} • {product.category}</p>

        {/* Product Title: Click opens product details modal */}
        <h3
          className="ax-card-title"
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
          title="View product details"
        >
          {product.name}
        </h3>

        {/* 5-Star Rating */}
        <div className="ax-card-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill="#f59e0b"
                stroke="#f59e0b"
              />
            ))}
          </div>
          <span>{product.rating || 4.9} ({product.reviewsCount || 14} reviews)</span>
        </div>


        {/* Footer: Price on left + Add to Cart Pill Button on right */}
        <div className="ax-card-foot">
          <div className="ax-card-price">
            {product.originalPrice && <del>{product.originalPrice}</del>}
            <strong>{product.price}</strong>
          </div>

          {cartEntry ? (
            <div className="ax-stepper" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onUpdateQuantity && onUpdateQuantity(cartIdx, -1)}
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span>{cartEntry.quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity && onUpdateQuantity(cartIdx, 1)}
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`ax-card-add-btn${justAdded ? ' added' : ''}`}
              onClick={handleAdd}
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <span>{justAdded ? 'Added ✓' : 'Add to Cart'}</span>
              {justAdded ? <Check size={15} /> : <ShoppingCart size={15} />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
