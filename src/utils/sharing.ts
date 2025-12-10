import { Platform, Linking, Alert } from 'react-native';

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function printTextDocument(title: string, content: string) {
  if (Platform.OS === 'web') {
    const paragraphs = (content || '')
      .trim()
      .split(/\n\n+/)
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`) // cada parágrafo em <p>
      .join('');

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title || 'Documento')}</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; color: #3A3F51; padding: 24px; }
      h1 { font-size: 18px; font-weight: 600; margin: 0 0 12px; }
      p { font-size: 14px; line-height: 20px; margin: 0 0 10px; }
      @page { margin: 20mm; }
    </style>
  </head>
  <body>
    ${title ? `<h1>${escapeHtml(title)}</h1>` : ''}
    ${paragraphs || '<p>Sem conteúdo</p>'}
    <script>window.onload = () => { setTimeout(() => { window.focus(); window.print(); }, 150); };</script>
  </body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      // fallback: imprime a própria página
      window.print();
    }
    return;
  }
  Alert.alert('Impressão indisponível', 'A impressão está disponível no modo Web.');
}

export async function shareByEmail(subject: string, body: string) {
  const mailto = `mailto:?subject=${encodeURIComponent(subject || 'Documento')}&body=${encodeURIComponent(body || '')}`;
  try {
    await Linking.openURL(mailto);
  } catch (err) {
    Alert.alert('Falha ao abrir email', 'Não foi possível abrir o cliente de email.');
  }
}

export async function shareByWhatsApp(text: string) {
  const encoded = encodeURIComponent(text || '');
  const scheme = `whatsapp://send?text=${encoded}`;
  const webUrl = `https://wa.me/?text=${encoded}`;
  try {
    const can = await Linking.canOpenURL(scheme);
    if (can) return Linking.openURL(scheme);
    return Linking.openURL(webUrl);
  } catch (err) {
    Alert.alert('Falha ao compartilhar', 'Não foi possível abrir o WhatsApp.');
  }
}

// Compartilha o documento fechado (arquivo .txt) via folha de compartilhamento do navegador.
// No mobile, sem libs adicionais, não há suporte nativo. Mantemos alerta claro.
export async function shareDocumentToWhatsApp(filename: string, text: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
      const file = new File([blob], filename || 'documento.txt', { type: 'text/plain' });
      const data: any = { files: [file], title: filename || 'Documento' };
      if ((navigator as any).canShare && !(navigator as any).canShare(data)) {
        // Fallback: abrir WhatsApp com texto se o navegador não suporta compartilhar arquivos
        return shareByWhatsApp(text);
      }
      await (navigator as any).share(data);
      return;
    } catch (err) {
      // Se falhar, fallback para texto
      return shareByWhatsApp(text);
    }
  }
  Alert.alert('Compartilhamento de arquivo indisponível', 'No seu ambiente atual, só é possível compartilhar texto.');
}

export function downloadTextFile(filename: string, text: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'documento.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }
  Alert.alert('Download indisponível', 'O download de arquivo está disponível no modo Web.');
}