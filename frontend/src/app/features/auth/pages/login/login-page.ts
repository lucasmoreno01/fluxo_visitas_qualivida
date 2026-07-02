import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { UserRole } from '../../../../shared/dto/user.dto';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected loading = false;
  protected errorMessage = '';

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['enfermeira@qualivida.com', [Validators.required, Validators.email]],
    senha: ['Prof@123', [Validators.required]],
  });

  ngOnInit(): void {
    this.redirectAuthenticatedUser();
  }

  protected submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.navigateByRole(response.user.role);
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

  private redirectAuthenticatedUser(): void {
    const user = this.authService.getCurrentUser();

    if (!this.authService.isAuthenticated() || !user) {
      return;
    }

    this.navigateByRole(user.role);
  }

  private navigateByRole(role: UserRole): void {
    if (role === UserRole.ADMIN) {
      this.router.navigateByUrl('/admin/visitas', { replaceUrl: true });
      return;
    }

    this.router.navigateByUrl('/profissional/agenda', { replaceUrl: true });
  }
}
