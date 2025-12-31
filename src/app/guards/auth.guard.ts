import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.auth.getUser();
    const tenant = this.auth['tenantSvc'] ? this.auth['tenantSvc'].getTenant() : null;
    if (!user) return this.router.parseUrl('/login');
    // ensure current tenant matches user's tenant
    if (tenant && user.tenantId && tenant.id !== user.tenantId) {
      this.auth.logout();
      return this.router.parseUrl('/login');
    }
    return true;
  }
}
