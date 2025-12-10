// Utilitário para formatar dinamicamente o rótulo de data dos cards de agendamento.
// Regras atualizadas:
// - Data atual: "Hoje"
// - Qualquer outra data: formato DD/MM/AA

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(d.getDate() + n); return r; };
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const weekStartSunday = (d: Date) => { const r = new Date(d); r.setDate(d.getDate() - d.getDay()); return startOfDay(r); };

export const formatAppointmentDateLabel = (selected: Date | string, nowInput?: Date): string => {
  const sel = typeof selected === 'string' ? new Date(`${selected}T00:00:00`) : selected;
  const now = nowInput ?? new Date();
  const sDay = startOfDay(sel);
  const tDay = startOfDay(now);

  if (isSameDay(sDay, tDay)) return 'Hoje';

  const dd = String(sDay.getDate()).padStart(2, '0');
  const mm = String(sDay.getMonth() + 1).padStart(2, '0');
  const yy = String(sDay.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

export default formatAppointmentDateLabel;