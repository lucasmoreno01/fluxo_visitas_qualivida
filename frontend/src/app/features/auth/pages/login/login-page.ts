import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected loading = false;
  protected errorMessage = '';

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['enfermeira@qualivida.com', [Validators.required, Validators.email]],
    senha: ['Prof@123', [Validators.required]],
  });

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        if (response.user.role === 'ADMIN') {
          this.router.navigateByUrl('/admin/visitas');
          return;
        }

        this.router.navigateByUrl('/profissional/agenda');
      },
      error: () => {
        this.errorMessage = 'Nao foi possivel entrar. Confira email e senha.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
