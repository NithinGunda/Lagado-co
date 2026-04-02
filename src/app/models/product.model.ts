export interface SizeGuideRow {
  size: string;
  values: string[];
}

export interface SizeGuide {
  columns: string[];
  rows: SizeGuideRow[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  is_on_sale?: boolean;
  discount_percentage?: number;
  is_active?: boolean;
  category: 'mens' | 'womens' | 'collections';
  images: string[];
  image_url?: string;
  image_urls?: string[];
  inStock: boolean;
  stockQuantity: number;
  /** When set, stock is per size. Stored as object in app; API uses StockBySizeItem[]. */
  stock_by_size?: { [size: string]: number };
  attributes: ProductAttribute[];
  tags: string[];
  featured?: boolean;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  size_guide?: SizeGuide;
  /** Saved wishlist line: which size was chosen (same product can appear once per size). */
  wishlistSize?: string;
}

/** Backend expects/returns stock_by_size as an array. */
export interface StockBySizeItem {
  size: string;
  quantity: number;
}

export function stockBySizeToArray(obj: { [size: string]: number } | undefined): StockBySizeItem[] {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([size, quantity]) => ({ size, quantity: Number(quantity ?? 0) }));
}

/**
 * Whether a product has available inventory (API shapes, stock_by_size, and legacy mocks).
 * Used to hide items on the home page and to show “Out of stock” on listings.
 */
export function isProductInStock(p: any): boolean {
  if (!p) return false;
  if (p.in_stock === false || p.inStock === false) return false;

  const sbsObj = stockBySizeFromArray(p.stock_by_size);
  if (Object.keys(sbsObj).length > 0) {
    const total = Object.values(sbsObj).reduce((a: number, q) => a + Number(q ?? 0), 0);
    return total > 0;
  }

  const qty = p.stock_quantity ?? p.stockQuantity;
  if (qty !== undefined && qty !== null && String(qty).trim() !== '') {
    return Number(qty) > 0;
  }

  if (p.inStock === true || p.in_stock === true) return true;
  return true;
}

/** Accepts API response: either array [{ size, quantity }] or object { "S": 5, "M": 10 }. */
export function stockBySizeFromArray(arrOrObj: StockBySizeItem[] | { [size: string]: number } | any): { [size: string]: number } {
  if (Array.isArray(arrOrObj)) {
    const out: { [size: string]: number } = {};
    arrOrObj.forEach((item: any) => {
      const size = item?.size ?? item?.Size;
      const qty = item?.quantity ?? item?.Quantity ?? item?.stock ?? 0;
      if (size != null && String(size).trim() !== '') out[String(size).trim()] = Number(qty);
    });
    return out;
  }
  if (arrOrObj && typeof arrOrObj === 'object' && !Array.isArray(arrOrObj)) {
    const out: { [size: string]: number } = {};
    Object.entries(arrOrObj).forEach(([size, qty]) => {
      if (size != null && String(size).trim() !== '') out[String(size).trim()] = Number(qty ?? 0);
    });
    return out;
  }
  return {};
}

/**
 * Max units allowed for one cart line — matches product-details quantity cap:
 * per-size stock from stock_by_size when present, else product.stockQuantity.
 */
export function maxQuantityForCartLine(product: Product | undefined, selectedSize?: string | null): number {
  if (!product) return 0;
  const sizeKey = selectedSize != null ? String(selectedSize).trim() : '';
  const sbs = stockBySizeFromArray((product as any).stock_by_size);
  if (sbs && typeof sbs === 'object' && Object.keys(sbs).length > 0 && sizeKey) {
    if (sizeKey in sbs) return Math.max(0, Number(sbs[sizeKey] ?? 0));
  }
  return Math.max(0, Number(product.stockQuantity ?? 0));
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface FilterOptions {
  category?: string[];
  priceRange?: { min: number; max: number };
  attributes?: { [key: string]: string[] };
  inStock?: boolean;
  search?: string;
}
