export interface Product {
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
}

export interface CartItem {
  name: string;
  category?: string;
  price: string | number;
  image: string;
  tag?: string;
  quantity: number;
  selectedSize?: string;
  size?: string;
}

export interface Banner {
  id: string;
  title: string;
  eyebrow: string;
  department: string;
  category: string;
  priceLabel: string;
  price: string;
  ctaText: string;
  image: string;
  displayOrder?: number;
  isActive?: boolean;
  type?: 'hero' | 'promo';
  createdAt?: string;
}

export interface CategoryCard {
  id: string;
  name: string;
  image: string;
  department: string;
  category: string;
  displayOrder: number;
}

export interface VibeCard {
  id: string;
  title: string;
  image: string;
  department: string;
  category?: string;
  layout?: 'tall' | 'standard';
}
