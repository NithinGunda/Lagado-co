import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Coupon {
  id?: number | string;
  code: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_order_amount?: number;
  usage_limit?: number;
  used_count?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private base = `${environment.apiBaseUrl}/coupons`;
  constructor(private http: HttpClient) {}

  list(params?: any): Observable<Coupon[]> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        httpParams = httpParams.set(k, String(params[k]));
      }
    });
    return this.http.get<any>(this.base, { params: httpParams }).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(() => of([]))
    );
  }

  get(id: number | string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.base}/${id}`);
  }

  create(payload: Partial<Coupon>): Observable<Coupon> {
    return this.http.post<Coupon>(this.base, payload);
  }

  update(id: number | string, payload: Partial<Coupon>): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.base}/${id}`, payload);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
