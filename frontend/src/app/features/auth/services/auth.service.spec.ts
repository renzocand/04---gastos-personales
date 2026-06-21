import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthResponse } from '../models/auth';
import { AuthService, readStoredUser } from './auth.service';

/**
 * TC-15 / PA-24: finalización correcta de sesión. La sesión vive en localStorage;
 * clearSession() la termina (sin token ni usuario). HttpClient se simula porque
 * estas pruebas no tocan la red.
 */
describe('TC-15 / PA-24: AuthService — sesión', () => {
  let service: AuthService;

  const response: AuthResponse = {
    token: 't0ken',
    tokenType: 'Bearer',
    dni: '12345678',
    firstName: 'Renzo',
    lastName: 'Candiotti',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: HttpClient, useValue: {} }],
    });
    service = TestBed.inject(AuthService);
  });

  it('storeSession guarda el token y el usuario; getToken lo recupera', () => {
    service.storeSession(response);

    expect(service.getToken()).toBe('t0ken');
    expect(readStoredUser()).toEqual({ dni: '12345678', firstName: 'Renzo', lastName: 'Candiotti' });
  });

  it('clearSession finaliza la sesión (token y usuario fuera)', () => {
    service.storeSession(response);

    service.clearSession();

    expect(service.getToken()).toBeNull();
    expect(readStoredUser()).toBeNull();
  });

  it('readStoredUser tolera un JSON corrupto y devuelve null', () => {
    localStorage.setItem('gastos.user', '{no-es-json');

    expect(readStoredUser()).toBeNull();
  });
});
