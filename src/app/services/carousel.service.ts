import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CarouselItem {
  id?: number | string;
  image_url?: string;
  title?: string;
  description?: string;
  link?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CarouselService {
  private base = `${environment.apiBaseUrl}/carousel`;
  constructor(private http: HttpClient) {}

  list(): Observable<CarouselItem[]> {
    return this.http.get<CarouselItem[]>(this.base).pipe(
      catchError(() => of([]))
    );
  }

  create(payload: FormData | Partial<CarouselItem>): Observable<CarouselItem> {
    return this.http.post<CarouselItem>(this.base, payload).pipe(
      catchError(() => of({} as CarouselItem))
    );
  }

  update(id: number | string, payload: FormData | Partial<CarouselItem>): Observable<CarouselItem> {
    return this.http.put<CarouselItem>(`${this.base}/${id}`, payload).pipe(
      catchError(() => of({} as CarouselItem))
    );
  }

  delete(id: number | string): Observable<any> {
    return this.http.delete(`${this.base}/${id}`).pipe(
      catchError(() => of(null))
    );
  }
}
