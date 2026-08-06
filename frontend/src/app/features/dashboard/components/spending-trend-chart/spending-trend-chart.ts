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
import { selectDailySpendingByCategory } from '../../store/dashboard.selectors';

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

  private readonly data = this.store.selectSignal(selectDailySpendingByCategory);

  constructor() {
    effect(() => {
      const canvas = this.chartCanvas();
      const data = this.data();
      if (!canvas || data.labels.length === 0) return;

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: data.datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.backgroundColor,
            borderRadius: 2,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 8,
                font: { size: 10 },
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: S/ ${(ctx.parsed.y ?? 0).toFixed(2)}`,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false },
              ticks: {
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              stacked: true,
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
