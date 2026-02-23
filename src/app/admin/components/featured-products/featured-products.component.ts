import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeaturedProductsService, FeaturedProduct } from '../../../services/featured-products.service';

const MOCK_FEATURED: FeaturedProduct[] = [
  { id: 1, name: 'Featured Product 1', price: 25000, description: 'Premium featured product' },
  { id: 2, name: 'Featured Product 2', price: 18000, description: 'Elegant featured product' }
];

@Component({
  selector: 'app-admin-featured-products',
  template: `
    <div class="admin-featured-products">
      <div class="page-header">
        <h1>Featured Products</h1>
        <button type="button" class="btn btn-primary" (click)="openAdd()">Add Featured Product</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && featuredProducts.length === 0 && !editing" class="empty">
        No featured products yet. Add one above.
      </div>

      <table *ngIf="!loading && featuredProducts.length > 0" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of featuredProducts">
            <td>{{ p.id }}</td>
            <td>
              <img *ngIf="p.image_url" [src]="p.image_url" alt="{{ p.name }}" class="table-image" />
              <span *ngIf="!p.image_url">—</span>
            </td>
            <td>{{ p.name }}</td>
            <td>{{ formatPrice(p.price) }}</td>
            <td class="desc-cell">{{ p.description || '—' }}</td>
            <td>
              <button type="button" class="btn btn-sm" (click)="edit(p)">Edit</button>
              <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="editing" class="form-overlay">
        <div class="form-card wide">
          <h3>{{ editing.id ? 'Edit' : 'Add' }} Featured Product</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Product Name</label>
              <input [(ngModel)]="editing.name" placeholder="Product name" class="form-input" />
            </div>
            <div class="form-group">
              <label>Price</label>
              <input type="number" [(ngModel)]="editing.price" placeholder="0" class="form-input" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="editing.description" placeholder="Product description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Image</label>
            <input type="file" (change)="onFileChange($event)" accept="image/*" class="form-input" />
            <div *ngIf="imageError" class="image-error">{{ imageError }}</div>
            <img *ngIf="imagePreview" [src]="imagePreview" alt="Preview" class="image-preview" />
            <img *ngIf="!imagePreview && editing.image_url" [src]="editing.image_url" alt="Current" class="image-preview" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving || !editing.name">Save</button>
            <button type="button" class="btn" (click)="cancel()">Cancel</button>
          </div>
        </div>
      </div>

      <div *ngIf="toDelete" class="form-overlay">
        <div class="form-card">
          <h3>Delete featured product?</h3>
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
    .admin-featured-products { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
    .page-header h1 { margin: 0; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: var(--spacing-sm); }
    .alert.error { background: #fee; color: #c00; }
    .loading, .empty { padding: var(--spacing-md); color: var(--text-light); }
    .data-table { width: 100%; border-collapse: collapse; background: var(--text-white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px var(--shadow-light); }
    .data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .data-table th { background: var(--secondary-color); font-weight: 600; }
    .table-image { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; }
    .desc-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-danger { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow: auto; padding: 20px; }
    .form-card { background: var(--text-white); padding: var(--spacing-md); border-radius: 12px; min-width: 320px; max-width: 90%; }
    .form-card.wide { min-width: 500px; }
    .form-card h3 { margin-top: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm); }
    .form-group { margin-bottom: var(--spacing-sm); }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-input, textarea.form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; }
    .image-error { color: var(--accent-color); font-size: 13px; margin-top: 4px; }
    .image-preview { max-width: 200px; margin-top: 8px; display: block; border-radius: 8px; max-height: 150px; object-fit: cover; }
    .form-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
  `]
})
export class AdminFeaturedProductsComponent implements OnInit {
  featuredProducts: FeaturedProduct[] = [];
  loading = false;
  error = '';
  saving = false;
  editing: FeaturedProduct | null = null;
  toDelete: FeaturedProduct | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;

  constructor(private api: FeaturedProductsService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.list().pipe(
      catchError(() => of(MOCK_FEATURED))
    ).subscribe({
      next: (items) => {
        this.featuredProducts = items;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load featured products';
        this.loading = false;
      }
    });
  }

  formatPrice(price: number | undefined | null): string {
    return price != null ? `₹${Number(price).toLocaleString()}` : '—';
  }

  openAdd() {
    this.editing = { name: '', price: undefined, description: '' };
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }

  edit(p: FeaturedProduct) {
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

    if (hasImage) {
      const fd = new FormData();
      fd.append('name', this.editing.name);
      fd.append('price', String(this.editing.price ?? 0));
      if (this.editing.description) fd.append('description', this.editing.description);
      fd.append('image', this.imageFile!);
      const op = id ? this.api.update(id, fd) : this.api.create(fd);
      op.subscribe({ next: () => this.saveDone(), error: (e) => this.saveError(e) });
    } else {
      const payload = {
        name: this.editing.name,
        price: this.editing.price ?? 0,
        description: this.editing.description || undefined
      };
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

  confirmDelete(p: FeaturedProduct) {
    this.toDelete = p;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    const idToRemove = this.toDelete.id;
    this.saving = true;
    this.api.delete(this.toDelete.id!).subscribe({
      next: () => {
        this.saving = false;
        this.toDelete = null;
        this.featuredProducts = this.featuredProducts.filter(p => p.id !== idToRemove);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
      }
    });
  }
}
