import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-page">
      <div class="register-container">
        <div class="register-left">
          <video class="bg-video" autoplay muted loop playsinline>
            <source src="assets/login_video.mp4" type="video/mp4" />
          </video>
          <div class="video-overlay"></div>

          <div class="register-branding">
            <a routerLink="/" class="logo-link" aria-label="Legado & Co home">
              <img src="assets/Logo.png" alt="Legado & Co" class="auth-logo-img" />
            </a>
            <h2>Join Us</h2>
            <p>Create your account and start your journey with timeless elegance</p>
            <div class="benefits-list">
              <div class="benefit-item" *ngFor="let benefit of benefits; let i = index">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{{ benefit }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="register-right">
          <div class="register-form-wrapper">
            <h3>Create Account</h3>
            
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName"
                    formControlName="firstName"
                    class="form-input"
                    [class.error]="isFieldInvalid('firstName')"
                    placeholder="John"
                  >
                  <span class="error-message" *ngIf="isFieldInvalid('firstName')">
                    {{ getFieldError('firstName') }}
                  </span>
                </div>

                <div class="form-group">
                  <label for="lastName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName"
                    formControlName="lastName"
                    class="form-input"
                    [class.error]="isFieldInvalid('lastName')"
                    placeholder="Doe"
                  >
                  <span class="error-message" *ngIf="isFieldInvalid('lastName')">
                    {{ getFieldError('lastName') }}
                  </span>
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  formControlName="email"
                  class="form-input"
                  [class.error]="isFieldInvalid('email')"
                  placeholder="john.doe@example.com"
                >
                <span class="error-message" *ngIf="isFieldInvalid('email')">
                  {{ getFieldError('email') }}
                </span>
              </div>

              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone"
                  formControlName="phone"
                  class="form-input"
                  [class.error]="isFieldInvalid('phone')"
                  placeholder="+1 (555) 123-4567"
                >
                <span class="error-message" *ngIf="isFieldInvalid('phone')">
                  {{ getFieldError('phone') }}
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
                    placeholder="Create a password"
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
                <div class="password-strength" *ngIf="registerForm.get('password')?.value">
                  <div class="strength-bar">
                    <div class="strength-fill" [class]="getPasswordStrengthClass()" [style.width.%]="getPasswordStrength()"></div>
                  </div>
                  <p class="strength-text">{{ getPasswordStrengthText() }}</p>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <div class="password-input-wrapper">
                  <input 
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    class="form-input"
                    [class.error]="isFieldInvalid('confirmPassword')"
                    placeholder="Confirm your password"
                  >
                  <button 
                    type="button" 
                    class="password-toggle"
                    (click)="toggleConfirmPassword()"
                    aria-label="Toggle password visibility"
                  >
                    <svg *ngIf="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg *ngIf="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
                <span class="error-message" *ngIf="isFieldInvalid('confirmPassword')">
                  {{ getFieldError('confirmPassword') }}
                </span>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="agreeToTerms" required>
                  <span>I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
                </label>
                <span class="error-message" *ngIf="isFieldInvalid('agreeToTerms')">
                  You must agree to the terms and conditions
                </span>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary btn-submit"
                [disabled]="registerForm.invalid || isLoading"
              >
                <span *ngIf="!isLoading">Create Account</span>
                <span *ngIf="isLoading">Creating Account...</span>
              </button>

              <div class="form-divider">
                <span>OR</span>
              </div>

              <button type="button" class="btn btn-social">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>

              <p class="login-link">
                Already have an account? 
                <a routerLink="/login">Sign in</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--secondary-color);
      padding: var(--spacing-lg) var(--spacing-sm);
    }

    .register-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1100px;
      width: 100%;
      background: var(--text-white);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px var(--shadow-medium);
    }

    .register-left {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      color: var(--text-white);
      overflow: hidden;
      min-height: 700px;
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

    .register-branding {
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
      height: 40px;
      width: auto;
      display: block;
      filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.4));
    }

    .register-branding h2 {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      margin-bottom: var(--spacing-xs);
      color: var(--text-white);
      font-weight: 600;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .register-branding p {
      font-size: 1rem;
      opacity: 0.95;
      line-height: 1.6;
      margin-bottom: var(--spacing-md);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    .benefits-list {
      text-align: left;
      display: inline-block;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
      font-size: 0.95rem;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    .benefit-item svg {
      flex-shrink: 0;
      color: rgba(168, 213, 186, 0.95);
    }

    .register-right {
      padding: var(--spacing-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
      max-height: calc(100vh - 200px);
    }

    .register-form-wrapper {
      width: 100%;
      max-width: 450px;
    }

    .register-form-wrapper h3 {
      font-size: 2rem;
      color: var(--primary-color);
      margin-bottom: var(--spacing-md);
      text-align: center;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-sm);
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

    .password-strength {
      margin-top: 8px;
    }

    .strength-bar {
      width: 100%;
      height: 4px;
      background: var(--border-color);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .strength-fill {
      height: 100%;
      transition: var(--transition-normal);
      border-radius: 2px;
    }

    .strength-fill.weak {
      background: #e74c3c;
      width: 33%;
    }

    .strength-fill.medium {
      background: #f39c12;
      width: 66%;
    }

    .strength-fill.strong {
      background: #27ae60;
      width: 100%;
    }

    .strength-text {
      font-size: 12px;
      color: var(--text-light);
      margin: 0;
    }

    .error-message {
      display: block;
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      color: var(--text-dark);
      font-size: 14px;
      line-height: 1.5;
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: var(--primary-color);
      margin-top: 2px;
      flex-shrink: 0;
    }

    .checkbox-label a {
      color: var(--primary-color);
      text-decoration: underline;
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

    .login-link {
      text-align: center;
      margin-top: var(--spacing-md);
      font-size: 14px;
      color: var(--text-light);
    }

    .login-link a {
      color: var(--primary-color);
      font-weight: 600;
      transition: var(--transition-normal);
    }

    .login-link a:hover {
      color: var(--primary-dark);
    }

    @media (max-width: 968px) {
      .register-container {
        grid-template-columns: 1fr;
      }

      .register-left {
        min-height: 350px;
      }

      .auth-logo-img {
        height: 34px;
      }

      .register-branding h2 {
        font-size: 1.8rem;
      }

      .register-right {
        padding: var(--spacing-lg);
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .register-page {
        padding: var(--spacing-sm);
      }

      .register-container {
        border-radius: 12px;
      }

      .register-left {
        min-height: 280px;
      }

      .register-branding {
        padding: var(--spacing-md);
      }

      .auth-logo-img {
        height: 30px;
      }

      .register-branding h2 {
        font-size: 1.5rem;
      }

      .register-right {
        padding: var(--spacing-md);
      }

      .benefits-list {
        display: none;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  benefits = [
    'Exclusive member discounts',
    'Early access to new collections',
    'Fast and secure checkout'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const strength = [hasUpperCase, hasLowerCase, hasNumeric, hasSpecialChar].filter(Boolean).length;

    if (strength < 2) {
      return { weakPassword: true };
    }
    return null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName === 'agreeToTerms' ? 'You must agree' : fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1').trim() + ' is required'}`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    if (field?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    if (field?.hasError('weakPassword')) {
      return 'Password is too weak';
    }
    if (this.registerForm.hasError('passwordMismatch') && fieldName === 'confirmPassword') {
      return 'Passwords do not match';
    }
    return '';
  }

  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value || '';
    if (!password) return 0;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumeric, hasSpecialChar].filter(Boolean).length;
    return (strength / 4) * 100;
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 50) return 'weak';
    if (strength < 75) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 50) return 'Weak password';
    if (strength < 75) return 'Medium strength';
    return 'Strong password';
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        // Navigate to home or login after successful registration
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
