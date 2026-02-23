import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
              <a class="nav-item active" (click)="activeTab = 'profile'">Profile</a>
              <a class="nav-item" (click)="activeTab = 'orders'">Orders</a>
              <a class="nav-item" (click)="activeTab = 'addresses'">Addresses</a>
              <a class="nav-item" (click)="activeTab = 'password'">Change Password</a>
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
              <h2>Order History</h2>
              <div class="orders-list">
                <div class="order-card" *ngFor="let order of orders">
                  <div class="order-header">
                    <div>
                      <h3>Order #{{ order.id }}</h3>
                      <p class="order-date">Placed on {{ order.date }}</p>
                    </div>
                    <span class="order-status" [class]="order.status">{{ order.status }}</span>
                  </div>
                  <div class="order-items">
                    <div class="order-item" *ngFor="let item of order.items">
                      <span>{{ item.name }} × {{ item.quantity }}</span>
                      <span>{{ formatPrice(item.price) }}</span>
                    </div>
                  </div>
                  <div class="order-footer">
                    <span class="order-total">Total: {{ formatPrice(order.total) }}</span>
                    <button class="btn btn-secondary">View Details</button>
                  </div>
                </div>

                <div class="empty-state" *ngIf="orders.length === 0">
                  <p>No orders yet</p>
                  <a routerLink="/collections" class="btn btn-primary">Start Shopping</a>
                </div>
              </div>
            </div>

            <!-- Addresses Tab -->
            <div class="tab-content" *ngIf="activeTab === 'addresses'">
              <h2>Saved Addresses</h2>
              <div class="addresses-list">
                <div class="address-card" *ngFor="let address of addresses">
                  <div class="address-header">
                    <h3>{{ address.label }}</h3>
                    <div class="address-actions">
                      <button class="btn-icon" (click)="editAddress(address)">Edit</button>
                      <button class="btn-icon delete" (click)="deleteAddress(address.id)">Delete</button>
                    </div>
                  </div>
                  <p>{{ address.street }}</p>
                  <p>{{ address.city }}, {{ address.state }} {{ address.zipCode }}</p>
                  <p>{{ address.country }}</p>
                </div>

                <button class="btn btn-primary" (click)="addNewAddress()">Add New Address</button>
              </div>
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

    .profile-main {
      background: var(--text-white);
      padding: var(--spacing-lg);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
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
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
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

    .order-items {
      margin: var(--spacing-sm) 0;
      padding: var(--spacing-sm) 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 14px;
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--spacing-sm);
    }

    .order-total {
      font-weight: 600;
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
        overflow-x: auto;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  activeTab = 'profile';
  profileForm: FormGroup;
  passwordForm: FormGroup;
  orders: any[] = [];
  addresses: any[] = [];

  constructor(private fb: FormBuilder) {
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
  }

  ngOnInit() {
    // Load user data, orders, addresses from service
    this.loadUserData();
  }

  loadUserData() {
    // Mock data - would come from service
    this.orders = [];
    this.addresses = [
      {
        id: 1,
        label: 'Home',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      }
    ];
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
      this.addresses = this.addresses.filter(a => a.id !== id);
    }
  }

  addNewAddress() {
    // Add new address logic
    alert('Add new address functionality');
  }

  formatPrice(price: number): string {
    return `₹${price}`;
  }
}
