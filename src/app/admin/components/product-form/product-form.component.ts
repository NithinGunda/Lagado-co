import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProductApiService } from '../../../services/product-api.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-admin-product-form',
  template: `
    <div class="product-form-page">
      <!-- Top Bar -->
      <div class="form-topbar">
        <button type="button" class="btn-back" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back to Products
        </button>
        <h1>{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h1>
      </div>

      <div *ngIf="loadingProduct" class="loading-state">Loading product...</div>

      <div *ngIf="!loadingProduct" class="form-layout">
        <!-- Left Column: Details -->
        <div class="form-main">
          <div class="form-section">
            <h2>Product Information</h2>
            <div class="field-row">
              <div class="field">
                <label>Product Name <span class="required">*</span></label>
                <input [(ngModel)]="product.name" placeholder="Enter product name" class="input" />
              </div>
            </div>
            <div class="field-row two-col">
              <div class="field">
                <label>Price <span class="required">*</span></label>
                <div class="input-prefix">
                  <span class="prefix">₹</span>
                  <input type="number" [(ngModel)]="product.price" placeholder="0" class="input" min="0" step="0.01" />
                </div>
              </div>
              <div class="field">
                <label>Category</label>
                <select [(ngModel)]="product.category_id" class="input">
                  <option [ngValue]="null">Select category</option>
                  <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Description</label>
              <textarea [(ngModel)]="product.description" placeholder="Write a detailed product description..." class="input textarea" rows="5"></textarea>
            </div>
          </div>

          <!-- Sizes -->
          <div class="form-section">
            <h2>Sizes</h2>
            <div class="field">
              <input [(ngModel)]="product.sizes" placeholder="e.g. S, M, L, XL, XXL" class="input" />
              <small class="help-text">Enter comma-separated sizes</small>
              <div *ngIf="product.sizes" class="size-tags">
                <span class="size-tag" *ngFor="let s of parseSizes(product.sizes)">{{ s }}</span>
              </div>
            </div>
          </div>

          <!-- Sale -->
          <div class="form-section">
            <h2>Pricing & Sale</h2>
            <label class="toggle-row">
              <input type="checkbox" [(ngModel)]="product.is_on_sale" />
              <span>Put on Sale</span>
            </label>
            <div *ngIf="product.is_on_sale" class="field-row two-col" style="margin-top: 16px;">
              <div class="field">
                <label>Original Price</label>
                <div class="input-prefix">
                  <span class="prefix">₹</span>
                  <input type="number" [(ngModel)]="product.original_price" placeholder="Original price" class="input" min="0" step="0.01" />
                </div>
              </div>
              <div class="field">
                <label>Discount %</label>
                <input type="number" [(ngModel)]="product.discount_percentage" placeholder="e.g. 20" class="input" min="0" max="100" step="1" />
                <small class="help-text">Leave empty to auto-calculate</small>
              </div>
            </div>
          </div>

          <!-- Images -->
          <div class="form-section">
            <div class="section-header">
              <h2>Images <span class="img-counter">({{ imagePreviews.length }}/6)</span></h2>
              <button *ngIf="imagePreviews.length > 0" type="button" class="btn-text-danger" (click)="clearAllImages()">Delete All</button>
            </div>
            <div class="upload-zone" (click)="imageInput.click()" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
              <input #imageInput type="file" (change)="onFilesChange($event)" accept="image/png,image/jpeg,image/jpg,image/webp" multiple hidden />
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Click or drag & drop images here</p>
              <span>PNG, JPG, WEBP — max 6 images, 3MB each</span>
            </div>
            <div *ngIf="imageError" class="error-msg">{{ imageError }}</div>
            <div *ngIf="imagePreviews.length > 0" class="image-grid">
              <div class="image-card" *ngFor="let img of imagePreviews; let i = index">
                <img [src]="img.url" alt="Product image" />
                <button type="button" class="image-remove" (click)="removeImage(i)" title="Remove image">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <span class="image-num">{{ i + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Status & Actions -->
        <div class="form-sidebar">
          <div class="sidebar-card">
            <h3>Status</h3>
            <label class="toggle-row">
              <input type="checkbox" [(ngModel)]="product.is_active" />
              <span>Active (visible on storefront)</span>
            </label>
          </div>

          <div class="sidebar-card">
            <h3>Summary</h3>
            <div class="summary-row">
              <span>Name</span>
              <strong>{{ product.name || '—' }}</strong>
            </div>
            <div class="summary-row">
              <span>Price</span>
              <strong>{{ product.price ? ('₹' + product.price) : '—' }}</strong>
            </div>
            <div class="summary-row">
              <span>Images</span>
              <strong>{{ imagePreviews.length }}</strong>
            </div>
            <div class="summary-row">
              <span>Sizes</span>
              <strong>{{ product.sizes || '—' }}</strong>
            </div>
          </div>

          <div *ngIf="error" class="error-banner">{{ error }}</div>

          <div class="action-buttons">
            <button type="button" class="btn-save" (click)="save()" [disabled]="saving || !product.name">
              {{ saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
            </button>
            <button type="button" class="btn-cancel" (click)="goBack()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-form-page { max-width: 1100px; }

    .form-topbar { display: flex; align-items: center; gap: 20px; margin-bottom: var(--spacing-md); }
    .form-topbar h1 { margin: 0; font-size: 1.5rem; }
    .btn-back { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--border-color); padding: 8px 14px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-dark); transition: all 0.2s; }
    .btn-back:hover { border-color: var(--primary-color); color: var(--primary-color); }

    .loading-state { padding: var(--spacing-lg); text-align: center; color: var(--text-light); }

    .form-layout { display: grid; grid-template-columns: 1fr 320px; gap: var(--spacing-md); align-items: start; }

    .form-section { background: var(--text-white); padding: 24px; margin-bottom: var(--spacing-sm); box-shadow: 0 1px 4px var(--shadow-light); }
    .form-section h2 { font-size: 1rem; font-weight: 600; margin: 0 0 16px 0; color: var(--primary-color); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { margin-bottom: 0; }
    .img-counter { font-weight: 400; color: var(--text-light); font-size: 13px; }
    .btn-text-danger { background: none; border: none; color: var(--accent-color); font-size: 13px; font-weight: 600; cursor: pointer; padding: 4px 8px; }
    .btn-text-danger:hover { text-decoration: underline; }

    .field { margin-bottom: 14px; }
    .field label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; color: var(--text-dark); }
    .required { color: var(--accent-color); }
    .field-row { margin-bottom: 0; }
    .field-row.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .input { width: 100%; padding: 10px 14px; border: 1px solid var(--border-color); font-size: 14px; font-family: inherit; box-sizing: border-box; transition: border-color 0.2s; background: var(--text-white); }
    .input:focus { outline: none; border-color: var(--primary-color); }
    .textarea { resize: vertical; min-height: 100px; line-height: 1.6; }
    select.input { appearance: auto; }
    .input-prefix { position: relative; display: flex; align-items: center; }
    .prefix { position: absolute; left: 12px; color: var(--text-light); font-weight: 500; pointer-events: none; }
    .input-prefix .input { padding-left: 28px; }
    .help-text { display: block; color: var(--text-light); font-size: 12px; margin-top: 4px; }

    .toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 400; }
    .toggle-row input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary-color); }

    .size-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .size-tag { padding: 4px 12px; font-size: 12px; font-weight: 500; background: var(--secondary-color); border: 1px solid var(--border-color); color: var(--primary-color); }

    /* Upload zone */
    .upload-zone { border: 2px dashed var(--border-color); padding: 32px 24px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-light); }
    .upload-zone:hover { border-color: var(--primary-color); background: rgba(60,90,153,0.03); }
    .upload-zone p { margin: 0; font-size: 14px; font-weight: 500; color: var(--text-dark); }
    .upload-zone span { font-size: 12px; }

    .error-msg { color: var(--accent-color); font-size: 13px; margin-top: 8px; }

    .image-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
    .image-card { position: relative; aspect-ratio: 1; overflow: hidden; border: 2px solid var(--border-color); }
    .image-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .image-remove { position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; background: var(--accent-color); color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; transition: opacity 0.2s, transform 0.2s; opacity: 0; }
    .image-card:hover .image-remove { opacity: 1; }
    .image-remove:hover { transform: scale(1.1); }
    .image-num { position: absolute; bottom: 6px; left: 6px; background: var(--primary-color); color: #fff; font-size: 11px; font-weight: 700; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }

    /* Sidebar */
    .form-sidebar { position: sticky; top: 20px; }
    .sidebar-card { background: var(--text-white); padding: 20px; margin-bottom: var(--spacing-sm); box-shadow: 0 1px 4px var(--shadow-light); }
    .sidebar-card h3 { font-size: 0.9rem; font-weight: 600; margin: 0 0 14px 0; color: var(--primary-color); }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
    .summary-row span { color: var(--text-light); }
    .summary-row strong { color: var(--text-dark); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }

    .error-banner { background: #fee; color: #c00; padding: 12px; font-size: 13px; margin-bottom: var(--spacing-sm); }

    .action-buttons { display: flex; flex-direction: column; gap: 10px; }
    .btn-save { width: 100%; padding: 14px; background: var(--primary-color); color: var(--text-white); border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.2s; }
    .btn-save:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel { width: 100%; padding: 12px; background: transparent; border: 1px solid var(--border-color); color: var(--text-dark); font-size: 14px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
    .btn-cancel:hover { border-color: var(--accent-color); color: var(--accent-color); }

    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
      .form-sidebar { position: static; }
    }
  `]
})
export class AdminProductFormComponent implements OnInit {
  isEdit = false;
  loadingProduct = false;
  saving = false;
  error = '';
  categories: Category[] = [];

  product: any = {
    name: '', price: null, category_id: null, description: '',
    is_on_sale: false, original_price: null, discount_percentage: null,
    is_active: true, sizes: ''
  };

  imageFiles: File[] = [];
  imagePreviews: { url: string; file?: File; existing?: boolean }[] = [];
  imageError: string | null = null;

  constructor(
    private api: ProductApiService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loadProduct(id);
    }
  }

  loadCategories() {
    this.categoryService.list({ per_page: 200 }).pipe(
      catchError(() => of({ data: [{ id: 1, name: "Men's" }, { id: 2, name: "Women's" }, { id: 3, name: 'Collections' }] }))
    ).subscribe(r => this.categories = r?.data ?? []);
  }

  loadProduct(id: string) {
    this.loadingProduct = true;
    this.api.get(id).pipe(
      catchError(() => of(null))
    ).subscribe(p => {
      this.loadingProduct = false;
      if (!p) { this.error = 'Product not found.'; return; }
      this.product = { ...p };
      const existingImages: string[] = p.images || (p.image_url ? [p.image_url] : []);
      existingImages.forEach((url: string) => this.imagePreviews.push({ url, existing: true }));
    });
  }

  parseSizes(sizes: string): string[] {
    if (!sizes) return [];
    return sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }

  goBack() {
    this.router.navigate(['/admin/products']);
  }

  // --- Image handling ---
  onFilesChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.addFiles(Array.from(input.files));
    input.value = '';
  }

  onDragOver(ev: DragEvent) { ev.preventDefault(); ev.stopPropagation(); }

  onDrop(ev: DragEvent) {
    ev.preventDefault(); ev.stopPropagation();
    if (ev.dataTransfer?.files) this.addFiles(Array.from(ev.dataTransfer.files));
  }

  private addFiles(files: File[]) {
    this.imageError = null;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 3 * 1024 * 1024;
    const remaining = 6 - this.imagePreviews.length;
    if (remaining <= 0) { this.imageError = 'Maximum 6 images allowed.'; return; }
    const toAdd = files.slice(0, remaining);
    const errors: string[] = [];
    for (const file of toAdd) {
      if (!allowed.includes(file.type)) { errors.push(`"${file.name}" — invalid type.`); continue; }
      if (file.size > maxSize) { errors.push(`"${file.name}" — exceeds 3MB.`); continue; }
      this.imageFiles.push(file);
      this.imagePreviews.push({ url: URL.createObjectURL(file), file });
    }
    if (files.length > remaining) errors.push(`Only ${remaining} more image(s) allowed.`);
    if (errors.length) this.imageError = errors.join(' ');
  }

  removeImage(index: number) {
    const removed = this.imagePreviews.splice(index, 1)[0];
    if (removed.file) {
      URL.revokeObjectURL(removed.url);
      const fi = this.imageFiles.indexOf(removed.file);
      if (fi > -1) this.imageFiles.splice(fi, 1);
    }
    this.imageError = null;
  }

  clearAllImages() {
    this.imagePreviews.forEach(p => { if (p.file) URL.revokeObjectURL(p.url); });
    this.imageFiles = [];
    this.imagePreviews = [];
    this.imageError = null;
  }

  // --- Save ---
  save() {
    if (!this.product.name || this.saving) return;
    this.saving = true;
    this.error = '';
    const id = this.product.id;

    if (this.product.is_on_sale && this.product.original_price && !this.product.discount_percentage) {
      this.product.discount_percentage = Math.round(
        ((this.product.original_price - this.product.price) / this.product.original_price) * 100
      );
    }

    const existingUrls = this.imagePreviews.filter(p => p.existing).map(p => p.url);
    const hasNewImages = this.imageFiles.length > 0;

    if (hasNewImages) {
      const fd = new FormData();
      fd.append('name', this.product.name);
      fd.append('price', String(this.product.price ?? 0));
      if (this.product.category_id != null) fd.append('category_id', String(this.product.category_id));
      if (this.product.description) fd.append('description', this.product.description);
      fd.append('is_active', this.product.is_active === false ? '0' : '1');
      if (this.product.sizes) fd.append('sizes', this.product.sizes);
      if (this.product.is_on_sale) {
        fd.append('is_on_sale', '1');
        if (this.product.original_price) fd.append('original_price', String(this.product.original_price));
        if (this.product.discount_percentage) fd.append('discount_percentage', String(this.product.discount_percentage));
      }
      this.imageFiles.forEach(f => fd.append('images[]', f));
      if (existingUrls.length) fd.append('existing_images', JSON.stringify(existingUrls));
      const op = id ? this.api.update(id, fd) : this.api.create(fd);
      op.subscribe({ next: () => this.onSaved(), error: (e) => this.onError(e) });
    } else {
      const payload: any = {
        name: this.product.name,
        price: this.product.price ?? 0,
        category_id: this.product.category_id ?? undefined,
        description: this.product.description || undefined,
        is_active: this.product.is_active !== false,
        sizes: this.product.sizes || undefined
      };
      if (existingUrls.length) payload.existing_images = existingUrls;
      if (this.product.is_on_sale) {
        payload.is_on_sale = true;
        if (this.product.original_price) payload.original_price = this.product.original_price;
        if (this.product.discount_percentage) payload.discount_percentage = this.product.discount_percentage;
      } else { payload.is_on_sale = false; }
      const op = id ? this.api.update(id, payload) : this.api.create(payload);
      op.subscribe({ next: () => this.onSaved(), error: (e) => this.onError(e) });
    }
  }

  private onSaved() {
    this.saving = false;
    this.router.navigate(['/admin/products']);
  }

  private onError(err: any) {
    this.saving = false;
    this.error = err?.error?.message || 'Save failed. Please try again.';
  }
}
