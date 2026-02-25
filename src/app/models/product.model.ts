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
  attributes: ProductAttribute[];
  tags: string[];
  featured?: boolean;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  size_guide?: SizeGuide;
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
