import { formatCOP } from '../src/utils/format-currency';

describe('formatCOP', () => {
  it('should format a number as Colombian Pesos', () => {
    const result = formatCOP(1500000);
    // Intl.NumberFormat for es-CO uses $ symbol and period as thousands separator
    expect(result).toContain('1.500.000');
  });

  it('should format zero', () => {
    const result = formatCOP(0);
    expect(result).toContain('0');
  });

  it('should handle large numbers', () => {
    const result = formatCOP(250000000);
    expect(result).toContain('250.000.000');
  });

  it('should not include decimal places', () => {
    const result = formatCOP(1500000.99);
    // Should round, not show decimals
    expect(result).not.toContain(',99');
  });
});
