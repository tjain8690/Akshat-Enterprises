import { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ExternalLink,
  MessageCircle,
  Check,
} from 'lucide-react';
import type { Product } from '../types';
import { getProductAngles } from './ProductDetailModal';
import { whatsappLink, getProductWhatsAppEnquiry } from '../constants';

interface ProductZoomModalProps {
  product: Product;
  onClose: () => void;
  onViewDescription?: (productId: string) => void;
  onAddToCart?: (product: Product, size: string) => void;
}

export function ProductZoomModal({
  product,
  onClose,
  onViewDescription,
  onAddToCart,
}: ProductZoomModalProps) {
  const angles = getProductAngles(product);
  const [selectedAngleIdx, setSelectedAngleIdx] = useState(0);
  const [added, setAdded] = useState(false);

  // Close on Escape key & arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setSelectedAngleIdx((prev) => (prev + 1) % angles.length);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedAngleIdx((prev) => (prev - 1 + angles.length) % angles.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, angles.length]);

  const activeImage = angles[selectedAngleIdx] || product.image;
  const angleLabels = ['Front View', 'Side Profile', 'Sole / Heel', 'Lifestyle Angle'];
  const angleShortLabels = ['Front', 'Side', 'Sole', 'Lifestyle'];

  return (
    <div
      className="ax-zoom-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="zoom-modal-title"
    >
      <div className="ax-zoom-modal" onClick={(e) => e.stopPropagation()}>
        {/* ── Top Bar ── */}
        <div className="ax-zoom-topbar">
          <div className="ax-zoom-info">
            <span className="ax-zoom-dept-badge">
              {product.department} · {product.category}
            </span>
            <h2 id="zoom-modal-title" className="ax-zoom-title">
              {product.name}
            </h2>
          </div>

          <div className="ax-zoom-actions">
            {/* View Full Product Description Page */}
            <button
              type="button"
              className="ax-zoom-desc-btn"
              onClick={() => {
                onClose();
                if (onViewDescription) {
                  onViewDescription(product.id);
                } else {
                  window.history.pushState(null, '', `/product-description?id=${product.id}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              title="View full description page"
            >
              <span>View Details</span>
              <ExternalLink size={13} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="ax-zoom-close-btn"
              onClick={onClose}
              aria-label="Close"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Clean Image Showcase (Zoom-in feature removed, clean image display) ── */}
        <div className="ax-zoom-body">
          <div className="ax-zoom-frame clean-display">
            {/* Crisp High-Res Image Without Zoom/Magnifier Distortion */}
            <img
              src={activeImage}
              alt={`${product.name} angle ${selectedAngleIdx + 1}`}
              className="ax-zoom-img clean-view"
            />

            {/* Left & Right Arrow Switchers */}
            {angles.length > 1 && (
              <>
                <button
                  type="button"
                  className="ax-zoom-nav-arrow prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAngleIdx((i) => (i - 1 + angles.length) % angles.length);
                  }}
                  aria-label="Previous angle"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className="ax-zoom-nav-arrow next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAngleIdx((i) => (i + 1) % angles.length);
                  }}
                  aria-label="Next angle"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Angle Indicator Tag */}
            <div className="ax-zoom-angle-tag">
              {angleLabels[selectedAngleIdx] || `Photo ${selectedAngleIdx + 1} of ${angles.length}`}
            </div>
          </div>
        </div>

        {/* ── 4 Angles Selector Bar (Full width 4-column cards with no side padding) ── */}
        <div className="ax-zoom-thumbs-list">
          {angles.map((angleUrl, idx) => (
            <button
              key={idx}
              type="button"
              className={`ax-zoom-thumb-btn${idx === selectedAngleIdx ? ' active' : ''}`}
              onClick={() => setSelectedAngleIdx(idx)}
            >
              <img src={angleUrl} alt={`Angle ${idx + 1}`} />
              <span>{angleShortLabels[idx] || `Angle ${idx + 1}`}</span>
            </button>
          ))}
        </div>

        {/* ── Dedicated Footer Actions Bar ── */}
        <div className="ax-zoom-foot-actions">
          <div className="ax-zoom-price-block">
            {product.originalPrice && <del>{product.originalPrice}</del>}
            <strong>{product.price}</strong>
          </div>

          <div className="ax-zoom-foot-btns">
            {onAddToCart && (
              <button
                type="button"
                className="ax-zoom-add-btn"
                onClick={() => {
                  onAddToCart(product, product.sizes?.[0] || 'IND 8');
                  setAdded(true);
                  setTimeout(() => setAdded(false), 1500);
                }}
                title={added ? "Added!" : "Add to Cart"}
              >
                {added ? (
                  <>
                    <Check size={14} /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={14} /> Add to Cart
                  </>
                )}
              </button>
            )}

            <a
              href={getProductWhatsAppEnquiry(product)}
              target="_blank"
              rel="noreferrer"
              className="ax-zoom-whatsapp-btn"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
