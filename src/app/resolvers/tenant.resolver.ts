import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TenantService } from '../services/tenant.service';

@Injectable({ providedIn: 'root' })
export class TenantResolver implements Resolve<boolean | UrlTree> {
  constructor(private tenantSvc: TenantService, private router: Router) {}

  async resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const tenantId = route.paramMap.get('tenant') ?? route.parent?.paramMap.get('tenant') ?? '';
    const configs = await this.tenantSvc.ensureConfigsLoaded();
    const fallback = this.tenantSvc.getAllTenants()[0]?.id ?? 'tenant1';

    if (!tenantId) {
      return this.router.createUrlTree(['/', fallback, 'login']);
    }

    if (!configs || !(tenantId in configs)) {
      return this.router.createUrlTree(['/', fallback, 'login']);
    }

    await this.tenantSvc.setTenantById(tenantId);
    return true;
  }
}

