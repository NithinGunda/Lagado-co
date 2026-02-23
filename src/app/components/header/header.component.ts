import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="header">
      <!-- Top Announcement Bar -->
      <div class="announcement-bar">
        <p>Free shipping on orders over ₹5,000 | <a routerLink="/collections">Shop Now</a></p>
      </div>

      <!-- Main Header -->
      <header class="main-header">
        <div class="container">
          <div class="header-content">
            <!-- Logo -->
            <div class="logo">
              <a routerLink="/">
                <h1>Legado & Co</h1>
              </a>
            </div>

            <!-- Navigation -->
            <div class="mobile-nav-backdrop" *ngIf="mobileMenuOpen" (click)="closeMobileMenu()"></div>
            <nav class="main-nav" [class.mobile-open]="mobileMenuOpen">
              <div class="mobile-nav-header">
                <span class="mobile-nav-title">Menu</span>
                <button class="mobile-nav-close" (click)="closeMobileMenu()" aria-label="Close menu">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <a routerLink="/collections" routerLinkActive="active" (click)="closeMobileMenu()">Collections</a>
              <a routerLink="/mens" routerLinkActive="active" (click)="closeMobileMenu()">Men's</a>
              <a routerLink="/womens" routerLinkActive="active" (click)="closeMobileMenu()">Women's</a>
              <a routerLink="/our-story" routerLinkActive="active" (click)="closeMobileMenu()">Our Story</a>
              <a routerLink="/blog" routerLinkActive="active" (click)="closeMobileMenu()">Blog</a>
            </nav>

            <!-- Right Actions -->
            <div class="header-actions">
              <!-- User Account -->
              <div class="user-account" *ngIf="isLoggedIn">
                <a routerLink="/profile" class="account-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span class="account-text">Account</span>
                </a>
              </div>
              <div class="user-account" *ngIf="!isLoggedIn">
                <a routerLink="/login" class="account-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span class="account-text">Login</span>
                </a>
              </div>

              <!-- Cart -->
              <a routerLink="/cart" class="cart-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 2L7 6m8-4l-2 4M3 6h18l-2 13H5L3 6z"></path>
                  <circle cx="9" cy="20" r="1"></circle>
                  <circle cx="20" cy="20" r="1"></circle>
                </svg>
                <span class="cart-count" *ngIf="cartCount > 0">{{ cartCount }}</span>
              </a>

              <!-- Mobile Menu Toggle -->
              <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" aria-label="Toggle menu">
                <svg *ngIf="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <svg *ngIf="mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--secondary-color);
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .announcement-bar {
      background: var(--primary-dark);
      color: var(--text-white);
      padding: 8px 0;
      text-align: center;
      font-size: 12px;
    }

    .announcement-bar p {
      margin: 0;
    }

    .announcement-bar a {
      color: var(--secondary-color);
      text-decoration: underline;
      font-weight: 500;
    }

    .main-header {
      background: var(--secondary-color);
      padding: var(--spacing-sm) 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-md);
    }

    .logo h1 {
      font-family: var(--font-logo);
      font-size: 2.25rem;
      color: var(--primary-color);
      margin: 0;
      font-weight: 400;
      display: inline-block;
    }

    .logo a {
      text-decoration: none;
    }

    .main-nav {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
    }

    .main-nav a {
      color: var(--text-dark);
      font-weight: 500;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: var(--transition-normal);
      padding: 8px 0;
      position: relative;
    }

    .main-nav a:hover,
    .main-nav a.active {
      color: var(--primary-color);
    }

    .main-nav a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--primary-color);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .user-account .account-link,
    .cart-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-dark);
      transition: var(--transition-normal);
      padding: 8px;
      border-radius: 8px;
    }

    .user-account .account-link:hover,
    .cart-link:hover {
      color: var(--primary-color);
      background: var(--secondary-color);
    }

    .account-text {
      font-size: 14px;
      font-weight: 500;
    }

    .cart-link {
      position: relative;
    }

    .cart-count {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--accent-color);
      color: var(--primary-color);
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
      transform: translate(50%, -50%);
    }

    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--text-dark);
      cursor: pointer;
      padding: 8px;
    }

    .mobile-nav-backdrop {
      display: none;
    }

    .mobile-nav-header {
      display: none;
    }

    @media (max-width: 968px) {
      .mobile-nav-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 998;
      }

      .main-nav {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 300px;
        max-width: 85vw;
        background: var(--text-white);
        flex-direction: column;
        padding: 0;
        box-shadow: -4px 0 20px var(--shadow-medium);
        transform: translateX(100%);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
        z-index: 999;
        overflow-y: auto;
      }

      .main-nav.mobile-open {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
      }

      .mobile-nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 2px solid var(--border-color);
      }

      .mobile-nav-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-color);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .mobile-nav-close {
        background: none;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition-normal);
        padding: 0;
      }

      .mobile-nav-close:hover {
        background: var(--primary-color);
        color: var(--text-white);
      }

      .main-nav a {
        width: 100%;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);
        font-size: 15px;
      }

      .main-nav a:hover {
        background: var(--secondary-color);
      }

      .mobile-menu-toggle {
        display: block;
      }

      .account-text {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .logo h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartCount = 0;
  isLoggedIn = false;
  mobileMenuOpen = false;
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartCount = this.cartService.getCartCount();
    });
    this.cartCount = this.cartService.getCartCount();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
