import { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock3,
  Eye,
  Heart,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Moon,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Sun,
  Truck,
  X,
  Trash2,
  Check,
  CreditCard,
  Headphones,
} from 'lucide-react';
import { CartPage, CartItem } from './pages/CartPage';
import { AdminPage } from './pages/AdminPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductCard } from './components/ProductCard';
import {
  loadProducts,
  subscribeToProducts,
  loadBanners,
  subscribeToBanners,
  SEED_BANNERS,
} from './productStore';
import type { Banner } from './types';
import {
  whatsappNumber,
  secondPhone,
  whatsappLink,
  DEPARTMENTS,
  DEPT_CATEGORIES,
  faqs,
} from './constants';

export type Product = {
  id: string;
  name: string;
  department: string;
  category: string;
  price: string;
  originalPrice?: string;
  priceValue: number;
  image: string;
  images?: string[];
  tag?: string;
  rating?: number;
  reviewsCount?: number;
  sizes: string[];
  colors: string[];
  stock?: number;
  createdAt?: string;
};

export default function App() {
  const [dark, setDark] = useState(false);
  const [activeDept, setActiveDept] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  // Search input in header
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Quick View Modal product
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewSize, setQuickViewSize] = useState<string>('');

  // Mini-cart drawer
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Category sidebar popup drawer (slides left to right)
  const [categorySidebarOpen, setCategorySidebarOpen] = useState(false);

  // Hero Banners (dynamic from database table 'banners')
  const [banners, setBanners] = useState<Banner[]>(SEED_BANNERS);

  // Hero Ad Cards Slider index
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Continuous auto-slider: runs every 3s continuously and NEVER stops or freezes on button click or scroll!
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);


  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('akshat_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('akshat_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load products on mount & subscribe to live Supabase updates
  useEffect(() => {
    loadProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));

    // Live Supabase database changes listener
    const unsubscribe = subscribeToProducts(() => {
      loadProducts().then(setProducts).catch(console.error);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Load banners on mount & subscribe to live Supabase updates on 'banners' table
  useEffect(() => {
    loadBanners()
      .then((data) => {
        if (data && data.length > 0) setBanners(data);
      })
      .catch((err) => console.warn('Banners load warning:', err));

    const unsubscribeBanners = subscribeToBanners(() => {
      loadBanners()
        .then((data) => {
          if (data && data.length > 0) setBanners(data);
        })
        .catch(console.error);
    });

    return () => {
      if (unsubscribeBanners) unsubscribeBanners();
    };
  }, []);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('akshat_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem('akshat_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Client-side router listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCartDrawerOpen(false);
    setMenuOpen(false);
  };

  // Search submit handler: switches to department and scrolls to footwear/category
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (
      query.includes('shoe') ||
      query.includes('footwear') ||
      query.includes('boot') ||
      query.includes('sneaker') ||
      query.includes('sandal') ||
      query.includes('running') ||
      query.includes('gum')
    ) {
      setActiveDept('Footwear');
      if (query.includes('safety')) {
        setActiveCategory('Safety Shoes');
      } else if (query.includes('gum') || query.includes('mud')) {
        setActiveCategory('Mud Shoes / Gum Boots');
      } else if (query.includes('running')) {
        setActiveCategory('Running');
      } else if (query.includes('casual') || query.includes('sandal')) {
        setActiveCategory('Casual');
      } else {
        setActiveCategory('All Products');
      }
    } else if (
      query.includes('jacket') ||
      query.includes('coat') ||
      query.includes('rain') ||
      query.includes('winter') ||
      query.includes('hi-vis')
    ) {
      setActiveDept('Jackets');
      if (query.includes('winter')) {
        setActiveCategory('Winter Jacket');
      } else if (query.includes('hi-vis') || query.includes('hivis')) {
        setActiveCategory('Hi-Vis Jacket');
      } else {
        setActiveCategory('All Products');
      }
    } else if (
      query.includes('cap') ||
      query.includes('helmet') ||
      query.includes('hat') ||
      query.includes('headwear')
    ) {
      setActiveDept('Headwear');
      setActiveCategory('All Products');
    } else if (
      query.includes('glove') ||
      query.includes('knee') ||
      query.includes('vest') ||
      query.includes('access')
    ) {
      setActiveDept('Accessories');
      setActiveCategory('All Products');
    } else if (query) {
      setActiveDept('all');
      setActiveCategory('All Products');
    }

    if (currentPath !== '/') {
      navigateTo('/');
    }

    // Scroll down to the footwear / product category section smoothly
    setTimeout(() => {
      const el = document.getElementById('featured');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  // ─── Product management handlers ──────────────────────────────────────────
  const handlePublishProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    showToast(`Added product "${product.name}"`);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed');
  };

  // ─── Wishlist handlers ────────────────────────────────────────────────────
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from wishlist' : 'Added to wishlist ❤️');
      return next;
    });
  };

  // ─── Cart handlers ────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product, size?: string) => {
    const chosenSize = size || product.sizes?.[0] || 'IND 8';
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.name === product.name && item.selectedSize === chosenSize
      );
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      return [
        ...prevCart,
        {
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image,
          tag: product.tag,
          quantity: 1,
          selectedSize: chosenSize,
        },
      ];
    });
    showToast(`Added "${product.name}" (${chosenSize}) to cart!`);
    setCartDrawerOpen(true);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      if (!item) return prevCart;
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prevCart.filter((_, idx) => idx !== index);
      }
      const updated = [...prevCart];
      updated[index] = { ...item, quantity: newQuantity };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart total price in rupees
  const cartTotalPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      const priceNum = typeof item.price === 'number'
        ? item.price
        : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 0;
      return sum + priceNum * item.quantity;
    }, 0);
  }, [cart]);

  // Dynamic Departments from database inventory
  const dbDepartments = useMemo(() => {
    const baseDepts: { id: string; label: string; emoji: string }[] = [
      { id: 'all', label: 'All Products', emoji: '🛍️' },
      { id: 'Footwear', label: 'Footwear', emoji: '👟' },
      { id: 'Jackets', label: 'Jackets', emoji: '🧥' },
      { id: 'Headwear', label: 'Headwear', emoji: '🪖' },
      { id: 'Accessories', label: 'Accessories', emoji: '🧤' },
    ];
    // Check if products have any new custom departments in database
    const seen = new Set(baseDepts.map((d) => d.id));
    const customDepts: { id: string; label: string; emoji: string }[] = [];
    products.forEach((p) => {
      if (p.department && !seen.has(p.department)) {
        seen.add(p.department);
        customDepts.push({
          id: p.department,
          label: p.department,
          emoji: '🏷️',
        });
      }
    });
    return [...baseDepts, ...customDepts];
  }, [products]);

  // Product counts per department from database
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const dept = p.department || 'Footwear';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Dynamic Categories grouped by department from database products
  const dbCategoriesByDept = useMemo(() => {
    const map: Record<string, { category: string; count: number }[]> = {};
    products.forEach((p) => {
      const dept = p.department || 'Footwear';
      if (!map[dept]) map[dept] = [];
      const existing = map[dept].find((item) => item.category === p.category);
      if (existing) {
        existing.count += 1;
      } else if (p.category) {
        map[dept].push({ category: p.category, count: 1 });
      }
    });
    return map;
  }, [products]);

  // Available Subcategories for current active department
  const availableSubcategories = useMemo(() => {
    if (activeDept === 'all') {
      const catMap = new Map<string, number>();
      products.forEach((p) => {
        if (p.category) {
          catMap.set(p.category, (catMap.get(p.category) || 0) + 1);
        }
      });
      return Array.from(catMap.entries()).map(([category, count]) => ({ category, count }));
    }
    return dbCategoriesByDept[activeDept] || [];
  }, [activeDept, dbCategoriesByDept, products]);

  // Featured Products: filtered by department, category & optional search
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeDept !== 'all') {
      list = list.filter((p) => p.department === activeDept);
    }
    if (activeCategory !== 'All Products') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeDept, activeCategory, searchQuery]);

  // Best Sellers list
  const bestSellerProducts = useMemo(() => {
    return products.filter((p) => p.tag === 'Bestseller' || p.rating === 5).slice(0, 4);
  }, [products]);

  // Quick View opener
  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewSize(product.sizes?.[0] || 'IND 8');
  };

  // Category select handler from sidebar drawer
  const handleSelectDrawerCategory = (dept: string, category: string = 'All Products') => {
    setActiveDept(dept);
    setActiveCategory(category);
    setCategorySidebarOpen(false);
    if (currentPath !== '/') {
      navigateTo('/');
    }
    setTimeout(() => {
      const el = document.getElementById('featured');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  // Close sidebar drawer on Escape key & lock scroll when drawer is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCategorySidebarOpen(false);
      }
    };
    if (categorySidebarOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else if (!cartDrawerOpen && !quickViewProduct) {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [categorySidebarOpen, cartDrawerOpen, quickViewProduct]);

  return (
    <div className={`app porto-theme${dark ? ' dark' : ''}${categorySidebarOpen ? ' porto-sidebar-active' : ''}`}>
      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="porto-toast" role="status">
          <Check size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Top Announcement Bar (Porto Signature Style) ── */}
      <div className="porto-top-bar">
        <div className="porto-top-bar-inner">
          <div className="porto-top-announcement">
            <span className="porto-top-pill">SPECIAL OFFER</span>
            <span>Get 10% OFF at Akshat Enterprises Selection — Shop Direct from Turbhe Store!</span>
          </div>
          <div className="porto-top-links">
            <a href="tel:9892228186" className="porto-top-link">
              <Phone size={12} /> 98922 28186
            </a>
            <span className="porto-top-divider">|</span>
            <button
              type="button"
              className="porto-top-link"
              onClick={() => {
                if (wishlist.length > 0) {
                  showToast(`You have ${wishlist.length} item${wishlist.length > 1 ? 's' : ''} in wishlist`);
                } else {
                  showToast('Your wishlist is empty');
                }
              }}
            >
              <Heart size={12} /> Wishlist ({wishlist.length})
            </button>
            <span className="porto-top-divider">|</span>
            <button
              type="button"
              className="porto-top-link"
              onClick={() => navigateTo('/cart')}
            >
              <ShoppingCart size={12} /> Cart ({totalCartCount})
            </button>
            <span className="porto-top-divider">|</span>
            <span className="porto-top-currency">INR (₹)</span>
          </div>
        </div>
      </div>

      {/* ── Main Site Header & Navbar (Porto Luxury Style) ── */}
      <header className="porto-header">
        <div className="porto-header-inner">
          {/* Brand Logo & Mobile Categories Trigger */}
          <div className="porto-brand-group">
            <button
              type="button"
              className="porto-mobile-cat-btn"
              onClick={() => setCategorySidebarOpen(true)}
              aria-label="Open categories sidebar"
              title="Categories"
            >
              <Menu size={20} />
            </button>
            <a
              className="porto-brand"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/');
              }}
              aria-label="Akshat Enterprises Home"
            >
              <img src="/AE-logo.png" alt="Akshat Enterprises" className="porto-brand-logo-img" />
            </a>
          </div>

          {/* Center Search Bar with workable submit & auto-scroll */}
          <form className="porto-header-search" onSubmit={handleSearchSubmit}>
            <div className="porto-search-wrap">
              <input
                type="text"
                className="porto-search-input"
                placeholder="Search sandals, safety shoes, jackets, workwear…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                aria-label="Search catalog"
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="porto-search-btn-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              ) : null}
              <button
                type="submit"
                className="porto-search-btn-submit"
                aria-label="Search and scroll to category"
                title="Search products"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Header Action Icons */}
          <div className="porto-header-actions">
            {/* Wishlist Icon */}
            <button
              type="button"
              className="porto-action-icon-btn"
              onClick={() => {
                showToast(`Wishlist contains ${wishlist.length} item${wishlist.length === 1 ? '' : 's'}`);
              }}
              aria-label="View wishlist"
              title="Wishlist"
            >
              <Heart size={20} fill={wishlist.length > 0 ? '#f04c32' : 'none'} stroke={wishlist.length > 0 ? '#f04c32' : 'currentColor'} />
              {wishlist.length > 0 && <span className="porto-badge-count">{wishlist.length}</span>}
            </button>

            {/* Shopping Cart Pill Button (Porto style) */}
            <button
              type="button"
              className="porto-cart-pill-btn"
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Open Shopping Cart"
              title="Shopping cart"
            >
              <div className="porto-cart-icon-wrap">
                <ShoppingCart size={19} />
                {totalCartCount > 0 && <span className="porto-badge-count">{totalCartCount}</span>}
              </div>
              <div className="porto-cart-text">
                <span className="porto-cart-label">CART</span>
                <strong className="porto-cart-amount">₹{cartTotalPrice.toLocaleString('en-IN')}</strong>
              </div>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="porto-theme-toggle-btn"
              onClick={() => setDark(!dark)}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title="Toggle theme"
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="porto-menu-toggle-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Secondary Navigation Bar (Shop, Collection, Workwear, About) ── */}
        <nav className={`porto-nav-strip${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <div className="porto-nav-inner">
            {/* Sidebar trigger button on navbar left side */}
            <button
              type="button"
              className="porto-nav-categories-btn"
              onClick={() => setCategorySidebarOpen(true)}
              aria-label="Open categories sidebar"
              title="Categories"
            >
              <Menu size={18} />
            </button>

            <button
              type="button"
              className={`porto-nav-link${currentPath === '/' && !searchQuery ? ' active' : ''}`}
              onClick={() => navigateTo('/')}
            >
              Home
            </button>
            <button
              type="button"
              className={`porto-nav-link${currentPath === '/products' ? ' active' : ''}`}
              onClick={() => navigateTo('/products')}
            >
              All Products &amp; Catalog
            </button>
            <button
              type="button"
              className="porto-nav-link"
              onClick={() => {
                setActiveDept('Footwear');
                navigateTo('/');
                setTimeout(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
            >
              Footwear &amp; Sneakers
            </button>
            <button
              type="button"
              className="porto-nav-link"
              onClick={() => {
                setActiveDept('Footwear');
                setActiveCategory('Safety Shoes');
                navigateTo('/');
                setTimeout(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
            >
              Safety Footwear
            </button>
            <button
              type="button"
              className="porto-nav-link"
              onClick={() => {
                setActiveDept('Jackets');
                navigateTo('/');
                setTimeout(() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
            >
              Jackets &amp; Workwear
            </button>
            <button
              type="button"
              className={`porto-nav-link${currentPath === '/cart' ? ' active' : ''}`}
              onClick={() => navigateTo('/cart')}
            >
              Cart ({totalCartCount})
            </button>
            <button
              type="button"
              className={`porto-nav-link${currentPath === '/admin' ? ' active' : ''}`}
              onClick={() => navigateTo('/admin')}
            >
              Admin / Upload
            </button>
          </div>
        </nav>
      </header>

      {/* ── Main App Content ── */}
      <main id="top" className="porto-main-content">
        {currentPath === '/cart' ? (
          <CartPage
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigateHome={() => navigateTo('/')}
            whatsappNumber={whatsappNumber}
          />
        ) : currentPath === '/admin' ? (
          <AdminPage
            products={products}
            banners={banners}
            dark={dark}
            onPublish={handlePublishProduct}
            onDelete={handleDeleteProduct}
            onNavigateHome={() => navigateTo('/')}
          />
        ) : currentPath === '/products' ? (
          <ProductsPage
            products={products}
            cart={cart}
            dark={dark}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onNavigateHome={() => navigateTo('/')}
            navigateTo={navigateTo}
          />
        ) : (
          <>
            {/* ── HERO SECTION (Auto-sliding 5 Ad Cards with Different Categories from DB) ── */}
            <section className="porto-hero-section">
              <div className="porto-hero-container">
                <div className="porto-hero-slider-wrapper">
                  {/* Slider Track moving from right to left */}
                  <div
                    className="porto-hero-slider-track"
                    style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
                  >
                    {banners.map((slide) => (
                      <div key={slide.id} className="porto-hero-slide-item">
                        <div className="porto-hero-banner">
                          <div className="porto-hero-image-wrap">
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="porto-hero-image"
                            />
                          </div>

                          <div className="porto-hero-copy">
                            <span className="porto-hero-dept-chip">{slide.department} • {slide.category}</span>
                            <p className="porto-script-accent">{slide.eyebrow}</p>
                            <h1 className="porto-hero-title">{slide.title}</h1>
                            <div className="porto-hero-price-tag">
                              <span>{slide.priceLabel}</span>
                              <strong>{slide.price}</strong>
                            </div>
                            <button
                              type="button"
                              className="porto-hero-cta-btn"
                              onClick={() => {
                                setActiveDept(slide.department);
                                if (slide.category && slide.category !== 'All Products') {
                                  setActiveCategory(slide.category);
                                }
                                const el = document.getElementById('featured');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                            >
                              {slide.ctaText}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Manual Prev / Next Navigation Arrows */}
                  <button
                    type="button"
                    className="porto-hero-arrow prev"
                    onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + banners.length) % banners.length)}
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className="porto-hero-arrow next"
                    onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % banners.length)}
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={22} />
                  </button>

                  {/* Slide Indicator Dots */}
                  <div className="porto-hero-dots">
                    {banners.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`porto-hero-dot${idx === currentHeroSlide ? ' active' : ''}`}
                        onClick={() => setCurrentHeroSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}: ${s.title}`}
                      >
                        <span className="dot-pill" />
                        <span className="dot-label">{s.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── VALUE PROPOSITION 4-COLUMN STRIP (Porto Reference Match) ── */}
            <section className="porto-trust-strip">
              <div className="porto-trust-grid">
                <div className="porto-trust-card">
                  <div className="porto-trust-icon">
                    <Truck size={28} />
                  </div>
                  <div className="porto-trust-text">
                    <strong>FREE SHIPPING &amp; RETURN</strong>
                    <small>Free local delivery on wholesale &amp; Turbhe orders</small>
                  </div>
                </div>

                <div className="porto-trust-card">
                  <div className="porto-trust-icon">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="porto-trust-text">
                    <strong>MONEY BACK GUARANTEE</strong>
                    <small>100% genuine shop verified quality assurance</small>
                  </div>
                </div>

                <div className="porto-trust-card">
                  <div className="porto-trust-icon">
                    <Headphones size={28} />
                  </div>
                  <div className="porto-trust-text">
                    <strong>ONLINE SUPPORT 24/7</strong>
                    <small>Instant WhatsApp assistance from store team</small>
                  </div>
                </div>

                <div className="porto-trust-card">
                  <div className="porto-trust-icon">
                    <CreditCard size={28} />
                  </div>
                  <div className="porto-trust-text">
                    <strong>SECURE PAYMENT</strong>
                    <small>UPI, Cards, Cash &amp; GST tax invoice available</small>
                  </div>
                </div>
              </div>
            </section>

            {/* ── FEATURED PRODUCTS SECTION (With Ornamental Header) ── */}
            <section id="featured" className="porto-section">
              {/* Ornamental Section Divider Header */}
              <div className="porto-ornament-header">
                <div className="porto-ornament-line" />
                <div className="porto-ornament-title-block">
                  <h2 className="porto-ornament-title">FeaturedProducts</h2>
                  <p className="porto-ornament-sub">Amazing products added recently in our catalog</p>
                </div>
                <div className="porto-ornament-line" />
              </div>

              {/* Department & Subcategory Filter Tabs (Derived from Database) */}
              <div className="porto-category-tabs">
                {dbDepartments.map((dept) => {
                  const count = deptCounts[dept.id] ?? 0;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      className={`porto-filter-pill${activeDept === dept.id ? ' active' : ''}`}
                      onClick={() => {
                        setActiveDept(dept.id);
                        setActiveCategory('All Products');
                      }}
                    >
                      <span>{dept.emoji}</span>
                      <span>{dept.label}</span>
                      <span className="porto-filter-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Subcategory Filter Pills (From Database for current department) */}
              {availableSubcategories.length > 0 && (
                <div className="porto-subcat-filter-strip">
                  <div className="porto-subcat-inner">
                    <button
                      type="button"
                      className={`porto-subcat-tag${activeCategory === 'All Products' ? ' active' : ''}`}
                      onClick={() => setActiveCategory('All Products')}
                    >
                      All {activeDept === 'all' ? 'Products' : activeDept} ({deptCounts[activeDept] ?? products.length})
                    </button>
                    {availableSubcategories.map(({ category, count }) => (
                      <button
                        key={category}
                        type="button"
                        className={`porto-subcat-tag${activeCategory === category ? ' active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                      >
                        <span>{category}</span>
                        <span className="porto-subcat-pill-count">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Grid */}
              {productsLoading ? (
                <div className="porto-loading-state">
                  <div className="porto-spinner" />
                  <span>Loading catalog…</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="porto-empty-products">
                  <h3>No products found matching filters</h3>
                  <p>Try resetting department filters or search keywords.</p>
                  <button
                    type="button"
                    className="porto-hero-cta-btn"
                    onClick={() => {
                      setActiveDept('all');
                      setActiveCategory('All Products');
                      setSearchQuery('');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="porto-products-grid">
                  {filteredProducts.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      cart={cart}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onUpdateQuantity={handleUpdateQuantity}
                      onQuickView={handleOpenQuickView}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── EDITORIAL PROMO GRID ("SummerCollection" Reference Match) ── */}
            <section className="porto-section porto-promo-section">
              {/* Ornamental Section Header */}
              <div className="porto-ornament-header">
                <div className="porto-ornament-line" />
                <div className="porto-ornament-title-block">
                  <h2 className="porto-ornament-title">SummerCollection</h2>
                  <p className="porto-ornament-sub">Curated footwear built for full shifts and everyday street style</p>
                </div>
                <div className="porto-ornament-line" />
              </div>

              {/* 3-Column Promo Layout (Exact match from reference photo) */}
              <div className="porto-promo-grid">
                {/* Column 1: Tall Lifestyle Photo Banner */}
                <div className="porto-promo-tall-banner">
                  <img
                    src="/images/sport_shoes_lifestyle.jpg"
                    alt="Sport Shoes Lifestyle"
                    className="porto-promo-bg-img"
                  />
                  <div className="porto-promo-banner-overlay">
                    <span className="porto-script-accent" style={{ color: '#fff', fontSize: '28px' }}>
                      Sport
                    </span>
                    <h3 className="porto-promo-banner-title">Shoes</h3>
                    <p className="porto-promo-banner-desc">Ultra-cushioned comfort for active days &amp; hard work.</p>
                    <button
                      type="button"
                      className="porto-promo-banner-btn"
                      onClick={() => {
                        setActiveDept('Footwear');
                        const el = document.getElementById('featured');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      DISCOVER MORE →
                    </button>
                  </div>
                </div>

                {/* Column 2: Stacked Dark Editorial Cards ("For Her" & "For Him") */}
                <div className="porto-promo-stacked-col">
                  {/* Card "For Her" */}
                  <div
                    className="porto-dark-editorial-card"
                    onClick={() => {
                      setActiveDept('Footwear');
                      const el = document.getElementById('featured');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="porto-editorial-inner">
                      <p className="porto-script-accent porto-script-white">For Her</p>
                      <small className="porto-editorial-sub">Comfortable lightweight work &amp; daily pairs</small>
                      <span className="porto-editorial-arrow">SHOP NOW ↗</span>
                    </div>
                  </div>

                  {/* Card "For Him" */}
                  <div
                    className="porto-dark-editorial-card porto-dark-editorial-card-alt"
                    onClick={() => {
                      setActiveDept('Footwear');
                      setActiveCategory('Safety Shoes');
                      const el = document.getElementById('featured');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="porto-editorial-inner">
                      <p className="porto-script-accent porto-script-white">For Him</p>
                      <small className="porto-editorial-sub">Heavy duty steel-toe &amp; rugged leather boots</small>
                      <span className="porto-editorial-arrow">SHOP NOW ↗</span>
                    </div>
                  </div>
                </div>

                {/* Column 3: Dual Product Spotlights */}
                <div className="porto-promo-spotlight-col">
                  {products.slice(0, 2).map((prod) => (
                    <div className="porto-spotlight-item" key={`spotlight-${prod.id}`}>
                      <div className="porto-spotlight-thumb">
                        <img src={prod.image} alt={prod.name} />
                      </div>
                      <div className="porto-spotlight-info">
                        <span className="porto-spotlight-cat">{prod.category}</span>
                        <h4>{prod.name}</h4>
                        <div className="porto-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} fill="#f59e0b" stroke="#f59e0b" />
                          ))}
                        </div>
                        <div className="porto-spotlight-price">
                          {prod.originalPrice && <del>{prod.originalPrice}</del>}
                          <strong>{prod.price}</strong>
                        </div>
                        <button
                          type="button"
                          className="porto-spotlight-add-btn"
                          onClick={() => handleAddToCart(prod)}
                        >
                          <ShoppingCart size={13} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── BEST SELLER PRODUCTS SECTION (Reference Match) ── */}
            <section className="porto-section">
              {/* Ornamental Section Header */}
              <div className="porto-ornament-header">
                <div className="porto-ornament-line" />
                <div className="porto-ornament-title-block">
                  <h2 className="porto-ornament-title">Best SellerProducts</h2>
                  <p className="porto-ornament-sub">Only the best seller products added recently in our catalog</p>
                </div>
                <div className="porto-ornament-line" />
              </div>

              {/* Best Seller Grid */}
              <div className="porto-products-grid">
                {bestSellerProducts.map((product) => (
                  <ProductCard
                    key={`bestseller-${product.id}`}
                    product={product}
                    cart={cart}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onQuickView={handleOpenQuickView}
                  />
                ))}
              </div>
            </section>

            {/* ── BRAND LOGOS / CERTIFICATIONS STRIP (Porto Reference Match) ── */}
            <section className="porto-brands-strip">
              <div className="porto-brands-inner">
                <div className="porto-brand-logo-item">
                  <strong>DAVID SMITH</strong>
                </div>
                <div className="porto-brand-logo-item">
                  <span className="porto-brand-tag-box">RJ</span>
                  <strong>RON JONES</strong>
                </div>
                <div className="porto-brand-logo-item">
                  <strong>GOLDENGRID</strong>
                </div>
                <div className="porto-brand-logo-item">
                  <strong>CLIMB THE MOUNTAIN</strong>
                </div>
                <div className="porto-brand-logo-item">
                  <strong>ISI CERTIFIED</strong>
                </div>
                <div className="porto-brand-logo-item">
                  <strong>VANT GARDE</strong>
                </div>
              </div>
            </section>

            {/* ── STORE LOCATION & TRUST ── */}
            <section id="location" className="porto-section porto-location-section">
              <div className="porto-location-grid">
                <a
                  className="porto-map-card"
                  href="https://www.google.com/maps/search/?api=1&query=Shop+No.+51+Janta+Market+Sector-23+Turbhe+Navi+Mumbai+400705"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open store location in Google Maps"
                >
                  <div className="porto-map-pin">
                    <MapPin size={28} />
                  </div>
                  <div className="porto-map-badge">
                    <span>Visit In Person</span>
                    <strong>Janta Market · Turbhe</strong>
                  </div>
                </a>

                <div className="porto-location-copy">
                  <p className="porto-script-accent">Come Say Hello</p>
                  <h2>Right in the heart of <em>Turbhe.</em></h2>
                  <p className="porto-address-text">
                    Shop No. 51, Janta Market, Sector-23, Turbhe, Navi Mumbai – 400705
                  </p>
                  <div className="porto-hours-block">
                    <Clock3 size={18} />
                    <div>
                      <strong>Store Hours</strong>
                      <small>Mon – Sun · 10:00 AM – 9:00 PM</small>
                    </div>
                  </div>
                  <div className="porto-location-actions">
                    <a
                      className="porto-hero-cta-btn"
                      href="https://www.google.com/maps/search/?api=1&query=Shop+No+51+Janta+Market+Sector+23+Turbhe+Navi+Mumbai+400705"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Get Directions <ArrowUpRight size={16} />
                    </a>
                    <a
                      className="porto-hero-cta-btn porto-hero-cta-btn-alt"
                      href={whatsappLink('Hi Akshat Enterprises, I want to visit your store today.')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle size={16} /> WhatsApp Store
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* ── FAQ SECTION ── */}
            <section className="porto-section porto-faq-section">
              <div className="porto-ornament-header">
                <div className="porto-ornament-line" />
                <div className="porto-ornament-title-block">
                  <h2 className="porto-ornament-title">QuestionsAnswered</h2>
                  <p className="porto-ornament-sub">Everything you need to know about purchasing and store visits</p>
                </div>
                <div className="porto-ornament-line" />
              </div>

              <div className="porto-faq-list">
                {faqs.map(([question, answer], index) => (
                  <div className={`porto-faq-card${openFaq === index ? ' open' : ''}`} key={question}>
                    <button
                      type="button"
                      className="porto-faq-question"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span>{question}</span>
                      <ChevronDown size={18} className="porto-faq-chevron" />
                    </button>
                    {openFaq === index && <p className="porto-faq-answer">{answer}</p>}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── LUXURY SITE FOOTER (Porto Style) ── */}
      <footer className="porto-footer">
        <div className="porto-footer-inner">
          <div className="porto-footer-col">
            <div className="porto-brand">
              <img src="/AE-logo.png" alt="Akshat Enterprises" className="porto-brand-logo-img footer-logo" />
            </div>
            <p className="porto-footer-about">
              Wholesalers &amp; retailers of premium safety footwear, gum boots, stylish casual sneakers and construction workwear since 2014.
            </p>
            <div className="porto-footer-contact-item">
              <Phone size={14} />
              <a href="tel:9892228186">+91 98922 28186</a>
            </div>
            <div className="porto-footer-contact-item">
              <MessageCircle size={14} />
              <a href={whatsappLink('Hi Akshat Enterprises, I have a query.')}>Chat on WhatsApp</a>
            </div>
          </div>

          <div className="porto-footer-col">
            <h4 className="porto-footer-heading">Collections</h4>
            <ul className="porto-footer-links">
              <li>
                <button type="button" onClick={() => { setActiveDept('Footwear'); navigateTo('/'); }}>
                  Footwear &amp; Shoes
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { setActiveDept('Footwear'); setActiveCategory('Safety Shoes'); navigateTo('/'); }}>
                  Safety Steel-Toe Shoes
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { setActiveDept('Footwear'); setActiveCategory('Mud Shoes / Gum Boots'); navigateTo('/'); }}>
                  Gum Boots &amp; Rain Shoes
                </button>
              </li>
              <li>
                <button type="button" onClick={() => { setActiveDept('Jackets'); navigateTo('/'); }}>
                  Construction Jackets
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('/products')}>
                  All Catalog Products
                </button>
              </li>
            </ul>
          </div>

          <div className="porto-footer-col">
            <h4 className="porto-footer-heading">Customer Service</h4>
            <ul className="porto-footer-links">
              <li>
                <button type="button" onClick={() => navigateTo('/cart')}>
                  Shopping Cart
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateTo('/admin')}>
                  Admin Portal
                </button>
              </li>
              <li>
                <a href="#location">Store Location &amp; Map</a>
              </li>
              <li>
                <a href={`tel:${secondPhone}`}>Direct Store Line</a>
              </li>
            </ul>
          </div>

          <div className="porto-footer-col">
            <h4 className="porto-footer-heading">Shop Hours &amp; Location</h4>
            <p className="porto-footer-address">
              Shop No. 51, Janta Market, Sector-23, Turbhe, Navi Mumbai – 400705
            </p>
            <p className="porto-footer-timings">
              <strong>Mon – Sun:</strong> 10:00 AM – 9:00 PM
            </p>
            <div className="porto-payment-badges">
              <span>UPI</span>
              <span>GPay</span>
              <span>Cash</span>
              <span>Visa</span>
              <span>Mastercard</span>
            </div>
          </div>
        </div>

        <div className="porto-footer-bottom">
          <div className="porto-footer-bottom-inner">
            <p>© {new Date().getFullYear()} Akshat Enterprises eCommerce. All rights reserved.</p>
            <div className="porto-footer-social">
              <a href={whatsappLink('Hi Akshat Enterprises.')} aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <MessageCircle size={16} />
              </a>
              <a href={`tel:${secondPhone}`} aria-label="Call">
                <Phone size={16} />
              </a>
              <a href="#instagram" aria-label="Instagram">
                <Instagram size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── SLIDE-OUT MINI-CART DRAWER (Porto Style) ── */}
      {cartDrawerOpen && (
        <div className="porto-drawer-overlay" onClick={() => setCartDrawerOpen(false)}>
          <aside className="porto-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="porto-drawer-header">
              <div className="porto-drawer-title">
                <ShoppingCart size={18} />
                <span>Shopping Cart ({totalCartCount})</span>
              </div>
              <button
                type="button"
                className="porto-drawer-close-btn"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close cart drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="porto-drawer-body">
              {cart.length === 0 ? (
                <div className="porto-drawer-empty">
                  <ShoppingCart size={40} className="porto-empty-icon" />
                  <p>Your shopping cart is empty.</p>
                  <button
                    type="button"
                    className="porto-hero-cta-btn"
                    onClick={() => setCartDrawerOpen(false)}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="porto-drawer-items">
                  {cart.map((item, index) => (
                    <div className="porto-drawer-item" key={`${item.name}-${item.selectedSize || index}`}>
                      <img src={item.image} alt={item.name} className="porto-drawer-item-thumb" />
                      <div className="porto-drawer-item-info">
                        <strong>{item.name}</strong>
                        {item.selectedSize && <span className="porto-drawer-size">Size: {item.selectedSize}</span>}
                        <div className="porto-drawer-item-meta">
                          <span className="porto-drawer-price">{item.price}</span>
                          <span className="porto-drawer-qty-badge">× {item.quantity}</span>
                        </div>
                        <div className="porto-drawer-stepper">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            className="porto-drawer-remove"
                            onClick={() => handleRemoveItem(index)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="porto-drawer-footer">
                <div className="porto-drawer-subtotal">
                  <span>Subtotal:</span>
                  <strong>₹{cartTotalPrice.toLocaleString('en-IN')}</strong>
                </div>
                <button
                  type="button"
                  className="porto-drawer-view-cart-btn"
                  onClick={() => navigateTo('/cart')}
                >
                  View Full Cart &amp; Breakdown
                </button>
                <a
                  className="porto-drawer-whatsapp-btn"
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hi Akshat Enterprises, I would like to confirm my order of ${totalCartCount} items worth ₹${cartTotalPrice.toLocaleString('en-IN')}. Please share availability and payment details!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={16} /> Confirm Order via WhatsApp
                </a>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ── CATEGORY SIDEBAR POPUP DRAWER (Slides left to right with blurred background) ── */}
      {categorySidebarOpen && (
        <div
          className="porto-categories-drawer-overlay"
          onClick={() => setCategorySidebarOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Category Navigation"
        >
          <aside
            className="porto-categories-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="porto-categories-drawer-header">
              <div className="porto-drawer-brand">
                <img src="/AE-logo.png" alt="Akshat Enterprises" className="porto-drawer-logo-img" />
              </div>
              <button
                type="button"
                className="porto-categories-drawer-close-btn"
                onClick={() => setCategorySidebarOpen(false)}
                aria-label="Close categories sidebar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="porto-categories-drawer-body">
              <ul className="porto-categories-drawer-list">
                {/* All Products & Catalog from database */}
                <li>
                  <button
                    type="button"
                    className={`porto-categories-drawer-item${activeDept === 'all' && activeCategory === 'All Products' ? ' active' : ''}`}
                    onClick={() => handleSelectDrawerCategory('all', 'All Products')}
                  >
                    <div className="porto-drawer-cat-info">
                      <span>All Products &amp; All Gear</span>
                    </div>
                    <div className="porto-drawer-cat-meta">
                      <span className="porto-drawer-badge">{products.length}</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>
                </li>

                {/* Dynamic Departments and Subcategories from Database */}
                {dbDepartments
                  .filter((d) => d.id !== 'all')
                  .map((dept) => {
                    const deptCount = deptCounts[dept.id] || 0;
                    const subcats = dbCategoriesByDept[dept.id] || [];
                    const isDeptActive = activeDept === dept.id;

                    return (
                      <li key={dept.id} className="porto-drawer-dept-group">
                        <button
                          type="button"
                          className={`porto-categories-drawer-item porto-drawer-dept-main${isDeptActive && activeCategory === 'All Products' ? ' active' : ''}`}
                          onClick={() => handleSelectDrawerCategory(dept.id, 'All Products')}
                        >
                          <div className="porto-drawer-cat-info">
                            <span className="porto-drawer-emoji">{dept.emoji}</span>
                            <strong>{dept.label}</strong>
                          </div>
                          <div className="porto-drawer-cat-meta">
                            <span className="porto-drawer-badge">{deptCount}</span>
                            <ChevronRight size={14} />
                          </div>
                        </button>

                        {/* Subcategories list from database */}
                        {subcats.length > 0 && (
                          <div className="porto-drawer-subcat-list">
                            {subcats.map(({ category, count }) => {
                              const isCatActive = isDeptActive && activeCategory === category;
                              return (
                                <button
                                  key={category}
                                  type="button"
                                  className={`porto-drawer-subcat-item${isCatActive ? ' active' : ''}`}
                                  onClick={() => handleSelectDrawerCategory(dept.id, category)}
                                >
                                  <span className="porto-subcat-bullet" />
                                  <span className="porto-subcat-name">{category}</span>
                                  <span className="porto-subcat-count-badge">{count}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}

                {/* Explore Full Catalog */}
                <li>
                  <button
                    type="button"
                    className="porto-categories-drawer-item porto-categories-drawer-item-special"
                    onClick={() => {
                      navigateTo('/products');
                      setCategorySidebarOpen(false);
                    }}
                  >
                    <span>Explore Full Catalog</span>
                    <span className="porto-hot-tag">HOT</span>
                  </button>
                </li>
              </ul>

              {/* Department shortcuts in drawer */}
              <div className="porto-drawer-dept-section">
                <span className="porto-drawer-dept-heading">Quick Departments</span>
                <div className="porto-drawer-dept-grid">
                  {dbDepartments.map((dept) => {
                    const count = deptCounts[dept.id] || 0;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        className={`porto-drawer-dept-pill${activeDept === dept.id ? ' active' : ''}`}
                        onClick={() => handleSelectDrawerCategory(dept.id, 'All Products')}
                      >
                        <span className="porto-drawer-dept-emoji">{dept.emoji}</span>
                        <span>{dept.label}</span>
                        <small className="porto-dept-pill-count">({count})</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer with Store Contact */}
            <div className="porto-categories-drawer-footer">
              <div className="porto-drawer-footer-store">
                <strong>Akshat Enterprises</strong>
                <small>Shop No. 12, Janta Market, Turbhe</small>
              </div>
              <a
                href={whatsappLink('Hi Akshat Enterprises, I have an enquiry about your catalog.')}
                target="_blank"
                rel="noreferrer"
                className="porto-drawer-whatsapp-link"
              >
                <MessageCircle size={15} /> WhatsApp Enquiry
              </a>
            </div>
          </aside>
        </div>
      )}

      {/* ── QUICK VIEW MODAL ── */}
      {quickViewProduct && (
        <div className="porto-modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="porto-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="porto-modal-close"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="porto-quickview-grid">
              <div className="porto-quickview-media">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="porto-quickview-img"
                />
              </div>

              <div className="porto-quickview-info">
                <p className="porto-card-category">
                  {quickViewProduct.department} · {quickViewProduct.category}
                </p>
                <h3 className="porto-quickview-title">{quickViewProduct.name}</h3>

                <div className="porto-rating-row">
                  <div className="porto-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" stroke="#f59e0b" />
                    ))}
                  </div>
                  <span className="porto-review-count">({quickViewProduct.reviewsCount || 18} Customer Reviews)</span>
                </div>

                <div className="porto-price-row" style={{ margin: '14px 0' }}>
                  {quickViewProduct.originalPrice && (
                    <span className="porto-orig-price" style={{ fontSize: '16px' }}>
                      {quickViewProduct.originalPrice}
                    </span>
                  )}
                  <strong className="porto-current-price" style={{ fontSize: '24px' }}>
                    {quickViewProduct.price}
                  </strong>
                </div>

                <p className="porto-quickview-desc">
                  Heavy-duty, premium build curated by Akshat Enterprises. Ideal for work safety, durability, and daily street comfort.
                </p>

                {quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && (
                  <div className="porto-quickview-sizes">
                    <label>Select Size (IND):</label>
                    <div className="porto-size-pills">
                      {quickViewProduct.sizes.map((s) => (
                        <button
                          type="button"
                          key={s}
                          className={`porto-size-pill${quickViewSize === s ? ' active' : ''}`}
                          onClick={() => setQuickViewSize(s)}
                        >
                          {s.replace('IND ', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="porto-quickview-actions">
                  <button
                    type="button"
                    className="porto-hero-cta-btn"
                    style={{ flex: 1, padding: '12px 20px' }}
                    onClick={() => {
                      handleAddToCart(quickViewProduct, quickViewSize);
                      setQuickViewProduct(null);
                    }}
                  >
                    <ShoppingCart size={16} /> ADD TO CART
                  </button>

                  <a
                    className="porto-hero-cta-btn porto-hero-cta-btn-alt"
                    style={{ padding: '12px 18px' }}
                    href={whatsappLink(
                      `Hi Akshat Enterprises, I want to enquire about ${quickViewProduct.name} (${quickViewProduct.price}, Size: ${quickViewSize}).`
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={16} /> Enquire
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING WHATSAPP BUTTON ── */}
      <a
        className="porto-floating-whatsapp"
        href={whatsappLink('Hi Akshat Enterprises, I want help choosing footwear and workwear.')}
        target="_blank"
        rel="noreferrer"
        aria-label="Direct WhatsApp Chat"
      >
        <MessageCircle size={22} />
        <span>Chat with Store</span>
      </a>
    </div>
  );
}
