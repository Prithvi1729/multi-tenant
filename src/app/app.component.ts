import { Component, OnInit } from '@angular/core';
import { TenantService, TenantConfig } from './services/tenant.service';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  tenant: TenantConfig | null = null;
  theme: 'primary' | 'secondary' = 'primary';

  constructor(private tenantSvc: TenantService, public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.tenantSvc.tenant$.subscribe(t => this.tenant = t);
    const saved = this.tenantSvc.getTheme();
    this.theme = (saved as 'primary' | 'secondary') ?? 'primary';
    // apply saved theme
    this.tenantSvc.setTheme(this.theme);

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e:any) => {
      const url = e.urlAfterRedirects || e.url || '';
      const onLogin = url === '/login' || url.startsWith('/login?');
      if (onLogin) {
        document.documentElement.style.setProperty('--bg-color', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#000000');
        // keep nav neutral on login
        document.documentElement.style.setProperty('--primary-color', '#ffffff');
        document.documentElement.style.setProperty('--nav-text-color', '#000000');
      } else {
        // restore tenant theme
        const tenantId = this.tenant?.id;
        this.tenantSvc.setTheme(this.theme, tenantId);
      }
    });
  }

  logout() { this.auth.logout(); }

  toggleTheme() {
    this.theme = this.theme === 'primary' ? 'secondary' : 'primary';
    this.tenantSvc.setTheme(this.theme);
  }
}
