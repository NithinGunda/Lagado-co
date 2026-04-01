import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  CanActivateFn,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/** Customer must be signed in (e.g. checkout). Redirects to login with returnUrl. */
export const customerAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.auth.isAdminAuth()) return true;
    return this.router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
  }
}
