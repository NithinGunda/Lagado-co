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
        <app-product-listing category="womens"></app-product-listing>
      </div>
    </div>
  `,
  styles: [`
    .womens-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-md) 0;
    }
  `]
})
export class WomensComponent {}
