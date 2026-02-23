import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FeaturedProduct {
  id?: number | string;
  product_id?: number | string;
  name?: string;
  price?: number;
  description?: string;
  image_url?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class FeaturedProductsService {
  private base = `${environment.apiBaseUrl}/featured-products`;
  constructor(private http: HttpClient) {}

  list(): Observable<FeaturedProduct[]> {
    return this.http.get<FeaturedProduct[]>(this.base).pipe(
      catchError(() => of([]))
    );
  }

  create(payload: FormData | Partial<FeaturedProduct>): Observable<FeaturedProduct> {
    return this.http.post<FeaturedProduct>(this.base, payload).pipe(
      catchError(() => of({} as FeaturedProduct))
    );
  }

  update(id: number | string, payload: FormData | Partial<FeaturedProduct>): Observable<FeaturedProduct> {
    return this.http.put<FeaturedProduct>(`${this.base}/${id}`, payload).pipe(
      catchError(() => of({} as FeaturedProduct))
    );
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`).pipe(
      catchError(() => of(null))
    );
  }
}
