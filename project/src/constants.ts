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

export const whatsappNumber = '919892228186';
export const secondPhone = '9137235350';

export const whatsappLink = (msg: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;

export const faqs = [
  ['Do you offer cash on delivery?', 'We are a showcase store, so orders are confirmed directly with our team. Message us on WhatsApp to check delivery options and payment details for your location.'],
  ['Can I exchange a pair?', 'Yes, exchanges depend on availability and the condition of the pair. Please check sizing with us before confirming your order.'],
  ['Do you deliver outside Navi Mumbai?', 'We can arrange delivery outside the city for selected products. Send us your pin code and the pair you like for a quick confirmation.'],
  ['Can I visit and try the shoes?', 'Absolutely. Visit our Janta Market store during shop hours and our team will help you find the right fit.'],
];
