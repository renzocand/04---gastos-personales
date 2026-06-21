import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Lightbulb, LucideAngularModule } from 'lucide-angular';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../../../core/i18n/language.service';
import { BudgetStatus } from '../../store/budget';

/**
 * Consejo de educación financiera contextual (ODS 10 · meta 10.1/10.b).
 * Según el nivel del presupuesto (info ≥50%, warning ≥80%, danger ≥100%) muestra
 * un tip de ahorro. En nivel "ok" no se muestra nada. Los tips viven en i18n
 * (dashboard.budget.tips.<nivel>) traducidos a es/en/qu; se rota uno por día del
 * mes de forma determinista (sin azar, estable entre renders con OnPush).
 */
@Component({
  selector: 'app-budget-tip',
  imports: [LucideAngularModule],
  template: `
    @if (tip(); as text) {
      <div
        role="note"
        class="flex items-start gap-3 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900 ring-1 ring-violet-600/15"
      >
        <lucide-angular [img]="LightbulbIcon" class="mt-0.5 size-5 flex-none text-violet-600" aria-hidden="true"></lucide-angular>
        <p class="min-w-0 flex-1">{{ text }}</p>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetTip {
  status = input.required<BudgetStatus>();

  private readonly transloco = inject(TranslocoService);
  private readonly lang = inject(LanguageService);

  protected readonly LightbulbIcon = Lightbulb;

  protected readonly tip = computed(() => {
    const { level } = this.status();
    if (level === 'ok') return null;

    // Dependemos del idioma activo para recalcular al cambiarlo.
    this.lang.current();
    const tips = this.transloco.translate<string[]>(`dashboard.budget.tips.${level}`);
    if (!Array.isArray(tips) || tips.length === 0) return null;

    // Rotación diaria estable (1..31 → índice), sin Math.random.
    const index = (new Date().getDate() - 1) % tips.length;
    return tips[index];
  });
}
