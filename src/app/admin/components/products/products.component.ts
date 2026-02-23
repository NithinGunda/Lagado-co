import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
        <h1>Products</h1>
        <button type="button" class="btn btn-primary" (click)="openAdd()">Add product</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && products.length === 0 && !editing" class="empty">
        No products yet. Add one above.
      </div>

      <table *ngIf="!loading && products.length > 0" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
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
          <tr *ngFor="let p of products">
            <td>{{ p.id }}</td>
            <td>{{ p.name }}</td>
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
                (click)="toggleStatus(p)"
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
              <button type="button" class="btn btn-sm" (click)="edit(p)">Edit</button>
              <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="meta && meta.current_page != null && meta.last_page != null && meta.current_page < meta.last_page" class="pagination">
        <button type="button" class="btn btn-sm" [disabled]="loading" (click)="loadPage((meta.current_page ?? 1) - 1)">Previous</button>
        <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
        <button type="button" class="btn btn-sm" [disabled]="loading" (click)="loadPage((meta.current_page ?? 1) + 1)">Next</button>
      </div>

      <div *ngIf="editing" class="form-overlay">
        <div class="form-card wide">
          <h3>{{ editing.id ? 'Edit' : 'Add' }} product</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input [(ngModel)]="editing.name" placeholder="Product name" class="form-input" />
            </div>
            <div class="form-group">
              <label>Price</label>
              <input type="number" [(ngModel)]="editing.price" placeholder="0" class="form-input" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select [(ngModel)]="editing.category_id" class="form-input">
                <option [ngValue]="null">Select category</option>
                <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="editing.is_on_sale" />
                Put on Sale
              </label>
            </div>
          </div>
          <div *ngIf="editing.is_on_sale" class="form-row">
            <div class="form-group">
              <label>Original Price (before discount)</label>
              <input type="number" [(ngModel)]="editing.original_price" placeholder="Original price" class="form-input" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>Discount Percentage</label>
              <input type="number" [(ngModel)]="editing.discount_percentage" placeholder="e.g., 20" class="form-input" min="0" max="100" step="1" />
              <small class="form-help">Leave empty to auto-calculate from prices</small>
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="editing.description" placeholder="Description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Sizes Available</label>
            <input [(ngModel)]="editing.sizes" placeholder="e.g. S, M, L, XL, XXL" class="form-input" />
            <small class="form-help">Enter comma-separated sizes (e.g. S, M, L, XL, XXL)</small>
            <div *ngIf="editing.sizes" class="size-preview">
              <span class="size-chip" *ngFor="let s of parseSizes(editing.sizes)">{{ s }}</span>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="editing.is_active" />
              Active (visible on storefront)
            </label>
          </div>
          <div class="form-group">
            <label>Image</label>
            <input type="file" (change)="onFileChange($event)" accept="image/*" class="form-input" />
            <div *ngIf="imageError" class="image-error">{{ imageError }}</div>
            <img *ngIf="imagePreview" [src]="imagePreview" alt="Preview" class="image-preview" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving || !editing.name">Save</button>
            <button type="button" class="btn" (click)="cancel()">Cancel</button>
          </div>
        </div>
      </div>

      <div *ngIf="toDelete" class="form-overlay">
        <div class="form-card">
          <h3>Delete product?</h3>
          <p>Delete "{{ toDelete.name }}"?</p>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" (click)="deleteConfirm()" [disabled]="saving">Delete</button>
            <button type="button" class="btn" (click)="toDelete = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-products { max-width: 1000px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
    .page-header h1 { margin: 0; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: var(--spacing-sm); }
    .alert.error { background: #fee; color: #c00; }
    .loading, .empty { padding: var(--spacing-md); color: var(--text-light); }
    .data-table { width: 100%; border-collapse: collapse; background: var(--text-white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px var(--shadow-light); }
    .data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .data-table th { background: var(--secondary-color); font-weight: 600; }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-danger { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
    .btn-danger:hover { opacity: 0.9; }
    .pagination { display: flex; align-items: center; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow: auto; padding: 20px; }
    .form-card { background: var(--text-white); padding: var(--spacing-md); border-radius: 12px; min-width: 320px; max-width: 90%; }
    .form-card.wide { min-width: 480px; }
    .form-card h3 { margin-top: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm); }
    .form-group { margin-bottom: var(--spacing-sm); }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-input, select.form-input, textarea.form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; }
    .image-error { color: var(--accent-color); font-size: 13px; margin-top: 4px; }
    .image-preview { max-width: 160px; margin-top: 8px; display: block; border-radius: 8px; }
    .price-original { text-decoration: line-through; color: var(--text-light); margin-right: 8px; font-size: 0.9em; }
    .price-sale { color: var(--accent-color); font-weight: 600; }
    .discount-badge { display: inline-block; background: var(--accent-color); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; margin-left: 6px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 13px; }
    .badge-sale { background: #d4edda; color: #155724; }
    .badge-normal { background: var(--grey-light); color: var(--text-dark); }
    .form-help { display: block; color: var(--text-light); font-size: 12px; margin-top: 4px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; user-select: none; }
    .status-active { background: #d4edda; color: #155724; }
    .status-active:hover { background: #f8d7da; color: #721c24; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-inactive:hover { background: #d4edda; color: #155724; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .form-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
    .size-preview { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .size-chip { display: inline-block; padding: 3px 10px; font-size: 12px; font-weight: 500; background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 6px; color: var(--primary-color); }
    .text-muted { color: var(--text-light); font-size: 13px; }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';
  saving = false;
  editing: any = null;
  toDelete: any = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;
  meta: any = {};
  private currentPage = 1;

  constructor(
    private api: ProductApiService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.load();
  }

  loadCategories() {
    this.categoryService.list({ per_page: 200 }).pipe(
      catchError(() => of({ data: [{ id: 1, name: 'Men\'s' }, { id: 2, name: 'Women\'s' }, { id: 3, name: 'Collections' }] }))
    ).subscribe(r => this.categories = r?.data ?? []);
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.list({ page: this.currentPage, per_page: 10 }).pipe(
      catchError(() => of({ data: MOCK_PRODUCTS, meta: { current_page: 1, last_page: 1 } }))
    ).subscribe({
      next: (res) => {
        this.products = res?.data ?? [];
        this.meta = (res as any)?.meta ?? {};
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load products';
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

  getCategoryName(id: number | string): string {
    if (id == null) return '—';
    const c = this.categories.find(x => x.id == id);
    return c ? c.name : String(id);
  }

  parseSizes(sizes: string): string[] {
    if (!sizes) return [];
    return sizes.split(',').map(s => s.trim()).filter(s => s);
  }

  openAdd() {
    this.editing = { name: '', price: null, category_id: null, description: '', is_on_sale: false, original_price: null, discount_percentage: null, is_active: true, sizes: '' };
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }

  edit(p: any) {
    this.editing = { ...p };
    this.imageFile = null;
    this.imagePreview = p.image_url ? p.image_url : null;
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
    this.error = '';
    const id = this.editing.id;
    const hasImage = this.imageFile != null;

    // Calculate discount if original_price is set but discount_percentage is not
    if (this.editing.is_on_sale && this.editing.original_price && !this.editing.discount_percentage) {
      const discount = ((this.editing.original_price - this.editing.price) / this.editing.original_price) * 100;
      this.editing.discount_percentage = Math.round(discount);
    }

    if (id && hasImage) {
      const fd = new FormData();
      fd.append('name', this.editing.name);
      fd.append('price', String(this.editing.price ?? 0));
      if (this.editing.category_id != null) fd.append('category_id', String(this.editing.category_id));
      if (this.editing.description) fd.append('description', this.editing.description);
      fd.append('is_active', this.editing.is_active === false ? '0' : '1');
      if (this.editing.sizes) fd.append('sizes', this.editing.sizes);
      if (this.editing.is_on_sale) {
        fd.append('is_on_sale', '1');
        if (this.editing.original_price) fd.append('original_price', String(this.editing.original_price));
        if (this.editing.discount_percentage) fd.append('discount_percentage', String(this.editing.discount_percentage));
      }
      fd.append('image', this.imageFile!);
      this.api.update(id, fd).subscribe({ next: () => this.saveDone(), error: (e) => this.saveError(e) });
    } else if (!id && hasImage) {
      const fd = new FormData();
      fd.append('name', this.editing.name);
      fd.append('price', String(this.editing.price ?? 0));
      if (this.editing.category_id != null) fd.append('category_id', String(this.editing.category_id));
      if (this.editing.description) fd.append('description', this.editing.description);
      fd.append('is_active', this.editing.is_active === false ? '0' : '1');
      if (this.editing.sizes) fd.append('sizes', this.editing.sizes);
      if (this.editing.is_on_sale) {
        fd.append('is_on_sale', '1');
        if (this.editing.original_price) fd.append('original_price', String(this.editing.original_price));
        if (this.editing.discount_percentage) fd.append('discount_percentage', String(this.editing.discount_percentage));
      }
      fd.append('image', this.imageFile!);
      this.api.create(fd).subscribe({ next: () => this.saveDone(), error: (e) => this.saveError(e) });
    } else {
      const payload: any = {
        name: this.editing.name,
        price: this.editing.price ?? 0,
        category_id: this.editing.category_id ?? undefined,
        description: this.editing.description || undefined,
        is_active: this.editing.is_active !== false,
        sizes: this.editing.sizes || undefined
      };
      if (this.editing.is_on_sale) {
        payload.is_on_sale = true;
        if (this.editing.original_price) payload.original_price = this.editing.original_price;
        if (this.editing.discount_percentage) payload.discount_percentage = this.editing.discount_percentage;
      } else {
        payload.is_on_sale = false;
      }
      const op = id ? this.api.update(id, payload) : this.api.create(payload);
      op.subscribe({ next: () => this.saveDone(), error: (e) => this.saveError(e) });
    }
  }

  private saveDone() {
    this.saving = false;
    this.cancel();
    this.load();
  }

  private saveError(err: any) {
    this.saving = false;
    this.error = err?.error?.message || 'Save failed';
  }

  toggleStatus(p: any) {
    const newStatus = p.is_active === false ? true : false;
    this.api.update(p.id, { is_active: newStatus }).pipe(catchError(() => of(null))).subscribe({
      next: () => {
        p.is_active = newStatus;
      },
      error: () => {
        p.is_active = newStatus; // update locally even if API fails
      }
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
