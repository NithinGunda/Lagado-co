import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListingComponent } from '../../components/product-listing/product-listing.component';

@Component({
  selector: 'app-mens',
  standalone: true,
  imports: [CommonModule, ProductListingComponent],
  template: `
    <div class="mens-page">
      <app-product-listing category="mens"></app-product-listing>
    </div>
  `,
  styles: [`
    .mens-page {
      min-height: calc(100vh - 200px);
      padding: var(--spacing-sm) 0;
    }
  `]
})
export class MensComponent {}
