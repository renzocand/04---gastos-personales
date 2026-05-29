import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { House, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
      <p class="text-6xl font-bold tracking-tight text-slate-900">404</p>
      <p class="max-w-sm text-sm text-slate-500">
        La página que buscás no existe o fue movida.
      </p>
      <a
        routerLink="/dashboard"
        class="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
      >
        <lucide-angular [img]="HomeIcon" class="size-4"></lucide-angular>
        Volver al inicio
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  protected readonly HomeIcon = House;
}
