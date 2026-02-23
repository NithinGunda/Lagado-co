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
          <!-- Guest Checkout Option -->
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
                      <label>State/Province *</label>
                      <input type="text" formControlName="state" class="form-input">
                      <span class="error" *ngIf="isFieldInvalid('state')">Required</span>
                    </div>
                    <div class="form-group">
                      <label>ZIP/Postal Code *</label>
                      <input type="text" formControlName="zipCode" class="form-input">
                      <span class="error" *ngIf="isFieldInvalid('zipCode')">Required</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Country *</label>
                    <select formControlName="country" class="form-input">
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                    <span class="error" *ngIf="isFieldInvalid('country')">Required</span>
                  </div>
                </section>

                <!-- Payment Information -->
                <section class="form-section">
                  <h2>Payment Information</h2>
                  
                  <div class="payment-methods">
                    <label class="payment-method">
                      <input type="radio" formControlName="paymentMethod" value="card" checked>
                      <span>Credit/Debit Card</span>
                    </label>
                    <label class="payment-method">
                      <input type="radio" formControlName="paymentMethod" value="paypal">
                      <span>PayPal</span>
                    </label>
                  </div>

                  <div *ngIf="checkoutForm.get('paymentMethod')?.value === 'card'">
                    <div class="form-group">
                      <label>Card Number *</label>
                      <input type="text" formControlName="cardNumber" class="form-input" placeholder="1234 5678 9012 3456" maxlength="19">
                      <span class="error" *ngIf="isFieldInvalid('cardNumber')">Valid card number required</span>
                    </div>

                    <div class="form-row">
                      <div class="form-group">
                        <label>Expiry Date *</label>
                        <input type="text" formControlName="expiryDate" class="form-input" placeholder="MM/YY" maxlength="5">
                        <span class="error" *ngIf="isFieldInvalid('expiryDate')">Required</span>
                      </div>
                      <div class="form-group">
                        <label>CVV *</label>
                        <input type="text" formControlName="cvv" class="form-input" placeholder="123" maxlength="4">
                        <span class="error" *ngIf="isFieldInvalid('cvv')">Required</span>
                      </div>
                    </div>

                    <div class="form-group">
                      <label>Cardholder Name *</label>
                      <input type="text" formControlName="cardholderName" class="form-input">
                      <span class="error" *ngIf="isFieldInvalid('cardholderName')">Required</span>
                    </div>
                  </div>
                </section>

                <button type="submit" class="btn btn-primary btn-submit" [disabled]="checkoutForm.invalid || isProcessing">
                  <span *ngIf="!isProcessing">Complete Order</span>
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
                  <span>Tax</span>
                  <span>{{ formatPrice(getTax()) }}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span *ngIf="getSubtotal() >= 100" class="free">FREE</span>
                  <span *ngIf="getSubtotal() < 100">{{ formatPrice(10) }}</span>
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
                <span>Secure checkout. Your payment information is encrypted.</span>
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
      font-size: clamp(2rem, 4vw, 3rem);
      color: var(--primary-color);
      margin-bottom: var(--spacing-lg);
    }

    .guest-option {
      background: var(--secondary-color);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: 8px;
      margin-bottom: var(--spacing-md);
      text-align: center;
    }

    .guest-option a {
      color: var(--primary-color);
      font-weight: 600;
    }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: var(--spacing-xl);
    }

    .form-section {
      background: var(--text-white);
      padding: var(--spacing-md);
      border-radius: 12px;
      margin-bottom: var(--spacing-md);
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .form-section h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      font-size: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-sm);
    }

    .form-group {
      margin-bottom: var(--spacing-md);
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--primary-color);
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 14px;
      transition: var(--transition-normal);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }

    .error {
      display: block;
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }

    .payment-methods {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .payment-method {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 12px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      flex: 1;
      transition: var(--transition-normal);
    }

    .payment-method:hover {
      border-color: var(--primary-color);
    }

    .payment-method input[type="radio"] {
      accent-color: var(--primary-color);
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      font-size: 1.125rem;
      font-weight: 600;
      margin-top: var(--spacing-md);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .order-summary {
      background: var(--text-white);
      padding: var(--spacing-md);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
      height: fit-content;
      position: sticky;
      top: 120px;
    }

    .order-summary h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      font-size: 1.5rem;
    }

    .order-items {
      margin-bottom: var(--spacing-md);
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);
    }

    .item-info h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: var(--primary-color);
    }

    .item-info p {
      margin: 0;
      font-size: 12px;
      color: var(--text-light);
    }

    .item-total {
      font-weight: 600;
      color: var(--primary-color);
    }

    .summary-totals {
      margin-bottom: var(--spacing-md);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
      font-size: 14px;
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-color);
      margin-top: var(--spacing-sm);
    }

    .free {
      color: #27ae60;
      font-weight: 600;
    }

    .summary-divider {
      height: 1px;
      background: var(--border-color);
      margin: var(--spacing-sm) 0;
    }

    .security-note {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--spacing-sm);
      background: var(--secondary-color);
      border-radius: 8px;
      font-size: 12px;
      color: var(--text-light);
    }

    .security-note svg {
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .empty-cart {
      text-align: center;
      padding: var(--spacing-xl) 0;
    }

    .empty-cart h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    @media (max-width: 968px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }

      .order-summary {
        position: static;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  isLoggedIn = false; // This would come from auth service
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      paymentMethod: ['card'],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['']
    });
  }

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    if (this.cartItems.length === 0) {
      // Redirect if cart is empty
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.checkoutForm.valid) {
      this.isProcessing = true;
      // Simulate payment processing
      setTimeout(() => {
        this.isProcessing = false;
        // Clear cart and redirect to success page
        this.cartService.clearCart();
        alert('Order placed successfully!');
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
}
