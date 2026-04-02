import { Component, OnInit, OnDestroy } from '@angular/core';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';

const MOCK_ORDERS = [
  { id: 1, status: 'pending', total: 45000, created_at: '2025-02-01T10:00:00Z', user: { name: 'John Doe', email: 'john@example.com' } },
  { id: 2, status: 'completed', total: 28000, created_at: '2025-01-28T14:30:00Z', user: { name: 'Jane Smith', email: 'jane@example.com' } },
  { id: 3, status: 'pending', total: 12000, created_at: '2025-01-25T09:15:00Z', user: { name: 'Alex Brown', email: 'alex@example.com' } }
];

@Component({
  selector: 'app-admin-orders',
  template: `
    <div class="admin-orders">
      <div class="page-header">
        <div>
          <h1>Orders</h1>
          <p class="subtitle">Track and manage customer orders</p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search by Order ID, customer name or email..."
            class="search-input"
          />
          <button *ngIf="searchQuery" type="button" class="search-clear" (click)="clearSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select [(ngModel)]="filters.sort_by" (ngModelChange)="load()" class="filter-select">
            <option value="created_at">Sort: Date</option>
            <option value="total">Sort: Total</option>
            <option value="id">Sort: ID</option>
          </select>
          <select [(ngModel)]="filters.sort_order" (ngModelChange)="load()" class="filter-select sort-dir">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      <div *ngIf="hasActiveFilters()" class="active-filters">
        <span class="filter-label">Filters:</span>
        <span *ngIf="searchQuery" class="filter-chip" (click)="clearSearch()">
          Search: "{{ searchQuery }}" <span class="chip-x">&times;</span>
        </span>
        <span *ngIf="filterStatus" class="filter-chip" (click)="filterStatus = ''; applyFilters()">
          Status: {{ filterStatus }} <span class="chip-x">&times;</span>
        </span>
        <button type="button" class="btn-clear-all" (click)="clearAllFilters()">Clear all</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && filteredOrders.length === 0 && orders.length > 0" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No orders match your search</p>
        <button type="button" class="btn btn-sm" (click)="clearAllFilters()">Clear filters</button>
      </div>

      <div *ngIf="!loading && orders.length === 0 && !hasActiveFilters()" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
        <p>No orders found</p>
      </div>

      <div *ngIf="!loading && filteredOrders.length > 0" class="table-info">
        Showing {{ filteredOrders.length }} of {{ orders.length }} order{{ orders.length !== 1 ? 's' : '' }}
      </div>

      <table *ngIf="!loading && filteredOrders.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <ng-container *ngFor="let o of filteredOrders">
            <tr class="order-row" (click)="toggleDetails(o.id)" [class.expanded]="expandedOrderId === o.id">
              <td><strong>#{{ o.id }}</strong></td>
              <td>
                <div class="customer-info">
                  <span class="customer-name" [innerHTML]="highlightMatch(getCustomerName(o))"></span>
                  <span class="customer-email" [innerHTML]="highlightMatch(getCustomerEmail(o))"></span>
                </div>
              </td>
              <td><span class="status-badge" [class]="'status-' + (o.status || '')">{{ o.status || '—' }}</span></td>
              <td>{{ formatPrice(o.total) }}</td>
              <td>{{ formatDate(o.created_at) }}</td>
              <td class="col-actions">
                <button type="button" class="btn-detail" (click)="toggleDetails(o.id); $event.stopPropagation()" [attr.aria-expanded]="expandedOrderId === o.id">
                  {{ expandedOrderId === o.id ? 'Hide' : 'View' }} details
                </button>
              </td>
            </tr>
            <tr *ngIf="expandedOrderId === o.id" class="detail-row">
              <td colspan="6" class="detail-cell">
                <div class="order-detail">
                  <div class="detail-grid">
                    <section class="detail-section">
                      <h4>Order info</h4>
                      <p><strong>Order #{{ o.id }}</strong> · {{ formatDate(o.created_at) }}</p>
                      <div class="status-edit">
                        <label>Status</label>
                        <select [ngModel]="o.status" (ngModelChange)="onStatusChange(o, $event)" class="status-select">
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button type="button" class="btn-save-status" (click)="saveStatus(o)" [disabled]="o.status === o._savedStatus || savingStatusId === o.id">
                          {{ savingStatusId === o.id ? 'Saving…' : 'Update status' }}
                        </button>
                      </div>
                      <p *ngIf="o.payment_method"><strong>Payment:</strong> {{ o.payment_method === 'cod' ? 'Cash on Delivery' : o.payment_method }}</p>
                      <p *ngIf="o.notes"><strong>Notes:</strong> {{ o.notes }}</p>
                      <p *ngIf="o.coupon_code"><strong>Coupon:</strong> {{ o.coupon_code }} <span *ngIf="o.discount != null">(−{{ formatPrice(o.discount) }})</span></p>
                    </section>
                    <section class="detail-section">
                      <h4>Customer</h4>
                      <p>{{ getCustomerName(o) }}</p>
                      <p>{{ getCustomerEmail(o) }}</p>
                      <p *ngIf="getCustomerPhone(o)">{{ getCustomerPhone(o) }}</p>
                    </section>
                    <section class="detail-section address-section">
                      <h4>Shipping address</h4>
                      <div *ngIf="getOrderAddress(o)" class="address-block">
                        <p>{{ getOrderAddress(o) }}</p>
                      </div>
                      <p *ngIf="!getOrderAddress(o)" class="muted">No address</p>
                    </section>
                  </div>
                  <section class="detail-section products-section">
                    <h4>Products ({{ getOrderProducts(o).length }})</h4>
                    <table class="products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Size</th>
                          <th>Qty</th>
                          <th>Unit price</th>
                          <th>Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let line of getOrderProducts(o)">
                          <td>
                            <div class="product-cell">
                              <img *ngIf="getProductImage(line)" [src]="getProductImage(line)" alt="" class="product-thumb">
                              <span class="product-name">{{ line.name || 'Product #' + line.id }}</span>
                            </div>
                          </td>
                          <td class="line-size">{{ getOrderLineSize(line) }}</td>
                          <td>{{ getOrderQuantity(line) }}</td>
                          <td>{{ formatPrice(getProductPrice(line)) }}</td>
                          <td><strong>{{ formatPrice(getLineTotal(line)) }}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                  <div class="order-totals">
                    <span *ngIf="o.discount > 0" class="total-line">Discount: −{{ formatPrice(o.discount) }}</span>
                    <span class="total-line total-final">Total: {{ formatPrice(o.total) }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>

      <div *ngIf="meta && meta.current_page != null && meta.last_page != null && meta.last_page > 1" class="pagination">
        <button type="button" class="btn btn-sm" [disabled]="loading || meta.current_page <= 1" (click)="loadPage((meta.current_page ?? 1) - 1)">Previous</button>
        <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
        <button type="button" class="btn btn-sm" [disabled]="loading || meta.current_page >= meta.last_page" (click)="loadPage((meta.current_page ?? 1) + 1)">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .admin-orders { max-width: 1000px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-light); }

    /* Toolbar card */
    .toolbar {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px; margin-bottom: 16px;
      background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light);
    }
    .search-box { position: relative; flex: 1; min-width: 200px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; pointer-events: none; }
    .search-input {
      width: 100%; height: 40px; padding: 0 34px 0 40px;
      border: 1px solid var(--border-color); font-size: 14px; font-family: inherit;
      box-sizing: border-box; background: var(--grey-light, #f5f5f5);
      transition: border-color 0.2s, background 0.2s;
    }
    .search-input:focus { outline: none; border-color: var(--primary-color); background: var(--text-white); }
    .search-input::placeholder { color: #aaa; }
    .search-clear {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; padding: 4px;
      color: #999; display: flex; align-items: center;
    }
    .search-clear:hover { color: var(--accent-color); }

    .filter-group { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .filter-select {
      height: 40px; padding: 0 12px; border: 1px solid var(--border-color);
      font-size: 13px; font-family: inherit; background: var(--grey-light, #f5f5f5);
      cursor: pointer; min-width: 140px; appearance: auto; color: var(--text-dark);
      transition: border-color 0.2s, background 0.2s;
    }
    .filter-select:focus { outline: none; border-color: var(--primary-color); background: var(--text-white); }
    .sort-dir { min-width: 130px; }

    /* Active filter chips */
    .active-filters {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      margin-bottom: 12px; padding: 10px 18px;
      background: var(--secondary-color);
    }
    .filter-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #888; }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; font-size: 12px;
      background: var(--text-white); border: 1px solid var(--border-color);
      cursor: pointer; transition: all 0.15s; text-transform: capitalize;
    }
    .filter-chip:hover { border-color: var(--accent-color); color: var(--accent-color); }
    .chip-x { font-size: 15px; font-weight: 700; line-height: 1; }
    .btn-clear-all { background: none; border: none; color: var(--accent-color); font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 8px; margin-left: auto; }
    .btn-clear-all:hover { text-decoration: underline; }

    .table-info { font-size: 13px; color: var(--text-light); margin-bottom: 8px; }

    .alert { padding: 12px; margin-bottom: 12px; }
    .alert.error { background: #fee; color: #c00; }
    .loading { padding: 32px; color: var(--text-light); text-align: center; }

    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-light); }
    .empty-state p { margin: 0; font-size: 16px; }

    .data-table { width: 100%; border-collapse: collapse; background: var(--text-white); overflow: hidden; box-shadow: 0 1px 4px var(--shadow-light); }
    .data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .data-table th { background: var(--secondary-color); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; }
    .order-row { transition: background 0.15s; }
    .order-row:hover { background: rgba(60,90,153,0.03); }

    .customer-info { display: flex; flex-direction: column; gap: 2px; }
    .customer-name { font-weight: 500; font-size: 14px; color: var(--text-dark); }
    .customer-email { font-size: 12px; color: var(--text-light); }

    .status-badge { display: inline-block; padding: 5px 14px; font-size: 12px; font-weight: 600; text-transform: capitalize; letter-spacing: 0.2px; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-processing { background: #cce5ff; color: #004085; }
    .status-shipped { background: #d1ecf1; color: #0c5460; }
    .status-completed { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }

    .btn-sm { padding: 8px 14px; font-size: 13px; }
    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; margin-top: 20px; padding: 12px;
      background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light);
      font-size: 13px; color: var(--text-light);
    }

    .col-actions { width: 120px; text-align: right; }
    .btn-detail {
      padding: 6px 12px; font-size: 12px; font-weight: 600;
      background: var(--primary-color, #3c5a99); color: #fff;
      border: none; cursor: pointer; border-radius: 4px;
    }
    .btn-detail:hover { opacity: 0.9; }
    .order-row { cursor: pointer; }
    .order-row.expanded { background: rgba(60,90,153,0.06); }

    .detail-row { vertical-align: top; }
    .detail-cell { padding: 0 !important; background: var(--secondary-color); border-bottom: 2px solid var(--border-color); }
    .order-detail { padding: 20px 24px; text-align: left; }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .detail-section h4 {
      margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;
      color: #666; font-weight: 700;
    }
    .detail-section p { margin: 4px 0; font-size: 14px; color: var(--text-dark); }
    .detail-section .muted { color: var(--text-light); }
    .status-edit { margin-top: 10px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .status-edit label { font-size: 12px; font-weight: 600; }
    .status-select {
      padding: 6px 10px; border: 1px solid var(--border-color);
      font-size: 13px; min-width: 140px;
    }
    .btn-save-status {
      padding: 6px 14px; font-size: 12px; font-weight: 600;
      background: #2e7d32; color: #fff; border: none; cursor: pointer; border-radius: 4px;
    }
    .btn-save-status:hover:not(:disabled) { opacity: 0.9; }
    .btn-save-status:disabled { opacity: 0.6; cursor: not-allowed; }
    .address-block { background: #fff; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color); }
    .products-section { margin-top: 8px; }
    .products-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    .products-table th, .products-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .products-table th { background: #fff; font-weight: 600; color: #666; font-size: 11px; text-transform: uppercase; }
    .product-cell { display: flex; align-items: center; gap: 10px; }
    .product-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color); }
    .product-name { font-weight: 500; }
    .order-totals { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; gap: 20px; flex-wrap: wrap; align-items: center; }
    .total-line { font-size: 14px; }
    .total-final { font-weight: 700; font-size: 1rem; color: var(--primary-color); }

    :host ::ng-deep .search-highlight { background: #fff3cd; padding: 1px 3px; font-weight: 700; }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .search-box { min-width: 0; }
      .filter-group { width: 100%; }
      .filter-select { flex: 1; min-width: 0; }
    }
  `]
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = false;
  error = '';
  meta: any = {};
  expandedOrderId: number | null = null;
  savingStatusId: number | null = null;

  searchQuery = '';
  filterStatus = '';
  filters = {
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 50
  };

  private currentPage = 1;
  private search$ = new Subject<string>();
  private searchSub: any;

  constructor(private api: OrderService) {}

  ngOnInit() {
    this.load();
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
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
    this.api.list(params).pipe(
      catchError(() => of({ data: MOCK_ORDERS, meta: { current_page: 1, last_page: 1 } }))
    ).subscribe({
      next: (res) => {
        const list = res?.data ?? (Array.isArray(res) ? res : []);
        this.orders = list.map((o: any) => ({ ...o, _savedStatus: o.status }));
        this.meta = (res as any)?.meta ?? {};
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string) {
    this.search$.next(query);
  }

  applyFilters() {
    let result = [...this.orders];
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(o => {
        const idMatch = String(o.id).includes(q);
        const nameMatch = this.getCustomerName(o).toLowerCase().includes(q);
        const emailMatch = this.getCustomerEmail(o).toLowerCase().includes(q);
        return idMatch || nameMatch || emailMatch;
      });
    }

    if (this.filterStatus) {
      result = result.filter(o => o.status === this.filterStatus);
    }

    this.filteredOrders = result;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.filterStatus);
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getCustomerName(o: any): string {
    return o.user?.name || o.customer_name || o.shipping_name || '—';
  }

  getCustomerEmail(o: any): string {
    return o.user?.email || o.customer_email || o.email || '';
  }

  getCustomerPhone(o: any): string {
    return o.user?.phone || o.phone || '';
  }

  toggleDetails(orderId: number): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getOrderProducts(o: any): any[] {
    const products = o.products;
    if (Array.isArray(products)) return products;
    return [];
  }

  getOrderQuantity(line: any): number {
    return line?.pivot?.quantity ?? line?.quantity ?? 1;
  }

  /** Size stored on order line (pivot or flattened API fields). */
  getOrderLineSize(line: any): string {
    const pivot = line?.pivot || {};
    const raw =
      pivot.selected_size ??
      pivot.size ??
      line?.selected_size ??
      line?.size;
    if (raw == null || String(raw).trim() === '') return '—';
    return String(raw).trim();
  }

  getProductPrice(line: any): number {
    const p = line?.price ?? line?.unit_price;
    return p != null ? Number(p) : 0;
  }

  getLineTotal(line: any): number {
    return this.getProductPrice(line) * this.getOrderQuantity(line);
  }

  getProductImage(line: any): string | null {
    const url = line?.image_url ?? line?.image_urls?.[0];
    if (url) return url;
    const imgs = line?.images;
    if (Array.isArray(imgs) && imgs.length) return imgs[0]?.url ?? imgs[0];
    return null;
  }

  getOrderAddress(o: any): string {
    const a = o.address;
    if (!a) return '';
    const parts = [
      a.street,
      a.location,
      [a.city, a.state].filter(Boolean).join(', '),
      a.pincode,
      a.country
    ].filter(Boolean);
    return parts.join(', ');
  }

  onStatusChange(order: any, status: string): void {
    order.status = status;
  }

  saveStatus(order: any): void {
    if (order.status === (order._savedStatus ?? order.status)) return;
    this.savingStatusId = order.id;
    this.api.update(order.id, { status: order.status }).subscribe({
      next: () => {
        order._savedStatus = order.status;
        this.savingStatusId = null;
      },
      error: () => {
        this.savingStatusId = null;
      }
    });
  }

  highlightMatch(text: string): string {
    if (!this.searchQuery.trim() || !text) return text;
    const q = this.searchQuery.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
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
      return isNaN(d.getTime()) ? s : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return s;
    }
  }
}
