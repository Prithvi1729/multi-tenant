import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form = this.fb.group({ username: ['', Validators.required], password: ['', Validators.required] });
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  async submit() {
    this.error = '';
    const { username, password } = this.form.value as any;
    const user = await this.auth.login(username, password);
    if (!user) {
      this.error = 'Invalid credentials or wrong tenant (you must log in on your tenant URL)';
      return;
    }
    this.router.navigate(['/', user.tenantId, 'dashboard']);
  }
}
