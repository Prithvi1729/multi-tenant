import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    const user = this.auth.getUser();
    const tenantParam = route.paramMap.get('tenant') ?? route.parent?.paramMap.get('tenant') ?? '';
    const tenant = this.auth.getActiveTenant();
    const targetTenantId = tenantParam || tenant?.id || user?.tenantId || 'tenant1';
    const loginTree = this.router.createUrlTree(['/', targetTenantId, 'login']);

    if (!user) return loginTree;
    // ensure current tenant matches user's tenant
    if (tenant && user.tenantId && tenant.id !== user.tenantId) {
      this.auth.clearSession();
      return loginTree;
    }
    return true;
  }
}
