import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResult } from '../models/category.model';

export interface ProductPayload { [key: string]: any }

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private base = `${environment.apiBaseUrl}/products`;
  constructor(private http: HttpClient) {}

  list(params?: any): Observable<PagedResult<any>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => httpParams = httpParams.set(k, String(params[k])));
    return this.http.get<PagedResult<any>>(this.base, { params: httpParams });
  }

  get(id: number | string): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }

  create(payload: ProductPayload | FormData): Observable<any> {
    return this.http.post(this.base, payload);
  }

  update(id: number | string, payload: ProductPayload | FormData): Observable<any> {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  restore(id: number | string): Observable<any> {
    return this.http.post(`${this.base}/${id}/restore`, {});
  }
}
