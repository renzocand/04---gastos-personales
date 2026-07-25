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
import { selectCategoryChartData } from '../../store/dashboard.selectors';

Chart.register(...registerables);

@Component({
  selector: 'app-category-donut-chart',
  imports: [Card, TranslocoModule],
  template: `
    <ui-card>
      <div class="p-5 sm:p-6">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {{ 'dashboard.breakdown.title' | transloco }}
        </h3>
        <p class="mt-0.5 text-xs text-slate-400">
          {{ 'dashboard.breakdown.subtitle' | transloco }}
        </p>
        <div class="mt-4 flex items-center justify-center">
          <div class="h-56 w-56">
            <canvas #chartCanvas></canvas>
          </div>
        </div>
      </div>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDonutChart {
  private readonly store = inject(Store);
  private readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;

  private readonly chartData = this.store.selectSignal(selectCategoryChartData);

  constructor() {
    effect(() => {
      const canvas = this.chartCanvas();
      const data = this.chartData();
      if (!canvas || data.labels.length === 0) return;

      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(canvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [
            {
              data: data.data,
              backgroundColor: data.colors,
              borderWidth: 2,
              borderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 8,
                font: { size: 11 },
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
                  const value = ctx.parsed;
                  const percent = ((value / total) * 100).toFixed(1);
                  return `${ctx.label}: S/ ${value.toFixed(2)} (${percent}%)`;
                },
              },
            },
          },
        },
      });
    });
  }
}
