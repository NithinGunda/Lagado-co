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
              <button class="mobile-nav-close" (click)="closeMobileMenu()" aria-label="Close menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
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
      box-shadow: 0 1px 0 var(--border-color);
    }

    .announcement-bar {
      background: var(--btn-primary);
      color: var(--text-white);
      padding: 8px 0;
      text-align: center;
      font-size: 12px;
      letter-spacing: 0.3px;
    }

    .announcement-bar p {
      margin: 0;
    }

    .announcement-bar a {
      color: var(--btn-accent);
      text-decoration: underline;
      font-weight: 600;
    }

    .main-header {
      background: var(--secondary-color);
      padding: 12px 0;
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
      transition: opacity 0.2s ease;
    }

    .logo a { text-decoration: none; }
    .logo a:hover { opacity: 0.85; }

    .main-nav {
      display: flex;
      gap: 32px;
      align-items: center;
    }

    .main-nav a {
      color: var(--text-dark);
      font-weight: 500;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: color 0.25s ease;
      padding: 8px 0;
      position: relative;
    }

    .main-nav a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      right: 50%;
      height: 2px;
      background: var(--primary-color);
      transition: left 0.25s ease, right 0.25s ease;
    }

    .main-nav a:hover::after,
    .main-nav a.active::after {
      left: 0;
      right: 0;
    }

    .main-nav a:hover,
    .main-nav a.active {
      color: var(--primary-color);
      opacity: 1;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-account .account-link,
    .cart-link {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-dark);
      transition: all 0.2s ease;
      padding: 10px;
      position: relative;
    }

    .user-account .account-link:hover,
    .cart-link:hover {
      color: var(--primary-color);
      opacity: 1;
    }

    .account-text {
      font-size: 13px;
      font-weight: 500;
    }

    .cart-link {
      position: relative;
    }

    .cart-count {
      position: absolute;
      top: 4px;
      right: 2px;
      background: var(--btn-primary);
      color: var(--text-white);
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      min-width: 17px;
      text-align: center;
      line-height: 1.4;
      animation: badgePop 0.3s ease;
    }

    @keyframes badgePop {
      0% { transform: scale(0.5); }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--text-dark);
      cursor: pointer;
      padding: 10px;
      min-width: 44px;
      min-height: 44px;
      align-items: center;
      justify-content: center;
    }

    .mobile-nav-backdrop {
      display: none;
    }

    .mobile-nav-close {
      display: none;
    }

    @media (max-width: 968px) {
      .mobile-nav-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 998;
        backdrop-filter: blur(2px);
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
        padding: 60px 0 0 0;
        box-shadow: -4px 0 24px rgba(0,0,0,0.15);
        transform: translateX(100%);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
        z-index: 999;
        overflow-y: auto;
        gap: 0;
      }

      .main-nav.mobile-open {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
      }

      .mobile-nav-close {
        display: flex;
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
        background: none;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        width: 40px;
        height: 40px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
      }

      .mobile-nav-close:hover {
        background: var(--primary-color);
        color: var(--text-white);
      }

      .main-nav a {
        width: 100%;
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-color);
        font-size: 14px;
      }

      .main-nav a::after { display: none; }

      .main-nav a:hover {
        background: var(--grey-light);
        padding-left: 28px;
      }

      .mobile-menu-toggle {
        display: flex;
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
