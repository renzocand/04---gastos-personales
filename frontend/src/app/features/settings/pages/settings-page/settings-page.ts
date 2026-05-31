import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Wallet } from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import { SettingsActions } from '../../store/settings.actions';
import { settingsFeature } from '../../store/settings.feature';
import { UserSettings } from '../../models/settings';

@Component({
  selector: 'app-settings-page',
  imports: [ReactiveFormsModule, LucideAngularModule, Card],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);

  protected readonly WalletIcon = Wallet;

  protected readonly loading = this.store.selectSignal(settingsFeature.selectLoading);
  protected readonly error = this.store.selectSignal(settingsFeature.selectError);
  private readonly settings = this.store.selectSignal(settingsFeature.selectSettings);

  protected readonly form = this.fb.group({
    monthlyIncome: this.fb.control<number | null>(null, [Validators.min(0)]),
    alertsEnabled: [true],
  });

  // Sincroniza el formulario cuando llega la config del backend.
  private readonly syncForm = effect(() => {
    const s = this.settings();
    this.form.patchValue(
      { monthlyIncome: s.monthlyIncome, alertsEnabled: s.alertsEnabled },
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
    const { monthlyIncome, alertsEnabled } = this.form.getRawValue();
    const payload: UserSettings = {
      // Un monto 0 o vacío se trata como "sin ingreso configurado".
      monthlyIncome: monthlyIncome && monthlyIncome > 0 ? monthlyIncome : null,
      alertsEnabled,
    };
    this.store.dispatch(SettingsActions.update({ payload }));
  }
}
