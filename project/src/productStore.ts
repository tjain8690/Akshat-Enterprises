import { supabase, isSupabaseConfigured } from './supabase';
import type { Product, Banner, CategoryCard, VibeCard } from './types';

const LS_KEY = 'akshat_products_v3';
const LS_BANNERS_KEY = 'akshat_banners_v2';
const BUCKET = 'shoes';
const BANNERS_BUCKET = 'banners';

// ─── Seed products (all with 4 distinct angle photos) ───────────────────────────
export const SEED_PRODUCTS: Product[] = [
  {
    id: 'seed-1',
    name: 'Yellow Craft Chukka Boots',
    department: 'Footwear',
    category: 'Casual',
    price: '₹1,299',
    originalPrice: '₹1,899',
    priceValue: 1299,
    image: '/images/brown_boots_product.jpg',
    images: [
      '/images/sport_shoes_lifestyle.jpg',
      '/images/black_sneakers_product.jpg',
      '/images/Leather_image.jpg',
    ],
    tag: 'Bestseller',
    rating: 5,
    reviewsCount: 24,
    sizes: ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10'],
    colors: ['Brown', 'Tan', 'Black'],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Stealth High-Top Leather Sneakers',
    department: 'Footwear',
    category: 'Running',
    price: '₹1,599',
    originalPrice: '₹2,299',
    priceValue: 1599,
    image: '/images/black_sneakers_product.jpg',
    images: [
      '/images/sport_shoes_lifestyle.jpg',
      '/images/brown_boots_product.jpg',
      '/images/Leather_image.jpg',
    ],
    tag: 'New drop',
    rating: 5,
    reviewsCount: 38,
    sizes: ['IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'],
    colors: ['Black', 'Grey'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'seed-3',
    name: 'Terrain Heavy Duty Safety Boot',
    department: 'Footwear',
    category: 'Safety Shoes',
    price: '₹999',
    originalPrice: '₹1,499',
    priceValue: 999,
    image: '/images/brown_boots_product.jpg',
    images: [
      '/images/Leather_image.jpg',
      '/images/black_sneakers_product.jpg',
      '/images/sport_shoes_lifestyle.jpg',
    ],
    tag: 'Workwear',
    rating: 4.8,
    reviewsCount: 52,
    sizes: ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'],
    colors: ['Brown', 'Black'],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'seed-4',
    name: 'Urban Street Core Sneaker',
    department: 'Footwear',
    category: 'Casual',
    price: '₹1,199',
    originalPrice: '₹1,699',
    priceValue: 1199,
    image: '/images/sport_shoes_lifestyle.jpg',
    images: [
      '/images/black_sneakers_product.jpg',
      '/images/brown_boots_product.jpg',
      '/images/Leather_image.jpg',
    ],
    rating: 4.9,
    reviewsCount: 19,
    sizes: ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11', 'IND 12'],
    colors: ['Grey', 'White', 'Black'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'seed-5',
    name: 'Safety Sprint Steel Toe 02',
    department: 'Footwear',
    category: 'Safety Shoes',
    price: '₹899',
    originalPrice: '₹1,299',
    priceValue: 899,
    image: '/images/Leather_image.jpg',
    images: [
      '/images/brown_boots_product.jpg',
      '/images/sport_shoes_lifestyle.jpg',
      '/images/black_sneakers_product.jpg',
    ],
    tag: 'Sale',
    rating: 4.7,
    reviewsCount: 41,
    sizes: ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'],
    colors: ['Black', 'Brown'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'seed-6',
    name: 'Court Side Court High 88',
    department: 'Footwear',
    category: 'Basketball',
    price: '₹1,799',
    originalPrice: '₹2,499',
    priceValue: 1799,
    image: '/images/black_sneakers_product.jpg',
    images: [
      '/images/sport_shoes_lifestyle.jpg',
      '/images/Leather_image.jpg',
      '/images/brown_boots_product.jpg',
    ],
    rating: 5,
    reviewsCount: 16,
    sizes: ['IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'],
    colors: ['Black', 'White', 'Navy'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'seed-7',
    name: 'ProShield Construction Jacket',
    department: 'Jackets',
    category: 'Construction Jacket',
    price: '₹1,899',
    originalPrice: '₹2,699',
    priceValue: 1899,
    image: '/images/jacket.png',
    images: [
      '/images/tool_kjacket.png',
      '/images/top_jacket.png',
      '/images/used_jacket.png',
    ],
    tag: 'Bestseller',
    rating: 4.9,
    reviewsCount: 63,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Yellow', 'Grey'],
    createdAt: new Date(Date.now()).toISOString(),
  },
  {
    id: 'seed-8',
    name: 'Mud Guard Industrial Gum Boots',
    department: 'Footwear',
    category: 'Mud Shoes / Gum Boots',
    price: '₹649',
    originalPrice: '₹899',
    priceValue: 649,
    image: '/images/Leather_image.jpg',
    images: [
      '/images/brown_boots_product.jpg',
      '/images/black_sneakers_product.jpg',
      '/images/sport_shoes_lifestyle.jpg',
    ],
    tag: 'Workwear',
    rating: 4.8,
    reviewsCount: 29,
    sizes: ['IND 6', 'IND 7', 'IND 8', 'IND 9', 'IND 10', 'IND 11'],
    colors: ['Black', 'Yellow'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
function readLocalStorage(): Product[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed: Product[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem(LS_KEY, JSON.stringify(SEED_PRODUCTS));
  return SEED_PRODUCTS;
}

function writeLocalStorage(products: Product[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(products));
  } catch { /* ignore */ }
}

// ─── Row mapper: DB row → Product ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    department: row.department ?? 'Footwear',
    category: row.category,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    priceValue: row.price_value,
    image: row.image,
    images: row.images ?? [],
    tag: row.tag ?? undefined,
    rating: row.rating ?? 5,
    reviewsCount: row.reviews_count ?? 18,
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    stock: typeof row.stock === 'number' ? row.stock : 50,
    createdAt: row.created_at,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Load all products from Supabase or localStorage. */
export async function loadProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[productStore] Supabase load error, falling back to localStorage:', error.message);
      return readLocalStorage();
    }
    return data && data.length > 0 ? data.map(rowToProduct) : SEED_PRODUCTS;
  }
  return readLocalStorage();
}

/** Upload a shoe image; returns a URL string. */
export async function uploadImage(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
  // Fallback: base64 stored locally
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Save a new product to Supabase or localStorage. */
export async function saveProduct(
  product: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        department: product.department,
        category: product.category,
        price: product.price,
        price_value: product.priceValue,
        image: product.image,
        images: product.images ?? [],
        tag: product.tag ?? null,
        sizes: product.sizes,
        colors: product.colors,
        stock: product.stock ?? 50,
      })
      .select()
      .single();

    if (error) throw new Error(`Save failed: ${error.message}`);
    return rowToProduct(data);
  }

  // localStorage fallback
  const newProduct: Product = {
    ...product,
    department: product.department ?? 'Footwear',
    id: `local-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const existing = readLocalStorage();
  writeLocalStorage([newProduct, ...existing]);
  return newProduct;
}

/** Delete a product by ID. */
export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase && !id.startsWith('seed-') && !id.startsWith('local-')) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(`Delete failed: ${error.message}`);
    return;
  }
  const existing = readLocalStorage();
  writeLocalStorage(existing.filter((p) => p.id !== id));
}

/** Update an existing product (stock, price, name, etc.) */
export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  if (isSupabaseConfigured && supabase && !id.startsWith('seed-') && !id.startsWith('local-')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
    if (updates.priceValue !== undefined) payload.price_value = updates.priceValue;
    if (updates.stock !== undefined) payload.stock = updates.stock;
    if (updates.tag !== undefined) payload.tag = updates.tag;
    if (updates.sizes !== undefined) payload.sizes = updates.sizes;
    if (updates.colors !== undefined) payload.colors = updates.colors;
    if (updates.image !== undefined) payload.image = updates.image;
    if (updates.images !== undefined) payload.images = updates.images;

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Update failed: ${error.message}`);
    return rowToProduct(data);
  }

  // Update in localStorage (works for seed and local products)
  const existing = readLocalStorage();
  const idx = existing.findIndex((p) => p.id === id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...updates };
    writeLocalStorage(existing);
    return existing[idx];
  }
  return null;
}

/** Subscribe to live Supabase changes on the products table. */
export function subscribeToProducts(onUpdate: () => void): (() => void) | null {
  if (isSupabaseConfigured && supabase) {
    try {
      const channel = supabase
        .channel('realtime:products')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }
  return null;
}

// ─── BANNERS STORE IMPLEMENTATION ─────────────────────────────────────────────

export const SEED_PROMO_BANNER: Banner = {
  id: 'seed-banner-promo',
  title: 'THE SEASON OF RAW',
  eyebrow: 'UP TO',
  department: 'Footwear',
  category: 'All Products',
  priceLabel: 'UP TO',
  price: '40% OFF',
  ctaText: 'EXPLORE DROP',
  image: '/images/promo_season_raw.jpg',
  displayOrder: 99,
  isActive: true,
  type: 'promo',
};

export const SEED_BANNERS: Banner[] = [
  {
    id: 'seed-banner-1',
    title: 'SANDALS & SNEAKERS',
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
  },
  {
    id: 'seed-banner-2',
    title: 'WORKWEAR & JACKETS',
    eyebrow: 'Heavy Duty',
    department: 'Jackets',
    category: 'Construction Jacket',
    priceLabel: 'STARTING AT',
    price: '₹999',
    ctaText: 'EXPLORE JACKETS',
    image: '/images/jacket.png',
    displayOrder: 2,
    isActive: true,
    type: 'hero',
  },
  {
    id: 'seed-banner-3',
    title: 'STEEL TOE SAFETY BOOTS',
    eyebrow: 'Certified Protection',
    department: 'Footwear',
    category: 'Safety Shoes',
    priceLabel: 'STARTING AT',
    price: '₹899',
    ctaText: 'SHOP SAFETY SHOES',
    image: '/images/brown_boots_product.jpg',
    displayOrder: 3,
    isActive: true,
    type: 'hero',
  },
  {
    id: 'seed-banner-4',
    title: 'STREET & RUNNING SHOES',
    eyebrow: 'Active Performance',
    department: 'Footwear',
    category: 'Running',
    priceLabel: 'STARTING AT',
    price: '₹1,199',
    ctaText: 'VIEW SNEAKERS',
    image: '/images/sport_shoes_lifestyle.jpg',
    displayOrder: 4,
    isActive: true,
    type: 'hero',
  },
  {
    id: 'seed-banner-5',
    title: 'INDUSTRIAL GUM BOOTS',
    eyebrow: 'All Weather Tough',
    department: 'Footwear',
    category: 'Mud Shoes / Gum Boots',
    priceLabel: 'STARTING AT',
    price: '₹649',
    ctaText: 'DISCOVER GUM BOOTS',
    image: '/images/Leather_image.jpg',
    displayOrder: 5,
    isActive: true,
    type: 'hero',
  },
  SEED_PROMO_BANNER,
];

function readBannersLocalStorage(): Banner[] {
  try {
    const raw = localStorage.getItem(LS_BANNERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure promo banner is present
        const hasPromo = parsed.some((b: Banner) => b.type === 'promo' || b.id === 'seed-banner-promo');
        if (!hasPromo) {
          parsed.push(SEED_PROMO_BANNER);
          localStorage.setItem(LS_BANNERS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch { /* ignore */ }
  localStorage.setItem(LS_BANNERS_KEY, JSON.stringify(SEED_BANNERS));
  return SEED_BANNERS;
}

function writeBannersLocalStorage(banners: Banner[]): void {
  try {
    localStorage.setItem(LS_BANNERS_KEY, JSON.stringify(banners));
  } catch { /* ignore */ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBanner(row: any): Banner {
  return {
    id: String(row.id),
    title: row.title,
    eyebrow: row.eyebrow ?? '',
    department: row.department ?? 'Footwear',
    category: row.category ?? 'Casual',
    priceLabel: row.price_label ?? 'STARTING AT',
    price: row.price ?? '',
    ctaText: row.cta_text ?? 'SHOP NOW',
    image: row.image,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
    isActive: row.is_active !== false,
    type: row.type ?? (row.title?.includes('SEASON OF RAW') || String(row.id).includes('promo') ? 'promo' : 'hero'),
    createdAt: row.created_at,
  };
}

/** Load all banners from Supabase or localStorage. */
export async function loadBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('[productStore] Supabase banners load error, fallback to local:', error.message);
      return readBannersLocalStorage();
    }
    if (data && data.length > 0) {
      const list = data.map(rowToBanner);
      if (!list.some((b: Banner) => b.type === 'promo' || b.id === 'seed-banner-promo')) {
        list.push(SEED_PROMO_BANNER);
      }
      return list;
    }
    return SEED_BANNERS;
  }
  return readBannersLocalStorage();
}

/** Upload a banner image to Supabase storage. */
export async function uploadBannerImage(file: File): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `banner-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    // Try banners bucket first, fallback to shoes bucket
    const targetBucket = BANNERS_BUCKET;
    const { error } = await supabase.storage
      .from(targetBucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      // Fallback to shoes bucket if banners bucket not yet created
      const { error: fallbackError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (fallbackError) {
        throw new Error(`Banner image upload failed: ${error.message}`);
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    }
    const { data } = supabase.storage.from(targetBucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // Local storage base64 fallback
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Save or update a banner in Supabase or localStorage. */
export async function saveBanner(
  banner: Omit<Banner, 'createdAt' | 'id'> & { id?: string }
): Promise<Banner> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      title: banner.title,
      eyebrow: banner.eyebrow ?? 'Must Have',
      department: banner.department ?? 'Footwear',
      category: banner.category ?? 'Casual',
      price_label: banner.priceLabel ?? 'STARTING AT',
      price: banner.price ?? '',
      cta_text: banner.ctaText ?? 'SHOP NOW',
      image: banner.image,
      display_order: banner.displayOrder ?? 0,
      is_active: banner.isActive !== false,
      type: banner.type ?? 'hero',
    };

    if (banner.id && !banner.id.startsWith('seed-') && !banner.id.startsWith('local-')) {
      try {
        const { data, error } = await supabase
          .from('banners')
          .update(payload)
          .eq('id', banner.id)
          .select()
          .single();
        if (error) throw error;
        return rowToBanner(data);
      } catch (err: any) {
        if (err?.message?.includes('type') || err?.code === '42703') {
          delete payload.type;
          const { data, error } = await supabase
            .from('banners')
            .update(payload)
            .eq('id', banner.id)
            .select()
            .single();
          if (error) throw new Error(`Save banner failed: ${error.message}`);
          return { ...rowToBanner(data), type: banner.type ?? 'hero' };
        }
        throw new Error(`Save banner failed: ${err.message}`);
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('banners')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return rowToBanner(data);
      } catch (err: any) {
        if (err?.message?.includes('type') || err?.code === '42703') {
          delete payload.type;
          const { data, error } = await supabase
            .from('banners')
            .insert(payload)
            .select()
            .single();
          if (error) throw new Error(`Insert banner failed: ${error.message}`);
          return { ...rowToBanner(data), type: banner.type ?? 'hero' };
        }
        throw new Error(`Insert banner failed: ${err.message}`);
      }
    }
  }

  // localStorage fallback
  const existing = readBannersLocalStorage();
  if (banner.id) {
    const index = existing.findIndex((b) => b.id === banner.id);
    if (index !== -1) {
      const updated: Banner = { ...existing[index], ...banner };
      existing[index] = updated;
      writeBannersLocalStorage(existing);
      return updated;
    }
  }
  const newBanner: Banner = {
    id: `local-banner-${Date.now()}`,
    title: banner.title || 'NEW BANNER',
    eyebrow: banner.eyebrow || 'Must Have',
    department: banner.department || 'Footwear',
    category: banner.category || 'Casual',
    priceLabel: banner.priceLabel || 'STARTING AT',
    price: banner.price || '₹499',
    ctaText: banner.ctaText || 'EXPLORE NOW',
    image: banner.image || '/images/porto_hero.jpg',
    displayOrder: banner.displayOrder ?? (existing.length + 1),
    isActive: banner.isActive !== false,
    type: banner.type ?? 'hero',
    createdAt: new Date().toISOString(),
  };
  writeBannersLocalStorage([...existing, newBanner]);
  return newBanner;
}

/** Delete a banner by ID. */
export async function deleteBanner(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase && !id.startsWith('seed-') && !id.startsWith('local-')) {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw new Error(`Delete banner failed: ${error.message}`);
    return;
  }
  const existing = readBannersLocalStorage();
  writeBannersLocalStorage(existing.filter((b) => b.id !== id));
}

/** Subscribe to live Supabase changes on the banners table. */
export function subscribeToBanners(onUpdate: () => void): (() => void) | null {
  if (isSupabaseConfigured && supabase) {
    try {
      const channel = supabase
        .channel('realtime:banners')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'banners' },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Banners realtime subscription error:', e);
    }
  }
  return null;
}

// ─── SHOP BY CATEGORY CARDS STORE ─────────────────────────────────────────────

const LS_CATEGORY_CARDS_KEY = 'akshat_category_cards_v1';
const LS_VIBE_CARDS_KEY = 'akshat_vibe_cards_v1';

export const SEED_CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'cat-shoes',
    name: 'SHOES',
    image: '/images/sport_shoes_lifestyle.jpg',
    department: 'Footwear',
    category: 'All Products',
    displayOrder: 1,
  },
  {
    id: 'cat-jackets',
    name: 'JACKETS',
    image: '/images/jacket.png',
    department: 'Jackets',
    category: 'All Products',
    displayOrder: 2,
  },
  {
    id: 'cat-caps',
    name: 'CAPS',
    image: '/images/category_cap.jpg',
    department: 'Accessories',
    category: 'Caps',
    displayOrder: 3,
  },
  {
    id: 'cat-sandals',
    name: 'SANDALS',
    image: '/images/brown_boots_product.jpg',
    department: 'Footwear',
    category: 'Casual',
    displayOrder: 4,
  },
  {
    id: 'cat-bags',
    name: 'BAGS',
    image: '/images/image copy.png',
    department: 'Accessories',
    category: 'All Products',
    displayOrder: 5,
  },
  {
    id: 'cat-accessories',
    name: 'ACCESSORIES',
    image: '/images/category_accessories.jpg',
    department: 'Accessories',
    category: 'All Products',
    displayOrder: 6,
  },
];

export const SEED_VIBE_CARDS: VibeCard[] = [
  {
    id: 'vibe-outerwear',
    title: 'OUTERWEAR',
    image: '/images/tool_kjacket.png',
    department: 'Jackets',
    category: 'All Products',
    layout: 'tall',
  },
  {
    id: 'vibe-headwear',
    title: 'HEADWEAR',
    image: '/images/category_cap.jpg',
    department: 'Accessories',
    category: 'Caps',
    layout: 'standard',
  },
  {
    id: 'vibe-footwear-1',
    title: 'FOOTWEAR',
    image: '/images/black_sneakers_product.jpg',
    department: 'Footwear',
    category: 'All Products',
    layout: 'standard',
  },
  {
    id: 'vibe-footwear-2',
    title: 'FOOTWEAR',
    image: '/images/sport_shoes_lifestyle.jpg',
    department: 'Footwear',
    category: 'All Products',
    layout: 'standard',
  },
];

function readCategoryCardsLocalStorage(): CategoryCard[] {
  try {
    const raw = localStorage.getItem(LS_CATEGORY_CARDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem(LS_CATEGORY_CARDS_KEY, JSON.stringify(SEED_CATEGORY_CARDS));
  return SEED_CATEGORY_CARDS;
}

function writeCategoryCardsLocalStorage(cards: CategoryCard[]): void {
  try {
    localStorage.setItem(LS_CATEGORY_CARDS_KEY, JSON.stringify(cards));
  } catch { /* ignore */ }
}

/** Load all Shop by Category cards from Supabase or localStorage. */
export async function loadCategoryCards(): Promise<CategoryCard[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('category_cards')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: String(row.id),
          name: row.name,
          image: row.image,
          department: row.department,
          category: row.category ?? 'All Products',
          displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
        }));
      }
    } catch {
      // fallback to local storage
    }
  }
  return readCategoryCardsLocalStorage();
}

/** Save or update a category card in Supabase or localStorage. */
export async function saveCategoryCard(card: CategoryCard): Promise<CategoryCard> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('category_cards').upsert({
        id: card.id,
        name: card.name,
        image: card.image,
        department: card.department,
        category: card.category,
        display_order: card.displayOrder,
      });
    } catch (e) {
      console.warn('Supabase category_cards save failed, using local storage:', e);
    }
  }
  const existing = readCategoryCardsLocalStorage();
  const idx = existing.findIndex((c) => c.id === card.id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...card };
  } else {
    existing.push(card);
  }
  writeCategoryCardsLocalStorage(existing);
  return card;
}

function readVibeCardsLocalStorage(): VibeCard[] {
  try {
    const raw = localStorage.getItem(LS_VIBE_CARDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem(LS_VIBE_CARDS_KEY, JSON.stringify(SEED_VIBE_CARDS));
  return SEED_VIBE_CARDS;
}

function writeVibeCardsLocalStorage(cards: VibeCard[]): void {
  try {
    localStorage.setItem(LS_VIBE_CARDS_KEY, JSON.stringify(cards));
  } catch { /* ignore */ }
}

/** Load all Our Vibe cards from Supabase or localStorage. */
export async function loadVibeCards(): Promise<VibeCard[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('vibe_cards').select('*');
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: String(row.id),
          title: row.title,
          image: row.image,
          department: row.department,
          category: row.category ?? 'All Products',
          layout: row.layout ?? 'standard',
        }));
      }
    } catch {
      // fallback
    }
  }
  return readVibeCardsLocalStorage();
}

/** Save or update a vibe card in Supabase or localStorage. */
export async function saveVibeCard(card: VibeCard): Promise<VibeCard> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('vibe_cards').upsert({
        id: card.id,
        title: card.title,
        image: card.image,
        department: card.department,
        category: card.category,
        layout: card.layout,
      });
    } catch (e) {
      console.warn('Supabase vibe_cards save failed, using local storage:', e);
    }
  }
  const existing = readVibeCardsLocalStorage();
  const idx = existing.findIndex((v) => v.id === card.id);
  if (idx !== -1) {
    existing[idx] = { ...existing[idx], ...card };
  } else {
    existing.push(card);
  }
  writeVibeCardsLocalStorage(existing);
  return card;
}

