import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from '../../components/product-listing/product-listing.component';

@Component({
  selector: 'app-womens',
  standalone: true,
  imports: [CommonModule, ProductListingComponent],
  template: `
    <div class="womens-page">
      <app-product-listing category="womens"></app-product-listing>
    </div>
  `,
  styles: [`
    .womens-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-sm) 0;
    }
    @media (max-width: 768px) {
      .womens-page {
        padding: 8px 0 var(--spacing-sm);
      }
    }
  `]
})
export class WomensComponent {}
