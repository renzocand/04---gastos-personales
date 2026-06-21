import { AppCurrencyPipe } from './app-currency';

/**
 * Apoya PA-04 / PA-11 (visualización de montos): formato de moneda con
 * símbolo correcto, 2 decimales y manejo seguro de valores ausentes.
 */
describe('AppCurrencyPipe', () => {
  const pipe = new AppCurrencyPipe();

  it('null / undefined / NaN → cadena vacía', () => {
    expect(pipe.transform(null, 'PEN')).toBe('');
    expect(pipe.transform(undefined, 'PEN')).toBe('');
    expect(pipe.transform(NaN, 'PEN')).toBe('');
  });

  it('PEN usa el símbolo S/ con 2 decimales', () => {
    expect(pipe.transform(0, 'PEN')).toBe('S/ 0.00');
  });

  it('USD usa el símbolo US$ con 2 decimales', () => {
    expect(pipe.transform(0, 'USD')).toBe('US$ 0.00');
  });

  it('formatea montos con símbolo al inicio', () => {
    expect(pipe.transform(1234.5, 'PEN')).toMatch(/^S\/ /);
  });
});
