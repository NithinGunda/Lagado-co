import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-container">
        <div class="login-left">
          <video class="bg-video" autoplay muted loop playsinline>
            <source src="assets/login_video_1.mp4" type="video/mp4" />
          </video>
          <div class="video-overlay"></div>

          <div class="login-branding">
            <a routerLink="/" class="logo-link" aria-label="Legado & Co home">
              <img src="assets/Logo.png" alt="Legado & Co" class="auth-logo-img" />
            </a>
            <h2>Welcome Back</h2>
            <p>Sign in to continue your journey with timeless elegance</p>
          </div>
        </div>
        
        <div class="login-right">
          <div class="login-form-wrapper">
            <h3>Sign In</h3>
            <p class="api-error" *ngIf="apiError">{{ apiError }}</p>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  formControlName="email"
                  class="form-input"
                  [class.error]="isFieldInvalid('email')"
                  placeholder="Enter your email"
                >
                <span class="error-message" *ngIf="isFieldInvalid('email')">
                  {{ getFieldError('email') }}
                </span>
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <div class="password-input-wrapper">
                  <input 
                    [type]="showPassword ? 'text' : 'password'"
                    id="password"
                    formControlName="password"
                    class="form-input"
                    [class.error]="isFieldInvalid('password')"
                    placeholder="Enter your password"
                  >
                  <button 
                    type="button" 
                    class="password-toggle"
                    (click)="togglePassword()"
                    aria-label="Toggle password visibility"
                  >
                    <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
                <span class="error-message" *ngIf="isFieldInvalid('password')">
                  {{ getFieldError('password') }}
                </span>
              </div>

              <div class="form-options">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="rememberMe">
                  <span>Remember me</span>
                </label>
                <a href="#" class="forgot-password">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary btn-submit"
                [disabled]="loginForm.invalid || isLoading"
              >
                <span *ngIf="!isLoading">Sign In</span>
                <span *ngIf="isLoading">Signing In...</span>
              </button>

              <!-- Continue with Google (commented out for now)
              <div class="form-divider">
                <span>OR</span>
              </div>
              <button type="button" class="btn btn-social" (click)="continueWithGoogle()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              -->

              <p class="signup-link">
                Don't have an account? 
                <a routerLink="/register">Create an account</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--secondary-color);
      padding: var(--spacing-lg) var(--spacing-sm);
    }

    .login-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      width: 100%;
      background: var(--text-white);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px var(--shadow-medium);
    }

    .login-left {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      color: var(--text-white);
      overflow: hidden;
      min-height: 600px;
    }

    .bg-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 0;
    }

    .video-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom,
        rgba(30, 58, 95, 0.15) 0%,
        rgba(30, 58, 95, 0.3) 50%,
        rgba(21, 42, 71, 0.75) 100%
      );
      z-index: 1;
    }

    .login-branding {
      position: relative;
      z-index: 2;
      text-align: center;
      width: 100%;
      padding: var(--spacing-xl) var(--spacing-lg);
    }

    .logo-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      color: var(--text-white);
      transition: var(--transition-normal);
    }

    .logo-link:hover {
      transform: scale(1.05);
    }

    .auth-logo-img {
      height: 70px;
      width: auto;
      display: block;
      filter: drop-shadow(0 4px 18px rgba(0, 0, 0, 0.5));
    }

    .login-branding h2 {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      margin-bottom: var(--spacing-xs);
      color: var(--text-white);
      font-weight: 600;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .login-branding p {
      font-size: 1rem;
      opacity: 0.95;
      line-height: 1.6;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    .login-right {
      padding: var(--spacing-xl);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .login-form-wrapper h3 {
      font-size: 2rem;
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      text-align: center;
    }

    .form-group {
      margin-bottom: var(--spacing-md);
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-color);
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 14px;
      transition: var(--transition-normal);
      background: var(--text-white);
      color: var(--text-dark);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
    }

    .form-input.error {
      border-color: #e74c3c;
    }

    .api-error {
      color: #e74c3c;
      font-size: 14px;
      margin-bottom: var(--spacing-md);
      padding: 10px 12px;
      background: rgba(231, 76, 60, 0.08);
      border-radius: 8px;
    }

    .password-input-wrapper {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-light);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      transition: var(--transition-normal);
    }

    .password-toggle:hover {
      color: var(--primary-color);
    }

    .error-message {
      display: block;
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      font-size: 14px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: var(--text-dark);
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: var(--primary-color);
    }

    .forgot-password {
      color: var(--primary-color);
      font-weight: 500;
      transition: var(--transition-normal);
    }

    .forgot-password:hover {
      color: var(--primary-dark);
    }

    .btn-submit {
      width: 100%;
      padding: 14px;
      margin-bottom: var(--spacing-md);
      font-size: 16px;
      font-weight: 600;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-divider {
      text-align: center;
      margin: var(--spacing-md) 0;
      position: relative;
    }

    .form-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border-color);
    }

    .form-divider span {
      background: var(--text-white);
      padding: 0 var(--spacing-sm);
      color: var(--text-light);
      font-size: 12px;
      position: relative;
    }

    .btn-social {
      width: 100%;
      padding: 14px;
      background: var(--text-white);
      border: 2px solid var(--border-color);
      color: var(--text-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      font-weight: 500;
      transition: var(--transition-normal);
    }

    .btn-social:hover {
      border-color: var(--primary-color);
      background: var(--secondary-color);
    }

    .signup-link {
      text-align: center;
      margin-top: var(--spacing-md);
      font-size: 14px;
      color: var(--text-light);
    }

    .signup-link a {
      color: var(--primary-color);
      font-weight: 600;
      transition: var(--transition-normal);
    }

    .signup-link a:hover {
      color: var(--primary-dark);
    }

    @media (max-width: 968px) {
      .login-container {
        grid-template-columns: 1fr;
      }

      .login-left {
        min-height: 320px;
      }

      .auth-logo-img {
        height: 60px;
      }

      .login-branding h2 {
        font-size: 1.8rem;
      }

      .login-right {
        padding: var(--spacing-lg);
      }
    }

    @media (max-width: 480px) {
      .login-page {
        padding: var(--spacing-sm);
      }

      .login-container {
        border-radius: 12px;
      }

      .login-left {
        min-height: 260px;
      }

      .login-branding {
        padding: var(--spacing-md);
      }

      .auth-logo-img {
        height: 48px;
      }

      .login-branding h2 {
        font-size: 1.5rem;
      }

      .login-right {
        padding: var(--spacing-md);
      }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  apiError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      return `Password must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    return '';
  }

  onSubmit() {
    this.apiError = '';
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          const body = err?.error;
          this.apiError = body?.message || err?.message || 'Invalid email or password. Please try again.';
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // Continue with Google (commented out for now)
  // continueWithGoogle() {
  //   // Placeholder for Google sign-in integration.
  //   // You can wire this up to your actual Google OAuth flow (e.g. Firebase, OAuth2 backend endpoint).
  //   console.warn('Google login not yet configured: please connect this to your Google OAuth flow.');
  // }
}
