import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-details" *ngIf="product">
      <div class="container">
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a [routerLink]="['/', product.category]">{{ product.category | titlecase }}</a>
          <span>/</span>
          <span>{{ product.name }}</span>
        </nav>

        <div class="product-content">
          <!-- Product Images -->
          <div class="product-images">
            <div class="main-image">
              <div class="image-placeholder" [style.background]="getProductColor()"></div>
            </div>
            <div class="thumbnail-images">
              <div 
                class="thumbnail" 
                *ngFor="let img of product.images; let i = index"
                [class.active]="i === 0"
              >
                <div class="thumbnail-placeholder" [style.background]="getProductColor()"></div>
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <div class="product-header">
              <h1 class="product-title">{{ product.name }}</h1>
              <div class="product-rating" *ngIf="product.rating">
                <span class="stars">{{ getStars(product.rating) }}</span>
                <span class="rating-text">({{ product.reviewCount }} reviews)</span>
              </div>
            </div>

            <div class="product-price-section">
              <span class="current-price">{{ formatPrice(product.price) }}</span>
              <span class="original-price" *ngIf="product.originalPrice">{{ formatPrice(product.originalPrice) }}</span>
              <span class="discount" *ngIf="product.originalPrice">
                {{ getDiscountPercent() }}% OFF
              </span>
            </div>

            <p class="product-description">{{ product.description }}</p>

            <!-- Product Attributes -->
            <div class="product-attributes">
              <div class="attribute-group" *ngIf="hasSizeAttribute()">
                <label>Size</label>
                <div class="attribute-options">
                  <button 
                    *ngFor="let size of getSizes()"
                    class="attribute-btn"
                    [class.selected]="selectedSize === size"
                    (click)="selectedSize = size"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- Color selection removed -->
            </div>

            <!-- Quantity & Add to Cart -->
            <div class="purchase-section">
              <div class="quantity-selector">
                <label>Quantity</label>
                <div class="quantity-controls">
                  <button class="qty-btn" (click)="decreaseQuantity()" [disabled]="quantity <= 1">-</button>
                  <input type="number" [(ngModel)]="quantity" min="1" [max]="product.stockQuantity" class="qty-input">
                  <button class="qty-btn" (click)="increaseQuantity()" [disabled]="quantity >= product.stockQuantity">+</button>
                </div>
                <span class="stock-info" *ngIf="product.inStock">
                  {{ product.stockQuantity }} in stock
                </span>
                <span class="stock-info out-of-stock" *ngIf="!product.inStock">
                  Out of stock
                </span>
              </div>

              <button 
                class="btn btn-primary btn-add-to-cart"
                (click)="addToCart()"
                [disabled]="!product.inStock || !canAddToCart()"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 2L7 6m8-4l-2 4M3 6h18l-2 13H5L3 6z"></path>
                  <circle cx="9" cy="20" r="1"></circle>
                  <circle cx="20" cy="20" r="1"></circle>
                </svg>
                Add to Cart
              </button>
            </div>

            <!-- Product Details -->
            <div class="product-details-section">
              <h3>Product Details</h3>
              <ul class="details-list">
                <li *ngFor="let attr of getFilteredAttributes()">
                  <strong>{{ attr.name }}:</strong> {{ attr.value }}
                </li>
                <li>
                  <strong>Category:</strong> {{ product.category | titlecase }}
                </li>
                <li>
                  <strong>Availability:</strong> 
                  <span [class.in-stock]="product.inStock" [class.out-of-stock]="!product.inStock">
                    {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Tags -->
            <div class="product-tags">
              <span class="tag" *ngFor="let tag of product.tags">{{ tag }}</span>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <section class="related-products section" *ngIf="relatedProducts.length > 0">
          <h2>You May Also Like</h2>
          <div class="related-grid">
            <div 
              class="related-card"
              *ngFor="let related of relatedProducts"
              [routerLink]="['/product', related.id]"
            >
              <div class="related-image">
                <div class="related-placeholder" [style.background]="getProductColor(related)"></div>
              </div>
              <h4>{{ related.name }}</h4>
              <p class="related-price">{{ formatPrice(related.price) }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="product-not-found" *ngIf="!product">
      <div class="container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <a routerLink="/collections" class="btn btn-primary">Browse Collections</a>
      </div>
    </div>
  `,
  styles: [`
    .product-details {
      padding: var(--spacing-lg) 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: var(--spacing-md);
      font-size: 14px;
      color: var(--text-light);
    }

    .breadcrumb a {
      color: var(--primary-color);
      transition: var(--transition-normal);
    }

    .breadcrumb a:hover {
      color: var(--primary-dark);
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .main-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      background: var(--secondary-color);
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      transition: var(--transition-slow);
    }

    .thumbnail-images {
      display: flex;
      gap: var(--spacing-xs);
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: var(--transition-normal);
    }

    .thumbnail.active {
      border-color: var(--primary-color);
    }

    .thumbnail-placeholder {
      width: 100%;
      height: 100%;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .product-header {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .product-title {
      font-size: 2rem;
      color: var(--primary-color);
      margin: 0;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stars {
      color: #fbbf24;
    }

    .rating-text {
      color: var(--text-light);
      font-size: 14px;
    }

    .product-price-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .current-price {
      font-size: 2rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    .original-price {
      font-size: 1.25rem;
      color: var(--text-light);
      text-decoration: line-through;
    }

    .discount {
      background: var(--accent-color);
      color: var(--primary-color);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .product-description {
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--text-light);
    }

    .product-attributes {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .attribute-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--primary-color);
    }

    .attribute-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .attribute-btn {
      padding: 10px 20px;
      border: 2px solid var(--border-color);
      background: var(--text-white);
      color: var(--text-dark);
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition-normal);
      font-size: 14px;
    }

    .attribute-btn:hover {
      border-color: var(--primary-color);
    }

    .attribute-btn.selected {
      background: var(--primary-color);
      color: var(--text-white);
      border-color: var(--primary-color);
    }

    .purchase-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--secondary-color);
      border-radius: 12px;
    }

    .quantity-selector {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .quantity-selector label {
      font-weight: 600;
      color: var(--primary-color);
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qty-btn {
      width: 40px;
      height: 40px;
      border: 2px solid var(--border-color);
      background: var(--text-white);
      color: var(--primary-color);
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.25rem;
      font-weight: 600;
      transition: var(--transition-normal);
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--primary-color);
      color: var(--text-white);
      border-color: var(--primary-color);
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-input {
      width: 60px;
      height: 40px;
      text-align: center;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
    }

    .stock-info {
      font-size: 12px;
      color: var(--text-light);
    }

    .stock-info.out-of-stock {
      color: #e74c3c;
    }

    .btn-add-to-cart {
      width: 100%;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .btn-add-to-cart:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .product-details-section {
      padding-top: var(--spacing-md);
      border-top: 2px solid var(--border-color);
    }

    .product-details-section h3 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    .details-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .details-list li {
      color: var(--text-light);
    }

    .details-list strong {
      color: var(--primary-color);
    }

    .in-stock {
      color: #27ae60;
    }

    .out-of-stock {
      color: #e74c3c;
    }

    .product-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      padding: 4px 12px;
      background: var(--secondary-color);
      color: var(--primary-color);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .related-products {
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-xl);
      border-top: 2px solid var(--border-color);
    }

    .related-products h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .related-card {
      cursor: pointer;
      transition: var(--transition-normal);
    }

    .related-card:hover {
      transform: translateY(-5px);
    }

    .related-image {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: var(--spacing-sm);
    }

    .related-placeholder {
      width: 100%;
      height: 100%;
    }

    .related-card h4 {
      color: var(--primary-color);
      margin-bottom: 4px;
      font-size: 1rem;
    }

    .related-price {
      color: var(--text-light);
      font-weight: 600;
    }

    .product-not-found {
      padding: var(--spacing-xl) 0;
      text-align: center;
    }

    .product-not-found h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    @media (max-width: 968px) {
      .product-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  relatedProducts: Product[] = [];
  quantity = 1;
  selectedSize?: string;
  selectedColor?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.product = this.productService.getProductById(productId);
      if (this.product) {
        this.loadRelatedProducts();
        // Set default size/color if available
        if (this.hasSizeAttribute()) {
          this.selectedSize = this.getSizes()[0];
        }
        if (this.hasColorAttribute()) {
          this.selectedColor = this.getColors()[0];
        }
      }
    }
  }

  loadRelatedProducts() {
    if (!this.product) return;
    const allProducts = this.productService.getAllProducts();
    this.relatedProducts = allProducts
      .filter(p => p.id !== this.product!.id && p.category === this.product!.category)
      .slice(0, 4);
  }

  hasSizeAttribute(): boolean {
    return this.product?.attributes.some(a => a.name.toLowerCase() === 'size') || false;
  }

  hasColorAttribute(): boolean {
    return this.product?.attributes.some(a => a.name.toLowerCase() === 'color') || false;
  }

  getSizes(): string[] {
    const sizeAttr = this.product?.attributes.find(a => a.name.toLowerCase() === 'size');
    return sizeAttr ? sizeAttr.value.split(',').map(s => s.trim()) : [];
  }

  getColors(): string[] {
    const colorAttr = this.product?.attributes.find(a => a.name.toLowerCase() === 'color');
    return colorAttr ? colorAttr.value.split(',').map(c => c.trim()) : [];
  }

  getColorValue(color: string): string {
    const colorMap: { [key: string]: string } = {
      'Navy Blue': '#1e3a5f',
      'Black': '#000000',
      'White': '#ffffff',
      'Ivory': '#fffff0',
      'Brown': '#8b4513',
      'Cream': '#f5f1e8',
      'Grey': '#808080',
      'Navy': '#1e3a5f',
      'Indigo': '#4b0082',
      'Khaki': '#c3b091'
    };
    return colorMap[color] || '#cccccc';
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  canAddToCart(): boolean {
    if (!this.product) return false;
    if (this.hasSizeAttribute() && !this.selectedSize) return false;
    return true;
  }

  getFilteredAttributes(): { name: string; value: string }[] {
    if (!this.product) return [];
    return this.product.attributes.filter(a => a.name.toLowerCase() !== 'color');
  }

  addToCart() {
    if (!this.product || !this.canAddToCart()) return;
    
    this.cartService.addToCart(
      this.product,
      this.quantity,
      this.selectedSize,
      this.selectedColor
    );
    
    // Show success message or navigate to cart
    // You can add a toast notification here
    alert(`${this.product.name} added to cart!`);
  }

  getDiscountPercent(): number {
    if (!this.product?.originalPrice) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    stars += '☆'.repeat(5 - Math.ceil(rating));
    return stars;
  }

  formatPrice(price: number): string {
    return `₹${price}`;
  }

  getProductColor(product?: Product): string {
    const p = product || this.product;
    if (!p) return 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)';
    const colors: { [key: string]: string } = {
      'mens': 'linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%)',
      'womens': 'linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%)',
      'collections': 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)'
    };
    return colors[p.category] || colors['collections'];
  }
}
