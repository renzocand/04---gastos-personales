import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Receipt, UserPlus } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { RegisterRequest } from '../../models/auth';
import { AuthActions } from '../../store/auth.actions';
import { authFeature } from '../../store/auth.feature';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, TranslocoModule],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(Store);

  protected readonly ReceiptIcon = Receipt;
  protected readonly UserPlusIcon = UserPlus;

  protected readonly loading = this.store.selectSignal(authFeature.selectLoading);
  protected readonly error = this.store.selectSignal(authFeature.selectError);

  protected readonly form = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    secondLastName: ['', [Validators.maxLength(60)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { dni, firstName, lastName, secondLastName, email, password } = this.form.getRawValue();
    const payload: RegisterRequest = {
      dni,
      password,
      firstName,
      lastName,
      // Los opcionales solo se envían si el usuario los completó.
      ...(secondLastName ? { secondLastName } : {}),
      ...(email ? { email } : {}),
    };

    this.store.dispatch(AuthActions.register({ payload }));
  }
}
