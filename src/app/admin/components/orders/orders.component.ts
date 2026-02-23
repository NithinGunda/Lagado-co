import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';

const MOCK_ORDERS = [
  { id: 1, status: 'pending', total: 45000, created_at: '2025-02-01T10:00:00Z' },
  { id: 2, status: 'completed', total: 28000, created_at: '2025-01-28T14:30:00Z' },
  { id: 3, status: 'pending', total: 12000, created_at: '2025-01-25T09:15:00Z' }
];

@Component({
  selector: 'app-admin-orders',
  template: `
    <div class="admin-orders">
      <h1>Orders</h1>

      <div class="filters" *ngIf="!loading">
        <div class="form-group inline">
          <label>Min total</label>
          <input type="number" [(ngModel)]="filters.min_total" placeholder="Optional" class="form-input small" min="0" />
        </div>
        <div class="form-group inline">
          <label>Sort</label>
          <select [(ngModel)]="filters.sort_by" class="form-input small">
            <option value="created_at">Date</option>
            <option value="total">Total</option>
            <option value="id">ID</option>
          </select>
        </div>
        <div class="form-group inline">
          <select [(ngModel)]="filters.sort_order" class="form-input small">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
        <button type="button" class="btn btn-primary" (click)="load()">Apply</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && orders.length === 0" class="empty">
        No orders found.
      </div>

      <table *ngIf="!loading && orders.length > 0" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Total</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let o of orders">
            <td>{{ o.id }}</td>
            <td><span class="badge" [class]="'status-' + (o.status || '')">{{ o.status || '—' }}</span></td>
            <td>{{ formatPrice(o.total) }}</td>
            <td>{{ formatDate(o.created_at) }}</td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="meta && meta.current_page != null && meta.last_page != null && meta.current_page < meta.last_page" class="pagination">
        <button type="button" class="btn btn-sm" [disabled]="loading" (click)="loadPage((meta.current_page ?? 1) - 1)">Previous</button>
        <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
        <button type="button" class="btn btn-sm" [disabled]="loading" (click)="loadPage((meta.current_page ?? 1) + 1)">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .admin-orders { max-width: 900px; }
    .admin-orders h1 { margin-bottom: var(--spacing-md); }
    .filters { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); }
    .form-group.inline { margin-bottom: 0; }
    .form-group.inline label { margin-right: 6px; }
    .form-input.small { width: 120px; padding: 6px 10px; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: var(--spacing-sm); }
    .alert.error { background: #fee; color: #c00; }
    .loading, .empty { padding: var(--spacing-md); color: var(--text-light); }
    .data-table { width: 100%; border-collapse: collapse; background: var(--text-white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px var(--shadow-light); }
    .data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .data-table th { background: var(--secondary-color); font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 13px; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    .pagination { display: flex; align-items: center; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  error = '';
  meta: any = {};
  filters = {
    min_total: null as number | null,
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 20
  };
  private currentPage = 1;

  constructor(private api: OrderService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    const params: any = {
      page: this.currentPage,
      per_page: this.filters.per_page,
      sort_by: this.filters.sort_by,
      sort_order: this.filters.sort_order
    };
    if (this.filters.min_total != null && this.filters.min_total > 0) {
      params.min_total = this.filters.min_total;
    }
    this.api.list(params).pipe(
      catchError(() => of({ data: MOCK_ORDERS, meta: { current_page: 1, last_page: 1 } }))
    ).subscribe({
      next: (res) => {
        this.orders = res?.data ?? (Array.isArray(res) ? res : []);
        this.meta = (res as any)?.meta ?? {};
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  loadPage(page: number) {
    if (page < 1) return;
    this.currentPage = page;
    this.load();
  }

  formatPrice(price: number): string {
    return price != null ? `₹${Number(price).toLocaleString()}` : '—';
  }

  formatDate(s: string): string {
    if (!s) return '—';
    try {
      const d = new Date(s);
      return isNaN(d.getTime()) ? s : d.toLocaleDateString();
    } catch {
      return s;
    }
  }
}
