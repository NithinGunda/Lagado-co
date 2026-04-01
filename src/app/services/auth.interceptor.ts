import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.auth.recordActivity();
    const isAdminRoute = typeof this.router?.url === 'string' && this.router.url.startsWith('/admin');
    const token = isAdminRoute ? this.auth.getAdminToken() : this.auth.getToken();
    let cloned = req;
    if (token) {
      cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(cloned).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          if (this.auth.isAdminAuth()) {
            return throwError(err);
          }
          this.auth.clearAuth();
          try {
            const url = this.router.url || '';
            if (url.startsWith('/admin')) this.router.navigate(['/admin/login']);
            else if (!url.includes('/login')) this.router.navigate(['/login']);
          } catch (e) {}
        }
        return throwError(err);
      })
    );
  }
}
