import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'legado_auth_token';
  private userKey = 'legado_auth_user';

  constructor(private http: HttpClient) {}

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
          this.setToken((res as any).token);
          if ((res as any).user) this.setUser((res as any).user);
        }
      }),
      catchError(err => { throw err; })
    );
  }

  logout(): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
    return this.http.post(`${environment.apiBaseUrl}/logout`, {}, { headers }).pipe(
      tap(() => this.clearAuth()),
      catchError(err => { this.clearAuth(); throw err; })
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

  isLoggedIn(): boolean {
    return !!this.getToken() || localStorage.getItem('admin_auth') === 'true';
  }

  isAdminAuth(): boolean {
    return localStorage.getItem('admin_auth') === 'true';
  }

  clearAdminAuth() {
    localStorage.removeItem('admin_auth');
  }
}
