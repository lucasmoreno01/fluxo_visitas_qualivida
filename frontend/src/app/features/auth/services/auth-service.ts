import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../core/enviroment';
import { UserDto, UserRole } from '../../../shared/dto/user.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(data: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http
      .post<LoginResponseDto>(`${environment.apiUrl}/auth/login`, data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  saveSession(response: LoginResponseDto): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): UserDto | null {
    const user = localStorage.getItem(USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as UserDto;
    } catch (_error) {
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getCurrentUser());
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
