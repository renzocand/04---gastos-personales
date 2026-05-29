import { Pipe, PipeTransform } from '@angular/core';

const SYMBOLS: Record<'PEN' | 'USD', string> = {
  PEN: 'S/',
  USD: 'US$',
};

const formatter = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

@Pipe({ name: 'appCurrency' })
export class AppCurrencyPipe implements PipeTransform {
  transform(amount: number | null | undefined, currency: 'PEN' | 'USD'): string {
    if (amount == null || Number.isNaN(amount)) return '';
    return `${SYMBOLS[currency]} ${formatter.format(amount)}`;
  }
}
