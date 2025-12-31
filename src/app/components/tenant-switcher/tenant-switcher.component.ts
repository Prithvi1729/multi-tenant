import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService, TenantConfig } from '../../services/tenant.service';

@Component({
  selector: 'app-tenant-switcher',
  templateUrl: './tenant-switcher.component.html',
  styleUrls: ['./tenant-switcher.component.scss']
})
export class TenantSwitcherComponent implements OnInit {
  tenants: TenantConfig[] = [];
  selected = '';
  @Input() compact = false;
  open = false;

  constructor(private tenantSvc: TenantService, private router: Router) {}

  ngOnInit(): void {
    this.tenants = this.tenantSvc.getAllTenants();
    const t = this.tenantSvc.getTenant();
    this.selected = t ? t.id : '';
  }

  change(ev: Event) {
    const id = (ev.target as HTMLSelectElement).value;
    const cfg = this.tenants.find(x => x.id === id);
    if (cfg) {
      this.tenantSvc.setTenant(cfg);
      // update URL query param for convenience
      this.router.navigate([], { queryParams: { tenant: id }, queryParamsHandling: 'merge' });
    }
  }

  selectTenant(id: string) {
    const cfg = this.tenants.find(x => x.id === id);
    if (cfg) {
      this.tenantSvc.setTenant(cfg);
      this.router.navigate([], { queryParams: { tenant: id }, queryParamsHandling: 'merge' });
      this.selected = id;
      this.open = false;
    }
  }

  get selectedName(): string {
    const t = this.tenants.find(x => x.id === this.selected);
    return t ? t.name : 'Tenant';
  }
}
