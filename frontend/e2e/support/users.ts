/**
 * Utilidades para crear datos de usuario únicos en las pruebas E2E.
 *
 * El backend persiste los usuarios (un DNI solo se puede registrar una vez), por
 * eso cada prueba genera un DNI nuevo y así es independiente y re-ejecutable.
 */
let counter = 0;

export const TEST_PASSWORD = 'secret123';

export interface NewUser {
  dni: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** DNI peruano válido (8 dígitos) y único por ejecución. */
export function uniqueDni(): string {
  const base = String(Date.now()).slice(-7); // 7 dígitos del reloj
  const tail = String(counter++ % 10); // + contador → evita choques en el mismo ms
  return base + tail;
}

/** Credenciales nuevas para registrar un usuario de prueba. */
export function newUser(): NewUser {
  return {
    dni: uniqueDni(),
    password: TEST_PASSWORD,
    firstName: 'Test',
    lastName: 'User',
  };
}
