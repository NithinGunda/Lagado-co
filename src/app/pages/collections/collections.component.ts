import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from '../../components/product-listing/product-listing.component';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, ProductListingComponent],
  template: `
    <div class="collections-page">
      <div class="container">
        <div class="page-header">
          <h1>All Collections</h1>
          <p>Discover our complete range of premium fashion</p>
        </div>
        <app-product-listing></app-product-listing>
      </div>
    </div>
  `,
  styles: [`
    .collections-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-lg) 0;
    }

    .page-header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }

    .page-header h1 {
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    .page-header p {
      color: var(--text-light);
      font-size: 1.125rem;
    }
  `]
})
export class CollectionsComponent {}
