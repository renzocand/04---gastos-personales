import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  LayoutDashboard,
  LogOut,
  LucideAngularModule,
  Plus,
  Receipt,
  Settings,
} from 'lucide-angular';
import { ToastContainer } from '../../../shared/ui/toast/toast-container';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { AuthActions } from '../../../features/auth/store/auth.actions';
import { authFeature } from '../../../features/auth/store/auth.feature';
import { SettingsActions } from '../../../features/settings/store/settings.actions';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    ToastContainer,
  ],
  templateUrl: './app-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  private readonly store = inject(Store);
  protected readonly toast = inject(ToastService);

  protected readonly DashboardIcon = LayoutDashboard;
  protected readonly ReceiptIcon = Receipt;
  protected readonly PlusIcon = Plus;
  protected readonly LogOutIcon = LogOut;
  protected readonly SettingsIcon = Settings;

  protected readonly user = this.store.selectSignal(authFeature.selectUser);

  ngOnInit(): void {
    // Cargamos la config del usuario una vez al entrar al área autenticada.
    this.store.dispatch(SettingsActions.load());
  }

  protected logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
