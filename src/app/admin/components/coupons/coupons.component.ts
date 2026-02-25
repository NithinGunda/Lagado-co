import { Component, OnInit } from '@angular/core';
import { CouponService, Coupon } from '../../../services/coupon.service';

@Component({
  selector: 'app-admin-coupons',
  template: `
    <div class="coupons-page">
      <div class="page-header">
        <div>
          <h1>Coupons</h1>
          <p class="subtitle">Create and manage discount coupons for your store</p>
        </div>
        <button class="btn-add" (click)="openAdd()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Coupon
        </button>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Search by code or description..." />
        </div>
        <select [(ngModel)]="filterStatus" (change)="load()" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select [(ngModel)]="filterType" (change)="load()" class="filter-select">
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="stats-row" *ngIf="coupons.length > 0">
        <div class="stat-card">
          <span class="stat-val">{{ coupons.length }}</span>
          <span class="stat-label">Total Coupons</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ activeCoupons }}</span>
          <span class="stat-label">Active</span>
        </div>
        <div class="stat-card">
          <span class="stat-val">{{ totalUsed }}</span>
          <span class="stat-label">Total Uses</span>
        </div>
      </div>

      <div *ngIf="error" class="error-banner">{{ error }}</div>
      <div *ngIf="loading" class="loading-msg">Loading coupons...</div>

      <!-- Coupons Table -->
      <div class="table-wrap" *ngIf="!loading && coupons.length > 0">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Validity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of coupons" [class.inactive-row]="!c.is_active">
              <td>
                <span class="coupon-code">{{ c.code }}</span>
              </td>
              <td class="desc-cell">{{ c.description || '—' }}</td>
              <td>
                <span class="discount-badge" [class.pct]="c.discount_type === 'percentage'" [class.fixed]="c.discount_type === 'fixed'">
                  <span *ngIf="c.discount_type === 'percentage'">{{ c.discount_value }}%</span>
                  <span *ngIf="c.discount_type === 'fixed'">₹{{ c.discount_value }}</span>
                </span>
              </td>
              <td>{{ c.min_order_amount ? '₹' + c.min_order_amount : '—' }}</td>
              <td>
                <div class="usage-info">
                  <span>{{ c.used_count || 0 }} / {{ c.usage_limit || '∞' }}</span>
                  <div class="usage-bar" *ngIf="c.usage_limit">
                    <div class="usage-fill" [style.width.%]="((c.used_count || 0) / c.usage_limit) * 100"></div>
                  </div>
                </div>
              </td>
              <td class="date-cell">
                <span *ngIf="c.valid_from || c.valid_until">
                  {{ formatDate(c.valid_from) }} — {{ formatDate(c.valid_until) }}
                </span>
                <span *ngIf="!c.valid_from && !c.valid_until" class="muted">No limit</span>
                <span *ngIf="isExpired(c)" class="expired-tag">Expired</span>
              </td>
              <td>
                <span class="status-badge" [class.active]="c.is_active" [class.inactive]="!c.is_active">
                  {{ c.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-icon" (click)="edit(c)" title="Edit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon delete" (click)="confirmDelete(c)" title="Delete">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && coupons.length === 0 && !editing" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        <p>No coupons found. Create one to get started.</p>
      </div>

      <!-- Form Panel -->
      <div class="modal-backdrop" *ngIf="editing" (click)="cancel()"></div>
      <div class="form-panel" *ngIf="editing">
        <div class="form-header">
          <h2>{{ editing.id ? 'Edit Coupon' : 'New Coupon' }}</h2>
          <button class="btn-close" (click)="cancel()">&times;</button>
        </div>
        <div class="form-body">
          <div class="form-group">
            <label>Coupon Code <span class="req">*</span></label>
            <input type="text" [(ngModel)]="editing.code" placeholder="e.g. WELCOME10"
                   [class.code-input]="true" style="text-transform: uppercase;"
                   [disabled]="!!editing.id" />
            <small class="help-text" *ngIf="!editing.id">Cannot be changed after creation</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Discount Type <span class="req">*</span></label>
              <select [(ngModel)]="editing.discount_type">
                <option [ngValue]="undefined">Select type</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Discount Value <span class="req">*</span></label>
              <div class="input-with-unit">
                <span class="unit">{{ editing.discount_type === 'percentage' ? '%' : '₹' }}</span>
                <input type="number" [(ngModel)]="editing.discount_value" placeholder="10" min="0" step="0.01" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="editing.description" placeholder="e.g. 10% off for new customers" rows="2"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Min Order Amount</label>
              <div class="input-with-unit">
                <span class="unit">₹</span>
                <input type="number" [(ngModel)]="editing.min_order_amount" placeholder="No minimum" min="0" step="1" />
              </div>
            </div>
            <div class="form-group">
              <label>Usage Limit</label>
              <input type="number" [(ngModel)]="editing.usage_limit" placeholder="Unlimited" min="1" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Valid From</label>
              <input type="datetime-local" [(ngModel)]="editing.valid_from" />
            </div>
            <div class="form-group">
              <label>Valid Until</label>
              <input type="datetime-local" [(ngModel)]="editing.valid_until" />
            </div>
          </div>

          <div class="form-group">
            <label class="toggle-row">
              <input type="checkbox" [(ngModel)]="editing.is_active" />
              <span>Active</span>
            </label>
          </div>

          <!-- Preview -->
          <div class="coupon-preview" *ngIf="editing.code && editing.discount_type">
            <div class="preview-label">Preview</div>
            <div class="preview-card">
              <div class="preview-left">
                <span class="preview-discount" *ngIf="editing.discount_type === 'percentage'">{{ editing.discount_value || 0 }}% OFF</span>
                <span class="preview-discount" *ngIf="editing.discount_type === 'fixed'">₹{{ editing.discount_value || 0 }} OFF</span>
                <span class="preview-min" *ngIf="editing.min_order_amount">Min order: ₹{{ editing.min_order_amount }}</span>
              </div>
              <div class="preview-right">
                <span class="preview-code">{{ editing.code | uppercase }}</span>
                <span class="preview-validity" *ngIf="editing.valid_until">Expires {{ formatDate(editing.valid_until) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <button class="btn-cancel" (click)="cancel()">Cancel</button>
          <button class="btn-save" (click)="save()" [disabled]="saving || !editing.code || !editing.discount_type">
            {{ saving ? 'Saving...' : (editing.id ? 'Update Coupon' : 'Create Coupon') }}
          </button>
        </div>
      </div>

      <!-- Delete Confirm -->
      <div class="modal-backdrop" *ngIf="toDelete" (click)="toDelete = null"></div>
      <div class="delete-dialog" *ngIf="toDelete">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <h3>Delete Coupon</h3>
        <p>Are you sure you want to delete <strong>{{ toDelete.code }}</strong>?</p>
        <div class="dialog-actions">
          <button class="btn-cancel" (click)="toDelete = null">Cancel</button>
          <button class="btn-delete-confirm" (click)="deleteConfirm()" [disabled]="saving">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coupons-page { max-width: 1100px; }

    /* Header */
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
    }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; color: var(--text-dark); }
    .subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
    .btn-add {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: var(--primary-color); color: #fff;
      border: none; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-add:hover { opacity: 0.9; }

    /* Filters */
    .filter-bar {
      display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      padding: 0 14px; border: 1px solid var(--border-color);
      background: #fff; flex: 1; min-width: 220px;
    }
    .search-wrap svg { color: var(--text-muted); flex-shrink: 0; }
    .search-wrap input {
      border: none; outline: none; width: 100%;
      padding: 10px 0; font-size: 14px; background: transparent;
    }
    .filter-select {
      padding: 10px 14px; border: 1px solid var(--border-color);
      background: #fff; font-size: 13px; min-width: 140px;
      cursor: pointer; color: var(--text-dark);
    }

    /* Stats */
    .stats-row {
      display: flex; gap: 16px; margin-bottom: 20px;
    }
    .stat-card {
      flex: 1; background: #fff; padding: 16px 20px;
      border: 1px solid var(--border-color);
      display: flex; flex-direction: column; gap: 4px;
    }
    .stat-val { font-size: 1.4rem; font-weight: 800; color: var(--text-dark); }
    .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

    .error-banner { background: #fef2f2; color: #b91c1c; padding: 12px 16px; font-size: 13px; margin-bottom: 16px; border: 1px solid rgba(185,28,28,0.15); }
    .loading-msg { padding: 40px; text-align: center; color: var(--text-muted); }

    /* Table */
    .table-wrap {
      background: #fff; border: 1px solid var(--border-color);
      overflow-x: auto;
    }
    table { width: 100%; border-collapse: collapse; }
    thead { background: var(--secondary-color); }
    th {
      padding: 12px 16px; text-align: left; font-size: 11px;
      font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
      color: var(--text-dark); white-space: nowrap;
      border-bottom: 2px solid var(--border-color);
    }
    td { padding: 14px 16px; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-dark); }
    tr:hover { background: rgba(60,90,153,0.02); }
    tr.inactive-row { opacity: 0.6; }

    .coupon-code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-weight: 700; font-size: 13px;
      background: var(--secondary-color); padding: 4px 10px;
      border: 1px dashed var(--border-color);
      letter-spacing: 1px; white-space: nowrap;
    }
    .desc-cell { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted); }

    .discount-badge {
      display: inline-block; padding: 4px 10px;
      font-size: 12px; font-weight: 700;
    }
    .discount-badge.pct { background: #ecfdf5; color: #059669; }
    .discount-badge.fixed { background: #eff6ff; color: #2563eb; }

    .usage-info { min-width: 80px; }
    .usage-info span { font-size: 12px; display: block; margin-bottom: 4px; }
    .usage-bar { width: 80px; height: 4px; background: var(--border-color); overflow: hidden; }
    .usage-fill { height: 100%; background: var(--primary-color); transition: width 0.3s; }

    .date-cell { font-size: 12px; white-space: nowrap; }
    .muted { color: var(--text-muted); }
    .expired-tag {
      display: inline-block; margin-left: 6px;
      font-size: 10px; font-weight: 700; color: #b91c1c;
      background: #fef2f2; padding: 2px 6px;
    }

    .status-badge {
      display: inline-block; padding: 4px 12px;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .status-badge.active { background: #ecfdf5; color: #059669; }
    .status-badge.inactive { background: #fef2f2; color: #b91c1c; }

    .action-btns { display: flex; gap: 6px; }
    .btn-icon {
      background: none; border: 1px solid var(--border-color);
      padding: 6px; cursor: pointer; color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .btn-icon:hover { border-color: var(--primary-color); color: var(--primary-color); }
    .btn-icon.delete:hover { border-color: #b91c1c; color: #b91c1c; }

    .empty-state {
      padding: 60px 20px; text-align: center; color: var(--text-muted);
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .empty-state p { margin: 0; font-size: 14px; }

    /* Form Panel */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; }
    .form-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 520px; max-width: 100%;
      background: #fff; z-index: 1000; display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    }
    .form-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px 24px; border-bottom: 1px solid var(--border-color);
    }
    .form-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .btn-close { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
    .form-body { flex: 1; overflow-y: auto; padding: 24px; }

    .form-group { margin-bottom: 18px; }
    .form-group label {
      display: block; font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
      color: var(--text-dark); margin-bottom: 6px;
    }
    .req { color: #b91c1c; }
    .help-text { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }
    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group input[type="datetime-local"],
    .form-group select,
    .form-group textarea {
      width: 100%; padding: 10px 14px; border: 1px solid var(--border-color);
      font-size: 14px; background: #fff; box-sizing: border-box;
      transition: border-color 0.2s; font-family: inherit;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus { outline: none; border-color: var(--primary-color); }
    .form-group input:disabled { background: var(--grey-light); color: var(--text-muted); }
    .form-group textarea { resize: vertical; min-height: 60px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .input-with-unit { position: relative; display: flex; align-items: center; }
    .unit {
      position: absolute; left: 12px; color: var(--text-muted);
      font-weight: 600; font-size: 14px; pointer-events: none;
    }
    .input-with-unit input { padding-left: 30px !important; }

    .toggle-row {
      display: flex; align-items: center; gap: 10px;
      font-size: 14px; font-weight: 500; cursor: pointer;
      text-transform: none !important; letter-spacing: 0 !important;
    }
    .toggle-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--primary-color); cursor: pointer; }

    /* Coupon Preview */
    .coupon-preview { margin-top: 8px; }
    .preview-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 8px; }
    .preview-card {
      display: flex; border: 2px dashed var(--border-color); overflow: hidden;
    }
    .preview-left {
      background: var(--primary-color); color: #fff; padding: 16px 20px;
      display: flex; flex-direction: column; justify-content: center; gap: 4px;
      min-width: 140px;
    }
    .preview-discount { font-size: 1.2rem; font-weight: 800; }
    .preview-min { font-size: 11px; opacity: 0.8; }
    .preview-right {
      flex: 1; padding: 16px 20px;
      display: flex; flex-direction: column; justify-content: center; gap: 4px;
    }
    .preview-code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 1.1rem; font-weight: 800; letter-spacing: 2px;
      color: var(--text-dark);
    }
    .preview-validity { font-size: 11px; color: var(--text-muted); }

    .form-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 16px 24px; border-top: 1px solid var(--border-color);
    }
    .btn-cancel {
      padding: 10px 20px; border: 1px solid var(--border-color);
      background: #fff; cursor: pointer; font-size: 13px; font-weight: 600;
    }
    .btn-save {
      padding: 10px 24px; background: var(--primary-color); color: #fff;
      border: none; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-save:hover { opacity: 0.9; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Delete Dialog */
    .delete-dialog {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: #fff; padding: 32px; z-index: 1001;
      text-align: center; min-width: 320px; max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .delete-dialog h3 { margin: 16px 0 8px; font-size: 1.1rem; }
    .delete-dialog p { margin: 0 0 24px; font-size: 14px; color: var(--text-muted); }
    .dialog-actions { display: flex; gap: 10px; justify-content: center; }
    .btn-delete-confirm {
      padding: 10px 24px; background: #b91c1c; color: #fff;
      border: none; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .btn-delete-confirm:hover { background: #991b1b; }
    .btn-delete-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

    @media (max-width: 768px) {
      .filter-bar { flex-direction: column; }
      .stats-row { flex-direction: column; }
      .form-row { grid-template-columns: 1fr; }
      .form-panel { width: 100%; }
    }
  `]
})
export class AdminCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  loading = false;
  error = '';
  saving = false;
  editing: Coupon | null = null;
  toDelete: Coupon | null = null;

  searchQuery = '';
  filterStatus = '';
  filterType = '';
  private searchTimeout: any;

  constructor(private api: CouponService) {}

  ngOnInit() {
    this.load();
  }

  get activeCoupons(): number {
    return this.coupons.filter(c => c.is_active).length;
  }

  get totalUsed(): number {
    return this.coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  }

  load() {
    this.loading = true;
    this.error = '';
    const params: any = {};
    if (this.searchQuery.trim()) params.search = this.searchQuery.trim();
    if (this.filterStatus === 'active') params.is_active = 'true';
    if (this.filterStatus === 'inactive') params.is_active = 'false';
    if (this.filterType) params.discount_type = this.filterType;

    this.api.list(params).subscribe({
      next: (items) => {
        this.coupons = items || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load coupons';
        this.loading = false;
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.load(), 300);
  }

  openAdd() {
    this.editing = {
      code: '',
      description: '',
      discount_type: undefined,
      discount_value: undefined,
      min_order_amount: undefined,
      usage_limit: undefined,
      is_active: true
    };
  }

  edit(c: Coupon) {
    this.editing = { ...c };
    if (this.editing.valid_from) {
      this.editing.valid_from = this.toDatetimeLocal(this.editing.valid_from);
    }
    if (this.editing.valid_until) {
      this.editing.valid_until = this.toDatetimeLocal(this.editing.valid_until);
    }
  }

  cancel() {
    this.editing = null;
  }

  save() {
    if (!this.editing || !this.editing.code || !this.editing.discount_type || this.saving) return;
    this.saving = true;
    this.error = '';
    const id = this.editing.id;
    const payload: Partial<Coupon> = {
      code: this.editing.code.toUpperCase(),
      discount_type: this.editing.discount_type,
      discount_value: this.editing.discount_value ?? 0,
      description: this.editing.description || undefined,
      min_order_amount: this.editing.min_order_amount || undefined,
      usage_limit: this.editing.usage_limit || undefined,
      is_active: this.editing.is_active ?? true,
      valid_from: this.editing.valid_from || undefined,
      valid_until: this.editing.valid_until || undefined
    };
    const op = id ? this.api.update(id, payload) : this.api.create(payload);
    op.subscribe({
      next: () => {
        this.saving = false;
        this.editing = null;
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Save failed. Check your input.';
        this.saving = false;
      }
    });
  }

  confirmDelete(c: Coupon) {
    this.toDelete = c;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    this.saving = true;
    this.api.delete(this.toDelete.id!).subscribe({
      next: () => {
        this.saving = false;
        this.toDelete = null;
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
        this.toDelete = null;
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  isExpired(c: Coupon): boolean {
    if (!c.valid_until) return false;
    return new Date(c.valid_until) < new Date();
  }

  private toDatetimeLocal(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return dateStr;
    }
  }
}
