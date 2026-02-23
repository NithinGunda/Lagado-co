import { Component, OnInit } from '@angular/core';
import { of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CategoryService } from '../../../services/category.service';
import { ProductApiService } from '../../../services/product-api.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p class="subtitle">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div class="header-actions">
          <span class="date-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            {{ todayFormatted }}
          </span>
        </div>
      </div>

      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Stat Cards Row -->
        <div class="stats-row">
          <div class="stat-card" *ngFor="let s of statCards; let i = index" [style.animation-delay]="(i * 80) + 'ms'">
            <div class="stat-icon" [style.background]="s.bg">
              <svg [attr.width]="24" [attr.height]="24" viewBox="0 0 24 24" fill="none" [attr.stroke]="s.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="s.iconPath"></svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ s.label }}</span>
              <span class="stat-value">{{ s.prefix }}{{ s.value | number }}</span>
              <span class="stat-change" [class.positive]="s.changePositive" [class.negative]="!s.changePositive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline *ngIf="s.changePositive" points="18 15 12 9 6 15"></polyline>
                  <polyline *ngIf="!s.changePositive" points="6 9 12 15 18 9"></polyline>
                </svg>
                {{ s.change }}
              </span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- Revenue Chart -->
          <div class="chart-card revenue-chart">
            <div class="card-header">
              <div>
                <h3>Revenue Overview</h3>
                <p class="card-subtitle">Monthly revenue for the current year</p>
              </div>
              <div class="chart-legend">
                <span class="legend-dot" style="background:#3c5a99"></span> Revenue
                <span class="legend-dot" style="background:#e8c547"></span> Orders
              </div>
            </div>
            <div class="bar-chart">
              <div class="bar-y-axis">
                <span *ngFor="let tick of yTicks">{{ formatCompact(tick) }}</span>
              </div>
              <div class="bar-container">
                <div class="bar-group" *ngFor="let m of monthlyData; let i = index">
                  <div class="bar-wrapper">
                    <div class="bar revenue-bar" [style.height.%]="getBarHeight(m.revenue)" [style.animation-delay]="(i * 60) + 'ms'"
                      [title]="'₹' + (m.revenue | number)">
                    </div>
                    <div class="bar orders-bar" [style.height.%]="getOrderBarHeight(m.orders)" [style.animation-delay]="(i * 60 + 30) + 'ms'"
                      [title]="m.orders + ' orders'">
                    </div>
                  </div>
                  <span class="bar-label">{{ m.month }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Donut Chart -->
          <div class="chart-card donut-chart-card">
            <div class="card-header">
              <div>
                <h3>Order Status</h3>
                <p class="card-subtitle">Current order distribution</p>
              </div>
            </div>
            <div class="donut-wrapper">
              <svg class="donut-svg" viewBox="0 0 200 200">
                <circle *ngFor="let seg of donutSegments"
                  cx="100" cy="100" r="70"
                  fill="none"
                  [attr.stroke]="seg.color"
                  stroke-width="28"
                  [attr.stroke-dasharray]="seg.dash"
                  [attr.stroke-dashoffset]="seg.offset"
                  [style.animation-delay]="seg.delay + 'ms'"
                  class="donut-segment"
                />
              </svg>
              <div class="donut-center">
                <span class="donut-total">{{ totalOrders }}</span>
                <span class="donut-label">Total</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item" *ngFor="let seg of donutSegments">
                <span class="legend-color" [style.background]="seg.color"></span>
                <span class="legend-text">{{ seg.label }}</span>
                <span class="legend-value">{{ seg.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="bottom-row">
          <!-- Recent Orders -->
          <div class="chart-card recent-orders-card">
            <div class="card-header">
              <h3>Recent Orders</h3>
              <a routerLink="/admin/orders" class="view-all">View all →</a>
            </div>
            <div class="orders-list" *ngIf="recentOrders.length > 0">
              <div class="order-item" *ngFor="let o of recentOrders; let i = index" [style.animation-delay]="(i * 50) + 'ms'">
                <div class="order-left">
                  <span class="order-id">#{{ o.id }}</span>
                  <span class="order-customer">{{ o.user?.name || o.customer_name || 'Customer' }}</span>
                </div>
                <div class="order-right">
                  <span class="order-amount">{{ formatPrice(o.total) }}</span>
                  <span class="order-status" [class]="'os-' + (o.status || 'pending')">{{ o.status || 'pending' }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="recentOrders.length === 0" class="empty-card">No recent orders</div>
          </div>

          <!-- Top Products -->
          <div class="chart-card top-products-card">
            <div class="card-header">
              <h3>Top Products</h3>
              <a routerLink="/admin/products" class="view-all">View all →</a>
            </div>
            <div class="products-list" *ngIf="topProducts.length > 0">
              <div class="product-item" *ngFor="let p of topProducts; let i = index" [style.animation-delay]="(i * 50) + 'ms'">
                <div class="product-rank">{{ i + 1 }}</div>
                <div class="product-thumb">
                  <img *ngIf="getThumb(p)" [src]="getThumb(p)" alt="" />
                  <span *ngIf="!getThumb(p)" class="no-thumb">{{ (p.name || '?')[0] }}</span>
                </div>
                <div class="product-info">
                  <span class="product-name">{{ p.name }}</span>
                  <span class="product-price">{{ formatPrice(p.price) }}</span>
                </div>
                <div class="product-bar-wrap">
                  <div class="product-bar" [style.width.%]="getProductBar(p, i)"></div>
                </div>
              </div>
            </div>
            <div *ngIf="topProducts.length === 0" class="empty-card">No products yet</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-card">
          <h3>Quick Actions</h3>
          <div class="qa-grid">
            <a routerLink="/admin/products/new" class="qa-item">
              <div class="qa-icon" style="background: #e8f5e9; color: #2e7d32;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span>Add Product</span>
            </a>
            <a routerLink="/admin/categories" class="qa-item">
              <div class="qa-icon" style="background: #e3f2fd; color: #1565c0;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <span>Categories</span>
            </a>
            <a routerLink="/admin/orders" class="qa-item">
              <div class="qa-icon" style="background: #fff3e0; color: #e65100;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path></svg>
              </div>
              <span>Orders</span>
            </a>
            <a routerLink="/admin/coupons" class="qa-item">
              <div class="qa-icon" style="background: #fce4ec; color: #c62828;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"></path></svg>
              </div>
              <span>Coupons</span>
            </a>
            <a routerLink="/admin/carousel" class="qa-item">
              <div class="qa-icon" style="background: #f3e5f5; color: #7b1fa2;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <span>Carousel</span>
            </a>
            <a routerLink="/" target="_blank" class="qa-item">
              <div class="qa-icon" style="background: #e0f2f1; color: #00695c;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </div>
              <span>View Store</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1100px; }

    /* Header */
    .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .dash-header h1 { margin: 0; font-size: 1.6rem; }
    .subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-light); }
    .date-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light); font-size: 13px; color: var(--text-light); }

    /* Loading */
    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 20px; color: var(--text-light); }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Stat Cards */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: var(--text-white); padding: 20px; box-shadow: 0 1px 4px var(--shadow-light);
      display: flex; align-items: flex-start; gap: 16px;
      animation: fadeSlideUp 0.4s ease both;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px var(--shadow-medium); }
    @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    .stat-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #888; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-dark); line-height: 1.2; }
    .stat-change { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; font-weight: 600; }
    .stat-change.positive { color: #2e7d32; }
    .stat-change.negative { color: #c62828; }

    /* Chart cards */
    .chart-card {
      background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light);
      padding: 24px; animation: fadeSlideUp 0.5s ease both;
    }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .card-header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
    .card-subtitle { margin: 4px 0 0; font-size: 12px; color: var(--text-light); }
    .view-all { font-size: 13px; color: var(--primary-color); text-decoration: none; font-weight: 500; white-space: nowrap; }
    .view-all:hover { text-decoration: underline; }

    /* Charts Row */
    .charts-row { display: grid; grid-template-columns: 1fr 360px; gap: 16px; margin-bottom: 24px; }

    /* Bar chart */
    .chart-legend { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-light); }
    .legend-dot { display: inline-block; width: 10px; height: 10px; margin-right: 4px; }
    .bar-chart { display: flex; gap: 0; }
    .bar-y-axis { display: flex; flex-direction: column-reverse; justify-content: space-between; padding-bottom: 28px; width: 44px; text-align: right; font-size: 10px; color: #999; flex-shrink: 0; }
    .bar-container { display: flex; align-items: flex-end; gap: 6px; flex: 1; height: 220px; padding-bottom: 28px; border-left: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); position: relative; }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
    .bar-wrapper { flex: 1; display: flex; align-items: flex-end; gap: 3px; width: 100%; justify-content: center; }
    .bar {
      width: 14px; min-height: 2px;
      animation: barGrow 0.6s ease both;
      transition: opacity 0.2s;
      cursor: pointer;
    }
    .bar:hover { opacity: 0.8; }
    @keyframes barGrow { from { height: 0 !important; } }
    .revenue-bar { background: linear-gradient(180deg, #3c5a99 0%, #2a4070 100%); }
    .orders-bar { background: linear-gradient(180deg, #e8c547 0%, #d4a017 100%); width: 10px; }
    .bar-label { font-size: 10px; color: #888; margin-top: 8px; text-align: center; }

    /* Donut */
    .donut-wrapper { position: relative; width: 180px; height: 180px; margin: 0 auto 20px; }
    .donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .donut-segment {
      animation: donutDraw 1s ease both;
      transition: opacity 0.2s;
    }
    .donut-segment:hover { opacity: 0.8; }
    @keyframes donutDraw { from { stroke-dasharray: 0 999; } }
    .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .donut-total { font-size: 1.6rem; font-weight: 700; color: var(--text-dark); }
    .donut-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .legend-color { width: 12px; height: 12px; flex-shrink: 0; }
    .legend-text { flex: 1; color: var(--text-dark); }
    .legend-value { font-weight: 600; color: var(--text-dark); }

    /* Bottom row */
    .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }

    /* Recent orders */
    .orders-list { display: flex; flex-direction: column; gap: 0; }
    .order-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid var(--border-color);
      animation: fadeSlideUp 0.4s ease both;
    }
    .order-item:last-child { border-bottom: none; }
    .order-left { display: flex; flex-direction: column; gap: 2px; }
    .order-id { font-weight: 600; font-size: 14px; color: var(--text-dark); }
    .order-customer { font-size: 12px; color: var(--text-light); }
    .order-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .order-amount { font-weight: 600; font-size: 14px; }
    .order-status { font-size: 11px; font-weight: 600; padding: 3px 10px; text-transform: capitalize; }
    .os-pending { background: #fff3cd; color: #856404; }
    .os-processing { background: #cce5ff; color: #004085; }
    .os-shipped { background: #d1ecf1; color: #0c5460; }
    .os-completed { background: #d4edda; color: #155724; }
    .os-cancelled { background: #f8d7da; color: #721c24; }

    /* Top products */
    .products-list { display: flex; flex-direction: column; gap: 0; }
    .product-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid var(--border-color);
      animation: fadeSlideUp 0.4s ease both;
    }
    .product-item:last-child { border-bottom: none; }
    .product-rank { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; background: var(--primary-color); flex-shrink: 0; }
    .product-thumb { width: 40px; height: 40px; overflow: hidden; border: 1px solid var(--border-color); flex-shrink: 0; }
    .product-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .no-thumb { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--secondary-color); color: var(--primary-color); font-weight: 700; font-size: 16px; }
    .product-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
    .product-name { font-size: 14px; font-weight: 500; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .product-price { font-size: 12px; color: var(--text-light); }
    .product-bar-wrap { width: 60px; height: 6px; background: var(--grey-light, #eee); flex-shrink: 0; overflow: hidden; }
    .product-bar { height: 100%; background: linear-gradient(90deg, #3c5a99, #e8c547); animation: barGrow 0.8s ease both; }

    .empty-card { padding: 32px; text-align: center; color: var(--text-light); font-size: 14px; }

    /* Quick Actions */
    .quick-actions-card { background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light); padding: 24px; animation: fadeSlideUp 0.6s ease both; }
    .quick-actions-card h3 { margin: 0 0 16px; font-size: 1rem; font-weight: 600; }
    .qa-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
    .qa-item {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 16px 8px; text-decoration: none; color: var(--text-dark);
      font-size: 13px; font-weight: 500; transition: all 0.2s;
    }
    .qa-item:hover { transform: translateY(-2px); }
    .qa-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }

    /* Responsive */
    @media (max-width: 1024px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .bottom-row { grid-template-columns: 1fr; }
      .qa-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 600px) {
      .stats-row { grid-template-columns: 1fr; }
      .qa-grid { grid-template-columns: repeat(2, 1fr); }
      .dash-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  loading = true;

  statCards: any[] = [];
  monthlyData: any[] = [];
  yTicks: number[] = [];
  donutSegments: any[] = [];
  totalOrders = 0;
  recentOrders: any[] = [];
  topProducts: any[] = [];
  todayFormatted = '';

  private maxRevenue = 0;
  private maxOrders = 0;

  constructor(
    private categoryService: CategoryService,
    private productApi: ProductApiService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.todayFormatted = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
    });
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    forkJoin({
      categories: this.categoryService.list({ per_page: 1 }).pipe(catchError(() => of({ data: [], total: 0 }))),
      products: this.productApi.list({ per_page: 50 }).pipe(catchError(() => of({ data: [], total: 0 }))),
      orders: this.orderService.list({ per_page: 50, sort_by: 'created_at', sort_order: 'desc' }).pipe(catchError(() => of({ data: [], total: 0 })))
    }).subscribe(({ categories, products, orders }) => {
      const catCount = categories?.total ?? categories?.data?.length ?? 0;
      const prodList = products?.data ?? [];
      const prodCount = products?.total ?? prodList.length;
      const orderList = orders?.data ?? (Array.isArray(orders) ? orders : []);
      const orderCount = orders?.total ?? orderList.length;

      const totalRevenue = orderList.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
      const completedOrders = orderList.filter((o: any) => o.status === 'completed').length;
      const pendingOrders = orderList.filter((o: any) => o.status === 'pending').length;
      const processingOrders = orderList.filter((o: any) => o.status === 'processing').length;
      const shippedOrders = orderList.filter((o: any) => o.status === 'shipped').length;
      const cancelledOrders = orderList.filter((o: any) => o.status === 'cancelled').length;
      const otherOrders = orderCount - completedOrders - pendingOrders - processingOrders - shippedOrders - cancelledOrders;
      const avgOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

      this.statCards = [
        { label: 'Total Revenue', value: totalRevenue, prefix: '₹', bg: '#eef2ff', color: '#3c5a99', iconPath: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>', change: '+12.5%', changePositive: true },
        { label: 'Total Orders', value: orderCount, prefix: '', bg: '#fff8e1', color: '#f9a825', iconPath: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path>', change: '+8.2%', changePositive: true },
        { label: 'Products', value: prodCount, prefix: '', bg: '#e8f5e9', color: '#2e7d32', iconPath: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path>', change: '+' + catCount + ' categories', changePositive: true },
        { label: 'Avg. Order Value', value: avgOrderValue, prefix: '₹', bg: '#fce4ec', color: '#c62828', iconPath: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>', change: avgOrderValue > 0 ? '+5.1%' : '—', changePositive: true }
      ];

      this.buildMonthlyChart(orderList);
      this.buildDonut(pendingOrders, processingOrders, shippedOrders, completedOrders, cancelledOrders, otherOrders);
      this.recentOrders = orderList.slice(0, 6);
      this.topProducts = prodList.slice(0, 5);
      this.loading = false;
    });
  }

  private buildMonthlyChart(orders: any[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentYear = now.getFullYear();
    const revenueByMonth: number[] = new Array(12).fill(0);
    const ordersByMonth: number[] = new Array(12).fill(0);

    orders.forEach((o: any) => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      if (d.getFullYear() === currentYear) {
        const m = d.getMonth();
        revenueByMonth[m] += Number(o.total) || 0;
        ordersByMonth[m]++;
      }
    });

    this.maxRevenue = Math.max(...revenueByMonth, 1);
    this.maxOrders = Math.max(...ordersByMonth, 1);
    const niceMax = Math.ceil(this.maxRevenue / 10000) * 10000 || 50000;
    this.yTicks = [0, niceMax * 0.25, niceMax * 0.5, niceMax * 0.75, niceMax];
    this.maxRevenue = niceMax;

    this.monthlyData = months.map((month, i) => ({
      month,
      revenue: revenueByMonth[i],
      orders: ordersByMonth[i]
    }));
  }

  private buildDonut(pending: number, processing: number, shipped: number, completed: number, cancelled: number, other: number) {
    const segments = [
      { label: 'Completed', value: completed, color: '#2e7d32' },
      { label: 'Pending', value: pending, color: '#f9a825' },
      { label: 'Processing', value: processing, color: '#1565c0' },
      { label: 'Shipped', value: shipped, color: '#00838f' },
      { label: 'Cancelled', value: cancelled, color: '#c62828' },
    ].filter(s => s.value > 0);

    if (other > 0) segments.push({ label: 'Other', value: other, color: '#888' });
    this.totalOrders = segments.reduce((s, x) => s + x.value, 0);
    if (this.totalOrders === 0) {
      segments.push({ label: 'No Orders', value: 1, color: '#ddd' });
      this.totalOrders = 0;
    }

    const total = segments.reduce((s, x) => s + x.value, 0);
    const circumference = 2 * Math.PI * 70;
    let offset = 0;

    this.donutSegments = segments.map((seg, i) => {
      const pct = seg.value / total;
      const dash = `${pct * circumference} ${circumference}`;
      const segOffset = -offset;
      offset += pct * circumference;
      return { ...seg, dash, offset: segOffset, delay: i * 150 };
    });
  }

  getBarHeight(revenue: number): number {
    return this.maxRevenue > 0 ? (revenue / this.maxRevenue) * 100 : 0;
  }

  getOrderBarHeight(orders: number): number {
    return this.maxOrders > 0 ? (orders / this.maxOrders) * 80 : 0;
  }

  formatCompact(n: number): string {
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
    if (n > 0) return '₹' + n;
    return '0';
  }

  formatPrice(price: number): string {
    return price != null ? `₹${Number(price).toLocaleString()}` : '—';
  }

  getThumb(p: any): string | null {
    if (p.images?.length) return p.images[0];
    if (p.image_url) return p.image_url;
    return null;
  }

  getProductBar(p: any, index: number): number {
    return Math.max(20, 100 - (index * 18));
  }
}
