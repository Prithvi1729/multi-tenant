import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  constructor(private router: Router, private tenantSvc: TenantService) {}

  goBack() {
    const tenantId = this.tenantSvc.getTenant()?.id ?? 'tenant1';
    this.router.navigate(['/', tenantId, 'dashboard']);
  }
}


