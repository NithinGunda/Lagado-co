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
