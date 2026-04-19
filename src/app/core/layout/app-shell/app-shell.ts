import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LayoutDashboard,
  LucideAngularModule,
  Plus,
  Receipt,
} from 'lucide-angular';
import { ToastContainer } from '../../../shared/ui/toast/toast-container';

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
  protected readonly DashboardIcon = LayoutDashboard;
  protected readonly ReceiptIcon = Receipt;
  protected readonly PlusIcon = Plus;
}
