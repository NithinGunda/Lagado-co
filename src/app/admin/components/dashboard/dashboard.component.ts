import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoryService } from '../../../services/category.service';
import { ProductApiService } from '../../../services/product-api.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-dashboard">
      <h1>Dashboard</h1>
      <p class="subtitle">Manage your store from here.</p>

      <div class="stats-grid" *ngIf="!loading && !error">
        <a routerLink="/admin/categories" class="stat-card" routerLinkActive="active">
          <span class="stat-value">{{ counts.categories }}</span>
          <span class="stat-label">Categories</span>
        </a>
        <a routerLink="/admin/products" class="stat-card">
          <span class="stat-value">{{ counts.products }}</span>
          <span class="stat-label">Products</span>
        </a>
        <a routerLink="/admin/orders" class="stat-card">
          <span class="stat-value">{{ counts.orders }}</span>
          <span class="stat-label">Orders</span>
        </a>
      </div>

      <div *ngIf="loading" class="loading">Loading…</div>
      <div *ngIf="error" class="error-msg">{{ error }}</div>

      <div class="quick-actions">
        <h2>Quick actions</h2>
        <div class="action-links">
          <a routerLink="/admin/categories" class="action-link">Manage categories</a>
          <a routerLink="/admin/products" class="action-link">Manage products</a>
          <a routerLink="/admin/orders" class="action-link">View orders</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard { max-width: 900px; }
    .admin-dashboard h1 { margin-bottom: 0.25rem; color: var(--text-dark); }
    .subtitle { color: var(--text-light); margin-bottom: var(--spacing-lg); }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }
    .stat-card {
      background: var(--text-white);
      padding: var(--spacing-md);
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow-light);
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
    }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--primary-color); }
    .stat-label { font-size: 14px; color: var(--text-light); }
    .loading, .error-msg { padding: var(--spacing-md); }
    .error-msg { color: var(--accent-color); }
    .quick-actions h2 { font-size: 1.25rem; margin-bottom: var(--spacing-sm); }
    .action-links { display: flex; flex-wrap: wrap; gap: var(--spacing-sm); }
    .action-link {
      display: inline-block;
      padding: 10px 20px;
      background: var(--primary-color);
      color: var(--text-white);
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
    }
    .action-link:hover { opacity: 0.9; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  error = '';
  counts = { categories: 0, products: 0, orders: 0 };

  constructor(
    private categoryService: CategoryService,
    private productApi: ProductApiService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    this.loading = true;
    this.error = '';
    const done = () => (this.loading = false);
    const setCount = (key: 'categories' | 'products' | 'orders', n: number) => {
      this.counts[key] = n;
    };
    this.categoryService.list({ per_page: 1 }).pipe(
      catchError(() => { setCount('categories', 0); return of({ data: [], total: 0 }); })
    ).subscribe(r => setCount('categories', r?.total ?? r?.data?.length ?? 0));
    this.productApi.list({ per_page: 1 }).pipe(
      catchError(() => { setCount('products', 0); return of({ data: [], total: 0 }); })
    ).subscribe(r => setCount('products', r?.total ?? r?.data?.length ?? 0));
    this.orderService.list({ per_page: 1 }).pipe(
      catchError(() => { setCount('orders', 0); return of({ data: [] }); })
    ).subscribe(r => {
      const d = r?.data ?? (Array.isArray(r) ? r : []);
      setCount('orders', r?.total ?? d.length);
    });
    setTimeout(done, 600);
  }
}
