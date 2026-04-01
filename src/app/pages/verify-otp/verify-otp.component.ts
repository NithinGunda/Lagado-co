import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="otp-page">
      <div class="otp-container">
        <div class="otp-left">
          <video
            class="bg-video"
            autoplay
            [muted]="videoMuted"
            loop
            playsinline
          >
            <source src="assets/login_video.mp4" type="video/mp4" />
          </video>
          <div class="video-overlay"></div>

          <button
            type="button"
            class="video-sound-toggle"
            (click)="toggleVideoMute()"
            [attr.aria-label]="videoMuted ? 'Unmute background video' : 'Mute background video'"
            [attr.title]="videoMuted ? 'Unmute' : 'Mute'"
          >
            <svg *ngIf="videoMuted" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
            <svg *ngIf="!videoMuted" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          </button>

          <div class="otp-branding">
            <a routerLink="/" class="logo-link" aria-label="Legado & Co home">
              <img src="assets/Logo.png" alt="Legado & Co" class="auth-logo-img" />
            </a>
            <h2>Verify Your Email</h2>
            <p>We’ve sent a one-time password (OTP) to <strong>{{ email }}</strong>. Enter it below to complete your registration.</p>
          </div>
        </div>

        <div class="otp-right">
          <div class="otp-form-wrapper">
            <h3>Email Verification</h3>
            <p class="api-error" *ngIf="apiError">{{ apiError }}</p>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="otp-form">
              <div class="form-group">
                <label for="otp">OTP Code</label>
                <input
                  type="text"
                  id="otp"
                  formControlName="otp"
                  maxlength="6"
                  class="form-input"
                  [class.error]="isFieldInvalid('otp')"
                  placeholder="Enter 6-digit code"
                />
                <span class="error-message" *ngIf="isFieldInvalid('otp')">
                  Please enter the 6-digit OTP
                </span>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-submit"
                [disabled]="form.invalid || isLoading"
              >
                <span *ngIf="!isLoading">Verify & Continue</span>
                <span *ngIf="isLoading">Verifying...</span>
              </button>

              <button
                type="button"
                class="btn btn-link resend-btn"
                (click)="resendOtp()"
                [disabled]="resendLoading"
              >
                <span *ngIf="!resendLoading">Resend OTP</span>
                <span *ngIf="resendLoading">Sending...</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .otp-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--secondary-color);
      padding: var(--spacing-lg) var(--spacing-sm);
    }

    .otp-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      width: 100%;
      background: var(--text-white);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px var(--shadow-medium);
    }

    .otp-left {
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

    .video-sound-toggle {
      position: absolute;
      bottom: 20px;
      left: 20px;
      z-index: 3;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, border-color 0.2s, transform 0.2s;
      backdrop-filter: blur(8px);
    }
    .video-sound-toggle:hover {
      background: rgba(0, 0, 0, 0.65);
      border-color: rgba(255, 255, 255, 0.85);
      transform: scale(1.05);
    }
    .video-sound-toggle:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 2px;
    }

    .otp-branding {
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

    .otp-branding h2 {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      margin-bottom: var(--spacing-xs);
      color: var(--text-white);
      font-weight: 600;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .otp-branding p {
      font-size: 1rem;
      opacity: 0.95;
      line-height: 1.6;
      margin-bottom: var(--spacing-md);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    .otp-right {
      padding: var(--spacing-xl);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .otp-form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .otp-form-wrapper h3 {
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
      font-size: 18px;
      letter-spacing: 4px;
      text-align: center;
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

    .error-message {
      display: block;
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
      text-align: center;
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

    .resend-btn {
      width: 100%;
      text-align: center;
      margin-top: 4px;
      font-size: 14px;
    }

    @media (max-width: 968px) {
      .otp-container {
        grid-template-columns: 1fr;
      }

      .otp-left {
        min-height: 320px;
      }

      .auth-logo-img {
        height: 60px;
      }

      .otp-branding h2 {
        font-size: 1.8rem;
      }

      .otp-right {
        padding: var(--spacing-lg);
      }
    }

    @media (max-width: 480px) {
      .otp-page {
        padding: var(--spacing-sm);
      }

      .otp-container {
        border-radius: 12px;
      }

      .otp-left {
        min-height: 260px;
      }

      .otp-branding {
        padding: var(--spacing-md);
      }

      .auth-logo-img {
        height: 48px;
      }

      .otp-branding h2 {
        font-size: 1.5rem;
      }

      .otp-right {
        padding: var(--spacing-md);
      }

      .video-sound-toggle {
        bottom: 14px;
        left: 14px;
        width: 42px;
        height: 42px;
      }
    }
  `]
})
export class VerifyOtpComponent {
  form: FormGroup;
  email = '';
  isLoading = false;
  resendLoading = false;
  apiError = '';
  /** Muted by default so autoplay works; user can unmute via control */
  videoMuted = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.form = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  toggleVideoMute(): void {
    this.videoMuted = !this.videoMuted;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    this.apiError = '';
    if (this.form.invalid || !this.email) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const payload = {
      email: this.email,
      otp: this.form.value.otp,
    };
    this.authService.verifyOtp(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError = this.extractApiError(err, 'Verification failed. Please try again.');
      },
    });
  }

  resendOtp() {
    if (!this.email) return;
    this.apiError = '';
    this.resendLoading = true;
    this.authService.resendOtp({ email: this.email }).subscribe({
      next: (res) => {
        this.resendLoading = false;
        this.apiError = res?.message || 'OTP resent successfully.';
      },
      error: (err) => {
        this.resendLoading = false;
        this.apiError = this.extractApiError(err, 'Failed to resend OTP.');
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

