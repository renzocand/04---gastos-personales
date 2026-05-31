import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { authFeature } from './features/auth/store/auth.feature';
import { AuthEffects } from './features/auth/store/auth.effects';
import { settingsFeature } from './features/settings/store/settings.feature';
import { SettingsEffects } from './features/settings/store/settings.effects';
import { AlertsEffects } from './features/settings/store/alerts.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideStore(),
    provideEffects(),
    // La sesión es global (login, registro y shell la comparten).
    provideState(authFeature),
    provideEffects(AuthEffects),
    // La configuración del usuario y las alertas también son globales.
    provideState(settingsFeature),
    provideEffects(SettingsEffects, AlertsEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    provideHttpClient(withInterceptors([authInterceptor])),
    // provideStore({ [expensesFeature.name]: expensesFeature.reducer })
  ],
};
