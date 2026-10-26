export const COLOR_HEX: Record<string, string> = {
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

export const DEPARTMENTS = [
  { id: 'all', label: 'All', emoji: '🛍️' },
  { id: 'Footwear', label: 'Footwear', emoji: '👟' },
  { id: 'Jackets', label: 'Jackets', emoji: '🧥' },
  { id: 'Headwear', label: 'Headwear', emoji: '🪖' },
  { id: 'Accessories', label: 'Accessories', emoji: '🧤' },
];

export const DEPT_CATEGORIES: Record<string, string[]> = {
  Footwear: ['Running', 'Casual', 'Basketball', 'Safety Shoes', 'Mud Shoes / Gum Boots', 'Limited Edition'],
  Jackets: ['Construction Jacket', 'Hi-Vis Jacket', 'Rain Jacket', 'Winter Jacket'],
  Headwear: ['Construction Cap', 'Safety Helmet', 'Hard Hat'],
  Accessories: ['Gloves', 'Knee Guards', 'Reflective Vest'],
};

export const whatsappNumber = '918690041886';
export const secondPhone = '9137235350';

export const whatsappLink = (msg: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;

export const shareToWhatsAppLink = (msg: string) =>
  `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

/**
 * Dynamic Base Site URL Resolver:
 * - On Vercel / Production: Automatically detects window.location.origin (e.g. https://your-domain.vercel.app or https://akshatenterprises.com)
 * - On Localhost: WhatsApp blocks 'localhost' links from being clickable. If VITE_SITE_URL is set in .env, it uses that public URL so links work on mobile; otherwise falls back to localhost.
 */
export const getBaseSiteUrl = (): string => {
  // 1. If running in a live browser (Vercel, custom domain, production)
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.');

    // If on a real domain (not localhost), always use current live origin dynamically!
    if (!isLocalhost) {
      return origin;
    }
  }

  // 2. If running locally on localhost, check VITE_SITE_URL in .env so WhatsApp links are clickable
  const envUrl = (import.meta as any).env?.VITE_SITE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 3. Fallback to current origin if in browser, or default Vercel domain
  return typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin.replace(/\/+$/, '')
    : 'https://akshat-enterprises.vercel.app';
};

/**
 * Returns full absolute URL to the product description page
 */
export const getProductUrl = (productId: string, productName?: string) => {
  const base = getBaseSiteUrl();
  const nameParam = productName ? `&name=${encodeURIComponent(productName)}` : '';
  return `${base}/product-description?id=${encodeURIComponent(productId)}${nameParam}`;
};

/**
 * Generates WhatsApp enquiry link including the direct product description link
 */
export const getProductWhatsAppEnquiry = (
  product: { id: string; name: string; price?: string | number },
  size?: string
) => {
  const productUrl = getProductUrl(product.id, product.name);
  const sizeText = size ? `, Size: ${size}` : '';
  const priceText = product.price
    ? ` (${product.price}${sizeText})`
    : (size ? ` (Size: ${size})` : '');

  const msg = `Hi Akshat Enterprises, I want to enquire about:

*${product.name}*${priceText}

Product Link:
${productUrl}

Please share stock & delivery details.`;

  return whatsappLink(msg);
};

export const faqs = [
  ['Do you offer cash on delivery?', 'We are a showcase store, so orders are confirmed directly with our team. Message us on WhatsApp to check delivery options and payment details for your location.'],
  ['Can I exchange a pair?', 'Yes, exchanges depend on availability and the condition of the pair. Please check sizing with us before confirming your order.'],
  ['Do you deliver outside Navi Mumbai?', 'We can arrange delivery outside the city for selected products. Send us your pin code and the pair you like for a quick confirmation.'],
  ['Can I visit and try the shoes?', 'Absolutely. Visit our Janta Market store during shop hours and our team will help you find the right fit.'],
];
