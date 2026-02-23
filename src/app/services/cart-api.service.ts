import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private base = `${environment.apiBaseUrl}/cart`;
  constructor(private http: HttpClient) {}

  add(payload: any): Observable<any> {
    return this.http.post(`${this.base}/add`, payload);
  }

  list(): Observable<any> {
    return this.http.get(this.base);
  }

  update(itemId: number | string, payload: any): Observable<any> {
    return this.http.put(`${this.base}/${itemId}`, payload);
  }

  delete(itemId: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${itemId}`);
  }

  restore(itemId: number | string): Observable<any> {
    return this.http.post(`${this.base}/${itemId}/restore`, {});
  }

  checkout(payload: any): Observable<any> {
    return this.http.post(`${this.base}/checkout`, payload);
  }
}
