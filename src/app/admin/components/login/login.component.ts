import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  template: `
    <div class="admin-login-page">
      <div class="admin-login-card">
        <h1>Admin</h1>
        <p class="subtitle">Legado & Co</p>
        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              class="form-input"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              class="form-input"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
          <div *ngIf="error" class="error-msg">{{ error }}</div>
        </form>
        <a routerLink="/" class="back-link">← Back to store</a>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--secondary-color);
      padding: var(--spacing-md);
    }
    .admin-login-card {
      background: var(--text-white);
      padding: var(--spacing-lg);
      border-radius: 16px;
      box-shadow: 0 4px 24px var(--shadow-medium);
      width: 100%;
      max-width: 400px;
    }
    .admin-login-card h1 {
      margin: 0 0 4px 0;
      font-size: 1.75rem;
      color: var(--primary-color);
    }
    .subtitle {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--text-light);
      font-size: 14px;
    }
    .form-group {
      margin-bottom: var(--spacing-sm);
    }
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      font-size: 14px;
    }
    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 16px;
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .btn-block {
      width: 100%;
      margin-top: var(--spacing-sm);
      padding: 12px;
    }
    .error-msg {
      margin-top: var(--spacing-sm);
      padding: 10px;
      background: #fee;
      color: #c00;
      border-radius: 8px;
      font-size: 14px;
    }
    .back-link {
      display: inline-block;
      margin-top: var(--spacing-md);
      font-size: 14px;
      color: var(--primary-color);
      text-decoration: none;
    }
    .back-link:hover { text-decoration: underline; }
  `]
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  submit() {
    this.error = '';
    if (!this.email?.trim() || !this.password) {
      this.error = 'Email and password are required.';
      return;
    }
    this.loading = true;
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Login failed. Check email and password.';
      }
    });
  }
}
