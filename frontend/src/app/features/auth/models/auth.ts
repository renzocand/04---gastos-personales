// Contrato de autenticación: refleja los DTOs del backend (com.gastos.dto).

/** Respuesta de /api/auth/login y /api/auth/register. */
export interface AuthResponse {
  token: string;
  tokenType: string;
  dni: string;
  firstName: string;
  lastName: string;
}

/** Cuerpo de POST /api/auth/login. */
export interface LoginRequest {
  dni: string;
  password: string;
}

/** Cuerpo de POST /api/auth/register. */
export interface RegisterRequest {
  dni: string;
  password: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  email?: string;
}

/** Datos mínimos del usuario que conservamos en sesión para la UI. */
export interface AuthUser {
  dni: string;
  firstName: string;
  lastName: string;
}
