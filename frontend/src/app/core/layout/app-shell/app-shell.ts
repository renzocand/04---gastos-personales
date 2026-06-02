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
import { TranslocoModule } from '@jsverse/transloco';
import { ToastContainer } from '../../../shared/ui/toast/toast-container';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { LanguageSelector } from '../../../shared/ui/language-selector/language-selector';
import { AuthActions } from '../../../features/auth/store/auth.actions';
import { authFeature } from '../../../features/auth/store/auth.feature';
import { SettingsActions } from '../../../features/settings/store/settings.actions';
import { CategoriesActions } from '../../../features/categories/store/category.actions';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    ToastContainer,
    TranslocoModule,
    LanguageSelector,
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
    // Cargamos config y categorías una vez al entrar al área autenticada.
    this.store.dispatch(SettingsActions.load());
    this.store.dispatch(CategoriesActions.load());
  }

  protected logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
