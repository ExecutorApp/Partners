export const isValidTime = (s?: string) => !!s && /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);

export type ParsedTime = { hour: number; minute: number } | null;

export const parseTime = (s?: string): ParsedTime => {
  if (!isValidTime(s)) return null;
  const [hh, mm] = (s ?? '00:00').split(':');
  return {
    hour: Math.min(23, Math.max(0, parseInt(hh || '0', 10))),
    minute: Math.min(59, Math.max(0, parseInt(mm || '0', 10))),
  };
};

export const clampToMin = (h: number, m: number, min?: { hour: number; minute: number } | null) => {
  if (!min) return { h, m };
  if (h < min.hour) return { h: min.hour, m: min.minute };
  if (h === min.hour && m < min.minute) return { h, m: min.minute };
  return { h, m };
};

export const formatTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

// Formata duração (em milissegundos) como MM:SS quando < 1h,
// ou HH:MM:SS quando >= 1h. Sempre com dígitos pares e separados por ':'
export const formatDurationHMS = (ms?: number): string => {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const s = total % 60;
  const m = Math.floor((total / 60) % 60);
  const h = Math.floor(total / 3600);
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Formata duração como HH:MM sempre (sem segundos), atendendo ao requisito da UI
export const formatDurationHM = (ms?: number): string => {
  const total = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const mTotal = Math.floor(total / 60);
  const h = Math.floor(mTotal / 60);
  const m = mTotal % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Decide o formato do marcador com base na duração total.
// Se a duração total tiver 1h ou mais, o marcador usa HH:MM:SS;
// caso contrário, usa MM:SS para o valor de posição.
export const formatPositionByDuration = (positionMs?: number, durationMs?: number): string => {
  const dur = Math.max(0, durationMs ?? 0);
  const pos = Math.max(0, positionMs ?? 0);
  const totalSeconds = Math.floor(dur / 1000);
  const posSeconds = Math.floor(pos / 1000);
  const s = posSeconds % 60;
  const m = Math.floor((posSeconds / 60) % 60);
  const h = Math.floor(posSeconds / 3600);
  const showHours = totalSeconds >= 3600;
  if (showHours) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};