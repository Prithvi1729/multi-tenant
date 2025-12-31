import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expected = route.data['role'] as string;
    const user = this.auth.getUser();
    const tenant = (this.auth as any)['tenantSvc'] ? (this.auth as any)['tenantSvc'].getTenant() : null;
    if (!user) return this.router.parseUrl('/login');
    // role check
    if (user.role !== expected) return this.router.parseUrl('/dashboard');
    // tenant match
    if (tenant && user.tenantId && tenant.id !== user.tenantId) {
      this.auth.logout();
      return this.router.parseUrl('/login');
    }
    return true;
  }
}
