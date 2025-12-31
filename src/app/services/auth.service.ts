import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TenantService } from './tenant.service';

export interface User { username: string; role: 'Admin' | 'User'; tenantId: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'mt_current_user';

  constructor(private http: HttpClient, private router: Router, private tenantSvc: TenantService) {}

  async login(username: string, password: string) {
    const users = await firstValueFrom(this.http.get<any[]>('assets/users.json'));
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return null;

    const currentTenant = this.tenantSvc.getTenant();
    if (currentTenant && currentTenant.id !== found.tenantId) return null;

    const user: User = { username: found.username, role: found.role, tenantId: found.tenantId };
    const cfgs = this.tenantSvc.getAllTenants();
    const cfg = cfgs.find(c => c.id === found.tenantId);
    if (cfg) this.tenantSvc.setTenant(cfg);
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    return user;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  hasRole(role: string): boolean {
    const u = this.getUser();
    return !!u && u.role === role;
  }
}
