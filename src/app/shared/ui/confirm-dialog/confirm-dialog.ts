import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';

export type ConfirmVariant = 'default' | 'danger';

@Component({
  selector: 'ui-confirm-dialog',
  template: `
    <dialog
      #dialogRef
      class="w-full max-w-md rounded-2xl p-0 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
      (close)="onNativeClose()"
    >
      <div class="p-5 sm:p-6">
        <h2 class="text-base font-semibold text-slate-900">{{ title() }}</h2>
        @if (message()) {
          <p class="mt-1.5 text-sm text-slate-600">{{ message() }}</p>
        }
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            (click)="cancel()"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            {{ cancelLabel() }}
          </button>
          <button
            type="button"
            (click)="confirm()"
            class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            [class]="confirmBtnClass()"
          >
            {{ confirmLabel() }}
          </button>
        </div>
      </div>
    </dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  title = input('¿Estás seguro?');
  message = input<string>();
  confirmLabel = input('Confirmar');
  cancelLabel = input('Cancelar');
  confirmVariant = input<ConfirmVariant>('default');

  confirmed = output<void>();

  private readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  private wasConfirmed = false;

  protected readonly confirmBtnClass = computed(() =>
    this.confirmVariant() === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500'
      : 'bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500',
  );

  open(): void {
    this.wasConfirmed = false;
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected confirm(): void {
    this.wasConfirmed = true;
    this.close();
  }

  protected cancel(): void {
    this.close();
  }

  protected onNativeClose(): void {
    if (this.wasConfirmed) {
      this.confirmed.emit();
      this.wasConfirmed = false;
    }
  }
}
