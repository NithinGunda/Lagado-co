import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/" class="logo-link" aria-label="Legado & Co home">
          <img src="assets/Logo.png" alt="Legado & Co" class="auth-logo" />
        </a>
        <h1>Reset your password</h1>
        <p class="lead" *ngIf="!requestComplete">
          Enter the email you use for your account. If it’s registered, we’ll send a link to reset your password.
        </p>
        <p class="success-msg" *ngIf="requestComplete">{{ successMessage }}</p>

        <form *ngIf="!requestComplete" [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <p class="api-error" *ngIf="apiError">{{ apiError }}</p>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-input"
              [class.error]="isFieldInvalid('email')"
              placeholder="you@example.com"
              autocomplete="email"
            />
            <span class="error-message" *ngIf="isFieldInvalid('email')">Enter a valid email address</span>
          </div>
          <button type="submit" class="btn-submit" [disabled]="form.invalid || isLoading">
            <span *ngIf="!isLoading">Send reset link</span>
            <span *ngIf="isLoading">Sending…</span>
          </button>
        </form>

        <div class="footer-links">
          <a routerLink="/login">Back to sign in</a>
          <span class="dot">·</span>
          <a routerLink="/register">Create an account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--secondary-color);
      padding: var(--spacing-lg) var(--spacing-sm);
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--text-white);
      border-radius: 16px;
      padding: 36px 32px 28px;
      box-shadow: 0 8px 32px var(--shadow-medium);
    }
    .logo-link {
      display: block;
      text-align: center;
      margin-bottom: 20px;
    }
    .auth-logo {
      max-width: 160px;
      max-height: 48px;
      width: auto;
      height: auto;
      object-fit: contain;
    }
    h1 {
      font-size: 1.5rem;
      color: var(--primary-color);
      margin: 0 0 12px;
      text-align: center;
      font-weight: 700;
    }
    .lead {
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.55;
      margin: 0 0 24px;
      text-align: center;
    }
    .success-msg {
      font-size: 15px;
      color: var(--text-dark);
      line-height: 1.55;
      margin: 0 0 20px;
      text-align: center;
      padding: 14px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 10px;
    }
    .auth-form { margin-top: 8px; }
    .api-error {
      color: #b91c1c;
      font-size: 14px;
      margin-bottom: 16px;
      padding: 10px 12px;
      background: rgba(185, 28, 28, 0.08);
      border-radius: 8px;
    }
    .form-group { margin-bottom: 18px; }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-color);
    }
    .form-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
      font-family: inherit;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .form-input.error { border-color: #e74c3c; }
    .error-message { display: block; color: #e74c3c; font-size: 12px; margin-top: 6px; }
    .btn-submit {
      width: 100%;
      padding: 14px;
      margin-top: 8px;
      background: var(--primary-color);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-submit:hover:not(:disabled) { opacity: 0.92; }
    .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }
    .footer-links {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      color: var(--text-muted);
    }
    .footer-links a { color: var(--primary-color); font-weight: 600; text-decoration: none; }
    .footer-links a:hover { text-decoration: underline; }
    .dot { margin: 0 8px; opacity: 0.5; }
  `],
})
export class ForgotPasswordComponent {
  form: FormGroup;
  isLoading = false;
  apiError = '';
  requestComplete = false;
  successMessage =
    'If an account exists for that email, you’ll receive password reset instructions shortly. Check your inbox and spam folder.';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  isFieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit() {
    this.apiError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const email = String(this.form.get('email')?.value ?? '').trim();
    this.authService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.message && typeof res.message === 'string') {
          this.successMessage = res.message;
        }
        this.requestComplete = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError = this.extractApiError(err, 'Something went wrong. Please try again later.');
      },
    });
  }

  private extractApiError(err: any, fallback: string): string {
    const body = err?.error;
    if (body?.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors)[0];
      return Array.isArray(first) ? String(first[0]) : String(first);
    }
    return body?.message || body?.error || fallback;
  }
}
