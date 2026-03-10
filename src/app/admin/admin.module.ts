import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './components/layout/layout.component';
import { AdminLoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminProductsComponent } from './components/products/products.component';
import { AdminProductFormComponent } from './components/product-form/product-form.component';
import { AdminCategoriesComponent } from './components/categories/categories.component';
import { AdminOrdersComponent } from './components/orders/orders.component';
import { AdminCarouselComponent } from './components/carousel/carousel.component';
import { AdminFeaturedProductsComponent } from './components/featured-products/featured-products.component';
import { AdminCouponsComponent } from './components/coupons/coupons.component';
import { AdminBuyTheLookComponent } from './components/buy-the-look/buy-the-look.component';
import { AdminSubcategoriesComponent } from './components/subcategories/subcategories.component';

const routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full' as const, redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'carousel', component: AdminCarouselComponent },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'subcategories', component: AdminSubcategoriesComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'products/new', component: AdminProductFormComponent },
      { path: 'products/:id/edit', component: AdminProductFormComponent },
      { path: 'featured-products', component: AdminFeaturedProductsComponent },
      { path: 'coupons', component: AdminCouponsComponent },
      { path: 'buy-the-look', component: AdminBuyTheLookComponent },
      { path: 'orders', component: AdminOrdersComponent }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    AdminLayoutComponent,
    ImageCropperComponent
  ],
  declarations: [
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminCarouselComponent,
    AdminProductsComponent,
    AdminProductFormComponent,
    AdminCategoriesComponent,
    AdminSubcategoriesComponent,
    AdminFeaturedProductsComponent,
    AdminCouponsComponent,
    AdminBuyTheLookComponent,
    AdminOrdersComponent
  ]
})
export class AdminModule {}
