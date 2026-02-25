import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="checkout-page">
      <div class="container">
        <h1 class="page-title">Checkout</h1>

        <div class="checkout-content" *ngIf="cartItems.length > 0">
          <div class="guest-option" *ngIf="!isLoggedIn">
            <p>Already have an account? <a routerLink="/login">Sign in</a> or continue as guest</p>
          </div>

          <div class="checkout-grid">
            <!-- Checkout Form -->
            <div class="checkout-form-section">
              <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
                <!-- Shipping Information -->
                <section class="form-section">
                  <h2>Shipping Information</h2>

                  <div class="form-row">
                    <div class="form-group">
                      <label>First Name *</label>
                      <input type="text" formControlName="firstName" class="form-input">
                      <span class="error" *ngIf="isFieldInvalid('firstName')">Required</span>
                    </div>
                    <div class="form-group">
                      <label>Last Name *</label>
                      <input type="text" formControlName="lastName" class="form-input">
                      <span class="error" *ngIf="isFieldInvalid('lastName')">Required</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Email Address *</label>
                    <input type="email" formControlName="email" class="form-input">
                    <span class="error" *ngIf="isFieldInvalid('email')">Valid email required</span>
                  </div>

                  <div class="form-group">
                    <label>Phone Number *</label>
                    <input type="tel" formControlName="phone" class="form-input">
                    <span class="error" *ngIf="isFieldInvalid('phone')">Required</span>
                  </div>

                  <div class="form-group">
                    <label>Address *</label>
                    <input type="text" formControlName="address" class="form-input">
                    <span class="error" *ngIf="isFieldInvalid('address')">Required</span>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>City *</label>
                      <input type="text" formControlName="city" class="form-input">
                      <span class="error" *ngIf="isFieldInvalid('city')">Required</span>
                    </div>
                    <div class="form-group">
                      <label>State *</label>
                      <select formControlName="state" class="form-input">
                        <option value="">Select State</option>
                        <option *ngFor="let s of indianStates" [value]="s">{{ s }}</option>
                      </select>
                      <span class="error" *ngIf="isFieldInvalid('state')">Required</span>
                    </div>
                    <div class="form-group">
                      <label>PIN Code *</label>
                      <input type="text" formControlName="zipCode" class="form-input" maxlength="6" placeholder="e.g. 500001">
                      <span class="error" *ngIf="isFieldInvalid('zipCode')">Required</span>
                    </div>
                  </div>
                </section>

                <!-- Payment -->
                <section class="form-section">
                  <h2>Payment Method</h2>
                  <div class="cod-info">
                    <div class="cod-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </div>
                    <div class="cod-text">
                      <h3>Cash on Delivery</h3>
                      <p>Pay with cash when your order is delivered to your doorstep. No advance payment required.</p>
                    </div>
                  </div>
                  <div class="cod-note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span>Please keep the exact amount ready at the time of delivery.</span>
                  </div>
                </section>

                <button type="submit" class="btn-submit" [disabled]="checkoutForm.invalid || isProcessing">
                  <span *ngIf="!isProcessing">Place Order — {{ formatPrice(getTotal()) }}</span>
                  <span *ngIf="isProcessing">Processing...</span>
                </button>
              </form>
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <h2>Order Summary</h2>

              <div class="order-items">
                <div class="order-item" *ngFor="let item of cartItems">
                  <div class="item-info">
                    <h4>{{ item.product.name }}</h4>
                    <p>Qty: {{ item.quantity }} × {{ formatPrice(item.product.price) }}</p>
                  </div>
                  <span class="item-total">{{ formatPrice(getItemTotal(item)) }}</span>
                </div>
              </div>

              <div class="summary-totals">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(getSubtotal()) }}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span *ngIf="getSubtotal() >= 5000" class="free">FREE</span>
                  <span *ngIf="getSubtotal() < 5000">{{ formatPrice(500) }}</span>
                </div>
                <div class="summary-row">
                  <span>Payment</span>
                  <span class="cod-tag">Cash on Delivery</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span>{{ formatPrice(getTotal()) }}</span>
                </div>
              </div>

              <div class="security-note">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Your order is secure. Pay conveniently at delivery.</span>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-cart" *ngIf="cartItems.length === 0">
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to proceed to checkout</p>
          <a routerLink="/collections" class="btn btn-primary">Continue Shopping</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: var(--spacing-xl) 0;
      min-height: calc(100vh - 200px);
    }
    .page-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--primary-color);
      margin-bottom: var(--spacing-lg);
      font-weight: 700;
    }
    .guest-option {
      background: var(--secondary-color);
      padding: var(--spacing-sm) var(--spacing-md);
      margin-bottom: var(--spacing-md);
      text-align: center;
    }
    .guest-option a { color: var(--primary-color); font-weight: 600; }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--spacing-xl);
    }

    .form-section {
      background: #fff;
      padding: 24px;
      margin-bottom: var(--spacing-md);
      border: 1px solid var(--border-color);
    }
    .form-section h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      font-size: 1.1rem;
      font-weight: 700;
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-sm);
    }
    .form-group { margin-bottom: var(--spacing-md); }
    .form-group label {
      display: block; margin-bottom: 6px;
      font-weight: 600; color: var(--text-dark); font-size: 13px;
    }
    .form-input {
      width: 100%; padding: 11px 14px;
      border: 1px solid var(--border-color);
      font-size: 14px; font-family: inherit;
      transition: border-color 0.2s; box-sizing: border-box;
    }
    .form-input:focus {
      outline: none; border-color: var(--primary-color);
    }
    select.form-input { appearance: auto; }
    .error { display: block; color: #b91c1c; font-size: 11px; margin-top: 4px; }

    /* COD Section */
    .cod-info {
      display: flex; gap: 16px; align-items: flex-start;
      padding: 20px; background: var(--secondary-color);
      border: 1px solid var(--border-color);
    }
    .cod-icon {
      width: 52px; height: 52px; display: flex;
      align-items: center; justify-content: center;
      background: var(--primary-color); color: #fff;
      flex-shrink: 0;
    }
    .cod-text h3 { margin: 0 0 6px; font-size: 1rem; font-weight: 700; color: var(--text-dark); }
    .cod-text p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
    .cod-note {
      display: flex; align-items: center; gap: 8px;
      margin-top: 12px; padding: 10px 14px;
      background: #fffbeb; border: 1px solid #fde68a;
      font-size: 12px; color: #92400e;
    }
    .cod-note svg { flex-shrink: 0; color: #d97706; }

    .btn-submit {
      width: 100%; padding: 16px;
      background: var(--primary-color); color: #fff;
      border: none; font-size: 1rem; font-weight: 700;
      cursor: pointer; font-family: inherit;
      transition: opacity 0.2s; margin-top: var(--spacing-sm);
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.9; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Order Summary */
    .order-summary {
      background: #fff; padding: 24px;
      border: 1px solid var(--border-color);
      height: fit-content; position: sticky; top: 100px;
    }
    .order-summary h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      font-size: 1.1rem; font-weight: 700;
    }
    .order-items { margin-bottom: var(--spacing-md); }
    .order-item {
      display: flex; justify-content: space-between;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);
    }
    .item-info h4 { margin: 0 0 4px; font-size: 13px; font-weight: 600; color: var(--text-dark); }
    .item-info p { margin: 0; font-size: 12px; color: var(--text-muted); }
    .item-total { font-weight: 700; color: var(--text-dark); font-size: 13px; }

    .summary-totals { margin-bottom: var(--spacing-md); }
    .summary-row {
      display: flex; justify-content: space-between;
      margin-bottom: 10px; font-size: 14px;
    }
    .summary-row.total {
      font-size: 1.15rem; font-weight: 800;
      color: var(--primary-color); margin-top: var(--spacing-sm);
    }
    .free { color: #059669; font-weight: 700; }
    .cod-tag {
      font-size: 12px; font-weight: 700; color: var(--primary-color);
      background: var(--secondary-color); padding: 2px 10px;
    }
    .summary-divider { height: 1px; background: var(--border-color); margin: var(--spacing-sm) 0; }

    .security-note {
      display: flex; align-items: center; gap: 8px;
      padding: 12px; background: var(--secondary-color);
      font-size: 12px; color: var(--text-muted);
    }
    .security-note svg { color: var(--primary-color); flex-shrink: 0; }

    .empty-cart { text-align: center; padding: var(--spacing-xl) 0; }
    .empty-cart h2 { color: var(--primary-color); margin-bottom: var(--spacing-sm); }

    @media (max-width: 968px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .order-summary { position: static; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  isLoggedIn = false;
  isProcessing = false;

  indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh'
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isProcessing = true;
      setTimeout(() => {
        this.isProcessing = false;
        this.cartService.clearCart();
        alert('Order placed successfully! You will pay on delivery.');
        this.router.navigate(['/']);
      }, 2000);
    } else {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
    }
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getSubtotal(): number {
    return this.cartService.getCartSubtotal();
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const shipping = subtotal >= 5000 ? 0 : 500;
    return subtotal + shipping;
  }

  formatPrice(price: number): string {
    return `₹${price}`;
  }
}
