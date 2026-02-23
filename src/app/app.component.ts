import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  template: `
    <app-header *ngIf="!isAdmin"></app-header>
    <main [class.admin-active]="isAdmin">
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
  private routerSub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAdmin = e.urlAfterRedirects?.startsWith('/admin') || e.url?.startsWith('/admin');
    });

    this.isAdmin = this.router.url.startsWith('/admin');

    if (typeof localStorage !== 'undefined') {
      const consent = localStorage.getItem('legado_cookie_consent');
      this.showCookieBanner = !consent;
    }
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
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
