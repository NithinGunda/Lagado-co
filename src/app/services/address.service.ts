import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private base = `${environment.apiBaseUrl}/addresses`;
  constructor(private http: HttpClient) {}

  list(params?: { per_page?: number; [key: string]: any }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => httpParams = httpParams.set(k, String(params[k])));
    return this.http.get(this.base, { params: httpParams });
  }

  create(payload: any): Observable<any> {
    return this.http.post(this.base, payload);
  }

  update(id: number | string, payload: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  restore(id: number | string): Observable<any> {
    return this.http.post(`${this.base}/${id}/restore`, {});
  }
}
