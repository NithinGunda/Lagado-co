import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from '../../components/product-listing/product-listing.component';

@Component({
  selector: 'app-womens',
  standalone: true,
  imports: [CommonModule, ProductListingComponent],
  template: `
    <div class="womens-page">
      <div class="container">
        <div class="page-header">
          <h1>Women's Collection</h1>
          <p>Elegant fashion for the sophisticated woman</p>
        </div>
        <app-product-listing category="womens"></app-product-listing>
      </div>
    </div>
  `,
  styles: [`
    .womens-page {
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
export class WomensComponent {}
