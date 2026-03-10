import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FeaturedProductsService } from '../../../services/featured-products.service';

@Component({
  selector: 'app-admin-featured-products',
  template: `
    <div class="fp-page">
      <div class="page-header">
        <div>
          <h1>Featured Products</h1>
          <p class="subtitle">Products marked as featured are displayed on the homepage. Manage this from the product edit page.</p>
        </div>
      </div>

      <!-- Search -->
      <div class="filter-bar">
        <div class="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()" placeholder="Search featured products..." />
        </div>
        <span class="count-label">{{ filtered.length }} featured product{{ filtered.length !== 1 ? 's' : '' }}</span>
      </div>

      <div *ngIf="loading" class="loading-msg">Loading featured products...</div>

      <!-- Products Grid -->
      <div class="products-grid" *ngIf="!loading && filtered.length > 0">
        <div class="product-card" *ngFor="let p of filtered">
          <div class="card-img">
            <img *ngIf="p.image_url" [src]="p.image_url" [alt]="p.name" />
            <div *ngIf="!p.image_url" class="card-img-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <span class="featured-badge">Featured</span>
          </div>
          <div class="card-body">
            <h3>{{ p.name }}</h3>
            <div class="card-meta">
              <span class="card-price">₹{{ p.price }}</span>
              <span class="card-category" *ngIf="p.category">{{ p.category.name }}</span>
            </div>
            <p class="card-desc" *ngIf="p.description">{{ p.description }}</p>
          </div>
          <div class="card-actions">
            <button class="btn-edit" [routerLink]="['/admin/products', p.id, 'edit']">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Product
            </button>
            <button class="btn-unfeature" (click)="removeFeatured(p)" [disabled]="p._saving">
              {{ p._saving ? 'Removing...' : 'Remove from Featured' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && filtered.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <p *ngIf="searchQuery">No featured products match your search.</p>
        <p *ngIf="!searchQuery">No products are marked as featured yet.</p>
        <p class="empty-hint">To feature a product, go to <strong>Products</strong> → Edit a product → check the <strong>"Featured Product"</strong> checkbox.</p>
      </div>
    </div>
  `,
  styles: [`
    .fp-page { max-width: 1100px; }

    .page-header {
      margin-bottom: 24px;
    }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
    .subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.5; }

    .filter-bar {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 20px; flex-wrap: wrap;
    }
    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      padding: 0 14px; border: 1px solid var(--border-color);
      background: #fff; flex: 1; min-width: 220px;
    }
    .search-wrap svg { color: var(--text-muted); flex-shrink: 0; }
    .search-wrap input {
      border: none; outline: none; width: 100%;
      padding: 10px 0; font-size: 14px; background: transparent;
    }
    .count-label {
      font-size: 13px; color: var(--text-muted); white-space: nowrap;
      padding: 8px 16px; background: var(--secondary-color);
      border: 1px solid var(--border-color);
    }

    .loading-msg { padding: 40px; text-align: center; color: var(--text-muted); }

    /* Grid */
    .products-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .product-card {
      background: #fff; border: 1px solid var(--border-color);
      overflow: hidden; transition: box-shadow 0.2s;
    }
    .product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

    .card-img {
      position: relative; height: 180px; background: var(--grey-light);
      overflow: hidden;
    }
    .card-img img { width: 100%; height: 100%; object-fit: cover; }
    .card-img-placeholder {
      width: 100%; height: 100%; display: flex; align-items: center;
      justify-content: center; color: var(--text-muted);
    }
    .featured-badge {
      position: absolute; top: 10px; left: 10px;
      background: #f59e0b; color: #fff;
      padding: 3px 10px; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
    }

    .card-body { padding: 14px 16px; }
    .card-body h3 {
      margin: 0 0 8px; font-size: 0.95rem; font-weight: 700;
      color: var(--text-dark);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .card-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .card-price { font-size: 0.95rem; font-weight: 800; color: var(--primary-color); }
    .card-category {
      font-size: 11px; padding: 2px 8px;
      background: var(--secondary-color); color: var(--text-muted);
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .card-desc {
      font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-actions {
      padding: 12px 16px; border-top: 1px solid var(--border-color);
      display: flex; gap: 8px;
    }
    .btn-edit {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 14px; border: 1px solid var(--border-color);
      background: #fff; font-size: 12px; font-weight: 600;
      color: var(--text-dark); cursor: pointer; transition: all 0.2s;
      text-decoration: none;
    }
    .btn-edit:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .btn-unfeature {
      padding: 7px 14px; border: 1px solid rgba(185,28,28,0.2);
      background: #fff; font-size: 12px; font-weight: 600;
      color: #b91c1c; cursor: pointer; transition: all 0.2s;
      margin-left: auto;
    }
    .btn-unfeature:hover { background: #fef2f2; border-color: #b91c1c; }
    .btn-unfeature:disabled { opacity: 0.5; cursor: not-allowed; }

    .empty-state {
      padding: 60px 20px; text-align: center; color: var(--text-muted);
      display: flex; flex-direction: column; align-items: center; gap: 12px;
    }
    .empty-state p { margin: 0; font-size: 14px; }
    .empty-hint { font-size: 13px; max-width: 400px; line-height: 1.5; }
    .empty-hint strong { color: var(--text-dark); }
  `]
})
export class AdminFeaturedProductsComponent implements OnInit {
  allFeatured: any[] = [];
  filtered: any[] = [];
  loading = false;
  searchQuery = '';

  constructor(private featuredApi: FeaturedProductsService, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.featuredApi.list().subscribe({
      next: (res) => {
        const items = res || [];
        // latest featured first based on updated_at/created_at
        this.allFeatured = items
          .map((p: any) => ({ ...p, _saving: false }))
          .sort((a: any, b: any) => {
            const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
            const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
            return bTime - aTime;
          });
        this.filterProducts();
        this.loading = false;
      },
      error: () => { this.allFeatured = []; this.filtered = []; this.loading = false; }
    });
  }

  filterProducts() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filtered = [...this.allFeatured];
    } else {
      this.filtered = this.allFeatured.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
  }

  removeFeatured(product: any) {
    if (!confirm(`Remove "${product.name}" from featured products?`)) return;
    product._saving = true;
    this.featuredApi.update(product.id, { featured: false }).subscribe({
      next: () => {
        this.allFeatured = this.allFeatured.filter(p => p.id !== product.id);
        this.filterProducts();
      },
      error: () => { product._saving = false; }
    });
  }
}
