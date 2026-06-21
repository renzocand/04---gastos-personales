import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { authGuard, guestGuard } from './auth-guard';

/**
 * PA-25: restricción de acceso a rutas protegidas tras el cierre de sesión.
 * Sin token, authGuard redirige al login; con token, deja pasar. guestGuard
 * hace lo inverso.
 */
describe('PA-25: guards de rutas', () => {
  let getToken: ReturnType<typeof vi.fn>;
  let createUrlTree: ReturnType<typeof vi.fn>;

  function run(guard: CanActivateFn) {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  beforeEach(() => {
    getToken = vi.fn();
    createUrlTree = vi.fn((commands: string[]) => ({ url: commands }));
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getToken } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
  });

  it('authGuard sin token redirige a /login', () => {
    getToken.mockReturnValue(null);

    const result = run(authGuard);

    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ url: ['/login'] });
  });

  it('authGuard con token permite el acceso', () => {
    getToken.mockReturnValue('tok');

    expect(run(authGuard)).toBe(true);
  });

  it('guestGuard con token redirige al dashboard', () => {
    getToken.mockReturnValue('tok');

    run(guestGuard);

    expect(createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('guestGuard sin token permite ver el login', () => {
    getToken.mockReturnValue(null);

    expect(run(guestGuard)).toBe(true);
  });
});
