import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppLoadingService } from './services/app-loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  template: `
    <app-header *ngIf="!isAdmin"></app-header>
    <main [class.admin-active]="isAdmin">
      <div class="global-loader-backdrop" *ngIf="!isAdmin && showLoader">
        <div class="loader-orbit">
          <div class="loader-ring loader-ring-outer"></div>
          <div class="loader-ring loader-ring-inner"></div>
          <div class="loader-logo-wrap">
            <img src="assets/Logo.png" alt="Legado & Co" class="loader-logo" />
          </div>
        </div>
      </div>

      <router-outlet></router-outlet>
    </main>
    <app-footer *ngIf="!isAdmin"></app-footer>

    <!-- Cookie Consent Banner -->
    <div class="cookie-banner" *ngIf="showCookieBanner && !isAdmin">
      <div class="cookie-content">
        <div class="cookie-text">
          <svg class="cookie-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
            <circle cx="8.5" cy="8.5" r="1"></circle>
            <circle cx="12" cy="14" r="1"></circle>
            <circle cx="16" cy="10" r="1"></circle>
          </svg>
          <p>We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-btn cookie-btn-outline" (click)="declineCookies()">Decline</button>
          <button class="cookie-btn cookie-btn-primary" (click)="acceptCookies()">Accept All</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .global-loader-backdrop {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at top, rgba(253,246,234,0.85), rgba(12,24,48,0.96));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      backdrop-filter: blur(6px);
    }
    .loader-orbit {
      position: relative;
      width: 140px;
      height: 140px;
    }
    .loader-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.14);
      box-shadow: 0 0 40px rgba(0,0,0,0.4);
    }
    .loader-ring-outer {
      border-top-color: rgba(232,197,71,0.9);
      border-right-color: rgba(168,213,186,0.7);
      border-bottom-color: transparent;
      border-left-color: transparent;
      animation: spinOuter 1.8s linear infinite;
    }
    .loader-ring-inner {
      inset: 18px;
      border-top-color: transparent;
      border-right-color: rgba(255,255,255,0.7);
      border-bottom-color: rgba(232,197,71,0.9);
      border-left-color: transparent;
      animation: spinInner 1.2s linear infinite;
    }
    .loader-logo-wrap {
      position: absolute;
      inset: 32px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.22), rgba(21,42,71,0.96));
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .loader-logo {
      width: 80%;
      height: auto;
      object-fit: contain;
      animation: logoPulse 1.6s ease-in-out infinite;
    }
    @keyframes spinOuter {
      to { transform: rotate(360deg); }
    }
    @keyframes spinInner {
      to { transform: rotate(-360deg); }
    }
    @keyframes logoPulse {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.08); opacity: 1; }
    }
    main {
      min-height: calc(100vh - 200px);
    }
    main.admin-active {
      min-height: 0;
      padding: 0;
      margin: 0;
    }

    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: var(--primary-color, #3C5A99);
      color: var(--text-white, #fff);
      padding: 20px 24px;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }

    .cookie-text {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      flex: 1;
    }

    .cookie-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .cookie-text p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      opacity: 0.92;
    }

    .cookie-actions {
      display: flex;
      gap: 12px;
      flex-shrink: 0;
    }

    .cookie-btn {
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: 2px solid var(--text-white, #fff);
      transition: all 0.25s ease;
      white-space: nowrap;
      font-family: inherit;
    }

    .cookie-btn-outline {
      background: transparent;
      color: var(--text-white, #fff);
    }

    .cookie-btn-outline:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .cookie-btn-primary {
      background: var(--text-white, #fff);
      color: var(--primary-color, #3C5A99);
      border-color: var(--text-white, #fff);
    }

    .cookie-btn-primary:hover {
      background: var(--secondary-color, #FDF6EA);
      border-color: var(--secondary-color, #FDF6EA);
    }

    @media (max-width: 768px) {
      .cookie-content {
        flex-direction: column;
        text-align: center;
      }

      .cookie-text {
        flex-direction: column;
        align-items: center;
      }

      .cookie-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Legado & Co';
  showCookieBanner = false;
  isAdmin = false;
  showLoader = true;
  private routerSub!: Subscription;
  private loadingSub!: Subscription;
  private appBusy = false;

  constructor(private router: Router, private appLoading: AppLoadingService) {}

  ngOnInit() {
    this.loadingSub = this.appLoading.loading$.subscribe(isLoading => {
      this.appBusy = isLoading;
      if (!this.isAdmin && isLoading) {
        this.showLoader = true;
      }
      if (!this.isAdmin && !isLoading && !(this.router as any).navigating) {
        this.showLoader = false;
      }
    });

    this.routerSub = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationStart) {
        this.isAdmin = e.url?.startsWith('/admin');
        if (!this.isAdmin) {
          this.showLoader = true;
        }
      }
      if (e instanceof NavigationEnd) {
        this.isAdmin = e.urlAfterRedirects?.startsWith('/admin') || e.url?.startsWith('/admin');
        if (!this.isAdmin) {
          setTimeout(() => this.showLoader = false, 400);
        } else {
          this.showLoader = false;
        }
      }
      if (e instanceof NavigationCancel || e instanceof NavigationError) {
        // cancel/error: just hide loader, keep current isAdmin
        this.showLoader = false;
      }
    });

    this.isAdmin = this.router.url.startsWith('/admin');
    if (!this.isAdmin) {
      setTimeout(() => this.showLoader = false, 700);
    } else {
      this.showLoader = false;
    }

    if (typeof localStorage !== 'undefined') {
      const consent = localStorage.getItem('legado_cookie_consent');
      this.showCookieBanner = !consent;
    }
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.loadingSub?.unsubscribe();
  }

  acceptCookies() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('legado_cookie_consent', 'accepted');
    }
    this.showCookieBanner = false;
  }

  declineCookies() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('legado_cookie_consent', 'declined');
    }
    this.showCookieBanner = false;
  }
}
