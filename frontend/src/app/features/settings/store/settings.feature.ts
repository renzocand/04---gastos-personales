import { createFeature, createReducer, on } from '@ngrx/store';
import { SettingsActions } from './settings.actions';
import { AuthActions } from '../../auth/store/auth.actions';
import { UserSettings } from '../models/settings';

export interface SettingsState {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {
    monthlyIncome: null,
    alertsEnabled: true,
    highContrast: false,
    fontScale: 'normal',
    reduceMotion: false,
  },
  loading: false,
  error: null,
};

export const settingsFeature = createFeature({
  name: 'settings',
  reducer: createReducer(
    initialState,

    on(SettingsActions.load, SettingsActions.update, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),

    on(
      SettingsActions.loadSuccess,
      SettingsActions.updateSuccess,
      (state, { settings }) => ({ ...state, settings, loading: false, error: null }),
    ),

    on(
      SettingsActions.loadFailure,
      SettingsActions.updateFailure,
      (state, { error }) => ({ ...state, loading: false, error }),
    ),

    // Al cerrar sesión, la config vuelve a su estado inicial.
    on(AuthActions.logout, () => initialState),
  ),
});
