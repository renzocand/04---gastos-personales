import { Expense } from '../../expenses/models/expense';
import { levelFor, tierFor, toPen } from './budget';

/**
 * TC-11 (consultar nivel de presupuesto) · PA-17 (cálculo del %) · PA-18
 * (niveles OK/INFO/WARNING/DANGER). Funciones puras: el núcleo del cálculo.
 */
function expense(amount: number, currency: 'PEN' | 'USD'): Expense {
  return { id: 'e', amount, currency, description: 'x', categoryId: 'food', date: '2026-06-01' };
}

describe('TC-11 / PA-17, PA-18: lógica de presupuesto', () => {
  describe('toPen', () => {
    it('convierte USD multiplicando por la tasa', () => {
      expect(toPen(expense(10, 'USD'), 3.8)).toBe(38);
    });
    it('deja PEN sin convertir (ignora la tasa)', () => {
      expect(toPen(expense(10, 'PEN'), 3.8)).toBe(10);
    });
  });

  describe('tierFor (bordes 50 / 80 / 100)', () => {
    it.each([
      [49.99, 0],
      [50, 1],
      [79.99, 1],
      [80, 2],
      [99.99, 2],
      [100, 3],
      [150, 3],
    ])('percent %d → tier %d', (percent, tier) => {
      expect(tierFor(percent)).toBe(tier);
    });
  });

  describe('levelFor', () => {
    it.each([
      [0, 'ok'],
      [49, 'ok'],
      [50, 'info'],
      [80, 'warning'],
      [100, 'danger'],
    ])('percent %d → %s', (percent, level) => {
      expect(levelFor(percent)).toBe(level);
    });
  });
});
