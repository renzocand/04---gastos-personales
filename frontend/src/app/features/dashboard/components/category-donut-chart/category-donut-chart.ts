import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  viewChild,
  ElementRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslocoModule } from '@jsverse/transloco';
import { Chart, registerables, ActiveElement, ChartEvent } from 'chart.js';
import { Card } from '../../../../shared/ui/card/card';
import { selectCategoryChartData } from '../../store/dashboard.selectors';

Chart.register(...registerables);

@Component({
  selector: 'app-category-donut-chart',
  imports: [Card, TranslocoModule],
  template: `
    <ui-card class="h-full">
      <div class="flex h-full flex-col p-5 sm:p-6">
        <div>
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {{ 'dashboard.breakdown.title' | transloco }}
          </h3>
          <p class="mt-0.5 text-xs text-slate-400">
            @if (selectedCategoryId()) {
              Clic para ver todos
            } @else {
              Clic en una categoría para filtrar
            }
          </p>
        </div>
        <div class="mt-4 flex flex-1 items-center justify-center">
          <div class="h-72 w-full max-w-sm sm:h-80 sm:w-80 lg:h-96 lg:w-96">
            <canvas #chartCanvas></canvas>
          </div>
        </div>
      </div>
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDonutChart {
  /** ID de categoría actualmente seleccionada */
  selectedCategoryId = input<string | null>(null);
  /** Emite el ID de categoría al hacer clic (null para deseleccionar) */
  categoryClick = output<string | null>();

  private readonly store = inject(Store);
  private readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart: Chart | null = null;

  private readonly chartData = this.store.selectSignal(selectCategoryChartData);

  constructor() {
    effect(() => {
      const canvas = this.chartCanvas();
      const data = this.chartData();
      const selectedId = this.selectedCategoryId();
      if (!canvas || data.labels.length === 0) return;

      if (this.chart) {
        this.chart.destroy();
      }

      // Ajustar opacidad de colores según selección
      const colors = data.colors.map((color, index) => {
        if (!selectedId) return color;
        const catId = data.ids[index];
        // Si hay selección y no es esta categoría, aplicar opacidad
        return catId === selectedId ? color : color + '40';
      });

      this.chart = new Chart(canvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [
            {
              data: data.data,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          onClick: (event: ChartEvent, elements: ActiveElement[]) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const clickedId = data.ids[index];
              // Si ya está seleccionada, deseleccionar
              if (clickedId === selectedId) {
                this.categoryClick.emit(null);
              } else {
                this.categoryClick.emit(clickedId);
              }
            } else {
              // Clic fuera de segmentos, deseleccionar
              this.categoryClick.emit(null);
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 8,
                font: { size: 11 },
              },
              onClick: (e, legendItem, legend) => {
                const index = legendItem.index!;
                const clickedId = data.ids[index];
                if (clickedId === selectedId) {
                  this.categoryClick.emit(null);
                } else {
                  this.categoryClick.emit(clickedId);
                }
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
