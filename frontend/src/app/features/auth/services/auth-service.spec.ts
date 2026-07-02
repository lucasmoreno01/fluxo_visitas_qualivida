import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../../shared/dto/user.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

const mockStorage = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, value: string) => mockStorage.set(key, value),
    removeItem: (key: string) => mockStorage.delete(key),
    clear: () => mockStorage.clear(),
  },
  configurable: true,
});

const mockHttpClient = {
  post: vi.fn(),
};

vi.mock('@angular/common/http', () => ({
  HttpClient: class {},
}));

vi.mock('@angular/core', async () => {
  const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');

  return {
    ...actual,
    Injectable: (options?: unknown) => (target: unknown) => target,
    inject: () => mockHttpClient,
  };
});

import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    mockHttpClient.post.mockReset();
    localStorage.clear();
    service = new AuthService();
  });

  it('should login and persist session data', () => {
    const request: LoginRequestDto = {
      email: 'admin@email.com',
      senha: '123456',
    };

    const response: LoginResponseDto = {
      token: 'fake-token',
      user: {
        id: '1',
        nome: 'Admin',
        email: 'admin@email.com',
        role: UserRole.ADMIN,
      },
    };

    mockHttpClient.post.mockReturnValue(of(response));

    service.login(request).subscribe();

    expect(mockHttpClient.post).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(response.user));
    expect(service.isAuthenticated()).toBe(true);
    expect(service.hasRole(UserRole.ADMIN)).toBe(true);
  });

  it('should clear session data on logout', () => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ id: '1' }));

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
