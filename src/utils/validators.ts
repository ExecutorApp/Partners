// Lista de UFs brasileiras
export const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export function onlyDigits(value: string): string {
  return (value || '').replace(/\D+/g, '');
}

export function capitalizeFirstLetter(text: string): string {
  if (!text) return '';
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  const result = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  // Debug leve para validação do fluxo em ambiente de desenvolvimento/web
  try {
    if (typeof window !== 'undefined') {
      // Evita ruído excessivo no console em produção
      // eslint-disable-next-line no-console
      console.debug('[capitalizeFirstLetter]', { input: text, trimmed, result });
    }
  } catch {}
  return result;
}

// Capitalização em tempo real sem remover espaços digitados
export function capitalizeFirstLetterLive(text: string): string {
  if (!text) return '';
  const idx = text.search(/\S/);
  if (idx === -1) return text; // apenas espaços
  const ch = text.charAt(idx);
  const up = ch.toUpperCase();
  if (ch === up) return text;
  return text.slice(0, idx) + up + text.slice(idx + 1);
}

export function formatNameInput(text: string): string {
  // Normaliza espaços e capitaliza cada palavra
  // Não usar trim para permitir inserir espaço enquanto digita
  const normalized = (text || '').replace(/\s+/g, ' ');
  if (!normalized.trim()) return '';
  return normalized
    .split(' ')
    .map((w) => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ');
}

export function formatCompanyNameInput(text: string): string {
  // Exige ao menos duas palavras para Razão Social e normaliza capitalização
  // Não usar trim para permitir espaço enquanto digita
  const normalized = (text || '').replace(/\s+/g, ' ');
  if (!normalized.trim()) return '';
  return normalized
    .split(' ')
    .map((w) => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ');
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email.trim());
}

export function isValidCEP(cep: string): boolean {
  const digits = onlyDigits(cep);
  return digits.length === 8;
}

export function validateWhatsApp(phone: string): { valid: boolean; normalized: string } {
  const digits = onlyDigits(phone);
  // Aceita 10 (fixo) ou 11 (celular) dígitos sem DDI
  const valid = digits.length === 10 || digits.length === 11;
  return { valid, normalized: digits };
}

export function maskWhatsApp(phone: string): string {
  const d = onlyDigits(phone).slice(0, 11);
  if (d.length <= 10) {
    // (XX) XXXX-XXXX
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 6);
    const p3 = d.slice(6, 10);
    return `(${p1}${p1.length ? ')' : ''} ${p2}${p2.length ? '-' : ''}${p3}`.trim();
  }
  // (XX) XXXXX-XXXX
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 7);
  const p3 = d.slice(7, 11);
  return `(${p1}) ${p2}-${p3}`;
}

export function sanitizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export function maskCPF(cpf: string): string {
  const d = onlyDigits(cpf).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

export function maskCEP(cep: string): string {
  const d = onlyDigits(cep).slice(0, 8);
  const p1 = d.slice(0, 5);
  const p2 = d.slice(5, 8);
  return p2 ? `${p1}-${p2}` : p1;
}

export function sanitizeCityNeighborhood(text: string): string {
  // Preserva espaço à direita durante digitação; ainda remove números
  const normalized = (text || '')
    .replace(/\d+/g, '')
    .replace(/\s+/g, ' ');
  return normalized.trim() ? normalized : '';
}

export function sanitizeAddress(text: string): string {
  const normalized = (text || '')
    .replace(/\s+/g, ' ');
  return normalized.trim() ? normalized : '';
}

export function sanitizeNumberField(text: string, maxLen: number = 10): string {
  return onlyDigits(text).slice(0, maxLen);
}

export function sanitizeComplement(text: string): string {
  const normalized = (text || '').replace(/\s+/g, ' ');
  return normalized.trim() ? normalized : '';
}

// CPF validation
export function isValidCPF(cpf: string): boolean {
  const digits = onlyDigits(cpf);
  if (!digits || digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // repetidos
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i), 10) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9), 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i), 10) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(digits.charAt(10), 10);
}

// CNPJ validation
export function isValidCNPJ(cnpj: string): boolean {
  const digits = onlyDigits(cnpj);
  if (!digits || digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const calc = (base: number[]): number => {
    const factors = [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const sum = base.reduce((acc, cur, idx) => acc + cur * factors[idx + (factors.length - base.length)], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const nums = digits.split('').map((d) => parseInt(d, 10));
  const d1 = calc(nums.slice(0, 12));
  if (d1 !== nums[12]) return false;
  const d2 = calc(nums.slice(0, 13));
  return d2 === nums[13];
}