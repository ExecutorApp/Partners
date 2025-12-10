import { Platform } from 'react-native';
import { getLocalStorage, idbGet, idbSet, idbRemove } from './persistentStorageEngine';

// Chaves de armazenamento
const REGISTRATION_STORAGE_KEY = 'partners.registration.data';
const REGISTRATION_COMPLETED_KEY = 'partners.registration.completed';
const REGISTRATION_BACKUP_KEY = 'partners.registration.backup';

// Fallback simples em memória para ambientes sem localStorage
const memoryStore: Record<string, string> = {};

// Funções de persistência em módulo dedicado

// Tipos de dados do cadastro
export interface PersonalData {
  name: string;
  cpf: string;
  email: string;
  whatsapp: string;
  state: string;
  cep: string;
  city: string;
  neighborhood: string;
  address: string;
  number: string;
  complement: string;
  // Foto de perfil codificada como Data URL (base64). Opcional.
  photoUri?: string;
}

export interface EnterpriseData {
  companyName: string;
  cnpj: string;
  state: string;
  cep: string;
  city: string;
  neighborhood: string;
  address: string;
  number: string;
  complement: string;
  sameAddressAsPersonal: boolean;
}

export interface BankAccountData {
  bank: string;
  agency: string;
  account: string;
  pixKeyType: string; // 'CPF' | 'CNPJ' | 'E-mail' | 'Telefone'
  pixKey: string;
}

export interface RegistrationData {
  personal: PersonalData;
  enterprise: EnterpriseData;
  bankAccount: BankAccountData;
}

// Validações básicas baseadas nas regras das telas de cadastro
import {
  UF_LIST,
  isValidCPF,
  isValidCNPJ,
  isValidEmail,
  validateWhatsApp,
  isValidCEP,
  onlyDigits,
} from './validators';

function isPersonalComplete(p: PersonalData): boolean {
  const hasRequired = !!p.name && !!p.cpf && !!p.email && !!p.whatsapp && !!p.state && !!p.city && !!p.neighborhood && !!p.address && !!p.number;
  if (!hasRequired) return false;
  if (!isValidCPF(p.cpf)) return false;
  if (!isValidEmail(p.email)) return false;
  if (!validateWhatsApp(p.whatsapp).valid) return false;
  if (p.state && !UF_LIST.includes(p.state)) return false;
  if (onlyDigits(p.cep).length > 0 && !isValidCEP(p.cep)) return false; // CEP opcional, valida se preenchido
  return true;
}

function isEnterpriseComplete(e: EnterpriseData): boolean {
  const words = e.companyName.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  if (!isValidCNPJ(e.cnpj)) return false;
  if (!e.sameAddressAsPersonal) {
    const required = !!e.state && !!e.city && !!e.neighborhood && !!e.address && !!e.number;
    if (!required) return false;
    if (e.state && !UF_LIST.includes(e.state)) return false;
    if (onlyDigits(e.cep).length > 0 && !isValidCEP(e.cep)) return false; // CEP opcional, valida se preenchido
  }
  return true;
}

function isBankAccountComplete(b: BankAccountData): boolean {
  if (!b.bank || !b.agency || !b.account || !b.pixKeyType || !b.pixKey) return false;
  const agencyDigits = onlyDigits(b.agency);
  if (agencyDigits.length < 3) return false;
  const accountDigits = onlyDigits(b.account);
  if (accountDigits.length < 2 || !b.account.includes('-')) return false;
  switch (b.pixKeyType) {
    case 'CPF':
      return isValidCPF(b.pixKey);
    case 'CNPJ':
      return isValidCNPJ(b.pixKey);
    case 'E-mail':
      return isValidEmail(b.pixKey);
    case 'Telefone':
      return validateWhatsApp(b.pixKey).valid;
    default:
      return false;
  }
}

export const RegistrationValidation = {
  isAllDataComplete(data: RegistrationData): boolean {
    return isPersonalComplete(data.personal) && isEnterpriseComplete(data.enterprise) && isBankAccountComplete(data.bankAccount);
  },
  getMissingFields(data: RegistrationData): string[] {
    const missing: string[] = [];
    // Pessoais
    if (!data.personal.name) missing.push('Nome completo');
    if (!data.personal.cpf || !isValidCPF(data.personal.cpf)) missing.push('CPF válido');
    if (!data.personal.email || !isValidEmail(data.personal.email)) missing.push('Email válido');
    if (!data.personal.whatsapp || !validateWhatsApp(data.personal.whatsapp).valid) missing.push('WhatsApp válido');
    if (!data.personal.state || !UF_LIST.includes(data.personal.state)) missing.push('Estado');
    if (!data.personal.city) missing.push('Cidade');
    if (!data.personal.neighborhood) missing.push('Bairro');
    if (!data.personal.address) missing.push('Endereço');
    if (!data.personal.number) missing.push('Número');
    if (onlyDigits(data.personal.cep).length > 0 && !isValidCEP(data.personal.cep)) missing.push('CEP válido');

    // Empresa
    const words = data.enterprise.companyName.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) missing.push('Razão social');
    if (!isValidCNPJ(data.enterprise.cnpj)) missing.push('CNPJ válido');
    if (!data.enterprise.sameAddressAsPersonal) {
      if (!data.enterprise.state || !UF_LIST.includes(data.enterprise.state)) missing.push('Estado (empresa)');
      if (!data.enterprise.city) missing.push('Cidade (empresa)');
      if (!data.enterprise.neighborhood) missing.push('Bairro (empresa)');
      if (!data.enterprise.address) missing.push('Endereço (empresa)');
      if (!data.enterprise.number) missing.push('Número (empresa)');
      if (onlyDigits(data.enterprise.cep).length > 0 && !isValidCEP(data.enterprise.cep)) missing.push('CEP (empresa) válido');
    }

    // Bancária
    if (!data.bankAccount.bank) missing.push('Banco');
    const agencyDigits = onlyDigits(data.bankAccount.agency);
    if (agencyDigits.length < 3) missing.push('Agência válida');
    const accountDigits = onlyDigits(data.bankAccount.account);
    if (accountDigits.length < 2 || !data.bankAccount.account.includes('-')) missing.push('Conta com dígito');
    if (!data.bankAccount.pixKeyType) missing.push('Tipo de chave PIX');
    switch (data.bankAccount.pixKeyType) {
      case 'CPF':
        if (!isValidCPF(data.bankAccount.pixKey)) missing.push('Chave PIX (CPF) válida');
        break;
      case 'CNPJ':
        if (!isValidCNPJ(data.bankAccount.pixKey)) missing.push('Chave PIX (CNPJ) válida');
        break;
      case 'E-mail':
        if (!isValidEmail(data.bankAccount.pixKey)) missing.push('Chave PIX (Email) válida');
        break;
      case 'Telefone':
        if (!validateWhatsApp(data.bankAccount.pixKey).valid) missing.push('Chave PIX (Telefone) válida');
        break;
      default:
        missing.push('Chave PIX válida');
    }
    return missing;
  },
};

export const RegistrationStorage = {
  async getRegistrationData(): Promise<RegistrationData | null> {
    const storage = getLocalStorage();
    try {
      // 1) Tenta localStorage
      const rawLocal = storage ? storage.getItem(REGISTRATION_STORAGE_KEY) : null;
      const raw = rawLocal ?? (await idbGet(REGISTRATION_STORAGE_KEY)) ?? (await idbGet(REGISTRATION_BACKUP_KEY)) ?? memoryStore[REGISTRATION_STORAGE_KEY] ?? memoryStore[REGISTRATION_BACKUP_KEY];
      if (!raw) return null;
      const parsed = JSON.parse(raw) as RegistrationData;
      if (!parsed || !parsed.personal || !parsed.enterprise || !parsed.bankAccount) return null;
      return parsed;
    } catch {
      // Tenta recuperar do backup explicitamente se o parse falhar
      try {
        const rawBackup = (await idbGet(REGISTRATION_BACKUP_KEY)) ?? memoryStore[REGISTRATION_BACKUP_KEY];
        if (!rawBackup) return null;
        const parsed = JSON.parse(rawBackup) as RegistrationData;
        if (!parsed || !parsed.personal || !parsed.enterprise || !parsed.bankAccount) return null;
        return parsed;
      } catch {
        return null;
      }
    }
  },
  async saveRegistrationData(data: RegistrationData): Promise<void> {
    const storage = getLocalStorage();
    const payload = JSON.stringify(data);
    // Escreve em múltiplos destinos para aumentar a confiabilidade
    try {
      if (storage) {
        storage.setItem(REGISTRATION_STORAGE_KEY, payload);
        // Mantém um backup separado
        storage.setItem(REGISTRATION_BACKUP_KEY, payload);
      }
    } catch {
      // Ignora e tenta fallback
    }
    try {
      await idbSet(REGISTRATION_STORAGE_KEY, payload);
      await idbSet(REGISTRATION_BACKUP_KEY, payload);
    } catch {
      // Ignora e usa fallback em memória
    }
    // Fallback em memória para garantir edição na sessão corrente
    memoryStore[REGISTRATION_STORAGE_KEY] = payload;
    memoryStore[REGISTRATION_BACKUP_KEY] = payload;
  },
  async clearRegistrationData(): Promise<void> {
    const storage = getLocalStorage();
    try {
      if (storage) {
        storage.removeItem(REGISTRATION_STORAGE_KEY);
        storage.removeItem(REGISTRATION_BACKUP_KEY);
      }
    } catch {
      // Ignora
    }
    await idbRemove(REGISTRATION_STORAGE_KEY);
    await idbRemove(REGISTRATION_BACKUP_KEY);
    delete memoryStore[REGISTRATION_STORAGE_KEY];
    delete memoryStore[REGISTRATION_BACKUP_KEY];
  },
  async markRegistrationComplete(): Promise<void> {
    const storage = getLocalStorage();
    try {
      if (storage) {
        storage.setItem(REGISTRATION_COMPLETED_KEY, 'true');
      }
    } catch {
      // Ignora
    }
    try {
      await idbSet(REGISTRATION_COMPLETED_KEY, 'true');
    } catch {
      // Ignora
    }
    memoryStore[REGISTRATION_COMPLETED_KEY] = 'true';
  },
  async isRegistrationComplete(): Promise<boolean> {
    const storage = getLocalStorage();
    try {
      const flagLocal = storage ? storage.getItem(REGISTRATION_COMPLETED_KEY) : null;
      const flagIdb = await idbGet(REGISTRATION_COMPLETED_KEY);
      const flagMemory = memoryStore[REGISTRATION_COMPLETED_KEY];
      if (flagLocal === 'true' || flagIdb === 'true' || flagMemory === 'true') return true;
      // Se não houver flag, tenta inferir por dados salvos
      const data = await this.getRegistrationData();
      if (!data) return false;
      const complete = RegistrationValidation.isAllDataComplete(data);
      if (complete) {
        // Persistir flag para não revalidar toda vez
        await this.markRegistrationComplete();
      }
      return complete;
    } catch {
      return false;
    }
  },
  async clearRegistrationCompleteFlag(): Promise<void> {
    const storage = getWebStorage();
    try {
      if (storage) {
        storage.removeItem(REGISTRATION_COMPLETED_KEY);
      }
    } catch {
      // Ignora
    }
    await idbRemove(REGISTRATION_COMPLETED_KEY);
    delete memoryStore[REGISTRATION_COMPLETED_KEY];
  },
};

export default RegistrationStorage;