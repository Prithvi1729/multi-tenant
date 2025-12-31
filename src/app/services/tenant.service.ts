import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface TenantConfig {
  id: string;
  name: string;
  logo: string;
  primary: string;
  secondary: string;
  theme?: 'primary' | 'secondary';
  layout: 'side' | 'top';
}

@Injectable({ providedIn: 'root' })
export class TenantService {
  private tenantSubject = new BehaviorSubject<TenantConfig | null>(null);
  tenant$ = this.tenantSubject.asObservable();

  private configs: Record<string, TenantConfig> | null = null;

  constructor(private http: HttpClient) {
    this.loadConfigs();
  }

  private async loadConfigs() {
    try {
      const data = await firstValueFrom(this.http.get<Record<string, TenantConfig>>('assets/tenants.json'));
      this.configs = data;
      let id = this.detectTenantId();
      try {
        const raw = localStorage.getItem('mt_current_user');
        if (raw) {
          const u = JSON.parse(raw as string) as { tenantId?: string };
          if (u && u.tenantId && this.configs && this.configs[u.tenantId]) {
            id = u.tenantId;
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      const cfg = this.configs[id] ?? Object.values(this.configs)[0];
      this.setTenant(cfg);
    } catch (e) {
      console.error('Failed to load tenant configs', e);
    }
  }

  private detectTenantId(): string {
    const host = window.location.hostname || 'localhost';
    // Prefer explicit query param
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tenant');
    if (t) return t;

    // If configs are loaded, try to match hostname to a tenant id.
    // This handles hosts like 'tenant2.local', 'tenant2.domain.com', or 'tenant2'.
    if (this.configs) {
      const h = host.toLowerCase();
      for (const id of Object.keys(this.configs)) {
        if (!id) continue;
        // exact match, startsWith, or contained (covers many dev host patterns)
        if (h === id || h.startsWith(id + '.') || h.includes('.' + id + '.') || h.endsWith('.' + id) || h.indexOf(id) === 0) {
          return id;
        }
        // also support hosts like tenant2.local where parts.length===2
        if (h.split('.').length >= 2 && h.split('.')[0] === id) return id;
      }
    }

    // Fallbacks: if hostname looks like a plain host (localhost), default to tenant1
    // otherwise try first segment
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'localhost') return parts[0];
    return 'tenant1';
  }

  setTenant(cfg: TenantConfig) {
    this.tenantSubject.next(cfg);
    this.applyTheme(cfg);
    // Determine default theme: config override, else tenant2 -> secondary, others -> primary
    const defaultTheme: 'primary' | 'secondary' = cfg.theme ?? (cfg.id === 'tenant2' ? 'secondary' : 'primary');
    const stored = this.getTheme(cfg.id);
    this.setTheme((stored as 'primary' | 'secondary') || defaultTheme, cfg.id);
  }

  getTenant(): TenantConfig | null {
    return this.tenantSubject.value;
  }

  getAllTenants(): TenantConfig[] {
    return this.configs ? Object.values(this.configs) : [];
  }

  private applyTheme(cfg: TenantConfig) {
    const root = document.documentElement;
    // ensure secondary variable exists; primary is controlled by current theme
    root.style.setProperty('--secondary-color', cfg.secondary);
    // if no theme set yet, set primary to tenant primary
    const current = this.getTheme();
    if (!current) root.style.setProperty('--primary-color', cfg.primary);
  }
  
  private getContrastColor(hex?: string): string {
    try {
      let color = (hex || '').toString().trim();
      if (!color || color === 'none') {
        // fallback to current primary css var
        color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '';
      }
      color = color.replace(/"|'/g, '').trim();
      if (!color) return '#000000';
      if (color.indexOf('#') !== 0 && color.indexOf('rgb') === -1) {
        // unknown format, default
        return '#000000';
      }
      // normalize hex from rgb if necessary
      if (color.startsWith('rgb')) {
        const nums = color.replace(/[rgba()]/g, '').split(',').map(s => parseInt(s.trim(), 10));
        if (nums.length >= 3 && !isNaN(nums[0])) {
          const [r,g,b] = nums;
          const yiq = (r*299 + g*587 + b*114) / 1000;
          return yiq >= 128 ? '#000000' : '#ffffff';
        }
        return '#000000';
      }
      if (color.startsWith('#')) color = color.substring(1);
      if (color.length === 3) color = color.split('').map(c => c + c).join('');
      if (color.length !== 6) return '#000000';
      const r = parseInt(color.substring(0,2), 16);
      const g = parseInt(color.substring(2,4), 16);
      const b = parseInt(color.substring(4,6), 16);
      const yiq = (r*299 + g*587 + b*114) / 1000;
      return yiq >= 128 ? '#000000' : '#ffffff';
    } catch (e) {
      return '#000000';
    }
  }
  

  setTheme(mode: 'primary' | 'secondary', tenantId?: string) {
    const root = document.documentElement;
    const cfg = this.getTenant();
    const id = tenantId ?? cfg?.id;
    // Mode semantics: 'primary' => light theme, primary color used for UI
    // 'secondary' => dark theme, secondary color used as primary UI color
    let primaryColor = cfg ? cfg.primary : (getComputedStyle(root).getPropertyValue('--primary-color') || '#000000').trim();
    let secondaryColor = cfg ? cfg.secondary : (getComputedStyle(root).getPropertyValue('--secondary-color') || '#ffffff').trim();
    if (mode === 'primary') {
      root.style.setProperty('--primary-color', primaryColor);
      root.style.setProperty('--secondary-color', secondaryColor);
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
    } else {
      // dark theme: swap colors so tenant.secondary becomes primary UI color
      root.style.setProperty('--primary-color', secondaryColor);
      root.style.setProperty('--secondary-color', primaryColor);
      root.style.setProperty('--bg-color', '#0b0b0b');
      root.style.setProperty('--text-color', '#ffffff');
    }
    // update nav text contrast for chosen primary color
    const chosen = getComputedStyle(root).getPropertyValue('--primary-color') || primaryColor;
    root.style.setProperty('--nav-text-color', this.getContrastColor(chosen.trim()));
    const key = id ? `mt_theme_${id}` : 'mt_theme';
    localStorage.setItem(key, mode);
  }

  getTheme(tenantId?: string): 'primary' | 'secondary' | null {
    const id = tenantId ?? this.getTenant()?.id;
    const key = id ? `mt_theme_${id}` : 'mt_theme';
    const t = localStorage.getItem(key);
    if (t === 'secondary') return 'secondary';
    if (t === 'primary') return 'primary';
    return null;
  }
}
