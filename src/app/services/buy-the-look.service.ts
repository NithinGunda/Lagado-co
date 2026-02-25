import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LookProduct {
  id?: number;
  look_id?: number;
  product_id?: number;
  name: string;
  price: number;
  image: string;
  image_url?: string;
  order?: number;
}

export interface Look {
  id?: number;
  title: string;
  lifestyle_image?: string;
  lifestyle_image_url?: string;
  order?: number;
  is_active?: boolean;
  products: LookProduct[];
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class BuyTheLookService {
  private base = `${environment.apiBaseUrl}/looks`;

  constructor(private http: HttpClient) {}

  list(): Observable<Look[]> {
    return this.http.get<Look[]>(this.base).pipe(catchError(() => of([])));
  }

  get(id: number): Observable<Look> {
    return this.http.get<Look>(`${this.base}/${id}`);
  }

  create(payload: FormData): Observable<Look> {
    return this.http.post<Look>(this.base, payload);
  }

  createJson(payload: any): Observable<Look> {
    return this.http.post<Look>(this.base, payload);
  }

  update(id: number, payload: FormData): Observable<Look> {
    return this.http.post<Look>(`${this.base}/${id}`, payload);
  }

  updateJson(id: number, payload: any): Observable<Look> {
    return this.http.put<Look>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`).pipe(catchError(() => of(null)));
  }
}
