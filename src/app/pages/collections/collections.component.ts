import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from '../../components/product-listing/product-listing.component';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, ProductListingComponent],
  template: `
    <div class="collections-page">
      <app-product-listing></app-product-listing>
    </div>
  `,
  styles: [`
    .collections-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-sm) 0;
    }

    @media (max-width: 968px) {
      .collections-page {
        min-height: 0;
        padding-top: 0;
        padding-bottom: var(--spacing-xs);
      }
    }
  `]
})
export class CollectionsComponent {}
