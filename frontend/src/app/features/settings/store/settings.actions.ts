import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { UserSettings } from '../models/settings';

export const SettingsActions = createActionGroup({
  source: 'Settings',
  events: {
    // Load
    'Load': emptyProps(),
    'Load Success': props<{ settings: UserSettings }>(),
    'Load Failure': props<{ error: string }>(),

    // Update
    'Update': props<{ payload: UserSettings }>(),
    'Update Success': props<{ settings: UserSettings }>(),
    'Update Failure': props<{ error: string }>(),
  },
});
