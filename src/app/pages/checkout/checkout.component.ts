import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { CouponService, Coupon } from '../../services/coupon.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { CartApiService } from '../../services/cart-api.service';
import { CartItem, Product, stockBySizeFromArray } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="checkout-page">
      <div class="container">
        <h1 class="page-title">Checkout</h1>

        <div class="checkout-content" *ngIf="cartItems.length > 0">
          <div class="checkout-grid">
            <!-- Checkout Form -->
            <!-- formGroup on wrapper so delivery <form> stays small; coupon/payment sit outside that <form> so Apply / Enter cannot submit checkout -->
            <div class="checkout-form-section" [formGroup]="checkoutForm">
              <form id="legado-checkout-delivery" (ngSubmit)="onSubmit()">
                <section class="form-section" *ngIf="hasUserDetails()">
                  <h2>Your details</h2>
                  <div class="user-details-readonly">
                    <p><strong>{{ checkoutForm.get('firstName')?.value }} {{ checkoutForm.get('lastName')?.value }}</strong></p>
                    <p>{{ checkoutForm.get('email')?.value }}</p>
                    <p>{{ checkoutForm.get('phone')?.value }}</p>
                  </div>
                </section>

                <section class="form-section">
                  <h2>Delivery Address</h2>
                  <p class="address-loading" *ngIf="addressesLoading">Loading addresses...</p>
                  <div class="address-choice" *ngIf="!addressesLoading && userAddresses.length > 0 && !useNewAddress">
                    <label class="address-option" *ngFor="let addr of userAddresses">
                      <input type="radio" name="savedAddress" [value]="addr.id" [checked]="selectedAddressId === addr.id" (change)="selectSavedAddress(addr)">
                      <span class="address-text">{{ addr.street }}{{ addr.location ? ', ' + addr.location : '' }}, {{ addr.city }}, {{ addr.state }} {{ addr.pincode }}</span>
                    </label>
                    <button type="button" class="btn-link" (click)="useNewAddress = true; clearAddressSelection()">+ Add new address</button>
                  </div>
                  <div class="address-form-fields" *ngIf="useNewAddress || userAddresses.length === 0">
                    <p class="address-hint" *ngIf="userAddresses.length === 0">Add a delivery address.</p>
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
                    <button type="button" class="btn-link" *ngIf="userAddresses.length > 0" (click)="useNewAddress = false; selectSavedAddress(userAddresses[0])">Use saved address instead</button>
                  </div>
                  <p class="error" *ngIf="checkoutError">{{ checkoutError }}</p>
                </section>
              </form>

              <!-- Outside delivery <form>: prevents implicit submit from coupon field / Apply -->
              <section class="form-section">
                <h2>Coupon Code</h2>
                <div class="coupon-row" *ngIf="!appliedCoupon">
                  <input
                    type="text"
                    class="form-input coupon-input"
                    [(ngModel)]="couponCode"
                    [ngModelOptions]="{standalone: true}"
                    placeholder="Enter coupon code"
                    autocomplete="off"
                    (keydown.enter)="$event.preventDefault(); applyCoupon()"
                  />
                  <button
                    type="button"
                    class="btn-apply-coupon"
                    (click)="$event.preventDefault(); applyCoupon()"
                    [disabled]="!couponCode.trim() || couponLoading"
                  >
                    {{ couponLoading ? 'Checking...' : 'Apply' }}
                  </button>
                </div>
                <p class="coupon-error" *ngIf="couponError">{{ couponError }}</p>
                <div class="coupon-applied-block" *ngIf="appliedCoupon">
                  <div class="coupon-applied-label">Coupon applied</div>
                  <div class="coupon-applied-card">
                    <div class="coupon-applied-left">
                      <span class="coupon-applied-discount-main" *ngIf="appliedCoupon.discount_type === 'percentage'">
                        {{ appliedCoupon.discount_value || 0 }}% OFF
                      </span>
                      <span class="coupon-applied-discount-main" *ngIf="appliedCoupon.discount_type === 'fixed'">
                        ₹{{ appliedCoupon.discount_value || 0 }} OFF
                      </span>
                      <span class="coupon-applied-discount-main" *ngIf="appliedCoupon.discount_type !== 'percentage' && appliedCoupon.discount_type !== 'fixed'">
                        −{{ formatPrice(couponDiscountAmount) }}
                      </span>
                      <span class="coupon-applied-min" *ngIf="appliedCoupon.min_order_amount">
                        Min order: ₹{{ appliedCoupon.min_order_amount }}
                      </span>
                    </div>
                    <div class="coupon-applied-right">
                      <span class="coupon-applied-code-text">{{ appliedCoupon.code | uppercase }}</span>
                      <span class="coupon-applied-order-save">On this order: −{{ formatPrice(couponDiscountAmount) }}</span>
                      <span class="coupon-applied-validity" *ngIf="appliedCoupon.valid_until">
                        Expires {{ formatCouponValidUntil(appliedCoupon.valid_until) }}
                      </span>
                      <button type="button" class="btn-remove-coupon" (click)="removeCoupon()">Remove coupon</button>
                    </div>
                  </div>
                </div>
              </section>

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

              <p class="shipping-estimate-note" role="status">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <span>Standard shipping typically takes <strong>5 to 7 business days</strong> after your order is dispatched.</span>
              </p>

              <button
                type="submit"
                form="legado-checkout-delivery"
                class="btn-submit"
                [disabled]="isSubmitDisabled()"
              >
                <span *ngIf="!isProcessing">Place Order — {{ formatPrice(getTotal()) }}</span>
                <span *ngIf="isProcessing">Processing...</span>
              </button>
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <h2>Order Summary</h2>

              <div class="order-items">
                <div class="order-item" *ngFor="let item of cartItems">
                  <div class="order-item-body">
                    <div class="order-thumb-wrap">
                      <img
                        *ngIf="getProductImage(item.product)"
                        [src]="getProductImage(item.product)"
                        [alt]="item.product.name"
                        class="order-thumb-img"
                        loading="lazy"
                      />
                      <div
                        *ngIf="!getProductImage(item.product)"
                        class="order-thumb-fallback"
                        [style.background]="getProductColor(item.product)"
                      ></div>
                    </div>
                    <div class="item-info">
                      <h4>{{ item.product.name }}</h4>
                      <p class="order-line-meta" *ngIf="item.selectedSize">Size: {{ item.selectedSize }}</p>
                      <p>Qty: {{ item.quantity }} × {{ formatPrice(item.product.price) }}</p>
                    </div>
                  </div>
                  <span class="item-total">{{ formatPrice(getItemTotal(item)) }}</span>
                </div>
              </div>

              <div class="summary-totals">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(getSubtotal()) }}</span>
                </div>
                <div class="summary-row discount-row" *ngIf="appliedCoupon">
                  <span class="summary-discount-cell">
                    <span
                      class="discount-badge"
                      [class.pct]="appliedCoupon.discount_type === 'percentage'"
                      [class.fixed]="appliedCoupon.discount_type === 'fixed'"
                    >
                      <ng-container *ngIf="appliedCoupon.discount_type === 'percentage'">{{ appliedCoupon.discount_value }}% off</ng-container>
                      <ng-container *ngIf="appliedCoupon.discount_type === 'fixed'">₹{{ appliedCoupon.discount_value }} off</ng-container>
                      <ng-container *ngIf="appliedCoupon.discount_type !== 'percentage' && appliedCoupon.discount_type !== 'fixed'">Coupon</ng-container>
                    </span>
                    <span class="summary-coupon-code-pill">{{ appliedCoupon.code | uppercase }}</span>
                  </span>
                  <span class="discount-amount">−{{ formatPrice(couponDiscountAmount) }}</span>
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

    <!-- Order success thank-you modal -->
    <div class="order-success-overlay" *ngIf="showOrderSuccessModal" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
      <div class="order-success-modal">
        <div class="order-success-inner">
          <img src="assets/Logo.png" alt="Legado & Co" class="order-success-logo" />
          <h2 id="order-success-title" class="order-success-title">Thank you for your order</h2>
          <p class="order-success-lead">Your order has been placed successfully. We’re honoured to be part of your story.</p>
          <p class="order-success-quote">“Quality is not an act, it is a habit. We deliver both — with care and trust.”</p>
          <p class="order-success-note">Pay securely when your order arrives. We’ll keep you updated every step of the way.</p>
          <p class="order-success-brand">— Legado & Co</p>
          <button type="button" class="btn-order-success-proceed" (click)="closeOrderSuccessAndGoHome()">
            Continue Shopping
          </button>
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
    .user-details-readonly {
      padding: 12px 0;
      color: var(--text-dark);
      font-size: 14px;
      line-height: 1.6;
    }
    .user-details-readonly p { margin: 4px 0; }

    .address-choice { margin-bottom: 12px; }
    .address-option {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 12px;
      cursor: pointer;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
    .address-option input { margin-top: 3px; }
    .address-text { flex: 1; font-size: 13px; color: var(--text-dark); }
    .btn-link {
      background: none;
      border: none;
      color: var(--primary-color);
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      padding: 8px 0;
    }
    .btn-link:hover { text-decoration: underline; }
    .address-hint { margin-bottom: 12px; font-size: 13px; color: var(--text-muted); }
    .address-form-fields { margin-top: 12px; }
    .address-loading { margin: 8px 0; font-size: 13px; color: var(--text-muted); }

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

    .coupon-row { display: flex; gap: 10px; margin-bottom: 8px; }
    .coupon-input { flex: 1; }
    .btn-apply-coupon {
      padding: 11px 20px; background: var(--primary-color); color: #fff;
      border: none; font-weight: 600; font-size: 14px; cursor: pointer;
      white-space: nowrap;
    }
    .btn-apply-coupon:hover:not(:disabled) { opacity: 0.9; }
    .btn-apply-coupon:disabled { opacity: 0.6; cursor: not-allowed; }
    .coupon-error { color: #b91c1c; font-size: 13px; margin: 8px 0 0; }

    /* Matches admin Coupons preview card */
    .coupon-applied-block { margin-top: 4px; }
    .coupon-applied-label {
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
      color: var(--text-muted); margin-bottom: 8px;
    }
    .coupon-applied-card {
      display: flex; border: 2px dashed var(--border-color); overflow: hidden;
      background: #fff;
    }
    .coupon-applied-left {
      background: var(--primary-color); color: #fff; padding: 16px 20px;
      display: flex; flex-direction: column; justify-content: center; gap: 4px;
      min-width: 140px; flex-shrink: 0;
    }
    .coupon-applied-discount-main { font-size: 1.2rem; font-weight: 800; line-height: 1.2; }
    .coupon-applied-min { font-size: 11px; opacity: 0.88; }
    .coupon-applied-right {
      flex: 1; padding: 16px 20px;
      display: flex; flex-direction: column; justify-content: center; gap: 6px;
      min-width: 0;
    }
    .coupon-applied-code-text {
      font-family: ui-monospace, 'SF Mono', 'Fira Code', monospace;
      font-size: 1.1rem; font-weight: 800; letter-spacing: 2px;
      color: var(--text-dark);
    }
    .coupon-applied-order-save { font-size: 13px; font-weight: 600; color: #059669; }
    .coupon-applied-validity { font-size: 11px; color: var(--text-muted); }
    .btn-remove-coupon {
      align-self: flex-start; margin-top: 4px;
      background: none; border: none; color: var(--primary-color);
      font-size: 12px; font-weight: 700; cursor: pointer;
      text-decoration: underline; padding: 0; font-family: inherit;
    }
    .btn-remove-coupon:hover { opacity: 0.85; }

    .summary-discount-cell {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .discount-badge {
      display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 700;
      background: #ecfdf5; color: #059669;
    }
    .discount-badge.pct { background: #ecfdf5; color: #059669; }
    .discount-badge.fixed { background: #eff6ff; color: #2563eb; }
    .summary-coupon-code-pill {
      font-family: ui-monospace, 'SF Mono', 'Fira Code', monospace;
      font-weight: 700; font-size: 12px;
      background: var(--secondary-color); padding: 4px 10px;
      border: 1px dashed var(--border-color); letter-spacing: 1px;
    }
    .discount-row .discount-amount { color: #059669; font-weight: 700; }

    @media (max-width: 480px) {
      .coupon-applied-card { flex-direction: column; }
      .coupon-applied-left { min-width: unset; width: 100%; }
    }

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

    .shipping-estimate-note {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: var(--spacing-md);
      margin-bottom: 4px;
      padding: 12px 14px;
      background: var(--secondary-color);
      border: 1px solid var(--border-color);
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-light);
    }
    .shipping-estimate-note svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: var(--primary-color);
    }
    .shipping-estimate-note strong {
      color: var(--text-dark);
      font-weight: 600;
    }

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
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);
    }
    .order-item-body {
      display: flex; align-items: center; gap: 12px;
      min-width: 0; flex: 1;
    }
    .order-thumb-wrap {
      width: 48px; height: 60px; flex-shrink: 0;
      border-radius: 6px; overflow: hidden;
      background: var(--secondary-color);
    }
    .order-thumb-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
    }
    .order-thumb-fallback { width: 100%; height: 100%; }
    .item-info { min-width: 0; }
    .item-info h4 { margin: 0 0 4px; font-size: 13px; font-weight: 600; color: var(--text-dark); }
    .item-info p { margin: 0; font-size: 12px; color: var(--text-muted); }
    .item-info .order-line-meta { color: var(--text-dark); font-weight: 500; margin-bottom: 2px; }
    .item-total { font-weight: 700; color: var(--text-dark); font-size: 13px; flex-shrink: 0; }

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

    /* Order success thank-you modal */
    .order-success-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(0, 0, 0, 0.45);
      animation: orderSuccessFadeIn 0.3s ease;
    }
    @keyframes orderSuccessFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .order-success-modal {
      background: #fff;
      border-radius: 16px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
      animation: orderSuccessSlideIn 0.35s ease;
    }
    @keyframes orderSuccessSlideIn {
      from { opacity: 0; transform: scale(0.96) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .order-success-inner {
      padding: 40px 36px 36px;
      text-align: center;
    }
    .order-success-logo {
      width: auto;
      max-width: min(200px, 70vw);
      max-height: 72px;
      height: auto;
      margin: 0 auto 24px;
      display: block;
      object-fit: contain;
    }
    .order-success-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0 0 12px;
      letter-spacing: -0.02em;
    }
    .order-success-lead {
      font-size: 1rem;
      color: var(--text-dark);
      line-height: 1.5;
      margin: 0 0 16px;
    }
    .order-success-quote {
      font-size: 0.95rem;
      font-style: italic;
      color: #555;
      line-height: 1.55;
      margin: 0 0 12px;
      padding: 0 8px;
    }
    .order-success-note {
      font-size: 0.9rem;
      color: var(--text-light);
      margin: 0 0 16px;
    }
    .order-success-brand {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-color);
      margin: 0 0 28px;
      letter-spacing: 0.03em;
    }
    .btn-order-success-proceed {
      display: inline-block;
      padding: 14px 32px;
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
      background: var(--primary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .btn-order-success-proceed:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    @media (min-width: 600px) {
      .order-success-logo { max-width: min(220px, 72vw); max-height: 80px; margin-bottom: 28px; }
      .order-success-inner { padding: 48px 44px 40px; }
      .order-success-title { font-size: 1.75rem; }
    }

    @media (max-width: 968px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .order-summary { position: static; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  isProcessing = false;
  couponCode = '';
  appliedCoupon: Coupon | null = null;
  couponDiscountAmount = 0;
  couponError = '';
  couponLoading = false;
  userAddresses: Array<{ id: number; street?: string; location?: string; city?: string; state?: string; pincode?: string }> = [];
  selectedAddressId: number | null = null;
  useNewAddress = false;
  addressesLoading = false;
  checkoutError = '';
  showOrderSuccessModal = false;

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
    private couponService: CouponService,
    private authService: AuthService,
    private addressService: AddressService,
    private cartApi: CartApiService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(?:\+91[-\s]?|0)?[6-9]\d{9}$/)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();
    const cached = this.authService.getUser();
    if (cached) this.patchUserIntoForm(cached);
    this.loadUserAndAddresses();
  }

  loadUserAndAddresses(): void {
    this.authService.me().subscribe({
      next: (user: any) => {
        if (!user) {
          const cached = this.authService.getUser();
          if (cached) this.patchUserIntoForm(cached);
          return;
        }
        this.patchUserIntoForm(user);
      },
      error: () => {
        const cached = this.authService.getUser();
        if (cached) this.patchUserIntoForm(cached);
      },
    });
    this.addressesLoading = true;
    this.addressService.list({ per_page: 50 }).subscribe({
      next: (res: any) => {
        this.addressesLoading = false;
        const list = res?.data ?? res?.addresses ?? (Array.isArray(res) ? res : []);
        this.userAddresses = list.map((a: any) => ({
          id: a.id,
          street: a.street ?? a.address,
          location: a.location,
          city: a.city,
          state: a.state,
          pincode: a.pincode ?? a.zipCode ?? a.zip,
        }));
        if (this.userAddresses.length > 0 && !this.useNewAddress) {
          this.selectedAddressId = this.userAddresses[0].id;
          this.selectSavedAddress(this.userAddresses[0]);
        }
      },
      error: () => {
        this.addressesLoading = false;
      },
    });
  }

  selectSavedAddress(addr: { id: number; street?: string; location?: string; city?: string; state?: string; pincode?: string }): void {
    this.selectedAddressId = addr.id;
    const street = addr.street ?? '';
    const location = addr.location ? `, ${addr.location}` : '';
    this.checkoutForm.patchValue({
      address: `${street}${location}`.trim() || street,
      city: addr.city ?? '',
      state: addr.state ?? '',
      zipCode: addr.pincode ?? '',
    });
  }

  clearAddressSelection(): void {
    this.selectedAddressId = null;
    this.checkoutForm.patchValue({ address: '', city: '', state: '', zipCode: '' });
  }

  hasUserDetails(): boolean {
    const v = this.checkoutForm.value as any;
    return !!(v.firstName || v.lastName || v.email || v.phone);
  }

  private patchUserIntoForm(user: any): void {
    const name = user?.name ?? (user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '');
    const parts = (name || '').trim().split(/\s+/);
    const firstName = user?.first_name ?? parts[0] ?? '';
    const lastName = user?.last_name ?? (parts.length > 1 ? parts.slice(1).join(' ') : '');
    const phone = (user?.phone ?? '').toString().replace(/\D/g, '');
    const phoneTrim = phone.length > 10 ? phone.slice(-10) : phone;
    this.checkoutForm.patchValue({
      firstName: firstName || (user?.name ?? ''),
      lastName: lastName,
      email: user?.email ?? '',
      phone: phoneTrim || '',
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isSubmitDisabled(): boolean {
    if (this.isProcessing) return true;
    const useSaved = this.selectedAddressId != null && !this.useNewAddress && this.userAddresses.length > 0;
    if (useSaved) return false;

    const addr = this.checkoutForm.get('address')?.value?.trim();
    const city = this.checkoutForm.get('city')?.value?.trim();
    const state = this.checkoutForm.get('state')?.value?.trim();
    const zip = this.checkoutForm.get('zipCode')?.value?.trim();
    const zipOk = !!zip && /^\d{6}$/.test(zip);
    return !addr || !city || !state || !zipOk;
  }

  onSubmit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.checkoutError = '';
    const useSaved = this.selectedAddressId != null && !this.useNewAddress && this.userAddresses.length > 0;
    if (useSaved) {
      this.placeOrderWithAddressId(this.selectedAddressId!);
      return;
    }
    if (!this.checkoutForm.get('address')?.value?.trim() || !this.checkoutForm.get('city')?.value?.trim() ||
        !this.checkoutForm.get('state')?.value?.trim() || !this.checkoutForm.get('zipCode')?.value?.trim()) {
      this.checkoutForm.get('address')?.markAsTouched();
      this.checkoutForm.get('city')?.markAsTouched();
      this.checkoutForm.get('state')?.markAsTouched();
      this.checkoutForm.get('zipCode')?.markAsTouched();
      this.checkoutError = 'Please fill in delivery address.';
      return;
    }
    this.isProcessing = true;
    this.addressService.create({
      type: 'shipping',
      street: this.checkoutForm.get('address')?.value,
      location: this.checkoutForm.get('address')?.value || '—',
      city: this.checkoutForm.get('city')?.value,
      state: this.checkoutForm.get('state')?.value,
      pincode: this.checkoutForm.get('zipCode')?.value,
    }).subscribe({
      next: (res: any) => {
        const id = res?.id ?? res?.data?.id ?? res?.address?.id;
        if (id) {
          this.placeOrderWithAddressId(id);
        } else {
          this.checkoutError = 'Could not save address. Try again.';
          this.isProcessing = false;
        }
      },
      error: () => {
        this.checkoutError = 'Could not save address. Try again.';
        this.isProcessing = false;
      },
    });
  }

  private placeOrderWithAddressId(addressId: number): void {
    this.checkoutError = '';
    this.isProcessing = true;
    const payload: any = { address_id: addressId, notes: '' };
    if (this.appliedCoupon?.code) payload.coupon_code = this.appliedCoupon.code;

    this.syncLocalCartToBackend().pipe(
      switchMap(() => this.cartApi.checkout(payload))
    ).subscribe({
      next: () => {
        this.isProcessing = false;
        this.cartService.clearCart();
        this.showOrderSuccessModal = true;
      },
      error: (err) => {
        this.isProcessing = false;
        if (err?.message === 'cart_missing_size' && this.checkoutError) return;
        const body = err?.error || {};
        const msg = body.error ?? body.message ?? 'Checkout failed. Try again.';
        this.checkoutError = typeof msg === 'string' ? msg : 'Checkout failed. Try again.';
      },
    });
  }

  /** Syncs current local cart to backend so checkout uses the same items. */
  private syncLocalCartToBackend() {
    const localItems = this.cartService.getCartItems();
    return this.cartApi.list().pipe(
      switchMap((backendCart: any) => {
        const list = Array.isArray(backendCart) ? backendCart : (backendCart?.data ?? []);
        const ids = list.map((c: any) => c.id).filter(Boolean);
        if (ids.length === 0) {
          return of(null);
        }
        return forkJoin(ids.map((id: number) => this.cartApi.delete(id)));
      }),
      switchMap(() => {
        if (localItems.length === 0) return of(null);
        const missing = localItems.filter(
          (item: CartItem) => this.productNeedsCartApiSize(item.product) && !this.resolveLineSize(item)
        );
        if (missing.length > 0) {
          this.checkoutError =
            'Some items need a size for checkout. Remove them from your cart and re-add with a size selected.';
          return throwError(() => new Error('cart_missing_size'));
        }
        const adds = localItems.map((item: CartItem) => {
          const size = this.resolveLineSize(item);
          const body: Record<string, unknown> = {
            product_id: this.normalizeProductIdForApi(item.product.id),
            quantity: item.quantity,
          };
          // API stores size on order lines; send both keys for compatibility
          if (size) {
            body['size'] = size;
            body['selected_size'] = size;
          }
          return this.cartApi.add(body);
        });
        return forkJoin(adds);
      })
    );
  }

  /** Backend requires size when the product has multiple size options or per-size stock. */
  private productNeedsCartApiSize(product: Product): boolean {
    return this.sizesOptionsFromProduct(product).length > 0;
  }

  /**
   * All size labels we know about for the product (attributes, `sizes` CSV, stock_by_size keys).
   */
  private sizesOptionsFromProduct(product: Product): string[] {
    const out: string[] = [];
    const seen = new Set<string>();
    const push = (s: string) => {
      const t = s.trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    };
    const sizeAttr = product.attributes?.find((a) => a.name?.toLowerCase() === 'size');
    if (sizeAttr?.value) {
      sizeAttr.value.split(',').forEach((x) => push(x));
    }
    const rawSizes = (product as any).sizes;
    if (typeof rawSizes === 'string' && rawSizes.trim()) {
      rawSizes.split(',').forEach((x: string) => push(x));
    }
    const sbs = stockBySizeFromArray((product as any).stock_by_size);
    Object.keys(sbs).forEach((k) => push(k));
    return out;
  }

  private normalizeProductIdForApi(id: string | number | undefined): number | string {
    if (id == null) return '';
    const n = Number(id);
    return Number.isFinite(n) && String(n) === String(id) ? n : String(id);
  }

  /** Effective size for API: cart line, or single explicit option, or single stock_by_size key. */
  private resolveLineSize(item: CartItem): string | undefined {
    const fromCart = item.selectedSize?.trim();
    if (fromCart) return fromCart;
    const opts = this.sizesOptionsFromProduct(item.product);
    if (opts.length === 1) return opts[0];
    const sbs = stockBySizeFromArray((item.product as any).stock_by_size);
    const keys = Object.keys(sbs);
    if (keys.length === 1) return keys[0];
    return undefined;
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getSubtotal(): number {
    return this.cartService.getCartSubtotal();
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discount = this.appliedCoupon ? this.couponDiscountAmount : 0;
    return Math.max(0, subtotal - discount);
  }

  applyCoupon() {
    const code = this.couponCode.trim();
    if (!code) return;
    this.couponError = '';
    this.couponLoading = true;
    this.couponService.validate(code, this.getSubtotal()).subscribe({
      next: (res) => {
        this.couponLoading = false;
        if (res.valid && res.discount_amount != null && res.coupon) {
          this.appliedCoupon = res.coupon;
          this.couponDiscountAmount = res.discount_amount;
          this.couponCode = '';
        } else {
          this.couponError = res.message || 'Invalid coupon.';
        }
      },
      error: (err) => {
        this.couponLoading = false;
        this.couponError = this.extractApiError(err, 'Could not validate coupon. Try again.');
      },
    });
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.couponDiscountAmount = 0;
    this.couponError = '';
  }

  /** Same date style as admin Coupons preview */
  formatCouponValidUntil(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  getProductImage(product: any): string {
    if (!product) return '';
    if (product.image_url) return product.image_url;
    if (Array.isArray(product.image_urls) && product.image_urls.length) {
      return product.image_urls[0];
    }
    if (Array.isArray(product.images) && product.images.length) {
      const first = product.images[0];
      if (typeof first === 'string') return first;
      if (first && typeof first.path === 'string') return first.path;
    }
    return '';
  }

  getProductColor(product: any): string {
    const colors: { [key: string]: string } = {
      mens: 'linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%)',
      womens: 'linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%)',
      collections: 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)',
    };
    const cat = product?.category;
    const key =
      typeof cat === 'string' ? cat : (cat?.slug ?? cat?.name ?? '').toString().toLowerCase();
    return colors[key] || colors['collections'];
  }

  formatPrice(price: number): string {
    return `₹${price}`;
  }

  closeOrderSuccessAndGoHome(): void {
    this.showOrderSuccessModal = false;
    this.router.navigate(['/']);
  }

  private extractApiError(err: any, fallback: string): string {
    const body = err?.error;
    if (body?.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors)[0];
      return Array.isArray(first) ? String(first[0]) : String(first);
    }
    return body?.message || body?.error || fallback;
  }
}
