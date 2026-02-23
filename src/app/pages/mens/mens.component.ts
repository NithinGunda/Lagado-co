import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from '../../components/product-listing/product-listing.component';

@Component({
  selector: 'app-mens',
  standalone: true,
  imports: [CommonModule, ProductListingComponent],
  template: `
    <div class="mens-page">
      <div class="container">
        <div class="page-header">
          <h1>Men's Collection</h1>
          <p>Premium fashion for the modern gentleman</p>
        </div>
        <app-product-listing category="mens"></app-product-listing>
      </div>
    </div>
  `,
  styles: [`
    .mens-page {
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
export class MensComponent {}
