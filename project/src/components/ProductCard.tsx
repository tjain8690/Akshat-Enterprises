import { useState, useRef, useMemo, useEffect } from 'react';
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
import { COLOR_HEX, whatsappLink, getProductWhatsAppEnquiry } from '../constants';
import { useNavigate } from 'react-router-dom';

export function ProductImageSlider({
  images,
  name,
  onSwipeChange,
}: {
  images: string[];
  name: string;
  onSwipeChange?: (isSwiping: boolean) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const isSwipingRef = useRef(false);
  const isVerticalScrollRef = useRef(false);
  const lastSwipeTimeRef = useRef(0);
  const ignoreNextClickRef = useRef(false);

  // Filter valid images and deduplicate
  const valid = useMemo(() => {
    const list = images.filter(Boolean);
    return Array.from(new Set(list));
  }, [images]);

  // Intercept and swallow any clicks that fire during or immediately after a touch swipe
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const handleNativeClick = (e: MouseEvent) => {
      const timeSinceSwipe = Date.now() - lastSwipeTimeRef.current;
      if (timeSinceSwipe < 650 || ignoreNextClickRef.current || isSwipingRef.current) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation?.();
        ignoreNextClickRef.current = false;
      }
    };

    el.addEventListener('click', handleNativeClick, { capture: true });
    return () => {
      el.removeEventListener('click', handleNativeClick, { capture: true });
    };
  }, []);

  if (valid.length === 0) return null;
  if (valid.length === 1) {
    return <img src={valid[0]} alt={name} className="product-card-img" draggable={false} />;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (valid.length <= 1) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    isSwipingRef.current = false;
    isVerticalScrollRef.current = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (valid.length <= 1) return;
    if (isVerticalScrollRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    // Detect gesture direction early in the movement
    if (!isSwipingRef.current && !isVerticalScrollRef.current) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
        // User is scrolling the page vertically; let native browser scroll handle it
        isVerticalScrollRef.current = true;
        return;
      }
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
        // User is swiping images horizontally
        isSwipingRef.current = true;
        setIsDragging(true);
        onSwipeChange?.(true);
      }
    }

    if (isSwipingRef.current) {
      // Apply rubber-band resistance when pulling beyond the ends
      let offset = deltaX;
      if ((idx === 0 && deltaX > 0) || (idx === valid.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.3;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (valid.length <= 1) return;

    if (isSwipingRef.current) {
      const elapsed = Date.now() - touchStartTimeRef.current;
      const absOffset = Math.abs(dragOffset);

      // Fast flick or standard drag threshold
      const isFlick = elapsed < 300 && absOffset > 20;
      const isDragThreshold = absOffset > 38;

      if (isFlick || isDragThreshold) {
        if (dragOffset < 0 && idx < valid.length - 1) {
          setIdx((prev) => prev + 1);
        } else if (dragOffset > 0 && idx > 0) {
          setIdx((prev) => prev - 1);
        }
      }

      lastSwipeTimeRef.current = Date.now();
      ignoreNextClickRef.current = true;
    }

    setIsDragging(false);
    setDragOffset(0);
    isVerticalScrollRef.current = false;

    // Block synthetic clicks from firing on card navigation
    setTimeout(() => {
      isSwipingRef.current = false;
      ignoreNextClickRef.current = false;
      onSwipeChange?.(false);
    }, 600);
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    setDragOffset(0);
    isSwipingRef.current = false;
    isVerticalScrollRef.current = false;
    onSwipeChange?.(false);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    const timeSinceSwipe = Date.now() - lastSwipeTimeRef.current;
    if (timeSinceSwipe < 650 || ignoreNextClickRef.current || isSwipingRef.current) {
      e.stopPropagation();
      e.preventDefault();
      ignoreNextClickRef.current = false;
    }
  };

  return (
    <div
      className="card-slider"
      ref={sliderRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClickCapture={handleClickCapture}
    >
      {/* Hardware-accelerated CSS transform track with real-time drag */}
      <div
        className="card-slider-track"
        style={{
          transform: `translateX(calc(-${idx * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
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
          setIdx((prev) => (prev - 1 + valid.length) % valid.length);
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
          setIdx((prev) => (prev + 1) % valid.length);
        }}
        aria-label="Next image"
      >
        <ChevronRight size={14} />
      </button>

      {/* Pagination dots */}
      <div className="slider-dots" onClick={(e) => e.stopPropagation()}>
        {valid.map((_, i) => (
          <button
            type="button"
            key={i}
            className={`slider-dot${i === idx ? ' active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIdx(i);
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

  // Open Product Description Page (when clicking anywhere on card)
  const handleOpenProductDescription = (e?: React.MouseEvent) => {
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

  // Open Popup Container (when clicking the Eye "View" button)
  const handleOpenPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onOpenZoom) {
      onOpenZoom(product);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  // Card / Image click action -> opens product description page
  const isSwipingCardRef = useRef(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSwipingCardRef.current) {
      return;
    }
    const target = e.target as HTMLElement;
    // Don't trigger if user interacted with a button, link, slider control, or input
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    e.stopPropagation();
    handleOpenProductDescription();
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

          {/* 2. View Button -> Opens popup detail container */}
          <button
            type="button"
            className="ax-card-action-btn view"
            onClick={handleOpenPopup}
            aria-label="Quick View Details"
            title="Quick View Details"
          >
            <Eye size={17} />
          </button>

          {/* 3. WhatsApp Enquiry Button */}
          <a
            href={getProductWhatsAppEnquiry(product, cardSize)}
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

        {/* Product Image Slider: Clicking opens product description page */}
        <div
          className="ax-card-img"
          onClick={handleCardClick}
          title="Click to view product details"
        >
          <ProductImageSlider
            images={[product.image, ...(product.images ?? [])]}
            name={product.name}
            onSwipeChange={(swiping) => {
              isSwipingCardRef.current = swiping;
            }}
          />
        </div>
      </div>

      {/* ── Card Body Details ── */}
      <div className="ax-card-body">
        {/* Category Subtitle */}
        <p className="ax-card-cat">{product.department} • {product.category}</p>

        {/* Product Title: Click opens product description page */}
        <h3
          className="ax-card-title"
          onClick={handleCardClick}
          style={{ cursor: 'pointer' }}
          title="Click to view product details"
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
