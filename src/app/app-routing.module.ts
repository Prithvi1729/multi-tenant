import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { TenantResolver } from './resolvers/tenant.resolver';
import { TenantRedirectGuard } from './guards/tenant-redirect.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [TenantRedirectGuard], component: LoginComponent },
  { path: 'login', pathMatch: 'full', canActivate: [TenantRedirectGuard], data: { target: 'login' }, component: LoginComponent },
  { path: 'dashboard', pathMatch: 'full', canActivate: [TenantRedirectGuard], data: { target: 'dashboard' }, component: DashboardComponent },
  { path: 'admin', pathMatch: 'full', canActivate: [TenantRedirectGuard], data: { target: 'admin' }, component: AdminComponent },
  {
    path: ':tenant',
    resolve: { tenant: TenantResolver },
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'Admin' } },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', canActivate: [TenantRedirectGuard], data: { target: 'login' }, component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
