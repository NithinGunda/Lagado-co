import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = `${environment.apiBaseUrl}/orders`;
  constructor(private http: HttpClient) {}

  list(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => httpParams = httpParams.set(k, String(params[k])));
    return this.http.get(this.base, { params: httpParams });
  }

  get(id: number | string): Observable<any> {
    return this.http.get(`${this.base}/${id}`);
  }
}
