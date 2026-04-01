import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Lists registered (customer) users for the admin panel.
 * Backend: GET {apiBaseUrl}/admin/users — see ADMIN_REGISTERED_USERS_API.md
 */
@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private base = `${environment.apiBaseUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  list(params?: { page?: number; per_page?: number; search?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params?.per_page != null) httpParams = httpParams.set('per_page', String(params.per_page));
    if (params?.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    return this.http.get(this.base, { params: httpParams });
  }
}
