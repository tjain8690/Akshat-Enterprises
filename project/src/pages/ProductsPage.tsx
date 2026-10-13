import { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Product, CartItem } from '../types';
import { COLOR_HEX, whatsappLink } from '../constants';
import { ProductImageSlider } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS_FILTER = [
  { id: 'all', label: 'All', emoji: '🛍️' },
  { id: 'Footwear', label: 'Footwear', emoji: '👟' },
  { id: 'Jackets', label: 'Jackets', emoji: '🧥' },
  { id: 'Headwear', label: 'Headwear', emoji: '🪖' },
  { id: 'Accessories', label: 'Accessories', emoji: '🧤' },
];
const CATEGORIES_FILTER = ['Running', 'Casual', 'Basketball', 'Safety Shoes', 'Mud Shoes / Gum Boots', 'Limited Edition', 'Construction Jacket', 'Hi-Vis Jacket', 'Rain Jacket', 'Winter Jacket', 'Construction Cap', 'Safety Helmet', 'Hard Hat', 'Gloves', 'Knee Guards', 'Reflective Vest'];
const FOOTWEAR_SIZES_FILTER = ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11', 'IND 12'];
const APPAREL_SIZES_FILTER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SIZES_FILTER = [...FOOTWEAR_SIZES_FILTER, ...APPAREL_SIZES_FILTER];
const FIXED_COLORS_FILTER = ['Black', 'White', 'Red', 'Brown', 'Navy', 'Grey', 'Tan', 'Yellow', 'Orange', 'Green'];
const TAGS_FILTER = ['Bestseller', 'New drop', 'Workwear', 'Sale'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Name A–Z', value: 'name' },
];
const MAX_PRICE = 3000;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductsPageProps {
  products: Product[];
  cart: CartItem[];
  dark?: boolean;
  onAddToCart: (product: Product, size: string) => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onNavigateHome?: () => void;
  navigateTo?: (path: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ProductsPage({
  products,
  cart,
  dark: _dark,
  onAddToCart,
  onUpdateQuantity,
  onNavigateHome,
  navigateTo,
}: ProductsPageProps) {
  const handleNavigate = (path: string) => {
    if (navigateTo) {
      navigateTo(path);
    } else {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      handleNavigate('/');
    }
  };
  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Per-card selected size
  const [cardSizes, setCardSizes] = useState<Record<string, string>>({});
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // ─── Derived state ──────────────────────────────────────────────────────────
  // Dynamic categories from database products
  const dynamicCategories = useMemo(() => {
    const list: string[] = [];
    products.forEach((p) => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });
    CATEGORIES_FILTER.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }, [products]);

  const activeFilterCount =
    (selectedDept !== 'all' ? 1 : 0) +
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    selectedTags.length +
    (priceMin > 0 || priceMax < MAX_PRICE ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Department
    if (selectedDept !== 'all') {
      list = list.filter((p) => p.department === selectedDept);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tag ?? '').toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    // Price
    list = list.filter((p) => p.priceValue >= priceMin && p.priceValue <= priceMax);

    // Sizes
    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes && p.sizes.some((s) => selectedSizes.includes(s)));
    }

    // Colors
    if (selectedColors.length > 0) {
      list = list.filter((p) => p.colors && p.colors.some((c) => selectedColors.includes(c)));
    }

    // Tags
    if (selectedTags.length > 0) {
      list = list.filter((p) => p.tag && selectedTags.includes(p.tag));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.priceValue - b.priceValue);
        break;
      case 'price-desc':
        list.sort((a, b) => b.priceValue - a.priceValue);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
    }

    return list;
  }, [products, search, selectedDept, selectedCategories, priceMin, priceMax, selectedSizes, selectedColors, selectedTags, sortBy]);

  // ─── Toggles ────────────────────────────────────────────────────────────────
  const toggle = useCallback(
    <T,>(arr: T[], setArr: React.Dispatch<React.SetStateAction<T[]>>, val: T) => {
      setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    },
    []
  );

  const clearAll = () => {
    setSearch('');
    setSelectedDept('all');
    setSelectedCategories([]);
    setPriceMin(0);
    setPriceMax(MAX_PRICE);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedTags([]);
  };

  // ─── Cart helpers ────────────────────────────────────────────────────────────
  const getCartEntry = (product: Product) =>
    cart.find((item) => item.name === product.name);

  const getCartIdx = (product: Product) =>
    cart.findIndex((item) => item.name === product.name);

  const getCardSize = (product: Product) =>
    cardSizes[product.id] ?? product.sizes?.[0] ?? '';

  const handleAddToCart = (product: Product) => {
    const size = getCardSize(product);
    onAddToCart(product, size);
  };

  // ─── Filter Sidebar (shared between desktop & mobile) ───────────────────────
  const FilterContent = () => (
    <div className="filter-content">
      {/* Search */}
      <div className="filter-section">
        <div className="filter-search-wrap">
          <Search size={14} className="filter-search-icon" />
          <input
            className="filter-search-input"
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="products-search"
          />
          {search && (
            <button className="filter-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Department */}
      <div className="filter-section">
        <h4 className="filter-section-title">Department</h4>
        <div className="filter-dept-chips">
          {DEPARTMENTS_FILTER.map((dept) => (
            <button
              key={dept.id}
              className={`filter-dept-chip${selectedDept === dept.id ? ' active' : ''}`}
              onClick={() => {
                setSelectedDept(dept.id);
                setSelectedCategories([]); // reset sub-categories
              }}
            >
              {dept.emoji} {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="filter-section">
        <h4 className="filter-section-title">Category</h4>
        {dynamicCategories.map((cat) => (
          <label key={cat} className="filter-checkbox-label">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => toggle(selectedCategories, setSelectedCategories, cat)}
            />
            <span className="filter-checkbox-box" />
            <span>{cat}</span>
            <span className="filter-count">
              {products.filter((p) => p.category === cat).length}
            </span>
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h4 className="filter-section-title">Price Range</h4>
        <div className="filter-price-labels">
          <span>₹{priceMin.toLocaleString('en-IN')}</span>
          <span>₹{priceMax.toLocaleString('en-IN')}</span>
        </div>
        <div className="filter-range-stack">
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={50}
            value={priceMin}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val <= priceMax) setPriceMin(val);
            }}
            className="filter-range filter-range-min"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={0}
            max={MAX_PRICE}
            step={50}
            value={priceMax}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= priceMin) setPriceMax(val);
            }}
            className="filter-range filter-range-max"
            aria-label="Maximum price"
          />
          <div
            className="filter-range-fill"
            style={{
              left: `${(priceMin / MAX_PRICE) * 100}%`,
              right: `${100 - (priceMax / MAX_PRICE) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="filter-section">
        <h4 className="filter-section-title">Size (IND)</h4>
        <div className="filter-size-chips">
          {SIZES_FILTER.map((s) => (
            <button
              key={s}
              className={`filter-size-chip${selectedSizes.includes(s) ? ' active' : ''}`}
              onClick={() => toggle(selectedSizes, setSelectedSizes, s)}
            >
              {s.replace('IND ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="filter-section">
        <h4 className="filter-section-title">Color</h4>
        <div className="filter-color-swatches">
          {FIXED_COLORS_FILTER.map((c) => (
            <button
              key={c}
              className={`filter-color-swatch${selectedColors.includes(c) ? ' active' : ''}`}
              style={{ '--swatch-color': COLOR_HEX[c] } as React.CSSProperties}
              onClick={() => toggle(selectedColors, setSelectedColors, c)}
              title={c}
              aria-label={c}
            />
          ))}
        </div>
        {selectedColors.length > 0 && (
          <div className="filter-selected-colors">
            {selectedColors.map((c) => (
              <span key={c} className="filter-color-tag">
                {c} <button onClick={() => toggle(selectedColors, setSelectedColors, c)}><X size={9} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="filter-section">
        <h4 className="filter-section-title">Tag</h4>
        {TAGS_FILTER.map((tag) => (
          <label key={tag} className="filter-checkbox-label">
            <input
              type="checkbox"
              className="filter-checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => toggle(selectedTags, setSelectedTags, tag)}
            />
            <span className="filter-checkbox-box" />
            <span>{tag}</span>
          </label>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <button className="filter-clear-all" onClick={clearAll}>
          <X size={13} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="products-page-header">
        <button className="products-back-btn" onClick={handleBackHome}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div className="products-page-title-block">
          <p className="eyebrow"><span className="eyebrow-line" /> Full Collection</p>
          <h1 className="products-page-h1">Browse All <em>Pairs.</em></h1>
        </div>
      </div>

      {/* Layout */}
      <div className="products-layout">
        {/* ── Desktop Sidebar ── */}
        <aside className="filter-sidebar">
          <div className="filter-sidebar-header">
            <div className="filter-sidebar-title">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="filter-active-count">{activeFilterCount}</span>
              )}
            </div>
          </div>
          <FilterContent />
        </aside>

        {/* ── Products Area ── */}
        <div className="products-area">
          {/* Sort Bar */}
          <div className="products-sort-bar">
            {/* Mobile filter toggle */}
            <button
              className="mobile-filter-toggle"
              onClick={() => setMobileFiltersOpen(true)}
              id="mobile-filter-btn"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-active-count">{activeFilterCount}</span>
              )}
            </button>

            <span className="products-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'pair' : 'pairs'}
            </span>

            {/* Sort dropdown */}
            <div className="sort-dropdown-wrap" style={{ position: 'relative' }}>
              <button
                className="sort-dropdown-btn"
                onClick={() => setSortOpen(!sortOpen)}
                id="sort-dropdown-btn"
              >
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <ChevronDown size={14} className={sortOpen ? 'rotated' : ''} />
              </button>
              {sortOpen && (
                <div className="sort-dropdown-menu">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      className={`sort-option${sortBy === o.value ? ' active' : ''}`}
                      onClick={() => { setSortBy(o.value); setSortOpen(false); }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="products-empty-state">
              <div className="products-empty-icon"><Package size={48} /></div>
              <h3>No products match your filters</h3>
              <p>Try adjusting your department, size, color or price range to see more options.</p>
              <button className="button button-dark" onClick={clearAll}>
                Clear Filters <X size={16} />
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const cartEntry = getCartEntry(product);
                const cartIdx = getCartIdx(product);
                const cardSize = getCardSize(product);

                return (
                  <article className="product-card" key={product.id}>
                    <div
                      className="product-image"
                      onClick={() => setDetailProduct(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.tag && <span className="product-tag">{product.tag}</span>}
                      <ProductImageSlider images={[product.image, ...(product.images ?? [])]} name={product.name} />
                      <button
                        className="product-arrow"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!cartEntry) {
                            handleAddToCart(product);
                          }
                          handleNavigate('/cart');
                        }}
                        aria-label={`View cart for ${product.name}`}
                      >
                        <ShoppingCart size={17} />
                      </button>
                    </div>

                    <div className="product-info">
                      <div>
                        <h3
                          onClick={() => setDetailProduct(product)}
                          style={{ cursor: 'pointer' }}
                        >
                          {product.name}
                        </h3>
                        <span>{product.category}</span>
                      </div>
                      <strong>{product.price}</strong>
                    </div>

                    {/* Colors */}
                    {product.colors.length > 0 && (
                      <div className="product-colors-row">
                        {product.colors.map((c) => (
                          <span
                            key={c}
                            className="color-dot"
                            style={{ background: COLOR_HEX[c] || '#888' }}
                            title={c}
                          />
                        ))}
                      </div>
                    )}

                    {/* Size selector */}
                    {product.sizes.length > 0 && (
                      <div className="product-size-selector">
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            className={`size-pick-btn${cardSize === s ? ' selected' : ''}`}
                            onClick={() =>
                              setCardSizes((prev) => ({ ...prev, [product.id]: s }))
                            }
                          >
                            {s.replace('IND ', '')}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="product-card-actions">
                      <button
                        type="button"
                        className="enquire-link"
                        onClick={() => setDetailProduct(product)}
                        style={{ background: 'rgba(0,0,0,0.04)', fontWeight: 700, cursor: 'pointer' }}
                        title="View 4 Angle Photos"
                      >
                        <Eye size={13} /> View
                      </button>

                      {cartEntry ? (
                        <div className="product-qty-stepper">
                          <button
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(cartIdx, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="qty-count">{cartEntry.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(cartIdx, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="product-add-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart size={15} /> Add to Cart
                        </button>
                      )}
                      <a
                        className="enquire-link"
                        href={whatsappLink(
                          `Hi Akshat Enterprises, I want to enquire about ${product.name}. Please share available sizes.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={14} /> Enquire
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom-Sheet Filter */}
      {mobileFiltersOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="mobile-filter-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-filter-header">
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
              <button
                className="mobile-filter-close"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mobile-filter-body">
              <FilterContent />
            </div>
            <div className="mobile-filter-footer">
              <button className="button button-dark" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMobileFiltersOpen(false)}>
                Show {filteredProducts.length} results <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT DETAIL VIEW MODAL (4 Angles & PulseSneaks Style Design) ── */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={(product, size) => {
            onAddToCart(product, size);
            setDetailProduct(null);
          }}
        />
      )}
    </div>
  );
}
