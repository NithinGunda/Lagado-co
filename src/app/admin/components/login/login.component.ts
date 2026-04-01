import { Component, OnDestroy, AfterViewInit, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  template: `
    <!-- Success overlay -->
    <div class="success-overlay" *ngIf="loginSuccess">
      <div class="success-content">
        <div class="success-emoji">😎</div>
        <h2>Welcome Boss!</h2>
        <p>Redirecting to dashboard...</p>
        <div class="success-dots"><span></span><span></span><span></span></div>
      </div>
    </div>

    <div class="login-page" (mousemove)="onMouseMove($event)">
      <!-- LEFT: Animated visual panel -->
      <div class="visual-panel">
        <div class="visual-bg"></div>

        <!-- Floating fashion elements that follow cursor -->
        <div class="floating-elements" #floatingRef>
          <!-- Shirt SVG 1 -->
          <div class="float-item shirt-1" [style.transform]="getParallax(0.03)">
            <svg viewBox="0 0 120 120" fill="none">
              <path d="M60 10L30 30V50L10 40V80L30 70V110H90V70L110 80V40L90 50V30L60 10Z" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
              <line x1="60" y1="10" x2="60" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <circle cx="60" cy="55" r="3" fill="rgba(255,255,255,0.25)"/>
              <circle cx="60" cy="70" r="3" fill="rgba(255,255,255,0.25)"/>
              <circle cx="60" cy="85" r="3" fill="rgba(255,255,255,0.25)"/>
            </svg>
          </div>

          <!-- Hanger -->
          <div class="float-item hanger" [style.transform]="getParallax(-0.02)">
            <svg viewBox="0 0 100 80" fill="none">
              <path d="M50 5 C50 5 55 5 55 10 C55 15 50 15 50 15" stroke="rgba(255,255,255,0.35)" stroke-width="2" fill="none"/>
              <path d="M50 15 L10 50 H90 L50 15Z" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" fill="rgba(255,255,255,0.05)"/>
              <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            </svg>
          </div>

          <!-- Shirt 2 -->
          <div class="float-item shirt-2" [style.transform]="getParallax(0.04)">
            <svg viewBox="0 0 100 110" fill="none">
              <path d="M50 8L25 25V40L10 32V70L25 62V102H75V62L90 70V32L75 40V25L50 8Z" fill="rgba(232,197,71,0.1)" stroke="rgba(232,197,71,0.3)" stroke-width="1.5"/>
              <rect x="40" y="30" width="20" height="5" rx="2" fill="rgba(232,197,71,0.15)"/>
            </svg>
          </div>

          <!-- Needle & Thread -->
          <div class="float-item needle" [style.transform]="getParallax(-0.035)">
            <svg viewBox="0 0 80 80" fill="none">
              <line x1="40" y1="5" x2="40" y2="55" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
              <circle cx="40" cy="5" r="3" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
              <path d="M40 55 Q50 60 45 70 Q40 80 35 70 Q30 60 40 55" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>
            </svg>
          </div>

          <!-- Button -->
          <div class="float-item button-1" [style.transform]="getParallax(0.05)">
            <svg viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="rgba(255,255,255,0.05)"/>
              <circle cx="18" cy="18" r="2" fill="rgba(255,255,255,0.3)"/>
              <circle cx="32" cy="18" r="2" fill="rgba(255,255,255,0.3)"/>
              <circle cx="18" cy="32" r="2" fill="rgba(255,255,255,0.3)"/>
              <circle cx="32" cy="32" r="2" fill="rgba(255,255,255,0.3)"/>
            </svg>
          </div>

          <!-- Scissors -->
          <div class="float-item scissors" [style.transform]="getParallax(-0.025)">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="15" cy="45" r="8" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
              <circle cx="45" cy="45" r="8" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
              <line x1="20" y1="40" x2="40" y2="10" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
              <line x1="40" y1="40" x2="20" y2="10" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
            </svg>
          </div>

          <!-- Tie -->
          <div class="float-item tie" [style.transform]="getParallax(0.045)">
            <svg viewBox="0 0 40 100" fill="none">
              <path d="M20 5L12 15L20 55L28 15L20 5Z" fill="rgba(232,197,71,0.12)" stroke="rgba(232,197,71,0.3)" stroke-width="1"/>
              <path d="M20 55L14 90L20 95L26 90L20 55Z" fill="rgba(232,197,71,0.08)" stroke="rgba(232,197,71,0.25)" stroke-width="1"/>
            </svg>
          </div>
        </div>

        <!-- Eye that follows cursor -->
        <div class="eye-container">
          <div class="eye" [style.transform]="getEyeTransform()">
            <div class="eye-ball">
              <div class="pupil" [style.transform]="getPupilTransform()"></div>
            </div>
          </div>
          <div class="eye" [style.transform]="getEyeTransform()" style="margin-left: 30px;">
            <div class="eye-ball">
              <div class="pupil" [style.transform]="getPupilTransform()"></div>
            </div>
          </div>
        </div>

        <div class="visual-text">
          <h1>Legado & Co</h1>
          <p>Admin Portal</p>
        </div>
      </div>

      <!-- RIGHT: Login form -->
      <div class="form-panel">
        <div class="form-wrapper">
          <div class="form-header">
            <div class="avatar-ring">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to manage your store</p>
          </div>

          <form (ngSubmit)="submit()" class="login-form">
            <div class="field" [class.focused]="emailFocused" [class.has-value]="email">
              <label for="email">Email Address</label>
              <div class="input-wrap">
                <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input
                  id="email" type="email" [(ngModel)]="email" name="email"
                  (focus)="emailFocused=true" (blur)="emailFocused=false"
                  placeholder="Enter your email" required autocomplete="email"
                />
              </div>
            </div>

            <div class="field" [class.focused]="passFocused" [class.has-value]="password">
              <label for="password">Password</label>
              <div class="input-wrap">
                <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                <input
                  id="password" [type]="showPass ? 'text' : 'password'"
                  [(ngModel)]="password" name="password"
                  (focus)="passFocused=true" (blur)="passFocused=false"
                  placeholder="••••••••" required autocomplete="current-password"
                />
                <button type="button" class="toggle-pass" (click)="showPass=!showPass" tabindex="-1">
                  <svg *ngIf="!showPass" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <svg *ngIf="showPass" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                </button>
              </div>
            </div>

            <div *ngIf="timeoutMessage" class="timeout-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {{ timeoutMessage }}
            </div>
            <div *ngIf="error" class="error-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              {{ error }}
            </div>

            <button type="submit" class="btn-login" [disabled]="loading" [class.loading]="loading">
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading" class="btn-spinner"></span>
            </button>
          </form>

          <a routerLink="/" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back to store
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .login-page {
      display: flex; min-height: 100vh; overflow: hidden;
    }

    /* ===== LEFT VISUAL PANEL ===== */
    .visual-panel {
      flex: 1; position: relative; overflow: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #152a47 0%, #1e3a5f 40%, #2a4d7a 100%);
    }
    .visual-bg {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(232,197,71,0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(60,90,153,0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(232,197,71,0.05) 0%, transparent 50%);
    }

    /* Floating fashion elements */
    .floating-elements { position: absolute; inset: 0; pointer-events: none; }
    .float-item { position: absolute; transition: transform 0.15s ease-out; }
    .float-item svg { display: block; }

    .shirt-1 { top: 8%; left: 10%; width: 110px; animation: floatA 8s ease-in-out infinite; }
    .hanger { top: 5%; right: 12%; width: 90px; animation: floatB 10s ease-in-out infinite; }
    .shirt-2 { bottom: 18%; right: 8%; width: 100px; animation: floatA 9s ease-in-out infinite 1s; }
    .needle { top: 40%; left: 5%; width: 60px; animation: floatB 7s ease-in-out infinite 0.5s; }
    .button-1 { bottom: 35%; left: 18%; width: 50px; animation: floatA 6s ease-in-out infinite 2s; }
    .scissors { top: 25%; right: 25%; width: 55px; animation: floatB 8s ease-in-out infinite 1.5s; }
    .tie { bottom: 10%; left: 40%; width: 40px; animation: floatA 7s ease-in-out infinite 0.8s; }

    @keyframes floatA {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-18px) rotate(3deg); }
    }
    @keyframes floatB {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(14px) rotate(-3deg); }
    }

    /* Eyes that follow cursor */
    .eye-container {
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 30px; position: relative; z-index: 2;
    }
    .eye {
      width: 60px; height: 60px; background: #fff; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.1s ease-out;
    }
    .eye-ball {
      width: 36px; height: 36px; background: #2a4d7a; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .pupil {
      width: 16px; height: 16px; background: #0a1628; border-radius: 50%;
      position: relative; transition: transform 0.08s ease-out;
    }
    .pupil::after {
      content: ''; position: absolute; top: 3px; left: 4px;
      width: 5px; height: 5px; background: #fff; border-radius: 50%;
    }

    .visual-text {
      text-align: center; position: relative; z-index: 2; color: #f5f1e8;
    }
    .visual-text h1 {
      font-family: 'Lato', sans-serif; font-size: 2.8rem;
      font-weight: 400; margin: 0; letter-spacing: 0.5px;
      color: #f5f1e8;
      text-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .visual-text p {
      font-size: 14px; color: rgba(245, 241, 232, 0.7); margin-top: 8px;
      text-transform: uppercase; letter-spacing: 3px;
      font-family: 'Lato', sans-serif;
    }

    /* ===== RIGHT FORM PANEL ===== */
    .form-panel {
      width: 480px; min-width: 420px; display: flex; align-items: center;
      justify-content: center; padding: 40px;
      background: var(--text-white); position: relative;
    }
    .form-wrapper { width: 100%; max-width: 360px; }

    .form-header { text-align: center; margin-bottom: 36px; }
    .avatar-ring {
      width: 64px; height: 64px; margin: 0 auto 16px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #152a47, #2a4d7a);
      color: #fff; border-radius: 50%;
      box-shadow: 0 4px 16px rgba(21,42,71,0.25);
    }
    .form-header h2 {
      margin: 0; font-size: 1.5rem; color: var(--text-dark);
      font-family: 'Lato', sans-serif;
    }
    .form-header p {
      margin: 6px 0 0; font-size: 14px; color: var(--text-light);
      font-family: 'Lato', sans-serif;
    }

    /* Fields */
    .field { margin-bottom: 20px; }
    .field label {
      display: block; margin-bottom: 6px;
      font-size: 13px; font-weight: 600; color: #555;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .input-wrap {
      display: flex; align-items: center; gap: 10px;
      border: 2px solid var(--border-color); padding: 0 14px;
      transition: border-color 0.25s, box-shadow 0.25s;
      background: var(--grey-light, #f8f8f8);
    }
    .field.focused .input-wrap {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(60,90,153,0.1);
      background: #fff;
    }
    .field-icon { color: #999; flex-shrink: 0; transition: color 0.2s; }
    .field.focused .field-icon { color: var(--primary-color); }
    .input-wrap input {
      flex: 1; border: none; outline: none; padding: 14px 0;
      font-size: 15px; font-family: inherit; background: transparent;
      color: var(--text-dark);
    }
    .input-wrap input::placeholder { color: #bbb; }
    .toggle-pass {
      background: none; border: none; cursor: pointer;
      color: #999; padding: 4px; display: flex; transition: color 0.2s;
    }
    .toggle-pass:hover { color: var(--primary-color); }

    /* Error */
    .timeout-box {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; margin-bottom: 16px;
      background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.4);
      color: #b45309; font-size: 14px; border-radius: 8px;
    }
    .timeout-box svg { flex-shrink: 0; }
    .error-box {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px; background: #fff0f0; color: #c62828;
      font-size: 13px; font-weight: 500; margin-bottom: 16px;
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }

    /* Button */
    .btn-login {
      width: 100%; padding: 16px; border: none;
      background: linear-gradient(135deg, #152a47, #2a4d7a);
      color: #fff; font-size: 15px; font-weight: 600;
      cursor: pointer; font-family: inherit;
      transition: all 0.3s; position: relative; overflow: hidden;
      letter-spacing: 0.5px;
    }
    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(21,42,71,0.35);
    }
    .btn-login:active:not(:disabled) { transform: translateY(0); }
    .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-login.loading { pointer-events: none; }
    .btn-spinner {
      display: inline-block; width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      margin-top: 24px; font-size: 13px; color: var(--text-light);
      text-decoration: none; transition: color 0.2s;
    }
    .back-link:hover { color: var(--primary-color); }

    /* ===== SUCCESS OVERLAY ===== */
    .success-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: linear-gradient(135deg, #152a47, #2a4d7a);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .success-content { text-align: center; color: #fff; font-family: 'Lato', sans-serif; }
    .success-emoji {
      font-size: 80px; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }
    @keyframes popIn {
      from { transform: scale(0) rotate(-20deg); opacity: 0; }
      to { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .success-content h2 {
      font-family: 'Lato', sans-serif; font-size: 2rem; margin: 16px 0 8px;
      color: #f5f1e8;
      animation: fadeIn 0.4s ease 0.3s both;
    }
    .success-content p {
      font-size: 14px; opacity: 0.7; font-family: 'Lato', sans-serif;
      animation: fadeIn 0.4s ease 0.5s both;
    }
    .success-dots {
      display: flex; justify-content: center; gap: 8px; margin-top: 24px;
      animation: fadeIn 0.4s ease 0.7s both;
    }
    .success-dots span {
      width: 10px; height: 10px; background: rgba(255,255,255,0.4);
      border-radius: 50%; animation: dotPulse 1.2s ease infinite;
    }
    .success-dots span:nth-child(2) { animation-delay: 0.2s; }
    .success-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotPulse {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.4); opacity: 1; background: #e8c547; }
    }

    /* ===== RESPONSIVE ===== */
    @media (max-width: 900px) {
      .login-page { flex-direction: column; }
      .visual-panel { min-height: 280px; flex: none; }
      .form-panel { width: 100%; min-width: 0; padding: 32px 24px; }
      .eye { width: 44px; height: 44px; }
      .eye-ball { width: 26px; height: 26px; }
      .pupil { width: 12px; height: 12px; }
      .visual-text h1 { font-size: 2rem; }
    }
  `]
})
export class AdminLoginComponent implements AfterViewInit, OnDestroy, OnInit {
  email = '';
  password = '';
  error = '';
  timeoutMessage = '';
  loading = false;
  showPass = false;
  emailFocused = false;
  passFocused = false;
  loginSuccess = false;

  private mouseX = 0.5;
  private mouseY = 0.5;
  private pupilX = 0;
  private pupilY = 0;
  private animFrame = 0;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.route.snapshot.queryParams['timeout'] === '1') {
      this.timeoutMessage = 'You were logged out due to inactivity. Please sign in again.';
    }
  }

  ngAfterViewInit() {
    this.animatePupil();
  }

  ngOnDestroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  onMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX / window.innerWidth;
    this.mouseY = e.clientY / window.innerHeight;
  }

  private animatePupil() {
    const targetX = (this.mouseX - 0.5) * 10;
    const targetY = (this.mouseY - 0.5) * 10;
    this.pupilX += (targetX - this.pupilX) * 0.12;
    this.pupilY += (targetY - this.pupilY) * 0.12;
    this.animFrame = requestAnimationFrame(() => this.animatePupil());
  }

  getParallax(factor: number): string {
    const x = (this.mouseX - 0.5) * 100 * factor;
    const y = (this.mouseY - 0.5) * 100 * factor;
    return `translate(${x}px, ${y}px)`;
  }

  getEyeTransform(): string {
    const x = (this.mouseX - 0.5) * 6;
    const y = (this.mouseY - 0.5) * 4;
    return `translate(${x}px, ${y}px)`;
  }

  getPupilTransform(): string {
    return `translate(${this.pupilX}px, ${this.pupilY}px)`;
  }

  submit() {
    this.error = '';
    if (!this.email?.trim() || !this.password) {
      this.error = 'Please enter both email and password.';
      return;
    }

    this.loading = true;

    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.loginSuccess = true;
        if (res?.token) {
          this.auth.setAdminToken(res.token);
          if (res.user) this.auth.setAdminUser(res.user);
          this.auth.clearAuth();
        }
        localStorage.setItem('admin_auth', 'true');
        setTimeout(() => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
          this.router.navigateByUrl(returnUrl);
        }, 2200);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || err?.error?.message || '';
        this.error = msg || 'Invalid credentials. Please try again.';
      }
    });
  }
}
