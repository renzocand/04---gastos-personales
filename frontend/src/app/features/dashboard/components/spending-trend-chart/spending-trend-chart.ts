import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  viewChild,
  ElementRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslocoModule } from '@jsverse/transloco';
import { Chart, registerables } from 'chart.js';
import { Card } from '../../../../shared/ui/card/card';
import { selectDailySpendingTrend } from '../../store/dashboard.selectors';

Chart.register(...registerables);

@Component({
  selector: 'app-spending-trend-chart',
  imports: [Card, TranslocoModule],
  template: `
    <ui-card>
      <div class="p-5 sm:p-6">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {{ 'dashboard.trend.title' | transloco }}
        </h3>
        <p class="mt-0.5 text-xs text-slate-400">
          {{ 'dashboard.trend.subtitle' | transloco }}
        </p>
        <div class="mt-4 h-48">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpendingTrendChart {
  private readonly store = inject(Store);
  private readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;

  private readonly data = this.store.selectSignal(selectDailySpendingTrend);

  constructor() {
    effect(() => {
      const canvas = this.chartCanvas();
      const data = this.data();
      if (!canvas || data.length === 0) return;

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.map(d => d.label),
          datasets: [
            {
              data: data.map(d => d.amount),
              backgroundColor: 'rgba(139, 92, 246, 0.7)',
              borderColor: 'rgb(139, 92, 246)',
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `S/ ${(ctx.parsed.y ?? 0).toFixed(2)}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `S/ ${value}`,
              },
            },
          },
        },
      });
    });
  }
}
