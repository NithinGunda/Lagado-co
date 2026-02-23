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
        <app-product-listing></app-product-listing>
      </div>
    </div>
  `,
  styles: [`
    .collections-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-md) 0;
    }
  `]
})
export class CollectionsComponent {}
