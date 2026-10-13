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
  Edit2,
  Save,
  Minus,
  Palette,
} from 'lucide-react';
import type { Product, Banner, CategoryCard, VibeCard } from '../types';
import {
  uploadImage,
  saveProduct,
  deleteProduct,
  updateProduct,
  loadBanners,
  saveBanner,
  deleteBanner,
  uploadBannerImage,
  SEED_BANNERS,
  SEED_PROMO_BANNER,
  loadCategoryCards,
  saveCategoryCard,
  loadVibeCards,
  saveVibeCard,
  SEED_CATEGORY_CARDS,
  SEED_VIBE_CARDS,
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
const DEFAULT_PRESET_COLORS = ['White', 'Black', 'Brown', 'Grey'];

const COLOR_HEX: Record<string, string> = {
  Black: '#1a1a1a',
  black: '#1a1a1a',
  White: '#f5f5f5',
  white: '#f5f5f5',
  Red: '#e63946',
  red: '#e63946',
  Brown: '#8b5e3c',
  brown: '#8b5e3c',
  Navy: '#1d3461',
  navy: '#1d3461',
  Grey: '#9e9e9e',
  grey: '#9e9e9e',
  Gray: '#9e9e9e',
  gray: '#9e9e9e',
  Tan: '#c8a97e',
  tan: '#c8a97e',
  Yellow: '#f9c846',
  yellow: '#f9c846',
  Orange: '#f4840a',
  orange: '#f4840a',
  Green: '#2d7d46',
  green: '#2d7d46',
  Blue: '#2563eb',
  blue: '#2563eb',
  Olive: '#65a30d',
  olive: '#65a30d',
  Purple: '#9333ea',
  purple: '#9333ea',
  Pink: '#ec4899',
  pink: '#ec4899',
  Teal: '#0d9488',
  teal: '#0d9488',
};

const getDisplayColorHex = (c: string): string => {
  if (!c) return '#888888';
  if (COLOR_HEX[c]) return COLOR_HEX[c];
  if (COLOR_HEX[c.toLowerCase()]) return COLOR_HEX[c.toLowerCase()];
  return c;
};

const RGB_PALETTE: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Coral', hex: '#f87171' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky Blue', hex: '#0ea5e9' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Magenta', hex: '#d946ef' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Tan', hex: '#d97706' },
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Olive', hex: '#65a30d' },
  { name: 'Maroon', hex: '#881337' },
  { name: 'Charcoal', hex: '#334155' },
  { name: 'Slate', hex: '#64748b' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminPageProps {
  products: Product[];
  banners?: Banner[];
  categoryCards?: CategoryCard[];
  vibeCards?: VibeCard[];
  onBannersChange?: () => void;
  onCategoryCardsChange?: () => void;
  onVibeCardsChange?: () => void;
  dark: boolean;
  onPublish: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdate?: (product: Product) => void;
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
  type: 'hero',
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AdminPage({
  products,
  banners,
  categoryCards,
  vibeCards,
  onBannersChange,
  onCategoryCardsChange,
  onVibeCardsChange,
  dark,
  onPublish,
  onDelete,
  onUpdate,
  onNavigateHome,
}: AdminPageProps) {
  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  // Tab: 'inventory' | 'add' | 'banners' | 'categories'
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'banners' | 'categories'>('inventory');

  // Form State
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // 4 Photo Angles State (Angle 1 = main image above, Angles 2-4 = additional perspectives)
  const [angle2File, setAngle2File] = useState<File | null>(null);
  const [angle2Preview, setAngle2Preview] = useState('');
  const [angle2Url, setAngle2Url] = useState('');

  const [angle3File, setAngle3File] = useState<File | null>(null);
  const [angle3Preview, setAngle3Preview] = useState('');
  const [angle3Url, setAngle3Url] = useState('');

  const [angle4File, setAngle4File] = useState<File | null>(null);
  const [angle4Preview, setAngle4Preview] = useState('');
  const [angle4Url, setAngle4Url] = useState('');

  // Banners Management State (Database Table 'banners')
  const [dbBanners, setDbBanners] = useState<Banner[]>(() => (banners && banners.length > 0 ? banners : SEED_BANNERS));
  const [bannerForm, setBannerForm] = useState<Omit<Banner, 'createdAt'>>(DEFAULT_BANNER_FORM);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>('');
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [bannerSuccessMsg, setBannerSuccessMsg] = useState<string | null>(null);
  const [bannerErrorMsg, setBannerErrorMsg] = useState<string | null>(null);

  // Category Cards State (Database table 'category_cards')
  const [categoryList, setCategoryList] = useState<CategoryCard[]>(() =>
    categoryCards && categoryCards.length > 0 ? categoryCards : SEED_CATEGORY_CARDS
  );
  const [vibeList, setVibeList] = useState<VibeCard[]>(() =>
    vibeCards && vibeCards.length > 0 ? vibeCards : SEED_VIBE_CARDS
  );
  const [catSavingId, setCatSavingId] = useState<string | null>(null);
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);
  const [vibeSavingId, setVibeSavingId] = useState<string | null>(null);
  const [vibeSuccessMsg, setVibeSuccessMsg] = useState<string | null>(null);

  // Sync categoryList & vibeList
  useEffect(() => {
    if (categoryCards && categoryCards.length > 0) {
      setCategoryList(categoryCards);
    } else {
      loadCategoryCards().then((data) => {
        if (data && data.length > 0) setCategoryList(data);
      });
    }
  }, [categoryCards]);

  useEffect(() => {
    if (vibeCards && vibeCards.length > 0) {
      setVibeList(vibeCards);
    } else {
      loadVibeCards().then((data) => {
        if (data && data.length > 0) setVibeList(data);
      });
    }
  }, [vibeCards]);

  const handleCategoryFileChange = async (cardId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setCatSavingId(cardId);
      const url = await uploadBannerImage(file);
      const card = categoryList.find((c) => c.id === cardId);
      if (card) {
        const updated = await saveCategoryCard({ ...card, image: url });
        setCategoryList((prev) => prev.map((c) => (c.id === cardId ? updated : c)));
        setCatSuccessMsg(`Photo for ${card.name} updated in database!`);
        setTimeout(() => setCatSuccessMsg(null), 3000);
        onCategoryCardsChange?.();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update category photo');
    } finally {
      setCatSavingId(null);
    }
  };

  const handleSaveCategoryCard = async (updatedCard: CategoryCard) => {
    try {
      setCatSavingId(updatedCard.id);
      const saved = await saveCategoryCard(updatedCard);
      setCategoryList((prev) => prev.map((c) => (c.id === updatedCard.id ? saved : c)));
      setCatSuccessMsg(`Category "${saved.name}" saved in database!`);
      setTimeout(() => setCatSuccessMsg(null), 3000);
      onCategoryCardsChange?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setCatSavingId(null);
    }
  };

  const handleVibeFileChange = async (cardId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setVibeSavingId(cardId);
      const url = await uploadBannerImage(file);
      const card = vibeList.find((v) => v.id === cardId);
      if (card) {
        const updated = await saveVibeCard({ ...card, image: url });
        setVibeList((prev) => prev.map((v) => (v.id === cardId ? updated : v)));
        setVibeSuccessMsg(`Photo for ${card.title} updated in database!`);
        setTimeout(() => setVibeSuccessMsg(null), 3000);
        onVibeCardsChange?.();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update vibe photo');
    } finally {
      setVibeSavingId(null);
    }
  };

  const handleSaveVibeCard = async (updatedCard: VibeCard) => {
    try {
      setVibeSavingId(updatedCard.id);
      const saved = await saveVibeCard(updatedCard);
      setVibeList((prev) => prev.map((v) => (v.id === updatedCard.id ? saved : v)));
      setVibeSuccessMsg(`Photo for "${saved.title}" saved in database!`);
      setTimeout(() => setVibeSuccessMsg(null), 3000);
      onVibeCardsChange?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save vibe card');
    } finally {
      setVibeSavingId(null);
    }
  };

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
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const fileInputRef4 = useRef<HTMLInputElement>(null);

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

  // ─── Image handling (4 Angles) ──────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleAngleFile = useCallback((angleNum: 2 | 3 | 4, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (angleNum === 2) {
        setAngle2File(file);
        setAngle2Preview(res);
      } else if (angleNum === 3) {
        setAngle3File(file);
        setAngle3Preview(res);
      } else {
        setAngle4File(file);
        setAngle4Preview(res);
      }
    };
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
      setSubmitError('Please upload an image or provide an image URL for Angle 1 (Main).');
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

      // Collect angles 2, 3, 4
      const extraImages: string[] = [];
      if (angle2File) {
        const up2 = await uploadImage(angle2File);
        extraImages.push(up2);
      } else if (angle2Url.trim()) {
        extraImages.push(angle2Url.trim());
      } else if (angle2Preview && !angle2Preview.startsWith('data:')) {
        extraImages.push(angle2Preview);
      }

      if (angle3File) {
        const up3 = await uploadImage(angle3File);
        extraImages.push(up3);
      } else if (angle3Url.trim()) {
        extraImages.push(angle3Url.trim());
      } else if (angle3Preview && !angle3Preview.startsWith('data:')) {
        extraImages.push(angle3Preview);
      }

      if (angle4File) {
        const up4 = await uploadImage(angle4File);
        extraImages.push(up4);
      } else if (angle4Url.trim()) {
        extraImages.push(angle4Url.trim());
      } else if (angle4Preview && !angle4Preview.startsWith('data:')) {
        extraImages.push(angle4Preview);
      }

      const saved = await saveProduct({
        name: form.name.trim(),
        department: form.department,
        category: form.category.trim() || 'General',
        price: formatPriceDisplay(form.priceValue),
        priceValue: priceNum,
        stock: parseInt(form.stock, 10) || 50,
        image: imageUrl,
        images: extraImages,
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
      setAngle2File(null);
      setAngle2Preview('');
      setAngle2Url('');
      setAngle3File(null);
      setAngle3Preview('');
      setAngle3Url('');
      setAngle4File(null);
      setAngle4Preview('');
      setAngle4Url('');
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

  // ─── Edit Product & Stock State ───────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(50);
  const [editPriceVal, setEditPriceVal] = useState<string>('');
  const [editOrigPriceVal, setEditOrigPriceVal] = useState<string>('');
  const [editNameVal, setEditNameVal] = useState<string>('');
  const [editColorsVal, setEditColorsVal] = useState<string[]>([]);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [customColorHex, setCustomColorHex] = useState('#2563eb');
  const [customColorName, setCustomColorName] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editToast, setEditToast] = useState<string | null>(null);

  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditStockVal(prod.stock ?? 50);
    setEditPriceVal(prod.price || '');
    setEditOrigPriceVal(prod.originalPrice || '');
    setEditNameVal(prod.name || '');
    setEditColorsVal(Array.isArray(prod.colors) ? [...prod.colors] : []);
    setShowCustomColorPicker(false);
    setCustomColorHex('#2563eb');
    setCustomColorName('');
  };

  const handleAddEditColor = (color: string) => {
    const trimmed = color.trim();
    if (!trimmed) return;
    if (!editColorsVal.includes(trimmed)) {
      setEditColorsVal((prev) => [...prev, trimmed]);
    }
  };

  const handleSubtractEditColor = (colorToRemove: string) => {
    setEditColorsVal((prev) => prev.filter((c) => c !== colorToRemove));
  };

  const handleSaveProductEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;
    setEditSaving(true);
    try {
      const priceNum = parseInt(editPriceVal.replace(/[^0-9]/g, ''), 10) || editingProduct.priceValue;
      const cleanPrice = editPriceVal.trim();
      const formattedPrice = cleanPrice ? (cleanPrice.startsWith('₹') ? cleanPrice : `₹${cleanPrice.replace(/[^0-9,]/g, '')}`) : editingProduct.price;
      const cleanOrig = editOrigPriceVal.trim();
      const formattedOrig = cleanOrig ? (cleanOrig.startsWith('₹') ? cleanOrig : `₹${cleanOrig.replace(/[^0-9,]/g, '')}`) : undefined;

      const updatedData: Partial<Product> = {
        name: editNameVal.trim() || editingProduct.name,
        stock: Math.max(0, editStockVal),
        price: formattedPrice,
        priceValue: priceNum,
        originalPrice: formattedOrig,
        colors: editColorsVal,
      };

      const updated = await updateProduct(editingProduct.id, updatedData);
      const mergedProduct = updated || { ...editingProduct, ...updatedData };
      if (onUpdate) {
        onUpdate(mergedProduct);
      }
      setEditToast(`Updated stock & details for "${mergedProduct.name}"!`);
      setTimeout(() => setEditToast(null), 3500);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update product: ' + (err as Error).message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleInlineStockDelta = async (prod: Product, delta: number) => {
    const cur = prod.stock ?? 50;
    const next = Math.max(0, cur + delta);
    try {
      const updated = await updateProduct(prod.id, { stock: next });
      const mergedProduct = updated || { ...prod, stock: next };
      if (onUpdate) {
        onUpdate(mergedProduct);
      }
    } catch (err) {
      console.error(err);
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
      type: b.type ?? (b.title.includes('SEASON OF RAW') ? 'promo' : 'hero'),
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
        type: bannerForm.type || (bannerForm.title.includes('SEASON OF RAW') ? 'promo' : 'hero'),
      });

      const updated = await loadBanners();
      setDbBanners(updated);
      onBannersChange?.();
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
    if (!window.confirm(`Delete banner "${title}" from the database?`)) return;
    try {
      await deleteBanner(id);
      const updated = await loadBanners();
      setDbBanners(updated);
      onBannersChange?.();
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
            <button type="button" className="admin-gate-back-btn" onClick={onNavigateHome}>
              <ArrowLeft size={14} /> Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Preview product (derived from form state with 4 angles) ───────────────────
  const previewProduct: Partial<Product> = {
    name: form.name || 'Sample Product Title',
    category: form.category || 'Category',
    department: form.department || 'Footwear',
    price: form.priceValue ? formatPriceDisplay(form.priceValue) : '₹1,299',
    stock: parseInt(form.stock, 10) || 50,
    image: imagePreview || imageUrlInput || '/images/brown_boots_product.jpg',
    images: [
      angle2Preview || angle2Url,
      angle3Preview || angle3Url,
      angle4Preview || angle4Url,
    ].filter(Boolean),
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
          <span>Banners &amp; Promo (DB)</span>
          <span className="admin-tab-badge">{dbBanners.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn${activeTab === 'categories' ? ' active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Layers size={17} />
          <span>Category &amp; Vibe Photos (DB)</span>
          <span className="admin-tab-badge">{categoryList.length}</span>
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
                      <th style={{ width: 140, textAlign: 'right' }}>Actions</th>
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
                            <div className="admin-stock-cell-box">
                              <span className={`admin-stock-pill ${isLowStock ? 'low' : 'ok'}`}>
                                {isLowStock ? <AlertTriangle size={12} /> : <Check size={12} />}
                                {stockVal} units
                              </span>
                              <div className="admin-stock-quick-btns">
                                <button
                                  type="button"
                                  className="admin-stock-delta-btn minus"
                                  onClick={() => handleInlineStockDelta(p, -1)}
                                  title="Quick decrease: -1 unit"
                                  aria-label="Decrease stock by 1"
                                >
                                  <Minus size={11} />
                                </button>
                                <button
                                  type="button"
                                  className="admin-stock-delta-btn plus"
                                  onClick={() => handleInlineStockDelta(p, 1)}
                                  title="Quick increase: +1 unit"
                                  aria-label="Increase stock by 1"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                            </div>
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
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div className="admin-actions-cell">
                              <button
                                type="button"
                                className="admin-edit-action-btn"
                                onClick={() => handleStartEditProduct(p)}
                                title={`Edit stock & details for ${p.name}`}
                              >
                                <Edit size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="admin-delete-action-btn"
                                onClick={() => handleDelete(p.id)}
                                disabled={deletingId === p.id}
                                title={`Delete ${p.name}`}
                              >
                                <Trash2 size={13} />
                                <span>{deletingId === p.id ? 'Deleting…' : 'Delete'}</span>
                              </button>
                            </div>
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

              {/* Card 3: 4 Angle Photos */}
              <div className="admin-card-container">
                <div className="admin-card-header">
                  <ImageIcon size={18} />
                  <div>
                    <h3>3. Product Photos (4 Different Angles)</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      Add 4 distinct angles (Profile, 3/4 Perspective, Pair/Detail, Top/Sole) for the customer detail view.
                    </p>
                  </div>
                </div>

                <div className="admin-card-body">
                  <div className="admin-angles-grid">
                    {/* Angle 1: Main (Side Profile) */}
                    <div className="admin-angle-slot">
                      <div className="admin-angle-header">
                        <span className="admin-angle-title">Angle 1: Main (Side Profile)</span>
                        <span className="admin-angle-tag req">Required</span>
                      </div>
                      <div
                        className={`admin-angle-preview-box${imagePreview ? ' has-img' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Angle 1" className="admin-angle-img" />
                            <button
                              type="button"
                              className="admin-angle-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview('');
                                setImageUrlInput('');
                              }}
                              title="Remove Angle 1"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="admin-angle-empty">
                            <Upload size={18} />
                            <span>Upload Angle 1</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        className="admin-angle-url-input"
                        placeholder="Or URL: /images/... or https://"
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

                    {/* Angle 2: 3/4 Perspective Angle */}
                    <div className="admin-angle-slot">
                      <div className="admin-angle-header">
                        <span className="admin-angle-title">Angle 2: 3/4 Perspective</span>
                        <span className="admin-angle-tag">Angle #2</span>
                      </div>
                      <div
                        className={`admin-angle-preview-box${angle2Preview ? ' has-img' : ''}`}
                        onClick={() => fileInputRef2.current?.click()}
                      >
                        <input
                          ref={fileInputRef2}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => e.target.files?.[0] && handleAngleFile(2, e.target.files[0])}
                        />
                        {angle2Preview ? (
                          <>
                            <img src={angle2Preview} alt="Angle 2" className="admin-angle-img" />
                            <button
                              type="button"
                              className="admin-angle-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAngle2File(null);
                                setAngle2Preview('');
                                setAngle2Url('');
                              }}
                              title="Remove Angle 2"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="admin-angle-empty">
                            <Upload size={18} />
                            <span>Upload Angle 2</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        className="admin-angle-url-input"
                        placeholder="Or URL: /images/... or https://"
                        value={angle2Url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAngle2Url(val);
                          if (val.trim()) {
                            setAngle2Preview(val.trim());
                            setAngle2File(null);
                          }
                        }}
                      />
                    </div>

                    {/* Angle 3: Pair / Angle Shot */}
                    <div className="admin-angle-slot">
                      <div className="admin-angle-header">
                        <span className="admin-angle-title">Angle 3: Pair / Angle Shot</span>
                        <span className="admin-angle-tag">Angle #3</span>
                      </div>
                      <div
                        className={`admin-angle-preview-box${angle3Preview ? ' has-img' : ''}`}
                        onClick={() => fileInputRef3.current?.click()}
                      >
                        <input
                          ref={fileInputRef3}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => e.target.files?.[0] && handleAngleFile(3, e.target.files[0])}
                        />
                        {angle3Preview ? (
                          <>
                            <img src={angle3Preview} alt="Angle 3" className="admin-angle-img" />
                            <button
                              type="button"
                              className="admin-angle-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAngle3File(null);
                                setAngle3Preview('');
                                setAngle3Url('');
                              }}
                              title="Remove Angle 3"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="admin-angle-empty">
                            <Upload size={18} />
                            <span>Upload Angle 3</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        className="admin-angle-url-input"
                        placeholder="Or URL: /images/... or https://"
                        value={angle3Url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAngle3Url(val);
                          if (val.trim()) {
                            setAngle3Preview(val.trim());
                            setAngle3File(null);
                          }
                        }}
                      />
                    </div>

                    {/* Angle 4: Top / Sole Angle */}
                    <div className="admin-angle-slot">
                      <div className="admin-angle-header">
                        <span className="admin-angle-title">Angle 4: Top / Sole Angle</span>
                        <span className="admin-angle-tag">Angle #4</span>
                      </div>
                      <div
                        className={`admin-angle-preview-box${angle4Preview ? ' has-img' : ''}`}
                        onClick={() => fileInputRef4.current?.click()}
                      >
                        <input
                          ref={fileInputRef4}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => e.target.files?.[0] && handleAngleFile(4, e.target.files[0])}
                        />
                        {angle4Preview ? (
                          <>
                            <img src={angle4Preview} alt="Angle 4" className="admin-angle-img" />
                            <button
                              type="button"
                              className="admin-angle-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAngle4File(null);
                                setAngle4Preview('');
                                setAngle4Url('');
                              }}
                              title="Remove Angle 4"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="admin-angle-empty">
                            <Upload size={18} />
                            <span>Upload Angle 4</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        className="admin-angle-url-input"
                        placeholder="Or URL: /images/... or https://"
                        value={angle4Url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAngle4Url(val);
                          if (val.trim()) {
                            setAngle4Preview(val.trim());
                            setAngle4File(null);
                          }
                        }}
                      />
                    </div>
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

                      {/* 4 Angle Thumbnails Row in Preview */}
                      <div style={{ display: 'flex', gap: '6px', margin: '8px 12px 0', alignItems: 'center' }}>
                        {[
                          previewProduct.image,
                          ...(previewProduct.images || []),
                          '/images/brown_boots_product.jpg',
                          '/images/sport_shoes_lifestyle.jpg',
                        ].slice(0, 4).map((thumb, idx) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              height: '42px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              border: idx === 0 ? '2px solid #111' : '1px solid #e2e8f0',
                              background: '#f8fafc',
                            }}
                            title={`Angle ${idx + 1}`}
                          >
                            <img src={thumb} alt={`Angle ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
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
              {/* Promo Banner: "The Season of Raw" */}
              {(() => {
                const promoBannerItem = dbBanners.find((b) => b.type === 'promo') || SEED_PROMO_BANNER;
                return (
                  <div
                    className="admin-card"
                    style={{
                      marginBottom: 16,
                      border: editingBannerId === promoBannerItem.id ? '2px solid #f04c32' : '1px solid #f59e0b',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(240, 76, 50, 0.04) 100%)',
                    }}
                  >
                    <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span
                            style={{
                              background: '#f59e0b',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 4,
                              letterSpacing: '0.04em',
                            }}
                          >
                            PROMO BANNER
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: '#f04c32' }}>
                            THE SEASON OF RAW
                          </span>
                        </div>
                        <p className="admin-card-subtitle" style={{ margin: 0 }}>
                          Section banner in database table <code>banners</code>.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="admin-filter-pill active"
                        onClick={() => handleSelectEditBanner(promoBannerItem)}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#f04c32',
                          borderColor: '#f04c32',
                          color: '#fff',
                        }}
                      >
                        <Edit size={13} /> Edit Promo Banner
                      </button>
                    </div>

                    <div style={{ padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div
                        style={{
                          width: 110,
                          height: 70,
                          borderRadius: 8,
                          overflow: 'hidden',
                          background: '#000',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={promoBannerItem.image}
                          alt={promoBannerItem.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/promo_season_raw.jpg';
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>
                          {promoBannerItem.title}
                        </h4>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#666', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                            {promoBannerItem.priceLabel} {promoBannerItem.price}
                          </span>
                          <span>Button: &quot;{promoBannerItem.ctaText}&quot;</span>
                          <span>Target: {promoBannerItem.department}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 className="admin-card-title">Live Hero Carousel Slides ({dbBanners.filter((b) => b.type !== 'promo').length})</h2>
                    <p className="admin-card-subtitle">
                      Loaded directly from database table <code>banners</code>. Auto-slides continuously on homepage every 2s.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="admin-filter-pill active"
                    onClick={handleResetBannerForm}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={14} /> New Slide
                  </button>
                </div>

                <div className="admin-banners-list" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18 }}>
                  {dbBanners.filter((b) => b.type !== 'promo').map((b, index) => (
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
                    {editingBannerId ? (bannerForm.type === 'promo' ? 'Edit Season of Raw Promo Banner' : 'Edit Hero Slide Details') : 'Add New Hero Banner'}
                  </h2>
                  <p className="admin-card-subtitle">
                    Manage photo, copy, category filter, and starting price in database.
                  </p>
                </div>

                <form onSubmit={handleSaveBannerSubmit} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Banner Type */}
                  <label className="admin-field-label">
                    Banner Placement / Type
                    <select
                      className="admin-field-select"
                      value={bannerForm.type ?? 'hero'}
                      onChange={(e) => setBannerForm({ ...bannerForm, type: e.target.value as 'hero' | 'promo' })}
                    >
                      <option value="hero">Hero Top Slider Slide</option>
                      <option value="promo">The Season of Raw Promo Banner</option>
                    </select>
                  </label>

                  {/* Title */}
                  <label className="admin-field-label">
                    Banner Title *
                    <input
                      type="text"
                      className="admin-field-input"
                      placeholder="e.g. WORKWEAR & JACKETS or THE SEASON OF RAW"
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

      {/* ── TAB 4: CATEGORY & VIBE PHOTOS MANAGEMENT (DATABASE) ── */}
      {activeTab === 'categories' && (
        <section className="admin-section-content">
          {catSuccessMsg && (
            <div className="admin-success-banner" style={{ marginBottom: 16 }}>
              <Check size={18} /> {catSuccessMsg}
            </div>
          )}
          {vibeSuccessMsg && (
            <div className="admin-success-banner" style={{ marginBottom: 16 }}>
              <Check size={18} /> {vibeSuccessMsg}
            </div>
          )}

          {/* Section 1: SHOP BY CATEGORY SECTION PHOTOS */}
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">Shop by Category Photos ({categoryList.length})</h2>
                <p className="admin-card-subtitle">
                  Upload or change photos for SHOES, JACKETS, CAPS, SANDALS, BAGS, and ACCESSORIES. Stored in database table <code>category_cards</code>.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18, padding: 20 }}>
              {categoryList.map((cat) => (
                <CategoryPhotoCard
                  key={cat.id}
                  cat={cat}
                  isSaving={catSavingId === cat.id}
                  onSave={handleSaveCategoryCard}
                  onUploadFile={(file) => handleCategoryFileChange(cat.id, file)}
                />
              ))}
            </div>
          </div>

          {/* Section 2: OUR VIBE MOODBOARD PHOTOS */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2 className="admin-card-title">&quot;Our Vibe&quot; Lifestyle Photos ({vibeList.length})</h2>
                <p className="admin-card-subtitle">
                  Manage the 4 lifestyle moodboard photos displayed right next to The Season of Raw banner. Stored in database table <code>vibe_cards</code>.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18, padding: 20 }}>
              {vibeList.map((vibe) => (
                <VibePhotoCard
                  key={vibe.id}
                  vibe={vibe}
                  isSaving={vibeSavingId === vibe.id}
                  onSave={handleSaveVibeCard}
                  onUploadFile={(file) => handleVibeFileChange(vibe.id, file)}
                />
              ))}
            </div>
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

      {/* ── MODAL: EDIT PRODUCT STOCK & DETAILS ── */}
      {editingProduct && (
        <div
          className="admin-modal-overlay"
          onClick={() => setEditingProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-edit-stock-title"
        >
          <div className="admin-modal-card admin-edit-stock-card compact" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head compact">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={16} color="#2563eb" />
                <h3 id="admin-edit-stock-title">Edit Stock &amp; Details</h3>
              </div>
              <button
                type="button"
                className="admin-modal-close-compact"
                onClick={() => setEditingProduct(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body compact">
              {/* Product mini strip (clean single row) */}
              <div className="admin-edit-mini-strip">
                <img src={editingProduct.image} alt={editingProduct.name} className="admin-edit-mini-thumb" />
                <div className="admin-edit-mini-info">
                  <div className="admin-edit-mini-title">{editingProduct.name}</div>
                  <div className="admin-edit-mini-sub">
                    <span className="admin-dept-tag-mini">{editingProduct.department} · {editingProduct.category}</span>
                    <span className="admin-id-mini">ID: {editingProduct.id.slice(0, 8)}…</span>
                  </div>
                </div>
              </div>

              {/* Stock Management Box (Compact single box) */}
              <div className="admin-stock-compact-box">
                <div className="admin-stock-compact-top">
                  <span className="admin-stock-compact-label">
                    Stock Quantity:
                  </span>
                  <div className="admin-stock-compact-counter">
                    <button
                      type="button"
                      className="stock-count-btn minus"
                      onClick={() => setEditStockVal((s) => Math.max(0, s - 1))}
                      title="Decrease by 1"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      id="edit-stock-input"
                      type="number"
                      min="0"
                      className="stock-count-input"
                      value={editStockVal}
                      onChange={(e) => setEditStockVal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />
                    <button
                      type="button"
                      className="stock-count-btn plus"
                      onClick={() => setEditStockVal((s) => s + 1)}
                      title="Increase by 1"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className={`admin-stock-pill-mini ${editStockVal === 0 ? 'out' : editStockVal < 20 ? 'low' : 'ok'}`}>
                    {editStockVal === 0 ? 'Out of Stock' : editStockVal < 20 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                {/* Quick adjustment chips */}
                <div className="admin-stock-chips-row">
                  <span className="chips-hint">Adjust:</span>
                  {[-10, -5, -1, 1, 5, 10, 50].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      className={`stock-chip-btn${delta < 0 ? ' neg' : ' pos'}`}
                      onClick={() => setEditStockVal((s) => Math.max(0, s + delta))}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="stock-chip-btn reset"
                    onClick={() => setEditStockVal(0)}
                  >
                    0
                  </button>
                </div>
              </div>

              {/* Color Variations (Add & Subtract) */}
              <div className="admin-edit-colors-box">
                <div className="admin-edit-colors-top">
                  <span className="admin-compact-label">
                    Color Variations ({editColorsVal.length})
                  </span>
                  <span className="admin-colors-hint">Click &minus; to remove or + to add</span>
                </div>

                {/* Active Color Chips with Subtract (-) Button */}
                <div className="admin-edit-active-colors">
                  {editColorsVal.length === 0 ? (
                    <span className="admin-no-colors-text">No color variations added yet</span>
                  ) : (
                    editColorsVal.map((color) => (
                      <span key={color} className="admin-active-color-pill">
                        <span
                          className="admin-color-swatch-dot"
                          style={{ background: getDisplayColorHex(color) }}
                        />
                        <span className="admin-color-name">{color}</span>
                        <button
                          type="button"
                          className="admin-color-minus-btn"
                          onClick={() => handleSubtractEditColor(color)}
                          title={`Subtract / Remove ${color}`}
                          aria-label={`Remove ${color}`}
                        >
                          <Minus size={11} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Add Preset Colors (Only White, Black, Brown, Grey) & Custom RGB Button */}
                <div className="admin-edit-add-colors-strip">
                  <span className="admin-add-label">+ Add:</span>
                  <div className="admin-add-presets-wrap">
                    {DEFAULT_PRESET_COLORS.filter((c) => !editColorsVal.includes(c)).map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="admin-add-preset-color-btn"
                        onClick={() => handleAddEditColor(c)}
                        title={`Add ${c}`}
                      >
                        <span
                          className="admin-color-swatch-dot-mini"
                          style={{ background: getDisplayColorHex(c) }}
                        />
                        +{c}
                      </button>
                    ))}
                  </div>

                  {/* Custom Button to show RGB Colors */}
                  <button
                    type="button"
                    className={`admin-open-custom-color-btn${showCustomColorPicker ? ' active' : ''}`}
                    onClick={() => setShowCustomColorPicker((prev) => !prev)}
                    title="Click to select any RGB color"
                  >
                    <Palette size={12} />
                    <span>Custom Color...</span>
                  </button>
                </div>

                {/* Interactive Full RGB Color Picker Popup */}
                {showCustomColorPicker && (
                  <div className="admin-rgb-picker-panel">
                    <div className="admin-rgb-panel-header">
                      <div className="admin-rgb-panel-title">
                        <Palette size={13} color="#2563eb" />
                        <span>RGB Color Picker</span>
                      </div>
                      <button
                        type="button"
                        className="admin-rgb-panel-close"
                        onClick={() => setShowCustomColorPicker(false)}
                        title="Close picker"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Native RGB Wheel/Picker + Name Field + Add Button */}
                    <div className="admin-rgb-controls-row">
                      <div className="admin-rgb-color-well">
                        <input
                          type="color"
                          id="admin-native-rgb-input"
                          className="admin-native-rgb-hidden"
                          value={customColorHex}
                          onChange={(e) => {
                            setCustomColorHex(e.target.value);
                            if (!customColorName) {
                              setCustomColorName(e.target.value);
                            }
                          }}
                        />
                        <label
                          htmlFor="admin-native-rgb-input"
                          className="admin-rgb-well-preview"
                          style={{ background: customColorHex }}
                          title="Open full system RGB color spectrum"
                        >
                          <span className="admin-rgb-well-text">Pick RGB</span>
                        </label>
                      </div>

                      <input
                        type="text"
                        className="admin-rgb-text-input"
                        placeholder="Name or #HEX (e.g. Blue)"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const toAdd = customColorName.trim() || customColorHex;
                            if (toAdd) {
                              handleAddEditColor(toAdd);
                              setCustomColorName('');
                              setShowCustomColorPicker(false);
                            }
                          }
                        }}
                      />

                      <button
                        type="button"
                        className="admin-rgb-add-confirm-btn"
                        onClick={() => {
                          const toAdd = customColorName.trim() || customColorHex;
                          if (toAdd) {
                            handleAddEditColor(toAdd);
                            setCustomColorName('');
                            setShowCustomColorPicker(false);
                          }
                        }}
                      >
                        <Plus size={12} />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Spectrum of RGB Shades for 1-click Selection */}
                    <div className="admin-rgb-spectrum-label">Or click any RGB color:</div>
                    <div className="admin-rgb-swatches-grid">
                      {RGB_PALETTE.map((item) => (
                        <button
                          key={item.hex + item.name}
                          type="button"
                          className={`admin-rgb-swatch-cell${editColorsVal.includes(item.name) ? ' selected' : ''}`}
                          style={{ background: item.hex }}
                          onClick={() => {
                            handleAddEditColor(item.name);
                            setCustomColorHex(item.hex);
                          }}
                          title={`Add ${item.name} (${item.hex})`}
                        >
                          {editColorsVal.includes(item.name) && <Check size={10} color="#ffffff" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Row: Selling Price & MRP */}
              <div className="admin-edit-row-2col">
                <div className="admin-compact-field">
                  <label htmlFor="edit-selling-price" className="admin-compact-label">
                    Selling Price (₹) *
                  </label>
                  <input
                    id="edit-selling-price"
                    type="text"
                    className="admin-compact-input"
                    value={editPriceVal}
                    onChange={(e) => setEditPriceVal(e.target.value)}
                    placeholder="e.g. ₹1,299"
                  />
                </div>

                <div className="admin-compact-field">
                  <label htmlFor="edit-mrp-price" className="admin-compact-label">
                    MRP / Original (₹)
                  </label>
                  <input
                    id="edit-mrp-price"
                    type="text"
                    className="admin-compact-input"
                    value={editOrigPriceVal}
                    onChange={(e) => setEditOrigPriceVal(e.target.value)}
                    placeholder="e.g. ₹1,899"
                  />
                </div>
              </div>

              {/* Product Title Row */}
              <div className="admin-compact-field">
                <label htmlFor="edit-prod-title" className="admin-compact-label">
                  Product Name / Title *
                </label>
                <input
                  id="edit-prod-title"
                  type="text"
                  className="admin-compact-input"
                  value={editNameVal}
                  onChange={(e) => setEditNameVal(e.target.value)}
                />
              </div>

              {/* Action Buttons Row */}
              <div className="admin-modal-compact-actions">
                <button
                  type="button"
                  className="admin-compact-save-btn"
                  onClick={handleSaveProductEdit}
                  disabled={editSaving}
                >
                  <Save size={14} />
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="admin-compact-cancel-btn"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notification ── */}
      {editToast && (
        <div className="admin-floating-toast">
          <Check size={16} />
          <span>{editToast}</span>
        </div>
      )}
    </div>
  );
}

// ─── Subcomponent: CategoryPhotoCard ──────────────────────────────────────────
function CategoryPhotoCard({
  cat,
  isSaving,
  onSave,
  onUploadFile,
}: {
  cat: CategoryCard;
  isSaving: boolean;
  onSave: (cat: CategoryCard) => void;
  onUploadFile: (file: File) => void;
}) {
  const [name, setName] = useState(cat.name);
  const [image, setImage] = useState(cat.image);
  const [department, setDepartment] = useState(cat.department);
  const [category, setCategory] = useState(cat.category || 'All Products');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(cat.name);
    setImage(cat.image);
    setDepartment(cat.department);
    setCategory(cat.category || 'All Products');
  }, [cat]);

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.08)',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Category Preview Tile */}
      <div
        style={{
          height: 180,
          background: '#f4f3ef',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={image}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/sport_shoes_lifestyle.jpg';
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 4,
              letterSpacing: '0.05em',
            }}
          >
            {name}
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#f04c32',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 6px rgba(240,76,50,0.4)',
            }}
          >
            <Upload size={12} /> Change Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => setImage(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      </div>

      {/* Settings Form */}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label className="admin-field-label" style={{ margin: 0, fontSize: 11 }}>
            Category Label
            <input
              type="text"
              className="admin-field-input"
              style={{ padding: '6px 10px', fontSize: 12 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="admin-field-label" style={{ margin: 0, fontSize: 11 }}>
            Target Department
            <select
              className="admin-field-select"
              style={{ padding: '6px 10px', fontSize: 12 }}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS_LIST.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="admin-field-label" style={{ margin: 0, fontSize: 11 }}>
          Photo URL / Storage Path
          <input
            type="text"
            className="admin-field-input"
            style={{ padding: '6px 10px', fontSize: 12 }}
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="e.g. /images/sport_shoes_lifestyle.jpg"
          />
        </label>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSave({ ...cat, name, image, department, category })}
          className="admin-publish-submit-btn"
          style={{ padding: '8px 14px', fontSize: 12, marginTop: 4 }}
        >
          {isSaving ? (
            <>
              <RefreshCw size={13} className="spin-icon" /> Saving…
            </>
          ) : (
            <>
              <Save size={13} /> Save to Database
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Subcomponent: VibePhotoCard ──────────────────────────────────────────────
function VibePhotoCard({
  vibe,
  isSaving,
  onSave,
  onUploadFile,
}: {
  vibe: VibeCard;
  isSaving: boolean;
  onSave: (vibe: VibeCard) => void;
  onUploadFile: (file: File) => void;
}) {
  const [title, setTitle] = useState(vibe.title);
  const [image, setImage] = useState(vibe.image);
  const [department, setDepartment] = useState(vibe.department);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(vibe.title);
    setImage(vibe.image);
    setDepartment(vibe.department);
  }, [vibe]);

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.08)',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 180,
          background: '#1a1a1a',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={image}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/tool_kjacket.png';
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 4,
            }}
          >
            {title} {vibe.layout === 'tall' ? '(Tall Tile)' : ''}
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#f04c32',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Upload size={12} /> Change Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadFile(file);
                const reader = new FileReader();
                reader.onload = (ev) => setImage(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label className="admin-field-label" style={{ margin: 0, fontSize: 11 }}>
            Tile Heading
            <input
              type="text"
              className="admin-field-input"
              style={{ padding: '6px 10px', fontSize: 12 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="admin-field-label" style={{ margin: 0, fontSize: 11 }}>
            Target Dept
            <select
              className="admin-field-select"
              style={{ padding: '6px 10px', fontSize: 12 }}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS_LIST.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="admin-field-label" style={{ margin: 0, fontSize: 11 }}>
          Photo URL
          <input
            type="text"
            className="admin-field-input"
            style={{ padding: '6px 10px', fontSize: 12 }}
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </label>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => onSave({ ...vibe, title, image, department })}
          className="admin-publish-submit-btn"
          style={{ padding: '8px 14px', fontSize: 12, marginTop: 4 }}
        >
          {isSaving ? (
            <>
              <RefreshCw size={13} className="spin-icon" /> Saving…
            </>
          ) : (
            <>
              <Save size={13} /> Save to Database
            </>
          )}
        </button>
      </div>
    </div>
  );
}
