import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * API service for wishlist when backend is implemented.
 * Use these endpoints for logged-in users so wishlist syncs across devices.
 * Until backend exists, WishlistService uses only localStorage.
 */
@Injectable({ providedIn: 'root' })
export class WishlistApiService {
  private base = `${environment.apiBaseUrl}/wishlist`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /** Whether to call API (logged-in customer). */
  get useApi(): boolean {
    return !!this.auth.getToken();
  }

  /** GET /wishlist — list user's wishlist items. */
  list(): Observable<{ items: any[] }> {
    if (!this.useApi) return of({ items: [] });
    return this.http.get<{ items: any[] }>(this.base).pipe(
      catchError(() => of({ items: [] }))
    );
  }

  /** POST /wishlist/add — add product to wishlist. */
  add(productId: string | number): Observable<{ message?: string; item?: any }> {
    if (!this.useApi) return of({});
    return this.http.post<{ message?: string; item?: any }>(`${this.base}/add`, {
      product_id: String(productId)
    }).pipe(
      catchError(err => { throw err; })
    );
  }

  /** DELETE /wishlist/:productId — remove product from wishlist. */
  remove(productId: string | number): Observable<{ message?: string }> {
    if (!this.useApi) return of({});
    return this.http.delete<{ message?: string }>(`${this.base}/${productId}`).pipe(
      catchError(err => { throw err; })
    );
  }
}
