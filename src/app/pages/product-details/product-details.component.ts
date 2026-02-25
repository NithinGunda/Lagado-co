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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"></polyline></svg>
          <a [routerLink]="['/', product.category]">{{ product.category | titlecase }}</a>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"></polyline></svg>
          <span class="breadcrumb-current">{{ product.name }}</span>
        </nav>

        <div class="product-content">
          <div class="product-images">
            <div class="main-image" (mouseenter)="imageZoom=true" (mouseleave)="imageZoom=false">
              <img *ngIf="getMainImageUrl()" class="image-actual" [src]="getMainImageUrl()" [alt]="product.name" [class.zoomed]="imageZoom" />
              <div *ngIf="!getMainImageUrl()" class="image-placeholder" [style.background]="getProductColor()" [class.zoomed]="imageZoom"></div>
              <div class="discount-badge" *ngIf="product.originalPrice">
                -{{ getDiscountPercent() }}%
              </div>
            </div>
            <div class="thumbnail-images" *ngIf="product.images && product.images.length > 1">
              <div 
                class="thumbnail" 
                *ngFor="let img of product.images; let i = index"
                [class.active]="selectedImageIndex === i"
                (click)="selectedImageIndex = i"
              >
                <img *ngIf="getThumbnailUrl(i)" class="thumbnail-actual" [src]="getThumbnailUrl(i)" [alt]="product.name" />
                <div *ngIf="!getThumbnailUrl(i)" class="thumbnail-placeholder" [style.background]="getProductColor()"></div>
              </div>
            </div>
          </div>

          <div class="product-info">
            <div class="product-header">
              <span class="product-category-label">{{ product.category | titlecase }}</span>
              <h1 class="product-title">{{ product.name }}</h1>
              <div class="product-rating" *ngIf="product.rating">
                <div class="stars-container">
                  <span class="star" *ngFor="let s of [1,2,3,4,5]" [class.filled]="s <= product.rating" [class.half]="s === Math.ceil(product.rating) && product.rating % 1 >= 0.3">&#9733;</span>
                </div>
                <span class="rating-score">{{ product.rating }}</span>
                <span class="rating-text">({{ product.reviewCount }} reviews)</span>
              </div>
            </div>

            <div class="product-price-section">
              <span class="current-price">{{ formatPrice(product.price) }}</span>
              <span class="original-price" *ngIf="product.originalPrice">{{ formatPrice(product.originalPrice) }}</span>
              <span class="discount-tag" *ngIf="product.originalPrice">
                {{ getDiscountPercent() }}% OFF
              </span>
            </div>

            <div class="divider"></div>

            <p class="product-description">{{ product.description }}</p>

            <div class="product-attributes" *ngIf="hasSizeAttribute()">
              <div class="attribute-group">
                <div class="size-label-row">
                  <label>Select Size</label>
                  <button class="size-guide-toggle" *ngIf="product.size_guide?.columns?.length" (click)="showSizeGuide = !showSizeGuide">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v7h18V3zM21 14H3v7h18v-7z"></path><path d="M12 3v7M12 14v7M7 3v7M7 14v7M17 3v7M17 14v7"></path></svg>
                    Size Guide
                  </button>
                </div>
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
            </div>

            <!-- Size Guide Panel -->
            <div class="size-guide-panel" *ngIf="showSizeGuide && product.size_guide?.columns?.length">
              <div class="size-guide-header">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v7h18V3zM21 14H3v7h18v-7z"></path><path d="M12 3v7M12 14v7M7 3v7M7 14v7M17 3v7M17 14v7"></path></svg>
                  Size Guide
                </h3>
                <button class="sg-close" (click)="showSizeGuide = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div class="size-guide-table-wrap">
                <table class="size-guide-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th *ngFor="let col of product.size_guide?.columns">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let row of product.size_guide?.rows" [class.active-size]="selectedSize === row.size">
                      <td class="sg-size-label">{{ row.size }}</td>
                      <td *ngFor="let val of row.values">{{ val || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="sg-note">All measurements are in inches. Sizes may vary slightly.</p>
            </div>

            <div class="purchase-section">
              <div class="quantity-row">
                <label>Quantity</label>
                <div class="quantity-controls">
                  <button class="qty-btn" (click)="decreaseQuantity()" [disabled]="quantity <= 1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <span class="qty-display">{{ quantity }}</span>
                  <button class="qty-btn" (click)="increaseQuantity()" [disabled]="quantity >= product.stockQuantity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
                <span class="stock-info" *ngIf="product.inStock">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {{ product.stockQuantity }} in stock
                </span>
                <span class="stock-info out-of-stock" *ngIf="!product.inStock">
                  Out of stock
                </span>
              </div>

              <div class="action-buttons">
                <button 
                  class="btn-add-to-cart"
                  (click)="addToCart()"
                  [disabled]="!product.inStock || !canAddToCart()"
                  [class.added]="showAddedFeedback"
                >
                  <svg *ngIf="!showAddedFeedback" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 2L7 6m8-4l-2 4M3 6h18l-2 13H5L3 6z"></path>
                    <circle cx="9" cy="20" r="1"></circle>
                    <circle cx="20" cy="20" r="1"></circle>
                  </svg>
                  <svg *ngIf="showAddedFeedback" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {{ showAddedFeedback ? 'Added to Cart!' : 'Add to Cart' }}
                </button>
                <button class="btn-buy-now" (click)="buyNow()" [disabled]="!product.inStock || !canAddToCart()">
                  Buy Now
                </button>
              </div>
            </div>

            <div class="trust-badges">
              <div class="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Secure Checkout</span>
              </div>
              <div class="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span>Quality Assured</span>
              </div>
              <div class="trust-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span>Free Shipping over &#8377;5000</span>
              </div>
            </div>

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

            <div class="product-tags" *ngIf="product.tags && product.tags.length">
              <span class="tag" *ngFor="let tag of product.tags">{{ tag }}</span>
            </div>
          </div>
        </div>

        <section class="related-products section" *ngIf="relatedProducts.length > 0">
          <h2>You May Also Like</h2>
          <div class="related-grid">
            <div 
              class="related-card"
              *ngFor="let related of relatedProducts"
              [routerLink]="['/product', related.id]"
            >
              <div class="related-image">
                <img *ngIf="getRelatedImageUrl(related)" class="related-actual" [src]="getRelatedImageUrl(related)" [alt]="related.name" />
                <div *ngIf="!getRelatedImageUrl(related)" class="related-placeholder" [style.background]="getProductColor(related)"></div>
                <div class="related-overlay">
                  <span>View Product</span>
                </div>
              </div>
              <div class="related-info">
                <h4>{{ related.name }}</h4>
                <p class="related-price">{{ formatPrice(related.price) }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Toast notification -->
    <div class="toast-notification" *ngIf="showToast">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      {{ toastMessage }}
    </div>

    <div class="product-not-found" *ngIf="!product">
      <div class="container">
        <div class="not-found-content">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5" opacity="0.4">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <a routerLink="/collections" class="btn btn-primary">Browse Collections</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-details {
      padding: var(--spacing-lg) 0;
      animation: fadeInUp 0.4s ease;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: var(--spacing-md);
      font-size: 13px;
      color: var(--text-muted);
    }

    .breadcrumb a {
      color: var(--text-light);
      transition: color 0.2s ease;
    }

    .breadcrumb a:hover {
      color: var(--primary-color);
      opacity: 1;
    }

    .breadcrumb svg { opacity: 0.4; flex-shrink: 0; }

    .breadcrumb-current {
      color: var(--text-dark);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
      align-items: start;
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      position: sticky;
      top: 100px;
    }

    .main-image {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--secondary-color);
      position: relative;
      cursor: crosshair;
    }

    .image-actual {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.5s ease;
    }
    .image-actual.zoomed {
      transform: scale(1.12);
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      transition: transform 0.5s ease;
    }

    .image-placeholder.zoomed {
      transform: scale(1.12);
    }

    .discount-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background: var(--accent-color);
      color: var(--text-white);
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      z-index: 2;
    }

    .thumbnail-images {
      display: flex;
      gap: 10px;
    }

    .thumbnail {
      width: 72px;
      height: 72px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid var(--border-color);
      transition: all 0.25s ease;
      opacity: 0.7;
    }

    .thumbnail:hover {
      opacity: 1;
      border-color: var(--text-muted);
      transform: translateY(-2px);
    }

    .thumbnail.active {
      border-color: var(--primary-color);
      opacity: 1;
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .thumbnail-actual {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .thumbnail-placeholder {
      width: 100%;
      height: 100%;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .product-category-label {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .product-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--text-dark);
      margin: 0;
      line-height: 1.3;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .stars-container { display: flex; gap: 2px; }

    .star {
      color: var(--border-color);
      font-size: 16px;
      transition: color 0.2s;
    }

    .star.filled { color: #f59e0b; }
    .star.half { color: #fbbf24; }

    .rating-score {
      font-weight: 600;
      color: var(--text-dark);
      font-size: 14px;
    }

    .rating-text {
      color: var(--text-muted);
      font-size: 13px;
    }

    .product-price-section {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .current-price {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-dark);
    }

    .original-price {
      font-size: 1.1rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }

    .discount-tag {
      background: #fef2f2;
      color: #b91c1c;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .divider {
      height: 1px;
      background: var(--border-color);
    }

    .product-description {
      font-size: 15px;
      line-height: 1.75;
      color: var(--text-light);
    }

    .product-attributes {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .attribute-group label {
      display: block;
      margin-bottom: 10px;
      font-weight: 600;
      font-size: 14px;
      color: var(--text-dark);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .attribute-options {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .attribute-btn {
      min-width: 52px;
      padding: 10px 18px;
      border: 2px solid var(--border-color);
      background: var(--text-white);
      color: var(--text-dark);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }

    .attribute-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateY(-1px);
    }

    .attribute-btn.selected {
      background: var(--btn-primary);
      color: var(--text-white);
      border-color: var(--btn-primary);
      box-shadow: 0 2px 8px rgba(30, 58, 95, 0.25);
    }

    .size-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .size-label-row label {
      margin-bottom: 0;
    }

    .size-guide-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      font-family: var(--font-body);
      transition: all 0.2s ease;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .size-guide-toggle:hover {
      color: var(--btn-primary-hover);
    }

    .size-guide-panel {
      background: var(--grey-light);
      border: 1px solid var(--border-color);
      padding: 20px;
      animation: fadeInUp 0.3s ease;
    }

    .size-guide-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .size-guide-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      color: var(--text-dark);
      margin: 0;
    }

    .sg-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 4px;
      transition: color 0.2s;
    }

    .sg-close:hover { color: var(--text-dark); }

    .size-guide-table-wrap {
      overflow-x: auto;
    }

    .size-guide-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .size-guide-table th {
      padding: 10px 14px;
      background: var(--btn-primary);
      color: var(--text-white);
      font-weight: 600;
      text-align: center;
      white-space: nowrap;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .size-guide-table td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border-color);
      text-align: center;
      color: var(--text-light);
      background: var(--text-white);
      transition: background 0.2s;
    }

    .size-guide-table tr.active-size td {
      background: rgba(60, 90, 153, 0.08);
      color: var(--text-dark);
      font-weight: 600;
    }

    .sg-size-label {
      font-weight: 700;
      color: var(--text-dark);
      text-align: left;
    }

    .size-guide-table tr:hover td {
      background: rgba(60, 90, 153, 0.05);
    }

    .sg-note {
      margin: 12px 0 0;
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
    }

    .purchase-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
      background: var(--grey-light);
      border: 1px solid var(--border-color);
    }

    .quantity-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .quantity-row label {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-dark);
      min-width: 60px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      border: 2px solid var(--border-color);
      background: var(--text-white);
    }

    .qty-btn {
      width: 44px;
      height: 44px;
      border: none;
      background: transparent;
      color: var(--text-dark);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .qty-btn:hover:not(:disabled) {
      background: var(--primary-color);
      color: var(--text-white);
    }

    .qty-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .qty-display {
      width: 48px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-dark);
      border-left: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      padding: 10px 0;
    }

    .stock-info {
      font-size: 13px;
      color: #27ae60;
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    .stock-info.out-of-stock {
      color: #e74c3c;
    }

    .action-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .btn-add-to-cart {
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 600;
      background: var(--btn-primary);
      color: var(--text-white);
      border: 2px solid var(--btn-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: var(--font-body);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-add-to-cart:hover:not(:disabled) {
      background: var(--btn-primary-hover);
      border-color: var(--btn-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(30, 58, 95, 0.3);
    }

    .btn-add-to-cart:active:not(:disabled) { transform: translateY(0); }

    .btn-add-to-cart.added {
      background: #27ae60;
      border-color: #27ae60;
    }

    .btn-add-to-cart:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-buy-now {
      padding: 16px 24px;
      font-size: 15px;
      font-weight: 600;
      background: transparent;
      color: var(--btn-primary);
      border: 2px solid var(--btn-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: var(--font-body);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-buy-now:hover:not(:disabled) {
      background: var(--btn-primary);
      color: var(--text-white);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(30, 58, 95, 0.3);
    }

    .btn-buy-now:active:not(:disabled) { transform: translateY(0); }

    .btn-buy-now:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .trust-badges {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-light);
      font-weight: 500;
    }

    .product-details-section {
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    .product-details-section h3 {
      color: var(--text-dark);
      margin-bottom: var(--spacing-sm);
      font-size: 1.1rem;
    }

    .details-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .details-list li {
      color: var(--text-light);
      font-size: 14px;
      display: flex;
      gap: 4px;
    }

    .details-list strong {
      color: var(--text-dark);
      min-width: 100px;
    }

    .in-stock { color: #27ae60; font-weight: 600; }
    .out-of-stock { color: #e74c3c; font-weight: 600; }

    .product-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      padding: 5px 14px;
      background: var(--grey-light);
      color: var(--text-light);
      font-size: 12px;
      font-weight: 500;
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }

    .tag:hover {
      background: var(--primary-color);
      color: var(--text-white);
      border-color: var(--primary-color);
    }

    .related-products {
      margin-top: var(--spacing-xl);
      padding-top: var(--spacing-xl);
      border-top: 1px solid var(--border-color);
    }

    .related-products h2 {
      color: var(--text-dark);
      margin-bottom: var(--spacing-md);
      font-size: 1.5rem;
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .related-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .related-card:hover {
      transform: translateY(-6px);
    }

    .related-image {
      width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      margin-bottom: 12px;
      position: relative;
    }

    .related-actual {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }
    .related-card:hover .related-actual {
      transform: scale(1.08);
    }

    .related-placeholder {
      width: 100%;
      height: 100%;
      transition: transform 0.4s ease;
    }

    .related-card:hover .related-placeholder {
      transform: scale(1.08);
    }

    .related-overlay {
      position: absolute;
      inset: 0;
      background: rgba(30, 58, 95, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .related-overlay span {
      color: var(--text-white);
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      border: 1px solid var(--text-white);
      padding: 8px 16px;
    }

    .related-card:hover .related-overlay {
      opacity: 1;
    }

    .related-info {
      padding: 0 4px;
    }

    .related-card h4 {
      color: var(--text-dark);
      margin-bottom: 4px;
      font-size: 0.95rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .related-price {
      color: var(--text-dark);
      font-weight: 700;
      font-size: 15px;
      margin: 0;
    }

    .product-not-found {
      padding: var(--spacing-xl) 0;
    }

    .not-found-content {
      text-align: center;
      padding: var(--spacing-xl);
      background: var(--grey-light);
      border: 1px solid var(--border-color);
    }

    .not-found-content h2 {
      color: var(--text-dark);
      margin: var(--spacing-sm) 0 8px;
    }

    .not-found-content p {
      margin-bottom: var(--spacing-md);
      color: var(--text-muted);
    }

    @media (max-width: 968px) {
      .product-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-lg);
      }
      .product-images { position: static; }
      .related-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .action-buttons { grid-template-columns: 1fr; }
      .trust-badges { flex-direction: column; gap: 12px; }
      .quantity-row { flex-direction: column; align-items: flex-start; }
      .related-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }

    @media (max-width: 480px) {
      .product-title { font-size: 1.3rem; }
      .current-price { font-size: 1.4rem; }
      .btn-add-to-cart, .btn-buy-now { padding: 14px 16px; font-size: 13px; }
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  relatedProducts: Product[] = [];
  quantity = 1;
  selectedSize?: string;
  selectedColor?: string;
  selectedImageIndex = 0;
  imageZoom = false;
  showSizeGuide = false;
  showToast = false;
  toastMessage = '';
  showAddedFeedback = false;
  Math = Math;

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
    
    this.showAddedFeedback = true;
    this.showToastMessage(`${this.product.name} added to cart!`);
    setTimeout(() => this.showAddedFeedback = false, 1800);
  }

  buyNow() {
    if (!this.product || !this.canAddToCart()) return;
    this.cartService.addToCart(this.product, this.quantity, this.selectedSize, this.selectedColor);
    this.router.navigate(['/cart']);
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
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
    return `₹${price.toLocaleString()}`;
  }

  getMainImageUrl(): string {
    if (!this.product) return '';
    const idx = this.selectedImageIndex || 0;
    const img = this.product.images?.[idx] || this.product.images?.[0];
    if (img && img.startsWith('assets/')) return img;
    if (img && img.startsWith('http')) return img;
    if (this.product.image_url) return this.product.image_url;
    if (this.product.image_urls?.length) return this.product.image_urls[idx] || this.product.image_urls[0];
    return '';
  }

  getThumbnailUrl(index: number): string {
    if (!this.product) return '';
    const img = this.product.images?.[index];
    if (img && (img.startsWith('assets/') || img.startsWith('http'))) return img;
    if (this.product.image_urls?.[index]) return this.product.image_urls[index];
    return '';
  }

  getRelatedImageUrl(product: Product): string {
    if (!product) return '';
    if (product.images?.length && (product.images[0].startsWith('assets/') || product.images[0].startsWith('http'))) return product.images[0];
    if (product.image_url) return product.image_url;
    if (product.image_urls?.length) return product.image_urls[0];
    return '';
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
