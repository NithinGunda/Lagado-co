import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-page">
      <div class="container">
        <div class="cart-header">
          <h1 class="page-title">Shopping Cart</h1>
          <span class="item-count" *ngIf="cartItems.length > 0">{{ cartItems.length }} item{{ cartItems.length > 1 ? 's' : '' }}</span>
        </div>

        <div class="cart-content" *ngIf="cartItems.length > 0">
          <div class="cart-items">
            <div class="cart-item" *ngFor="let item of cartItems; trackBy: trackByItemId; let i = index" [style.animation-delay]="i * 0.06 + 's'">
              <div class="item-image">
                <div class="image-placeholder" [style.background]="getProductColor(item.product)"></div>
              </div>
              
              <div class="item-details">
                <h3 class="item-name">
                  <a [routerLink]="['/product', item.product.id]">{{ item.product.name }}</a>
                </h3>
                <p class="item-category">{{ item.product.category | titlecase }}</p>
                <div class="item-attributes" *ngIf="item.selectedSize || item.selectedColor">
                  <span *ngIf="item.selectedSize">Size: {{ item.selectedSize }}</span>
                  <span *ngIf="item.selectedColor">Color: {{ item.selectedColor }}</span>
                </div>
                <p class="item-price">{{ formatPrice(item.product.price) }}</p>
              </div>

              <div class="item-quantity">
                <div class="quantity-controls">
                  <button class="qty-btn" (click)="updateQuantity(item, item.quantity - 1)" [disabled]="item.quantity <= 1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                  <span class="qty-display">{{ item.quantity }}</span>
                  <button class="qty-btn" (click)="updateQuantity(item, item.quantity + 1)" [disabled]="item.quantity >= item.product.stockQuantity">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
              </div>

              <div class="item-total">
                <p class="total-price">{{ formatPrice(getItemTotal(item)) }}</p>
                <button class="remove-btn" (click)="removeItem(item)" aria-label="Remove item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <h2>Order Summary</h2>
            
            <div class="summary-row">
              <span>Subtotal ({{ cartItems.length }} items)</span>
              <span class="summary-value">{{ formatPrice(getSubtotal()) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Estimated Tax</span>
              <span class="summary-value">{{ formatPrice(getTax()) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping</span>
              <span class="free-shipping" *ngIf="getSubtotal() >= 5000">FREE</span>
              <span class="summary-value" *ngIf="getSubtotal() < 5000">{{ formatPrice(500) }}</span>
            </div>

            <div class="shipping-progress" *ngIf="getSubtotal() < 5000">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="(getSubtotal() / 5000) * 100"></div>
              </div>
              <p class="progress-text">Add {{ formatPrice(getRemainingForFreeShipping()) }} more for <strong>free shipping!</strong></p>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row total">
              <span>Total</span>
              <span>{{ formatPrice(getTotal()) }}</span>
            </div>

            <button class="btn-checkout" routerLink="/checkout">
              Proceed to Checkout
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>

            <a routerLink="/collections" class="continue-shopping">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Continue Shopping
            </a>
          </div>
        </div>

        <div class="cart-empty" *ngIf="cartItems.length === 0">
          <div class="empty-icon">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 2L7 6m8-4l-2 4M3 6h18l-2 13H5L3 6z"></path>
              <circle cx="9" cy="20" r="1"></circle>
              <circle cx="20" cy="20" r="1"></circle>
            </svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <a routerLink="/collections" class="btn btn-primary">Start Shopping</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-xl) 0;
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

    .cart-header {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: var(--spacing-lg);
    }

    .page-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--text-dark);
      margin: 0;
    }

    .item-count {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 500;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--spacing-xl);
      align-items: start;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 110px 1fr auto 140px;
      gap: 20px;
      padding: 20px;
      background: var(--text-white);
      box-shadow: 0 1px 4px var(--shadow-light);
      align-items: center;
      transition: box-shadow 0.2s ease;
      animation: slideIn 0.35s ease both;
    }

    .cart-item:hover {
      box-shadow: 0 4px 16px var(--shadow-medium);
    }

    .item-image {
      width: 110px;
      height: 110px;
      overflow: hidden;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
    }

    .cart-item:hover .image-placeholder {
      transform: scale(1.05);
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-name {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .item-name a {
      color: var(--text-dark);
      transition: color 0.2s ease;
    }

    .item-name a:hover {
      color: var(--primary-color);
      opacity: 1;
    }

    .item-category {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0;
    }

    .item-attributes {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--text-light);
    }

    .item-price {
      font-size: 15px;
      color: var(--text-dark);
      font-weight: 600;
      margin: 4px 0 0 0;
    }

    .item-quantity {
      display: flex;
      align-items: center;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
    }

    .qty-btn {
      width: 36px;
      height: 36px;
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
      width: 40px;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-dark);
      border-left: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      padding: 8px 0;
    }

    .item-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .total-price {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-dark);
      margin: 0;
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-family: var(--font-body);
      transition: all 0.2s ease;
    }

    .remove-btn:hover {
      color: #e74c3c;
      background: #fef2f2;
    }

    .cart-summary {
      background: var(--text-white);
      padding: 28px;
      box-shadow: 0 1px 4px var(--shadow-light);
      height: fit-content;
      position: sticky;
      top: 100px;
    }

    .cart-summary h2 {
      color: var(--text-dark);
      margin-bottom: 20px;
      font-size: 1.25rem;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
      font-size: 14px;
      color: var(--text-light);
    }

    .summary-value {
      color: var(--text-dark);
      font-weight: 500;
    }

    .summary-row.total {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-top: 12px;
      margin-bottom: 0;
    }

    .free-shipping {
      color: #27ae60;
      font-weight: 700;
      font-size: 13px;
    }

    .summary-divider {
      height: 1px;
      background: var(--border-color);
      margin: 14px 0;
    }

    .shipping-progress {
      margin: 4px 0 12px;
    }

    .progress-bar {
      height: 4px;
      background: var(--grey-light);
      margin-bottom: 8px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--btn-accent));
      transition: width 0.4s ease;
      max-width: 100%;
    }

    .progress-text {
      margin: 0;
      font-size: 12px;
      color: var(--text-muted);
    }

    .btn-checkout {
      width: 100%;
      padding: 16px;
      margin-top: 20px;
      font-size: 15px;
      font-weight: 600;
      background: var(--btn-primary);
      color: var(--text-white);
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: var(--font-body);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-checkout:hover {
      background: var(--btn-primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(30, 58, 95, 0.3);
    }

    .btn-checkout:active { transform: translateY(0); }

    .continue-shopping {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 14px;
      color: var(--text-light);
      font-weight: 500;
      font-size: 14px;
      transition: color 0.2s ease;
    }

    .continue-shopping:hover {
      color: var(--primary-color);
      opacity: 1;
    }

    .cart-empty {
      text-align: center;
      padding: var(--spacing-xl) var(--spacing-md);
    }

    .empty-icon {
      color: var(--text-muted);
      opacity: 0.35;
      margin-bottom: 20px;
    }

    .cart-empty h2 {
      color: var(--text-dark);
      margin-bottom: 8px;
      font-size: 1.5rem;
    }

    .cart-empty p {
      margin-bottom: var(--spacing-md);
      color: var(--text-muted);
      font-size: 15px;
    }

    @media (max-width: 968px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 90px 1fr;
        gap: 12px;
      }

      .item-quantity,
      .item-total {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid var(--border-color);
      }

      .cart-summary {
        position: static;
      }
    }

    @media (max-width: 480px) {
      .cart-item { padding: 14px; }
      .item-image { width: 80px; height: 80px; }
      .item-name { font-size: 14px; }
    }
  `]
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private cartSubscription?: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
    this.cartItems = this.cartService.getCartItems();
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.product.id + (item.selectedSize || '') + (item.selectedColor || '');
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    if (newQuantity > item.product.stockQuantity) {
      newQuantity = item.product.stockQuantity;
    }
    this.cartService.updateQuantity(item.product.id, newQuantity);
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.product.id);
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getSubtotal(): number {
    return this.cartService.getCartSubtotal();
  }

  getTax(): number {
    return this.cartService.getEstimatedTax();
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const tax = this.getTax();
    const shipping = subtotal >= 5000 ? 0 : 500;
    return subtotal + tax + shipping;
  }

  formatPrice(price: number): string {
    return `₹${price}`;
  }

  getRemainingForFreeShipping(): number {
    return 5000 - this.getSubtotal();
  }

  getProductColor(product: any): string {
    const colors: { [key: string]: string } = {
      'mens': 'linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%)',
      'womens': 'linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%)',
      'collections': 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)'
    };
    return colors[product.category] || colors['collections'];
  }
}
