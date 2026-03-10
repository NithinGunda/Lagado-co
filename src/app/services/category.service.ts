import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, PagedResult } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private base = `${environment.apiBaseUrl}/categories`;
  constructor(private http: HttpClient) {}

  list(params?: any): Observable<PagedResult<Category>> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => httpParams = httpParams.set(k, String(params[k])));
    return this.http.get<PagedResult<Category>>(this.base, { params: httpParams });
  }

  /** Get full category tree (nested) for admin subcategories screen */
  getTree(): Observable<{ data: Category[] }> {
    return this.http.get<{ data: Category[] }>(this.base, { params: { tree: '1' } });
  }

  /** Reorder categories: updates[] with id, sort_order, parent_id */
  reorder(updates: { id: number | string; sort_order: number; parent_id?: number | string | null }[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/reorder`, { updates });
  }

  create(payload: Partial<Category> | FormData): Observable<Category> {
    return this.http.post<Category>(this.base, payload);
  }

  update(id: number | string, payload: Partial<Category> | FormData): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, payload);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  restore(id: number | string): Observable<any> {
    return this.http.post(`${this.base}/${id}/restore`, {});
  }
}
