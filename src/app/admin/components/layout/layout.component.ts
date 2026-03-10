import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2>Legado & Co</h2>
          <span class="admin-badge">Admin</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/admin/carousel" routerLinkActive="active">Carousel</a>
          <a routerLink="/admin/categories" routerLinkActive="active">Categories</a>
          <a routerLink="/admin/subcategories" routerLinkActive="active">Subcategories</a>
          <a routerLink="/admin/products" routerLinkActive="active">Products</a>
          <a routerLink="/admin/featured-products" routerLinkActive="active">Featured Products</a>
          <a routerLink="/admin/buy-the-look" routerLinkActive="active">Buy The Look</a>
          <a routerLink="/admin/coupons" routerLinkActive="active">Coupons</a>
          <a routerLink="/admin/orders" routerLinkActive="active">Orders</a>
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/" target="_blank">View Store</a>
          <button type="button" class="btn-logout" (click)="logout()">Logout</button>
        </div>
      </aside>
      <main class="admin-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
    .admin-layout {
      display: flex;
      height: 100vh;
      background: var(--grey-light, #f5f5f5);
      overflow: hidden;
    }
    .admin-sidebar {
      width: 260px;
      background: var(--primary-dark, #152a47);
      color: var(--text-white);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      overflow-y: auto;
    }
    .sidebar-header {
      padding: 20px 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-family: var(--font-logo);
      font-weight: 400;
      color: #fff;
    }
    .admin-badge {
      display: inline-block;
      margin-top: 4px;
      font-size: 10px;
      padding: 2px 10px;
      background: rgba(255,255,255,0.15);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-weight: 600;
    }
    .sidebar-nav {
      flex: 1;
      padding: 8px 0;
      overflow-y: auto;
    }
    .sidebar-nav a {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 20px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 14px;
      transition: background 0.2s, color 0.2s;
      border-left: 3px solid transparent;
    }
    .sidebar-nav a:hover {
      background: rgba(255,255,255,0.06);
      color: #fff;
    }
    .sidebar-nav a.active {
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-weight: 600;
      border-left-color: var(--accent-color, #e8c547);
    }
    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .sidebar-footer a {
      display: block;
      padding: 8px 12px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 13px;
    }
    .sidebar-footer a:hover { color: #fff; }
    .btn-logout {
      width: 100%;
      margin-top: 8px;
      padding: 10px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
      border-color: rgba(255,255,255,0.4);
    }
    .admin-main {
      flex: 1;
      margin-left: 260px;
      padding: 28px 32px;
      overflow-y: auto;
      height: 100vh;
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
  }

  logout() {
    this.auth.clearAdminAuth();
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/admin/login']),
      error: () => { this.auth.clearAuth(); this.router.navigate(['/admin/login']); }
    });
  }
}
