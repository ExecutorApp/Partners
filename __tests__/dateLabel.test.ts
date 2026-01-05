import { formatAppointmentDateLabel } from '../src/utils/dateLabel';

describe('formatAppointmentDateLabel', () => {
  // Usa uma data fixa para evitar flutuações e DST
  const base = new Date(2025, 10, 21, 12, 0, 0); // 21/11/2025 (sexta) — mês é 0-index

  it('retorna "Hoje" para a data atual', () => {
    const label = formatAppointmentDateLabel(new Date(2025, 10, 21, 0, 0, 0), base);
    expect(label).toBe('Hoje');
  });

  it('retorna DD/MM/AA para o dia seguinte (não hoje)', () => {
    const label = formatAppointmentDateLabel(new Date(2025, 10, 22, 0, 0, 0), base);
    expect(label).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
  });

  it('retorna DD/MM/AA para demais dias (mesma semana ou futuras)', () => {
    const sundayLabel = formatAppointmentDateLabel(new Date(2025, 10, 23, 0, 0, 0), base); // domingo
    const nextWeekLabel = formatAppointmentDateLabel(new Date(2025, 10, 28, 0, 0, 0), base); // semana seguinte
    expect(sundayLabel).toBe('23/11/25');
    expect(nextWeekLabel).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
  });

  it('trata transições entre semanas corretamente sempre em DD/MM/AA (exceto hoje)', () => {
    // Base: sexta (21/11/2025)
    const sameWeekLabel = formatAppointmentDateLabel(new Date(2025, 10, 23, 0, 0, 0), base); // domingo, mesma semana
    const nextWeekLabel = formatAppointmentDateLabel(new Date(2025, 10, 24, 0, 0, 0), base); // segunda, próxima semana
    expect(sameWeekLabel).toBe('23/11/25');
    expect(nextWeekLabel).toBe('24/11/25');
  });
});