import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthUser } from '../models/auth';
import { readStoredUser } from '../services/auth.service';

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// La sesión se rehidrata desde localStorage al arrancar la app.
const initialState: AuthState = {
  user: readStoredUser(),
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,

    on(AuthActions.login, AuthActions.register, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { response }) => ({
      ...state,
      user: { dni: response.dni, firstName: response.firstName, lastName: response.lastName },
      loading: false,
      error: null,
    })),

    on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    on(AuthActions.logout, (state) => ({ ...state, user: null, error: null })),
  ),
});
