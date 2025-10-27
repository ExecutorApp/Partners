import { formatWhatsappMask, isWhatsappComplete } from '../src/utils/phone';

describe('phone utils - WhatsApp mask and validation', () => {
  test('formats progressively up to full mask', () => {
    expect(formatWhatsappMask('')).toBe('');
    expect(formatWhatsappMask('1')).toBe('(1');
    expect(formatWhatsappMask('11')).toBe('(11');
    expect(formatWhatsappMask('119')).toBe('(11) 9');
    expect(formatWhatsappMask('1198')).toBe('(11) 98');
    expect(formatWhatsappMask('1198765')).toBe('(11) 98765');
    expect(formatWhatsappMask('119876543')).toBe('(11) 98765-43');
    expect(formatWhatsappMask('11987654321')).toBe('(11) 98765-4321');
  });

  test('ignores non-numeric characters and caps at 11 digits', () => {
    expect(formatWhatsappMask('(11) 98765-4321')).toBe('(11) 98765-4321');
    expect(formatWhatsappMask('11a98765b4321c')).toBe('(11) 98765-4321');
    expect(formatWhatsappMask('11987654321123')).toBe('(11) 98765-4321');
  });

  test('validates completeness (exactly 11 digits)', () => {
    expect(isWhatsappComplete('11987654321')).toBe(true);
    expect(isWhatsappComplete('1198765432')).toBe(false);
    expect(isWhatsappComplete('(11) 98765-4321')).toBe(true);
    expect(isWhatsappComplete('11-98765-432')).toBe(false);
  });
});