import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class TenantRedirectGuard implements CanActivate {
  constructor(
    private tenantSvc: TenantService,
    private auth: AuthService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<UrlTree> {
    await this.tenantSvc.ensureConfigsLoaded();
    const tenant = this.tenantSvc.getTenant();
    const tenantId = tenant?.id ?? this.tenantSvc.getAllTenants()[0]?.id ?? 'tenant1';
    const explicitTarget = route.data?.['target'] as string | undefined;
    const fallbackTarget = explicitTarget || (this.auth.isLoggedIn() ? 'dashboard' : 'login');
    return this.router.createUrlTree(['/', tenantId, fallbackTarget]);
  }
}

