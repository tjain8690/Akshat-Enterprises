import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  User,
  Share2,
} from 'lucide-react';
import { CartPage, CartItem } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminPage } from './pages/AdminPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductZoomModal } from './components/ProductZoomModal';
import { QuickAddToCartModal } from './components/QuickAddToCartModal';
import { LegalModal, LegalModalTab } from './components/LegalModal';
import { ProductDescriptionPage } from './pages/ProductDescriptionPage';
import {
  loadProducts,
  subscribeToProducts,
  loadBanners,
  subscribeToBanners,
  SEED_BANNERS,
  loadCategoryCards,
  loadVibeCards,
  SEED_CATEGORY_CARDS,
  SEED_VIBE_CARDS,
  SEED_PRODUCTS,
} from './productStore';
import type { Banner, CategoryCard, VibeCard } from './types';
import {
  whatsappNumber,
  secondPhone,
  whatsappLink,
  getCartUrl,
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

const customAdminPath = (import.meta as any).env?.VITE_ADMIN_PATH || '/portal-ae';
const isAdminPath = (path: string): boolean => {
  // Common guessable paths are strictly blocked
  if (path === '/admin' || path === '/admin-login') return false;
  if (customAdminPath && path === customAdminPath) return true;
  return path === '/portal-ae' || path === '/bharat';
};

  // Dedicated Owner Admin Authorization State
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && isAdminPath(window.location.pathname)) {
      return true;
    }
    try {
      return sessionStorage.getItem('ae_owner_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    // Strict block: Anyone attempting /admin or /admin-login is silently redirected to home
    if (p === '/admin' || p === '/admin-login') {
      window.history.replaceState(null, '', '/');
      return '/';
    }
    if (isAdminPath(p)) {
      try {
        sessionStorage.setItem('ae_owner_unlocked', 'true');
      } catch {}
      return p;
    }
    return p;
  });

  // Watch for URL navigation changes: block /admin, only allow secret admin path (/portal-ae, /bharat, or custom VITE_ADMIN_PATH)
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/admin' || p === '/admin-login') {
        window.history.replaceState(null, '', '/');
        setCurrentPath('/');
        return;
      }
      if (isAdminPath(p)) {
        try {
          sessionStorage.setItem('ae_owner_unlocked', 'true');
        } catch {}
        setIsOwnerUnlocked(true);
        setCurrentPath(p);
        return;
      }
      setCurrentPath(p);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Search input in header
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Quick View Modal product
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewSize, setQuickViewSize] = useState<string>('');

  // Mini-cart drawer
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDropdownOpen, setWishlistDropdownOpen] = useState(false);

  // Product Zoom Magnifier Modal (Opens on Card Image Click)
  const [zoomModalProduct, setZoomModalProduct] = useState<Product | null>(null);

  // Single Product Quick Add Modal (Image 1 Desktop / Image 2 Mobile Bottom Sheet)
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  // Legal, Compliance & Policies Modal (Terms, Privacy, Shipping, Grievance)
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalModalTab>('terms');

  const handleOpenLegal = (tab: LegalModalTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // Category sidebar popup drawer (slides left to right)
  const [categorySidebarOpen, setCategorySidebarOpen] = useState(false);

  // Dedicated Admin Opener (Routes to /admin-login)
  const openOwnerAdmin = (path = '/admin-login') => {
    try {
      sessionStorage.setItem('ae_owner_unlocked', 'true');
    } catch {}
    setIsOwnerUnlocked(true);
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCartDrawerOpen(false);
    setMenuOpen(false);
  };

  const closeOwnerAdmin = () => {
    try {
      sessionStorage.removeItem('ae_owner_unlocked');
    } catch {}
    setIsOwnerUnlocked(false);
    window.history.pushState(null, '', '/');
    setCurrentPath('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Normal Logo Click returns to store home
  const handleLogoClick = () => {
    navigateTo('/');
  };

  // Hero Banners (dynamic from database table 'banners')
  const [banners, setBanners] = useState<Banner[]>(SEED_BANNERS);

  // Shop by Category & Our Vibe cards (dynamic from database)
  const [categoryCards, setCategoryCards] = useState<CategoryCard[]>(SEED_CATEGORY_CARDS);
  const [vibeCards, setVibeCards] = useState<VibeCard[]>(SEED_VIBE_CARDS);

  // Filter hero banners from banners list (excluding promo banner)
  const heroBanners = useMemo(() => {
    const list = banners.filter((b) => b.type !== 'promo');
    return list.length > 0 ? list : banners;
  }, [banners]);

  // The Season of Raw promo banner
  const promoBanner = useMemo(() => {
    return (
      banners.find((b) => b.type === 'promo') || {
        id: 'seed-banner-promo',
        title: 'THE SEASON OF RAW',
        eyebrow: 'UP TO',
        department: 'Footwear',
        category: 'All Products',
        priceLabel: 'UP TO',
        price: '40% OFF',
        ctaText: 'EXPLORE DROP',
        image: '/images/promo_season_raw.jpg',
        isActive: true,
        type: 'promo',
      }
    );
  }, [banners]);

  // Hero Ad Cards Slider index
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Continuous auto-slider: runs every 2s continuously and NEVER stops or freezes on button click or scroll!
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroBanners.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);


  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Products state (seeded initially so direct links from WhatsApp render instantly)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('akshat_products_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_PRODUCTS;
  });
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

  // Callbacks to refresh database data
  const refreshCategoryCards = useCallback(() => {
    loadCategoryCards().then((data) => {
      if (data && data.length > 0) setCategoryCards(data);
    });
  }, []);

  const refreshVibeCards = useCallback(() => {
    loadVibeCards().then((data) => {
      if (data && data.length > 0) setVibeCards(data);
    });
  }, []);

  const refreshBanners = useCallback(() => {
    loadBanners().then((data) => {
      if (data && data.length > 0) setBanners(data);
    });
  }, []);

  // Load category cards and vibe cards from database on mount
  useEffect(() => {
    loadCategoryCards()
      .then((data) => {
        if (data && data.length > 0) setCategoryCards(data);
      })
      .catch((err) => console.warn('Category cards load warning:', err));

    loadVibeCards()
      .then((data) => {
        if (data && data.length > 0) setVibeCards(data);
      })
      .catch((err) => console.warn('Vibe cards load warning:', err));
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

  // Close search bar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const navigateTo = (path: string) => {
    if (path === '/admin' || path === '/admin-login') {
      window.history.replaceState(null, '', '/');
      setCurrentPath('/');
      return;
    }
    if (isAdminPath(path)) {
      try {
        sessionStorage.setItem('ae_owner_unlocked', 'true');
      } catch {}
      setIsOwnerUnlocked(true);
    }
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCartDrawerOpen(false);
    setMenuOpen(false);
  };

  // Search submit handler: switches to department and scrolls to footwear/category
  const handleSearchSubmit = (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = (overrideQuery ?? searchQuery).trim().toLowerCase();
    if (overrideQuery !== undefined) {
      setSearchQuery(overrideQuery);
    }

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

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Updated "${updated.name}" stock`);
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

  const handleClearWishlist = () => {
    setWishlist([]);
    showToast('Wishlist cleared');
  };

  // ─── Cart handlers ────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product, size?: string, quantity: number = 1) => {
    const chosenSize = size || product.sizes?.[0] || 'IND 8';
    const qtyToAdd = Math.max(1, quantity || 1);
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.name === product.name && item.selectedSize === chosenSize
      );
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qtyToAdd,
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
          quantity: qtyToAdd,
          selectedSize: chosenSize,
        },
      ];
    });
    showToast(`Added ${qtyToAdd > 1 ? `${qtyToAdd}x ` : ''}"${product.name}" (${chosenSize}) to cart!`);
    // Note: Do not auto-open right-side cart drawer per user requirement
  };

  const handleBatchAddToCart = (product: Product, items: { size: string; quantity: number }[]) => {
    if (!items || items.length === 0) return;
    setCart((prevCart) => {
      const updated = [...prevCart];
      items.forEach(({ size, quantity }) => {
        if (quantity <= 0) return;
        const existingIdx = updated.findIndex(
          (item) => item.name === product.name && item.selectedSize === size
        );
        if (existingIdx > -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity,
          };
        } else {
          updated.push({
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            tag: product.tag,
            quantity: quantity,
            selectedSize: size,
          });
        }
      });
      return updated;
    });
    const totalAdded = items.reduce((sum, it) => sum + it.quantity, 0);
    showToast(`Added ${totalAdded} pairs of "${product.name}" (${items.map((i) => `${i.quantity}x ${i.size}`).join(', ')}) to cart!`);
  };

  const handleSetItemQuantity = (index: number, quantity: number) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      if (!item) return prevCart;
      const validQty = Math.max(1, quantity);
      const updated = [...prevCart];
      updated[index] = { ...item, quantity: validQty };
      return updated;
    });
  };

  const handleUpdateItemSize = (index: number, newSize: string) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      if (!item || item.selectedSize === newSize) return prevCart;
      const existingIdx = prevCart.findIndex(
        (it, idx) => idx !== index && it.name === item.name && it.selectedSize === newSize
      );
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + item.quantity,
        };
        return updated.filter((_, idx) => idx !== index);
      }
      const updated = [...prevCart];
      updated[index] = { ...item, selectedSize: newSize };
      return updated;
    });
  };

  const handleAddAnotherSize = (itemName: string, newSize: string, quantity: number) => {
    const baseProduct = products.find((p) => p.name === itemName) || cart.find((i) => i.name === itemName);
    if (!baseProduct) return;
    handleAddToCart(baseProduct as Product, newSize, quantity);
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

  // Wishlist products memo
  const wishlistProducts = useMemo(() => {
    return products.filter((p) => wishlist.includes(p.id));
  }, [products, wishlist]);

  // Check if current route is Product Description Page
  const isProductDetailPage =
    currentPath.startsWith('/product-description') ||
    (currentPath.startsWith('/product') && currentPath !== '/products' && !currentPath.startsWith('/products/'));

  const detailProductQuery = useMemo(() => {
    if (!isProductDetailPage) return null;
    try {
      const search = window.location.search;
      if (search) {
        const sp = new URLSearchParams(search);
        const qId = sp.get('id');
        const qName = sp.get('name');
        return { id: qId, name: qName };
      }
      const parts = currentPath.split('/');
      if (parts.length >= 3 && parts[2]) {
        return { id: decodeURIComponent(parts[2]), name: null };
      }
    } catch {}
    return null;
  }, [currentPath, isProductDetailPage]);

  const currentDetailProduct = useMemo(() => {
    if (!isProductDetailPage) return null;
    if (detailProductQuery) {
      const { id, name } = detailProductQuery;

      // 1. Direct ID match (checks UUID or seed-id)
      if (id) {
        const found = products.find((p) => p.id === id);
        if (found) return found;

        // 2. If ID is a seed ID (e.g. 'seed-1'), match by corresponding seed name in products
        const seedMatch = SEED_PRODUCTS.find((s) => s.id === id);
        if (seedMatch) {
          const bySeedName = products.find(
            (p) => p.name.toLowerCase().trim() === seedMatch.name.toLowerCase().trim()
          );
          if (bySeedName) return bySeedName;
        }

        // 3. If ID is a name slug or partial name
        const cleanId = decodeURIComponent(id).toLowerCase().trim();
        const bySlug = products.find(
          (p) =>
            p.name.toLowerCase().trim() === cleanId ||
            p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanId
        );
        if (bySlug) return bySlug;
      }

      // 4. Fallback match by product name parameter if ID is from a different environment
      if (name) {
        const cleanName = decodeURIComponent(name).toLowerCase().trim();
        const byName = products.find(
          (p) => p.name.toLowerCase().trim() === cleanName
        );
        if (byName) return byName;
      }
    }
    return products[0] || null;
  }, [isProductDetailPage, detailProductQuery, products]);

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

  // Standalone Isolated Admin Portal View (Accessible ONLY via separate direct link, not from main site)
  if (isAdminPath(currentPath)) {
    return (
      <div className={`app ax-app ax-admin-standalone-wrapper${dark ? ' dark' : ''}`}>
        <AdminPage
          products={products}
          banners={banners}
          categoryCards={categoryCards}
          vibeCards={vibeCards}
          onBannersChange={refreshBanners}
          onCategoryCardsChange={refreshCategoryCards}
          onVibeCardsChange={refreshVibeCards}
          dark={dark}
          onPublish={handlePublishProduct}
          onDelete={handleDeleteProduct}
          onUpdate={handleUpdateProduct}
          onNavigateHome={closeOwnerAdmin}
        />
      </div>
    );
  }

  return (
    <div className={`app ax-app${dark ? ' dark' : ''}${categorySidebarOpen ? ' porto-sidebar-active' : ''}`}>
      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="porto-toast" role="status">
          <Check size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Top Announcement Bar (APEX Signature Style) ── */}
      <div className="ax-topbar">
        <p>
          <strong>FREE SHIPPING</strong> ON ALL ORDERS <span>|</span> EASY RETURNS
        </p>
        <a href={`tel:${secondPhone}`} className="ax-topbar-phone ax-hide-sm">
          <Phone size={12} /> Turbhe Store: 98922 28186
        </a>
      </div>

      {/* ── Main Site Header & Navbar (APEX Design) ── */}
      <header className={`ax-header${menuOpen ? ' menu-open' : ''}`}>
        <div className="ax-header-inner">
          {/* Brand Logo & Mobile Menu Toggle */}
          <div className="ax-header-left">
            <button
              type="button"
              className="ax-icon-btn ax-menu-toggle"
              onClick={() => {
                setMenuOpen(!menuOpen);
                if (!menuOpen) setSearchOpen(false);
              }}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <a
              className="ax-logo"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                handleLogoClick();
              }}
              aria-label="Akshat Enterprises"
            >
              <div className="ax-brand-group">
                <img
                  src="/Akshat_logo.png"
                  alt="Akshat Enterprises"
                  className="ax-brand-ae"
                />
              </div>
            </a>
          </div>

          {/* Center Navigation Links (Exact from Design) */}
          <nav className={`ax-nav${menuOpen ? ' open' : ''}`}>
            <button
              type="button"
              className={`ax-nav-link${activeDept === 'all' && activeCategory === 'All Products' && currentPath === '/' ? ' active' : ''}`}
              onClick={() => {
                setActiveDept('all');
                setActiveCategory('All Products');
                navigateTo('/');
                setMenuOpen(false);
              }}
            >
              Shop
            </button>
            <button
              type="button"
              className={`ax-nav-link${activeCategory === 'New Arrivals' ? ' active' : ''}`}
              onClick={() => {
                setActiveDept('all');
                setActiveCategory('All Products');
                navigateTo('/');
                setMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('trending-drops') || document.getElementById('featured');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
            >
              New Arrivals
            </button>
            <button
              type="button"
              className={`ax-nav-link${activeDept === 'Footwear' && activeCategory !== 'Casual' ? ' active' : ''}`}
              onClick={() => {
                setActiveDept('Footwear');
                setActiveCategory('All Products');
                navigateTo('/');
                setMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('trending-drops') || document.getElementById('featured');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
            >
              Shoes
            </button>
            <button
              type="button"
              className={`ax-nav-link${activeDept === 'Jackets' ? ' active' : ''}`}
              onClick={() => {
                setActiveDept('Jackets');
                setActiveCategory('All Products');
                navigateTo('/');
                setMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('trending-drops') || document.getElementById('featured');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
            >
              Jackets
            </button>
            <button
              type="button"
              className={`ax-nav-link${activeCategory === 'Caps' || (activeDept === 'Accessories' && activeCategory === 'Caps') ? ' active' : ''}`}
              onClick={() => {
                setActiveDept('Accessories');
                setActiveCategory('Caps');
                navigateTo('/');
                setMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('trending-drops') || document.getElementById('featured');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
            >
              Caps
            </button>
            <button
              type="button"
              className={`ax-nav-link${activeCategory === 'Casual' ? ' active' : ''}`}
              onClick={() => {
                setActiveDept('Footwear');
                setActiveCategory('Casual');
                navigateTo('/');
                setMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('trending-drops') || document.getElementById('featured');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
            >
              Sandals
            </button>
          </nav>

          {/* Right Header Action Icons */}
          <div className="ax-header-actions">
            {/* Search Slot:
                Desktop (>820px): Shows Search icon when closed; shows expanding slide pill when open (replaces button cleanly).
                Mobile (<=820px): Shows the single navbar toggle icon (Search <-> X) with no extra background.
            */}
            <div className="ax-search-slot">
              {/* Desktop Search Button (when search is closed) */}
              {!searchOpen && (
                <button
                  type="button"
                  className="ax-icon-btn ax-desktop-search-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search catalog"
                  title="Search catalog"
                >
                  <Search size={19} />
                </button>
              )}

              {/* Desktop-only expanding pill (shown only on desktop when open, replaces the button cleanly) */}
              {searchOpen && (
                <form
                  className="ax-search-slide-form ax-desktop-search-form"
                  onSubmit={(e) => {
                    handleSearchSubmit(e);
                    setSearchOpen(false);
                  }}
                >
                  <div className="ax-search-pill">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="ax-search-pill-submit"
                      title="Search"
                      aria-label="Search"
                    >
                      <Search size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="ax-search-pill-close"
                    onClick={() => setSearchOpen(false)}
                    title="Close search"
                    aria-label="Close search"
                  >
                    <X size={17} />
                  </button>
                </form>
              )}

              {/* Mobile-only navbar toggle button (single cross in navbar when open, search when closed) */}
              <button
                type="button"
                className="ax-icon-btn ax-mobile-search-toggle"
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (!searchOpen) setMenuOpen(false);
                }}
                aria-label={searchOpen ? 'Close search' : 'Search catalog'}
                title={searchOpen ? 'Close search' : 'Search catalog'}
              >
                {searchOpen ? <X size={20} /> : <Search size={19} />}
              </button>
            </div>

            {/* Wishlist Icon with Dropdown on Hover */}
            <div
              className="ax-wishlist-hover-wrapper"
              onMouseEnter={() => setWishlistDropdownOpen(true)}
              onMouseLeave={() => setWishlistDropdownOpen(false)}
            >
              <button
                type="button"
                className={`ax-icon-btn${currentPath === '/wishlist' ? ' active' : ''}`}
                onClick={() => {
                  setWishlistDropdownOpen(false);
                  navigateTo('/wishlist');
                }}
                aria-label="View wishlist"
                title="My Wishlist"
              >
                <Heart
                  size={19}
                  fill={wishlist.length > 0 ? '#e5322d' : 'none'}
                  stroke={wishlist.length > 0 ? '#e5322d' : 'currentColor'}
                />
                {wishlist.length > 0 && <span className="ax-badge">{wishlist.length}</span>}
              </button>

              {/* Wishlist Hover Dropdown (shows up to 4 items and View More button) */}
              {wishlistDropdownOpen && (
                <div className="ax-wishlist-dropdown">
                  <div className="ax-wishlist-dd-header">
                    <span className="ax-wishlist-dd-title">
                      <Heart size={14} fill="#e5322d" stroke="#e5322d" />
                      Wishlist
                    </span>
                    <span className="ax-wishlist-dd-count">
                      {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="ax-wishlist-dd-empty">
                      <Heart size={24} stroke="#94a3b8" />
                      <span>Your wishlist is empty</span>
                    </div>
                  ) : (
                    <>
                      <div className="ax-wishlist-dd-items">
                        {wishlistProducts.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="ax-wishlist-dd-row"
                            onClick={() => {
                              setWishlistDropdownOpen(false);
                              navigateTo(`/product-description?id=${item.id}`);
                            }}
                          >
                            <img
                              src={item.image || '/images/safety_shoes.jpg'}
                              alt={item.name}
                              className="ax-wishlist-dd-thumb"
                            />
                            <div className="ax-wishlist-dd-info">
                              <span className="ax-wishlist-dd-name" title={item.name}>
                                {item.name}
                              </span>
                              <span className="ax-wishlist-dd-price">
                                {item.price ? (item.price.startsWith('₹') ? item.price : `₹${item.price}`) : '₹999'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="ax-wishlist-dd-del-btn"
                              title="Remove from wishlist"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(item.id);
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="ax-wishlist-dd-more-btn"
                        onClick={() => {
                          setWishlistDropdownOpen(false);
                          navigateTo('/wishlist');
                        }}
                      >
                        View More {wishlistProducts.length > 4 ? `(${wishlistProducts.length})` : ''} &rarr;
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Icon with Count Badge */}
            <button
              type="button"
              className="ax-icon-btn"
              onClick={() => setCartDrawerOpen(true)}
              aria-label="Open shopping cart"
              title="Shopping cart"
            >
              <ShoppingCart size={19} />
              {totalCartCount > 0 && <span className="ax-badge accent">{totalCartCount}</span>}
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Search Panel (Clean full-width pill, black button/border, single navbar cross) */}
        {searchOpen && (
          <div className="ax-mobile-search-panel">
            <form
              className="ax-mobile-search-form"
              onSubmit={(e) => {
                handleSearchSubmit(e);
                setSearchOpen(false);
              }}
            >
              <div className="ax-mobile-search-pill">
                <Search size={18} className="ax-mobile-search-icon" />
                <input
                  type="text"
                  placeholder="Search safety shoes, jackets, boots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="ax-mobile-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search input"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="ax-mobile-search-submit"
                  aria-label="Search"
                >
                  <Search size={15} />
                </button>
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Dimmed backdrop when mobile search is active */}
      {searchOpen && (
        <div
          className="ax-search-backdrop"
          onClick={() => setSearchOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main App Content ── */}
      <main id="top" className="porto-main-content">
        {currentPath === '/cart' ? (
          <CartPage
            cart={cart}
            products={products}
            onUpdateQuantity={handleUpdateQuantity}
            onSetItemQuantity={handleSetItemQuantity}
            onUpdateItemSize={handleUpdateItemSize}
            onAddAnotherSize={handleAddAnotherSize}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigateHome={() => navigateTo('/')}
            whatsappNumber={whatsappNumber}
          />
        ) : currentPath === '/wishlist' ? (
          <WishlistPage
            wishlist={wishlist}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onOpenQuickAdd={(prod) => setQuickAddProduct(prod)}
            onToggleWishlist={handleToggleWishlist}
            onClearWishlist={handleClearWishlist}
            onNavigateHome={() => navigateTo('/')}
            onQuickView={handleOpenQuickView}
            dark={dark}
          />
        ) : currentPath === '/products' ? (
          <ProductsPage
            products={products}
            cart={cart}
            dark={dark}
            onAddToCart={handleAddToCart}
            onOpenQuickAdd={(prod) => setQuickAddProduct(prod)}
            onUpdateQuantity={handleUpdateQuantity}
            onNavigateHome={() => navigateTo('/')}
            navigateTo={navigateTo}
          />
        ) : isProductDetailPage ? (
          currentDetailProduct ? (
            <ProductDescriptionPage
              product={currentDetailProduct}
              allProducts={products}
              cart={cart}
              wishlist={wishlist}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onUpdateQuantity={handleUpdateQuantity}
              onNavigateHome={() => navigateTo('/')}
              navigateTo={navigateTo}
              onOpenZoomModal={(prod) => setZoomModalProduct(prod)}
              onOpenQuickAdd={(prod) => setQuickAddProduct(prod)}
              dark={dark}
            />
          ) : productsLoading ? (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <div style={{ width: 34, height: 34, border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'axQaSpin 0.75s linear infinite' }} />
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Loading product details...</p>
            </div>
          ) : (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>Product Not Found</h2>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '380px' }}>The item you are looking for may have been updated or removed from our catalog.</p>
              <button className="button button-dark" onClick={() => navigateTo('/')} style={{ padding: '10px 24px', borderRadius: '9999px', background: '#0f172a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Explore All Footwear
              </button>
            </div>
          )
        ) : (
          <>
            {/* ── HERO BANNER SLIDER (Auto-slides Every 2s · Never pauses on click) ── */}
            <section className="ax-hero">
              <div
                className="ax-hero-track"
                style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
              >
                {heroBanners.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`ax-hero-slide${idx === currentHeroSlide ? ' active' : ''}`}
                  >
                    <div className="ax-hero-inner">
                      {/* Left Copy */}
                      <div className="ax-hero-copy">
                        <span className="ax-hero-chip">
                          {slide.category || 'NEW DROP'} · UNCOMPROMISING
                        </span>
                        <h1 className="ax-hero-title">
                          {slide.title || 'STEP INTO YOUR ELEMENT'}
                        </h1>
                        <p className="ax-hero-sub">
                          {slide.eyebrow || 'Uncompromising street gear. Built for the bold.'}
                        </p>
                        <div className="ax-hero-actions">
                          <button
                            type="button"
                            className="ax-btn ax-btn-dark"
                            onClick={() => {
                              setActiveDept(slide.department || 'all');
                              if (slide.category && slide.category !== 'All Products') {
                                setActiveCategory(slide.category);
                              }
                              const el = document.getElementById('trending-drops') || document.getElementById('featured');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                          >
                            {slide.ctaText || 'SHOP THE DROP'} <ChevronRight size={16} />
                          </button>
                          <button
                            type="button"
                            className="ax-btn ax-btn-outline"
                            onClick={() => {
                              const el = document.getElementById('categories');
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                          >
                            EXPLORE NOW
                          </button>
                        </div>
                      </div>

                      {/* Right Visual with clean borderless banner frame */}
                      <div className="ax-hero-visual">
                        <div className="ax-hero-frame">
                          <img
                            src={slide.image || '/images/porto_hero.jpg'}
                            alt={slide.title || 'Street gear hero'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Left / Right Nav Arrows */}
              <button
                type="button"
                className="ax-hero-arrow prev"
                onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="ax-hero-arrow next"
                onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroBanners.length)}
                aria-label="Next Slide"
              >
                <ChevronRight size={22} />
              </button>

              {/* Slide Indicator Dots at bottom right */}
              <div className="ax-hero-dots">
                {heroBanners.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`ax-hero-dot${idx === currentHeroSlide ? ' active' : ''}`}
                    onClick={() => setCurrentHeroSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </section>

            {/* ── SHOP BY CATEGORY (Dynamic from Database) ── */}
            <section id="categories" className="ax-section">
              <div className="ax-container">
                <div className="ax-section-head">
                  <h2 className="ax-section-title caps">SHOP BY CATEGORY</h2>
                </div>

                <div className="ax-cat-grid">
                  {categoryCards.map((cat) => {
                    const isActive =
                      (cat.name === 'SHOES' && activeDept === 'Footwear' && activeCategory !== 'Casual') ||
                      (cat.name === 'JACKETS' && activeDept === 'Jackets') ||
                      (cat.name === 'CAPS' && activeCategory === 'Caps') ||
                      (cat.name === 'SANDALS' && activeCategory === 'Casual') ||
                      (cat.name === 'BAGS' && activeCategory === 'Bags') ||
                      (cat.name === 'ACCESSORIES' && activeDept === 'Accessories' && activeCategory === 'All Products') ||
                      (activeDept === cat.department && activeCategory === (cat.category || 'All Products'));

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`ax-cat-tile${isActive ? ' active' : ''}`}
                        onClick={() => {
                          setActiveDept(cat.department);
                          setActiveCategory(cat.category || 'All Products');
                          document.getElementById('trending-drops')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="ax-cat-media">
                          <img src={cat.image} alt={cat.name} />
                        </div>
                        <span className="ax-cat-label">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ── OUR BEST COLLECTIONS (Matching Image 2 Reference) ── */}
            <section id="trending-drops" className="ax-section ax-collections-section">
              <span id="featured" />
              <div className="ax-container">
                <div className="ax-collections-header">
                  <div className="ax-collections-title-group">
                    <h2 className="ax-collections-title">
                      Our Best<br />Collections
                    </h2>
                  </div>

                  <div className="ax-collections-pills">
                    {/* All Categories Pill */}
                    <button
                      type="button"
                      className={`ax-collection-pill${activeDept === 'all' && activeCategory === 'All Products' ? ' active' : ''}`}
                      onClick={() => {
                        setActiveDept('all');
                        setActiveCategory('All Products');
                      }}
                    >
                      All Categories
                    </button>

                    {/* Department / Category Pills */}
                    {dbDepartments
                      .filter((d) => d.id !== 'all')
                      .map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          className={`ax-collection-pill${activeDept === dept.id ? ' active' : ''}`}
                          onClick={() => {
                            setActiveDept(dept.id);
                            setActiveCategory('All Products');
                          }}
                        >
                          {dept.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Product Grid */}
                {productsLoading ? (
                  <div className="ax-state">
                    <div className="ax-spinner" />
                    <p>Loading drops…</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="ax-state">
                    <h3>No drops found</h3>
                    <p>Try resetting department filters or search keywords.</p>
                    <button
                      type="button"
                      className="ax-btn ax-btn-dark"
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
                  <div className="ax-product-grid">
                    {filteredProducts.slice(0, 8).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cart={cart}
                        wishlist={wishlist}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCart}
                        onOpenQuickAdd={(prod) => setQuickAddProduct(prod)}
                        onUpdateQuantity={handleUpdateQuantity}
                        onQuickView={(prod) => setZoomModalProduct(prod)}
                        onOpenZoom={(prod) => setZoomModalProduct(prod)}
                        onViewProduct={(id) => navigateTo(`/product-description?id=${id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── PROMO ROW: "THE SEASON OF RAW" + "OUR VIBE" ── */}
            <section className="ax-section">
              <div className="ax-container">
                <div className="ax-promo-row">
                  {/* Left Banner: The Season of Raw (from Banner Database) */}
                  <button
                    type="button"
                    className="ax-season"
                    onClick={() => {
                      setActiveDept(promoBanner.department || 'Footwear');
                      setActiveCategory(promoBanner.category || 'All Products');
                      document.getElementById('trending-drops')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <img
                      src={promoBanner.image || '/images/promo_season_raw.jpg'}
                      alt={promoBanner.title || 'The Season of Raw'}
                    />
                    <div className="ax-season-overlay">
                      <div>
                        <h3 className="ax-season-title">
                          {(() => {
                            const rawTitle = promoBanner?.title || 'THE SEASON OF RAW';
                            if (rawTitle.includes('\n')) {
                              return rawTitle.split('\n').map((line, i, arr) => (
                                <span key={i}>
                                  {line}
                                  {i < arr.length - 1 && <br />}
                                </span>
                              ));
                            }
                            if (rawTitle.includes(' OF ')) {
                              const parts = rawTitle.split(' OF ');
                              return (
                                <>
                                  {parts[0]}<br />
                                  OF {parts.slice(1).join(' OF ')}
                                </>
                              );
                            }
                            return rawTitle;
                          })()}
                        </h3>
                      </div>
                      <div className="ax-season-bottom">
                        <div className="ax-season-badge">
                          <small>{promoBanner?.priceLabel || promoBanner?.eyebrow || 'UP TO'}</small>
                          <strong>{promoBanner?.price || '40% OFF'}</strong>
                        </div>
                        <span className="ax-season-cta">
                          {promoBanner.ctaText || 'EXPLORE DROP'} <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Right Mosaic: Our Vibe (from Database) */}
                  <div className="ax-vibe">
                    <h2 className="ax-section-title" style={{ marginBottom: '12px' }}>Our Vibe</h2>
                    <div className="ax-vibe-grid">
                      {vibeCards.map((vibe, idx) => (
                        <button
                          key={vibe.id}
                          type="button"
                          className={`ax-vibe-tile${vibe.layout === 'tall' || idx === 0 ? ' tall' : ''}`}
                          onClick={() => {
                            setActiveDept(vibe.department || 'Footwear');
                            if (vibe.category && vibe.category !== 'All Products') {
                              setActiveCategory(vibe.category);
                            } else {
                              setActiveCategory('All Products');
                            }
                            document.getElementById('trending-drops')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <img src={vibe.image} alt={vibe.title} />
                          <span>{vibe.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── VALUE PERKS STRIP ── */}
            <section className="ax-section">
              <div className="ax-container">
                <div className="ax-perks">
                  <div className="ax-perk">
                    <div className="ax-perk-icon"><Truck size={22} /></div>
                    <div>
                      <strong>FAST DISPATCH</strong>
                      <small>Direct wholesale &amp; express Turbhe delivery</small>
                    </div>
                  </div>
                  <div className="ax-perk">
                    <div className="ax-perk-icon"><ShieldCheck size={22} /></div>
                    <div>
                      <strong>GENUINE QUALITY</strong>
                      <small>Certified safety gear &amp; premium street pairs</small>
                    </div>
                  </div>
                  <div className="ax-perk">
                    <div className="ax-perk-icon"><CreditCard size={22} /></div>
                    <div>
                      <strong>SECURE PAYMENTS</strong>
                      <small>UPI, Cards, Cash &amp; GST tax invoice</small>
                    </div>
                  </div>
                  <div className="ax-perk">
                    <div className="ax-perk-icon"><Headphones size={22} /></div>
                    <div>
                      <strong>24/7 SUPPORT</strong>
                      <small>Instant WhatsApp enquiry with store staff</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── VISIT & FAQ ── */}
            <section id="location" className="ax-section">
              <div className="ax-container">
                <div className="ax-visit">
                  <div className="ax-visit-card dark">
                    <div>
                      <p className="ax-visit-eyebrow">STORE LOCATION</p>
                      <h2>TURBHE STORE · COME SAY HELLO</h2>
                      <p>
                        Shop No. 51, Janta Market, Sector-23, Turbhe, Navi Mumbai – 400705
                      </p>
                      <div className="ax-visit-meta">
                        <Clock3 size={16} /> Mon – Sun · 10:00 AM – 9:00 PM
                      </div>
                    </div>
                    <div className="ax-visit-actions">
                      <a
                        className="ax-btn ax-btn-outline"
                        href="https://www.google.com/maps/search/?api=1&query=Shop+No+51+Janta+Market+Sector+23+Turbhe+Navi+Mumbai+400705"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get Directions <ArrowUpRight size={14} />
                      </a>
                      <a
                        className="ax-btn ax-btn-whatsapp"
                        href={whatsappLink('Hi Akshat Enterprises, I want to visit your store today.')}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={15} /> WhatsApp Store
                      </a>
                    </div>
                  </div>

                  <div className="ax-visit-card">
                    <p className="ax-visit-eyebrow" style={{ color: 'var(--ax-muted)' }}>COMMON QUESTIONS</p>
                    <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Frequently Asked</h2>
                    <div className="ax-faq-list">
                      {faqs.slice(0, 4).map(([q, a], idx) => (
                        <div className={`ax-faq${openFaq === idx ? ' open' : ''}`} key={q}>
                          <button
                            type="button"
                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          >
                            <span>{q}</span>
                            <ChevronDown size={16} />
                          </button>
                          {openFaq === idx && <p>{a}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* ── APEX LUXURY FOOTER (Design Match) ── */}
      <footer className="ax-footer">
        <div className="ax-footer-inner">
          {/* Column 1: APEX Brand + Checkmarks */}
          <div className="ax-footer-brand">
            <div className="ax-brand-group" style={{ marginBottom: '16px' }}>
              <img src="/Akshat_logo_reversed.png" alt="Akshat Enterprises" className="ax-footer-logo" />
            </div>

            <ul className="ax-footer-checks">
              <li>
                <Check size={16} /> Genuine Quality
              </li>
              <li>
                <Check size={16} /> Fast Shipping
              </li>
              <li>
                <Check size={16} /> Secure Payments
              </li>
            </ul>

            <div className="ax-footer-contact">
              <a href="tel:9892228186"><Phone size={13} /> +91 98922 28186</a>
              <a href={whatsappLink('Hi Akshat Enterprises')}><MessageCircle size={13} /> Turbhe Navi Mumbai</a>
            </div>
          </div>

          {/* Column 2: SHOP */}
          <div>
            <h4>SHOP</h4>
            <ul className="ax-footer-links">
              <li><button type="button" onClick={() => { setActiveDept('Footwear'); navigateTo('/'); }}>All Shoes</button></li>
              <li><button type="button" onClick={() => { setActiveDept('Jackets'); navigateTo('/'); }}>Jackets</button></li>
              <li><button type="button" onClick={() => { setActiveDept('Accessories'); setActiveCategory('Caps'); navigateTo('/'); }}>Caps</button></li>
              <li><button type="button" onClick={() => { setActiveDept('Footwear'); setActiveCategory('Casual'); navigateTo('/'); }}>Sandals</button></li>
            </ul>
          </div>

          {/* Column 3: CUSTOMER CARE */}
          <div>
            <h4>CUSTOMER CARE</h4>
            <ul className="ax-footer-links">
              <li><a href={whatsappLink('Hi Akshat Enterprises, I need help with an order.')}>Contact Us</a></li>
              <li><button type="button" onClick={() => handleOpenLegal('shipping')}>Shipping Info</button></li>
              <li><button type="button" onClick={() => handleOpenLegal('shipping')}>Returns &amp; Exchanges</button></li>
              <li><button type="button" onClick={() => handleOpenLegal('grievance')}>Grievance Officer</button></li>
              <li><button type="button" onClick={() => navigateTo('/cart')}>Size Guide</button></li>
            </ul>
          </div>

          {/* Column 4: COMPANY */}
          <div>
            <h4>COMPANY</h4>
            <ul className="ax-footer-links">
              <li><a href="#location">About Us</a></li>
              <li><button type="button" onClick={() => navigateTo('/wishlist')}>Saved Wishlist</button></li>
              <li><button type="button" onClick={() => navigateTo('/cart')}>My Cart</button></li>
              <li><a href="#location">Sustainability</a></li>
              <li><a href="#location">Store Locator</a></li>
            </ul>
          </div>

          {/* Column 5: STORE VISIT */}
          <div>
            <h4>STORE VISIT</h4>
            <ul className="ax-footer-links">
              <li><span>Shop No. 51, Janta Market</span></li>
              <li><span>Sector-23, Turbhe, Navi Mumbai – 400705</span></li>
              <li><span>Mon–Sat: 10am – 8pm</span></li>
              <li>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Shop+No.+51,+Janta+Market,+Sector-23,+Turbhe,+Navi+Mumbai+-+400705"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--ax-accent)', fontWeight: 700 }}
                >
                  Get Directions ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: NEWSLETTER */}
          <div className="ax-footer-news">
            <h4>NEWSLETTER</h4>
            <p className="ax-footer-text">Enter your email to join the crew.</p>
            <form
              className="ax-newsletter"
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Thank you for subscribing to Akshat Enterprises!');
              }}
            >
              <input type="email" placeholder="Enter your email" required />
              <button type="submit" aria-label="Subscribe">
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="ax-footer-bottom">
          <div className="ax-footer-bottom-inner">
            <p>© {new Date().getFullYear()} Akshat Enterprises. All Rights Reserved. • GSTIN: 27AABFA2488R1ZM</p>
            <div className="ax-footer-bottom-links">
              <button type="button" onClick={() => handleOpenLegal('terms')}>
                Terms &amp; Conditions
              </button>
              <button type="button" onClick={() => handleOpenLegal('privacy')}>
                Privacy Policy
              </button>
              <button type="button" onClick={() => handleOpenLegal('shipping')}>
                Shipping &amp; Returns
              </button>
              <button type="button" onClick={() => handleOpenLegal('grievance')}>
                Grievance &amp; Disclosures
              </button>
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
                <div className="porto-drawer-wa-actions">
                  <a
                    className="porto-drawer-whatsapp-btn"
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `*Hi Akshat Enterprises, I would like to place an order for ${totalCartCount} items worth ₹${cartTotalPrice.toLocaleString('en-IN')}:*\n\n` +
                      cart.map((it, i) => `${i + 1}. ${it.name} ${it.selectedSize ? `(Size: ${it.selectedSize})` : ''} × ${it.quantity}`).join('\n') +
                      `\n\nCart Link:\n${getCartUrl()}\n\nPlease share availability and delivery details!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={15} /> Confirm Order with Store
                  </a>
                  <a
                    className="porto-drawer-share-wa-btn"
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `📦 *MY SAVED FOOTWEAR SELECTION*\n🏢 Akshat Enterprises Catalog\n\n` +
                      cart.map((it, i) => `${i + 1}. ${it.name} ${it.selectedSize ? `(Size: ${it.selectedSize})` : ''} × ${it.quantity} = ${it.price}`).join('\n') +
                      `\n\nTotal: ${totalCartCount} items | Subtotal: ₹${cartTotalPrice.toLocaleString('en-IN')}\nTurbhe, Navi Mumbai`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Share2 size={14} /> Save to My WhatsApp
                  </a>
                </div>
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
                <img src="/Akshat_logo.png" alt="Akshat Enterprises" className="porto-drawer-logo-img" />
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
                <small>Shop No. 51, Janta Market, Sector-23, Turbhe</small>
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

      {/* ── PRODUCT DETAIL VIEW MODAL (PulseSneaks Style & 4 Photo Angles) ── */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, size, quantity) => {
            handleAddToCart(product, size, quantity);
            setQuickViewProduct(null);
          }}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.includes(quickViewProduct.id)}
        />
      )}

      {/* ── PRODUCT ZOOM MAGNIFIER MODAL (Interactive hover zoom container) ── */}
      {zoomModalProduct && (
        <ProductZoomModal
          product={zoomModalProduct}
          onClose={() => setZoomModalProduct(null)}
          onViewDescription={(id) => {
            setZoomModalProduct(null);
            navigateTo(`/product-description?id=${id}`);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* ── SINGLE PRODUCT QUICK ADD POPUP MODAL (Desktop Image 1 / Mobile Image 2) ── */}
      {quickAddProduct && (
        <QuickAddToCartModal
          product={quickAddProduct}
          isOpen={Boolean(quickAddProduct)}
          onClose={() => setQuickAddProduct(null)}
          onAddToCart={(product, size, quantity) => {
            handleAddToCart(product, size, quantity);
          }}
          onBatchAddToCart={(product, items) => {
            handleBatchAddToCart(product, items);
          }}
          onViewDetails={(productId) => {
            setQuickAddProduct(null);
            navigateTo(`/product-description?id=${productId}`);
          }}
        />
      )}

      {/* ── STATUTORY LEGAL, PRIVACY & COMPLIANCE MODAL (India E-Commerce, DPDP Act 2023) ── */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

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
