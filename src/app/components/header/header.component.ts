import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="header-wrap" [class.scrolled]="isScrolled">
      <div class="top-promo-banner" role="region" aria-label="Shipping promotion">
        <div class="top-promo-inner">
          <svg class="top-promo-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <p class="top-promo-text">Free shipping on orders above &#8377;5,000</p>
        </div>
      </div>
      <!-- Main Header -->
      <header class="main-header">
        <div class="h-container">
          <!-- Logo (top-left) -->
          <div class="logo-left">
            <a routerLink="/" class="logo-link" aria-label="Legado & Co home">
              <span class="logo-wordmark">Legado &amp; Co</span>
            </a>
          </div>

          <!-- Main Nav -->
          <nav class="nav-main desktop-nav">
            <div
              class="nav-item"
              *ngFor="let cat of headerCategories"
            >
              <a
                [routerLink]="['/collections']"
                [queryParams]="{ category: cat.slug || cat.id }"
                routerLinkActive="active"
                [class.has-dropdown]="cat.children?.length"
              >
                <span class="nav-label-row">
                  <span class="nav-text">{{ cat.name }}</span>
                  <span class="nav-chevron" *ngIf="cat.children?.length" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </span>
                <span class="nav-line"></span>
              </a>
              <div class="nav-dropdown" *ngIf="cat.children?.length">
                <div class="nav-dropdown-inner">
                  <a
                    *ngFor="let sub of cat.children"
                    class="nav-dropdown-link"
                    [routerLink]="['/collections']"
                    [queryParams]="{ category: sub.slug || sub.id }"
                    (click)="$event.stopPropagation()"
                  >
                    {{ sub.name }}
                  </a>
                </div>
              </div>
            </div>
            <a routerLink="/our-story" routerLinkActive="active">
              <span class="nav-label-row">
                <span class="nav-text">Our Philosophy</span>
              </span>
              <span class="nav-line"></span>
            </a>
            <a routerLink="/blog" routerLinkActive="active">
              <span class="nav-label-row">
                <span class="nav-text">Journal</span>
              </span>
              <span class="nav-line"></span>
            </a>
          </nav>

          <!-- Actions (right) -->
          <div class="nav-right">
            <div class="action-divider"></div>
            <div class="header-actions">
              <button class="action-icon search-btn" (click)="toggleSearch()" aria-label="Search">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <a *ngIf="isLoggedIn" routerLink="/profile" class="action-icon" aria-label="Account">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </a>
              <a *ngIf="!isLoggedIn" routerLink="/login" class="action-icon" aria-label="Login">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </a>
              <a routerLink="/wishlist" class="action-icon wishlist-icon" aria-label="Wishlist">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span class="wishlist-badge" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
              </a>
              <a routerLink="/cart" class="action-icon cart-icon" aria-label="Cart">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
              </a>
              <button class="mobile-toggle" (click)="toggleMobileMenu()" aria-label="Menu">
                <span class="burger" [class.open]="mobileMenuOpen">
                  <span></span><span></span><span></span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Search Overlay -->
      <div class="search-overlay" [class.open]="searchOpen">
        <div class="search-inner">
          <form class="search-form" (ngSubmit)="submitSearch()">
            <input
              #searchInput
              type="search"
              name="hq"
              [(ngModel)]="searchDraft"
              autocomplete="off"
              placeholder="Search collections, products..."
              class="search-input"
              (keyup.escape)="closeSearch()"
            />
            <button type="submit" class="search-submit" aria-label="Search">Search</button>
          </form>
          <button type="button" class="search-close" (click)="closeSearch()" aria-label="Close search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div class="mobile-backdrop" *ngIf="mobileMenuOpen" (click)="closeMobileMenu()"></div>
      <nav class="mobile-nav" [class.open]="mobileMenuOpen">
        <div class="mobile-nav-head">
          <span class="mobile-logo">
            <img src="assets/Logo.png" alt="Legado & Co" class="mobile-logo-img" />
          </span>
          <button class="mobile-close" (click)="closeMobileMenu()" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mobile-links">
          <div class="mobile-cat-group" *ngFor="let cat of headerCategories">
            <ng-container *ngIf="cat.children?.length; else mobileCatSingle">
              <button
                type="button"
                class="mobile-cat-toggle"
                [class.open]="isMobileCatOpen(cat)"
                [attr.aria-expanded]="isMobileCatOpen(cat)"
                [attr.aria-controls]="'mobile-subcats-' + mobileCatKey(cat)"
                [id]="'mobile-cat-btn-' + mobileCatKey(cat)"
                (click)="toggleMobileCat(cat)"
              >
                <span class="mobile-cat-toggle-label">{{ cat.name }}</span>
                <span class="mobile-cat-chevron" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              <div
                class="mobile-subcat-list"
                *ngIf="isMobileCatOpen(cat)"
                [id]="'mobile-subcats-' + mobileCatKey(cat)"
                role="region"
                [attr.aria-labelledby]="'mobile-cat-btn-' + mobileCatKey(cat)"
              >
                <a
                  class="mobile-subcat mobile-subcat-all"
                  [routerLink]="['/collections']"
                  [queryParams]="{ category: cat.slug || cat.id }"
                  routerLinkActive="active"
                  (click)="closeMobileMenu()"
                >
                  <span class="mobile-subcat-dot"></span>
                  View all {{ cat.name }}
                </a>
                <a
                  *ngFor="let sub of cat.children || []"
                  class="mobile-subcat"
                  [routerLink]="['/collections']"
                  [queryParams]="{ category: sub.slug || sub.id }"
                  routerLinkActive="active"
                  (click)="closeMobileMenu()"
                >
                  <span class="mobile-subcat-dot"></span>
                  {{ sub.name }}
                </a>
              </div>
            </ng-container>
            <ng-template #mobileCatSingle>
              <a
                class="mobile-cat-parent"
                [routerLink]="['/collections']"
                [queryParams]="{ category: cat.slug || cat.id }"
                routerLinkActive="active"
                (click)="closeMobileMenu()"
              >
                {{ cat.name }}
              </a>
            </ng-template>
          </div>
          <a routerLink="/our-story" routerLinkActive="active" (click)="closeMobileMenu()">Our Philosophy</a>
          <a routerLink="/blog" routerLinkActive="active" (click)="closeMobileMenu()">Journal</a>
        </div>
        <div class="mobile-footer">
          <a routerLink="/wishlist" (click)="closeMobileMenu()" class="mob-action mob-action-wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Wishlist <span class="mob-wishlist-count" *ngIf="wishlistCount > 0">({{ wishlistCount }})</span>
          </a>
          <a *ngIf="isLoggedIn" routerLink="/profile" (click)="closeMobileMenu()" class="mob-action">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Account
          </a>
          <a *ngIf="!isLoggedIn" routerLink="/login" (click)="closeMobileMenu()" class="mob-action">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Sign In
          </a>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    /* ==================== WRAPPER ==================== */
    .header-wrap {
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: box-shadow 0.35s ease;
    }
    .header-wrap.scrolled {
      box-shadow: 0 2px 20px rgba(0,0,0,0.08);
    }

    /* ==================== TOP PROMO (free shipping) ==================== */
    .top-promo-banner {
      background: linear-gradient(90deg, var(--primary-color, #1e3a5f) 0%, #2a4d7a 50%, var(--primary-color, #1e3a5f) 100%);
      color: rgba(255,255,255,0.95);
      text-align: center;
      padding: 8px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .top-promo-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .top-promo-icon {
      flex-shrink: 0;
      opacity: 0.9;
    }
    .top-promo-text {
      margin: 0;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      line-height: 1.35;
    }

    /* ==================== MAIN HEADER ==================== */
    .main-header {
      background: var(--secondary-color, #FDF6EA);
      border-bottom: 1px solid rgba(0,0,0,0.04);
      padding: 0;
      transition: padding 0.35s ease;
    }
    .scrolled .main-header {
      background: rgba(253,246,234,0.97);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .h-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 16px;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      column-gap: 10px;
      align-items: center;
      height: 72px;
      transition: height 0.35s ease;
    }
    .scrolled .h-container {
      height: 58px;
    }

    /* ==================== NAVIGATION ==================== */
    /* overflow must stay visible or absolutely positioned dropdowns are clipped */
    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 22px;
      flex-wrap: nowrap;
      white-space: nowrap;
      min-width: 0;
      max-width: 100%;
      overflow: visible;
    }
    .nav-main {
      justify-self: center;
      min-width: 0;
      max-width: 100%;
    }
    .nav-right {
      justify-self: end;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .desktop-nav .nav-item > a,
    .desktop-nav > a {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      padding: 4px 0;
      color: var(--text-dark, #2c3e50);
      transition: color 0.3s ease;
      white-space: nowrap;
    }
    .nav-label-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-height: 20px;
      white-space: nowrap;
    }
    .nav-text {
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      line-height: 1.2;
      white-space: nowrap;
      transition: transform 0.3s ease, letter-spacing 0.3s ease;
    }
    .nav-line {
      display: block;
      width: 0;
      height: 1.5px;
      background: var(--primary-color, #3C5A99);
      margin-top: 3px;
      transition: width 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .desktop-nav .nav-item > a:hover .nav-line,
    .desktop-nav .nav-item > a.active .nav-line,
    .desktop-nav > a:hover .nav-line,
    .desktop-nav > a.active .nav-line {
      width: 100%;
    }
    .desktop-nav .nav-item > a:hover .nav-text,
    .desktop-nav .nav-item > a.active .nav-text,
    .desktop-nav > a:hover .nav-text,
    .desktop-nav > a.active .nav-text {
      color: var(--primary-color, #3C5A99);
      letter-spacing: 2px;
    }

    .nav-item {
      position: relative;
    }
    .nav-chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: transform 0.25s ease;
    }
    .nav-item:hover .nav-chevron { transform: rotate(180deg); opacity: 1; }

    .nav-dropdown {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(2px);
      min-width: 200px;
      padding-top: 6px;
      opacity: 0;
      pointer-events: none;
      transform-origin: top center;
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
      visibility: hidden;
      z-index: 1200;
    }
    .nav-item:hover .nav-dropdown,
    .nav-item:focus-within .nav-dropdown {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
    .nav-dropdown-inner {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
      padding: 6px 0;
      overflow: hidden;
    }
    .nav-dropdown-link {
      display: flex;
      align-items: center;
      min-height: 44px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-dark, #2c3e50);
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nav-dropdown-link:hover {
      background: rgba(30,58,95,0.06);
      color: var(--primary-color, #1e3a5f);
    }
    .nav-dropdown-link:active {
      background: rgba(30,58,95,0.1);
    }

    /* ==================== LOGO (Safari-safe: no negative margin, fluid type, bounded width) ==================== */
    .logo-left {
      justify-self: start;
      align-self: center;
      min-width: 0;
      max-width: min(46vw, 220px);
      flex-shrink: 0;
    }
    .logo-link {
      text-decoration: none;
      display: flex;
      align-items: center;
      min-width: 0;
      max-width: 100%;
    }
    .logo-wordmark {
      font-family: var(--font-body, 'Lato', sans-serif);
      font-size: var(--brand-wordmark-size, clamp(0.75rem, 1.65vw + 0.35rem, 1.35rem));
      font-weight: 700;
      letter-spacing: var(--brand-wordmark-tracking, clamp(0.06em, 0.4vw, 0.18em));
      text-transform: uppercase;
      color: #1e3a5f;
      white-space: nowrap;
      line-height: 1.15;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-font-smoothing: antialiased;
      transition: opacity 0.2s ease;
    }
    .scrolled .logo-wordmark {
      opacity: 0.95;
    }
    .logo-link:hover .logo-wordmark {
      opacity: 0.88;
    }

    /* ==================== DIVIDER ==================== */
    .action-divider {
      width: 1px;
      height: 20px;
      background: var(--border-color, #e4e8ec);
      margin: 0 4px;
    }

    /* ==================== ACTION ICONS ==================== */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    .action-icon, .search-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      background: transparent;
      border: none;
      color: var(--text-dark, #2c3e50);
      cursor: pointer;
      position: relative;
      transition: color 0.25s ease, background 0.25s ease;
      flex-shrink: 0;
    }
    .action-icon:hover, .search-btn:hover {
      color: var(--primary-color, #3C5A99);
      background: rgba(60,90,153,0.06);
    }
    .action-icon svg, .search-btn svg {
      transition: transform 0.25s ease;
    }
    .action-icon:hover svg, .search-btn:hover svg {
      transform: scale(1.08);
    }

    .cart-icon, .wishlist-icon { position: relative; }
    .wishlist-icon { color: #dc2626; }
    .wishlist-icon:hover { color: #b91c1c; }
    .cart-badge, .wishlist-badge {
      position: absolute;
      top: 4px;
      right: 3px;
      min-width: 16px;
      height: 16px;
      background: var(--accent-color, #B11C1C);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      line-height: 1;
      animation: badgePop 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }
    @keyframes badgePop {
      0% { transform: scale(0); }
      60% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }

    /* ==================== BURGER ==================== */
    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      width: 40px;
      height: 40px;
      align-items: center;
      justify-content: center;
    }
    .burger {
      display: flex;
      flex-direction: column;
      gap: 5px;
      width: 20px;
    }
    .burger span {
      display: block;
      height: 2px;
      background: var(--text-dark, #2c3e50);
      transition: transform 0.3s ease, opacity 0.2s ease, width 0.3s ease;
    }
    .burger span:nth-child(1) { width: 20px; }
    .burger span:nth-child(2) { width: 14px; }
    .burger span:nth-child(3) { width: 20px; }
    .burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .burger.open span:nth-child(2) { opacity: 0; width: 0; }
    .burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ==================== SEARCH OVERLAY ==================== */
    .search-overlay {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--secondary-color, #FDF6EA);
      border-bottom: 1px solid var(--border-color, #e4e8ec);
      padding: 0 40px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.35s ease, padding 0.35s ease;
    }
    .search-overlay.open {
      max-height: 120px;
      padding: 16px 40px;
    }
    .search-inner {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .search-form {
      flex: 1;
      display: flex;
      align-items: stretch;
      gap: 10px;
      min-width: 0;
    }
    .search-input {
      flex: 1;
      min-width: 0;
      padding: 10px 16px;
      border: 1px solid var(--border-color, #e4e8ec);
      background: #fff;
      font-size: 14px;
      font-family: var(--font-body);
      color: var(--text-dark);
      outline: none;
      transition: border-color 0.25s;
    }
    .search-input:focus {
      border-color: var(--primary-color, #3C5A99);
    }
    .search-input::placeholder {
      color: var(--text-muted, #8896a7);
    }
    .search-submit {
      flex-shrink: 0;
      padding: 10px 18px;
      background: var(--primary-color, #1e3a5f);
      color: #fff;
      border: none;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .search-submit:hover { opacity: 0.92; }
    .search-submit:active { transform: scale(0.98); }
    .search-close {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: var(--text-light, #6b7c93);
      cursor: pointer;
      padding: 6px;
      transition: color 0.2s;
    }
    .search-close:hover { color: var(--text-dark); }

    /* ==================== MOBILE NAV ==================== */
    .mobile-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 1001;
      backdrop-filter: blur(3px);
      animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .mobile-nav {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 320px;
      max-width: 85vw;
      background: var(--secondary-color, #FDF6EA);
      z-index: 1002;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: -8px 0 32px rgba(0,0,0,0.12);
    }
    .mobile-nav.open {
      transform: translateX(0);
    }

    .mobile-nav-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color, #e4e8ec);
    }
    .mobile-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mobile-logo-img {
      width: auto;
      max-width: min(140px, 55vw);
      max-height: 44px;
      height: auto;
      display: block;
      object-fit: contain;
    }
    .mobile-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: none;
      border: 1px solid var(--border-color, #e4e8ec);
      color: var(--text-dark);
      cursor: pointer;
      transition: all 0.2s;
    }
    .mobile-close:hover {
      background: var(--primary-color, #3C5A99);
      border-color: var(--primary-color, #3C5A99);
      color: #fff;
    }

    .mobile-links {
      flex: 1;
      overflow-y: auto;
      padding: 12px 0;
    }
    .mobile-links a,
    .mobile-links .mobile-cat-toggle {
      display: block;
      padding: 16px 28px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-dark);
      text-decoration: none;
      border-bottom: 1px solid rgba(0,0,0,0.04);
      transition: all 0.25s;
      position: relative;
    }
    .mobile-links .mobile-cat-toggle {
      width: 100%;
      text-align: left;
      background: none;
      border-left: none;
      border-right: none;
      border-top: none;
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .mobile-cat-toggle-label {
      flex: 1;
      min-width: 0;
    }
    .mobile-cat-chevron {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.65;
      transition: transform 0.3s ease, opacity 0.2s;
    }
    .mobile-cat-toggle.open .mobile-cat-chevron {
      transform: rotate(180deg);
      opacity: 1;
    }
    .mobile-links a::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background: var(--primary-color, #3C5A99);
      transition: width 0.25s ease;
    }
    .mobile-links a:hover,
    .mobile-links a.active {
      padding-left: 36px;
      color: var(--primary-color, #3C5A99);
      background: rgba(60,90,153,0.04);
    }
    .mobile-links .mobile-cat-toggle:hover,
    .mobile-links .mobile-cat-toggle:focus-visible {
      color: var(--primary-color, #3C5A99);
      background: rgba(60,90,153,0.04);
    }
    .mobile-links .mobile-cat-toggle:focus-visible {
      outline: 2px solid var(--primary-color, #3C5A99);
      outline-offset: -2px;
    }
    .mobile-links a:hover::before,
    .mobile-links a.active::before {
      width: 3px;
    }

    .mobile-cat-group {
      display: flex;
      flex-direction: column;
    }
    .mobile-cat-group .mobile-cat-parent {
      font-weight: 600;
    }
    .mobile-subcat-list {
      display: flex;
      flex-direction: column;
      background: rgba(0,0,0,0.02);
      border-bottom: 1px solid rgba(0,0,0,0.04);
      animation: mobileSubcatReveal 0.25s ease;
    }
    @keyframes mobileSubcatReveal {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .mobile-cat-group .mobile-subcat {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 48px;
      padding: 14px 28px 14px 48px;
      font-size: 14px;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0.3px;
      color: var(--text-dark);
      border-left: 3px solid transparent;
      margin-left: 0;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .mobile-cat-group .mobile-subcat:last-child {
      border-bottom: none;
    }
    .mobile-subcat-all {
      font-weight: 600;
      color: var(--primary-color, #3C5A99);
    }
    .mobile-cat-group .mobile-subcat:hover,
    .mobile-cat-group .mobile-subcat.active {
      background: rgba(60,90,153,0.06);
      border-left-color: var(--primary-color, #3C5A99);
      color: var(--primary-color, #3C5A99);
    }
    .mobile-cat-group .mobile-subcat::before {
      display: none;
    }
    .mobile-subcat-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--primary-color, #3C5A99);
      opacity: 0.5;
      flex-shrink: 0;
    }
    .mobile-cat-group .mobile-subcat:hover .mobile-subcat-dot,
    .mobile-cat-group .mobile-subcat.active .mobile-subcat-dot {
      opacity: 1;
    }

    .mobile-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border-color, #e4e8ec);
    }
    .mob-action {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-dark);
      text-decoration: none;
      transition: color 0.2s;
    }
    .mob-action:hover { color: var(--primary-color); }
    .mob-action-wishlist { color: #dc2626; }
    .mob-action-wishlist:hover { color: #b91c1c; }
    .mob-wishlist-count { font-weight: 700; opacity: 0.9; }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 1200px) {
      .desktop-nav { gap: 14px; }
      .nav-text { font-size: 10.5px; letter-spacing: 0.85px; }
    }

    @media (max-width: 1024px) {
      .h-container { padding: 0 14px; column-gap: 8px; }
      .desktop-nav { gap: 12px; }
      .nav-text { font-size: 11px; letter-spacing: 1px; }
      .search-overlay { padding: 0 24px; }
      .search-overlay.open { padding: 12px 24px; }
    }

    @media (max-width: 968px) {
      .desktop-nav { display: none; }
      .action-divider { display: none; }
      .h-container {
        grid-template-columns: auto minmax(0, 1fr) auto;
        padding: 0 12px;
        column-gap: 8px;
        height: 60px;
      }
      .scrolled .h-container { height: 54px; }
      .logo-left { max-width: min(55vw, 200px); }
      .nav-right { justify-self: end; gap: 2px; min-width: 0; }
      .header-actions { gap: 0; }
      .mobile-toggle { display: flex; }
      .search-overlay { padding: 0 16px; }
      .search-overlay.open { padding: 12px 16px; max-height: 200px; }
      .search-form { flex-wrap: wrap; }
      .search-submit { width: 100%; }
    }

    @media (max-width: 480px) {
      .top-promo-banner { padding: 6px 12px; }
      .top-promo-text { font-size: 10px; letter-spacing: 0.08em; }
      .h-container { padding: 0 10px; height: 56px; }
      .scrolled .h-container { height: 50px; }
      .logo-left { max-width: min(58vw, 180px); }
      .logo-wordmark {
        font-size: clamp(0.68rem, 3.2vw, 1rem);
        letter-spacing: clamp(0.04em, 0.8vw, 0.12em);
      }
      .action-icon, .search-btn {
        width: 36px; height: 36px;
        min-width: 36px; min-height: 36px;
      }
      .action-icon svg, .search-btn svg { width: 17px; height: 17px; }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartCount = 0;
  wishlistCount = 0;
  isLoggedIn = false;
  mobileMenuOpen = false;
  /** Which category row has its subcategories expanded in the mobile drawer (accordion). */
  mobileOpenCategoryKey: string | null = null;
  isScrolled = false;
  searchOpen = false;
  /** Header search overlay draft (submitted → /collections?q=…) */
  searchDraft = '';
  @ViewChild('searchInput') private searchInputRef?: ElementRef<HTMLInputElement>;
  private cartSubscription?: Subscription;
  private wishlistSubscription?: Subscription;
  private routerSubscription?: Subscription;

  headerCategories: (Category & { children?: Category[] })[] = [];

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  private updateLoginState() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
    });
    this.cartCount = this.cartService.getCartCount();
    this.wishlistSubscription = this.wishlistService.wishlist$.subscribe(() => {
      this.wishlistCount = this.wishlistService.getCount();
    });
    this.wishlistCount = this.wishlistService.getCount();
    this.updateLoginState();
    this.loadCategories();
    // Set initial scroll state (e.g. if page loads already scrolled)
    if (typeof window !== 'undefined') this.onScroll();
    // Refresh login state after every navigation (e.g. after login so icon goes to profile, not login)
    this.routerSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateLoginState());
  }

  ngOnDestroy() {
    this.cartSubscription?.unsubscribe();
    this.wishlistSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  private readonly scrollDownThreshold = 60;
  private readonly scrollUpThreshold = 20;

  @HostListener('window:scroll')
  onScroll() {
    if (typeof window === 'undefined') return;
    const y = window.scrollY;
    if (this.isScrolled) {
      if (y <= this.scrollUpThreshold) this.isScrolled = false;
    } else {
      if (y > this.scrollDownThreshold) this.isScrolled = true;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.mobileOpenCategoryKey = null;
  }

  mobileCatKey(cat: Category): string {
    return String(cat.slug ?? cat.id ?? cat.name ?? 'cat');
  }

  isMobileCatOpen(cat: Category): boolean {
    return this.mobileOpenCategoryKey === this.mobileCatKey(cat);
  }

  toggleMobileCat(cat: Category): void {
    const key = this.mobileCatKey(cat);
    this.mobileOpenCategoryKey = this.mobileOpenCategoryKey === key ? null : key;
  }

  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    if (this.searchOpen) {
      setTimeout(() => this.searchInputRef?.nativeElement?.focus(), 80);
    }
  }

  closeSearch() {
    this.searchOpen = false;
  }

  /** Go to Collections with search query (API uses search param from listing). */
  submitSearch() {
    const q = (this.searchDraft || '').trim();
    this.closeSearch();
    this.searchDraft = '';
    if (q) {
      this.router.navigate(['/collections'], { queryParams: { q } });
    } else {
      this.router.navigate(['/collections']);
    }
  }

  private loadCategories() {
    // Same flat list + parent map as home page — API tree=1 often omits nested children
    this.categoryService.list({ per_page: 200 }).subscribe({
      next: (res) => {
        const items = ((res as any)?.data ?? []) as Category[];
        const parentKey = (pid: unknown): string => {
          if (pid == null || pid === '') return '__root__';
          const n = Number(pid);
          if (!Number.isNaN(n) && n === 0) return '__root__';
          return String(pid);
        };
        const idKey = (id: unknown): string => String(id);

        const byParent = new Map<string, Category[]>();
        for (const c of items) {
          const pk = parentKey(c.parent_id);
          if (!byParent.has(pk)) byParent.set(pk, []);
          byParent.get(pk)!.push(c);
        }

        const roots = (byParent.get('__root__') || []).filter(c => c.is_active !== false);
        const sortCats = (a: Category, b: Category) => {
          const ao = a.sort_order ?? 0;
          const bo = b.sort_order ?? 0;
          if (ao !== bo) return ao - bo;
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        };

        this.headerCategories = roots
          .sort(sortCats)
          .map(c => ({
            ...c,
            children: (byParent.get(idKey(c.id)) || []).filter(ch => ch.is_active !== false).sort(sortCats),
          }));
      },
      error: () => {
        this.headerCategories = [];
      },
    });
  }
}
