import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/user.model';

const INACTIVITY_CHECK_MS = 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'legado_auth_token';
  private userKey = 'legado_auth_user';
  private adminTokenKey = 'legado_admin_token';
  private adminUserKey = 'legado_admin_user';
  private lastActivityKey = 'legado_last_activity';
  private inactivityCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.startInactivityTimer();
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/register`, payload).pipe(
      catchError(err => { throw err; })
    );
  }

  verifyOtp(payload: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/verify-otp`, payload).pipe(
      catchError(err => { throw err; })
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && (res as any).token) {
          // Clear any previous session so this login is the single source of truth
          // (allows admin to log in as customer with a different email without cached role/token)
          this.clearAuth();
          this.clearAdminAuth();
          this.setToken((res as any).token);
          if ((res as any).user) this.setUser((res as any).user);
        }
      }),
      catchError(err => { throw err; })
    );
  }

  logout(): Observable<any> {
    const token = this.getToken() || this.getAdminToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post(`${environment.apiBaseUrl}/logout`, {}, { headers }).pipe(
      tap(() => { this.clearAuth(); this.clearAdminAuth(); }),
      catchError(err => { this.clearAuth(); this.clearAdminAuth(); throw err; })
    );
  }

  me(): Observable<User | null> {
    const token = this.getToken();
    if (!token) return of(null);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<User>(`${environment.apiBaseUrl}/me`, { headers }).pipe(
      tap(user => this.setUser(user)),
      catchError(() => of(null))
    );
  }

  resendOtp(payload: { email: string }): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/resend-otp`, payload).pipe(
      catchError(err => { throw err; })
    );
  }

  forgotPassword(payload: { email: string }): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${environment.apiBaseUrl}/forgot-password`, payload).pipe(
      catchError(err => { throw err; })
    );
  }

  resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${environment.apiBaseUrl}/reset-password`, payload).pipe(
      catchError(err => { throw err; })
    );
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setUser(user: User) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (e) {}
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /** Customer logged in (main site). Admin login does NOT count. */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setAdminToken(token: string) {
    localStorage.setItem(this.adminTokenKey, token);
  }

  getAdminToken(): string | null {
    return localStorage.getItem(this.adminTokenKey);
  }

  setAdminUser(user: User) {
    try {
      localStorage.setItem(this.adminUserKey, JSON.stringify(user));
    } catch (e) {}
  }

  getAdminUser(): User | null {
    const raw = localStorage.getItem(this.adminUserKey);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  /** Admin logged in (admin panel). Separate from customer session. */
  isAdminAuth(): boolean {
    return !!this.getAdminToken();
  }

  clearAdminAuth() {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem(this.adminTokenKey);
    localStorage.removeItem(this.adminUserKey);
  }

  /** Call on user activity (click, key, navigation) or API requests to reset inactivity. */
  recordActivity() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.lastActivityKey, String(Date.now()));
    }
  }

  private startInactivityTimer() {
    this.recordActivity();
    if (typeof document !== 'undefined') {
      const bound = () => this.recordActivity();
      document.addEventListener('click', bound);
      document.addEventListener('keydown', bound);
      document.addEventListener('mousemove', bound);
    }
    if (typeof setInterval !== 'undefined') {
      this.inactivityCheckInterval = setInterval(() => this.checkInactivity(), INACTIVITY_CHECK_MS);
    }
  }

  private checkInactivity() {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(this.lastActivityKey);
    if (!raw) return;
    const minutes = environment.inactivityTimeoutMinutes ?? 30;
    const elapsed = Date.now() - parseInt(raw, 10);
    if (elapsed >= minutes * 60 * 1000) {
      const url = typeof this.router?.url === 'string' ? this.router.url : '';
      if (url.startsWith('/admin') && this.getAdminToken()) {
        this.clearAdminAuth();
        this.router.navigate(['/admin/login'], { queryParams: { timeout: '1' } });
      } else if (this.getToken()) {
        this.clearAuth();
        this.router.navigate(['/']);
      }
    }
  }
}
