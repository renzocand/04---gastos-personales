import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideCdnService } from '../../services/lucide-cdn.service';

/**
 * Componente que renderiza un icono de Lucide cargado desde CDN.
 * Los iconos se cachean automáticamente en memoria.
 *
 * @example
 * <app-cdn-icon name="UtensilsCrossed" class="size-5 text-violet-600" />
 */
@Component({
  selector: 'app-cdn-icon',
  standalone: true,
  template: `
    @if (loading()) {
      <span class="inline-block size-full animate-pulse rounded bg-slate-200"></span>
    } @else {
      <span class="inline-flex size-full items-center justify-center" [innerHTML]="svgContent()"></span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    span :deep(svg) {
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdnIcon {
  /** Nombre del icono en PascalCase o kebab-case */
  name = input.required<string>();

  private readonly lucideCdn = inject(LucideCdnService);
  private readonly sanitizer = inject(DomSanitizer);

  protected loading = signal(true);
  protected svgContent = signal<SafeHtml>('');

  constructor() {
    effect(() => {
      const iconName = this.name();
      if (!iconName) return;

      this.loading.set(true);
      this.lucideCdn.loadIcon(iconName).then((svg) => {
        this.svgContent.set(this.sanitizer.bypassSecurityTrustHtml(svg));
        this.loading.set(false);
      });
    });
  }
}
