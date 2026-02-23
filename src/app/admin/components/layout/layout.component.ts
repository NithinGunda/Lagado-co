import { Component } from '@angular/core';
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
          <a routerLink="/admin/products" routerLinkActive="active">Products</a>
          <a routerLink="/admin/featured-products" routerLinkActive="active">Featured Products</a>
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
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--grey-light, #f5f5f5);
    }
    .admin-sidebar {
      width: 260px;
      background: var(--primary-dark, #152a47);
      color: var(--text-white);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: var(--spacing-md);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .sidebar-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-family: var(--font-heading);
    }
    .admin-badge {
      display: inline-block;
      margin-top: 4px;
      font-size: 11px;
      padding: 2px 8px;
      background: var(--btn-primary, #1e3a5f);
      border-radius: 4px;
    }
    .sidebar-nav {
      flex: 1;
      padding: var(--spacing-sm) 0;
    }
    .sidebar-nav a {
      display: block;
      padding: 12px var(--spacing-md);
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      transition: background 0.2s, color 0.2s;
    }
    .sidebar-nav a:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
    }
    .sidebar-nav a.active {
      background: rgba(255,255,255,0.12);
      color: #fff;
      font-weight: 600;
    }
    .sidebar-footer {
      padding: var(--spacing-sm);
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .sidebar-footer a {
      display: block;
      padding: 8px var(--spacing-md);
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      font-size: 14px;
    }
    .sidebar-footer a:hover { color: #fff; }
    .btn-logout {
      width: 100%;
      margin-top: 8px;
      padding: 10px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      cursor: pointer;
      border-radius: 8px;
      font-size: 14px;
    }
    .btn-logout:hover {
      background: rgba(255,255,255,0.1);
    }
    .admin-main {
      flex: 1;
      padding: var(--spacing-md);
      overflow: auto;
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/admin/login']),
      error: () => { this.auth.clearAuth(); this.router.navigate(['/admin/login']); }
    });
  }
}
