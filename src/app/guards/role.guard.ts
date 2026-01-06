import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const expected = route.data['role'] as string;
    const user = this.auth.getUser();
    const tenantParam = route.paramMap.get('tenant') ?? route.parent?.paramMap.get('tenant') ?? '';
    const tenant = this.auth.getActiveTenant();
    const tenantId = tenantParam || tenant?.id || user?.tenantId || 'tenant1';
    const loginTree = this.router.createUrlTree(['/', tenantId, 'login']);
    const dashboardTree = this.router.createUrlTree(['/', tenantId, 'dashboard']);

    if (!user) return loginTree;
    // role check
    if (user.role !== expected) return dashboardTree;
    // tenant match
    if (tenant && user.tenantId && tenant.id !== user.tenantId) {
      this.auth.clearSession();
      return loginTree;
    }
    return true;
  }
}
