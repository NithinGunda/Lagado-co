import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, FilterOptions } from '../../models/product.model';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-listing">
      <!-- Filters Sidebar -->
      <aside class="filters-sidebar" [class.mobile-open]="mobileFiltersOpen">
        <div class="filters-header">
          <h3>Filters</h3>
          <button class="close-filters" (click)="closeMobileFilters()" *ngIf="mobileFiltersOpen">×</button>
        </div>

        <!-- Search -->
        <div class="filter-section">
          <label>Search</label>
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            (ngModelChange)="applyFilters()"
            placeholder="Search products..."
            class="filter-input"
          >
        </div>

        <!-- Category Filter -->
        <div class="filter-section">
          <label>Category</label>
          <div class="checkbox-group">
            <label class="checkbox-label" *ngFor="let cat of categories">
              <input 
                type="checkbox" 
                [value]="cat"
                [checked]="selectedCategories.includes(cat)"
                (change)="toggleCategory(cat)"
              >
              <span>{{ cat | titlecase }}</span>
            </label>
          </div>
        </div>

        <!-- Price Range -->
        <div class="filter-section">
          <label>Price Range</label>
          <div class="price-range-display">
            <span>₹{{ priceRangeMin.toLocaleString() }}</span>
            <span>₹{{ priceRangeMax.toLocaleString() }}</span>
          </div>
          <div class="range-slider-container">
            <input 
              type="range" 
              class="range-slider range-min"
              [min]="0"
              [max]="50000"
              [step]="500"
              [(ngModel)]="priceRangeMin"
              (ngModelChange)="onPriceRangeChange()"
            >
            <input 
              type="range" 
              class="range-slider range-max"
              [min]="0"
              [max]="50000"
              [step]="500"
              [(ngModel)]="priceRangeMax"
              (ngModelChange)="onPriceRangeChange()"
            >
            <div class="range-track">
              <div class="range-track-fill" [style.left.%]="(priceRangeMin / 50000) * 100" [style.right.%]="100 - (priceRangeMax / 50000) * 100"></div>
            </div>
          </div>
        </div>

        <!-- In Stock Filter -->
        <div class="filter-section">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              [(ngModel)]="inStockOnly"
              (ngModelChange)="applyFilters()"
            >
            <span>In Stock Only</span>
          </label>
        </div>

        <!-- Clear Filters -->
        <button class="btn btn-clear" (click)="clearFilters()">Clear All Filters</button>
      </aside>

      <!-- Main Content -->
      <div class="products-main">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="results-info">
            <p>{{ filteredProducts.length }} product{{ filteredProducts.length !== 1 ? 's' : '' }} found</p>
            <button class="mobile-filter-btn" (click)="toggleMobileFilters()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filters
            </button>
          </div>
          <div class="sort-options">
            <label>Sort by:</label>
            <select [(ngModel)]="sortBy" (ngModelChange)="applySorting()" class="sort-select">
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="products-grid">
          <div 
            class="product-card" 
            *ngFor="let product of filteredProducts"
            [routerLink]="['/product', product.id]"
          >
            <div class="product-image">
              <div class="product-placeholder" [style.background]="getProductColor(product)"></div>
              <div class="product-badge" *ngIf="product.badge">{{ product.badge }}</div>
              <div class="product-actions">
                <button 
                  class="product-action-btn" 
                  (click)="addToCart(product, $event)"
                  aria-label="Add to cart"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 2L7 6m8-4l-2 4M3 6h18l-2 13H5L3 6z"></path>
                    <circle cx="9" cy="20" r="1"></circle>
                    <circle cx="20" cy="20" r="1"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-category">{{ product.category | titlecase }}</p>
              <div class="product-price-row">
                <p class="product-price">{{ formatPrice(product.price) }}</p>
                <p class="product-original-price" *ngIf="product.originalPrice">{{ formatPrice(product.originalPrice) }}</p>
              </div>
              <div class="product-sizes" *ngIf="getProductSizes(product).length > 0">
                <span class="size-tag" *ngFor="let size of getProductSizes(product)">{{ size }}</span>
              </div>
              <div class="product-rating" *ngIf="product.rating">
                <span class="stars">{{ getStars(product.rating) }}</span>
                <span class="rating-text">({{ product.reviewCount }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredProducts.length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <h3>No products found</h3>
          <p>Try adjusting your filters</p>
          <button class="btn btn-primary" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-listing {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      min-height: calc(100vh - 300px);
    }

    .filters-sidebar {
      width: 220px;
      min-width: 220px;
      background: var(--text-white);
      padding: 16px;
      box-shadow: 0 1px 4px var(--shadow-light);
      height: fit-content;
      position: sticky;
      top: 100px;
      flex-shrink: 0;
    }

    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--border-color);
    }

    .filters-header h3 {
      margin: 0;
      color: var(--primary-color);
      font-size: 1rem;
    }

    .close-filters {
      background: none;
      border: none;
      font-size: 2rem;
      color: var(--text-light);
      cursor: pointer;
      line-height: 1;
    }

    .filter-section {
      margin-bottom: 14px;
    }

    .filter-section > label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: var(--primary-color);
      font-size: 13px;
    }

    .filter-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--border-color);
      font-size: 13px;
      transition: var(--transition-normal);
      box-sizing: border-box;
    }

    .filter-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    label.checkbox-label,
    .filter-section > label.checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 400;
      font-size: 13px;
      margin-bottom: 0;
    }

    label.checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      min-width: 16px;
      min-height: 16px;
      accent-color: var(--primary-color);
      cursor: pointer;
      margin: 0;
      padding: 0;
      flex-shrink: 0;
    }

    label.checkbox-label span {
      user-select: none;
      padding-left: 0;
    }

    /* Price Range Slider */
    .price-range-display {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-color);
      margin-bottom: 12px;
    }

    .range-slider-container {
      position: relative;
      width: 100%;
      height: 24px;
      margin: 8px 0 4px;
    }

    .range-track {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 4px;
      transform: translateY(-50%);
      background: var(--border-color);
      border-radius: 2px;
      z-index: 1;
    }

    .range-track-fill {
      position: absolute;
      top: 0;
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
    }

    .range-slider {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      pointer-events: none;
      margin: 0;
      padding: 0;
      z-index: 2;
    }

    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--primary-color);
      border: 3px solid var(--text-white);
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      pointer-events: auto;
      margin-top: -9px;
    }

    .range-slider::-webkit-slider-runnable-track {
      height: 4px;
      background: transparent;
      cursor: pointer;
    }

    .range-slider::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--primary-color);
      border: 3px solid var(--text-white);
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      pointer-events: auto;
    }

    .range-slider::-moz-range-track {
      height: 4px;
      background: transparent;
      cursor: pointer;
    }

    .btn-clear {
      width: 100%;
      margin-top: 14px;
      padding: 8px;
      font-size: 13px;
      background: var(--secondary-color);
      border: 1px solid var(--border-color);
      color: var(--primary-color);
    }

    .products-main {
      flex: 1;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }

    .results-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .results-info p {
      margin: 0;
      color: var(--text-light);
      font-size: 14px;
    }

    .mobile-filter-btn {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--primary-color);
      color: var(--text-white);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-select {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      font-size: 13px;
      background: var(--text-white);
      color: var(--text-dark);
      cursor: pointer;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .product-card {
      background: var(--text-white);
      overflow: hidden;
      transition: var(--transition-normal);
      cursor: pointer;
      box-shadow: 0 1px 4px var(--shadow-light);
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px var(--shadow-medium);
    }

    .product-image {
      position: relative;
      width: 100%;
      height: 260px;
      overflow: hidden;
    }

    .product-placeholder {
      width: 100%;
      height: 100%;
      transition: var(--transition-slow);
    }

    .product-card:hover .product-placeholder {
      transform: scale(1.05);
    }

    .product-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--accent-color);
      color: var(--primary-color);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      z-index: 2;
    }

    .product-actions {
      position: absolute;
      top: 12px;
      right: 12px;
      opacity: 0;
      transform: translateX(10px);
      transition: var(--transition-normal);
      z-index: 2;
    }

    .product-card:hover .product-actions {
      opacity: 1;
      transform: translateX(0);
    }

    .product-action-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--text-white);
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: var(--transition-normal);
    }

    .product-action-btn:hover {
      background: var(--primary-color);
      color: var(--text-white);
      transform: scale(1.1);
    }

    .product-info {
      padding: 12px;
    }

    .product-name {
      font-size: 0.9rem;
      color: var(--primary-color);
      margin-bottom: 4px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-category {
      font-size: 12px;
      color: var(--text-light);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .product-price-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .product-price {
      font-size: 1.125rem;
      color: var(--primary-color);
      font-weight: 600;
      margin: 0;
    }

    .product-original-price {
      font-size: 0.875rem;
      color: var(--text-light);
      text-decoration: line-through;
      margin: 0;
    }

    .product-sizes {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 6px;
    }

    .size-tag {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-light);
      background: var(--secondary-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      line-height: 1.4;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
    }

    .stars {
      color: #fbbf24;
    }

    .rating-text {
      color: var(--text-light);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl) 0;
      color: var(--text-light);
    }

    .empty-state svg {
      color: var(--primary-color);
      opacity: 0.5;
      margin-bottom: var(--spacing-md);
    }

    .empty-state h3 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    @media (max-width: 1200px) {
      .products-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 968px) {
      .product-listing {
        flex-direction: column;
      }

      .filters-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        min-width: 100%;
        z-index: 1000;
        overflow-y: auto;
        transform: translateX(-100%);
        transition: var(--transition-normal);
      }

      .filters-sidebar.mobile-open {
        transform: translateX(0);
      }

      .mobile-filter-btn {
        display: flex;
      }

      .products-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .product-image { height: 200px; }

      .toolbar {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    @media (max-width: 480px) {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .product-image { height: 180px; }
      .product-info { padding: 10px; }
      .product-name { font-size: 0.8rem; }
    }
  `]
})
export class ProductListingComponent implements OnInit {
  @Input() category?: string;
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['mens', 'womens', 'collections'];
  selectedCategories: string[] = [];
  searchQuery = '';
  priceRangeMin = 0;
  priceRangeMax = 50000;
  inStockOnly = false;
  sortBy = 'default';
  mobileFiltersOpen = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    if (this.category) {
      this.selectedCategories = [this.category];
      this.products = this.productService.getProductsByCategory(this.category);
    } else {
      this.products = this.productService.getAllProducts();
    }
    this.filteredProducts = [...this.products];
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  onPriceRangeChange() {
    // Ensure min doesn't exceed max
    if (this.priceRangeMin > this.priceRangeMax) {
      const temp = this.priceRangeMin;
      this.priceRangeMin = this.priceRangeMax;
      this.priceRangeMax = temp;
    }
    this.applyFilters();
  }

  applyFilters() {
    const filters: FilterOptions = {};

    if (this.selectedCategories.length > 0) {
      filters.category = this.selectedCategories;
    }

    if (this.priceRangeMin > 0 || this.priceRangeMax < 50000) {
      filters.priceRange = {
        min: this.priceRangeMin,
        max: this.priceRangeMax
      };
    }

    if (this.inStockOnly) {
      filters.inStock = true;
    }

    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }

    this.filteredProducts = this.productService.filterProducts(filters);
    this.applySorting();
  }

  applySorting() {
    const sorted = [...this.filteredProducts];
    
    switch (this.sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    this.filteredProducts = sorted;
  }

  clearFilters() {
    this.selectedCategories = this.category ? [this.category] : [];
    this.searchQuery = '';
    this.priceRangeMin = 0;
    this.priceRangeMax = 50000;
    this.inStockOnly = false;
    this.sortBy = 'default';
    this.applyFilters();
  }

  toggleMobileFilters() {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  closeMobileFilters() {
    this.mobileFiltersOpen = false;
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart(product, 1);
    // Show notification or toast here
  }

  getProductSizes(product: Product): string[] {
    const sizeAttr = product.attributes?.find(a => a.name.toLowerCase() === 'size');
    if (!sizeAttr) return [];
    return sizeAttr.value.split(',').map(s => s.trim()).filter(s => s);
  }

  getProductColor(product: Product): string {
    const colors: { [key: string]: string } = {
      'mens': 'linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%)',
      'womens': 'linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%)',
      'collections': 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)'
    };
    return colors[product.category] || colors['collections'];
  }

  formatPrice(price: number): string {
    return `₹${price}`;
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    stars += '☆'.repeat(5 - Math.ceil(rating));
    return stars;
  }
}
