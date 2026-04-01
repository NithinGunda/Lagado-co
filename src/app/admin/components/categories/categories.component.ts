import { Component, OnInit, OnDestroy } from '@angular/core';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { environment } from '../../../../environments/environment';

const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Men\'s', slug: 'mens' },
  { id: 2, name: 'Women\'s', slug: 'womens' },
  { id: 3, name: 'Collections', slug: 'collections' }
];

@Component({
  selector: 'app-admin-categories',
  template: `
    <div class="admin-categories">
      <div class="page-header">
        <div>
          <h1>Categories</h1>
          <p class="subtitle">Manage categories for your store</p>
        </div>
        <button type="button" class="btn btn-primary add-btn" (click)="openAdd()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Category
        </button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search by name or slug..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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

      <div *ngIf="!loading && filteredCategories.length === 0 && categories.length > 0" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>No categories match your filters</p>
        <button type="button" class="btn btn-sm" (click)="clearAllFilters()">Clear filters</button>
      </div>

      <div *ngIf="!loading && categories.length === 0 && !editing" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"></path>
        </svg>
        <p>No categories yet</p>
        <button type="button" class="btn btn-primary" (click)="openAdd()">Add your first category</button>
      </div>

      <div *ngIf="!loading && filteredCategories.length > 0" class="table-info">
        Showing {{ filteredCategories.length }} of {{ categories.length }} categor{{ categories.length !== 1 ? 'ies' : 'y' }}
      </div>

      <table *ngIf="!loading && filteredCategories.length > 0" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Parent</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of filteredCategories" class="category-row">
            <td>{{ c.id }}</td>
            <td>
              <div class="thumb">
                <img *ngIf="getCategoryImageUrl(c)" [src]="getCategoryImageUrl(c)" [alt]="c.name" class="table-image" />
                <span *ngIf="!getCategoryImageUrl(c)" class="no-img">—</span>
              </div>
            </td>
            <td><strong>{{ c.name }}</strong></td>
            <td>{{ getParentName(c.parent_id) || '—' }}</td>
            <td><span class="slug-text">{{ c.slug || '—' }}</span></td>
            <td>
              <span
                class="status-badge"
                [class.status-active]="c.is_active !== false"
                [class.status-inactive]="c.is_active === false"
                (click)="toggleStatus(c)"
                title="Click to toggle"
              >
                {{ c.is_active !== false ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="action-cell" (click)="$event.stopPropagation()">
                <button type="button" class="btn btn-sm" (click)="edit(c)">Edit</button>
                <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(c)">Delete</button>
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

      <!-- Add / Edit modal -->
      <div *ngIf="editing" class="form-overlay">
        <div class="form-card" (click)="$event.stopPropagation()">
          <h3>{{ editing.id ? 'Edit' : 'Add' }} category</h3>
          <div class="form-group">
            <label>Name <span class="req">*</span></label>
            <input [(ngModel)]="editing.name" placeholder="Category name" class="form-input" />
          </div>
          <div class="form-group">
            <label>Parent category (optional)</label>
            <select [(ngModel)]="editing.parent_id" class="form-input">
              <option [ngValue]="null">None</option>
              <option *ngFor="let c of categories" [ngValue]="c.id" [disabled]="editing.id === c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Slug (optional)</label>
            <input [(ngModel)]="editing.slug" placeholder="url-slug" class="form-input" />
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="editing.is_active" />
              Active
            </label>
          </div>
          <div class="form-group">
            <label>Image (optional)</label>
            <input type="file" (change)="onFileChange($event)" accept="image/*" class="form-input" />
            <div *ngIf="imageError" class="image-error">{{ imageError }}</div>
            <img *ngIf="imagePreview" [src]="imagePreview" alt="Preview" class="image-preview" />
            <img *ngIf="!imagePreview && getCategoryImageUrl(editing)" [src]="getCategoryImageUrl(editing)" alt="Current" class="image-preview" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving || !editing.name">Save</button>
            <button type="button" class="btn" (click)="cancel()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Delete confirmation -->
      <div *ngIf="toDelete" class="form-overlay">
        <div class="form-card" (click)="$event.stopPropagation()">
          <h3>Delete category?</h3>
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
    .admin-categories { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-light); }
    .add-btn { display: flex; align-items: center; gap: 8px; }

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
      background: none; border: none; cursor: pointer; padding: 4px; color: #999; display: flex; align-items: center;
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

    .active-filters {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      margin-bottom: 12px; padding: 10px 18px; background: var(--secondary-color);
    }
    .filter-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #888; }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; font-size: 12px;
      background: var(--text-white); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.15s;
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
    .category-row { transition: background 0.15s; }
    .category-row:hover { background: rgba(60,90,153,0.03); }
    .thumb { width: 44px; height: 44px; overflow: hidden; border: 1px solid var(--border-color); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .table-image { width: 100%; height: 100%; object-fit: cover; display: block; }
    .no-img { color: var(--text-light); font-size: 12px; background: var(--grey-light); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    .slug-text { font-family: ui-monospace, monospace; font-size: 13px; color: var(--text-light); }
    .action-cell { display: flex; gap: 6px; }
    .btn-sm { padding: 8px 14px; font-size: 13px; }
    .btn-danger { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
    .btn-danger:hover { opacity: 0.9; }

    .status-badge { display: inline-block; padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; user-select: none; }
    .status-active { background: #d4edda; color: #155724; }
    .status-active:hover { background: #f8d7da; color: #721c24; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-inactive:hover { background: #d4edda; color: #155724; }

    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; margin-top: 20px; padding: 12px;
      background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light);
      font-size: 13px; color: var(--text-light);
    }

    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .form-card { background: var(--text-white); padding: 24px; min-width: 360px; max-width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.15); border-radius: 12px; }
    .form-card h3 { margin-top: 0; margin-bottom: 20px; font-size: 1.15rem; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: var(--text-dark); }
    .form-group .req { color: var(--accent-color); }
    .form-input { width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; box-sizing: border-box; }
    .form-input:focus { outline: none; border-color: var(--primary-color); }
    .image-error { color: var(--accent-color); font-size: 13px; margin-top: 4px; }
    .image-preview { max-width: 160px; margin-top: 8px; display: block; border-radius: 8px; max-height: 120px; object-fit: cover; border: 1px solid var(--border-color); }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 500; }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .form-actions { display: flex; gap: 12px; margin-top: 20px; }

    @media (max-width: 768px) {
      .toolbar { flex-direction: column; align-items: stretch; }
      .search-box { min-width: 0; }
      .filter-group { width: 100%; }
      .filter-select { flex: 1; min-width: 0; }
    }
  `]
})
export class AdminCategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  error = '';
  saving = false;
  editing: Partial<Category> & { image_url?: string } | null = null;
  toDelete: Category | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;
  meta: { current_page?: number; last_page?: number; per_page?: number } = {};
  searchQuery = '';
  filterStatus = '';
  private currentPage = 1;
  private search$ = new Subject<string>();
  private searchSub: any;

  constructor(private api: CategoryService) {}

  /** Resolve category image URL: API may return image_url (full or path) or image (path). */
  getCategoryImageUrl(c: Partial<Category> | Category | null | undefined): string | null {
    if (!c) return null;
    const url = c.image_url || c.image;
    if (!url || typeof url !== 'string') return null;
    const s = url.trim();
    if (!s) return null;
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    const base = environment.apiBaseUrl.replace(/\/api\/?$/, '');
    if (s.startsWith('/')) return base + s;
    return base + '/storage/' + s.replace(/^\//, '');
  }

  getParentName(parentId?: number | string | null): string | undefined {
    if (parentId == null) return undefined;
    const parent = this.categories.find(c => c.id === parentId);
    return parent?.name;
  }

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

  onSearchChange(query: string) {
    this.search$.next(query);
  }

  applyFilters() {
    let result = [...this.categories];
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.slug || '').toLowerCase().includes(q)
      );
    }
    if (this.filterStatus === 'active') {
      result = result.filter(c => c.is_active !== false);
    } else if (this.filterStatus === 'inactive') {
      result = result.filter(c => c.is_active === false);
    }
    this.filteredCategories = result;
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery.trim() || this.filterStatus);
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

  load() {
    this.loading = true;
    this.error = '';
    this.api.list({ page: this.currentPage, per_page: 10 }).pipe(
      catchError(() => of({ data: MOCK_CATEGORIES, meta: { current_page: 1, last_page: 1 } }))
    ).subscribe({
      next: (res) => {
        this.categories = res?.data ?? [];
        this.meta = (res as any)?.meta ?? {};
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  loadPage(page: number) {
    if (page < 1) return;
    this.currentPage = page;
    this.load();
  }

  openAdd() {
    this.editing = { name: '', slug: '', is_active: true };
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }

  edit(c: Category) {
    this.editing = { ...c };
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }

  cancel() {
    this.editing = null;
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }

  onFileChange(ev: Event) {
    this.imageError = null;
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 3 * 1024 * 1024;
    if (!allowed.includes(file.type)) {
      this.imageError = 'Only PNG, JPG, JPEG or WEBP allowed.';
      return;
    }
    if (file.size > maxSize) {
      this.imageError = 'Image must be under 3MB.';
      return;
    }
    this.imageFile = file;
    this.imagePreview = URL.createObjectURL(file);
  }

  save() {
    if (!this.editing || !this.editing.name || this.saving) return;
    this.saving = true;
    const id = this.editing.id;
    const hasImage = this.imageFile != null;

    if (hasImage) {
      const fd = new FormData();
      fd.append('name', this.editing.name);
      if (this.editing.slug) fd.append('slug', this.editing.slug);
      fd.append('is_active', this.editing.is_active === false ? '0' : '1');
      if (this.editing.parent_id != null) fd.append('parent_id', String(this.editing.parent_id));
      fd.append('image', this.imageFile!, this.imageFile!.name);
      const op = id ? this.api.update(id, fd) : this.api.create(fd);
      op.pipe(catchError(() => of(null))).subscribe({
        next: (res) => {
          this.saving = false;
          this.cancel();
          if (res) this.load(); else if (!id) this.categories = [...this.categories, { name: this.editing!.name!, slug: this.editing!.slug, is_active: this.editing!.is_active !== false, id: this.categories.length + 1 }];
        },
        error: (err) => {
          this.error = err?.error?.message || 'Save failed';
          this.saving = false;
        }
      });
    } else {
      const payload = {
        name: this.editing.name,
        slug: this.editing.slug || undefined,
        is_active: this.editing.is_active !== false,
        parent_id: this.editing.parent_id ?? null
      };
      const op = id ? this.api.update(id, payload) : this.api.create(payload);
      op.pipe(catchError(() => of(null))).subscribe({
        next: (res) => {
          this.saving = false;
          this.cancel();
          if (res) this.load(); else if (!id) this.categories = [...this.categories, { name: payload.name!, slug: payload.slug, is_active: payload.is_active, id: this.categories.length + 1 }];
        },
        error: (err) => {
          this.error = err?.error?.message || 'Save failed';
          this.saving = false;
        }
      });
    }
  }

  toggleStatus(c: Category) {
    const newStatus = c.is_active === false ? true : false;
    this.api.update(c.id!, { is_active: newStatus } as any).pipe(catchError(() => of(null))).subscribe({
      next: () => {
        c.is_active = newStatus;
      },
      error: () => {
        c.is_active = newStatus; // update locally even if API fails
      }
    });
  }

  confirmDelete(c: Category) {
    this.toDelete = c;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    const idToRemove = this.toDelete.id;
    this.saving = true;
    this.api.delete(this.toDelete.id!).pipe(catchError(() => of(null))).subscribe({
      next: () => {
        this.saving = false;
        this.toDelete = null;
        this.categories = this.categories.filter(c => c.id !== idToRemove);
        this.applyFilters();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
      }
    });
  }
}
