import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductListingComponent } from '../../components/product-listing/product-listing.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductListingComponent],
  template: `
    <div class="home-page">
      <!-- Hero Carousel -->
      <section class="hero-section">
        <div class="hero-slides">
          <div class="hero-slide" *ngFor="let slide of heroSlides; let i = index" [class.active]="i === activeSlide" [class.prev]="i === prevSlide">
               <video class="bg-video" autoplay muted loop playsinline>
            <source src="assets/login_video_1.mp4" type="video/mp4" />
          </video>
          </div>
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <p class="hero-tagline">Legado & Co</p>
          <h1 class="hero-title">Timeless Style,<br>Quiet Confidence</h1>
          <p class="hero-subtitle">Discover our curated collection of premium fashion</p>
          <button class="hero-cta" (click)="scrollToFeatured()">
            <span class="hero-cta-text">Shop Now</span>
            <span class="hero-cta-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="5 12 12 19 19 12"></polyline></svg>
            </span>
          </button>
        </div>

        <button class="hero-nav hero-nav-left" (click)="prevHeroSlide()" aria-label="Previous slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button class="hero-nav hero-nav-right" (click)="nextHeroSlide()" aria-label="Next slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"></polyline></svg>
        </button>

        <div class="hero-dots">
          <span *ngFor="let slide of heroSlides; let i = index" class="hero-dot" [class.active]="i === activeSlide" (click)="goToSlide(i)"></span>
        </div>
      </section>

      <!-- Featured Products Carousel -->
      <section class="featured-section section" id="featured-products">
        <div class="container">
          <h2 class="section-title">Featured Products</h2>
          <div class="featured-carousel-wrapper">
            <button class="featured-nav featured-nav-left" (click)="prevFeatured()" [disabled]="featuredOffset === 0" aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="featured-track-container">
              <div class="featured-track" [style.transform]="'translateX(-' + featuredOffset * featuredCardWidth + 'px)'">
                <div
                  class="featured-card"
                  *ngFor="let product of featuredProducts"
                  [routerLink]="['/product', product.id]"
                >
                  <div class="featured-image" [style.background]="getProductColor(product)"></div>
                  <div class="featured-info">
                    <h3>{{ product.name }}</h3>
                    <p class="featured-category">{{ product.category | titlecase }}</p>
                    <p class="featured-price">{{ formatPrice(product.price) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <button class="featured-nav featured-nav-right" (click)="nextFeatured()" [disabled]="featuredOffset >= featuredProducts.length - featuredVisible" aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"></polyline></svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section section">
        <div class="container">
          <h2 class="section-title">Shop by Category</h2>
          <div class="categories-grid">
            <a routerLink="/mens" class="category-card">
              <div class="category-image" style="background: linear-gradient(135deg, #1e3a5f 0%, #2a4d7a 100%);"></div>
              <h3>Men's Collection</h3>
            </a>
            <a routerLink="/womens" class="category-card">
              <div class="category-image" style="background: linear-gradient(135deg, #a8d5ba 0%, #7fb89a 100%);"></div>
              <h3>Women's Collection</h3>
            </a>
            <a routerLink="/collections" class="category-card">
              <div class="category-image" style="background: linear-gradient(135deg, #f5f1e8 0%, #e8e3d8 100%);"></div>
              <h3>All Collections</h3>
            </a>
          </div>
        </div>
      </section>

      <!-- What To Expect From Us Section -->
      <section class="expect-section section">
        <div class="container">
          <div class="expect-wrapper">
            <h2 class="expect-title">What To Expect From Us</h2>
            <p class="expect-description">
              We Believe In Building A Legacy You Matter To Us. That's Why We're Committed To Providing You With Exceptional Service And Quality You Can Trust
            </p>
            <div class="expect-features">
              <div class="expect-feature">
                <div class="expect-icon">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Delivery Truck -->
                    <rect x="4" y="20" width="34" height="24" rx="2" stroke="var(--primary-color)" stroke-width="2.5"/>
                    <path d="M38 28H48L56 36V44H38V28Z" stroke="var(--primary-color)" stroke-width="2.5" stroke-linejoin="round"/>
                    <circle cx="16" cy="48" r="5" stroke="var(--primary-color)" stroke-width="2.5"/>
                    <circle cx="48" cy="48" r="5" stroke="var(--primary-color)" stroke-width="2.5"/>
                    <path d="M21 44H43" stroke="var(--primary-color)" stroke-width="2"/>
                    <!-- Globe hint on truck -->
                    <circle cx="20" cy="14" r="6" stroke="var(--primary-color)" stroke-width="1.5" opacity="0.6"/>
                    <path d="M14 14H26 M20 8V20 M15 10Q20 14 25 10 M15 18Q20 14 25 18" stroke="var(--primary-color)" stroke-width="1" opacity="0.5"/>
                  </svg>
                </div>
                <h3 class="expect-feature-title">Free Shipping</h3>
              </div>
              <div class="expect-feature">
                <div class="expect-icon">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Exchange / Return Arrows -->
                    <path d="M12 24C12 17.4 17.4 12 24 12H40C46.6 12 52 17.4 52 24" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M52 40C52 46.6 46.6 52 40 52H24C17.4 52 12 46.6 12 40" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M46 18L52 24L46 30" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18 34L12 40L18 46" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <!-- Checkmark in center -->
                    <path d="M26 32L30 36L38 28" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
                  </svg>
                </div>
                <h3 class="expect-feature-title">Easy Exchange And Return</h3>
              </div>
              <div class="expect-feature">
                <div class="expect-icon">
                  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Scissors + Thread - Tailor Made -->
                    <circle cx="18" cy="44" r="7" stroke="var(--primary-color)" stroke-width="2.5"/>
                    <circle cx="18" cy="20" r="7" stroke="var(--primary-color)" stroke-width="2.5"/>
                    <path d="M24 38L44 16" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M24 26L44 48" stroke="var(--primary-color)" stroke-width="2.5" stroke-linecap="round"/>
                    <!-- Thread line -->
                    <path d="M44 16L48 12M44 48L48 52" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round"/>
                    <!-- Needle -->
                    <path d="M48 12L56 20" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
                    <circle cx="56" cy="20" r="1.5" fill="var(--primary-color)" opacity="0.6"/>
                    <!-- Thread curves -->
                    <path d="M56 20Q54 28 50 32Q46 36 48 42" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3" opacity="0.4"/>
                  </svg>
                </div>
                <h3 class="expect-feature-title">Tailor Made Collections</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sale Section -->
      <section class="sale-section section">
        <div class="container">
          <h2 class="section-title">On Sale</h2>
          <div *ngIf="saleProducts.length === 0" class="empty-sale">
            <p>No products on sale at the moment.</p>
          </div>
          <div *ngIf="saleProducts.length > 0" class="sale-grid">
            <div 
              class="sale-card" 
              *ngFor="let product of saleProducts"
              [routerLink]="['/product', product.id]"
            >
              <div class="sale-badge">Sale</div>
              <div class="sale-image" [style.background]="getProductColor(product)"></div>
              <div class="sale-info">
                <h3>{{ product.name }}</h3>
                <p class="sale-category">{{ product.category | titlecase }}</p>
                <div class="sale-prices">
                  <span class="sale-original">{{ formatPrice(product.original_price || product.price) }}</span>
                  <span class="sale-current">{{ formatPrice(product.price) }}</span>
                  <span class="sale-discount" *ngIf="product.discount_percentage">-{{ product.discount_percentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Buy The Look Section -->
      <section class="buy-look-section section">
        <div class="container">
          <div class="buy-look-wrapper">
            <h2 class="buy-look-title">Buy The Look</h2>
            <p class="buy-look-subtitle">
              Don't Just Buy The Clothes, But Buy The Look, Get Our Curated Collection From One Of Our Favourites To Yours
            </p>
            
            <div class="buy-look-carousel">
              <button 
                class="carousel-nav carousel-nav-left" 
                (click)="prevLook()"
                [disabled]="currentLookIndex === 0"
                aria-label="Previous look"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              <div class="buy-look-content" *ngIf="curatedLooks.length > 0">
                <div class="look-lifestyle">
                  <div class="lifestyle-image" [style.background-image]="'url(' + curatedLooks[currentLookIndex].lifestyleImage + ')'">
                    <div class="lifestyle-placeholder" *ngIf="!curatedLooks[currentLookIndex].lifestyleImage">
                      <span>Lifestyle Image</span>
                    </div>
                  </div>
                </div>

                <div class="look-products">
                  <div 
                    class="product-item" 
                    *ngFor="let product of curatedLooks[currentLookIndex].products; let i = index"
                    [routerLink]="['/product', product.id]"
                  >
                    <div class="product-image" [style.background-image]="'url(' + product.image + ')'">
                      <div class="product-placeholder" *ngIf="!product.image">
                        <span>Product {{ i + 1 }}</span>
                      </div>
                    </div>
                    <div class="product-price-badge">
                      <span>{{ formatPrice(product.price) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                class="carousel-nav carousel-nav-right" 
                (click)="nextLook()"
                [disabled]="currentLookIndex === curatedLooks.length - 1"
                aria-label="Next look"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            <div class="buy-look-cta">
              <a routerLink="/collections" class="btn-view-more">View More</a>
            </div>
          </div>
        </div>
      </section>

      <!-- How We Do It Section -->
      <section class="how-we-do-section section">
        <div class="container">
          <div class="how-we-do-wrapper">
            <h2 class="how-we-do-title">How We Do It</h2>
            <p class="how-we-do-description">
              Spotted By Fashionistas On Social Media – That's How They Did It! Now You Can Also Share Your First Style Inspiration With Us By Tagging Us Online For A Chance To Be Featured And Inspire Many Others
            </p>
            <div class="social-posts-grid">
              <div 
                class="social-post-card" 
                *ngFor="let post of socialPosts"
              >
                <div class="post-image" [style.background-image]="'url(' + post.image + ')'">
                  <div class="post-placeholder" *ngIf="!post.image">
                    <span>Post Image</span>
                  </div>
                </div>
                <div class="post-caption">
                  <span>Spotted By {{ post.handle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: calc(100vh - 200px);
    }

    .hero-section {
      position: relative;
      width: 100%;
      min-height: 520px;
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
      color: var(--text-white);
      overflow: hidden;
    }

    .hero-slides {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .hero-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1s ease-in-out;
    }

    .hero-slide.active {
      opacity: 1;
      z-index: 1;
    }

    .hero-slide.prev {
      opacity: 0;
      z-index: 0;
    }

    .hero-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 15%;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(21, 42, 71, 0.25) 0%,
        rgba(21, 42, 71, 0.45) 50%,
        rgba(21, 42, 71, 0.7) 100%
      );
      z-index: 2;
    }

    .hero-content {
      position: relative;
      z-index: 3;
      max-width: 680px;
      padding: var(--spacing-xl) var(--spacing-lg);
      text-align: left;
    }

    .hero-tagline {
      font-family: var(--font-logo);
      font-size: clamp(1rem, 2vw, 1.3rem);
      font-weight: 400;
      letter-spacing: 0.15em;
      color: var(--secondary-color);
      margin-bottom: var(--spacing-xs);
      opacity: 0.9;
    }

    .hero-title {
      font-family: var(--font-heading);
      font-size: clamp(2.2rem, 5vw, 3.5rem);
      font-weight: 600;
      line-height: 1.15;
      margin-bottom: var(--spacing-sm);
      color: var(--text-white);
      text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
      letter-spacing: -0.01em;
    }

    .hero-subtitle {
      font-size: clamp(0.9rem, 1.5vw, 1.1rem);
      margin-bottom: var(--spacing-md);
      opacity: 0.85;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
      max-width: 420px;
      line-height: 1.6;
    }

    .hero-cta {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: var(--text-white);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 12px 28px;
      border: 1.5px solid rgba(255, 255, 255, 0.5);
      background: transparent;
      transition: all 0.35s ease;
      cursor: pointer;
      font-family: inherit;
    }

    .hero-cta:hover {
      border-color: var(--text-white);
      background: rgba(255, 255, 255, 0.12);
    }

    .hero-cta-arrow {
      display: flex;
      align-items: center;
      animation: bounceDown 1.8s ease-in-out infinite;
    }

    @keyframes bounceDown {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(5px); }
    }

    .hero-cta:hover .hero-cta-arrow {
      animation: none;
      transform: translateY(3px);
    }

    .hero-cta-arrow svg {
      width: 18px;
      height: 18px;
    }

    /* Hero Navigation Arrows */
    .hero-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 4;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: var(--text-white);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }

    .hero-nav:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .hero-nav-left {
      left: 20px;
    }

    .hero-nav-right {
      right: 20px;
    }

    /* Hero Dots */
    .hero-dots {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 4;
      display: flex;
      gap: 10px;
    }

    .hero-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .hero-dot.active {
      background: var(--text-white);
      transform: scale(1.2);
    }

    .hero-dot:hover {
      background: rgba(255, 255, 255, 0.7);
    }

    .section {
      padding: var(--spacing-lg) 0;
    }

    .section-title {
      text-align: center;
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      font-size: clamp(1.75rem, 3vw, 2rem);
    }

    .featured-carousel-wrapper {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      max-width: 1400px;
      margin: 0 auto;
    }

    .featured-nav {
      background: transparent;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-normal);
      flex-shrink: 0;
      padding: 0;
    }

    .featured-nav:hover:not(:disabled) {
      background: var(--primary-color);
      color: var(--text-white);
    }

    .featured-nav:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }

    .featured-track-container {
      flex: 1;
      overflow: hidden;
    }

    .featured-track {
      display: flex;
      gap: var(--spacing-sm);
      transition: transform 0.45s ease;
    }

    .featured-card {
      background: var(--text-white);
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: var(--transition-normal);
      cursor: pointer;
      min-width: calc(25% - 12px);
      flex-shrink: 0;
    }

    .featured-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px var(--shadow-medium);
    }

    .featured-image {
      width: 100%;
      height: 240px;
      transition: var(--transition-slow);
    }

    .featured-card:hover .featured-image {
      transform: scale(1.05);
    }

    .featured-info {
      padding: var(--spacing-md);
    }

    .featured-info h3 {
      color: var(--primary-color);
      margin-bottom: 4px;
      font-size: 1.25rem;
    }

    .featured-category {
      color: var(--text-light);
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .featured-price {
      color: var(--primary-color);
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .categories-section {
      background: var(--secondary-color);
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
      max-width: 1200px;
      margin: 0 auto;
    }

    .category-card {
      background: var(--text-white);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: var(--transition-normal);
      text-align: center;
      text-decoration: none;
      color: var(--primary-color);
    }

    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px var(--shadow-medium);
    }

    .category-image {
      width: 100%;
      height: 200px;
      transition: var(--transition-slow);
    }

    .category-card:hover .category-image {
      transform: scale(1.05);
    }

    .category-card h3 {
      padding: var(--spacing-md);
      margin: 0;
      font-size: 1.5rem;
    }

    .expect-section {
      background: var(--secondary-color);
      padding: var(--spacing-lg) 0;
    }

    .expect-wrapper {
      max-width: 1100px;
      margin: 0 auto;
      padding: var(--spacing-md) var(--spacing-md);
      background: var(--secondary-color);
      border: 3px solid var(--primary-color);
      border-radius: 0;
      text-align: center;
    }

    .expect-title {
      font-family: var(--font-logo);
      font-size: clamp(2rem, 3vw, 2.75rem);
      color: var(--primary-color);
      margin: 0 0 var(--spacing-sm) 0;
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.02em;
    }

    .expect-description {
      max-width: 800px;
      margin: 0 auto var(--spacing-md) auto;
      color: var(--text-dark);
      font-family: var(--font-body);
      font-size: clamp(0.9rem, 1.2vw, 1rem);
      line-height: 1.6;
      padding: 0 var(--spacing-sm);
    }

    .expect-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
      margin-top: var(--spacing-md);
      padding: 0 var(--spacing-sm);
    }

    .expect-feature {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
    }

    .expect-icon {
      width: 90px;
      height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .expect-icon svg {
      width: 100%;
      height: 100%;
      max-width: 90px;
      max-height: 90px;
    }

    .expect-feature-title {
      font-family: var(--font-heading);
      color: var(--text-dark);
      font-size: clamp(1rem, 1.2vw, 1.125rem);
      margin: 0;
      font-weight: 500;
      text-transform: capitalize;
      line-height: 1.4;
    }

    @media (max-width: 1200px) {
      .featured-card { min-width: calc(33.333% - 12px); }
      .sale-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 968px) {
      .hero-section {
        min-height: 400px;
      }

      .hero-content {
        padding: var(--spacing-lg) var(--spacing-md);
      }

      .featured-card { min-width: calc(50% - 8px); }
      .sale-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .buy-look-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .lifestyle-image {
        height: 300px;
      }

      .look-products {
        flex-direction: row;
        height: auto;
      }

      .product-image {
        height: 150px;
      }

      .buy-look-carousel {
        min-height: auto;
      }
    }

    @media (max-width: 768px) {
      .featured-card { min-width: calc(80% - 8px); }
      .categories-grid,
      .sale-grid {
        grid-template-columns: 1fr;
      }

      .expect-features {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }

      .expect-icon {
        width: 80px;
        height: 80px;
      }

      .expect-wrapper {
        padding: var(--spacing-md);
      }

      .expect-description {
        margin-bottom: var(--spacing-md);
      }

      .social-posts-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        min-height: 300px;
      }

      .hero-content {
        padding: var(--spacing-lg) var(--spacing-sm);
      }

      .hero-nav {
        width: 36px;
        height: 36px;
      }

      .hero-nav-left {
        left: 10px;
      }

      .hero-nav-right {
        right: 10px;
      }

      .hero-nav svg {
        width: 18px;
        height: 18px;
      }

      .expect-title,
      .buy-look-title,
      .how-we-do-title {
        font-size: 1.75rem;
      }

      .expect-icon {
        width: 70px;
        height: 70px;
      }

      .lifestyle-image {
        height: 240px;
      }

      .product-image {
        height: 120px;
      }

      .post-image {
        height: 180px;
      }

      .social-posts-grid {
        grid-template-columns: 1fr;
      }
    }

    .buy-look-section {
      background: var(--secondary-color);
      padding: var(--spacing-lg) 0;
    }

    .buy-look-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-md) var(--spacing-md);
      text-align: center;
    }

    .buy-look-title {
      font-family: var(--font-logo);
      font-size: clamp(2rem, 3vw, 2.75rem);
      color: var(--primary-color);
      margin: 0 0 var(--spacing-sm) 0;
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.02em;
    }

    .buy-look-subtitle {
      max-width: 900px;
      margin: 0 auto var(--spacing-md) auto;
      color: var(--primary-color);
      font-family: var(--font-body);
      font-size: clamp(0.9rem, 1.2vw, 1rem);
      line-height: 1.6;
      padding: 0 var(--spacing-sm);
    }

    .buy-look-carousel {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      min-height: 380px;
    }

    .carousel-nav {
      background: transparent;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-normal);
      flex-shrink: 0;
      padding: 0;
    }

    .carousel-nav:hover:not(:disabled) {
      background: var(--primary-color);
      color: var(--text-white);
    }

    .carousel-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .carousel-nav svg {
      width: 24px;
      height: 24px;
    }

    .buy-look-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: var(--spacing-lg);
      align-items: start;
    }

    .look-lifestyle {
      width: 100%;
    }

    .lifestyle-image {
      width: 100%;
      height: 380px;
      background-size: cover;
      background-position: center;
      background-color: var(--grey-light);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    .lifestyle-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: var(--text-white);
      font-family: var(--font-heading);
      font-size: 1.2rem;
    }

    .look-products {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      height: 100%;
    }

    .product-item {
      flex: 1;
      position: relative;
      cursor: pointer;
      text-decoration: none;
      display: block;
    }

    .product-image {
      width: 100%;
      height: 180px;
      background-size: cover;
      background-position: center;
      background-color: var(--text-white);
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: var(--transition-normal);
    }

    .product-item:hover .product-image {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px var(--shadow-medium);
    }

    .product-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--grey-light);
      color: var(--text-dark);
      font-family: var(--font-body);
      font-size: 0.9rem;
    }

    .product-price-badge {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent-color);
      color: var(--text-white);
      padding: 6px 16px;
      border-radius: 20px;
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 600;
      border: 2px solid var(--accent-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .buy-look-cta {
      margin-top: var(--spacing-lg);
    }

    .btn-view-more {
      display: inline-block;
      padding: 12px 32px;
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
      background: transparent;
      border-radius: 8px;
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 500;
      text-decoration: none;
      transition: var(--transition-normal);
      cursor: pointer;
    }

    .btn-view-more:hover {
      background: var(--primary-color);
      color: var(--text-white);
    }

    @media (max-width: 768px) {
      .buy-look-carousel {
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .carousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
      }

      .carousel-nav-left {
        left: 8px;
      }

      .carousel-nav-right {
        right: 8px;
      }

      .buy-look-content {
        width: 100%;
      }

      .lifestyle-image {
        height: 280px;
      }

      .look-products {
        flex-direction: column;
      }

      .product-image {
        height: 150px;
      }
    }

    @media (max-width: 480px) {
      .buy-look-title {
        font-size: 2rem;
      }

      .lifestyle-image {
        height: 300px;
      }

      .product-image {
        height: 150px;
      }

      .carousel-nav {
        width: 40px;
        height: 40px;
      }

      .carousel-nav svg {
        width: 20px;
        height: 20px;
      }
    }

    .sale-section {
      padding: var(--spacing-lg) 0;
      background: var(--text-white);
    }

    .sale-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-sm);
      max-width: 1400px;
      margin: 0 auto;
    }

    .sale-card {
      background: var(--text-white);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: var(--transition-normal);
      cursor: pointer;
      position: relative;
    }

    .sale-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px var(--shadow-medium);
    }

    .sale-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--accent-color);
      color: var(--text-white);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      z-index: 10;
    }

    .sale-image {
      width: 100%;
      height: 240px;
      transition: var(--transition-slow);
    }

    .sale-card:hover .sale-image {
      transform: scale(1.05);
    }

    .sale-info {
      padding: var(--spacing-md);
    }

    .sale-info h3 {
      color: var(--primary-color);
      margin-bottom: 4px;
      font-size: 1.25rem;
    }

    .sale-category {
      color: var(--text-light);
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .sale-prices {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .sale-original {
      text-decoration: line-through;
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .sale-current {
      color: var(--accent-color);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .sale-discount {
      background: var(--accent-color);
      color: var(--text-white);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .empty-sale {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--text-light);
    }

    .how-we-do-section {
      background: var(--secondary-color);
      padding: var(--spacing-lg) 0;
    }

    .how-we-do-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
      text-align: center;
    }

    .how-we-do-title {
      font-family: var(--font-logo);
      font-size: clamp(2rem, 3vw, 2.75rem);
      color: var(--primary-color);
      margin: 0 0 var(--spacing-sm) 0;
      font-weight: 600;
      font-style: italic;
      letter-spacing: 0.02em;
    }

    .how-we-do-description {
      max-width: 900px;
      margin: 0 auto var(--spacing-md) auto;
      color: var(--text-dark);
      font-family: var(--font-body);
      font-size: clamp(0.9rem, 1.2vw, 1rem);
      line-height: 1.6;
      padding: 0 var(--spacing-sm);
    }

    .social-posts-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-sm);
    }

    .social-post-card {
      background: var(--text-white);
      border-radius: 0;
      overflow: hidden;
      border: 2px solid var(--primary-color);
      transition: var(--transition-normal);
      cursor: pointer;
    }

    .social-post-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px var(--shadow-medium);
    }

    .post-image {
      width: 100%;
      height: 220px;
      background-size: cover;
      background-position: center;
      background-color: var(--grey-light);
      position: relative;
    }

    .post-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      color: var(--text-white);
      font-family: var(--font-body);
      font-size: 0.9rem;
    }

    .post-caption {
      background: var(--primary-color);
      color: var(--text-white);
      padding: 12px;
      text-align: center;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 500;
    }

    @media (max-width: 968px) {
      .social-posts-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .sale-grid {
        grid-template-columns: 1fr;
      }

      .social-posts-grid {
        grid-template-columns: 1fr;
      }

      .post-image {
        height: 250px;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: any[] = [];
  saleProducts: any[] = [];

  featuredOffset = 0;
  featuredVisible = 4;
  featuredCardWidth = 0;
  private featuredAutoInterval: any;

  /* Hero Carousel */
  heroSlides = [
    { image: 'assets/login_video_1.mp4', alt: 'Legado & Co - Timeless Style' },
    { image: 'assets/homebanner2.png', alt: 'Legado & Co - Premium Collection' }
  ];
  activeSlide = 0;
  prevSlide = -1;
  private heroInterval: any;
  currentLookIndex = 0;
  curatedLooks: any[] = [
    {
      id: 1,
      lifestyleImage: 'assets/homebanner2.png',
      products: [
        { id: 1, name: 'Brown Zippered Jacket', price: 3499, image: 'assets/buythelook2.png' },
        { id: 2, name: 'Brown Leather Brogue Shoes', price: 5679, image: 'assets/buythelook3.png' }
      ]
    },
    {
      id: 2,
      lifestyleImage: 'assets/homebanner2.png',
      products: [
        { id: 3, name: 'Classic White Shirt', price: 2499, image: '' },
        { id: 4, name: 'Navy Blue Trousers', price: 3299, image: '' }
      ]
    },
    {
      id: 3,
      lifestyleImage: 'assets/homebanner2.png',
      products: [
        { id: 5, name: 'Olive Green Sweater', price: 2799, image: '' },
        { id: 6, name: 'Dark Denim Jeans', price: 2999, image: '' }
      ]
    }
  ];
  socialPosts: any[] = [
    { id: 1, image: '', handle: '@Sannidh123' },
    { id: 2, image: '', handle: '@FashionLover' },
    { id: 3, image: '', handle: '@StyleInspire' },
    { id: 4, image: '', handle: '@TrendSetter' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadSaleProducts();
    this.loadCuratedLooks();
    this.loadSocialPosts();
    this.startHeroAutoSlide();
    this.calcFeaturedLayout();
    this.startFeaturedAuto();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }
  }

  ngOnDestroy() {
    this.stopHeroAutoSlide();
    this.stopFeaturedAuto();
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
  }

  private onResize = () => this.calcFeaturedLayout();

  calcFeaturedLayout() {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w <= 768) { this.featuredVisible = 1; }
    else if (w <= 968) { this.featuredVisible = 2; }
    else if (w <= 1200) { this.featuredVisible = 3; }
    else { this.featuredVisible = 4; }
    const gap = 16;
    const containerW = Math.min(1400, w - 140);
    this.featuredCardWidth = (containerW + gap) / this.featuredVisible;
    if (this.featuredOffset > this.featuredProducts.length - this.featuredVisible) {
      this.featuredOffset = Math.max(0, this.featuredProducts.length - this.featuredVisible);
    }
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
    this.stopFeaturedAuto();
    this.startFeaturedAuto();
  }

  startHeroAutoSlide() {
    this.heroInterval = setInterval(() => this.nextHeroSlide(), 5000);
  }

  stopHeroAutoSlide() {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
  }

  nextHeroSlide() {
    this.prevSlide = this.activeSlide;
    this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
    this.resetHeroAutoSlide();
  }

  prevHeroSlide() {
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
    this.stopHeroAutoSlide();
    this.startHeroAutoSlide();
  }

  scrollToFeatured() {
    const el = document.getElementById('featured-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  loadFeaturedProducts() {
    const allProducts = this.productService.getAllProducts();
    this.featuredProducts = allProducts.filter(p => p.featured).slice(0, 8);
    if (this.featuredProducts.length < 4) {
      this.featuredProducts = allProducts.slice(0, 8);
    }
    this.calcFeaturedLayout();
  }

  loadSaleProducts() {
    // In a real app, fetch from API: /products?is_on_sale=1
    const allProducts = this.productService.getAllProducts();
    this.saleProducts = allProducts.filter(p => p.is_on_sale || (p.originalPrice && p.price < p.originalPrice)).slice(0, 8);
    // Map to include discount_percentage if not present
    this.saleProducts = this.saleProducts.map(p => {
      if (!p.discount_percentage && p.originalPrice) {
        const discount = ((p.originalPrice - p.price) / p.originalPrice) * 100;
        p.discount_percentage = Math.round(discount);
      }
      if (!p.original_price && p.originalPrice) {
        p.original_price = p.originalPrice;
      }
      return p;
    });
  }

  loadCuratedLooks() {
    // In a real app, this would fetch from an API
    // For now, using mock data with placeholder images
    // You can replace with actual product images from your API
  }

  loadSocialPosts() {
    // In a real app, fetch from API: /social-posts or /featured-posts
    // For now, using mock data
    // You can replace with actual social media posts from your API
  }

  prevLook() {
    if (this.currentLookIndex > 0) {
      this.currentLookIndex--;
    }
  }

  nextLook() {
    if (this.currentLookIndex < this.curatedLooks.length - 1) {
      this.currentLookIndex++;
    }
  }

  formatPrice(price: number): string {
    return `₹${price.toLocaleString()}/-`;
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
