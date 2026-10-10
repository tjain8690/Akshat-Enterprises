import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  Eye,
  Image as ImageIcon,
  Lock,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Upload,
  X,
  Search,
  Database,
  BarChart3,
  Layers,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Tag,
  Edit,
} from 'lucide-react';
import type { Product, Banner } from '../types';
import {
  uploadImage,
  saveProduct,
  deleteProduct,
  loadBanners,
  saveBanner,
  deleteBanner,
  uploadBannerImage,
  SEED_BANNERS,
} from '../productStore';
import { isSupabaseConfigured, getSupabaseConfig, configureSupabase } from '../supabase';

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'akshat2024';

const DEPARTMENTS_LIST = ['Footwear', 'Jackets', 'Headwear', 'Accessories'];

const CATEGORIES_BY_DEPT: Record<string, string[]> = {
  Footwear: ['Running', 'Casual', 'Basketball', 'Safety Shoes', 'Mud Shoes / Gum Boots', 'Limited Edition'],
  Jackets: ['Construction Jacket', 'Hi-Vis Jacket', 'Rain Jacket', 'Winter Jacket'],
  Headwear: ['Construction Cap', 'Safety Helmet', 'Hard Hat'],
  Accessories: ['Gloves', 'Knee Guards', 'Reflective Vest'],
};

const CATEGORIES = [
  'Running', 'Casual', 'Basketball', 'Safety Shoes', 'Mud Shoes / Gum Boots', 'Limited Edition',
  'Construction Jacket', 'Hi-Vis Jacket', 'Rain Jacket', 'Winter Jacket',
  'Construction Cap', 'Safety Helmet', 'Hard Hat',
  'Gloves', 'Knee Guards', 'Reflective Vest',
];
const TAGS = ['', 'Bestseller', 'New drop', 'Workwear', 'Sale'];
const FOOTWEAR_SIZES = ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11', 'IND 12'];
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const FIXED_COLORS = ['Black', 'White', 'Red', 'Brown', 'Navy', 'Grey', 'Tan', 'Yellow', 'Orange', 'Green'];

const COLOR_HEX: Record<string, string> = {
  Black: '#1a1a1a',
  White: '#e8e8e8',
  Red: '#e63946',
  Brown: '#8b5e3c',
  Navy: '#1d3461',
  Grey: '#9e9e9e',
  Tan: '#c8a97e',
  Yellow: '#f9c846',
  Orange: '#f4840a',
  Green: '#2d7d46',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminPageProps {
  products: Product[];
  banners?: Banner[];
  dark: boolean;
  onPublish: (product: Product) => void;
  onDelete: (id: string) => void;
  onNavigateHome: () => void;
}

interface FormState {
  name: string;
  department: string;
  category: string;
  priceValue: string;
  stock: string;
  tag: string;
  sizes: string[];
  colors: string[];
  customColor: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  department: 'Footwear',
  category: 'Running',
  priceValue: '',
  stock: '50',
  tag: '',
  sizes: [],
  colors: [],
  customColor: '',
};

const DEFAULT_BANNER_FORM: Omit<Banner, 'createdAt'> = {
  id: '',
  title: 'NEW HERO BANNER',
  eyebrow: 'Must Have',
  department: 'Footwear',
  category: 'Casual',
  priceLabel: 'STARTING AT',
  price: '₹499',
  ctaText: 'GET YOURS!',
  image: '/images/porto_hero.jpg',
  displayOrder: 1,
  isActive: true,
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AdminPage({ products, banners, dark, onPublish, onDelete, onNavigateHome }: AdminPageProps) {
  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  // Tab: 'inventory' | 'add' | 'banners'
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'banners'>('inventory');

  // Form State
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Banners Management State (Database Table 'banners')
  const [dbBanners, setDbBanners] = useState<Banner[]>(() => (banners && banners.length > 0 ? banners : SEED_BANNERS));
  const [bannerForm, setBannerForm] = useState<Omit<Banner, 'createdAt'>>(DEFAULT_BANNER_FORM);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [bannerSuccessMsg, setBannerSuccessMsg] = useState<string | null>(null);
  const [bannerErrorMsg, setBannerErrorMsg] = useState<string | null>(null);

  // Sync dbBanners
  useEffect(() => {
    if (banners && banners.length > 0) {
      setDbBanners(banners);
    } else {
      loadBanners()
        .then((data) => {
          if (data && data.length > 0) setDbBanners(data);
        })
        .catch(console.error);
    }
  }, [banners]);

  // Inventory Table filters
  const [searchFilter, setSearchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low'>('all');

  // Supabase Database Connection Modal
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().key);
  const [supabaseMsg, setSupabaseMsg] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successId, setSuccessId] = useState('');

  // Delete
  const [deletingId, setDeletingId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic categories & departments based on current database products
  const dynamicDepartments = useMemo<string[]>(() => {
    const set = new Set<string>(DEPARTMENTS_LIST);
    products.forEach((p) => {
      if (p.department) set.add(p.department);
    });
    return Array.from(set);
  }, [products]);

  const dynamicCategoriesByDept = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    dynamicDepartments.forEach((d: string) => {
      map[d] = [...(CATEGORIES_BY_DEPT[d] || [])];
    });
    products.forEach((p) => {
      const dept = p.department || 'Footwear';
      if (!map[dept]) map[dept] = [];
      if (p.category && !map[dept].includes(p.category)) {
        map[dept].push(p.category);
      }
    });
    return map;
  }, [products, dynamicDepartments]);

  const currentDeptCategories = dynamicCategoriesByDept[form.department] || CATEGORIES;

  // KPIs
  const totalStockCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock ?? 50), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.stock ?? 50) < 20).length;
  }, [products]);

  const distinctCategoriesCount = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return set.size;
  }, [products]);

  // Filtered products for inventory table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (deptFilter !== 'all' && p.department !== deptFilter) return false;
      if (stockFilter === 'low' && (p.stock ?? 50) >= 20) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = (p.category || '').toLowerCase().includes(q);
        const matchesDept = (p.department || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDept) return false;
      }
      return true;
    });
  }, [products, deptFilter, stockFilter, searchFilter]);

  const handleSaveSupabaseConfig = () => {
    const success = configureSupabase(supabaseUrlInput, supabaseKeyInput);
    if (success) {
      setSupabaseMsg('Connected to Supabase! Reloading data…');
      setTimeout(() => window.location.reload(), 1200);
    } else {
      setSupabaseMsg('Disconnected from Supabase. In local storage mode.');
    }
  };

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPwError(false);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 1200);
    }
  };

  // ─── Image handling ─────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ─── Form helpers ────────────────────────────────────────────────────────────
  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const toggleColor = (color: string) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(color) ? f.colors.filter((c) => c !== color) : [...f.colors, color],
    }));
  };

  const addCustomColor = () => {
    const trimmed = form.customColor.trim();
    if (trimmed && !form.colors.includes(trimmed)) {
      setForm((f) => ({
        ...f,
        colors: [...f.colors, trimmed],
        customColor: '',
      }));
    }
  };

  const formatPriceDisplay = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return '';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // ─── Publish ─────────────────────────────────────────────────────────────────
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !imagePreview && !imageUrlInput.trim()) {
      setSubmitError('Please upload an image or provide an image URL.');
      return;
    }
    if (!form.name.trim()) {
      setSubmitError('Product name is required.');
      return;
    }
    const priceNum = parseInt(form.priceValue, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      setSubmitError('Enter a valid price.');
      return;
    }
    if (form.sizes.length === 0) {
      setSubmitError('Select at least one size.');
      return;
    }
    if (form.colors.length === 0) {
      setSubmitError('Select at least one color.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      let imageUrl = imagePreview || imageUrlInput.trim();
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const saved = await saveProduct({
        name: form.name.trim(),
        department: form.department,
        category: form.category.trim() || 'General',
        price: formatPriceDisplay(form.priceValue),
        priceValue: priceNum,
        stock: parseInt(form.stock, 10) || 50,
        image: imageUrl,
        tag: form.tag || undefined,
        sizes: (form.department === 'Footwear' ? FOOTWEAR_SIZES : APPAREL_SIZES).filter((s) => form.sizes.includes(s)),
        colors: form.colors,
      });
      onPublish(saved);
      setSuccessId(saved.id);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview('');
      setImageUrlInput('');
      setIsCustomCategory(false);
      // Switch back to inventory view to see the new product
      setActiveTab('inventory');
      setTimeout(() => setSuccessId(''), 3500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to publish product.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this product from the database catalogue?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      onDelete(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeletingId('');
    }
  };

  // ─── Banner Handlers (Database Table: 'banners') ────────────────────────────
  const handleSelectEditBanner = (b: Banner) => {
    setEditingBannerId(b.id);
    setBannerForm({
      id: b.id,
      title: b.title,
      eyebrow: b.eyebrow,
      department: b.department,
      category: b.category,
      priceLabel: b.priceLabel,
      price: b.price,
      ctaText: b.ctaText,
      image: b.image,
      displayOrder: b.displayOrder ?? 1,
      isActive: b.isActive !== false,
    });
    setBannerImageFile(null);
    setBannerImagePreview(b.image);
    setBannerSuccessMsg(null);
    setBannerErrorMsg(null);
  };

  const handleResetBannerForm = () => {
    setEditingBannerId(null);
    setBannerForm({
      ...DEFAULT_BANNER_FORM,
      displayOrder: dbBanners.length + 1,
    });
    setBannerImageFile(null);
    setBannerImagePreview('');
    setBannerSuccessMsg(null);
    setBannerErrorMsg(null);
  };

  const handleBannerFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setBannerImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setBannerImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) {
      setBannerErrorMsg('Please enter a banner title.');
      return;
    }

    setBannerSubmitting(true);
    setBannerErrorMsg(null);
    setBannerSuccessMsg(null);

    try {
      let finalImg = bannerForm.image;
      if (bannerImageFile) {
        finalImg = await uploadBannerImage(bannerImageFile);
      } else if (bannerImagePreview && !bannerImagePreview.startsWith('data:')) {
        finalImg = bannerImagePreview;
      }

      const saved = await saveBanner({
        ...bannerForm,
        id: editingBannerId || undefined,
        image: finalImg || '/images/porto_hero.jpg',
      });

      const updated = await loadBanners();
      setDbBanners(updated);
      setBannerSuccessMsg(`Banner "${saved.title}" saved successfully to database table "banners"!`);
      handleResetBannerForm();
      setTimeout(() => setBannerSuccessMsg(null), 3500);
    } catch (err: unknown) {
      setBannerErrorMsg(err instanceof Error ? err.message : 'Failed to save banner.');
    } finally {
      setBannerSubmitting(false);
    }
  };

  const handleDeleteBannerClick = async (id: string, title: string) => {
    if (!window.confirm(`Delete hero banner "${title}" from the database?`)) return;
    try {
      await deleteBanner(id);
      const updated = await loadBanners();
      setDbBanners(updated);
      if (editingBannerId === id) {
        handleResetBannerForm();
      }
      setBannerSuccessMsg('Banner deleted from database.');
      setTimeout(() => setBannerSuccessMsg(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete banner.');
    }
  };

  // ─── Password Gate (Clean, Centered, Responsive Card) ───────────────────────
  if (!authenticated) {
    return (
      <div className={`admin-gate-wrap${dark ? ' dark' : ''}`}>
        <div className="admin-gate-card">
          <div className="admin-gate-top">
            <img src="/AE-logo.png" alt="Akshat Enterprises Logo" className="admin-gate-logo-img" />
          </div>

          <div className="admin-gate-icon-circle">
            <Lock size={26} />
          </div>

          <h1 className="admin-gate-title">Owner Access</h1>
          <p className="admin-gate-subtitle">
            Enter the admin passkey to manage database inventory, products, and categories.
          </p>

          <form onSubmit={handleLogin} className="admin-gate-form">
            <div className="admin-gate-input-wrapper">
              <input
                type="password"
                placeholder="Enter admin password…"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                className={`admin-gate-input${pwError ? ' error' : ''}`}
                autoFocus
                id="admin-password-input"
              />
            </div>

            {pwError && (
              <div className="admin-gate-alert">
                <AlertTriangle size={15} /> Incorrect password. Please try again.
              </div>
            )}

            <button type="submit" className="admin-gate-submit-btn" id="admin-login-btn">
              <Shield size={16} /> Enter Dashboard
            </button>
          </form>

          <div className="admin-gate-footer">
            <span className="admin-gate-hint">Demo Password: <code>akshat2024</code></span>
            <button type="button" className="admin-gate-back-btn" onClick={onNavigateHome}>
              <ArrowLeft size={14} /> Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Preview product (derived from form state) ───────────────────────────────
  const previewProduct: Partial<Product> = {
    name: form.name || 'Sample Product Title',
    category: form.category || 'Category',
    department: form.department || 'Footwear',
    price: form.priceValue ? formatPriceDisplay(form.priceValue) : '₹1,299',
    stock: parseInt(form.stock, 10) || 50,
    image: imagePreview || imageUrlInput || '/images/brown_boots_product.jpg',
    tag: form.tag || undefined,
    sizes: form.sizes.length ? form.sizes : (form.department === 'Footwear' ? ['IND 7', 'IND 8', 'IND 9'] : ['M', 'L', 'XL']),
    colors: form.colors.length ? form.colors : ['Black', 'Brown'],
  };

  // ─── Admin Dashboard ──────────────────────────────────────────────────────────
  return (
    <div className={`admin-dashboard-container${dark ? ' dark' : ''}`}>
      {/* ── Top Bar ── */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="admin-store-btn" onClick={onNavigateHome} title="Return to store homepage">
            <ArrowLeft size={16} /> Store Front
          </button>
          <div className="admin-topbar-brand">
            <img src="/AE-logo.png" alt="Akshat Enterprises Logo" className="admin-topbar-logo-img" />
          </div>
        </div>

        <div className="admin-topbar-right">
          <button
            type="button"
            className="admin-db-status-btn"
            onClick={() => setShowSupabaseModal(true)}
            title="Configure Supabase Database"
          >
            <Database size={15} />
            {isSupabaseConfigured ? (
              <span className="status-indicator online">
                <span className="pulse-dot green" /> Supabase Realtime (Live)
              </span>
            ) : (
              <span className="status-indicator local">
                <span className="pulse-dot amber" /> Local Storage (Click to connect)
              </span>
            )}
          </button>

          <button className="admin-signout-btn" onClick={() => setAuthenticated(false)} title="Sign out">
            <LogOut size={15} /> Exit
          </button>
        </div>
      </header>

      {/* ── KPI Stats Cards Bar ── */}
      <section className="admin-kpi-bar">
        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap blue">
            <Package size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Catalog Products</span>
            <strong className="kpi-value">{products.length}</strong>
            <span className="kpi-sub">Across {dynamicDepartments.length} departments</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap green">
            <BarChart3 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Inventory Units</span>
            <strong className="kpi-value">{totalStockCount.toLocaleString('en-IN')}</strong>
            <span className="kpi-sub">Combined in-stock volume</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className={`kpi-icon-wrap ${lowStockCount > 0 ? 'red' : 'gray'}`}>
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Low Stock Alerts</span>
            <strong className={`kpi-value ${lowStockCount > 0 ? 'alert-text' : ''}`}>{lowStockCount}</strong>
            <span className="kpi-sub">&lt; 20 units remaining</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-wrap purple">
            <Layers size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Categories</span>
            <strong className="kpi-value">{distinctCategoriesCount}</strong>
            <span className="kpi-sub">Dynamic website filters</span>
          </div>
        </div>
      </section>

      {/* ── Navigation Tabs Bar ── */}
      <nav className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-tab-btn${activeTab === 'inventory' ? ' active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package size={17} />
          <span>Products &amp; Stock Inventory</span>
          <span className="admin-tab-badge">{products.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn${activeTab === 'add' ? ' active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <Plus size={17} />
          <span>Add New Product to Database</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn${activeTab === 'banners' ? ' active' : ''}`}
          onClick={() => setActiveTab('banners')}
        >
          <ImageIcon size={17} />
          <span>Hero Banners (DB)</span>
          <span className="admin-tab-badge">{dbBanners.length}</span>
        </button>
      </nav>

      {/* ── TAB 1: INVENTORY & STOCK MANAGEMENT ── */}
      {activeTab === 'inventory' && (
        <section className="admin-section-content">
          {/* Success Banner */}
          {successId && (
            <div className="admin-success-banner">
              <Check size={18} /> New product published successfully to the database!
            </div>
          )}

          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="admin-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products by name, category, or department…"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              {searchFilter && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchFilter('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-dept-filter-group">
              <button
                type="button"
                className={`admin-filter-pill${deptFilter === 'all' ? ' active' : ''}`}
                onClick={() => setDeptFilter('all')}
              >
                All ({products.length})
              </button>
              {dynamicDepartments.map((dept: string) => {
                const count = products.filter((p) => p.department === dept).length;
                return (
                  <button
                    key={dept}
                    type="button"
                    className={`admin-filter-pill${deptFilter === dept ? ' active' : ''}`}
                    onClick={() => setDeptFilter(dept)}
                  >
                    {dept === 'Footwear' ? '👟' : dept === 'Jackets' ? '🧥' : dept === 'Headwear' ? '🪖' : '🧤'} {dept} ({count})
                  </button>
                );
              })}
            </div>

            <div className="admin-stock-filter-group">
              <button
                type="button"
                className={`admin-stock-toggle-btn${stockFilter === 'low' ? ' active' : ''}`}
                onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                title="Show only low stock items"
              >
                <AlertTriangle size={14} /> Low Stock Only ({lowStockCount})
              </button>
            </div>
          </div>

          {/* Products Table Card */}
          <div className="admin-card-container">
            {filteredProducts.length === 0 ? (
              <div className="admin-empty-box">
                <Package size={44} />
                <h3>No products match your filter</h3>
                <p>Try clearing your search query or department filter, or add a new product.</p>
                <button
                  type="button"
                  className="admin-primary-btn"
                  onClick={() => { setSearchFilter(''); setDeptFilter('all'); setStockFilter('all'); }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="admin-responsive-table-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 68 }}>Photo</th>
                      <th>Product Info</th>
                      <th>Department</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Quantity</th>
                      <th>Variants</th>
                      <th>Badge</th>
                      <th style={{ width: 90, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const stockVal = p.stock ?? 50;
                      const isLowStock = stockVal < 20;
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="admin-table-thumb">
                              <img src={p.image} alt={p.name} loading="lazy" />
                            </div>
                          </td>
                          <td>
                            <div className="admin-table-item-info">
                              <strong className="item-title">{p.name}</strong>
                              <span className="item-meta">ID: {p.id.slice(0, 10)}…</span>
                            </div>
                          </td>
                          <td>
                            <span className="admin-dept-badge">
                              {p.department === 'Jackets' ? '🧥 Jackets' : p.department === 'Headwear' ? '🪖 Headwear' : p.department === 'Accessories' ? '🧤 Accessories' : '👟 Footwear'}
                            </span>
                          </td>
                          <td>
                            <span className="admin-cat-badge">{p.category}</span>
                          </td>
                          <td>
                            <strong className="admin-item-price">{p.price}</strong>
                          </td>
                          <td>
                            <span className={`admin-stock-pill ${isLowStock ? 'low' : 'ok'}`}>
                              {isLowStock ? <AlertTriangle size={12} /> : <Check size={12} />}
                              {stockVal} units
                            </span>
                          </td>
                          <td>
                            <div className="admin-variants-summary">
                              <span className="variant-count">{p.sizes.length} sizes</span>
                              <div className="variant-dots">
                                {p.colors.slice(0, 4).map((c: string) => (
                                  <span
                                    key={c}
                                    className="mini-color-dot"
                                    style={{ background: COLOR_HEX[c] || '#888' }}
                                    title={c}
                                  />
                                ))}
                                {p.colors.length > 4 && <small>+{p.colors.length - 4}</small>}
                              </div>
                            </div>
                          </td>
                          <td>
                            {p.tag ? <span className="admin-tag-chip">{p.tag}</span> : <span className="admin-empty-tag">—</span>}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="admin-delete-action-btn"
                              onClick={() => handleDelete(p.id)}
                              disabled={deletingId === p.id}
                              title={`Delete ${p.name}`}
                            >
                              <Trash2 size={15} />
                              {deletingId === p.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TAB 2: ADD PRODUCT & LIVE PREVIEW ── */}
      {activeTab === 'add' && (
        <section className="admin-section-content">
          <div className="admin-editor-split">
            {/* Form Column */}
            <form className="admin-form-col" onSubmit={handlePublish}>
              {/* Card 1: Basic Info */}
              <div className="admin-card-container">
                <div className="admin-card-header">
                  <Package size={18} />
                  <h3>1. Basic Information</h3>
                </div>

                <div className="admin-card-body">
                  <label className="admin-field-label">
                    Product Title *
                    <input
                      className="admin-field-input"
                      type="text"
                      placeholder="e.g. Arctic Thermal Heavy Jacket / Stealth Safety Boot"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      id="admin-product-name"
                      required
                    />
                  </label>

                  <div className="admin-field-label">
                    Department *
                    <div className="admin-dept-selector">
                      {dynamicDepartments.map((dept: string) => (
                        <button
                          key={dept}
                          type="button"
                          className={`admin-dept-select-btn${form.department === dept ? ' selected' : ''}`}
                          onClick={() => {
                            setForm((f) => ({
                              ...f,
                              department: dept,
                              category: dynamicCategoriesByDept[dept]?.[0] || '',
                              sizes: [],
                            }));
                            setIsCustomCategory(false);
                          }}
                        >
                          <span className="dept-icon">
                            {dept === 'Footwear' ? '👟' : dept === 'Jackets' ? '🧥' : dept === 'Headwear' ? '🪖' : '🧤'}
                          </span>
                          <span className="dept-text">{dept}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-two-col-grid">
                    <label className="admin-field-label">
                      Category *
                      {!isCustomCategory ? (
                        <div className="admin-select-wrapper">
                          <select
                            className="admin-field-input"
                            value={form.category}
                            onChange={(e) => {
                              if (e.target.value === '__NEW__') {
                                setIsCustomCategory(true);
                                setForm((f) => ({ ...f, category: '' }));
                              } else {
                                setForm((f) => ({ ...f, category: e.target.value }));
                              }
                            }}
                            id="admin-product-category"
                          >
                            {currentDeptCategories.map((c: string) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                            <option value="__NEW__">➕ Add New Category…</option>
                          </select>
                        </div>
                      ) : (
                        <div className="admin-custom-cat-input-group">
                          <input
                            className="admin-field-input"
                            type="text"
                            placeholder="Type new category (e.g. Winter Jacket, Rain Wear)"
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="admin-secondary-btn"
                            onClick={() => {
                              setIsCustomCategory(false);
                              setForm((f) => ({ ...f, category: currentDeptCategories[0] || '' }));
                            }}
                          >
                            Choose existing
                          </button>
                        </div>
                      )}
                    </label>

                    <label className="admin-field-label">
                      Badge / Tag
                      <select
                        className="admin-field-input"
                        value={form.tag}
                        onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                        id="admin-product-tag"
                      >
                        {TAGS.map((t) => (
                          <option key={t} value={t}>{t || 'No Badge'}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 2: Pricing & Stock */}
              <div className="admin-card-container">
                <div className="admin-card-header">
                  <BarChart3 size={18} />
                  <h3>2. Pricing &amp; Inventory Stock</h3>
                </div>

                <div className="admin-card-body">
                  <div className="admin-two-col-grid">
                    <label className="admin-field-label">
                      Price (₹ INR) *
                      <div className="admin-currency-input-wrap">
                        <span className="currency-symbol">₹</span>
                        <input
                          className="admin-field-input currency-padding"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="1299"
                          value={form.priceValue}
                          onChange={(e) => setForm((f) => ({ ...f, priceValue: e.target.value }))}
                          id="admin-product-price"
                          required
                        />
                      </div>
                    </label>

                    <label className="admin-field-label">
                      Available Stock (Units) *
                      <input
                        className="admin-field-input"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="50"
                        value={form.stock}
                        onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                        id="admin-product-stock"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Card 3: Media */}
              <div className="admin-card-container">
                <div className="admin-card-header">
                  <ImageIcon size={18} />
                  <h3>3. Product Photo</h3>
                </div>

                <div className="admin-card-body">
                  {/* Dropzone */}
                  <div
                    className={`admin-image-dropzone${dragOver ? ' drag-over' : ''}${imagePreview ? ' active-preview' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    {imagePreview ? (
                      <div className="dropzone-has-image">
                        <img src={imagePreview} alt="Preview" />
                        <button
                          type="button"
                          className="dropzone-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview('');
                          }}
                          title="Remove image"
                        >
                          <X size={15} /> Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="dropzone-empty-prompt">
                        <Upload size={32} />
                        <strong>Click or drag &amp; drop product photo</strong>
                        <span>Supports JPG, PNG, WEBP</span>
                      </div>
                    )}
                  </div>

                  {/* Or Direct Image URL */}
                  <div className="admin-url-image-bar">
                    <span className="url-divider">or paste direct image URL:</span>
                    <input
                      type="text"
                      className="admin-field-input"
                      placeholder="https://images.unsplash.com/... or /images/..."
                      value={imageUrlInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImageUrlInput(val);
                        if (val.trim()) {
                          setImagePreview(val.trim());
                          setImageFile(null);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Variants */}
              <div className="admin-card-container">
                <div className="admin-card-header">
                  <Tag size={18} />
                  <h3>4. Variants (Sizes &amp; Colors)</h3>
                </div>

                <div className="admin-card-body">
                  <div className="admin-field-label">
                    Sizes {form.department === 'Footwear' ? '(Indian Shoe Sizes)' : '(Apparel Sizes)'} *
                    <div className="admin-chips-selector">
                      {(form.department === 'Footwear' ? FOOTWEAR_SIZES : APPAREL_SIZES).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`admin-variant-chip${form.sizes.includes(s) ? ' active' : ''}`}
                          onClick={() => toggleSize(s)}
                        >
                          {s.replace('IND ', '')}
                          {form.sizes.includes(s) && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-field-label" style={{ marginTop: 14 }}>
                    Colors *
                    <div className="admin-colors-selector">
                      {FIXED_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`admin-color-chip${form.colors.includes(c) ? ' active' : ''}`}
                          onClick={() => toggleColor(c)}
                        >
                          <span className="color-swatch" style={{ background: COLOR_HEX[c] || '#888' }} />
                          <span>{c}</span>
                          {form.colors.includes(c) && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-custom-color-row">
                    <input
                      type="text"
                      className="admin-field-input mini"
                      placeholder="Add custom color (e.g. Olive, Beige)"
                      value={form.customColor}
                      onChange={(e) => setForm((f) => ({ ...f, customColor: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                    />
                    <button type="button" className="admin-secondary-btn" onClick={addCustomColor}>
                      Add Color
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {submitError && (
                <div className="admin-error-banner">
                  <AlertTriangle size={16} /> {submitError}
                </div>
              )}

              {/* Publish Button */}
              <button
                type="submit"
                className="admin-publish-submit-btn"
                disabled={submitting}
                id="admin-publish-btn"
              >
                {submitting ? (
                  <RefreshCw size={18} className="spin-icon" />
                ) : (
                  <Upload size={18} />
                )}
                {submitting ? 'Writing to Supabase Database…' : 'Publish Product to Database'}
              </button>
            </form>

            {/* Live Preview Column */}
            <aside className="admin-preview-col">
              <div className="admin-sticky-preview">
                <div className="admin-card-container preview-card-box">
                  <div className="admin-card-header">
                    <Eye size={18} />
                    <h3>Live Store Card Preview</h3>
                  </div>

                  <div className="admin-preview-render-wrap">
                    <article className="product-card porto-product-card preview-elevated">
                      <div className="product-image">
                        {previewProduct.tag && (
                          <span className="product-tag">{previewProduct.tag}</span>
                        )}
                        {previewProduct.image ? (
                          <img src={previewProduct.image} alt={previewProduct.name} />
                        ) : (
                          <div className="preview-empty-thumb">
                            <ImageIcon size={38} />
                            <span>Photo preview</span>
                          </div>
                        )}
                      </div>

                      <div className="product-info">
                        <div>
                          <span className="preview-dept-tag">
                            {previewProduct.department} · {previewProduct.category}
                          </span>
                          <h3 style={{ fontSize: 15, margin: '4px 0' }}>{previewProduct.name}</h3>
                        </div>
                        <strong style={{ fontSize: 18, color: '#f04c32' }}>{previewProduct.price}</strong>
                      </div>

                      <div className="preview-stock-line">
                        <span className={`admin-stock-pill ${(previewProduct.stock ?? 50) < 20 ? 'low' : 'ok'}`}>
                          📦 In Stock: {previewProduct.stock ?? 50} units
                        </span>
                      </div>

                      {(previewProduct.sizes?.length || 0) > 0 && (
                        <div className="product-sizes-row">
                          {previewProduct.sizes!.map((s: string) => (
                            <span key={s} className="size-chip">{s}</span>
                          ))}
                        </div>
                      )}

                      {(previewProduct.colors?.length || 0) > 0 && (
                        <div className="product-colors-row">
                          {previewProduct.colors!.map((c: string) => (
                            <span
                              key={c}
                              className="color-dot"
                              style={{ background: COLOR_HEX[c] || '#888' }}
                              title={c}
                            />
                          ))}
                        </div>
                      )}

                      <div className="product-card-actions">
                        <button className="product-add-cart-btn" type="button" tabIndex={-1}>
                          <ShoppingCart size={15} /> Add to Cart
                        </button>
                      </div>
                    </article>

                    <p className="preview-tip-text">
                      💡 Real-time customer view: Updates automatically as you edit the fields.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* ── TAB 3: HERO BANNERS MANAGEMENT (Supabase 'banners' Table) ── */}
      {activeTab === 'banners' && (
        <section className="admin-section-content">
          {bannerSuccessMsg && (
            <div className="admin-success-banner">
              <Check size={18} /> {bannerSuccessMsg}
            </div>
          )}

          {bannerErrorMsg && (
            <div className="admin-error-banner" style={{ marginBottom: 16 }}>
              <AlertTriangle size={18} /> {bannerErrorMsg}
            </div>
          )}

          <div className="admin-section-grid">
            {/* Left: Active Database Banners List */}
            <div className="admin-form-col">
              <div className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="admin-card-title">Live Hero Banners ({dbBanners.length})</h2>
                    <p className="admin-card-subtitle">
                      Loaded directly from database table <code>banners</code>. Auto-slides continuously on homepage every 3s.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-filter-pill active"
                    onClick={handleResetBannerForm}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={14} /> New Banner
                  </button>
                </div>

                <div className="admin-banners-list" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18 }}>
                  {dbBanners.map((b, index) => (
                    <div
                      key={b.id || index}
                      className={`admin-banner-row-card${editingBannerId === b.id ? ' editing' : ''}`}
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        padding: 14,
                        borderRadius: 10,
                        border: editingBannerId === b.id ? '2px solid #f04c32' : '1px solid rgba(0,0,0,0.08)',
                        background: editingBannerId === b.id ? 'rgba(240, 76, 50, 0.04)' : 'rgba(0,0,0,0.01)',
                      }}
                    >
                      {/* Thumbnail photo */}
                      <div
                        style={{
                          width: 90,
                          height: 70,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#eee',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={b.image}
                          alt={b.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/porto_hero.jpg';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              background: '#f04c32',
                              color: '#fff',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            #{b.displayOrder ?? index + 1}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#f04c32', textTransform: 'uppercase' }}>
                            {b.eyebrow}
                          </span>
                          <span style={{ fontSize: 11, color: '#888' }}>•</span>
                          <span style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>
                            {b.department} &gt; {b.category}
                          </span>
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800 }}>
                          {b.title}
                        </h4>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          <span>{b.priceLabel}: </span>
                          <strong style={{ color: '#f04c32' }}>{b.price}</strong>
                          <span style={{ marginLeft: 10, color: '#999' }}>Button: &quot;{b.ctaText}&quot;</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          type="button"
                          className="admin-table-action-btn edit"
                          onClick={() => handleSelectEditBanner(b)}
                          title="Edit Banner"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="admin-table-action-btn delete"
                          onClick={() => handleDeleteBannerClick(b.id, b.title)}
                          title="Delete Banner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Banner Editor / Creator Form */}
            <aside className="admin-preview-col">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    {editingBannerId ? 'Edit Banner Details' : 'Add New Hero Banner'}
                  </h2>
                  <p className="admin-card-subtitle">
                    Manage photo, copy, category filter, and starting price in database.
                  </p>
                </div>

                <form onSubmit={handleSaveBannerSubmit} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Title */}
                  <label className="admin-field-label">
                    Banner Title *
                    <input
                      type="text"
                      className="admin-field-input"
                      placeholder="e.g. WORKWEAR & JACKETS"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      required
                    />
                  </label>

                  {/* Eyebrow & Display Order */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label className="admin-field-label">
                      Eyebrow Script Tag
                      <input
                        type="text"
                        className="admin-field-input"
                        placeholder="e.g. Must Have"
                        value={bannerForm.eyebrow}
                        onChange={(e) => setBannerForm({ ...bannerForm, eyebrow: e.target.value })}
                      />
                    </label>

                    <label className="admin-field-label">
                      Display Order (1, 2, 3...)
                      <input
                        type="number"
                        className="admin-field-input"
                        value={bannerForm.displayOrder}
                        onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: parseInt(e.target.value, 10) || 1 })}
                        min={1}
                      />
                    </label>
                  </div>

                  {/* Department & Category */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label className="admin-field-label">
                      Department
                      <select
                        className="admin-field-select"
                        value={bannerForm.department}
                        onChange={(e) => setBannerForm({ ...bannerForm, department: e.target.value })}
                      >
                        {DEPARTMENTS_LIST.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field-label">
                      Target Category Filter
                      <input
                        type="text"
                        className="admin-field-input"
                        placeholder="e.g. Safety Shoes"
                        value={bannerForm.category}
                        onChange={(e) => setBannerForm({ ...bannerForm, category: e.target.value })}
                      />
                    </label>
                  </div>

                  {/* Price Label & Price */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label className="admin-field-label">
                      Price Label
                      <input
                        type="text"
                        className="admin-field-input"
                        placeholder="e.g. STARTING AT"
                        value={bannerForm.priceLabel}
                        onChange={(e) => setBannerForm({ ...bannerForm, priceLabel: e.target.value })}
                      />
                    </label>

                    <label className="admin-field-label">
                      Price Display
                      <input
                        type="text"
                        className="admin-field-input"
                        placeholder="e.g. ₹899"
                        value={bannerForm.price}
                        onChange={(e) => setBannerForm({ ...bannerForm, price: e.target.value })}
                      />
                    </label>
                  </div>

                  {/* CTA button text */}
                  <label className="admin-field-label">
                    Button Action Text
                    <input
                      type="text"
                      className="admin-field-input"
                      placeholder="e.g. SHOP SAFETY SHOES"
                      value={bannerForm.ctaText}
                      onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                    />
                  </label>

                  {/* Image Upload / URL */}
                  <div className="admin-field-label">
                    Banner Photo (Database / Storage)
                    <div
                      style={{
                        border: '2px dashed rgba(0,0,0,0.15)',
                        borderRadius: 8,
                        padding: 16,
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginTop: 4,
                      }}
                      onClick={() => document.getElementById('admin-banner-file-input')?.click()}
                    >
                      <input
                        id="admin-banner-file-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleBannerFile(f);
                        }}
                      />
                      <Upload size={20} style={{ margin: '0 auto 6px', color: '#f04c32' }} />
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {bannerImageFile ? bannerImageFile.name : 'Click to Upload Banner Image'}
                      </div>
                      <small style={{ color: '#888', fontSize: 10 }}>Supports JPG, PNG, WEBP</small>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <input
                        type="text"
                        className="admin-field-input"
                        placeholder="Or direct image URL (e.g. /images/brown_boots_product.jpg)"
                        value={bannerImageFile ? '' : (bannerImagePreview || bannerForm.image)}
                        onChange={(e) => {
                          setBannerImageFile(null);
                          setBannerImagePreview(e.target.value);
                          setBannerForm({ ...bannerForm, image: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  {/* Live Mini Preview */}
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      Live Banner Card Preview
                    </span>
                    <div
                      style={{
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: 'radial-gradient(ellipse at 70% 40%, #ffffff 0%, #f6f4ee 60%, #eee9de 100%)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        position: 'relative',
                        minHeight: 160,
                        padding: 16,
                      }}
                    >
                      <div style={{ zIndex: 2, maxWidth: '65%' }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#f04c32', textTransform: 'uppercase' }}>
                          {bannerForm.department} • {bannerForm.category}
                        </span>
                        <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#f04c32', fontSize: 18 }}>
                          {bannerForm.eyebrow}
                        </div>
                        <h3 style={{ margin: '2px 0 6px', fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>
                          {bannerForm.title || 'BANNER TITLE'}
                        </h3>
                        <div style={{ fontSize: 11, color: '#555' }}>
                          <span>{bannerForm.priceLabel} </span>
                          <strong style={{ color: '#f04c32', fontSize: 14 }}>{bannerForm.price}</strong>
                        </div>
                        <button
                          type="button"
                          style={{
                            marginTop: 10,
                            background: '#181818',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 12px',
                            fontSize: 10,
                            fontWeight: 800,
                            borderRadius: 4,
                          }}
                        >
                          {bannerForm.ctaText}
                        </button>
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          right: 10,
                          bottom: 10,
                          top: 10,
                          width: '38%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={bannerImagePreview || bannerForm.image || '/images/porto_hero.jpg'}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/porto_hero.jpg';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      type="submit"
                      className="admin-publish-submit-btn"
                      style={{ flex: 1 }}
                      disabled={bannerSubmitting}
                    >
                      {bannerSubmitting ? (
                        <>
                          <RefreshCw size={16} className="spin-icon" /> Saving Banner…
                        </>
                      ) : (
                        <>
                          <Check size={16} /> {editingBannerId ? 'Update Banner in Database' : 'Add Banner to Database'}
                        </>
                      )}
                    </button>

                    {editingBannerId && (
                      <button
                        type="button"
                        className="admin-btn-disconnect-db"
                        onClick={handleResetBannerForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* ── Supabase Configuration Modal ── */}
      {showSupabaseModal && (
        <div className="admin-modal-overlay" onClick={() => setShowSupabaseModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-title-wrap">
                <Database size={20} />
                <h3>Supabase Database Configuration</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowSupabaseModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p className="admin-modal-desc">
                Connect your PostgreSQL database hosted on Supabase to store products, stock inventory, and categories in real-time.
              </p>

              <div className="admin-modal-status-card">
                <div className="status-label">Connection Status</div>
                <div className="status-value">
                  {isSupabaseConfigured ? (
                    <span className="admin-status-online">● Connected to Live Supabase</span>
                  ) : (
                    <span className="admin-status-local">● Offline / Local Storage Mode</span>
                  )}
                </div>
              </div>

              <div className="admin-modal-fields">
                <label className="admin-field-label">
                  Supabase Project URL
                  <input
                    type="text"
                    className="admin-field-input"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  />
                </label>

                <label className="admin-field-label">
                  Supabase Anon Key
                  <input
                    type="password"
                    className="admin-field-input"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  />
                </label>
              </div>

              {supabaseMsg && (
                <div className="admin-modal-alert">
                  {supabaseMsg}
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-save-db"
                  onClick={handleSaveSupabaseConfig}
                >
                  Save &amp; Connect Supabase
                </button>
                <button
                  type="button"
                  className="admin-btn-disconnect-db"
                  onClick={() => {
                    setSupabaseUrlInput('');
                    setSupabaseKeyInput('');
                    configureSupabase('', '');
                    setSupabaseMsg('Reset to local demo mode.');
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                >
                  Use Local Mode
                </button>
              </div>

              <div className="admin-modal-sql-tip">
                <small>
                  💡 <strong>Quick Setup:</strong> Run the provided <code>supabase_schema.sql</code> in your Supabase SQL editor to create the <code>products</code> table with <code>stock</code> columns and realtime synchronization.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
