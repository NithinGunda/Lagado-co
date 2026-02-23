import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CarouselService, CarouselItem } from '../../../services/carousel.service';

const MOCK_CAROUSEL: CarouselItem[] = [
  { id: 1, order: 1, title: 'Slide 1', description: 'First carousel image' },
  { id: 2, order: 2, title: 'Slide 2', description: 'Second carousel image' },
  { id: 3, order: 3, title: 'Slide 3', description: 'Third carousel image' }
];

@Component({
  selector: 'app-admin-carousel',
  template: `
    <div class="admin-carousel">
      <div class="page-header">
        <h1>Carousel Management</h1>
        <button type="button" class="btn btn-primary" (click)="openAdd()" [disabled]="carouselItems.length >= 3">
          Add Image {{ carouselItems.length >= 3 ? '(Max 3)' : '' }}
        </button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && carouselItems.length === 0" class="empty">
        No carousel images. Add up to 3 images above.
      </div>

      <div *ngIf="!loading && carouselItems.length > 0" class="carousel-grid">
        <div *ngFor="let item of carouselItems; let i = index" class="carousel-item-card">
          <div class="item-preview">
            <img *ngIf="item.image_url" [src]="item.image_url" alt="Carousel {{ i + 1 }}" />
            <div *ngIf="!item.image_url" class="no-image">No image</div>
          </div>
          <div class="item-info">
            <p><strong>Order:</strong> {{ item.order ?? i + 1 }}</p>
            <p *ngIf="item.title"><strong>Title:</strong> {{ item.title }}</p>
            <p *ngIf="item.description"><strong>Description:</strong> {{ item.description }}</p>
            <p *ngIf="item.link"><strong>Link:</strong> {{ item.link }}</p>
          </div>
          <div class="item-actions">
            <button type="button" class="btn btn-sm" (click)="edit(item)">Edit</button>
            <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(item)">Delete</button>
          </div>
        </div>
      </div>

      <div *ngIf="editing" class="form-overlay">
        <div class="form-card wide">
          <h3>{{ editing.id ? 'Edit' : 'Add' }} Carousel Image</h3>
          <div class="form-group">
            <label>Image (required)</label>
            <input type="file" (change)="onFileChange($event)" accept="image/*" class="form-input" />
            <div *ngIf="imageError" class="image-error">{{ imageError }}</div>
            <img *ngIf="imagePreview" [src]="imagePreview" alt="Preview" class="image-preview" />
            <img *ngIf="!imagePreview && editing.image_url" [src]="editing.image_url" alt="Current" class="image-preview" />
          </div>
          <div class="form-group">
            <label>Order (1-3)</label>
            <input type="number" [(ngModel)]="editing.order" placeholder="1" class="form-input" min="1" max="3" />
          </div>
          <div class="form-group">
            <label>Title (optional)</label>
            <input [(ngModel)]="editing.title" placeholder="Carousel title" class="form-input" />
          </div>
          <div class="form-group">
            <label>Description (optional)</label>
            <textarea [(ngModel)]="editing.description" placeholder="Description" class="form-input" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Link URL (optional)</label>
            <input [(ngModel)]="editing.link" placeholder="https://..." class="form-input" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving || (!imageFile && !editing.image_url)">Save</button>
            <button type="button" class="btn" (click)="cancel()">Cancel</button>
          </div>
        </div>
      </div>

      <div *ngIf="toDelete" class="form-overlay">
        <div class="form-card">
          <h3>Delete carousel image?</h3>
          <p>Delete image {{ toDelete.order ?? '?' }}?</p>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" (click)="deleteConfirm()" [disabled]="saving">Delete</button>
            <button type="button" class="btn" (click)="toDelete = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-carousel { max-width: 1000px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
    .page-header h1 { margin: 0; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: var(--spacing-sm); }
    .alert.error { background: #fee; color: #c00; }
    .loading, .empty { padding: var(--spacing-md); color: var(--text-light); }
    .carousel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-md); }
    .carousel-item-card { background: var(--text-white); border-radius: 12px; padding: var(--spacing-md); box-shadow: 0 2px 8px var(--shadow-light); }
    .item-preview { width: 100%; height: 180px; background: var(--grey-light); border-radius: 8px; overflow: hidden; margin-bottom: var(--spacing-sm); display: flex; align-items: center; justify-content: center; }
    .item-preview img { width: 100%; height: 100%; object-fit: cover; }
    .no-image { color: var(--text-light); }
    .item-info p { margin: 4px 0; font-size: 14px; }
    .item-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-sm); }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-danger { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow: auto; padding: 20px; }
    .form-card { background: var(--text-white); padding: var(--spacing-md); border-radius: 12px; min-width: 320px; max-width: 90%; }
    .form-card.wide { min-width: 500px; }
    .form-card h3 { margin-top: 0; }
    .form-group { margin-bottom: var(--spacing-sm); }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-input, textarea.form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; }
    .image-error { color: var(--accent-color); font-size: 13px; margin-top: 4px; }
    .image-preview { max-width: 200px; margin-top: 8px; display: block; border-radius: 8px; max-height: 150px; object-fit: cover; }
    .form-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
  `]
})
export class AdminCarouselComponent implements OnInit {
  carouselItems: CarouselItem[] = [];
  loading = false;
  error = '';
  saving = false;
  editing: CarouselItem | null = null;
  toDelete: CarouselItem | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;

  constructor(private api: CarouselService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.list().pipe(
      catchError(() => of(MOCK_CAROUSEL))
    ).subscribe({
      next: (items) => {
        this.carouselItems = items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load carousel';
        this.loading = false;
      }
    });
  }

  openAdd() {
    if (this.carouselItems.length >= 3) return;
    this.editing = { order: this.carouselItems.length + 1, title: '', description: '', link: '' };
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }

  edit(item: CarouselItem) {
    this.editing = { ...item };
    this.imageFile = null;
    this.imagePreview = item.image_url ? item.image_url : null;
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
    if (!this.editing || this.saving) return;
    if (!this.imageFile && !this.editing.image_url) {
      this.imageError = 'Image is required.';
      return;
    }
    this.saving = true;
    this.error = '';
    const id = this.editing.id;
    const hasImage = this.imageFile != null;

    if (hasImage) {
      const fd = new FormData();
      fd.append('order', String(this.editing.order ?? 1));
      if (this.editing.title) fd.append('title', this.editing.title);
      if (this.editing.description) fd.append('description', this.editing.description);
      if (this.editing.link) fd.append('link', this.editing.link);
      fd.append('image', this.imageFile!);
      const op = id ? this.api.update(id, fd) : this.api.create(fd);
      op.subscribe({ next: () => this.saveDone(), error: (e) => this.saveError(e) });
    } else {
      const payload = {
        order: this.editing.order ?? 1,
        title: this.editing.title || undefined,
        description: this.editing.description || undefined,
        link: this.editing.link || undefined
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

  confirmDelete(item: CarouselItem) {
    this.toDelete = item;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    const idToRemove = this.toDelete.id;
    this.saving = true;
    this.api.delete(this.toDelete.id!).subscribe({
      next: () => {
        this.saving = false;
        this.toDelete = null;
        this.carouselItems = this.carouselItems.filter(item => item.id !== idToRemove);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
      }
    });
  }
}
