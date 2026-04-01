import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdminUsersService } from '../../../services/admin-users.service';

/** Normalized row for display (accepts common API shapes). */
export interface AdminUserRow {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  email_verified_at?: string | null;
  created_at?: string | null;
  role?: string;
}

export interface AdminUsersListMeta {
  current_page?: number;
  last_page?: number;
  total?: number;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users">
      <div class="page-header">
        <div>
          <h1>Registered users</h1>
          <p class="subtitle">Customers who signed up on the store</p>
        </div>
        <button type="button" class="btn-refresh" (click)="load(1)" [disabled]="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            [ngModel]="searchInput"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search by name, email or phone…"
            class="search-input"
          />
          <button *ngIf="searchInput" type="button" class="search-clear" (click)="clearSearch()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div *ngIf="error" class="alert error">{{ error }}</div>
      <div *ngIf="apiHint" class="alert hint">{{ apiHint }}</div>
      <div *ngIf="loading" class="loading">Loading users…</div>

      <div *ngIf="!loading && users.length === 0 && !error" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.35">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p>No registered users found</p>
        <p class="empty-hint" *ngIf="searchQuery">Try clearing the search or check the API response shape.</p>
      </div>

      <div *ngIf="!loading && users.length > 0" class="table-info">
        Showing {{ users.length }} user{{ users.length !== 1 ? 's' : '' }}
        <span *ngIf="meta?.total != null"> ({{ meta.total }} total)</span>
      </div>

      <div class="table-wrap" *ngIf="!loading && users.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Verified</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users; trackBy: trackById">
              <td><strong>{{ u.id }}</strong></td>
              <td>{{ u.name || '—' }}</td>
              <td class="cell-email">{{ u.email }}</td>
              <td>{{ u.phone || '—' }}</td>
              <td>
                <span class="badge" [class.verified]="!!u.email_verified_at" [class.unverified]="!u.email_verified_at">
                  {{ u.email_verified_at ? 'Yes' : 'No' }}
                </span>
              </td>
              <td class="cell-muted">{{ formatDate(u.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && showPagination()" class="pagination">
        <button type="button" class="btn btn-sm" [disabled]="loading || !canPrevPage()" (click)="loadPage((meta.current_page ?? 1) - 1)">Previous</button>
        <span>Page {{ meta.current_page ?? 1 }} of {{ meta.last_page ?? 1 }}</span>
        <button type="button" class="btn btn-sm" [disabled]="loading || !canNextPage()" (click)="loadPage((meta.current_page ?? 1) + 1)">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .admin-users { max-width: 1100px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      gap: 16px; margin-bottom: 24px; flex-wrap: wrap;
    }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { margin: 4px 0 0; font-size: 14px; color: var(--text-light); }
    .btn-refresh {
      padding: 10px 18px; font-size: 13px; font-weight: 600;
      background: var(--primary-color, #1e3a5f); color: #fff; border: none;
      border-radius: 6px; cursor: pointer; font-family: inherit;
    }
    .btn-refresh:hover:not(:disabled) { opacity: 0.92; }
    .btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

    .toolbar {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px; margin-bottom: 16px;
      background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light);
    }
    .search-box { position: relative; flex: 1; min-width: 200px; max-width: 480px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; pointer-events: none; }
    .search-input {
      width: 100%; height: 40px; padding: 0 34px 0 40px;
      border: 1px solid var(--border-color); font-size: 14px; font-family: inherit;
      box-sizing: border-box; background: var(--grey-light, #f5f5f5);
    }
    .search-input:focus { outline: none; border-color: var(--primary-color); background: var(--text-white); }
    .search-clear {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; padding: 4px; color: #999;
    }

    .alert { padding: 12px 16px; margin-bottom: 12px; border-radius: 8px; font-size: 14px; }
    .alert.error { background: #fee; color: #b71c1c; }
    .alert.hint { background: #e3f2fd; color: #1565c0; }

    .loading { padding: 40px; text-align: center; color: var(--text-light); }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 56px 20px; color: var(--text-light); text-align: center;
    }
    .empty-state p { margin: 0; font-size: 16px; }
    .empty-hint { font-size: 13px !important; opacity: 0.85; }

    .table-info { font-size: 13px; color: var(--text-light); margin-bottom: 8px; }

    .table-wrap { overflow-x: auto; box-shadow: 0 1px 4px var(--shadow-light); background: var(--text-white); }
    .data-table { width: 100%; border-collapse: collapse; min-width: 720px; }
    .data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
    .data-table th {
      background: var(--secondary-color); font-weight: 600; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.5px; color: #666;
    }
    .data-table tbody tr:hover { background: rgba(30, 58, 95, 0.04); }
    .cell-email { word-break: break-all; }
    .cell-muted { font-size: 13px; color: var(--text-light); white-space: nowrap; }

    .badge {
      display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.3px; border-radius: 999px;
    }
    .badge.verified { background: #d4edda; color: #155724; }
    .badge.unverified { background: #fff3cd; color: #856404; }

    .pagination {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; margin-top: 20px; padding: 14px;
      background: var(--text-white); box-shadow: 0 1px 4px var(--shadow-light);
      font-size: 13px; color: var(--text-light);
    }
    .btn-sm { padding: 8px 14px; font-size: 13px; cursor: pointer; border: 1px solid var(--border-color); background: #fff; border-radius: 4px; }
    .btn-sm:hover:not(:disabled) { border-color: var(--primary-color); color: var(--primary-color); }
    .btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  users: AdminUserRow[] = [];
  loading = false;
  error = '';
  /** Shown when list is empty but request succeeded (backend may need implementing). */
  apiHint = '';
  meta: AdminUsersListMeta = {};

  searchInput = '';
  searchQuery = '';
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private adminUsers: AdminUsersService) {}

  ngOnInit() {
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery = q;
        this.load(1);
      });
    this.load(1);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string | null | undefined) {
    this.searchInput = value ?? '';
    this.search$.next((value ?? '').trim());
  }

  clearSearch() {
    this.searchInput = '';
    this.searchQuery = '';
    this.load(1);
  }

  loadPage(page: number) {
    if (page < 1) return;
    this.load(page);
  }

  load(page: number = 1) {
    this.loading = true;
    this.error = '';
    this.apiHint = '';
    this.adminUsers
      .list({
        page,
        per_page: 25,
        search: this.searchQuery || undefined,
      })
      .pipe(
        catchError((err) => {
          this.loading = false;
          const status = err?.status;
          if (status === 404 || status === 405) {
            this.error =
              'The users API is not available yet. Add GET /admin/users on your backend — see ADMIN_REGISTERED_USERS_API.md in the project root.';
          } else {
            const body = err?.error;
            this.error =
              body?.message ||
              body?.error ||
              (typeof body === 'string' ? body : null) ||
              'Could not load users. Check that you are logged in as admin and the API is configured.';
          }
          return of(null);
        })
      )
      .subscribe((res) => {
        this.loading = false;
        if (res == null) return;

        const { rows, meta } = this.parseResponse(res);
        this.users = rows;
        this.meta = meta;

        if (rows.length === 0 && !this.searchQuery) {
          this.apiHint =
            'The API returned no users. If you expect data, confirm the response matches the shape in ADMIN_REGISTERED_USERS_API.md.';
        }
      });
  }

  showPagination(): boolean {
    const last = this.meta.last_page;
    return last != null && last > 1;
  }

  canPrevPage(): boolean {
    return (this.meta.current_page ?? 1) > 1;
  }

  canNextPage(): boolean {
    const cur = this.meta.current_page ?? 1;
    const last = this.meta.last_page ?? 1;
    return cur < last;
  }

  private parseResponse(res: any): { rows: AdminUserRow[]; meta: AdminUsersListMeta } {
    let raw: any[] = [];
    let meta: AdminUsersListMeta = {};

    if (Array.isArray(res)) {
      raw = res;
    } else if (res?.data != null && Array.isArray(res.data)) {
      raw = res.data;
      meta = {
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
      };
    } else if (Array.isArray(res?.users)) {
      raw = res.users;
    } else if (res?.data?.data && Array.isArray(res.data.data)) {
      raw = res.data.data;
      meta = {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      };
    }

    const rows = raw.map((u) => this.normalizeUser(u));
    return { rows, meta };
  }

  private normalizeUser(u: any): AdminUserRow {
    const first = u?.first_name ?? u?.firstName;
    const last = u?.last_name ?? u?.lastName;
    let name = (u?.name ?? '').toString().trim();
    if (!name && (first || last)) {
      name = [first, last].filter(Boolean).join(' ').trim();
    }
    return {
      id: u?.id ?? '—',
      name,
      email: (u?.email ?? '').toString(),
      phone: u?.phone ?? u?.mobile ?? u?.phone_number,
      email_verified_at: u?.email_verified_at ?? u?.emailVerifiedAt,
      created_at: u?.created_at ?? u?.createdAt,
      role: u?.role,
    };
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(iso);
    }
  }

  trackById(_i: number, u: AdminUserRow): string {
    return String(u.id);
  }
}
