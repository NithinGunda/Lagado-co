import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CouponService, Coupon } from '../../../services/coupon.service';

const MOCK_COUPONS: Coupon[] = [
  { id: 1, code: 'WELCOME10', description: '10% off for new customers', discount_type: 'percentage', discount_value: 10, usage_limit: 100, used_count: 25, is_active: true },
  { id: 2, code: 'SAVE500', description: '₹500 off on orders above ₹5000', discount_type: 'fixed', discount_value: 500, usage_limit: 50, used_count: 12, is_active: true }
];

@Component({
  selector: 'app-admin-coupons',
  template: `
    <div class="admin-coupons">
      <div class="page-header">
        <h1>Coupon Management</h1>
        <button type="button" class="btn btn-primary" (click)="openAdd()">Add Coupon</button>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Loading…</div>

      <div *ngIf="!loading && coupons.length === 0 && !editing" class="empty">
        No coupons yet. Add one above.
      </div>

      <table *ngIf="!loading && coupons.length > 0" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Description</th>
            <th>Discount</th>
            <th>Usage</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of coupons">
            <td>{{ c.id }}</td>
            <td><strong>{{ c.code }}</strong></td>
            <td>{{ c.description || '—' }}</td>
            <td>
              <span *ngIf="c.discount_type === 'percentage'">{{ c.discount_value }}%</span>
              <span *ngIf="c.discount_type === 'fixed'">₹{{ c.discount_value }}</span>
              <span *ngIf="!c.discount_type">—</span>
            </td>
            <td>{{ c.used_count ?? 0 }} / {{ c.usage_limit ?? '∞' }}</td>
            <td>
              <span class="badge" [class.active]="c.is_active" [class.inactive]="!c.is_active">
                {{ c.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button type="button" class="btn btn-sm" (click)="edit(c)">Edit</button>
              <button type="button" class="btn btn-sm btn-danger" (click)="confirmDelete(c)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="editing" class="form-overlay">
        <div class="form-card wide">
          <h3>{{ editing.id ? 'Edit' : 'Add' }} Coupon</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Coupon Code *</label>
              <input [(ngModel)]="editing.code" placeholder="WELCOME10" class="form-input" [disabled]="!!editing.id" />
            </div>
            <div class="form-group">
              <label>Discount Type *</label>
              <select [(ngModel)]="editing.discount_type" class="form-input">
                <option [ngValue]="null">Select type</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Discount Value *</label>
              <input type="number" [(ngModel)]="editing.discount_value" placeholder="10 or 500" class="form-input" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>Usage Limit</label>
              <input type="number" [(ngModel)]="editing.usage_limit" placeholder="Leave empty for unlimited" class="form-input" min="1" />
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="editing.description" placeholder="Coupon description" class="form-input" rows="2"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Valid From</label>
              <input type="datetime-local" [(ngModel)]="editing.valid_from" class="form-input" />
            </div>
            <div class="form-group">
              <label>Valid Until</label>
              <input type="datetime-local" [(ngModel)]="editing.valid_until" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="editing.is_active" />
              Active
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-primary" (click)="save()" [disabled]="saving || !editing.code || !editing.discount_type">Save</button>
            <button type="button" class="btn" (click)="cancel()">Cancel</button>
          </div>
        </div>
      </div>

      <div *ngIf="toDelete" class="form-overlay">
        <div class="form-card">
          <h3>Delete coupon?</h3>
          <p>Delete coupon "{{ toDelete.code }}"?</p>
          <div class="form-actions">
            <button type="button" class="btn btn-danger" (click)="deleteConfirm()" [disabled]="saving">Delete</button>
            <button type="button" class="btn" (click)="toDelete = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-coupons { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
    .page-header h1 { margin: 0; }
    .alert { padding: 12px; border-radius: 8px; margin-bottom: var(--spacing-sm); }
    .alert.error { background: #fee; color: #c00; }
    .loading, .empty { padding: var(--spacing-md); color: var(--text-light); }
    .data-table { width: 100%; border-collapse: collapse; background: var(--text-white); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px var(--shadow-light); }
    .data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .data-table th { background: var(--secondary-color); font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 13px; }
    .badge.active { background: #d4edda; color: #155724; }
    .badge.inactive { background: #f8d7da; color: #721c24; }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-danger { background: var(--accent-color); color: #fff; border-color: var(--accent-color); }
    .form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow: auto; padding: 20px; }
    .form-card { background: var(--text-white); padding: var(--spacing-md); border-radius: 12px; min-width: 320px; max-width: 90%; }
    .form-card.wide { min-width: 550px; }
    .form-card h3 { margin-top: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-sm); }
    .form-group { margin-bottom: var(--spacing-sm); }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-input, select.form-input, textarea.form-input, input[type="datetime-local"].form-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; box-sizing: border-box; }
    .form-group label input[type="checkbox"] { margin-right: 6px; }
    .form-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-md); }
  `]
})
export class AdminCouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  loading = false;
  error = '';
  saving = false;
  editing: Coupon | null = null;
  toDelete: Coupon | null = null;

  constructor(private api: CouponService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.api.list().pipe(
      catchError(() => of(MOCK_COUPONS))
    ).subscribe({
      next: (items) => {
        this.coupons = items;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load coupons';
        this.loading = false;
      }
    });
  }

  openAdd() {
    this.editing = {
      code: '',
      description: '',
      discount_type: undefined,
      discount_value: undefined,
      usage_limit: undefined,
      is_active: true
    };
  }

  edit(c: Coupon) {
    this.editing = { ...c };
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
      code: this.editing.code,
      discount_type: this.editing.discount_type,
      discount_value: this.editing.discount_value ?? 0,
      description: this.editing.description || undefined,
      usage_limit: this.editing.usage_limit ?? undefined,
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
        this.error = err?.error?.message || 'Save failed';
        this.saving = false;
      }
    });
  }

  confirmDelete(c: Coupon) {
    this.toDelete = c;
  }

  deleteConfirm() {
    if (!this.toDelete || this.saving) return;
    const idToRemove = this.toDelete.id;
    this.saving = true;
    this.api.delete(this.toDelete.id!).subscribe({
      next: () => {
        this.saving = false;
        this.toDelete = null;
        this.coupons = this.coupons.filter(c => c.id !== idToRemove);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Delete failed';
        this.saving = false;
      }
    });
  }
}
