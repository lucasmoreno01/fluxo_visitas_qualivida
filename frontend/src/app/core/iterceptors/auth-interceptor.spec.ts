import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@angular/common/http', () => {
  class MockHttpRequest {
    public headers = new Map<string, string>();

    constructor(
      public method: string,
      public url: string,
    ) {}

    clone(update?: { setHeaders?: Record<string, string> }) {
      const cloned = new MockHttpRequest(this.method, this.url);
      if (update?.setHeaders) {
        Object.entries(update.setHeaders).forEach(([key, value]) => {
          cloned.headers.set(key, value);
        });
      }
      return cloned;
    }
  }

  return {
    HttpRequest: MockHttpRequest,
    HttpHandler: class {},
  };
});

import { HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from './auth-interceptor';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let nextHandler: HttpHandler;
  const mockStorage = new Map<string, string>();

  beforeEach(() => {
    interceptor = new AuthInterceptor();
    mockStorage.clear();

    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => mockStorage.get(key) ?? null,
        setItem: (key: string, value: string) => mockStorage.set(key, value),
        removeItem: (key: string) => mockStorage.delete(key),
        clear: () => mockStorage.clear(),
      },
      configurable: true,
    });

    nextHandler = {
      handle: vi.fn().mockReturnValue('handled'),
    } as unknown as HttpHandler;
  });

  it('should add Authorization header when token exists', () => {
    mockStorage.set('token', 'abc123');

    const req = new HttpRequest('GET', '/api/test') as unknown as HttpRequest<unknown>;
    interceptor.intercept(req, nextHandler);

    const handledRequest = (nextHandler.handle as ReturnType<typeof vi.fn>).mock.calls[0][0] as unknown as { headers: Map<string, string> };

    expect(handledRequest.headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('should not add Authorization header when token does not exist', () => {
    const req = new HttpRequest('GET', '/api/test') as unknown as HttpRequest<unknown>;
    interceptor.intercept(req, nextHandler);

    const handledRequest = (nextHandler.handle as ReturnType<typeof vi.fn>).mock.calls[0][0] as unknown as { headers: Map<string, string> };

    expect(handledRequest.headers.has('Authorization')).toBe(false);
  });
});
