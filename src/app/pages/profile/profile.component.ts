import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="profile-page">
      <div class="container">
        <h1 class="page-title">My Account</h1>

        <div class="profile-content">
          <!-- Profile Navigation -->
          <aside class="profile-nav">
            <nav class="nav-menu">
              <a class="nav-item" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">Profile</a>
              <a class="nav-item" [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'">My Orders</a>
              <a class="nav-item" [class.active]="activeTab === 'addresses'" (click)="activeTab = 'addresses'">Addresses</a>
              <a class="nav-item" [class.active]="activeTab === 'password'" (click)="activeTab = 'password'">Change Password</a>
              <button type="button" class="nav-item nav-item-logout" (click)="logout()">Logout</button>
            </nav>
          </aside>

          <!-- Profile Content -->
          <div class="profile-main">
            <!-- Profile Information Tab -->
            <div class="tab-content" *ngIf="activeTab === 'profile'">
              <h2>Profile Information</h2>
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>First Name *</label>
                    <input type="text" formControlName="firstName" class="form-input">
                  </div>
                  <div class="form-group">
                    <label>Last Name *</label>
                    <input type="text" formControlName="lastName" class="form-input">
                  </div>
                </div>

                <div class="form-group">
                  <label>Email Address *</label>
                  <input type="email" formControlName="email" class="form-input">
                </div>

                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" formControlName="phone" class="form-input">
                </div>

                <div class="form-group">
                  <label>Date of Birth</label>
                  <input type="date" formControlName="dateOfBirth" class="form-input">
                </div>

                <button type="submit" class="btn btn-primary">Save Changes</button>
              </form>
            </div>

            <!-- Orders Tab -->
            <div class="tab-content" *ngIf="activeTab === 'orders'">
              <h2>My Orders</h2>
              <div class="orders-list" *ngIf="!ordersLoading">
                <div class="order-card" *ngFor="let order of orders">
                  <div class="order-header">
                    <div>
                      <h3>Order #{{ order.id }}</h3>
                      <p class="order-date">Placed on {{ order.date }}</p>
                    </div>
                    <span class="order-status" [class]="(order.status || 'pending').toLowerCase()">{{ order.status || 'Pending' }}</span>
                  </div>
                  <div class="order-products">
                    <div class="order-products-header">
                      <span>Product</span>
                      <span>Qty</span>
                      <span>Unit price</span>
                      <span>Amount</span>
                    </div>
                    <div class="order-product-row" *ngFor="let item of order.items">
                      <div class="order-product-info">
                        <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.name" class="order-product-img">
                        <span class="order-product-name">{{ item.name }}</span>
                      </div>
                      <span class="order-product-qty">{{ item.quantity }}</span>
                      <span class="order-product-unit">{{ formatPrice(item.unitPrice) }}</span>
                      <span class="order-product-total">{{ formatPrice(item.lineTotal) }}</span>
                    </div>
                  </div>
                  <div class="order-summary">
                    <p class="order-summary-line" *ngIf="order.discount > 0">
                      <span>Discount</span>
                      <span class="discount">−{{ formatPrice(order.discount) }}</span>
                    </p>
                    <p class="order-summary-line order-total-line">
                      <span>Total</span>
                      <span class="order-total">{{ formatPrice(order.total) }}</span>
                    </p>
                  </div>
                </div>

                <div class="empty-state" *ngIf="orders.length === 0">
                  <p>No orders yet</p>
                  <a routerLink="/collections" class="btn btn-primary">Start Shopping</a>
                </div>
              </div>
              <div class="profile-loading" *ngIf="ordersLoading">Loading orders...</div>
            </div>

            <!-- Addresses Tab -->
            <div class="tab-content" *ngIf="activeTab === 'addresses'">
              <h2>Saved Addresses</h2>
              <div class="addresses-list" *ngIf="!addressesLoading">
                <div class="address-card" *ngFor="let address of addresses">
                  <div class="address-header">
                    <h3>{{ address.label }}</h3>
                    <div class="address-actions">
                      <button class="btn-icon" (click)="editAddress(address)">Edit</button>
                      <button class="btn-icon delete" (click)="deleteAddress(address.id)">Delete</button>
                    </div>
                  </div>
                  <p>{{ address.street }}{{ address.location ? ', ' + address.location : '' }}</p>
                  <p>{{ address.city }}, {{ address.state }} {{ address.zipCode }}</p>
                  <p *ngIf="address.country">{{ address.country }}</p>
                </div>

                <div class="empty-state" *ngIf="addresses.length === 0 && !showAddressForm">
                  <p>No saved addresses</p>
                </div>

                <!-- Add new address form -->
                <div class="address-form-wrap" *ngIf="showAddressForm">
                  <h3>New Address</h3>
                  <p class="form-error" *ngIf="addressFormError">{{ addressFormError }}</p>
                  <form [formGroup]="addressForm" (ngSubmit)="saveNewAddress()" class="profile-form address-form-inline">
                    <div class="form-group">
                      <label>Address type</label>
                      <select formControlName="type" class="form-input">
                        <option value="shipping">Shipping</option>
                        <option value="billing">Billing</option>
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Street / Address line *</label>
                      <input type="text" formControlName="street" class="form-input" placeholder="House no., building, street">
                      <span class="field-error" *ngIf="addressForm.get('street')?.invalid && addressForm.get('street')?.touched">Required</span>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label>Location / Area</label>
                        <input type="text" formControlName="location" class="form-input" placeholder="Area, locality">
                      </div>
                      <div class="form-group">
                        <label>Landmark</label>
                        <input type="text" formControlName="landmark" class="form-input" placeholder="Near ...">
                      </div>
                    </div>
                    <div class="form-row three-cols">
                      <div class="form-group">
                        <label>City *</label>
                        <input type="text" formControlName="city" class="form-input">
                        <span class="field-error" *ngIf="addressForm.get('city')?.invalid && addressForm.get('city')?.touched">Required</span>
                      </div>
                      <div class="form-group">
                        <label>State *</label>
                        <select formControlName="state" class="form-input">
                          <option value="">Select state</option>
                          <option *ngFor="let s of states" [value]="s">{{ s }}</option>
                        </select>
                        <span class="field-error" *ngIf="addressForm.get('state')?.invalid && addressForm.get('state')?.touched">Required</span>
                      </div>
                      <div class="form-group">
                        <label>Pincode *</label>
                        <input type="text" formControlName="pincode" class="form-input" placeholder="6 digits" maxlength="6">
                        <span class="field-error" *ngIf="addressForm.get('pincode')?.invalid && addressForm.get('pincode')?.touched">Required (6 digits)</span>
                      </div>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn btn-primary" [disabled]="addressForm.invalid || addressSaving">Save Address</button>
                      <button type="button" class="btn btn-outline" (click)="cancelAddAddress()">Cancel</button>
                    </div>
                  </form>
                </div>

                <button class="btn btn-primary" *ngIf="!showAddressForm" (click)="addNewAddress()">Add New Address</button>
              </div>
              <div class="profile-loading" *ngIf="addressesLoading">Loading addresses...</div>
            </div>

            <!-- Change Password Tab -->
            <div class="tab-content" *ngIf="activeTab === 'password'">
              <h2>Change Password</h2>
              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="profile-form">
                <div class="form-group">
                  <label>Current Password *</label>
                  <input type="password" formControlName="currentPassword" class="form-input">
                </div>

                <div class="form-group">
                  <label>New Password *</label>
                  <input type="password" formControlName="newPassword" class="form-input">
                </div>

                <div class="form-group">
                  <label>Confirm New Password *</label>
                  <input type="password" formControlName="confirmPassword" class="form-input">
                </div>

                <button type="submit" class="btn btn-primary">Update Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: var(--spacing-xl) 0;
      min-height: calc(100vh - 200px);
      overflow-x: hidden;
    }

    .page-title {
      font-size: clamp(2rem, 4vw, 3rem);
      color: var(--primary-color);
      margin-bottom: var(--spacing-lg);
    }

    .profile-content {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: var(--spacing-xl);
    }

    .profile-nav {
      background: var(--text-white);
      padding: var(--spacing-md);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
      height: fit-content;
      position: sticky;
      top: 120px;
      min-width: 0;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      padding: 12px 16px;
      color: var(--text-dark);
      cursor: pointer;
      border-radius: 8px;
      transition: var(--transition-normal);
      font-weight: 500;
    }

    .nav-item:hover {
      background: var(--secondary-color);
      color: var(--primary-color);
    }

    .nav-item.active {
      background: var(--primary-color);
      color: var(--text-white);
    }

    .nav-item-logout {
      width: 100%;
      text-align: left;
      border: none;
      background: none;
      cursor: pointer;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
      color: #c0392b;
      font-weight: 600;
    }

    .nav-item-logout:hover {
      background: rgba(192, 57, 43, 0.08);
      color: #a93226;
    }

    .profile-loading {
      padding: var(--spacing-lg);
      text-align: center;
      color: var(--text-light);
    }

    .profile-main {
      background: var(--text-white);
      padding: var(--spacing-lg);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
      min-width: 0;
      overflow-x: hidden;
    }

    .tab-content h2 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-sm);
      min-width: 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .form-group label {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 14px;
    }

    .form-input {
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

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .order-card {
      border: 2px solid var(--border-color);
      border-radius: 12px;
      padding: var(--spacing-md);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-sm);
    }

    .order-header h3 {
      margin: 0 0 4px 0;
      color: var(--primary-color);
    }

    .order-date {
      margin: 0;
      font-size: 12px;
      color: var(--text-light);
    }

    .order-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .order-status.completed {
      background: #27ae60;
      color: white;
    }

    .order-status.pending {
      background: #f39c12;
      color: white;
    }

    .order-status.cancelled {
      background: #e74c3c;
      color: white;
    }

    .order-products {
      margin: var(--spacing-sm) 0;
      padding: var(--spacing-sm) 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .order-products-header {
      display: grid;
      grid-template-columns: 1fr 60px 90px 90px;
      gap: 12px;
      padding: 8px 0 10px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-light);
      border-bottom: 1px solid var(--border-color);
    }

    .order-product-row {
      display: grid;
      grid-template-columns: 1fr 60px 90px 90px;
      gap: 12px;
      align-items: center;
      padding: 12px 0;
      font-size: 14px;
      border-bottom: 1px solid var(--border-color);
    }

    .order-product-row:last-child {
      border-bottom: none;
    }

    .order-product-info {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .order-product-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .order-product-img {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .order-product-name {
      font-weight: 500;
      color: var(--text-dark);
    }

    .order-product-qty {
      color: var(--text-dark);
    }

    .order-product-unit {
      color: var(--text-light);
      font-size: 13px;
    }

    .order-product-total {
      font-weight: 600;
      color: var(--primary-color);
    }

    .order-summary {
      margin-top: var(--spacing-sm);
      padding-top: var(--spacing-sm);
      border-top: 1px solid var(--border-color);
    }

    .order-summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 4px 0;
      font-size: 14px;
    }

    .order-summary-line .discount {
      color: #27ae60;
      font-weight: 600;
    }

    .order-total-line {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--border-color);
      font-weight: 600;
    }

    .order-total {
      font-weight: 700;
      color: var(--primary-color);
      font-size: 1.125rem;
    }

    .addresses-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .address-card {
      border: 2px solid var(--border-color);
      border-radius: 12px;
      padding: var(--spacing-md);
    }

    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);
    }

    .address-header h3 {
      margin: 0;
      color: var(--primary-color);
    }

    .address-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      padding: 4px 8px;
    }

    .btn-icon.delete {
      color: #e74c3c;
    }

    .address-card p {
      margin: 4px 0;
      color: var(--text-light);
      font-size: 14px;
    }

    .address-form-wrap {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-lg);
      border: 2px solid var(--border-color);
      border-radius: 12px;
      background: var(--secondary-color);
      min-width: 0;
      overflow-x: hidden;
    }
    .address-form-wrap h3 { margin: 0 0 var(--spacing-md) 0; color: var(--primary-color); font-size: 1.1rem; }
    .address-form-wrap .profile-form {
      min-width: 0;
    }
    .address-form-inline .form-row.three-cols { grid-template-columns: 1fr 1fr 1fr; }
    .form-error { color: #c0392b; font-size: 13px; margin-bottom: var(--spacing-sm); }
    .field-error { color: #c0392b; font-size: 12px; margin-top: 4px; }
    .form-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    .btn-outline {
      padding: 12px 24px;
      border: 2px solid var(--primary-color);
      background: transparent;
      color: var(--primary-color);
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: var(--transition-normal);
    }
    .btn-outline:hover { background: var(--secondary-color); }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl) 0;
      color: var(--text-light);
    }

    @media (max-width: 968px) {
      .profile-content {
        grid-template-columns: 1fr;
      }

      .profile-nav {
        position: static;
      }

      .nav-menu {
        flex-direction: row;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        padding-bottom: 4px;
        gap: 4px;
      }

      .nav-item {
        flex-shrink: 0;
        white-space: nowrap;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .address-form-inline .form-row.three-cols {
        grid-template-columns: 1fr;
      }

      .order-products-header,
      .order-product-row {
        grid-template-columns: 1fr 50px 70px 80px;
        gap: 8px;
        font-size: 13px;
      }

      .order-product-img {
        width: 40px;
        height: 40px;
      }
    }

    @media (max-width: 768px) {
      .address-form-inline .form-row.three-cols {
        grid-template-columns: 1fr;
      }
      .address-form-wrap {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 640px) {
      .profile-page {
        padding: var(--spacing-md) 0;
      }

      .profile-main {
        padding: var(--spacing-md);
      }

      .address-form-wrap {
        padding: var(--spacing-sm);
        margin-left: 0;
        margin-right: 0;
      }

      .order-card {
        padding: var(--spacing-sm);
      }

      .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .order-products {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin-left: calc(-1 * var(--spacing-sm));
        margin-right: calc(-1 * var(--spacing-sm));
        padding-left: var(--spacing-sm);
        padding-right: var(--spacing-sm);
      }

      .order-products-header,
      .order-product-row {
        grid-template-columns: minmax(120px, 1fr) 44px 64px 72px;
        gap: 8px;
        font-size: 12px;
      }

      .address-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .address-actions {
        flex-wrap: wrap;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions .btn {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.5rem;
      }

      .nav-item {
        padding: 10px 12px;
        font-size: 13px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  activeTab = 'profile';
  profileForm: FormGroup;
  passwordForm: FormGroup;
  addressForm: FormGroup;
  orders: any[] = [];
  addresses: any[] = [];
  ordersLoading = false;
  addressesLoading = false;
  showAddressForm = false;
  addressFormError = '';
  addressSaving = false;

  states: string[] = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private orderService: OrderService,
    private addressService: AddressService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      dateOfBirth: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    this.addressForm = this.fb.group({
      type: ['shipping'],
      street: ['', Validators.required],
      location: [''],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    // Brief delay so token is available when landing here right after login (avoid immediate redirect to sign-in)
    setTimeout(() => {
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadUserData();
      this.loadOrders();
      this.loadAddresses();
    }, 0);
  }

  loadUserData() {
    const user = this.authService.getUser();
    if (user) {
      const nameParts = (user.name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      this.profileForm.patchValue({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: ''
      });
    } else {
      this.authService.me().subscribe(u => {
        if (u) {
          const nameParts = (u.name || '').trim().split(/\s+/);
          this.profileForm.patchValue({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: u.email || '',
            phone: u.phone || '',
            dateOfBirth: ''
          });
        }
      });
    }
  }

  loadOrders() {
    this.ordersLoading = true;
    this.orderService.list({ user_only: 'true', per_page: '50' }).subscribe({
      next: (res: any) => {
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        this.orders = (list as any[]).map((o: any) => {
          const products = o.products || [];
          const items = products.map((p: any) => {
            const qty = p.pivot?.quantity ?? 1;
            const unitPrice = Number(p.price ?? p.pivot?.price ?? 0);
            const imageUrl = p.image_url ?? p.image_urls?.[0] ?? null;
            return {
              name: p.name || 'Product',
              quantity: qty,
              unitPrice,
              lineTotal: unitPrice * qty,
              imageUrl
            };
          });
          return {
            id: o.id,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            status: o.status || 'pending',
            total: o.total ?? 0,
            discount: o.discount ?? 0,
            items
          };
        });
        this.ordersLoading = false;
      },
      error: () => { this.ordersLoading = false; }
    });
  }

  loadAddresses() {
    this.addressesLoading = true;
    this.addressService.list({ per_page: 50 }).subscribe({
      next: (res: any) => {
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        this.addresses = (list as any[]).map((a: any) => ({
          id: a.id,
          label: (a.type || 'Address').toString().replace(/\b\w/g, (c: string) => c.toUpperCase()),
          street: a.street || '',
          location: a.location || '',
          city: a.city || '',
          state: a.state || '',
          zipCode: a.pincode || '',
          country: a.country || 'India'
        }));
        this.addressesLoading = false;
      },
      error: () => { this.addressesLoading = false; }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => { this.authService.clearAuth(); this.router.navigate(['/']); }
    });
  }

  updateProfile() {
    if (this.profileForm.valid) {
      // Update profile logic
      alert('Profile updated successfully!');
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      const newPassword = this.passwordForm.get('newPassword')?.value;
      const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
      
      if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      // Change password logic
      alert('Password changed successfully!');
      this.passwordForm.reset();
    }
  }

  editAddress(address: any) {
    // Edit address logic
    alert('Edit address functionality');
  }

  deleteAddress(id: number) {
    if (confirm('Are you sure you want to delete this address?')) {
      this.addressService.delete(id).subscribe({
        next: () => this.loadAddresses(),
        error: () => alert('Failed to delete address.')
      });
    }
  }

  addNewAddress() {
    this.addressFormError = '';
    this.addressForm.reset({ type: 'shipping', street: '', location: '', landmark: '', city: '', state: '', pincode: '' });
    this.showAddressForm = true;
  }

  cancelAddAddress() {
    this.showAddressForm = false;
    this.addressFormError = '';
    this.addressForm.reset({ type: 'shipping', street: '', location: '', landmark: '', city: '', state: '', pincode: '' });
  }

  saveNewAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.addressFormError = '';
    this.addressSaving = true;
    const v = this.addressForm.value;
    this.addressService.create({
      type: v.type || 'shipping',
      street: v.street?.trim(),
      location: v.location?.trim() || undefined,
      landmark: v.landmark?.trim() || undefined,
      city: v.city?.trim(),
      state: v.state?.trim(),
      pincode: v.pincode?.trim()
    }).subscribe({
      next: () => {
        this.addressSaving = false;
        this.showAddressForm = false;
        this.addressForm.reset({ type: 'shipping', street: '', location: '', landmark: '', city: '', state: '', pincode: '' });
        this.loadAddresses();
      },
      error: (err) => {
        this.addressSaving = false;
        this.addressFormError = this.extractApiError(err, 'Could not save address. Please try again.');
      }
    });
  }

  private extractApiError(err: any, fallback: string): string {
    const body = err?.error;
    if (body?.message && typeof body.message === 'string') return body.message;
    if (body?.error && typeof body.error === 'string') return body.error;
    if (body?.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors)[0];
      if (Array.isArray(first) && first[0]) return String(first[0]);
      if (typeof first === 'string') return first;
    }
    return fallback;
  }

  formatPrice(price: number): string {
    return `₹${Number(price ?? 0).toLocaleString('en-IN')}`;
  }
}
