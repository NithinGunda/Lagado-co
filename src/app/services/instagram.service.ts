import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface InstagramTaggedPost {
  id: string | null;
  image: string;
  permalink: string;
  handle: string;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class InstagramService {
  private base = `${environment.apiBaseUrl}/instagram`;

  constructor(private http: HttpClient) {}

  getTaggedMedia(): Observable<InstagramTaggedPost[]> {
    return this.http.get<{ data: InstagramTaggedPost[] }>(`${this.base}/tagged-media`).pipe(
      map(res => res?.data ?? []),
      catchError(() => of([]))
    );
  }
}
