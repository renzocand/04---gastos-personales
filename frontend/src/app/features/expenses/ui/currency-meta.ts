

  export type CurrencyId = 'PEN' | 'USD';

  export interface CurrencyOption {
    id:CurrencyId,
    symbol:string,
    label:string
  }

  export const CURRENCY_OPTIONS:CurrencyOption[] = [
    { id: 'PEN', symbol: 'S/', label: 'Soles' },
    { id: 'USD', symbol: 'US$', label: 'Dólares' },
  ] as const;
