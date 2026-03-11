import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../services/product-api.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AppLoadingService } from '../../services/app-loading.service';
import { Product, FilterOptions } from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="listing-page" (mousemove)="onMouseMove($event)">
      <!-- Custom cursor glow -->
      <div class="cursor-glow" [style.left.px]="cursorX" [style.top.px]="cursorY" [class.active]="cursorActive"></div>

      <!-- Floating filter bar -->
      <div class="filter-bar">
        <div class="filter-bar-inner">
          <div class="filter-chips">
            <button
              class="chip"
              [class.active]="!selectedCategoryId"
              (click)="selectCategoryById(null)"
            >All</button>
            <button
              *ngFor="let cat of filterCategories"
              class="chip"
              [class.active]="selectedCategoryId === cat.id"
              (click)="selectCategoryById(cat.id ?? null)"
            >{{ cat.name }}</button>
          </div>

          <div class="filter-controls">
            <div class="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Search products..."
              />
            </div>

            <button class="filter-toggle" (click)="showAdvanced = !showAdvanced" [class.active]="showAdvanced || hasActiveFilters">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                <circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>
              </svg>
              <span>Filters</span>
              <span class="filter-count" *ngIf="activeFilterCount > 0">{{ activeFilterCount }}</span>
            </button>

            <select [(ngModel)]="sortBy" (ngModelChange)="applySorting()" class="sort-select">
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <!-- Advanced filters drawer -->
        <div class="advanced-filters" [class.open]="showAdvanced">
          <div class="af-inner">
            <div class="af-group">
              <label>Price Range</label>
              <div class="price-display">
                <span>₹{{ priceRangeMin.toLocaleString() }}</span>
                <span class="price-dash">—</span>
                <span>₹{{ priceRangeMax.toLocaleString() }}</span>
              </div>
              <div class="range-slider-container">
                <input type="range" class="range-slider" [min]="0" [max]="50000" [step]="500"
                  [(ngModel)]="priceRangeMin" (ngModelChange)="onPriceRangeChange()" />
                <input type="range" class="range-slider" [min]="0" [max]="50000" [step]="500"
                  [(ngModel)]="priceRangeMax" (ngModelChange)="onPriceRangeChange()" />
                <div class="range-track">
                  <div class="range-fill" [style.left.%]="(priceRangeMin / 50000) * 100" [style.right.%]="100 - (priceRangeMax / 50000) * 100"></div>
                </div>
              </div>
            </div>

            <label class="toggle-label">
              <span>In Stock Only</span>
              <div class="toggle" [class.on]="inStockOnly" (click)="inStockOnly = !inStockOnly; applyFilters()">
                <div class="toggle-knob"></div>
              </div>
            </label>

            <button class="af-clear" (click)="clearFilters()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Results count -->
      <div class="results-bar">
        <p class="result-count">
          <strong>{{ filteredProducts.length }}</strong> product{{ filteredProducts.length !== 1 ? 's' : '' }}
        </p>
        <div class="active-tags" *ngIf="hasActiveFilters">
          <span class="tag" *ngIf="searchQuery" (click)="searchQuery=''; applyFilters()">
            "{{ searchQuery }}" <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
          <span class="tag" *ngIf="inStockOnly" (click)="inStockOnly=false; applyFilters()">
            In Stock <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
          <span class="tag" *ngIf="priceRangeMin > 0 || priceRangeMax < 50000" (click)="priceRangeMin=0; priceRangeMax=50000; applyFilters()">
            ₹{{ priceRangeMin.toLocaleString() }}–₹{{ priceRangeMax.toLocaleString() }} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
        </div>
      </div>

      <!-- Products Grid (global logo loader shows while loading) -->
      <div class="products-grid" *ngIf="!loading">
        <div
          class="product-card"
          *ngFor="let product of filteredProducts; let i = index"
          [routerLink]="['/product', product.id]"
          [style.animation-delay]="i * 0.05 + 's'"
          (mouseenter)="cursorActive = true"
          (mouseleave)="cursorActive = false"
        >
          <!-- Image -->
          <div class="card-image">
            <img class="card-img-inner" [src]="getProductImage(product)" [alt]="product.name" loading="lazy" />
            <div class="card-img-fallback" [style.background]="getProductColor(product)"></div>
            <div class="card-overlay"></div>

            <!-- Badges -->
            <div class="badge sale" *ngIf="product.original_price || product.originalPrice">-{{ getDiscountPercent(product) }}%</div>
            <div class="badge new" *ngIf="product.badge && !product.original_price && !product.originalPrice">{{ product.badge }}</div>

            <!-- Quick actions -->
            <div class="card-actions">
              <button
                class="action-btn cart-btn"
                (click)="addToCart(product, $event)"
                [disabled]="isProductOutOfStock(product)"
                [class.added]="addedProductId === strId(product.id)"
                [attr.aria-label]="isProductOutOfStock(product) ? 'Out of stock' : 'Add to cart'"
              >
                <svg *ngIf="addedProductId !== strId(product.id)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <svg *ngIf="addedProductId === strId(product.id)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>

            <!-- Quick view strip -->
            <div class="quick-view-strip">
              <span>Quick View</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </div>

          <!-- Info -->
          <div class="card-info">
            <span class="card-category">{{ getProductCategoryName(product) }}</span>
            <h3 class="card-name">{{ product.name }}</h3>
            <div class="card-price-row">
              <span class="card-price">{{ formatPrice(product.price) }}</span>
              <span class="card-original" *ngIf="product.original_price || product.originalPrice">{{ formatPrice(product.original_price || product.originalPrice) }}</span>
            </div>
            <div class="card-sizes" *ngIf="getProductSizes(product).length > 0">
              <span *ngFor="let size of getProductSizes(product)">{{ size }}</span>
            </div>
            <div class="card-rating" *ngIf="product.rating">
              <div class="star-bar">
                <div class="star-fill" [style.width.%]="(product.rating / 5) * 100"></div>
                <span>★★★★★</span>
              </div>
              <span class="rating-num">{{ product.rating }}</span>
              <span class="review-count">({{ product.reviewCount }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" [class.show]="showToast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {{ toastMessage }}
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="!loading && filteredProducts.length === 0">
        <div class="empty-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms</p>
        <button class="btn-reset" (click)="clearFilters()">Reset Filters</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .listing-page {
      position: relative;
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 clamp(16px, 3vw, 40px) 60px;
    }

    /* ===== CUSTOM CURSOR GLOW ===== */
    .cursor-glow {
      position: fixed; width: 320px; height: 320px; border-radius: 50%;
      background: radial-gradient(circle, rgba(232,197,71,0.06) 0%, transparent 70%);
      pointer-events: none; z-index: 0;
      transform: translate(-50%, -50%);
      transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
      opacity: 0;
    }
    .cursor-glow.active {
      opacity: 1; width: 400px; height: 400px;
    }

    /* ===== FILTER BAR ===== */
    .filter-bar {
      position: sticky; top: 70px; z-index: 50;
      background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(0,0,0,0.06);
      margin: 0 -clamp(16px, 3vw, 40px);
      padding: 0 clamp(16px, 3vw, 40px);
    }
    .filter-bar-inner {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; padding: 14px 0; flex-wrap: wrap;
    }

    .filter-chips {
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .chip {
      padding: 8px 20px; border: 1.5px solid var(--border-color);
      background: transparent; color: var(--text-dark);
      font-size: 12px; font-weight: 600; letter-spacing: 0.8px;
      text-transform: uppercase; cursor: pointer;
      font-family: var(--font-body);
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      position: relative; overflow: hidden;
    }
    .chip::after {
      content: ''; position: absolute; bottom: 0; left: 50%; width: 0; height: 2px;
      background: var(--primary-color); transition: all 0.3s ease;
      transform: translateX(-50%);
    }
    .chip:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .chip:hover::after { width: 60%; }
    .chip.active {
      background: var(--primary-color); color: #fff;
      border-color: var(--primary-color);
    }
    .chip.active::after { display: none; }

    .filter-controls {
      display: flex; align-items: center; gap: 10px;
    }

    .search-box {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 14px; border: 1.5px solid var(--border-color);
      background: #fff; transition: border-color 0.3s, box-shadow 0.3s;
      min-width: 200px;
    }
    .search-box:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(21,42,71,0.06);
    }
    .search-box svg { color: var(--text-muted); flex-shrink: 0; }
    .search-box input {
      border: none; outline: none; background: transparent;
      font-size: 13px; font-family: var(--font-body); width: 100%;
      color: var(--text-dark);
    }
    .search-box input::placeholder { color: var(--text-muted); }

    .filter-toggle {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border: 1.5px solid var(--border-color);
      background: #fff; cursor: pointer; font-size: 12px;
      font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
      font-family: var(--font-body); color: var(--text-dark);
      transition: all 0.3s ease;
    }
    .filter-toggle:hover, .filter-toggle.active {
      border-color: var(--primary-color); color: var(--primary-color);
    }
    .filter-count {
      background: var(--primary-color); color: #fff;
      font-size: 10px; padding: 1px 6px; border-radius: 10px;
      font-weight: 700; line-height: 1.4;
    }

    .sort-select {
      padding: 9px 14px; border: 1.5px solid var(--border-color);
      font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
      text-transform: uppercase; background: #fff; cursor: pointer;
      font-family: var(--font-body); color: var(--text-dark);
      transition: border-color 0.3s;
    }
    .sort-select:focus { border-color: var(--primary-color); outline: none; }

    /* Advanced filters */
    .advanced-filters {
      max-height: 0; overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), padding 0.4s ease;
      padding: 0;
    }
    .advanced-filters.open { max-height: 200px; padding: 16px 0; }
    .af-inner {
      display: flex; align-items: center; gap: 32px; flex-wrap: wrap;
    }
    .af-group label {
      display: block; font-size: 11px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;
    }
    .price-display {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;
    }
    .price-dash { color: var(--text-muted); font-weight: 400; }

    .range-slider-container {
      position: relative; width: 200px; height: 20px;
    }
    .range-track {
      position: absolute; top: 50%; left: 0; right: 0;
      height: 3px; transform: translateY(-50%);
      background: var(--border-color); z-index: 1;
    }
    .range-fill {
      position: absolute; top: 0; height: 100%;
      background: var(--primary-color);
    }
    .range-slider {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      -webkit-appearance: none; appearance: none;
      background: transparent; pointer-events: none; margin: 0; z-index: 2;
    }
    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 16px; height: 16px;
      border-radius: 50%; background: var(--primary-color);
      border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      cursor: pointer; pointer-events: auto;
    }
    .range-slider::-moz-range-thumb {
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--primary-color); border: 3px solid #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      cursor: pointer; pointer-events: auto;
    }

    .toggle-label {
      display: flex; align-items: center; gap: 10px;
      font-size: 12px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-dark); cursor: pointer;
    }
    .toggle {
      width: 38px; height: 20px; background: var(--border-color);
      border-radius: 10px; position: relative; cursor: pointer;
      transition: background 0.3s;
    }
    .toggle.on { background: var(--primary-color); }
    .toggle-knob {
      position: absolute; top: 2px; left: 2px;
      width: 16px; height: 16px; background: #fff;
      border-radius: 50%; transition: transform 0.3s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle.on .toggle-knob { transform: translateX(18px); }

    .af-clear {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border: 1px solid rgba(185,28,28,0.3);
      background: transparent; color: #b91c1c; font-size: 11px;
      font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
      cursor: pointer; font-family: var(--font-body);
      transition: all 0.3s;
    }
    .af-clear:hover { background: #fef2f2; border-color: #b91c1c; }

    /* Results bar */
    .results-bar {
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      padding: 16px 0 8px; min-height: 40px;
    }
    .result-count {
      margin: 0; font-size: 13px; color: var(--text-muted);
    }
    .result-count strong { color: var(--text-dark); }
    .active-tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; background: var(--secondary-color);
      font-size: 11px; font-weight: 600; color: var(--primary-color);
      cursor: pointer; transition: all 0.2s;
      border: 1px solid transparent;
    }
    .tag:hover { border-color: var(--primary-color); }
    .tag svg { opacity: 0.5; }

    /* ===== PRODUCTS GRID ===== */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding-top: 8px;
    }

    @keyframes cardReveal {
      from { opacity: 0; transform: translateY(24px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .product-card {
      position: relative;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.06);
      overflow: hidden; cursor: pointer;
      animation: cardReveal 0.5s ease both;
      transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  box-shadow 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  border-color 0.3s;
    }
    .product-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 24px 48px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.06);
      border-color: transparent;
    }

    /* Card image */
    .card-image {
      position: relative; width: 100%;
      aspect-ratio: 3 / 4;
      overflow: hidden;
    }
    .card-img-inner {
      width: 100%; height: 100%; object-fit: cover;
      display: block; position: relative; z-index: 1;
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .card-img-fallback {
      position: absolute; inset: 0; z-index: 0;
    }
    .product-card:hover .card-img-inner {
      transform: scale(1.08);
    }

    .card-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 50%);
      opacity: 0; transition: opacity 0.4s ease;
    }
    .product-card:hover .card-overlay { opacity: 1; }

    /* Badges */
    .badge {
      position: absolute; top: 12px; left: 12px; z-index: 3;
      padding: 5px 12px; font-size: 10px; font-weight: 700;
      letter-spacing: 1px; text-transform: uppercase;
    }
    .badge.sale { background: #b91c1c; color: #fff; }
    .badge.new { background: var(--primary-color); color: #fff; }

    /* Card actions */
    .card-actions {
      position: absolute; top: 12px; right: 12px; z-index: 4;
      opacity: 0; transform: translateY(-10px) scale(0.9);
      transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .product-card:hover .card-actions {
      opacity: 1; transform: translateY(0) scale(1);
    }
    .action-btn {
      width: 42px; height: 42px; background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-dark);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      transition: all 0.25s ease;
    }
    .action-btn:hover {
      background: var(--primary-color); color: #fff;
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(21,42,71,0.3);
    }
    .action-btn.added { background: #059669; color: #fff; }
    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Quick view strip */
    .quick-view-strip {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px; font-size: 11px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      color: #fff; background: rgba(21,42,71,0.88); backdrop-filter: blur(4px);
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .product-card:hover .quick-view-strip {
      transform: translateY(0);
    }

    /* Card info */
    .card-info {
      padding: 16px 16px 18px;
    }
    .card-category {
      display: block; font-size: 10px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 4px;
    }
    .card-name {
      font-size: 0.95rem; font-weight: 600; color: var(--text-dark);
      margin: 0 0 8px 0; line-height: 1.35;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      transition: color 0.2s;
    }
    .product-card:hover .card-name { color: var(--primary-color); }

    .card-price-row {
      display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;
    }
    .card-price {
      font-size: 1.05rem; font-weight: 800; color: var(--text-dark);
      letter-spacing: -0.02em;
    }
    .card-original {
      font-size: 0.8rem; color: var(--text-muted);
      text-decoration: line-through;
    }

    .card-sizes {
      display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;
    }
    .card-sizes span {
      padding: 2px 8px; font-size: 10px; font-weight: 700;
      border: 1px solid var(--border-color); color: var(--text-muted);
      letter-spacing: 0.5px; transition: all 0.2s;
    }
    .product-card:hover .card-sizes span {
      border-color: rgba(21,42,71,0.2); color: var(--text-dark);
    }

    .card-rating {
      display: flex; align-items: center; gap: 6px;
    }
    .star-bar {
      position: relative; display: inline-block;
      color: rgba(0,0,0,0.1); font-size: 12px; letter-spacing: 1px;
      line-height: 1;
    }
    .star-fill {
      position: absolute; top: 0; left: 0; height: 100%;
      overflow: hidden; color: #f59e0b; white-space: nowrap;
    }
    .star-fill::after { content: '★★★★★'; }
    .rating-num {
      font-size: 12px; font-weight: 700; color: var(--text-dark);
    }
    .review-count {
      font-size: 11px; color: var(--text-muted);
    }

    /* Toast */
    .toast {
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(80px);
      background: var(--primary-color); color: #fff;
      padding: 14px 28px; display: flex; align-items: center; gap: 10px;
      font-size: 13px; font-weight: 600; z-index: 1000;
      box-shadow: 0 8px 30px rgba(21,42,71,0.3);
      opacity: 0; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      pointer-events: none;
    }
    .toast.show {
      transform: translateX(-50%) translateY(0); opacity: 1;
    }

    /* Empty state */
    .empty-state {
      text-align: center; padding: 80px 20px;
    }
    .empty-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 100px; height: 100px; border-radius: 50%;
      background: var(--secondary-color); margin-bottom: 24px;
      color: var(--primary-color); opacity: 0.6;
    }
    .empty-state h3 {
      font-size: 1.2rem; color: var(--text-dark); margin: 0 0 8px;
    }
    .empty-state p {
      color: var(--text-muted); margin: 0 0 24px;
    }
    .btn-reset {
      padding: 12px 32px; border: 2px solid var(--primary-color);
      background: transparent; color: var(--primary-color);
      font-size: 12px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; cursor: pointer;
      font-family: var(--font-body); transition: all 0.3s;
    }
    .btn-reset:hover { background: var(--primary-color); color: #fff; }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1200px) {
      .products-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 968px) {
      .products-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .filter-bar-inner { gap: 12px; }
      .search-box { min-width: 160px; }
      .cursor-glow { display: none; }
    }

    @media (max-width: 768px) {
      .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .filter-bar-inner { flex-direction: column; align-items: stretch; }
      .filter-controls { flex-wrap: wrap; }
      .search-box { flex: 1; min-width: 0; }
      .range-slider-container { width: 100%; }
      .af-inner { gap: 20px; }
    }

    @media (max-width: 480px) {
      .products-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .card-info { padding: 12px; }
      .card-name { font-size: 0.82rem; }
      .card-price { font-size: 0.95rem; }
      .chip { padding: 6px 14px; font-size: 11px; }
      .filter-chips { gap: 4px; }
    }
  `]
})
export class ProductListingComponent implements OnInit, OnDestroy {
  @Input() category?: string;

  products: any[] = [];
  filteredProducts: any[] = [];
  filterCategories: Category[] = [];
  selectedCategoryId: number | string | null = null;
  initialCategoryId: number | string | null = null;
  searchQuery = '';
  priceRangeMin = 0;
  priceRangeMax = 50000;
  inStockOnly = false;
  sortBy = 'default';
  showAdvanced = false;
  showToast = false;
  toastMessage = '';
  addedProductId: string | null = null;
  loading = false;
  loadingCategories = true;

  cursorX = 0;
  cursorY = 0;
  cursorActive = false;

  constructor(
    private productApi: ProductApiService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private appLoading: AppLoadingService
  ) {}

  ngOnInit() {
    this.appLoading.setLoading('collections', true);
    this.loadCategories();
  }

  ngOnDestroy() {
    this.appLoading.setLoading('collections', false);
  }

  private loadCategories() {
    this.loadingCategories = true;
    this.categoryService.list({ per_page: 200 }).subscribe({
      next: (res) => {
        const raw = res as any;
        const data = Array.isArray(raw) ? raw : (raw?.data ?? []);
        this.filterCategories = (data as Category[]).filter((c: Category) => c.parent_id == null);
        this.loadingCategories = false;
        if (this.category) {
          const slug = this.category.toString().toLowerCase().replace(/\s+|'/g, '');
          const match = (this.filterCategories as Category[]).find((c: Category) => {
            const catSlug = (c.slug || c.name || '').toString().toLowerCase().replace(/\s+|'/g, '');
            return catSlug === slug;
          });
          if (match && match.id != null) {
            this.selectedCategoryId = match.id;
            this.initialCategoryId = match.id;
          }
        } else {
          this.initialCategoryId = null;
        }
        this.loadProducts();
      },
      error: () => {
        this.loadingCategories = false;
        this.filterCategories = [];
        this.loadProducts();
      },
    });
  }

  private loadProducts() {
    this.loading = true;
    const params: any = {
      per_page: 200,
      is_active: true,
    };
    if (this.selectedCategoryId != null) params.category_id = this.selectedCategoryId;
    if (this.searchQuery?.trim()) params.search = this.searchQuery.trim();
    if (this.priceRangeMin > 0) params.min_price = this.priceRangeMin;
    if (this.priceRangeMax < 50000) params.max_price = this.priceRangeMax;
    if (this.inStockOnly) params.in_stock = true;

    this.productApi.list(params).subscribe({
      next: (res) => {
        const data = (res as any)?.data ?? (Array.isArray(res) ? res : (res as any)?.data ?? []);
        this.products = Array.isArray(data) ? data : [];
        this.filteredProducts = [...this.products];
        this.applySorting();
        this.loading = false;
        this.appLoading.setLoading('collections', false);
      },
      error: () => {
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
        this.appLoading.setLoading('collections', false);
      },
    });
  }

  selectCategoryById(id: number | string | null) {
    this.selectedCategoryId = id;
    this.loadProducts();
  }

  onMouseMove(e: MouseEvent) {
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery.length > 0 || this.inStockOnly ||
      this.priceRangeMin > 0 || this.priceRangeMax < 50000;
  }

  get activeFilterCount(): number {
    let c = 0;
    if (this.searchQuery) c++;
    if (this.inStockOnly) c++;
    if (this.priceRangeMin > 0 || this.priceRangeMax < 50000) c++;
    return c;
  }

  /** Expose string conversion for template (Angular template has no global String). */
  strId(val: unknown): string {
    return val != null ? String(val) : '';
  }

  onPriceRangeChange() {
    if (this.priceRangeMin > this.priceRangeMax) {
      const temp = this.priceRangeMin;
      this.priceRangeMin = this.priceRangeMax;
      this.priceRangeMax = temp;
    }
    this.applyFilters();
  }

  applyFilters() {
    this.loadProducts();
  }

  applySorting() {
    const sorted = [...this.filteredProducts];
    switch (this.sortBy) {
      case 'price-low': sorted.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'price-high': sorted.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'name-asc': sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      case 'name-desc': sorted.sort((a, b) => (b.name || '').localeCompare(a.name || '')); break;
      case 'rating': sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)); break;
    }
    this.filteredProducts = sorted;
  }

  clearFilters() {
    this.selectedCategoryId = this.initialCategoryId;
    this.searchQuery = '';
    this.priceRangeMin = 0;
    this.priceRangeMax = 50000;
    this.inStockOnly = false;
    this.sortBy = 'default';
    this.showAdvanced = false;
    this.applyFilters();
  }

  isProductOutOfStock(p: any): boolean {
    if (!p) return true;
    return p.in_stock === false || (Number(p.stock_quantity ?? 0) <= 0);
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.isProductOutOfStock(product)) return;
    const cartProduct = this.mapApiProductToCartProduct(product);
    this.cartService.addToCart(cartProduct, 1);
    this.addedProductId = String(product.id);
    this.toastMessage = `${product.name} added to cart!`;
    this.showToast = true;
    setTimeout(() => this.addedProductId = null, 1500);
    setTimeout(() => this.showToast = false, 3000);
  }

  getDiscountPercent(product: any): number {
    const orig = product.original_price ?? product.originalPrice;
    if (!orig) return 0;
    return Math.round(((Number(orig) - Number(product.price)) / Number(orig)) * 100);
  }

  getProductSizes(product: any): string[] {
    if (product.sizes && typeof product.sizes === 'string') {
      return product.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }
    const sizeAttr = product.attributes?.find((a: any) => a.name?.toLowerCase() === 'size');
    if (!sizeAttr) return [];
    return sizeAttr.value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }

  getProductImage(product: any): string {
    if (product.image_url) return product.image_url;
    if (product.image_urls?.length) return product.image_urls[0];
    if (product.images?.length && product.images[0]) {
      const img = product.images[0];
      return typeof img === 'string' ? img : (img.path ? (img.path.startsWith('http') ? img.path : '') : '');
    }
    return '';
  }

  getProductCategoryName(product: any): string {
    if (product.category?.name) return product.category.name;
    if (product.category) return typeof product.category === 'string' ? product.category : '';
    return 'Shop';
  }

  getProductColor(product: any): string {
    const slug = (product.category?.slug || product.category || '').toString().toLowerCase();
    const colors: { [key: string]: string } = {
      'mens': 'linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%)',
      'womens': 'linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%)',
      'collections': 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)'
    };
    return colors[slug] || colors['collections'];
  }

  /** Map API product to CartItem-compatible Product shape */
  private mapApiProductToCartProduct(apiProduct: any): Product {
    const cat = apiProduct.category;
    const categoryName = (cat?.name || cat || 'collections').toString().toLowerCase().replace(/\s+/g, '');
    const catSlug = cat?.slug || categoryName || 'collections';
    return {
      id: String(apiProduct.id),
      name: apiProduct.name,
      description: apiProduct.description || '',
      price: Number(apiProduct.price),
      originalPrice: apiProduct.original_price ? Number(apiProduct.original_price) : undefined,
      category: (catSlug === 'mens' || catSlug === 'womens' ? catSlug : 'collections') as 'mens' | 'womens' | 'collections',
      images: apiProduct.image_urls || (apiProduct.image_url ? [apiProduct.image_url] : []),
      image_url: apiProduct.image_url,
      image_urls: apiProduct.image_urls,
      inStock: apiProduct.in_stock !== false && Number(apiProduct.stock_quantity ?? 0) > 0,
      stockQuantity: Number(apiProduct.stock_quantity ?? 0),
      attributes: apiProduct.sizes ? [{ name: 'Size', value: apiProduct.sizes }] : [],
      tags: apiProduct.tags || [],
      rating: apiProduct.rating ? Number(apiProduct.rating) : undefined,
      reviewCount: apiProduct.review_count,
    };
  }

  formatPrice(price: number): string {
    return `₹${price.toLocaleString()}`;
  }

  getStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let s = '★'.repeat(full);
    if (half) s += '½';
    s += '☆'.repeat(5 - Math.ceil(rating));
    return s;
  }
}
