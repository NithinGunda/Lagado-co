import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wishlist-page">
      <div class="container">
        <div class="wishlist-header">
          <h1 class="page-title">Wishlist</h1>
          <span class="item-count" *ngIf="items.length > 0">{{ items.length }} item{{ items.length !== 1 ? 's' : '' }}</span>
        </div>

        <div class="wishlist-content" *ngIf="items.length > 0">
          <div class="wishlist-grid">
            <div
              class="wishlist-item"
              *ngFor="let product of items; trackBy: trackByLineKey; let i = index"
              [style.animation-delay]="i * 0.05 + 's'"
            >
              <a [routerLink]="['/product', product.id]" class="item-image">
                <img
                  *ngIf="getImageUrl(product)"
                  [src]="getImageUrl(product)"
                  [alt]="product.name"
                  class="item-img"
                />
                <div *ngIf="!getImageUrl(product)" class="image-placeholder" [style.background]="getProductColor(product)"></div>
              </a>
              <div class="item-details">
                <h3 class="item-name">
                  <a [routerLink]="['/product', product.id]">{{ product.name }}</a>
                </h3>
                <p class="item-category">{{ product.category | titlecase }}</p>
                <p class="item-size" *ngIf="product.wishlistSize">Size: <strong>{{ product.wishlistSize }}</strong></p>
                <p class="item-price">{{ formatPrice(product.price) }}</p>
                <div class="item-actions">
                  <button class="btn-add-cart" (click)="addToCart(product); $event.preventDefault()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    Add to Cart
                  </button>
                  <button class="btn-remove" (click)="remove(product); $event.preventDefault()" aria-label="Remove from wishlist">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
          <a routerLink="/collections" class="continue-shopping">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Continue Shopping
          </a>
        </div>

        <div class="wishlist-empty" *ngIf="items.length === 0">
            <div class="empty-icon">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by clicking the heart on product pages or in the collection.</p>
          <a routerLink="/collections" class="btn btn-primary">Shop Collections</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-xl, 32px) 0;
      animation: fadeIn 0.35s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 clamp(16px, 4vw, 32px);
    }
    .wishlist-header {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: var(--spacing-lg, 24px);
    }
    .page-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--text-dark, #1a1a1a);
      margin: 0;
    }
    .item-count {
      font-size: 14px;
      color: var(--text-muted, #666);
      font-weight: 500;
    }
    .wishlist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    .wishlist-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: var(--text-white, #fff);
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      align-items: flex-start;
      animation: slideIn 0.35s ease both;
    }
    .wishlist-item:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }
    .item-image {
      width: 120px;
      height: 120px;
      flex-shrink: 0;
      overflow: hidden;
      display: block;
    }
    .item-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .wishlist-item:hover .item-img {
      transform: scale(1.05);
    }
    .image-placeholder {
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
    }
    .wishlist-item:hover .image-placeholder {
      transform: scale(1.05);
    }
    .item-details {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .item-name {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .item-name a {
      color: var(--text-dark, #1a1a1a);
      text-decoration: none;
      transition: color 0.2s;
    }
    .item-name a:hover {
      color: var(--primary-color, #1e3a5f);
    }
    .item-category {
      font-size: 11px;
      color: var(--text-muted, #666);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0;
    }
    .item-size {
      font-size: 13px;
      color: var(--text-dark, #1a1a1a);
      margin: 0;
    }
    .item-size strong { font-weight: 700; color: var(--primary-color, #1e3a5f); }
    .item-price {
      font-size: 15px;
      font-weight: 400;
      color: var(--text-dark, #1a1a1a);
      margin: 4px 0 0 0;
    }
    .item-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }
    .btn-add-cart, .btn-remove {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .btn-add-cart {
      background: var(--btn-primary, #1e3a5f);
      color: #fff;
    }
    .btn-add-cart:hover {
      background: var(--btn-primary-hover, #2a4d7a);
    }
    .btn-remove {
      background: transparent;
      color: var(--text-muted, #666);
    }
    .btn-remove:hover {
      color: #e74c3c;
      background: #fef2f2;
    }
    .continue-shopping {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 28px;
      color: var(--text-light, #888);
      font-weight: 500;
      font-size: 14px;
      text-decoration: none;
      transition: color 0.2s;
    }
    .continue-shopping:hover {
      color: var(--primary-color, #1e3a5f);
    }
    .wishlist-empty {
      text-align: center;
      padding: var(--spacing-xl, 48px) var(--spacing-md, 24px);
    }
    .wishlist-empty .empty-icon {
      color: #dc2626;
      opacity: 0.5;
      margin-bottom: 20px;
    }
    .wishlist-empty h2 {
      color: var(--text-dark, #1a1a1a);
      margin-bottom: 8px;
      font-size: 1.5rem;
    }
    .wishlist-empty p {
      margin-bottom: 24px;
      color: var(--text-muted, #666);
      font-size: 15px;
    }
    .wishlist-empty .btn {
      display: inline-block;
      padding: 14px 28px;
      font-size: 14px;
      font-weight: 600;
      background: var(--btn-primary, #1e3a5f);
      color: #fff;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .wishlist-empty .btn:hover {
      background: var(--btn-primary-hover, #2a4d7a);
    }
    @media (max-width: 640px) {
      .wishlist-grid {
        grid-template-columns: 1fr;
      }
      .wishlist-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .item-image {
        width: 100%;
        max-width: 260px;
        height: 260px;
      }
      .item-actions {
        justify-content: center;
      }
    }
  `]
})
export class WishlistComponent implements OnInit, OnDestroy {
  items: Product[] = [];
  private sub?: Subscription;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.sub = this.wishlistService.wishlist$.subscribe(list => {
      this.items = list;
    });
    this.items = this.wishlistService.getItems();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  trackByLineKey(_index: number, product: Product): string {
    const s = (product.wishlistSize ?? '').trim();
    return `${product.id}::${s}`;
  }

  getImageUrl(p: Product): string {
    if (p.image_url) return p.image_url;
    if (p.image_urls?.length) return p.image_urls[0];
    if (p.images?.length) {
      const img = p.images[0];
      return typeof img === 'string' ? img : '';
    }
    return '';
  }

  getProductColor(p: Product): string {
    const cat = (p.category || '').toString().toLowerCase();
    const colors: { [key: string]: string } = {
      'mens': 'linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%)',
      'womens': 'linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%)',
      'collections': 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)'
    };
    return colors[cat] || colors['collections'];
  }

  formatPrice(price: number): string {
    return `₹${Number(price).toLocaleString()}`;
  }

  addToCart(product: Product) {
    const { wishlistSize, ...rest } = product as Product & { wishlistSize?: string };
    this.cartService.addToCart(rest as Product, 1, wishlistSize);
  }

  remove(product: Product) {
    this.wishlistService.removeProductLine(product);
  }
}
