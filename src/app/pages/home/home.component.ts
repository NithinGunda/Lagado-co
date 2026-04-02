import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductApiService } from '../../services/product-api.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { Router } from '@angular/router';
import { FeaturedProductsService } from '../../services/featured-products.service';
import { BuyTheLookService, Look } from '../../services/buy-the-look.service';
import { CarouselService, CarouselItem } from '../../services/carousel.service';
import { AppLoadingService } from '../../services/app-loading.service';
import { isProductInStock } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <!-- =============== HERO SECTION =============== -->
      <section class="hero-section" (mousemove)="onHeroMouseMove($event)" (touchstart)="onHeroTouchStart($event)" (touchend)="onHeroTouchEnd($event)" #heroSection>
        <div class="hero-slides">
          <div class="hero-slide" *ngFor="let slide of heroSlides; let i = index" [class.active]="i === activeSlide" [class.prev]="i === prevSlide">
            <ng-container *ngIf="slide.type !== 'video'; else heroVideo">
              <picture>
                <source [srcset]="slide.mobileImage || slide.image" media="(max-width: 768px)" />
                <img class="hero-banner-img" [src]="slide.image" [alt]="slide.alt" />
              </picture>
            </ng-container>
            <ng-template #heroVideo>
              <video class="hero-banner-img" [src]="slide.image" autoplay muted loop playsinline></video>
            </ng-template>
          </div>
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-gradient-mesh"></div>
        <div class="hero-shapes">
          <div class="shape shape-ring shape-1" [style.transform]="getShapeParallax(0.02)"></div>
          <div class="shape shape-dot shape-2" [style.transform]="getShapeParallax(-0.03)"></div>
          <div class="shape shape-diamond shape-3" [style.transform]="getShapeParallax(0.015)"></div>
          <div class="shape shape-ring shape-4" [style.transform]="getShapeParallax(-0.025)"></div>
          <div class="shape shape-line shape-5" [style.transform]="getShapeParallax(0.02)"></div>
          <div class="shape shape-dot shape-6" [style.transform]="getShapeParallax(-0.015)"></div>
          <div class="shape shape-cross shape-7" [style.transform]="getShapeParallax(0.03)"></div>
          <div class="shape shape-ring shape-8" [style.transform]="getShapeParallax(-0.02)"></div>
        </div>
        <div class="hero-orbs">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
        </div>
        <div class="hero-scanline"></div>
        <div class="hero-content">
          <div class="hero-cta-group" [class.visible]="heroAnimReady">
            <a routerLink="/collections" class="hero-cta hero-cta-primary" aria-label="Explore full collection — all products">
              <span class="cta-glow"></span>
              <span class="cta-bg"></span>
              <span class="cta-content">
                <span>Explore Collection</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
            </a>
        </div>
          <div class="hero-scroll-indicator" [class.visible]="heroAnimReady">
            <div class="scroll-mouse"><div class="scroll-wheel"></div></div>
          </div>
        </div>
        <button
          type="button"
          class="nav-btn nav-prev hero-nav-btn"
          (click)="prevHeroSlide()"
          [disabled]="heroSlides.length <= 1"
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button
          type="button"
          class="nav-btn nav-next hero-nav-btn"
          (click)="nextHeroSlide()"
          [disabled]="heroSlides.length <= 1"
          aria-label="Next slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
        <div class="hero-progress">
          <div class="hero-progress-track" *ngFor="let slide of heroSlides; let i = index" [class.active]="i === activeSlide" (click)="goToSlide(i)">
            <div class="hero-progress-fill" [class.animating]="i === activeSlide"></div>
          </div>
        </div>
      </section>

      <!-- =============== DEBUT INTRO (after hero) =============== -->
      <section class="debut-intro-section" aria-labelledby="debut-intro-heading">
        <div class="container">
          <div class="debut-intro-inner">
          <h2 id="debut-intro-heading" class="debut-intro-title">
            A Refined Metamorphosis of Timeless Silhouettes
          </h2>
          <p class="debut-intro-body">
            The debut collection from Legado and Co. introduces modern luxury menswear through precision tailoring and enduring design.
            Produced in carefully limited quantities per size as part of our commitment to craftsmanship.
          </p>
          <a routerLink="/mens" class="btn btn-primary debut-intro-cta" aria-label="Explore the First Edition collection">
            Explore the First Edition
          </a>
          </div>
        </div>
      </section>

      <!-- =============== FEATURED PRODUCTS =============== -->
      <section class="featured-section" id="featured-products" *ngIf="featuredProducts.length > 0">
        <div class="container">
          <div class="sec-header">
            <span class="sec-line"></span>
            <h2 class="sec-title">Featured Products</h2>
            <span class="sec-line"></span>
              </div>
          <p class="sec-sub">Hand-picked pieces that define the season. Premium quality, timeless design.</p>
          <div class="featured-carousel-wrapper" (touchstart)="onFeaturedTouchStart($event)" (touchend)="onFeaturedTouchEnd($event)" #featuredCarouselWrapper>
            <button class="nav-btn nav-prev" (click)="prevFeatured()" [disabled]="featuredOffset === 0" aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div class="featured-track-container" #featuredTrackContainer>
              <div class="featured-track" [style.transform]="'translateX(-' + featuredOffset * featuredCardWidth + 'px)'" [style.--featured-card-width.px]="getFeaturedCardWidthPx()">
                <div class="f-card" *ngFor="let product of featuredProducts" [routerLink]="['/product', product.id]">
                  <div class="f-card-img">
                    <img [src]="getProductImage(product)" [alt]="product.name" loading="lazy" />
                    <div class="f-card-img-fallback" [style.background]="getProductColor(product)"></div>
                    <div class="f-card-overlay">
                      <span class="f-card-quick">View Details</span>
            </div>
                    <span class="f-card-badge" *ngIf="product.badge">{{ product.badge }}</span>
                  </div>
                  <div class="f-card-info">
                    <span class="f-card-cat">{{ getProductCategoryName(product) | titlecase }}</span>
                    <h3 class="f-card-name">{{ product.name }}</h3>
                    <div class="f-card-price-row">
                      <span class="f-card-price">{{ formatPrice(product.price) }}</span>
                      <span class="f-card-original" *ngIf="product.originalPrice">{{ formatPrice(product.originalPrice) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button class="nav-btn nav-next" (click)="nextFeatured()" [disabled]="featuredOffset >= featuredProducts.length - featuredVisible" aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
          </div>
          <div class="featured-dots">
            <span *ngFor="let _ of getDotArray(); let i = index" class="dot" [class.active]="i === featuredOffset" (click)="featuredOffset = i"></span>
          </div>
        </div>
      </section>

      <!-- =============== CATEGORY HIGHLIGHTS =============== -->
      <section class="cat-section">
        <div class="container">
          <div class="sec-header">
            <span class="sec-line"></span>
            <h2 class="sec-title">Shop by Category</h2>
            <span class="sec-line"></span>
          </div>
          <!-- Mobile (≤768px): one category per view — same carousel pattern as Featured Products -->
          <div class="cat-carousel-mobile-only" *ngIf="topCategories.length > 0">
            <div
              class="featured-carousel-wrapper category-home-carousel"
              (touchstart)="onCategoryTouchStart($event)"
              (touchend)="onCategoryTouchEnd($event)"
            >
              <button
                type="button"
                class="nav-btn nav-prev"
                (click)="prevCategorySlide()"
                [disabled]="categoryOffset === 0"
                aria-label="Previous category"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div class="featured-track-container" #categoryTrackContainer>
                <div
                  class="featured-track category-featured-track"
                  [style.transform]="'translateX(-' + categoryOffset * categoryCardWidth + 'px)'"
                  [style.--featured-card-width.px]="getCategoryCardWidthPx()"
                >
                  <a
                    class="cat-card cat-card-carousel"
                    *ngFor="let cat of topCategories"
                    (click)="goToCategory(cat)"
                  >
                    <img *ngIf="cat.image_url" [src]="cat.image_url" [alt]="cat.name" loading="lazy" />
                    <div class="cat-overlay">
                      <div class="cat-label">
                        <span class="cat-tag">Collection</span>
                        <h3>{{ cat.name }}</h3>
                        <span class="cat-cta">
                          Explore
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </span>
                        <div class="cat-mobile-subcats-wrap" *ngIf="cat.children?.length" (click)="$event.stopPropagation()">
                          <button
                            type="button"
                            class="cat-mobile-subcats-toggle"
                            [class.open]="homeMobileSubcatsOpenKey === categorySubcatKey(cat)"
                            [attr.aria-expanded]="homeMobileSubcatsOpenKey === categorySubcatKey(cat)"
                            (click)="toggleHomeMobileSubcats(cat, $event)"
                          >
                            <span>Subcategories</span>
                            <svg class="cat-mobile-subcats-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                          <div class="cat-subcats cat-subcats-mobile-dropdown" *ngIf="homeMobileSubcatsOpenKey === categorySubcatKey(cat)">
                            <button
                              class="subcat-pill"
                              *ngFor="let sub of cat.children"
                              (click)="goToCategory(sub, $event)"
                            >
                              {{ sub.name }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
            </a>
          </div>
        </div>
              <button
                type="button"
                class="nav-btn nav-next"
                (click)="nextCategorySlide()"
                [disabled]="categoryOffset >= topCategories.length - categoryCarouselVisible"
                aria-label="Next category"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg>
              </button>
            </div>
            <div class="featured-dots category-carousel-dots">
              <span
                *ngFor="let _ of getCategoryDotArray(); let i = index"
                class="dot"
                [class.active]="i === categoryOffset"
                (click)="setCategoryCarouselOffset(i)"
                role="button"
                [attr.aria-label]="'Category ' + (i + 1)"
              ></span>
            </div>
          </div>

          <!-- Tablet / desktop: grid -->
          <div class="cat-scroll-wrap cat-desktop-grid-hide-mobile" *ngIf="topCategories.length > 0">
            <div class="cat-grid" [class.collage]="topCategories.length > 4" [class.compact-collage]="topCategories.length === 6 || topCategories.length === 7">
            <a
              class="cat-card"
              *ngFor="let cat of topCategories"
              (click)="goToCategory(cat)"
            >
              <img *ngIf="cat.image_url" [src]="cat.image_url" [alt]="cat.name" loading="lazy" />
              <div class="cat-overlay">
                <div class="cat-label">
                  <span class="cat-tag">Collection</span>
                  <h3>{{ cat.name }}</h3>
                  <span class="cat-cta">
                    Explore
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                  </span>
                  <div class="cat-subcats" *ngIf="cat.children?.length">
                    <button
                      class="subcat-pill"
                      *ngFor="let sub of cat.children"
                      (click)="goToCategory(sub, $event)"
                    >
                      {{ sub.name }}
                    </button>
                </div>
              </div>
                </div>
            </a>
              </div>
                </div>
              </div>
      </section>

      <!-- =============== BRAND STORY STRIP =============== -->
      <section class="story-section">
        <div class="story-inner">
          <div class="story-image-wrap">
            <img src="assets/ourstory.png" alt="Our Philosophy" loading="lazy" />
            <div class="story-accent"></div>
            </div>
          <div class="story-text">
            <span class="story-label">Our Philosophy</span>
            <h2 class="story-heading">Crafted With<br/><em>Purpose & Passion</em></h2>
            <p>At Legado & Co, we believe fashion is more than fabric — it's a statement of who you are. Every piece is designed with meticulous attention to detail, using premium materials sourced from the finest mills around the world.</p>
            <p>Our collections bridge the gap between timeless elegance and modern sophistication, creating garments that feel as exceptional as they look.</p>
            <a routerLink="/our-story" class="story-cta">
              <span>Read Our Philosophy</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </section>

      <!-- =============== TRUST / WHAT TO EXPECT =============== -->
      <section class="trust-section">
        <div class="container">
          <div class="trust-grid">
            <div class="trust-item">
              <div class="trust-icon">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--primary-color)" stroke-width="2"><rect x="3" y="14" width="26" height="18" rx="1"/><path d="M29 20h7l5 6v6H29V20z" stroke-linejoin="round"/><circle cx="12" cy="35" r="4"/><circle cx="36" cy="35" r="4"/></svg>
          </div>
              <h4>Free Shipping</h4>
              <p>Complimentary delivery on all orders above ₹5,000</p>
                </div>
            <div class="trust-item">
              <div class="trust-icon">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M9 18c0-5 4-9 9-9h12c5 0 9 4 9 9"/><path d="M39 30c0 5-4 9-9 9H18c-5 0-9-4-9-9"/><path d="M34 13l5 5-5 5"/><path d="M14 25l-5 5 5 5"/></svg>
              </div>
              <h4>Easy Returns</h4>
              <p>Hassle-free 30-day exchange & return policy</p>
            </div>
            <div class="trust-item">
              <div class="trust-icon">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--primary-color)" stroke-width="2"><path d="M24 4l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"/></svg>
              </div>
              <h4>Premium Quality</h4>
              <p>Handpicked fabrics with meticulous craftsmanship</p>
            </div>
            <div class="trust-item">
              <div class="trust-icon">
                <svg viewBox="0 0 48 48" fill="none" stroke="var(--primary-color)" stroke-width="2"><rect x="6" y="10" width="36" height="28" rx="1"/><path d="M6 20h36"/><circle cx="14" cy="30" r="3"/></svg>
              </div>
              <h4>Secure Payments</h4>
              <p>SSL encrypted transactions for your safety</p>
            </div>
          </div>
        </div>
      </section>

      <!-- =============== ON SALE =============== -->
      <section class="sale-section" *ngIf="saleProducts.length > 0">
        <div class="container">
          <div class="sec-header">
            <span class="sec-line accent-line"></span>
            <h2 class="sec-title sale-title">On Sale</h2>
            <span class="sec-line accent-line"></span>
                    </div>
          <div class="sale-scroll-wrap">
            <div class="sale-grid">
            <div class="s-card" *ngFor="let product of saleProducts" [routerLink]="['/product', product.id]">
              <div class="s-card-img">
                <img [src]="getProductImage(product)" [alt]="product.name" loading="lazy" />
                <div class="s-card-img-fallback" [style.background]="getProductColor(product)"></div>
                <span class="s-badge">Sale</span>
                <span class="s-discount" *ngIf="product.discount_percentage">-{{ product.discount_percentage }}%</span>
                  </div>
              <div class="s-card-info">
                <span class="s-cat">{{ getProductCategoryName(product) | titlecase }}</span>
                <h3 class="s-name">{{ product.name }}</h3>
                <div class="s-prices">
                  <span class="s-original">{{ formatPrice(product.original_price || product.price) }}</span>
                  <span class="s-current">{{ formatPrice(product.price) }}</span>
                </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
      </section>

      <!-- =============== BUY THE LOOK =============== -->
      <section class="look-section" *ngIf="curatedLooks.length > 0">
        <div class="container">
          <div class="sec-header">
            <span class="sec-line"></span>
            <h2 class="sec-title">Buy The Look</h2>
            <span class="sec-line"></span>
            </div>
          <p class="sec-sub">Get our curated collection — complete outfits styled by our creative team.</p>
          <div class="look-carousel" (touchstart)="onLookTouchStart($event)" (touchend)="onLookTouchEnd($event)">
            <div class="look-grid"
                 [class.two-items]="curatedLooks[currentLookIndex].products.length === 2"
                 [class.three-items]="curatedLooks[currentLookIndex].products.length >= 3">
              <div class="look-card"
                   *ngFor="let product of curatedLooks[currentLookIndex].products; let pi = index"
                   [class.hero]="pi === 0"
                   [routerLink]="['/product', product.id]">
                <img [src]="product.image" [alt]="product.name" loading="lazy" class="look-card-img" />
                <div class="look-card-overlay">
                  <h4>{{ product.name }}</h4>
                  <span>{{ formatPrice(product.price) }}</span>
                  <span class="look-shop-link">Shop Now</span>
            </div>
              </div>
            </div>
          </div>
          <div class="look-dots">
            <span *ngFor="let look of curatedLooks; let i = index" class="dot" [class.active]="i === currentLookIndex" (click)="currentLookIndex = i"></span>
          </div>
        </div>
      </section>

      <!-- =============== SPOTTED ON SOCIAL =============== -->
      <section class="social-section">
        <div class="container">
          <div class="sec-header">
            <span class="sec-line"></span>
            <h2 class="sec-title">Spotted On Social</h2>
            <span class="sec-line"></span>
          </div>
          <p class="sec-sub social-sec-sub">
            Share your style with us — tag <strong>&#64;legadoandco</strong>
            ·
            <a href="https://www.instagram.com/legadoandco/" target="_blank" rel="noopener noreferrer">Instagram</a>
          </p>
          <div class="social-grid" role="list">
            <a
              *ngFor="let spot of socialSpots"
              class="social-card"
              role="listitem"
              href="https://www.instagram.com/legadoandco/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="social-img-wrap">
                <img
                  class="social-img-el"
                  [src]="spot.src"
                  [alt]="spot.alt"
                  width="600"
                  height="600"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="social-hover" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="#fff" stroke="none"/></svg>
                <span>&#64;legadoandco</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- =============== NEWSLETTER CTA =============== -->
      <section class="newsletter-section">
        <div class="newsletter-inner">
          <div class="newsletter-text">
            <h2>Stay In The Loop</h2>
            <p>Be the first to know about new collections, exclusive offers, and styling tips.</p>
            </div>
          <div class="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button>Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .home-page {
      min-height: 100vh;
      font-family: var(--font-body, 'Lato', sans-serif);
    }

    /* ===== HERO (preserved) ===== */
    .hero-section {
      position: relative; width: 100%;
      min-height: 80vh;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-white); overflow: hidden;
    }
    .hero-slides { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
    .hero-slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 1.2s ease-in-out; transform: scale(1.05); }
    .hero-slide.active { opacity: 1; z-index: 1; transform: scale(1); transition: opacity 1.2s ease, transform 8s ease-out; }
    .hero-slide.prev { opacity: 0; z-index: 0; }
    .hero-banner-img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; }
    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      /* Removed dark gradient background to show raw carousel image */
      background: transparent;
    }
    .hero-gradient-mesh { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; background: radial-gradient(ellipse 600px 400px at 15% 80%, rgba(232,197,71,0.08) 0%, transparent 70%), radial-gradient(ellipse 500px 500px at 85% 20%, rgba(100,180,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 400px 300px at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%); animation: meshShift 12s ease-in-out infinite alternate; }
    @keyframes meshShift { 0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.7; } }
    .hero-shapes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 4; pointer-events: none; }
    .shape { position: absolute; opacity: 0; }
    .shape-ring { border: 1.5px solid rgba(255,255,255,0.12); border-radius: 50% !important; }
    .shape-dot { background: rgba(232,197,71,0.25); border-radius: 50% !important; }
    .shape-diamond { background: rgba(255,255,255,0.08); transform: rotate(45deg); }
    .shape-line { height: 1.5px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); }
    .shape-cross::before, .shape-cross::after { content: ''; position: absolute; background: rgba(255,255,255,0.1); }
    .shape-cross::before { width: 20px; height: 1.5px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    .shape-cross::after { width: 1.5px; height: 20px; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    .shape-1 { width: 80px; height: 80px; top: 12%; left: 8%; }
    .shape-2 { width: 8px; height: 8px; top: 25%; right: 15%; }
    .shape-3 { width: 20px; height: 20px; bottom: 30%; left: 12%; }
    .shape-4 { width: 50px; height: 50px; top: 18%; right: 8%; }
    .shape-5 { width: 120px; bottom: 25%; right: 10%; }
    .shape-6 { width: 6px; height: 6px; top: 60%; left: 20%; }
    .shape-7 { width: 20px; height: 20px; bottom: 40%; right: 25%; }
    .shape-8 { width: 35px; height: 35px; top: 55%; left: 5%; }
    .shape-1 { animation: shapeFadeIn 1.5s ease 0.3s forwards, shapeFloat1 18s ease-in-out infinite 1.8s; }
    .shape-2 { animation: shapeFadeIn 1.5s ease 0.6s forwards, shapePulse 4s ease-in-out infinite 2.1s; }
    .shape-3 { animation: shapeFadeIn 1.5s ease 0.9s forwards, shapeFloat2 15s ease-in-out infinite 2.4s; }
    .shape-4 { animation: shapeFadeIn 1.5s ease 0.4s forwards, shapeFloat1 20s ease-in-out infinite reverse 1.9s; }
    .shape-5 { animation: shapeFadeIn 1.5s ease 1.1s forwards, shimmerLine 6s ease-in-out infinite 2.6s; }
    .shape-6 { animation: shapeFadeIn 1.5s ease 0.7s forwards, shapePulse 5s ease-in-out infinite 2.2s; }
    .shape-7 { animation: shapeFadeIn 1.5s ease 1.3s forwards, shapeFloat2 22s ease-in-out infinite 2.8s; }
    .shape-8 { animation: shapeFadeIn 1.5s ease 0.5s forwards, shapeFloat1 16s ease-in-out infinite reverse 2s; }
    @keyframes shapeFadeIn { to { opacity: 1; } }
    @keyframes shapeFloat1 { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(15px, -20px) rotate(5deg); } 50% { transform: translate(-10px, -35px) rotate(-3deg); } 75% { transform: translate(20px, -15px) rotate(8deg); } }
    @keyframes shapeFloat2 { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(-20px, 15px); } 66% { transform: translate(15px, -10px); } }
    @keyframes shapePulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.8); opacity: 0.7; } }
    @keyframes shimmerLine { 0%, 100% { opacity: 0.15; transform: scaleX(0.6); } 50% { opacity: 0.4; transform: scaleX(1); } }
    .hero-orbs { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; }
    .orb { position: absolute; border-radius: 50% !important; filter: blur(60px); }
    .orb-1 { width: 300px; height: 300px; top: -5%; right: -5%; background: radial-gradient(circle, rgba(232,197,71,0.12), transparent 70%); animation: orbDrift1 20s ease-in-out infinite; }
    .orb-2 { width: 250px; height: 250px; bottom: 5%; left: -3%; background: radial-gradient(circle, rgba(100,160,255,0.1), transparent 70%); animation: orbDrift2 25s ease-in-out infinite; }
    .orb-3 { width: 180px; height: 180px; top: 40%; left: 50%; background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%); animation: orbDrift3 18s ease-in-out infinite; }
    @keyframes orbDrift1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-60px, 40px); } }
    @keyframes orbDrift2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, -30px); } }
    @keyframes orbDrift3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, 20px) scale(1.2); } }
    .hero-scanline { position: absolute; top: 0; left: 0; width: 100%; height: 2px; z-index: 5; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(232,197,71,0.15), transparent); animation: scanDown 8s linear infinite; }
    @keyframes scanDown { 0% { top: -2px; } 100% { top: 100%; } }
    .hero-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
      text-align: center;
      padding: 0 var(--spacing-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding-bottom: 72px;
    }
    .hero-badge { display: flex; align-items: center; gap: 16px; opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .hero-badge.visible { opacity: 1; transform: translateY(0); }
    .badge-line { width: 40px; height: 1px; background: rgba(255,255,255,0.4); }
    .badge-text { font-family: var(--font-body, 'Lato', sans-serif); font-size: 1.1rem; font-weight: 400; letter-spacing: 0.05em; color: rgba(255,255,255,0.85); }
    .hero-title { font-family: var(--font-body, 'Lato', sans-serif); font-size: clamp(2.8rem, 7vw, 5rem); font-weight: 700; line-height: 1.1; margin: 0; letter-spacing: -0.02em; text-shadow: 0 4px 30px rgba(0,0,0,0.3); }
    .title-line { display: block; overflow: hidden; }
    .title-word { display: inline-block; opacity: 0; transform: translateY(100%); transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .title-word.accent { color: #e8c547; }
    .hero-title.visible .title-line:nth-child(1) .title-word:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
    .hero-title.visible .title-line:nth-child(1) .title-word:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
    .hero-title.visible .title-line:nth-child(2) .title-word:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
    .hero-title.visible .title-line:nth-child(2) .title-word:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.85s; }
    .hero-subtitle { font-size: clamp(0.95rem, 1.5vw, 1.15rem); color: rgba(255,255,255,0.75); max-width: 560px; line-height: 1.7; opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1s; }
    .hero-subtitle.visible { opacity: 1; transform: translateY(0); }
    .hero-cta-group { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.2s; }
    .hero-cta-group.visible { opacity: 1; transform: translateY(0); }
    .hero-cta { position: relative; display: inline-flex; align-items: center; justify-content: center; padding: 16px 36px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; overflow: hidden; border: none; text-decoration: none; font-family: var(--font-body); transition: transform 0.3s, box-shadow 0.3s; box-sizing: border-box; color: inherit; }
    .hero-cta:hover { transform: translateY(-3px); }
    .hero-cta-primary { color: #fff; }
    .hero-cta-primary .cta-bg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--primary-color), #2a4d7a); z-index: 0; transition: opacity 0.3s; }
    .hero-cta-primary .cta-glow { position: absolute; inset: -2px; background: linear-gradient(135deg, rgba(232,197,71,0.3), rgba(100,180,255,0.2)); z-index: -1; filter: blur(8px); opacity: 0; transition: opacity 0.4s; }
    .hero-cta-primary:hover .cta-glow { opacity: 1; }
    .hero-cta-primary:hover { box-shadow: 0 8px 30px rgba(21,42,71,0.4); }
    .cta-content { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; }
    .cta-content svg { transition: transform 0.3s; }
    .hero-cta-primary:hover .cta-content svg { transform: translateX(4px); }
    .hero-cta-outline { color: rgba(255,255,255,0.9); border: 1.5px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.05); backdrop-filter: blur(6px); }
    .hero-cta-outline .cta-shimmer { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: left 0.6s; }
    .hero-cta-outline:hover .cta-shimmer { left: 100%; }
    .hero-cta-outline:hover { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.1); }
    .hero-scroll-indicator { opacity: 0; transform: translateY(20px); transition: all 0.8s ease 1.5s; margin-top: 0; order: -1; }
    .hero-scroll-indicator.visible { opacity: 0.6; transform: translateY(0); }
    .scroll-mouse { width: 24px; height: 38px; border: 2px solid rgba(255,255,255,0.5); border-radius: 12px !important; display: flex; justify-content: center; padding-top: 8px; }
    .scroll-wheel { width: 3px; height: 8px; background: rgba(255,255,255,0.7); border-radius: 2px !important; animation: scrollBounce 2s ease-in-out infinite; }
    @keyframes scrollBounce { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(8px); opacity: 0.3; } }
    /* Hero arrows: same as Featured; respect :disabled (do not override opacity when hidden) */
    .hero-section .hero-nav-btn:not(:disabled) {
      z-index: 25;
      opacity: 1;
      pointer-events: auto;
    }
    .hero-section .hero-nav-btn.nav-prev { left: 16px; }
    .hero-section .hero-nav-btn.nav-next { right: 16px; }
    .hero-progress { position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; gap: 8px; }
    .hero-progress-track { width: 48px; height: 3px; background: rgba(255,255,255,0.2); cursor: pointer; overflow: hidden; transition: background 0.3s; }
    .hero-progress-track.active { background: rgba(255,255,255,0.3); }
    .hero-progress-fill { width: 0; height: 100%; background: rgba(255,255,255,0.9); }
    .hero-progress-fill.animating { animation: progressFill 5s linear forwards; }
    @keyframes progressFill { from { width: 0; } to { width: 100%; } }

    /* ===== DEBUT INTRO (below hero) ===== */
    .debut-intro-section {
      padding: clamp(40px, 7vw, 80px) 0;
      background: var(--bg-cream, var(--secondary-color));
      border-bottom: 1px solid var(--border-color);
    }
    .debut-intro-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 720px;
      margin-left: auto;
      margin-right: auto;
    }
    .debut-intro-title {
      font-family: var(--font-body, 'Lato', sans-serif);
      font-size: clamp(1.35rem, 4.2vw, 2rem);
      font-weight: 600;
      line-height: 1.25;
      color: var(--text-dark);
      margin: 0 0 1rem;
      letter-spacing: 0.02em;
    }
    .debut-intro-body {
      font-family: var(--font-body, 'Lato', sans-serif);
      font-size: clamp(0.95rem, 2.4vw, 1.05rem);
      font-weight: 400;
      line-height: 1.75;
      color: var(--text-light);
      margin: 0 0 1.75rem;
      max-width: 62ch;
      padding: 0;
    }
    .debut-intro-cta {
      margin-top: 0;
      align-self: center;
    }

    /* ===== SHARED SECTION STYLES ===== */
    .sec-header {
      display: flex; align-items: center; justify-content: center; gap: 20px;
      margin-bottom: 12px;
    }
    .sec-line {
      flex: 1; max-width: 120px; height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-color), transparent);
    }
    .sec-line.accent-line { background: linear-gradient(90deg, transparent, #b91c1c, transparent); }
    .sec-title {
      font-family: var(--font-body, 'Lato', sans-serif); font-size: clamp(1.4rem, 2.5vw, 1.8rem);
      font-weight: 700; color: var(--text-dark);
      text-transform: uppercase; letter-spacing: 3px;
      margin: 0; padding: 0; text-align: center;
    }
    .sale-title { color: #b91c1c; }
    .sec-sub {
      text-align: center; color: var(--text-muted); font-size: 0.95rem;
      max-width: 520px; margin: 0 auto 28px; line-height: 1.6;
    }

    /* ===== FEATURED PRODUCTS ===== */
    .featured-section {
      padding: 60px 0 40px;
      background: #fff;
    }
    .featured-carousel-wrapper {
      position: relative;
      max-width: 1400px;
      margin: 0 auto;
    }
    .nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 999px !important;
      background: rgba(255,255,255,0.85);
      border: 1px solid rgba(0,0,0,0.06);
      color: var(--text-dark);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(15,23,42,0.25);
      opacity: 0;
      transition: opacity 0.25s ease, transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
      pointer-events: none;
      z-index: 5;
    }
    .nav-prev { left: 12px; }
    .nav-next { right: 12px; }
    .featured-carousel-wrapper:hover .nav-btn:not(:disabled) {
      opacity: 1;
      pointer-events: auto;
    }
    .nav-btn:hover:not(:disabled) {
      background: var(--primary-color);
      color: #fff;
      box-shadow: 0 12px 30px rgba(15,23,42,0.35);
      transform: translateY(-50%) scale(1.03);
    }
    .nav-btn:disabled {
      opacity: 0;
      pointer-events: none;
    }
    .featured-track-container {
      overflow: hidden;
      touch-action: pan-y;
    }
    .featured-track { display: flex; gap: 16px; transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); touch-action: pan-y; }
    .f-card {
      width: var(--featured-card-width, 260px);
      min-width: var(--featured-card-width, 260px);
      flex-shrink: 0;
      background: #fff; border: 1px solid var(--border-color);
      overflow: hidden; cursor: pointer; position: relative;
      transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .f-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
      border-color: transparent;
    }
    .f-card-img {
      position: relative; width: 100%; aspect-ratio: 1; min-height: 0; overflow: hidden;
    }
    .f-card-img img {
      width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
      transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      position: relative; z-index: 1;
    }
    .f-card-img-fallback { position: absolute; inset: 0; z-index: 0; }
    .f-card:hover .f-card-img img { transform: scale(1.08); }
    .f-card-overlay {
      position: absolute; inset: 0; z-index: 2;
      background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%);
      display: flex; align-items: flex-end; justify-content: center;
      padding-bottom: 20px; opacity: 0;
      transition: opacity 0.4s ease;
    }
    .f-card:hover .f-card-overlay { opacity: 1; }
    .f-card-quick {
      padding: 10px 24px; background: #fff; color: var(--text-dark);
      font-size: 11px; font-weight: 700; letter-spacing: 2px;
      text-transform: uppercase; transform: translateY(10px);
      transition: transform 0.3s ease;
    }
    .f-card:hover .f-card-quick { transform: translateY(0); }
    .f-card-badge {
      position: absolute; top: 12px; left: 12px; z-index: 3;
      padding: 5px 14px; background: var(--primary-color); color: #fff;
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .f-card-info { padding: 14px 16px; }
    .f-card-cat {
      display: block; font-size: 10px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 6px;
    }
    .f-card-name {
      font-size: 1rem; font-weight: 600; color: var(--text-dark);
      margin: 0 0 10px; line-height: 1.3;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      transition: color 0.2s;
    }
    .f-card:hover .f-card-name { color: var(--primary-color); }
    .f-card-price-row { display: flex; align-items: baseline; gap: 8px; }
    .f-card-price { font-size: 1.1rem; font-weight: 400; color: var(--text-dark); }
    .f-card-original { font-size: 0.8rem; color: var(--text-muted); text-decoration: line-through; }
    .featured-dots {
      display: flex; justify-content: center; gap: 8px; margin-top: 28px;
    }
    .dot {
      width: 8px; height: 8px; background: var(--border-color);
      border-radius: 50% !important; cursor: pointer;
      transition: all 0.3s;
    }
    .dot.active { background: var(--primary-color); width: 24px; border-radius: 4px !important; }

    /* ===== CATEGORY HIGHLIGHTS ===== */
    .cat-section {
      padding: 80px 0;
      background: var(--secondary-color);
      overflow: hidden;
    }
    .cat-section .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      box-sizing: border-box;
    }
    .cat-scroll-wrap {
      margin-top: 40px;
      width: 100%;
    }
    /* Mobile category carousel: hidden on larger screens */
    .cat-carousel-mobile-only {
      display: none;
      margin-top: 40px;
    }
    .cat-desktop-grid-hide-mobile {
      display: block;
    }
    .category-home-carousel {
      max-width: 1200px;
      margin: 0 auto;
    }
    .category-featured-track .cat-card-carousel {
      flex-shrink: 0;
      width: var(--featured-card-width, 100%);
      min-width: var(--featured-card-width, 100%);
      height: 360px;
      margin: 0;
    }
    .category-carousel-dots {
      margin-top: 20px;
    }
    .cat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      width: 100%;
      max-width: 1200px;
      margin: 40px auto 0;
      box-sizing: border-box;
    }
    .cat-card {
      position: relative; overflow: hidden;
      height: 520px; cursor: pointer;
      text-decoration: none; display: block;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      transition: box-shadow 0.4s ease, transform 0.3s ease;
      background: linear-gradient(145deg, #e8e4dc 0%, #d4cfc4 100%);
      min-width: 0;
      width: 100%;
    }
    .cat-card:hover {
      box-shadow: 0 16px 48px rgba(0,0,0,0.12);
      transform: translateY(-4px);
    }
    .cat-card-wide {
      grid-column: 1 / -1;
      height: 420px;
    }
    .cat-card img {
      width: 100%; height: 100%; object-fit: cover; object-position: center;
      transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .cat-card:hover img { transform: scale(1.06); }
    .cat-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(10,20,40,0.75) 0%, rgba(10,20,40,0.2) 55%, transparent 100%);
      display: flex; align-items: flex-end;
      padding: 28px 24px;
      transition: background 0.4s;
    }
    .cat-card:hover .cat-overlay {
      background: linear-gradient(to top, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.3) 55%, transparent 100%);
    }
    .cat-label { color: #fff; }
    .cat-tag {
      display: block; font-size: 10px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      color: rgba(255,255,255,0.65); margin-bottom: 6px;
    }
    .cat-label h3 {
      font-family: var(--font-body, 'Lato', sans-serif); font-size: 1.8rem;
      font-weight: 700; margin: 0 0 12px; color: #fff;
      text-shadow: 0 2px 12px rgba(0,0,0,0.2);
    }
    .cat-cta {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: #fff;
      opacity: 0; transform: translateY(8px);
      transition: all 0.3s ease;
    }
    .cat-card:hover .cat-cta {
      opacity: 1; transform: translateY(0);
    }
    .cat-cta svg { transition: transform 0.3s; }
    .cat-card:hover .cat-cta svg { transform: translateX(4px); }
    .cat-subcats {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .subcat-pill {
      padding: 4px 10px;
      font-size: 11px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.6);
      background: rgba(0,0,0,0.25);
      color: #fff;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .subcat-pill:hover {
      background: #fff;
      color: #111827;
      border-color: transparent;
    }

    /* Mobile category carousel only: subcategories behind a dropdown toggle */
    .cat-mobile-subcats-wrap {
      margin-top: 10px;
      width: 100%;
      max-width: 100%;
    }
    .cat-mobile-subcats-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #fff;
      background: rgba(0,0,0,0.38);
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 999px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s, border-color 0.2s;
    }
    .cat-mobile-subcats-toggle:hover,
    .cat-mobile-subcats-toggle.open {
      background: rgba(0,0,0,0.55);
      border-color: rgba(255,255,255,0.75);
    }
    .cat-mobile-subcats-chevron {
      transition: transform 0.25s ease;
      flex-shrink: 0;
      opacity: 0.95;
    }
    .cat-mobile-subcats-toggle.open .cat-mobile-subcats-chevron {
      transform: rotate(180deg);
    }
    .cat-subcats-mobile-dropdown {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      animation: mobileHomeSubcatFade 0.22s ease;
    }
    @keyframes mobileHomeSubcatFade {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Collage layout when more than 4 categories */
    .cat-grid.collage {
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: minmax(280px, 1fr);
      gap: 18px;
      width: 100%;
      max-width: 1200px;
    }
    .cat-grid.collage .cat-card {
      height: auto;
      min-height: 280px;
      min-width: 0;
    }
    .cat-grid.collage .cat-card:first-child {
      grid-column: span 2;
      grid-row: span 2;
      min-height: 100%;
      min-width: 0;
    }
    /* When 6 or 7 categories, keep all in one block: first card 2 cols 1 row, so row1=[1,1,2,3] row2=[4,5,6] or [4,5,6,7] */
    .cat-grid.collage.compact-collage .cat-card:first-child {
      grid-row: span 1;
    }
    .cat-grid.collage.compact-collage {
      grid-auto-rows: minmax(300px, 1fr);
    }
    .cat-grid.collage .cat-card:first-child .cat-label h3 {
      font-size: 2rem;
    }
    .cat-grid.collage .cat-card:first-child .cat-overlay {
      padding: 36px 32px;
    }

    /* ===== BRAND STORY ===== */
    .story-section {
      padding: 100px 0;
      background: #fff;
      overflow: hidden;
    }
    .story-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      align-items: center;
    }
    .story-image-wrap {
      position: relative;
    }
    .story-image-wrap img {
      width: 100%; height: 500px; object-fit: cover; display: block;
      position: relative; z-index: 1;
    }
    .story-accent {
      position: absolute; top: 24px; left: 24px; right: -24px; bottom: -24px;
      border: 2px solid var(--primary-color); z-index: 0;
      opacity: 0.3;
    }
    .story-text {
      padding: 20px 0;
    }
    .story-label {
      display: inline-block; font-size: 11px; font-weight: 700;
      letter-spacing: 3px; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 16px;
      position: relative; padding-left: 40px;
    }
    .story-label::before {
      content: ''; position: absolute; left: 0; top: 50%;
      width: 28px; height: 1px; background: var(--primary-color);
    }
    .story-heading {
      font-family: var(--font-body, 'Lato', sans-serif); font-size: clamp(1.8rem, 3vw, 2.5rem);
      font-weight: 700; color: var(--text-dark);
      line-height: 1.2; margin: 0 0 24px;
    }
    .story-heading em {
      font-style: italic; color: var(--primary-color);
    }
    .story-text p {
      color: var(--text-light); font-size: 0.95rem;
      line-height: 1.8; margin: 0 0 16px;
    }
    .story-cta {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 14px 32px; margin-top: 12px;
      border: 2px solid var(--primary-color); color: var(--primary-color);
      background: transparent; font-size: 12px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      text-decoration: none; font-family: var(--font-body);
      transition: all 0.3s ease;
    }
    .story-cta:hover {
      background: var(--primary-color); color: #fff;
    }
    .story-cta svg { transition: transform 0.3s; }
    .story-cta:hover svg { transform: translateX(4px); }

    /* ===== TRUST SECTION ===== */
    .trust-section {
      padding: 60px 0;
      background: var(--secondary-color);
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }
    .trust-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 32px; max-width: 1100px; margin: 0 auto;
      text-align: center;
    }
    .trust-item {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 24px 16px;
      transition: transform 0.3s ease;
    }
    .trust-item:hover { transform: translateY(-4px); }
    .trust-icon {
      width: 56px; height: 56px;
    }
    .trust-icon svg { width: 100%; height: 100%; }
    .trust-item h4 {
      font-family: var(--font-body, 'Lato', sans-serif);
      font-size: 0.95rem; font-weight: 700; color: var(--text-dark);
      margin: 0; letter-spacing: 0.5px;
    }
    .trust-item p {
      font-size: 0.82rem; color: var(--text-muted);
      line-height: 1.5; margin: 0; max-width: 200px;
    }

    /* ===== SALE SECTION ===== */
    .sale-section {
      padding: 80px 0;
      background: #fff;
    }
    .sale-scroll-wrap {
      margin-top: 40px;
      width: 100%;
    }
    .sale-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 16px; max-width: 1400px; margin: 40px auto 0;
    }
    .s-card {
      overflow: hidden; cursor: pointer; position: relative;
      border: 1px solid var(--border-color); background: #fff;
      transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .s-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
      border-color: transparent;
    }
    .s-card-img {
      position: relative; width: 100%; aspect-ratio: 3/4; overflow: hidden;
    }
    .s-card-img img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.6s ease; position: relative; z-index: 1;
    }
    .s-card-img-fallback { position: absolute; inset: 0; z-index: 0; }
    .s-card:hover .s-card-img img { transform: scale(1.08); }
    .s-badge {
      position: absolute; top: 12px; left: 12px; z-index: 3;
      padding: 5px 14px; background: #b91c1c; color: #fff;
      font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .s-discount {
      position: absolute; top: 12px; right: 12px; z-index: 3;
      padding: 5px 10px; background: #fff; color: #b91c1c;
      font-size: 11px; font-weight: 800;
    }
    .s-card-info { padding: 18px; }
    .s-cat {
      display: block; font-size: 10px; font-weight: 700;
      letter-spacing: 2px; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 4px;
    }
    .s-name {
      font-size: 0.95rem; font-weight: 600; color: var(--text-dark);
      margin: 0 0 10px; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .s-prices { display: flex; align-items: baseline; gap: 8px; }
    .s-original { font-size: 0.82rem; color: var(--text-muted); text-decoration: line-through; }
    .s-current { font-size: 1.1rem; font-weight: 400; color: #b91c1c; }

    /* ===== BUY THE LOOK ===== */
    .look-section {
      padding: 80px 0;
      background: var(--secondary-color);
    }
    .look-carousel {
      display: flex; align-items: center; gap: 16px;
      max-width: 1200px; margin: 0 auto;
      touch-action: pan-y;
    }
    .look-grid {
      flex: 1; display: grid; gap: 4px; height: 480px;
    }
    .look-grid.two-items {
      grid-template-columns: 1fr 1fr;
    }
    .look-grid.three-items {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
    }
    .look-grid.three-items .hero {
      grid-row: 1 / 3;
    }
    .look-card {
      position: relative; overflow: hidden; cursor: pointer;
      text-decoration: none;
    }
    .look-card-img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.5s ease;
    }
    .look-card:hover .look-card-img {
      transform: scale(1.04);
    }
    .look-card-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.65));
      padding: 40px 20px 20px; color: #fff;
      transition: padding-bottom 0.3s ease;
    }
    .look-card:hover .look-card-overlay {
      padding-bottom: 26px;
    }
    .look-card-overlay h4 {
      margin: 0 0 4px; font-size: 1rem; font-weight: 700;
      letter-spacing: 0.3px;
    }
    .look-card-overlay span {
      display: block; font-size: 0.95rem; font-weight: 400;
    }
    .look-shop-link {
      font-size: 0.75rem !important; font-weight: 600 !important;
      letter-spacing: 1.5px; text-transform: uppercase;
      opacity: 0; transform: translateY(8px);
      transition: all 0.3s ease; margin-top: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.5);
      display: inline-block !important; padding-bottom: 2px;
    }
    .look-card:hover .look-shop-link {
      opacity: 1; transform: translateY(0);
    }
    .look-dots {
      display: flex; justify-content: center; gap: 8px; margin-top: 24px;
    }

    /* ===== SPOTTED ON SOCIAL — uniform square tiles, responsive grid ===== */
    .social-section {
      padding: clamp(48px, 8vw, 80px) 0;
      background: #fff;
    }
    .social-sec-sub a {
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
    }
    .social-sec-sub a:hover { text-decoration: underline; }
    .social-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: clamp(10px, 2vw, 18px);
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    .social-section a.social-card {
      display: block;
      text-decoration: none;
      color: inherit;
      border-radius: 10px;
      outline: none;
    }
    .social-card:focus-visible {
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.35);
    }
    /* Same width × height per cell (square); image fills with cover */
    .social-card {
      position: relative;
      overflow: hidden;
      aspect-ratio: 1 / 1;
      width: 100%;
      min-width: 0;
      cursor: pointer;
      background: var(--secondary-color, #f5f1e8);
    }
    .social-img-wrap {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .social-img-el {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      transition: transform 0.45s ease;
    }
    .social-card:hover .social-img-el,
    .social-card:focus-visible .social-img-el {
      transform: scale(1.06);
    }
    .social-hover {
      position: absolute;
      inset: 0;
      background: rgba(10, 20, 40, 0.58);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #fff;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .social-card:hover .social-hover,
    .social-card:focus-visible .social-hover {
      opacity: 1;
    }
    .social-hover span {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* ===== NEWSLETTER ===== */
    .newsletter-section {
      padding: 80px 0;
      background: var(--primary-color);
      color: #fff;
    }
    .newsletter-inner {
      max-width: 700px; margin: 0 auto;
      text-align: center; padding: 0 var(--spacing-md);
    }
    .newsletter-text h2 {
      font-family: var(--font-body, 'Lato', sans-serif);
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700; color: #fff; margin: 0 0 10px;
    }
    .newsletter-text p {
      color: rgba(255,255,255,0.7); font-size: 0.95rem;
      margin: 0 0 32px; line-height: 1.6;
    }
    .newsletter-form {
      display: flex; gap: 0; max-width: 460px; margin: 0 auto;
    }
    .newsletter-form input {
      flex: 1; padding: 14px 20px;
      border: 1.5px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.08);
      color: #fff; font-size: 14px;
      font-family: var(--font-body);
      outline: none;
      transition: border-color 0.3s;
    }
    .newsletter-form input::placeholder { color: rgba(255,255,255,0.4); }
    .newsletter-form input:focus { border-color: rgba(255,255,255,0.5); }
    .newsletter-form button {
      padding: 14px 28px; background: #fff;
      color: var(--primary-color); border: none;
      font-size: 12px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      cursor: pointer; font-family: var(--font-body);
      transition: all 0.3s;
    }
    .newsletter-form button:hover {
      background: var(--secondary-color);
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 1200px) {
      .sale-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 968px) {
      .hero-section { min-height: 75vh; }
      .hero-content { padding: 0 var(--spacing-md); }
      .hero-title { font-size: clamp(2.2rem, 6vw, 3.5rem); }
      .hero-section .hero-nav-btn { width: 42px; height: 42px; }
      .hero-section .hero-nav-btn.nav-prev { left: 10px; }
      .hero-section .hero-nav-btn.nav-next { right: 10px; }
      .orb-1 { width: 200px; height: 200px; }
      .orb-2 { width: 150px; height: 150px; }
      .sale-grid { grid-template-columns: repeat(2, 1fr); }
      .cat-grid { grid-template-columns: 1fr; }
      .cat-grid.collage {
        grid-template-columns: 1fr 1fr;
      }
      .cat-grid.collage .cat-card:first-child {
        grid-column: span 2;
        grid-row: span 1;
      }
      .cat-card { height: 400px; }
      .cat-grid.collage .cat-card { min-height: 260px; }
      .cat-card-wide { height: 340px; }
      .story-inner { grid-template-columns: 1fr; gap: 40px; }
      .story-image-wrap img { height: 360px; }
      .story-accent { display: none; }
      .trust-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
      .look-grid { height: 380px; }
      .social-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    }

    @media (max-width: 768px) {
      .hero-section { width: 80%; margin-left: auto; margin-right: auto; border-radius: 12px; overflow: hidden; }
      /* Hero mobile: image → button (above dots) → dots at very bottom; no overlap */
      .hero-content {
        bottom: 72px;
        padding-bottom: 24px;
        gap: 12px;
      }
      .hero-progress {
        bottom: 0;
        padding-bottom: 20px;
      }
      .featured-carousel-wrapper .nav-btn:not(:disabled),
      .category-home-carousel .nav-btn:not(:disabled),
      .hero-section .hero-nav-btn:not(:disabled) { opacity: 1; pointer-events: auto; }
      /* Shop by Category: carousel (1 per slide) like Featured — not horizontal scroll */
      .cat-carousel-mobile-only { display: block; }
      .cat-desktop-grid-hide-mobile { display: none !important; }
      .sale-scroll-wrap {
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        margin-left: calc(-1 * var(--spacing-md));
        margin-right: calc(-1 * var(--spacing-md));
        padding-left: var(--spacing-md);
        padding-right: var(--spacing-md);
      }
      .sale-scroll-wrap::-webkit-scrollbar { display: none; }
      .sale-grid {
        display: flex;
        flex-wrap: nowrap;
        grid-template-columns: unset;
        gap: 16px;
        width: max-content;
        margin: 0;
      }
      .s-card {
        min-width: 260px;
        max-width: 260px;
        flex-shrink: 0;
        scroll-snap-align: start;
      }
      .cat-label h3 { font-size: 1.3rem; }
      .newsletter-form { flex-direction: column; }
      .newsletter-form input, .newsletter-form button { width: 100%; }
      .social-section { padding: 48px 0; }
      .social-grid { gap: 12px; }
    }

    @media (max-width: 480px) {
      .hero-section { width: 80%; margin-left: auto; margin-right: auto; min-height: 70vh; min-height: 70svh; border-radius: 12px; overflow: hidden; }
      .hero-content { padding: 0 var(--spacing-sm) 24px; }
      .hero-title { font-size: clamp(2rem, 10vw, 2.8rem); }
      .hero-cta-group { flex-direction: column; width: 100%; }
      .hero-cta { width: 100%; }
      .hero-cta-primary .cta-content, .hero-cta-outline .cta-content { width: 100%; justify-content: center; }
      .hero-section .hero-nav-btn { width: 40px; height: 40px; }
      .hero-section .hero-nav-btn.nav-prev { left: 6px; }
      .hero-section .hero-nav-btn.nav-next { right: 6px; }
      .hero-progress-track { width: 32px; }
      .hero-shapes { display: none; }
      .hero-scroll-indicator { display: none; }
      .category-featured-track .cat-card-carousel { height: 300px; }
      .s-card { min-width: 220px; max-width: 220px; }
      .trust-grid { grid-template-columns: 1fr; }
      .look-grid { height: 280px; }
      .look-carousel { gap: 0; }
      .sec-title { font-size: 1.2rem; letter-spacing: 2px; }
      .social-section { padding: 40px 0; }
      .social-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('featuredTrackContainer') featuredTrackContainer!: ElementRef;
  @ViewChild('categoryTrackContainer') categoryTrackContainer?: ElementRef<HTMLElement>;

  heroAnimReady = false;
  private heroMouseX = 0.5;
  private heroMouseY = 0.5;

  featuredProducts: any[] = [];
  saleProducts: any[] = [];

  featuredOffset = 0;
  featuredVisible = 4;
  featuredCardWidth = 0;
  private featuredAutoInterval: any;

  heroSlides: { image: string; mobileImage?: string; alt: string; type: 'image' | 'video' }[] = [];
  activeSlide = 0;
  prevSlide = -1;
  private heroInterval: any;
  private heroTouchStartX = 0;
  private featuredTouchStartX = 0;
  private categoryTouchStartX = 0;
  private lookTouchStartX = 0;

  /** Shop by Category — mobile carousel (≤768px), same mechanics as featured */
  categoryOffset = 0;
  categoryCardWidth = 0;
  readonly categoryCarouselVisible = 1;
  currentLookIndex = 0;
  curatedLooks: any[] = [];

  /** Spotted on Social — assets/spotted_1.jpeg … spotted_4.jpeg (square grid, object-fit: cover) */
  readonly socialSpots: { src: string; alt: string }[] = [
    { src: 'assets/spotted_1.jpeg', alt: 'Legado & Co on Instagram — community style 1' },
    { src: 'assets/spotted_2.jpeg', alt: 'Legado & Co on Instagram — community style 2' },
    { src: 'assets/spotted_3.jpeg', alt: 'Legado & Co on Instagram — community style 3' },
    { src: 'assets/spotted_4.jpeg', alt: 'Legado & Co on Instagram — community style 4' },
  ];

  categories: Category[] = [];
  topCategories: (Category & { children: Category[] })[] = [];
  /** Mobile category carousel: which card has subcategories expanded */
  homeMobileSubcatsOpenKey: string | null = null;
  private homePendingLoads = 0;

  constructor(
    private productService: ProductService,
    private productApi: ProductApiService,
    private categoryService: CategoryService,
    private featuredService: FeaturedProductsService,
    private lookService: BuyTheLookService,
    private carouselService: CarouselService,
    private router: Router,
    private appLoading: AppLoadingService
  ) {}

  ngOnInit() {
    // Track all home API loads; loader stays until every one completes (success or error)
    this.homePendingLoads = 5; // hero, featured, sale, categories, looks
    this.appLoading.setLoading('home', true);

    this.loadHeroSlides();
    this.loadFeaturedProducts();
    this.loadSaleProducts();
    this.loadCategories();
    this.loadLooksFromApi();
    this.startHeroAutoSlide();
    this.calcFeaturedLayout();
    this.startFeaturedAuto();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }
  }

  private markHomeLoadDone() {
    if (this.homePendingLoads > 0) {
      this.homePendingLoads--;
      if (this.homePendingLoads === 0) {
        this.appLoading.setLoading('home', false);
      }
    }
  }

  loadCategories() {
    this.categoryService.list({ per_page: 200 }).subscribe({
      next: (res) => {
        const items = (res as any)?.data ?? [];
        this.categories = items;
        const map = new Map<number | string | null, Category[]>();
        for (const c of items) {
          const pid = (c.parent_id ?? null) as any;
          if (!map.has(pid)) map.set(pid, []);
          map.get(pid)!.push(c);
        }
        const roots = map.get(null) || [];
        this.topCategories = roots.map(root => ({
          ...root,
          children: map.get(root.id as any) || []
        }));
        this.categoryOffset = 0;
        this.homeMobileSubcatsOpenKey = null;
        setTimeout(() => this.calcCategoryCarouselLayout(), 0);
        this.markHomeLoadDone();
      },
      error: () => {
        this.categories = [];
        this.topCategories = [];
        this.markHomeLoadDone();
      }
    });
  }

  goToCategory(cat: Category, event?: Event) {
    if (event) event.stopPropagation();
    this.router.navigate(['/collections'], {
      queryParams: { category: cat.slug || cat.id }
    });
  }

  categorySubcatKey(cat: Category): string {
    return String(cat.slug ?? cat.id ?? cat.name ?? '');
  }

  toggleHomeMobileSubcats(cat: Category, event: Event): void {
    event.stopPropagation();
    const k = this.categorySubcatKey(cat);
    this.homeMobileSubcatsOpenKey = this.homeMobileSubcatsOpenKey === k ? null : k;
  }

  setCategoryCarouselOffset(i: number): void {
    this.categoryOffset = i;
    this.homeMobileSubcatsOpenKey = null;
  }

  ngAfterViewInit() {
    setTimeout(() => this.heroAnimReady = true, 200);
    setTimeout(() => {
      this.calcFeaturedLayout();
      this.calcCategoryCarouselLayout();
    }, 100);
  }

  ngOnDestroy() {
    this.stopHeroAutoSlide();
    this.stopFeaturedAuto();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
  }

  onHeroMouseMove(e: MouseEvent) {
    if (typeof window === 'undefined') return;
    this.heroMouseX = e.clientX / window.innerWidth;
    this.heroMouseY = e.clientY / window.innerHeight;
  }

  getShapeParallax(factor: number): string {
    const x = (this.heroMouseX - 0.5) * 100 * factor;
    const y = (this.heroMouseY - 0.5) * 100 * factor;
    return `translate(${x}px, ${y}px)`;
  }

  private onResize = () => {
    this.calcFeaturedLayout();
    this.calcCategoryCarouselLayout();
  };

  getFeaturedCardWidthPx(): number {
    const gap = 16;
    const w = this.featuredCardWidth - gap;
    return w > 0 ? w : 260;
  }

  calcFeaturedLayout() {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w <= 768) { this.featuredVisible = 1; }
    else if (w <= 968) { this.featuredVisible = 2; }
    else if (w <= 1200) { this.featuredVisible = 3; }
    else { this.featuredVisible = 4; }
    const gap = 16;
    let containerW: number;
    const el = this.featuredTrackContainer?.nativeElement;
    if (el && typeof el.getBoundingClientRect === 'function') {
      containerW = el.clientWidth || Math.min(1400, w - 48);
    } else {
      containerW = Math.min(1400, w - 48);
    }
    if (containerW <= 0) containerW = Math.min(1400, w - 48);
    this.featuredCardWidth = (containerW + gap) / this.featuredVisible;
    if (this.featuredOffset > this.featuredProducts.length - this.featuredVisible) {
      this.featuredOffset = Math.max(0, this.featuredProducts.length - this.featuredVisible);
    }
  }

  getCategoryCardWidthPx(): number {
    const gap = 16;
    const w = this.categoryCardWidth - gap;
    return w > 0 ? w : 300;
  }

  calcCategoryCarouselLayout() {
    if (typeof window === 'undefined') return;
    if (window.innerWidth > 768) {
      this.categoryOffset = Math.min(
        this.categoryOffset,
        Math.max(0, this.topCategories.length - this.categoryCarouselVisible)
      );
      return;
    }
    const gap = 16;
    let containerW: number;
    const el = this.categoryTrackContainer?.nativeElement;
    if (el && typeof el.getBoundingClientRect === 'function') {
      containerW = el.clientWidth || Math.min(1200, window.innerWidth - 32);
    } else {
      containerW = Math.min(1200, window.innerWidth - 32);
    }
    if (containerW <= 0) containerW = Math.min(1200, window.innerWidth - 32);
    this.categoryCardWidth = (containerW + gap) / this.categoryCarouselVisible;
    if (this.categoryOffset > this.topCategories.length - this.categoryCarouselVisible) {
      this.categoryOffset = Math.max(0, this.topCategories.length - this.categoryCarouselVisible);
    }
  }

  getCategoryDotArray(): any[] {
    const total = Math.max(0, this.topCategories.length - this.categoryCarouselVisible + 1);
    return new Array(total);
  }

  prevCategorySlide() {
    if (this.categoryOffset > 0) {
      this.categoryOffset--;
      this.homeMobileSubcatsOpenKey = null;
    }
  }

  nextCategorySlide() {
    if (this.categoryOffset < this.topCategories.length - this.categoryCarouselVisible) {
      this.categoryOffset++;
    } else {
      this.categoryOffset = 0;
    }
    this.homeMobileSubcatsOpenKey = null;
  }

  onCategoryTouchStart(e: TouchEvent) {
    if (e.changedTouches?.length) this.categoryTouchStartX = e.changedTouches[0].clientX;
  }

  onCategoryTouchEnd(e: TouchEvent) {
    if (!e.changedTouches?.length || !this.topCategories.length) return;
    if (typeof window !== 'undefined' && window.innerWidth > 768) return;
    const dx = e.changedTouches[0].clientX - this.categoryTouchStartX;
    if (dx > 50) this.prevCategorySlide();
    else if (dx < -50) this.nextCategorySlide();
  }

  getDotArray(): any[] {
    const total = Math.max(0, this.featuredProducts.length - this.featuredVisible + 1);
    return new Array(total);
  }

  prevFeatured() {
    if (this.featuredOffset > 0) this.featuredOffset--;
    this.restartFeaturedAuto();
  }

  nextFeatured() {
    if (this.featuredOffset < this.featuredProducts.length - this.featuredVisible) {
      this.featuredOffset++;
    } else {
      this.featuredOffset = 0;
    }
    this.restartFeaturedAuto();
  }

  private startFeaturedAuto() {
    this.featuredAutoInterval = setInterval(() => this.nextFeatured(), 4000);
  }
  private stopFeaturedAuto() {
    if (this.featuredAutoInterval) clearInterval(this.featuredAutoInterval);
  }
  private restartFeaturedAuto() {
    this.stopFeaturedAuto(); this.startFeaturedAuto();
  }

  startHeroAutoSlide() {
    if (!this.heroSlides || this.heroSlides.length <= 1) return;
    this.heroInterval = setInterval(() => this.nextHeroSlide(), 5000);
  }
  stopHeroAutoSlide() {
    if (this.heroInterval) clearInterval(this.heroInterval);
    }
  nextHeroSlide() {
    if (!this.heroSlides || this.heroSlides.length === 0) return;
    this.prevSlide = this.activeSlide;
    this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
    this.resetHeroAutoSlide();
  }
  prevHeroSlide() {
    if (!this.heroSlides || this.heroSlides.length === 0) return;
    this.prevSlide = this.activeSlide;
    this.activeSlide = (this.activeSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.resetHeroAutoSlide();
  }
  goToSlide(index: number) {
    if (index === this.activeSlide) return;
    this.prevSlide = this.activeSlide;
    this.activeSlide = index;
    this.resetHeroAutoSlide();
  }
  private resetHeroAutoSlide() {
    this.stopHeroAutoSlide(); this.startHeroAutoSlide();
  }

  onHeroTouchStart(e: TouchEvent) {
    if (e.changedTouches?.length) this.heroTouchStartX = e.changedTouches[0].clientX;
  }
  onHeroTouchEnd(e: TouchEvent) {
    if (!e.changedTouches?.length || this.heroSlides.length <= 1) return;
    const dx = e.changedTouches[0].clientX - this.heroTouchStartX;
    if (dx > 50) this.prevHeroSlide();
    else if (dx < -50) this.nextHeroSlide();
  }

  onFeaturedTouchStart(e: TouchEvent) {
    if (e.changedTouches?.length) this.featuredTouchStartX = e.changedTouches[0].clientX;
  }
  onFeaturedTouchEnd(e: TouchEvent) {
    if (!e.changedTouches?.length) return;
    const dx = e.changedTouches[0].clientX - this.featuredTouchStartX;
    if (dx > 50) this.prevFeatured();
    else if (dx < -50) this.nextFeatured();
  }

  onLookTouchStart(e: TouchEvent) {
    if (e.changedTouches?.length) this.lookTouchStartX = e.changedTouches[0].clientX;
  }
  onLookTouchEnd(e: TouchEvent) {
    if (!e.changedTouches?.length || !this.curatedLooks.length) return;
    const dx = e.changedTouches[0].clientX - this.lookTouchStartX;
    if (dx > 50) this.prevLook();
    else if (dx < -50) this.nextLook();
  }

  loadHeroSlides() {
    this.carouselService.list().subscribe({
      next: (items) => {
        const active = items.filter(i => i.is_active !== false && i.image_url);
        if (active.length > 0) {
          active.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          this.heroSlides = active.map(i => ({
            image: i.image_url!,
            mobileImage: (i as any).mobile_image_url || i.image_url!,
            alt: i.title || 'Legado & Co',
            type: (i.media_type === 'video' ? 'video' : 'image') as 'image' | 'video'
          }));
          this.activeSlide = 0;
          this.prevSlide = -1;
        }
        this.markHomeLoadDone();
      },
      error: () => { this.markHomeLoadDone(); }
    });
  }

  loadFeaturedProducts() {
    this.featuredService.list().subscribe({
      next: (items: any[]) => {
        const apiProducts = items || [];
        if (apiProducts.length > 0) {
          // latest featured first (backend already orders by updated_at desc, but ensure)
          this.featuredProducts = [...apiProducts]
            .filter(isProductInStock)
            .sort((a, b) => {
            const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
            const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
            return bTime - aTime;
          });
        } else {
          this.featuredProducts = [];
        }
        this.calcFeaturedLayout();
        setTimeout(() => this.calcFeaturedLayout(), 80);
        this.markHomeLoadDone();
      },
      error: () => {
        this.featuredProducts = [];
        this.calcFeaturedLayout();
        setTimeout(() => this.calcFeaturedLayout(), 80);
        this.markHomeLoadDone();
      }
    });
  }

  loadSaleProducts() {
    this.productApi.list({ is_on_sale: true, per_page: 50 }).subscribe({
      next: (res: any) => {
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        const mapped = (list.length > 0 ? list : []).map((p: any) => {
          const price = Number(p.price ?? 0);
          const orig = Number(p.original_price ?? p.originalPrice ?? price);
          let discountPct = p.discount_percentage;
          if (discountPct == null && orig > 0 && price < orig) {
            discountPct = Math.round(((orig - price) / orig) * 100);
          }
          return {
            ...p,
            id: p.id,
            name: p.name,
            price,
            original_price: orig,
            originalPrice: orig,
            discount_percentage: discountPct,
            category: p.category?.name ?? p.category,
            created_at: p.created_at
          };
        });
        const byDate = (a: any, b: any) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        };
        this.saleProducts = [...mapped].filter(isProductInStock).sort(byDate).slice(0, 6);
        this.markHomeLoadDone();
      },
      error: () => {
    const allProducts = this.productService.getAllProducts();
        const filtered = allProducts.filter((p: any) => p.is_on_sale || (p.originalPrice && p.price < p.originalPrice));
        const byDate = (a: any, b: any) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        };
        this.saleProducts = [...filtered].filter(isProductInStock).sort(byDate).slice(0, 6).map((p: any) => {
      if (!p.discount_percentage && p.originalPrice) {
            p.discount_percentage = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
      }
          if (!p.original_price && p.originalPrice) p.original_price = p.originalPrice;
      return p;
        });
        this.markHomeLoadDone();
      }
    });
  }

  loadLooksFromApi() {
    this.lookService.list().subscribe({
      next: (looks) => {
        if (looks && looks.length > 0) {
          this.curatedLooks = looks
            .map(l => ({
              id: l.id,
              products: (l.products || [])
                .filter((p: any) => isProductInStock(p))
                .map(p => ({
                  id: p.product_id || p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image_url || ''
                }))
            }))
            .filter(look => look.products.length > 0);
          this.currentLookIndex = 0;
        }
        this.markHomeLoadDone();
      },
      error: () => { this.markHomeLoadDone(); }
    });
  }

  prevLook() {
    if (this.currentLookIndex > 0) this.currentLookIndex--;
    }
  nextLook() {
    if (this.currentLookIndex < this.curatedLooks.length - 1) this.currentLookIndex++;
  }

  formatPrice(price: number): string {
    return `₹${price.toLocaleString()}/-`;
  }

  getProductImage(product: any): string {
    // 1) API-provided full URLs (featured/products endpoints)
    if (product.image_url) return product.image_url;
    if (Array.isArray(product.image_urls) && product.image_urls.length) {
      return product.image_urls[0];
    }

    // 2) Local seed data where images is an array of asset paths
    if (Array.isArray(product.images) && product.images.length) {
      const first = product.images[0];
      if (typeof first === 'string') {
        return first;
      }
      // 3) Fallback: images as objects with "path"
      if (first && typeof first.path === 'string') {
        return first.path;
      }
    }

    return '';
  }

  /** Returns category as string for display (API may return object or string). */
  getProductCategoryName(product: any): string {
    const c = product?.category;
    if (c == null) return '';
    if (typeof c === 'string') return c;
    return (c.name ?? c.title ?? '') || '';
  }

  getProductColor(product: any): string {
    const colors: { [key: string]: string } = {
      'mens': 'linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%)',
      'womens': 'linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%)',
      'collections': 'linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%)'
    };
    const cat = product?.category;
    const key = typeof cat === 'string' ? cat : (cat?.slug ?? cat?.name ?? '');
    return colors[String(key).toLowerCase()] || colors['collections'];
  }
}
