import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductApiService } from '../../../services/product-api.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Classic Blazer', price: 24000, category_id: 1, description: 'Premium wool blazer' },
  { id: 2, name: 'Silk Dress', price: 20000, category_id: 2, description: 'Elegant silk dress' },
  { id: 3, name: 'Leather Jacket', price: 32000, category_id: 1, description: 'Handcrafted leather' }
];

@Component({
  selector: 'app-admin-products',
  template: `
    <div class="admin-products">
      <div class="page-header">
        <div>
          <h1>Products</h1>
          <p class="subtitle">Manage your product catalog</p>
        </div>
        <button type="button" class="btn btn-primary add-btn" (click)="goToAdd()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Product
        </button>
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
            placeholder="Search products by name..."
            class="search-input"
          />
          <button *ngIf="searchQuery" type="button" class="search-clear" (click)="clearSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filterCategory" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Categories</option>
            <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
          </select>
          <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select [(ngModel)]="filterSale" (ngModelChange)="onFilterChange()" class="filter-select">
            <option value="">All Pricing</option>
            <option value="sale">On Sale</option>
            <option value="regular">Regular</option>
          </select>
        </div>
      </div>

      <div *ngIf="hasActiveFilters()" class="active-filters">
        <span class="filter-label">Filters:</span>
        <span *ngIf="searchQuery" class="filter-chip" (click)="clearSearch()">
          Search: "{{ searchQuery }}" <span class="chip-x">&times;</span>
        </span>
        <span *ngIf="filterCategory" class="filter-chip" (click)="filterCategory = ''; onFilterChange()">
          Category: {{ getCategoryName(filterCategory) }} <span class="chip-x">&times;</span>
        </span>
        <span *ngIf="filterStatus" class="filter-chip" (click)="filterStatus = ''; onFilterChange()">
          Status: {{ filterStatus }} <span class="chip-x">&times;</span>
        </span>
        <span *ngIf="filterSale" class="filter-chip" (click)="filterSale = ''; onFilterChange()">
          {{ filterSale === 'sale' ? 'On Sale' : 'Regular' }} <span class="chip-x">&times;</span>
        </span>
        <button type="button" class="btn-clear-all" (click)="clearAllFilters()">Clear all</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && filteredProducts.length === 0 && products.length > 0" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No products match your filters</p>
        <button type="button" class="btn btn-sm" (click)="clearAllFilters()">Clear filters</button>
      </div>

      <div *ngIf="!loading && products.length === 0 && !hasActiveFilters()" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        </svg>
        <p>No products yet</p>
        <button type="button" class="btn btn-primary" (click)="goToAdd()">Add your first product</button>
      </div>

      <div *ngIf="!loading && filteredProducts.length > 0" class="table-info">
        Showing {{ filteredProducts.length }} of {{ products.length }} product{{ products.length !== 1 ? 's' : '' }}
      </div>

      <table *ngIf="!loading && filteredProducts.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Sale</th>
            <th>Status</th>
            <th>Sizes</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filteredProducts" class="product-row" (click)="goToEdit(p)">
            <td>
              <div class="thumb">
                <img *ngIf="getThumb(p)" [src]="getThumb(p)" alt="" />
                <span *ngIf="!getThumb(p)" class="no-img">—</span>
              </div>
            </td>
            <td><strong [innerHTML]="highlightMatch(p.name)"></strong></td>
            <td>
              <span *ngIf="p.is_on_sale && p.original_price" class="price-original">{{ formatPrice(p.original_price) }}</span>
              <span [class.price-sale]="p.is_on_sale">{{ formatPrice(p.price) }}</span>
              <span *ngIf="p.is_on_sale && p.discount_percentage" class="discount-badge">-{{ p.discount_percentage }}%</span>
            </td>
            <td>
              <span class="badge" [class.badge-sale]="p.is_on_sale" [class.badge-normal]="!p.is_on_sale">
                {{ p.is_on_sale ? 'On Sale' : 'Regular' }}
              </span>
            </td>
            <td>
              <span
                class="status-badge"
                [class.status-active]="p.is_active !== false"
                [class.status-inactive]="p.is_active === false"
                (click)="toggleStatus(p, $event)"
                title="Click to toggle"
              >
                {{ p.is_active !== false ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span class="size-chip" *ngFor="let s of parseSizes(p.sizes)">{{ s }}</span>
              <span *ngIf="!p.sizes" class="text-muted">—</span>
            </td>
            <td>{{ getCategoryName(p.category_id) }}</td>
            <td>
              <div class="action-cell" (click)="$event.stopPropagation()">
                <button type="button" class="btn btn-sm" (click)="goToEdit(p)">Edit</button>
                <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(p)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="meta && meta.current_page != null && meta.last_page != null && meta.last_page > 1" class="pagination">
        <button type="button" class="btn btn-sm" [disabled]="loading || meta.current_page <= 1" (click)="loadPage((meta.current_page ?? 1) - 1)">Previous</button>
        <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
        <button type="button" class="btn btn-sm" [disabled]="loading || meta.current_page >= meta.last_page" (click)="loadPage((meta.current_page ?? 1) + 1)">Next</button>
      </div>

      <!-- Delete confirmation overlay -->
      <div *ngIf="toDelete" class="form-overlay">
        <div class="form-card">
          <h3>Delete product?</h3>
          <p>Are you sure you want to delete "<strong>{{ toDelete.name }}</strong>"? This cannot be undone.</p>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" (click)="deleteConfirm()" [disabled]="saving">Delete</button>
            <button type="button" class="btn" (click)="toDelete = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-products { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-light); }
    .add-btn { display: flex; align-items: center; gap: 8px; }

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
      cursor: pointer; transition: all 0.15s;
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
    .product-row { cursor: pointer; transition: background 0.15s; }
    .product-row:hover { background: rgba(60,90,153,0.03); }

    .thumb { width: 44px; height: 44px; overflow: hidden; border: 1px solid var(--border-color); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .no-img { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: var(--text-light); font-size: 12px; background: var(--grey-light); }

    .btn-sm { padding: 8px 14px; font-size: 13px; }
    .btn-danger { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
    .btn-danger:hover { opacity: 0.9; }
    .action-cell { display: flex; gap: 6px; }

    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; margin-top: 20px; padding: 12px;
      background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light);
      font-size: 13px; color: var(--text-light);
    }

    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .form-card { background: var(--text-white); padding: var(--spacing-md); min-width: 360px; max-width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    .form-card h3 { margin-top: 0; }
    .form-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); }

    .price-original { text-decoration: line-through; color: var(--text-light); margin-right: 8px; font-size: 0.9em; }
    .price-sale { color: var(--accent-color); font-weight: 600; }
    .discount-badge { display: inline-block; background: var(--accent-color); color: #fff; padding: 2px 8px; font-size: 0.75em; margin-left: 6px; }
    .badge { display: inline-block; padding: 5px 12px; font-size: 12px; }
    .badge-sale { background: #d4edda; color: #155724; }
    .badge-normal { background: var(--grey-light); color: var(--text-dark); }

    .status-badge { display: inline-block; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; user-select: none; }
    .status-active { background: #d4edda; color: #155724; }
    .status-active:hover { background: #f8d7da; color: #721c24; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-inactive:hover { background: #d4edda; color: #155724; }

    .size-chip { display: inline-block; padding: 3px 10px; font-size: 12px; font-weight: 500; background: var(--secondary-color); border: 1px solid var(--border-color); color: var(--primary-color); }
    .text-muted { color: var(--text-light); font-size: 13px; }

    :host ::ng-deep .search-highlight { background: #fff3cd; padding: 1px 3px; font-weight: 700; }

    @media (max-width: 768px) {
      .toolbar { flex-direction: column; align-items: stretch; }
      .search-box { min-width: 0; }
      .filter-group { width: 100%; }
      .filter-select { flex: 1; min-width: 0; }
    }
  `]
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';
  saving = false;
  toDelete: any = null;
  meta: any = {};

  searchQuery = '';
  filterCategory = '';
  filterStatus = '';
  filterSale = '';

  private currentPage = 1;
  private search$ = new Subject<string>();
  private searchSub: any;

  constructor(
    private api: ProductApiService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.load();
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  loadCategories() {
    this.categoryService.list({ per_page: 200 }).pipe(
      catchError(() => of({ data: [{ id: 1, name: 'Men\'s' }, { id: 2, name: 'Women\'s' }, { id: 3, name: 'Collections' }] }))
    ).subscribe(r => this.categories = r?.data ?? []);
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.list({ page: this.currentPage, per_page: 50 }).pipe(
      catchError(() => of({ data: MOCK_PRODUCTS, meta: { current_page: 1, last_page: 1 } }))
    ).subscribe({
      next: (res) => {
        this.products = res?.data ?? [];
        this.meta = (res as any)?.meta ?? {};
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = this.extractApiError(err, 'Failed to load products');
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string) {
    this.search$.next(query);
  }

  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.products];
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    if (this.filterCategory) {
      result = result.filter(p => String(p.category_id) === String(this.filterCategory));
    }

    if (this.filterStatus === 'active') {
      result = result.filter(p => p.is_active !== false);
    } else if (this.filterStatus === 'inactive') {
      result = result.filter(p => p.is_active === false);
    }

    if (this.filterSale === 'sale') {
      result = result.filter(p => p.is_on_sale);
    } else if (this.filterSale === 'regular') {
      result = result.filter(p => !p.is_on_sale);
    }

    this.filteredProducts = result;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.filterCategory || this.filterStatus || this.filterSale);
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.filterCategory = '';
    this.filterStatus = '';
    this.filterSale = '';
    this.applyFilters();
  }

  private extractApiError(err: any, fallback: string): string {
    const body = err?.error;
    if (body?.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors)[0];
      return Array.isArray(first) ? String(first[0]) : String(first);
    }
    return body?.message || body?.error || fallback;
  }

  highlightMatch(name: string): string {
    if (!this.searchQuery.trim()) return name;
    const q = this.searchQuery.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return name.replace(regex, '<span class="search-highlight">$1</span>');
  }

  loadPage(page: number) {
    if (page < 1) return;
    this.currentPage = page;
    this.load();
  }

  formatPrice(price: number): string {
    return price != null ? `₹${Number(price).toLocaleString()}` : '—';
  }

  getCategoryName(id: number | string): string {
    if (id == null) return '—';
    const c = this.categories.find(x => x.id == id);
    return c ? c.name : String(id);
  }

  parseSizes(sizes: string): string[] {
    if (!sizes) return [];
    return sizes.split(',').map(s => s.trim()).filter(s => s);
  }

  getThumb(p: any): string | null {
    // Prefer API-computed URL (includes full base URL)
    if (p.image_url) return p.image_url;
    if (Array.isArray(p.image_urls) && p.image_urls.length) {
      return p.image_urls[0];
    }
    // Fallback for seed / mock data where images is an array of string paths
    if (Array.isArray(p.images) && p.images.length) {
      const first = p.images[0];
      if (typeof first === 'string') {
        return first;
      }
      if (first && typeof first.path === 'string') {
        return first.path;
      }
    }
    return null;
  }

  goToAdd() {
    this.router.navigate(['/admin/products/new']);
  }

  goToEdit(p: any) {
    this.router.navigate(['/admin/products', p.id, 'edit']);
  }

  toggleStatus(p: any, event: Event) {
    event.stopPropagation();
    const newStatus = p.is_active === false ? true : false;
    this.api.update(p.id, { is_active: newStatus }).pipe(catchError(() => of(null))).subscribe({
      next: () => { p.is_active = newStatus; this.applyFilters(); },
      error: () => { p.is_active = newStatus; this.applyFilters(); }
    });
  }

  confirmDelete(p: any) {
    this.toDelete = p;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    this.saving = true;
    this.api.delete(this.toDelete.id).subscribe({
      next: () => {
        this.saving = false;
        this.toDelete = null;
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
      }
    });
  }
}
