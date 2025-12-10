import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

export type PickedFile = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  // Apenas Web: referência ao File original para leitura de texto
  file?: File;
};

/**
 * Abre o seletor de documentos do sistema e retorna arquivos normalizados.
 * Suporta: PDF, DOCX, TXT e qualquer tipo de áudio (audio/*).
 */
export async function pickFiles(): Promise<PickedFile[]> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'audio/*',
      ],
    });

    if ((result as any)?.canceled) return [];
    const assets = (result as any)?.assets ?? [];
    return assets.map((a: any) => ({
      uri: a.uri,
      name: a.name,
      mimeType: a.mimeType ?? null,
      size: a.size ?? null,
      file: Platform.OS === 'web' ? (a.file as File | undefined) : undefined,
    }));
  } catch (error) {
    console.warn('[filePicker] Erro ao selecionar documentos', error);
    return [];
  }
}

export function getExtension(name?: string): string | null {
  if (!name) return null;
  const idx = name.lastIndexOf('.');
  if (idx < 0) return null;
  return name.substring(idx + 1).toLowerCase();
}