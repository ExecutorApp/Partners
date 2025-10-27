export function formatWhatsappMask(input: string): string {
  const n = input.replace(/\D/g, '');
  if (n.length === 0) return '';
  if (n.length <= 2) return `(${n}`;
  // Até 6 dígitos após DDD: apenas espaço
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  // Para 10 dígitos: (00) 0000-0000
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6, 10)}`;
  // Para 11 dígitos: (00) 00000-0000
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7, 11)}`;
}

export function isWhatsappComplete(input: string): boolean {
  return input.replace(/\D/g, '').length === 11;
}