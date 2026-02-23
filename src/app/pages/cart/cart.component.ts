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
        <h1 class="page-title">Shopping Cart</h1>

        <div class="cart-content" *ngIf="cartItems.length > 0">
          <div class="cart-items">
            <div class="cart-item" *ngFor="let item of cartItems; trackBy: trackByItemId">
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
                <label>Quantity</label>
                <div class="quantity-controls">
                  <button class="qty-btn" (click)="updateQuantity(item, item.quantity - 1)">-</button>
                  <input 
                    type="number" 
                    [(ngModel)]="item.quantity"
                    (ngModelChange)="updateQuantity(item, item.quantity)"
                    min="1"
                    [max]="item.product.stockQuantity"
                    class="qty-input"
                  >
                  <button class="qty-btn" (click)="updateQuantity(item, item.quantity + 1)">+</button>
                </div>
              </div>

              <div class="item-total">
                <p class="total-price">{{ formatPrice(getItemTotal(item)) }}</p>
                <button class="remove-btn" (click)="removeItem(item)" aria-label="Remove item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="cart-summary">
            <h2>Order Summary</h2>
            
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatPrice(getSubtotal()) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Estimated Tax</span>
              <span>{{ formatPrice(getTax()) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping</span>
              <span class="free-shipping" *ngIf="getSubtotal() >= 5000">FREE</span>
              <span *ngIf="getSubtotal() < 5000">{{ formatPrice(500) }}</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row total">
              <span>Total</span>
              <span>{{ formatPrice(getTotal()) }}</span>
            </div>

            <div class="shipping-note" *ngIf="getSubtotal() < 100">
              <p>Add {{ formatPrice(getRemainingForFreeShipping()) }} more for free shipping!</p>
            </div>

            <button class="btn btn-primary btn-checkout" routerLink="/checkout">
              Proceed to Checkout
            </button>

            <a routerLink="/collections" class="continue-shopping">Continue Shopping</a>
          </div>
        </div>

        <div class="cart-empty" *ngIf="cartItems.length === 0">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 2L7 6m8-4l-2 4M3 6h18l-2 13H5L3 6z"></path>
            <circle cx="9" cy="20" r="1"></circle>
            <circle cx="20" cy="20" r="1"></circle>
          </svg>
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <a routerLink="/collections" class="btn btn-primary">Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-xl) 0;
    }

    .page-title {
      font-size: clamp(2rem, 4vw, 3rem);
      color: var(--primary-color);
      margin-bottom: var(--spacing-lg);
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: var(--spacing-xl);
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 120px 1fr 150px 120px;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--text-white);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
      align-items: center;
    }

    .item-image {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .item-name {
      margin: 0;
      font-size: 1.125rem;
      color: var(--primary-color);
    }

    .item-name a {
      color: inherit;
      transition: var(--transition-normal);
    }

    .item-name a:hover {
      color: var(--primary-dark);
    }

    .item-category {
      font-size: 12px;
      color: var(--text-light);
      text-transform: uppercase;
      margin: 0;
    }

    .item-attributes {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--text-light);
    }

    .item-price {
      font-size: 1rem;
      color: var(--primary-color);
      font-weight: 600;
      margin: 4px 0 0 0;
    }

    .item-quantity {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .item-quantity label {
      font-size: 12px;
      font-weight: 600;
      color: var(--primary-color);
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qty-btn {
      width: 32px;
      height: 32px;
      border: 2px solid var(--border-color);
      background: var(--text-white);
      color: var(--primary-color);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: var(--transition-normal);
    }

    .qty-btn:hover {
      background: var(--primary-color);
      color: var(--text-white);
      border-color: var(--primary-color);
    }

    .qty-input {
      width: 50px;
      height: 32px;
      text-align: center;
      border: 2px solid var(--border-color);
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    }

    .item-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .total-price {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-color);
      margin: 0;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #e74c3c;
      cursor: pointer;
      padding: 4px;
      transition: var(--transition-normal);
    }

    .remove-btn:hover {
      transform: scale(1.1);
    }

    .cart-summary {
      background: var(--text-white);
      padding: var(--spacing-md);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
      height: fit-content;
      position: sticky;
      top: 120px;
    }

    .cart-summary h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      font-size: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
      font-size: 14px;
      color: var(--text-dark);
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-color);
      margin-top: var(--spacing-sm);
    }

    .free-shipping {
      color: #27ae60;
      font-weight: 600;
    }

    .summary-divider {
      height: 1px;
      background: var(--border-color);
      margin: var(--spacing-sm) 0;
    }

    .shipping-note {
      background: var(--secondary-color);
      padding: var(--spacing-sm);
      border-radius: 8px;
      margin: var(--spacing-sm) 0;
    }

    .shipping-note p {
      margin: 0;
      font-size: 12px;
      color: var(--text-light);
      text-align: center;
    }

    .btn-checkout {
      width: 100%;
      padding: 14px;
      margin-top: var(--spacing-md);
      font-size: 1.125rem;
      font-weight: 600;
    }

    .continue-shopping {
      display: block;
      text-align: center;
      margin-top: var(--spacing-sm);
      color: var(--primary-color);
      font-weight: 500;
      transition: var(--transition-normal);
    }

    .continue-shopping:hover {
      color: var(--primary-dark);
    }

    .cart-empty {
      text-align: center;
      padding: var(--spacing-xl) 0;
      color: var(--text-light);
    }

    .cart-empty svg {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    .cart-empty h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    .cart-empty p {
      margin-bottom: var(--spacing-md);
    }

    @media (max-width: 968px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 100px 1fr;
        gap: var(--spacing-sm);
      }

      .item-quantity,
      .item-total {
        grid-column: 1 / -1;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--spacing-sm);
        padding-top: var(--spacing-sm);
        border-top: 1px solid var(--border-color);
      }

      .cart-summary {
        position: static;
      }
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
