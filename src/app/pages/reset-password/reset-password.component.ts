import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password');
  const c = group.get('password_confirmation');
  if (!p || !c) return null;
  const pv = p.value ?? '';
  const cv = c.value ?? '';
  if (!cv.length) return null;
  return pv === cv ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <a routerLink="/" class="logo-link" aria-label="Legado & Co home">
          <img src="assets/Logo.png" alt="Legado & Co" class="auth-logo" />
        </a>
        <h1>Set a new password</h1>

        <div *ngIf="!token || !email" class="invalid-link">
          <p>This reset link is invalid or incomplete. Request a new link from the sign-in page.</p>
          <a routerLink="/forgot-password" class="btn-secondary">Forgot password</a>
          <a routerLink="/login" class="link-muted">Back to sign in</a>
        </div>

        <ng-container *ngIf="token && email">
          <p class="lead" *ngIf="!resetComplete">
            Choose a new password for <strong>{{ email }}</strong> (minimum 6 characters).
          </p>
          <p class="success-msg" *ngIf="resetComplete">{{ successMessage }}</p>

          <form *ngIf="!resetComplete" [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <p class="api-error" *ngIf="apiError">{{ apiError }}</p>
            <div class="form-group">
              <label for="password">New password</label>
              <input
                type="password"
                id="password"
                formControlName="password"
                class="form-input"
                [class.error]="isFieldInvalid('password')"
                placeholder="At least 6 characters"
                autocomplete="new-password"
              />
              <span class="error-message" *ngIf="isFieldInvalid('password')">Minimum 6 characters</span>
            </div>
            <div class="form-group">
              <label for="password_confirmation">Confirm password</label>
              <input
                type="password"
                id="password_confirmation"
                formControlName="password_confirmation"
                class="form-input"
                [class.error]="isFieldInvalid('password_confirmation') || form.hasError('mismatch')"
                placeholder="Repeat password"
                autocomplete="new-password"
              />
              <span class="error-message" *ngIf="isFieldInvalid('password_confirmation')">Required</span>
              <span class="error-message" *ngIf="form.hasError('mismatch') && form.get('password_confirmation')?.touched">
                Passwords do not match
              </span>
            </div>
            <button type="submit" class="btn-submit" [disabled]="form.invalid || isLoading">
              <span *ngIf="!isLoading">Update password</span>
              <span *ngIf="isLoading">Saving…</span>
            </button>
          </form>

          <div class="footer-links" *ngIf="resetComplete">
            <a routerLink="/login">Sign in</a>
          </div>
        </ng-container>
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
    .lead strong { color: var(--text-dark); word-break: break-all; }
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
    .invalid-link {
      text-align: center;
    }
    .invalid-link p {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.55;
      margin: 0 0 20px;
    }
    .btn-secondary {
      display: inline-block;
      padding: 12px 20px;
      background: var(--primary-color);
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .btn-secondary:hover { opacity: 0.92; }
    .link-muted {
      display: block;
      color: var(--primary-color);
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
    }
    .link-muted:hover { text-decoration: underline; }
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
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
    }
    .footer-links a { color: var(--primary-color); font-weight: 600; text-decoration: none; }
    .footer-links a:hover { text-decoration: underline; }
  `],
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token = '';
  email = '';
  isLoading = false;
  apiError = '';
  resetComplete = false;
  successMessage = 'Your password has been reset. You can sign in with your new password.';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', Validators.required],
      },
      { validators: passwordsMatch }
    );
  }

  ngOnInit() {
    const apply = (p: { get(name: string): string | null }) => {
      this.token = (p.get('token') ?? '').trim();
      this.email = (p.get('email') ?? '').trim();
    };
    apply(this.route.snapshot.queryParamMap);
    this.route.queryParamMap.subscribe(apply);
  }

  isFieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit() {
    this.apiError = '';
    if (!this.token || !this.email) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const v = this.form.value;
    this.authService
      .resetPassword({
        token: this.token,
        email: this.email,
        password: v.password,
        password_confirmation: v.password_confirmation,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.message && typeof res.message === 'string') {
            this.successMessage = res.message;
          }
          this.resetComplete = true;
        },
        error: (err) => {
          this.isLoading = false;
          this.apiError = this.extractApiError(err, 'Could not reset password. The link may have expired.');
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
