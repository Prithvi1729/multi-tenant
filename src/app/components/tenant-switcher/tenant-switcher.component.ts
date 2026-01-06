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
      this.navigateToTenant(id);
      this.selected = id;
    }
  }

  selectTenant(id: string) {
    const cfg = this.tenants.find(x => x.id === id);
    if (cfg) {
      this.tenantSvc.setTenant(cfg);
      this.navigateToTenant(id);
      this.selected = id;
      this.open = false;
    }
  }

  get selectedName(): string {
    const t = this.tenants.find(x => x.id === this.selected);
    return t ? t.name : 'Tenant';
  }

  private navigateToTenant(id: string) {
    const [path] = this.router.url.split('?');
    const segments = path.split('/').filter(Boolean);
    if (!segments.length) {
      this.router.navigate(['/', id, 'dashboard']);
      return;
    }
    segments[0] = id;
    this.router.navigate(['/', ...segments], { queryParamsHandling: 'merge' });
  }
}
