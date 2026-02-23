import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

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
        <h1>Categories</h1>
        <button type="button" class="btn btn-primary" (click)="openAdd()">Add category</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && categories.length === 0 && !editing" class="empty">
        No categories yet. Add one above.
      </div>

      <table *ngIf="!loading && categories.length > 0" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of categories">
            <td>{{ c.id }}</td>
            <td>
              <img *ngIf="c.image_url" [src]="c.image_url" alt="{{ c.name }}" class="table-image" />
              <span *ngIf="!c.image_url">—</span>
            </td>
            <td>{{ c.name }}</td>
            <td>{{ c.slug || '—' }}</td>
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
              <button type="button" class="btn btn-sm" (click)="edit(c)">Edit</button>
              <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(c)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="meta && meta.current_page != null && meta.last_page != null && meta.current_page < meta.last_page" class="pagination">
        <button type="button" class="btn btn-sm" [disabled]="loading" (click)="loadPage((meta.current_page || 1) - 1)">Previous</button>
        <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
        <button type="button" class="btn btn-sm" [disabled]="loading" (click)="loadPage((meta.current_page || 1) + 1)">Next</button>
      </div>

      <div *ngIf="editing" class="form-overlay">
        <div class="form-card">
          <h3>{{ editing.id ? 'Edit' : 'Add' }} category</h3>
          <div class="form-group">
            <label>Name</label>
            <input [(ngModel)]="editing.name" placeholder="Category name" class="form-input" />
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
          <h3>Delete category?</h3>
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
    .admin-categories { max-width: 900px; }
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
    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .form-card { background: var(--text-white); padding: var(--spacing-md); border-radius: 12px; min-width: 320px; max-width: 90%; }
    .form-card h3 { margin-top: 0; }
    .form-group { margin-bottom: var(--spacing-sm); }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; }
    .table-image { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .image-error { color: var(--accent-color); font-size: 13px; margin-top: 4px; }
    .image-preview { max-width: 150px; margin-top: 8px; display: block; border-radius: 8px; max-height: 120px; object-fit: cover; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; user-select: none; }
    .status-active { background: #d4edda; color: #155724; }
    .status-active:hover { background: #f8d7da; color: #721c24; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .status-inactive:hover { background: #d4edda; color: #155724; }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .form-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error = '';
  saving = false;
  editing: Partial<Category> & { image_url?: string } | null = null;
  toDelete: Category | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;
  meta: { current_page?: number; last_page?: number; per_page?: number } = {};
  private currentPage = 1;

  constructor(private api: CategoryService) {}

  ngOnInit() {
    this.load();
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
    this.imagePreview = (c as any).image_url ? (c as any).image_url : null;
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
      fd.append('image', this.imageFile!);
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
      const payload = { name: this.editing.name, slug: this.editing.slug || undefined, is_active: this.editing.is_active !== false };
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
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
      }
    });
  }
}
