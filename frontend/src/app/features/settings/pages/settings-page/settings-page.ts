import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Accessibility, LucideAngularModule, Wallet } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import { LanguageSelector } from '../../../../shared/ui/language-selector/language-selector';
import { SettingsActions } from '../../store/settings.actions';
import { settingsFeature } from '../../store/settings.feature';
import { FontScale, UserSettings } from '../../models/settings';

@Component({
  selector: 'app-settings-page',
  imports: [ReactiveFormsModule, LucideAngularModule, Card, TranslocoModule, LanguageSelector],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);

  protected readonly WalletIcon = Wallet;
  protected readonly AccessibilityIcon = Accessibility;

  /** Opciones de escala tipográfica para el selector. */
  protected readonly fontScales: FontScale[] = ['normal', 'large', 'xlarge'];

  protected readonly loading = this.store.selectSignal(settingsFeature.selectLoading);
  protected readonly error = this.store.selectSignal(settingsFeature.selectError);
  private readonly settings = this.store.selectSignal(settingsFeature.selectSettings);

  protected readonly form = this.fb.group({
    monthlyIncome: this.fb.control<number | null>(null, [Validators.min(0)]),
    alertsEnabled: [true],
    highContrast: [false],
    fontScale: this.fb.control<FontScale>('normal'),
    reduceMotion: [false],
  });

  // Sincroniza el formulario cuando llega la config del backend.
  private readonly syncForm = effect(() => {
    const s = this.settings();
    this.form.patchValue(
      {
        monthlyIncome: s.monthlyIncome,
        alertsEnabled: s.alertsEnabled,
        highContrast: s.highContrast,
        fontScale: s.fontScale,
        reduceMotion: s.reduceMotion,
      },
      { emitEvent: false },
    );
  });

  ngOnInit(): void {
    this.store.dispatch(SettingsActions.load());
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { monthlyIncome, alertsEnabled, highContrast, fontScale, reduceMotion } =
      this.form.getRawValue();
    const payload: UserSettings = {
      // Un monto 0 o vacío se trata como "sin ingreso configurado".
      monthlyIncome: monthlyIncome && monthlyIncome > 0 ? monthlyIncome : null,
      alertsEnabled,
      highContrast,
      fontScale,
      reduceMotion,
    };
    this.store.dispatch(SettingsActions.update({ payload }));
  }
}
