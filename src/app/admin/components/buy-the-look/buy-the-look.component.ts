import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuyTheLookService, Look, LookProduct } from '../../../services/buy-the-look.service';
import { ProductApiService } from '../../../services/product-api.service';

@Component({
  selector: 'app-admin-buy-the-look',
  template: `
    <div class="btl-page">
      <div class="page-header">
        <div>
          <h1>Buy The Look</h1>
          <p class="subtitle">Manage curated outfit looks shown on the homepage. Select 2 or 3 products per look.</p>
        </div>
        <button class="btn-add" (click)="openForm()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Look
        </button>
      </div>

      <!-- Looks List -->
      <div class="looks-grid">
        <div class="look-card" *ngFor="let look of looks; let i = index">
          <div class="look-card-preview">
            <div class="preview-layout" [class.two-items]="look.products?.length === 2" [class.three-items]="look.products?.length === 3">
              <div class="preview-item" *ngFor="let p of look.products; let pi = index" [class.hero]="pi === 0">
                <img *ngIf="getProductImg(p)" [src]="getProductImg(p)" [alt]="p.name" />
                <div *ngIf="!getProductImg(p)" class="preview-placeholder">{{ p.name?.charAt(0) || '?' }}</div>
                <div class="preview-label">
                  <span class="preview-name">{{ p.name }}</span>
                  <span class="preview-price">₹{{ p.price }}</span>
                </div>
              </div>
            </div>
            <span class="look-order">#{{ i + 1 }}</span>
          </div>
          <div class="look-card-body">
            <h3>{{ look.title }}</h3>
            <span class="product-count">{{ look.products?.length || 0 }} products</span>
            <div class="look-card-actions">
              <button class="btn-edit" (click)="editLook(look)">Edit</button>
              <button class="btn-delete" (click)="deleteLook(look)">Delete</button>
            </div>
          </div>
        </div>
        <div class="empty-state" *ngIf="looks.length === 0 && !loading">
          <p>No looks created yet. Click "Add New Look" to get started.</p>
        </div>
        <div class="loading-msg" *ngIf="loading">Loading...</div>
      </div>

      <!-- Form Panel -->
      <div class="modal-backdrop" *ngIf="showForm" (click)="closeForm()"></div>
      <div class="form-panel" *ngIf="showForm">
        <div class="form-header">
          <h2>{{ editingLook ? 'Edit Look' : 'New Look' }}</h2>
          <button class="btn-close" (click)="closeForm()">&times;</button>
        </div>
        <div class="form-body">
          <!-- Title -->
          <div class="form-group">
            <label>Look Title <span class="req">*</span></label>
            <input type="text" [(ngModel)]="formTitle" placeholder="e.g. Weekend Casual" />
          </div>

          <!-- Product Selection -->
          <div class="form-group">
            <label>Select Products (2-3) <span class="req">*</span></label>
            <p class="form-hint">Search and select products. The first product will be displayed as the hero (large) image.</p>

            <!-- Search -->
            <div class="product-search-wrap">
              <input type="text" [(ngModel)]="productSearch" (input)="searchProducts()" placeholder="Search products by name..." class="product-search" />
              <div class="search-dropdown" *ngIf="searchResults.length > 0 && productSearch.length > 0">
                <div class="search-item" *ngFor="let p of searchResults" (click)="selectProduct(p)" [class.already-selected]="isSelected(p.id)">
                  <img *ngIf="p.image_url" [src]="p.image_url" class="search-thumb" />
                  <div *ngIf="!p.image_url" class="search-thumb-placeholder"></div>
                  <div class="search-info">
                    <span class="search-name">{{ p.name }}</span>
                    <span class="search-price">₹{{ p.price }}</span>
                  </div>
                  <span *ngIf="isSelected(p.id)" class="selected-badge">Added</span>
                </div>
              </div>
              <div class="search-dropdown search-empty" *ngIf="searchResults.length === 0 && productSearch.length > 2 && !searching">
                <p>No products found</p>
              </div>
            </div>

            <!-- Selected Products -->
            <div class="selected-products" *ngIf="selectedProducts.length > 0">
              <p class="selected-label">Selected Products (drag to reorder — first = hero image):</p>
              <div class="sel-product" *ngFor="let sp of selectedProducts; let si = index">
                <span class="sel-order" [class.hero-badge]="si === 0">{{ si === 0 ? 'HERO' : si + 1 }}</span>
                <img *ngIf="sp.image_url" [src]="sp.image_url" class="sel-thumb" />
                <div *ngIf="!sp.image_url" class="sel-thumb-placeholder"></div>
                <div class="sel-info">
                  <span class="sel-name">{{ sp.name }}</span>
                  <span class="sel-price">₹{{ sp.price }}</span>
                </div>
                <div class="sel-actions">
                  <button *ngIf="si > 0" class="sel-move" (click)="moveProduct(si, -1)" title="Move up">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                  </button>
                  <button *ngIf="si < selectedProducts.length - 1" class="sel-move" (click)="moveProduct(si, 1)" title="Move down">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <button class="sel-remove" (click)="removeSelected(si)" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <div *ngIf="selectedProducts.length >= 3" class="max-notice">Maximum 3 products per look.</div>
          </div>

          <!-- Layout Preview -->
          <div class="form-group" *ngIf="selectedProducts.length >= 2">
            <label>Layout Preview</label>
            <div class="layout-preview" [class.two-items]="selectedProducts.length === 2" [class.three-items]="selectedProducts.length === 3">
              <div class="lp-item" *ngFor="let sp of selectedProducts; let si = index" [class.hero]="si === 0">
                <img *ngIf="sp.image_url" [src]="sp.image_url" />
                <div *ngIf="!sp.image_url" class="lp-placeholder">{{ sp.name?.charAt(0) }}</div>
                <span class="lp-label">{{ si === 0 ? 'Hero' : 'Product ' + (si + 1) }}</span>
              </div>
            </div>
          </div>

          <!-- Display Order -->
          <div class="form-group">
            <label>Display Order</label>
            <input type="number" [(ngModel)]="formOrder" placeholder="1" class="order-input" />
          </div>
        </div>

        <div class="form-footer">
          <button class="btn-cancel" (click)="closeForm()">Cancel</button>
          <button class="btn-save" (click)="saveLook()" [disabled]="saving || selectedProducts.length < 2 || !formTitle.trim()">
            {{ saving ? 'Saving...' : (editingLook ? 'Update Look' : 'Create Look') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btl-page { padding: 0; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
    .subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
    .btn-add {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: var(--primary-color); color: #fff;
      border: none; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-add:hover { opacity: 0.9; }

    /* Looks Grid */
    .looks-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 20px;
    }
    .look-card {
      border: 1px solid var(--border-color); background: #fff; overflow: hidden;
      transition: box-shadow 0.3s;
    }
    .look-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .look-card-preview { position: relative; height: 240px; background: var(--grey-light); overflow: hidden; }
    .look-order {
      position: absolute; top: 10px; left: 10px; background: var(--primary-color);
      color: #fff; padding: 3px 10px; font-size: 11px; font-weight: 700; z-index: 2;
    }
    .preview-layout {
      display: grid; width: 100%; height: 100%; gap: 2px;
    }
    .preview-layout.two-items { grid-template-columns: 1fr 1fr; }
    .preview-layout.three-items { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .preview-layout.three-items .hero { grid-row: 1 / 3; }
    .preview-item { position: relative; overflow: hidden; }
    .preview-item img { width: 100%; height: 100%; object-fit: cover; }
    .preview-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      background: #ddd; color: #888; font-size: 2rem; font-weight: 700;
    }
    .preview-label {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      padding: 20px 10px 8px; color: #fff;
    }
    .preview-name { display: block; font-size: 11px; font-weight: 600; }
    .preview-price { font-size: 12px; font-weight: 800; }
    .look-card-body { padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
    .look-card-body h3 { margin: 0; font-size: 0.95rem; font-weight: 700; flex: 1; }
    .product-count { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
    .look-card-actions { display: flex; gap: 6px; }
    .btn-edit, .btn-delete {
      padding: 5px 14px; font-size: 12px; font-weight: 600; cursor: pointer;
      border: 1px solid var(--border-color); background: #fff; color: var(--text-dark); transition: all 0.2s;
    }
    .btn-edit:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .btn-delete { color: #b91c1c; border-color: rgba(185,28,28,0.2); }
    .btn-delete:hover { background: #fef2f2; border-color: #b91c1c; }
    .empty-state { padding: 60px 20px; text-align: center; color: var(--text-muted); grid-column: 1 / -1; }
    .loading-msg { padding: 40px; text-align: center; color: var(--text-muted); grid-column: 1 / -1; }

    /* Form Panel */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; }
    .form-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 560px; max-width: 100%;
      background: #fff; z-index: 1000; display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    }
    .form-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color);
    }
    .form-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .btn-close { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
    .form-body { flex: 1; overflow-y: auto; padding: 24px; }
    .form-group { margin-bottom: 22px; }
    .form-group label {
      display: block; font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-dark); margin-bottom: 8px;
    }
    .req { color: #b91c1c; }
    .form-hint { font-size: 12px; color: var(--text-muted); margin: 0 0 10px; }
    .form-group input[type="text"],
    .form-group input[type="number"] {
      width: 100%; padding: 10px 14px; border: 1px solid var(--border-color);
      font-size: 14px; background: #fff; transition: border-color 0.2s; box-sizing: border-box;
    }
    .form-group input:focus { outline: none; border-color: var(--primary-color); }

    /* Product Search */
    .product-search-wrap { position: relative; }
    .product-search { width: 100%; }
    .search-dropdown {
      position: absolute; top: 100%; left: 0; right: 0; z-index: 10;
      background: #fff; border: 1px solid var(--border-color); max-height: 260px;
      overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    .search-empty p { padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px; margin: 0; }
    .search-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px;
      cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--border-color);
    }
    .search-item:last-child { border-bottom: none; }
    .search-item:hover { background: rgba(60,90,153,0.04); }
    .search-item.already-selected { opacity: 0.5; pointer-events: none; }
    .search-thumb { width: 40px; height: 40px; object-fit: cover; flex-shrink: 0; }
    .search-thumb-placeholder { width: 40px; height: 40px; background: var(--grey-light); flex-shrink: 0; }
    .search-info { flex: 1; min-width: 0; }
    .search-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-dark); }
    .search-price { font-size: 12px; color: var(--text-muted); }
    .selected-badge {
      font-size: 10px; font-weight: 700; color: var(--primary-color);
      background: rgba(60,90,153,0.1); padding: 2px 8px;
    }

    /* Selected Products */
    .selected-products { margin-top: 14px; }
    .selected-label { font-size: 12px; color: var(--text-muted); margin: 0 0 8px; }
    .sel-product {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border: 1px solid var(--border-color); margin-bottom: 6px; background: #fff;
      transition: box-shadow 0.2s;
    }
    .sel-product:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .sel-order {
      width: 32px; height: 24px; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; background: var(--grey-light); color: var(--text-muted);
      flex-shrink: 0;
    }
    .sel-order.hero-badge { background: var(--primary-color); color: #fff; font-size: 9px; width: auto; padding: 0 8px; }
    .sel-thumb { width: 44px; height: 44px; object-fit: cover; flex-shrink: 0; }
    .sel-thumb-placeholder { width: 44px; height: 44px; background: var(--grey-light); flex-shrink: 0; }
    .sel-info { flex: 1; min-width: 0; }
    .sel-name { display: block; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sel-price { font-size: 12px; color: var(--text-muted); }
    .sel-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .sel-move, .sel-remove {
      background: none; border: 1px solid var(--border-color); cursor: pointer; padding: 4px;
      display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all 0.2s;
    }
    .sel-move:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .sel-remove { color: #b91c1c; border-color: rgba(185,28,28,0.2); }
    .sel-remove:hover { background: #fef2f2; border-color: #b91c1c; }
    .max-notice { font-size: 12px; color: var(--text-muted); margin-top: 8px; font-style: italic; }

    /* Layout Preview */
    .layout-preview {
      display: grid; gap: 3px; height: 200px; overflow: hidden;
    }
    .layout-preview.two-items { grid-template-columns: 1fr 1fr; }
    .layout-preview.three-items { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
    .layout-preview.three-items .hero { grid-row: 1 / 3; }
    .lp-item { position: relative; overflow: hidden; background: var(--grey-light); }
    .lp-item img { width: 100%; height: 100%; object-fit: cover; }
    .lp-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 700; color: #aaa;
    }
    .lp-label {
      position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.6);
      color: #fff; padding: 2px 8px; font-size: 10px; font-weight: 600;
    }

    .order-input { width: 100px !important; }
    .form-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 16px 24px; border-top: 1px solid var(--border-color);
    }
    .btn-cancel {
      padding: 10px 20px; border: 1px solid var(--border-color);
      background: #fff; cursor: pointer; font-size: 13px; font-weight: 600;
    }
    .btn-save {
      padding: 10px 24px; background: var(--primary-color); color: #fff;
      border: none; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-save:hover { opacity: 0.9; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminBuyTheLookComponent implements OnInit {
  looks: Look[] = [];
  loading = false;
  showForm = false;
  saving = false;
  editingLook: Look | null = null;

  formTitle = '';
  formOrder = 1;

  productSearch = '';
  searching = false;
  searchResults: any[] = [];
  allProducts: any[] = [];
  selectedProducts: any[] = [];

  private searchTimeout: any;

  constructor(
    private lookService: BuyTheLookService,
    private productApi: ProductApiService
  ) {}

  ngOnInit() {
    this.loadLooks();
    this.loadAllProducts();
  }

  loadLooks() {
    this.loading = true;
    this.lookService.list().subscribe({
      next: (data) => { this.looks = data || []; this.loading = false; },
      error: () => { this.looks = []; this.loading = false; }
    });
  }

  loadAllProducts() {
    this.productApi.list({ per_page: 200 }).subscribe({
      next: (res) => { this.allProducts = res?.data || []; },
      error: () => { this.allProducts = []; }
    });
  }

  searchProducts() {
    clearTimeout(this.searchTimeout);
    if (this.productSearch.length < 1) {
      this.searchResults = [];
      return;
    }
    this.searching = true;
    this.searchTimeout = setTimeout(() => {
      const q = this.productSearch.toLowerCase();
      this.searchResults = this.allProducts.filter(
        (p: any) => p.name?.toLowerCase().includes(q)
      ).slice(0, 10);
      this.searching = false;
    }, 200);
  }

  isSelected(id: number): boolean {
    return this.selectedProducts.some(p => p.id === id);
  }

  selectProduct(product: any) {
    if (this.selectedProducts.length >= 3) return;
    if (this.isSelected(product.id)) return;
    this.selectedProducts.push({ ...product });
    this.productSearch = '';
    this.searchResults = [];
  }

  removeSelected(index: number) {
    this.selectedProducts.splice(index, 1);
  }

  moveProduct(index: number, dir: number) {
    const target = index + dir;
    if (target < 0 || target >= this.selectedProducts.length) return;
    const temp = this.selectedProducts[index];
    this.selectedProducts[index] = this.selectedProducts[target];
    this.selectedProducts[target] = temp;
  }

  getProductImg(p: any): string {
    return p.image_url || p.image || '';
  }

  openForm() {
    this.editingLook = null;
    this.formTitle = '';
    this.formOrder = this.looks.length + 1;
    this.selectedProducts = [];
    this.productSearch = '';
    this.searchResults = [];
    this.showForm = true;
  }

  editLook(look: Look) {
    this.editingLook = look;
    this.formTitle = look.title;
    this.formOrder = look.order || 1;
    this.selectedProducts = (look.products || []).map(lp => {
      const match = this.allProducts.find((p: any) => p.id === lp.product_id);
      return match ? { ...match } : {
        id: lp.product_id || lp.id,
        name: lp.name,
        price: lp.price,
        image_url: lp.image_url || lp.image || ''
      };
    });
    this.productSearch = '';
    this.searchResults = [];
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingLook = null;
  }

  saveLook() {
    if (!this.formTitle.trim() || this.selectedProducts.length < 2) return;
    this.saving = true;

    const payload: any = {
      title: this.formTitle.trim(),
      order: this.formOrder,
      product_ids: this.selectedProducts.map((p: any) => p.id)
    };

    const req = this.editingLook
      ? this.lookService.updateJson(this.editingLook.id!, payload)
      : this.lookService.createJson(payload);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.closeForm();
        this.loadLooks();
      },
      error: () => { this.saving = false; }
    });
  }

  deleteLook(look: Look) {
    if (!look.id) return;
    if (!confirm(`Delete "${look.title}"?`)) return;
    this.lookService.delete(look.id).subscribe(() => this.loadLooks());
  }
}
