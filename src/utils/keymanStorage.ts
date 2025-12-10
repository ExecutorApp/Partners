import { getLocalStorage, idbSet } from './persistentStorageEngine';

export type KeymanDraft = {
  personType: 'FISICA' | 'JURIDICA';
  // Pessoa Física
  name?: string;
  cpf?: string;
  // Pessoa Jurídica
  companyName?: string;
  cnpj?: string;
  responsibleName?: string;
  responsibleCPF?: string;
  // Comuns
  email: string;
  whatsapp: string;
  state: string;
  cep: string;
  city: string;
  neighborhood: string;
  address: string;
  number: string;
  complement?: string;
  // Foto opcional
  photoUri?: string | null;
};

const KEY = 'partners.keyman.new';
const BACKUP_KEY = 'partners.keyman.new.backup';

// Fallback em memória para garantir persistência na sessão quando não houver storage Web
const memoryStore: Record<string, string> = {};

/**
 * Salva o rascunho do formulário "Novo Keyman" no armazenamento local.
 * Usa localStorage e IndexedDB (backup) quando disponíveis e mantém um fallback em memória.
 */
export async function saveKeymanDraft(draft: KeymanDraft): Promise<void> {
  const storage = getLocalStorage();
  const payload = JSON.stringify(draft);
  // Tenta localStorage
  try {
    if (storage) {
      storage.setItem(KEY, payload);
      storage.setItem(BACKUP_KEY, payload);
    }
  } catch {
    // Silencia e continua
  }
  // Tenta IndexedDB
  try {
    await idbSet(KEY, payload);
    await idbSet(BACKUP_KEY, payload);
  } catch {
    // Silencia e mantém fallback
  }
  // Fallback em memória
  memoryStore[KEY] = payload;
  memoryStore[BACKUP_KEY] = payload;
}