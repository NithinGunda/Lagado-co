import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CarouselItem {
  id?: number | string;
  image_url?: string;
  mobile_image_url?: string;
  media_type?: 'image' | 'video';
  title?: string;
  description?: string;
  link?: string;
  order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private base = `${environment.apiBaseUrl}/carousel`;
  constructor(private http: HttpClient) {}

  list(): Observable<CarouselItem[]> {
    return this.http.get<any>(this.base).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        return [];
      }),
      catchError(() => of([]))
    );
  }

  create(payload: FormData): Observable<CarouselItem> {
    return this.http.post<CarouselItem>(this.base, payload);
  }

  update(id: number | string, payload: FormData | Partial<CarouselItem>): Observable<CarouselItem> {
    if (payload instanceof FormData) {
      return this.http.post<CarouselItem>(`${this.base}/${id}`, payload);
    }
    return this.http.put<CarouselItem>(`${this.base}/${id}`, payload);
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  toggleActive(id: number | string, isActive: boolean): Observable<CarouselItem> {
    return this.http.put<CarouselItem>(`${this.base}/${id}`, { is_active: isActive });
  }
}
