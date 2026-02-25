import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, FilterOptions } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Classic Wool Blazer',
      description: 'A timeless blazer crafted from premium merino wool. Perfect for both formal and casual occasions.',
      price: 24000,
      originalPrice: 28000,
      category: 'mens',
      images: ['assets/homebanner2.png'],
      inStock: true,
      stockQuantity: 15,
      attributes: [
        { name: 'Size', value: 'S, M, L, XL' },
        { name: 'Color', value: 'Navy Blue' },
        { name: 'Material', value: 'Merino Wool' }
      ],
      tags: ['blazer', 'formal', 'wool'],
      featured: true,
      badge: 'New',
      rating: 4.5,
      reviewCount: 23
    },
    {
      id: '2',
      name: 'Elegant Silk Dress',
      description: 'A flowing silk dress that embodies elegance and sophistication. Perfect for special occasions.',
      price: 20000,
      category: 'womens',
      images: ['assets/buythelook3.png'],
      inStock: true,
      stockQuantity: 8,
      attributes: [
        { name: 'Size', value: 'XS, S, M, L' },
        { name: 'Color', value: 'Ivory' },
        { name: 'Material', value: 'Silk' }
      ],
      tags: ['dress', 'formal', 'silk'],
      featured: true,
      rating: 4.8,
      reviewCount: 45
    },
    {
      id: '3',
      name: 'Premium Leather Jacket',
      description: 'Handcrafted leather jacket with attention to detail. A statement piece for your wardrobe.',
      price: 32000,
      category: 'mens',
      images: ['assets/buythelook2.png'],
      inStock: true,
      stockQuantity: 12,
      attributes: [
        { name: 'Size', value: 'M, L, XL, XXL' },
        { name: 'Color', value: 'Black' },
        { name: 'Material', value: 'Genuine Leather' }
      ],
      tags: ['jacket', 'leather', 'casual'],
      featured: true,
      badge: 'Popular',
      rating: 4.7,
      reviewCount: 67
    },
    {
      id: '4',
      name: 'Designer Handbag',
      description: 'Luxurious handbag made from sustainable materials. Spacious and elegant design.',
      price: 16000,
      category: 'womens',
      images: ['assets/homebanner2.png'],
      inStock: true,
      stockQuantity: 20,
      attributes: [
        { name: 'Color', value: 'Cream, Black, Brown' },
        { name: 'Material', value: 'Sustainable Leather' },
        { name: 'Dimensions', value: '12" x 9" x 5"' }
      ],
      tags: ['handbag', 'accessories', 'sustainable'],
      rating: 4.6,
      reviewCount: 34
    },
    {
      id: '5',
      name: 'Heritage Denim Jacket',
      description: 'Classic denim jacket with modern fit. Sustainable denim with timeless appeal.',
      price: 18000,
      category: 'collections',
      images: ['assets/ourstory.png'],
      inStock: true,
      stockQuantity: 18,
      attributes: [
        { name: 'Size', value: 'S, M, L, XL' },
        { name: 'Color', value: 'Indigo' },
        { name: 'Material', value: 'Organic Cotton Denim' }
      ],
      tags: ['jacket', 'denim', 'casual'],
      rating: 4.4,
      reviewCount: 28
    },
    {
      id: '6',
      name: 'Essential Cotton Tee',
      description: 'Soft, breathable cotton t-shirt. Perfect for everyday wear.',
      price: 4000,
      category: 'mens',
      images: ['assets/buythelook3.png'],
      inStock: true,
      stockQuantity: 50,
      attributes: [
        { name: 'Size', value: 'S, M, L, XL, XXL' },
        { name: 'Color', value: 'White, Black, Navy, Grey' },
        { name: 'Material', value: 'Organic Cotton' }
      ],
      tags: ['tee', 'casual', 'basics'],
      rating: 4.3,
      reviewCount: 89
    },
    {
      id: '7',
      name: 'Timeless Trench Coat',
      description: 'Classic trench coat that never goes out of style. Water-resistant and elegant.',
      price: 28000,
      category: 'womens',
      images: ['assets/homebanner.png'],
      inStock: true,
      stockQuantity: 10,
      attributes: [
        { name: 'Size', value: 'XS, S, M, L' },
        { name: 'Color', value: 'Beige, Black' },
        { name: 'Material', value: 'Cotton Blend' }
      ],
      tags: ['coat', 'outerwear', 'classic'],
      featured: true,
      rating: 4.9,
      reviewCount: 56
    },
    {
      id: '8',
      name: 'Legacy Leather Boots',
      description: 'Handcrafted leather boots built to last. Comfortable and durable.',
      price: 32000,
      category: 'mens',
      images: ['assets/buythelook2.png'],
      inStock: true,
      stockQuantity: 14,
      attributes: [
        { name: 'Size', value: '7-12 US' },
        { name: 'Color', value: 'Brown, Black' },
        { name: 'Material', value: 'Genuine Leather' }
      ],
      tags: ['boots', 'footwear', 'leather'],
      rating: 4.8,
      reviewCount: 42
    },
    {
      id: '9',
      name: 'Sustainable Merino Scarf',
      description: 'Luxurious merino wool scarf. Soft, warm, and sustainably sourced.',
      price: 7000,
      category: 'collections',
      images: ['assets/homebanner2.png'],
      inStock: true,
      stockQuantity: 25,
      attributes: [
        { name: 'Color', value: 'Cream, Grey, Navy' },
        { name: 'Material', value: 'Merino Wool' },
        { name: 'Dimensions', value: '70" x 12"' }
      ],
      tags: ['scarf', 'accessories', 'wool'],
      rating: 4.5,
      reviewCount: 31
    },
    {
      id: '10',
      name: 'Quiet Confidence Blazer',
      description: 'A refined blazer that exudes quiet confidence. Perfect for the modern professional.',
      price: 22000,
      category: 'womens',
      images: ['assets/buythelook3.png'],
      inStock: true,
      stockQuantity: 16,
      attributes: [
        { name: 'Size', value: 'XS, S, M, L, XL' },
        { name: 'Color', value: 'Navy, Black, Grey' },
        { name: 'Material', value: 'Wool Blend' }
      ],
      tags: ['blazer', 'formal', 'professional'],
      rating: 4.7,
      reviewCount: 38
    },
    {
      id: '11',
      name: 'Natural Fiber Pants',
      description: 'Comfortable pants made from natural fibers. Sustainable and stylish.',
      price: 13000,
      category: 'mens',
      images: ['assets/ourstory.png'],
      inStock: true,
      stockQuantity: 22,
      attributes: [
        { name: 'Size', value: '28-38 Waist' },
        { name: 'Color', value: 'Khaki, Navy, Black' },
        { name: 'Material', value: 'Organic Cotton' }
      ],
      tags: ['pants', 'casual', 'sustainable'],
      rating: 4.4,
      reviewCount: 27
    },
    {
      id: '12',
      name: 'Classic Wool Sweater',
      description: 'Warm and cozy wool sweater. Perfect for cooler seasons.',
      price: 15000,
      category: 'collections',
      images: ['assets/buythelook2.png'],
      inStock: true,
      stockQuantity: 30,
      attributes: [
        { name: 'Size', value: 'S, M, L, XL' },
        { name: 'Color', value: 'Cream, Grey, Navy' },
        { name: 'Material', value: 'Merino Wool' }
      ],
      tags: ['sweater', 'knitwear', 'wool'],
      rating: 4.6,
      reviewCount: 52
    }
  ];

  private productsSubject = new BehaviorSubject<Product[]>(this.products);
  public products$ = this.productsSubject.asObservable();

  constructor() {}

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(p => p.category === category);
  }

  getFeaturedProducts(): Product[] {
    return this.products.filter(p => p.featured);
  }

  filterProducts(filters: FilterOptions): Product[] {
    let filtered = [...this.products];

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(p => filters.category!.includes(p.category));
    }

    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange!.min && p.price <= filters.priceRange!.max
      );
    }

    if (filters.inStock !== undefined) {
      filtered = filtered.filter(p => p.inStock === filters.inStock);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }

  searchProducts(query: string): Product[] {
    if (!query) return this.products;
    const queryLower = query.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(queryLower) ||
      p.description.toLowerCase().includes(queryLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }
}
