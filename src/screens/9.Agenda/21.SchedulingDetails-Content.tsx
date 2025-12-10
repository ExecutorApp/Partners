import React, { useState, useEffect, useCallback } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Svg, Path, Rect } from 'react-native-svg';
import ContentList, { ContentFilterType as ListFilterType, NoteItem, DEFAULT_ITEMS } from '../../components/content/ContentList';
import { WavePanelIcon, PauseCircleIcon, GearIcon, PlayCircleIcon, PrevIcon, NextIcon } from '../../components/content/ContentIcons';
import { formatDurationHM, formatPositionByDuration } from '../../utils/time';
import { FilterIcon } from '../../components/content/ContentIcons';
import AudioSettingsModal from '../../components/audio/AudioSettingsModal';
import FilterContentTypeModal from './22.Filter-ContentType';
import { AudioPlayerProvider, useAudioPlayer } from '../../context/AudioPlayerContext';
import ModalMenuCards from './23.ModalMenuCards';
import ModalAlertDeleteCommitment from './14.ModalAlert-DeleteCommitment';
import ModalNewAnnotation from './24.ModalNewAnnotation';
import ModalAudioAnnotation from './25.Modal-AudioAnnotation';
import ModalTextAnnotation from './27.Modal-TextAnnotation';
import ModalTextReader from './26.Modal-TextReader';
import ModalPdfReader from './28.Modal-PdfReader';
import ModalDocxReader from './29.Modal-DocxReader';
import { pickFiles, getExtension } from '../../utils/filePicker';

// Função segura para formatar duração em MM:SS ou HH:MM:SS
// Evita mostrar "Infinity:NaN:NaN" para valores inválidos
const safeFormatDuration = (ms: number | undefined | null): string => {
  // Validar entrada
  if (ms === undefined || ms === null || !Number.isFinite(ms) || ms < 0 || Number.isNaN(ms)) {
    return '00:00';
  }
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (n: number) => String(n).padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

// Aba "Conteúdo" extraída para arquivo próprio, mantendo rolagem adequada na Web
// e espaçador inferior de 10px para evitar que componentes encostem na borda.
const AudioControls: React.FC = () => {
  const { currentIndex, isPlaying, togglePlay, next, prev, autoNextEnabled, setAutoNextEnabled, displayPositionMillis, durationMillis } = useAudioPlayer();
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Exibir o container azul somente quando houver áudio ativo/selecionado
  if (currentIndex == null) {
    return null;
  }

  return (
    <>
      {/* Painel de áudio fixo ao rodapé com 10px de margem */}
      <View style={styles.audioPanelFixed}>
        <View style={styles.audioPanelRow}>
          {/* Autoplay (ícone Figma) */}
          <TouchableOpacity
            onPress={() => setAutoNextEnabled(!autoNextEnabled)}
            accessibilityRole="switch"
            accessibilityState={{ checked: autoNextEnabled }}
            accessibilityLabel="Autoplay"
          >
            <WavePanelIcon enabled={autoNextEnabled} />
          </TouchableOpacity>
          {/* Controles */}
          <TouchableOpacity onPress={prev} accessibilityRole="button" accessibilityLabel="Áudio anterior">
            <PrevIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={togglePlay} accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pausar' : 'Tocar'}>
            {isPlaying ? <PauseCircleIcon variant="inverse" /> : <PlayCircleIcon variant="inverse" />}
          </TouchableOpacity>
          <TouchableOpacity onPress={next} accessibilityRole="button" accessibilityLabel="Próximo áudio">
            <NextIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} accessibilityRole="button" accessibilityLabel="Configurações de áudio">
            <GearIcon />
          </TouchableOpacity>
        </View>
        {/* Tempos removidos conforme pedido: o player azul exibe apenas controles */}
      </View>
      <AudioSettingsModal visible={settingsVisible} onRequestClose={() => setSettingsVisible(false)} />
    </>
  );
};

// Função auxiliar para obter duração real de um áudio a partir da URI
const fetchAudioDuration = async (uri: string): Promise<number> => {
  console.log('[fetchAudioDuration] Iniciando para URI:', uri?.substring(0, 60));
  if (!uri) return 0;
  
  if (Platform.OS === 'web') {
    return new Promise<number>((resolve) => {
      try {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        audio.src = uri;
        
        let resolved = false;
        const finish = (duration: number) => {
          if (resolved) return;
          resolved = true;
          console.log('[fetchAudioDuration] Finalizado:', { duration, isFinite: Number.isFinite(duration) });
          try { audio.remove(); } catch {}
          resolve(duration > 0 && Number.isFinite(duration) ? Math.round(duration * 1000) : 0);
        };
        
        audio.addEventListener('loadedmetadata', () => {
          console.log('[fetchAudioDuration] loadedmetadata:', audio.duration);
          finish(audio.duration);
        }, { once: true });
        
        audio.addEventListener('durationchange', () => {
          console.log('[fetchAudioDuration] durationchange:', audio.duration);
          if (audio.duration && audio.duration !== Infinity) {
            finish(audio.duration);
          }
        }, { once: true });
        
        audio.addEventListener('error', (e) => {
          console.error('[fetchAudioDuration] error:', e);
          finish(0);
        }, { once: true });
        
        // Timeout de segurança
        setTimeout(() => {
          console.log('[fetchAudioDuration] timeout, duration:', audio.duration);
          finish(audio.duration || 0);
        }, 5000);
        
        audio.load();
      } catch (err) {
        console.error('[fetchAudioDuration] catch:', err);
        resolve(0);
      }
    });
  }
  
  // Para plataformas nativas, usar expo-av
  try {
    const { Audio } = require('expo-av');
    const { sound, status } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false }
    );
    const durationMs = (status as any)?.durationMillis ?? 0;
    await sound.unloadAsync();
    return durationMs;
  } catch {
    return 0;
  }
};

const SchedulingDetailsContent: React.FC = () => {
  // Estado da lista de conteúdo e playlist — permitindo adicionar novos áudios
  // IMPORTANTE: Playlist inicia vazia para que apenas áudios reais (do usuário) sejam tocados
  const [items, setItems] = useState<NoteItem[]>([]);
  const [playlist, setPlaylist] = useState<Array<{ id: string; title: string; uri: string; durationMs?: number }>>([]);

  const [filterVisible, setFilterVisible] = useState(false);
  const [filterType, setFilterType] = useState<ListFilterType>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuItem, setMenuItem] = useState<{ index: number; title: string; type: 'txt' | 'pdf' | 'docx' | 'audioPlay' | 'audioPause'; anchor?: { top: number; left: number } } | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [newAnnotationVisible, setNewAnnotationVisible] = useState(false);
  const [audioAnnotationVisible, setAudioAnnotationVisible] = useState(false);
  const [textAnnotationVisible, setTextAnnotationVisible] = useState(false);
  const [editingAudio, setEditingAudio] = useState<{ listIndex: number; playlistIndex: number } | null>(null);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);
  const [textReaderVisible, setTextReaderVisible] = useState(false);
  const [readingTextIndex, setReadingTextIndex] = useState<number | null>(null);
  const [pdfReaderVisible, setPdfReaderVisible] = useState(false);
  const [readingPdfIndex, setReadingPdfIndex] = useState<number | null>(null);
  const [docxReaderVisible, setDocxReaderVisible] = useState(false);
  const [readingDocxIndex, setReadingDocxIndex] = useState<number | null>(null);
  
  // Estado para armazenar durações reais dos áudios
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>({});

  // Sanitizar durações para evitar valores inválidos (Infinity, NaN, undefined)
  const sanitizedAudioDurations = React.useMemo(() => {
    const sanitized: Record<string, number> = {};
    for (const [id, duration] of Object.entries(audioDurations)) {
      // Apenas incluir durações válidas
      if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0 && !Number.isNaN(duration)) {
        sanitized[id] = duration;
      } else {
        // Usar 0 como fallback para durações inválidas
        sanitized[id] = 0;
      }
    }
    return sanitized;
  }, [audioDurations]);

  // Carregar durações reais dos áudios na playlist
  useEffect(() => {
    const loadDurations = async () => {
      console.log('[SchedulingDetails-Content] loadDurations iniciado, playlist:', playlist.length, 'tracks');
      for (const track of playlist) {
        console.log('[SchedulingDetails-Content] Verificando track:', { id: track.id, uri: track.uri?.substring(0, 50), hasDuration: !!audioDurations[track.id] });
        if (!audioDurations[track.id] && track.uri) {
          console.log('[SchedulingDetails-Content] Carregando duração para:', track.id);
          const duration = await fetchAudioDuration(track.uri);
          console.log('[SchedulingDetails-Content] Duração obtida:', { id: track.id, duration });
          // Só armazenar se for um valor válido
          if (typeof duration === 'number' && Number.isFinite(duration) && duration > 0) {
            setAudioDurations(prev => ({ ...prev, [track.id]: duration }));
            console.log('[SchedulingDetails-Content] Duração armazenada:', { id: track.id, duration });
          }
        }
      }
    };
    loadDurations();
  }, [playlist]);

  // Mapeia índice do item na lista para índice correspondente na playlist de áudios
  const getAudioIndexForListIndex = (arr: NoteItem[], idx: number) => {
    let count = 0;
    for (let i = 0; i <= idx; i++) {
      const t = arr[i]?.type;
      if (t === 'audioPlay' || t === 'audioPause') count++;
    }
    return count - 1; // índice dentro da playlist; -1 quando não-álbum
  };

  // Utilitários locais
  const formatCreationDate = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  // Contagem total de anotações (PDF, TXT, DOCX, Áudio)
  const countAllItems = (arr: NoteItem[]) => arr.length;
  // Nome automático: "Anotação XX" usando total de anotações existentes
  const nextAutoAnnotationTitle = (arr: NoteItem[]) => {
    const nextIndex = countAllItems(arr) + 1;
    return `Conteúdo ${String(nextIndex).padStart(2, '0')}`;
  };

  const filterLabel = (() => {
    switch (filterType) {
      case 'txt': return 'TXT';
      case 'pdf': return 'PDF';
      case 'docx': return 'DOCX';
      case 'audio': return 'Áudio';
      case 'all':
      default: return 'Todos';
    }
  })();

  // Calcular contagens por tipo de conteúdo para o modal de filtro
  const contentCounts = React.useMemo(() => {
    const counts = {
      all: items.length,
      txt: 0,
      pdf: 0,
      docx: 0,
      audio: 0,
    };
    for (const item of items) {
      switch (item.type) {
        case 'txt':
          counts.txt++;
          break;
        case 'pdf':
          counts.pdf++;
          break;
        case 'docx':
          counts.docx++;
          break;
        case 'audioPlay':
        case 'audioPause':
          counts.audio++;
          break;
      }
    }
    return counts;
  }, [items]);

  // Calcular itens filtrados para determinar empty state corretamente
  const filteredItems = React.useMemo(() => {
    switch (filterType) {
      case 'txt':
        return items.filter((i) => i.type === 'txt');
      case 'pdf':
        return items.filter((i) => i.type === 'pdf');
      case 'docx':
        return items.filter((i) => i.type === 'docx');
      case 'audio':
        return items.filter((i) => i.type === 'audioPlay' || i.type === 'audioPause');
      case 'all':
      default:
        return items;
    }
  }, [filterType, items]);

  // Verifica se a lista filtrada está vazia (para aplicar estilo correto no scroll)
  const isFilteredEmpty = filteredItems.length === 0;

  const handleUploadPress = async () => {
    const selected = await pickFiles();
    if (!selected || selected.length === 0) return;

    const createdAt = formatCreationDate();
    const addedItems: NoteItem[] = [];
    const addedTracks: Array<{ id: string; title: string; uri: string; durationMs?: number }> = [];

    for (const file of selected) {
      const ext = getExtension(file.name ?? undefined);
      const mime = (file.mimeType ?? undefined) || undefined;
      const nameBase = (() => {
        const n = file.name ?? '';
        const idx = n.lastIndexOf('.');
        return idx >= 0 ? n.substring(0, idx) : (n || nextAutoAnnotationTitle(items));
      })();

      let type: NoteItem['type'] | null = null;
      if (mime && mime.startsWith('audio/')) {
        type = 'audioPlay';
      } else if (mime === 'application/pdf' || ext === 'pdf') {
        type = 'pdf';
      } else if (mime === 'text/plain' || ext === 'txt') {
        type = 'txt';
      } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') {
        type = 'docx';
      } else if (mime === 'application/msword' || ext === 'doc') {
        // Tratamos .doc como família Word no mesmo tipo de visualização
        // O modal detectará .doc e usará viewers externos (Office/Google) quando possível
        type = 'docx';
      }

      if (!type) {
        // Ignorar tipos não suportados
        continue;
      }

      const item: NoteItem = {
        type,
        title: nameBase,
        subtitle: createdAt,
      };

      if (type === 'txt') {
        // Web: ler conteúdo do arquivo selecionado e preencher textContent
        const anyFile: any = file as any;
        if (Platform.OS === 'web' && anyFile?.file && typeof anyFile.file.text === 'function') {
          try {
            item.textContent = await anyFile.file.text();
          } catch (err) {
            console.warn('[Upload] Falha ao ler TXT no Web', err);
          }
        }
      }

      // Guardar URI do arquivo para abrir em leitores (PDF/DOCX/TXT)
      if (type === 'pdf' || type === 'docx' || type === 'txt') {
        item.fileUri = file.uri;
        // Web: manter referência ao File original para fallback inline (DOCX)
        const anyFile: any = file as any;
        if (Platform.OS === 'web' && type === 'docx' && anyFile?.file) {
          try {
            item.webFileRef = anyFile.file as File;
          } catch {}
        }
      }

      if (type === 'audioPlay') {
        item.withProgress = true;
        
        // Web: Criar Blob URL do arquivo de áudio para reprodução real
        let audioUri = file.uri;
        const anyFile: any = file as any;
        
        if (Platform.OS === 'web' && anyFile?.file instanceof File) {
          try {
            // Criar uma Blob URL do arquivo original para reprodução
            audioUri = URL.createObjectURL(anyFile.file);
            console.log('[Upload] Criada Blob URL para áudio:', { original: file.uri, blobUrl: audioUri });
          } catch (err) {
            console.warn('[Upload] Falha ao criar Blob URL para áudio:', err);
          }
        }
        
        // Obter duração real do áudio
        const durationMs = await fetchAudioDuration(audioUri);
        item.durationMs = durationMs;
        item.fileUri = audioUri; // Guardar URI para referência
        
        const trackId = `a${playlist.length + addedTracks.length + 1}`;
        addedTracks.push({ id: trackId, title: nameBase, uri: audioUri, durationMs });
        
        // Armazenar duração
        if (durationMs > 0) {
          setAudioDurations(prev => ({ ...prev, [trackId]: durationMs }));
        }
        
        console.log('[Upload] Áudio adicionado:', { trackId, title: nameBase, uri: audioUri, durationMs });
      }

      addedItems.push(item);
    }

    if (addedItems.length > 0) setItems(prev => [...prev, ...addedItems]);
    if (addedTracks.length > 0) setPlaylist(prev => [...prev, ...addedTracks]);
  };

  return (
    <AudioPlayerProvider playlist={playlist} audioDurations={sanitizedAudioDurations}>
    <View style={styles.wrapper}>
      {/* ÁREA FIXA: Botões e Filtro (fora do scroll) */}
      <View style={styles.fixedHeader}>
        {/* Header com botões */}
        <View style={styles.actionsHeader}>
          {/* Botão Upload (Figma) */}
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} accessibilityRole="button" accessibilityLabel="Upload" onPress={handleUploadPress}>
            <View style={styles.actionContent}>
              <View style={styles.actionIconBox}>
                <Svg width={16} height={15} viewBox="0 0 16 15" fill="none">
                  <Path d="M12.1636 3.62149C11.6455 1.54299 9.72727 0 7.5 0C5.27273 0 3.35455 1.54299 2.83636 3.62149C1.17273 4.10047 0 5.62617 0 7.42991C0 9.61449 1.75909 11.4019 3.90909 11.4019H4.77273C5.09091 11.4019 5.31818 11.1729 5.31818 10.8598C5.31818 10.5467 5.09091 10.3178 4.77273 10.3178H3.90909C2.34545 10.3178 1.09091 9.02336 1.09091 7.42991C1.09091 5.96262 2.14545 4.7523 3.55909 4.57243L3.96818 4.51776L4.05 4.11028C4.39091 2.3529 5.80909 1.08411 7.5 1.08411C9.19091 1.08411 10.6091 2.3529 10.95 4.11028L11.0318 4.51776L11.4409 4.57243C12.8545 4.7523 13.9091 5.96262 13.9091 7.42991C13.9091 9.02336 12.6545 10.3178 11.0909 10.3178H10.2273C9.90909 10.3178 9.68182 10.5467 9.68182 10.8598C9.68182 11.1729 9.90909 11.4019 10.2273 11.4019H11.0909C13.2409 11.4019 15 9.61449 15 7.42991C15 5.62617 13.8273 4.10047 12.1636 3.62149Z" fill="#1777CF" />
                  <Path d="M7.42758 6.89531L5.56849 8.74767C5.35395 8.96123 5.35395 9.30951 5.56849 9.52307C5.78304 9.73663 6.1303 9.73663 6.34485 9.52307L6.95394 8.91543V14.4523C6.95394 14.7546 7.19849 15 7.5003 15C7.80212 15 8.04667 14.7546 8.04667 14.4523V8.91543L8.65576 9.52307C8.8703 9.73663 9.21757 9.73663 9.43212 9.52307C9.53939 9.41629 9.59303 9.27509 9.59303 9.13389C9.59303 8.99268 9.53939 8.85148 9.43212 8.74471L7.57303 6.89235C7.35849 6.67879 7.01212 6.68175 7.42758 6.89531Z" fill="#1777CF" />
                </Svg>
              </View>
              <Text style={styles.actionOutlineText}>Upload</Text>
            </View>
          </TouchableOpacity>
          {/* Botão Novo conteúdo (Figma) */}
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} accessibilityRole="button" accessibilityLabel="Novo conteúdo" onPress={() => setNewAnnotationVisible(true)}>
            <View style={styles.actionContent}>
              <View style={styles.actionIconBox}>
                <Svg width={8} height={8} viewBox="0 0 8 8" fill="none">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M7.45454 3.27274H4.72726V0.545463C4.72726 0.244364 4.4829 0 4.18181 0H3.81819C3.5171 0 3.27274 0.244364 3.27274 0.545463V3.27274H0.545463C0.244364 3.27274 0 3.5171 0 3.81819V4.18181C0 4.4829 0.244364 4.72726 0.545463 4.72726H3.27274V7.45454C3.27274 7.75564 3.5171 8 3.81819 8H4.18181C4.4829 8 4.72726 7.75564 4.72726 7.45454V4.72726H7.45454C7.75564 4.72726 8 4.4829 8 4.18181V3.81819C8 3.5171 7.75564 3.27274 7.45454 3.27274Z" fill="#FCFCFC" />
                </Svg>
              </View>
              <Text style={styles.actionPrimaryText}>Novo conteúdo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Filtro de tipo de conteúdo com ícone de funil à esquerda */}
        <TouchableOpacity
          style={styles.filterBox}
          activeOpacity={0.8}
          onPress={() => setFilterVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir filtro de tipo de conteúdo"
        >
          <View style={styles.filterRow}>
            <View style={styles.filterIconBox}>
              <FilterIcon width={38} height={37} />
            </View>
            <View style={styles.filterInfoCol}>
              <Text style={styles.filterLabel}>Tipo de conteúdo</Text>
              <Text style={styles.filterValue}>{filterLabel}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ÁREA SCROLLÁVEL: Lista de conteúdos */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={isFilteredEmpty ? styles.scrollContentEmpty : styles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          {/* Lista de conteúdos (Figma) - ContentList renderiza empty state interno */}
          <ContentList
            items={items}
            filterType={filterType}
            audioDurations={sanitizedAudioDurations}
            onOpenItemMenu={(info) => { setMenuItem(info); setMenuVisible(true); }}
            onOpenText={(info) => {
              const originalIdx = items.findIndex((it) => it === info.item);
              setReadingTextIndex(originalIdx >= 0 ? originalIdx : info.index);
              setTextReaderVisible(true);
            }}
            onOpenPdf={(info) => {
              const originalIdx = items.findIndex((it) => it === info.item);
              setReadingPdfIndex(originalIdx >= 0 ? originalIdx : info.index);
              setPdfReaderVisible(true);
            }}
            onOpenDocx={(info) => {
              const originalIdx = items.findIndex((it) => it === info.item);
              try {
                const idxResolved = originalIdx >= 0 ? originalIdx : info.index;
                const resolvedItem = items[idxResolved];
                console.log('[SchedulingDetails-Content] onOpenDocx', {
                  index: info.index,
                  resolvedIndex: idxResolved,
                  title: resolvedItem?.title ?? info.item?.title,
                  uri: resolvedItem?.fileUri ?? (info.item as any)?.fileUri,
                });
              } catch {}
              setReadingDocxIndex(originalIdx >= 0 ? originalIdx : info.index);
              setDocxReaderVisible(true);
            }}
          />

          {/* Espaçador final */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <AudioControls />
      {/* Modal Leitor de documentos TXT em tela cheia (Figma 12/13) */}
      <ModalTextReader
        visible={textReaderVisible}
        onClose={() => { setTextReaderVisible(false); setReadingTextIndex(null); }}
        title={readingTextIndex != null ? items[readingTextIndex]?.title : undefined}
        content={readingTextIndex != null ? items[readingTextIndex]?.textContent : undefined}
        onEdit={() => {
          if (readingTextIndex == null) return;
          setTextReaderVisible(false);
          setEditingTextIndex(readingTextIndex);
          setTextAnnotationVisible(true);
        }}
      />
      {/* Modal Leitor de documentos PDF em tela cheia (Web via iframe) */}
      <ModalPdfReader
        visible={pdfReaderVisible}
        onClose={() => { setPdfReaderVisible(false); setReadingPdfIndex(null); }}
        title={readingPdfIndex != null ? items[readingPdfIndex]?.title : undefined}
        uri={readingPdfIndex != null ? items[readingPdfIndex]?.fileUri : undefined}
      />
      {/* Modal Leitor de documentos DOCX em tela cheia (Web via iframe) */}
      <ModalDocxReader
        visible={docxReaderVisible}
        onClose={() => { setDocxReaderVisible(false); setReadingDocxIndex(null); }}
        title={readingDocxIndex != null ? items[readingDocxIndex]?.title : undefined}
        uri={readingDocxIndex != null ? items[readingDocxIndex]?.fileUri : undefined}
        fileRef={readingDocxIndex != null ? items[readingDocxIndex]?.webFileRef : undefined}
      />
      {/* Modal Novo conteúdo (Figma 06) */}
      <ModalNewAnnotation
        visible={newAnnotationVisible}
        onClose={() => setNewAnnotationVisible(false)}
        onSelect={(type) => {
          setNewAnnotationVisible(false);
          console.log('[SchedulingDetails-Content] Novo conteúdo selecionado', { type });
          if (type === 'audio') {
            setAudioAnnotationVisible(true);
          } else if (type === 'text') {
            setTextAnnotationVisible(true);
          }
        }}
      />
      {/* Modal de criação/edição de texto (Figma 11) */}
      <ModalTextAnnotation
        visible={textAnnotationVisible}
        mode={editingTextIndex != null ? 'edit' : 'create'}
        initialName={editingTextIndex != null ? items[editingTextIndex]?.title : undefined}
        initialContent={editingTextIndex != null ? items[editingTextIndex]?.textContent : undefined}
        onClose={() => { setTextAnnotationVisible(false); setEditingTextIndex(null); }}
        onSave={({ name, content }) => {
          const incomingName = (name ?? '').trim();
          if (editingTextIndex != null) {
            const idx = editingTextIndex;
            const prevTitle = items[idx]?.title ?? '';
            const safeName = incomingName.length > 0 ? incomingName : prevTitle;
            setItems(prev => prev.map((it, i) => i === idx ? { ...it, title: safeName, textContent: content ?? it.textContent } : it));
            setTextAnnotationVisible(false);
            setEditingTextIndex(null);
            return;
          }
          const safeName = incomingName.length > 0 ? incomingName : nextAutoAnnotationTitle(items);
          const createdAt = formatCreationDate();
          const newItem: NoteItem = {
            type: 'txt',
            title: safeName,
            subtitle: createdAt,
            textContent: content,
          };
          setItems(prev => [...prev, newItem]);
          setTextAnnotationVisible(false);
        }}
        onReset={() => console.log('[SchedulingDetails-Content] Resetar anotação de texto')}
      />
      {/* Modal de criação de áudio (Figma 09) */}
      <ModalAudioAnnotation
        visible={audioAnnotationVisible}
        mode={editingAudio ? 'edit' : 'create'}
        initialName={editingAudio ? items[editingAudio.listIndex]?.title : undefined}
        initialUri={editingAudio ? playlist[editingAudio.playlistIndex]?.uri : undefined}
        initialWaveHeights={editingAudio ? items[editingAudio.listIndex]?.waveHeights : undefined}
        onClose={() => { setAudioAnnotationVisible(false); setEditingAudio(null); }}
        onSave={async (payload) => {
          const incomingName = (payload?.name ?? '').trim();
          if (editingAudio) {
            const listIdx = editingAudio.listIndex;
            const plIdx = editingAudio.playlistIndex;
            const prevTitle = items[listIdx]?.title ?? '';
            const safeName = incomingName.length > 0 ? incomingName : prevTitle;
            
            // IMPORTANTE: Validar duração para evitar Infinity/NaN
            let validDurationMs: number | undefined;
            if (payload?.durationMs && typeof payload.durationMs === 'number' && Number.isFinite(payload.durationMs) && payload.durationMs > 0) {
              validDurationMs = Math.round(payload.durationMs);
            }
            
            // Atualiza item da lista
            setItems(prev => prev.map((it, i) => {
              if (i !== listIdx) return it;
              const nextWave = payload?.waveHeights && payload.waveHeights.length > 0 ? payload.waveHeights : it.waveHeights;
              return { ...it, title: safeName, waveHeights: nextWave, durationMs: validDurationMs ?? it.durationMs };
            }));
            // Atualiza faixa na playlist (título e, se houver, URI)
            setPlaylist(prev => prev.map((tr, i) => {
              if (i !== plIdx) return tr;
              const next = { ...tr, title: safeName };
              if (payload?.uri) next.uri = payload.uri;
              if (validDurationMs) next.durationMs = validDurationMs;
              return next;
            }));
            // Atualizar duração no estado
            if (validDurationMs && validDurationMs > 0) {
              const trackId = playlist[plIdx]?.id;
              if (trackId) {
                setAudioDurations(prev => ({ ...prev, [trackId]: validDurationMs! }));
              }
            }
            setAudioAnnotationVisible(false);
            setEditingAudio(null);
            return;
          }

          // Criação de novo áudio
          const safeName = incomingName.length > 0 ? incomingName : nextAutoAnnotationTitle(items);
          const createdAt = formatCreationDate();
          
          // IMPORTANTE: Validar duração para evitar Infinity/NaN
          let validDurationMs = 0;
          if (payload?.durationMs && typeof payload.durationMs === 'number' && Number.isFinite(payload.durationMs) && payload.durationMs > 0) {
            validDurationMs = Math.round(payload.durationMs);
          }
          
          console.log('[SchedulingDetails-Content] Criando novo áudio:', {
            name: safeName,
            durationMs: validDurationMs,
            hasUri: !!payload?.uri,
            waveHeightsCount: payload?.waveHeights?.length ?? 0,
          });
          
          const newItem: NoteItem = {
            type: 'audioPlay',
            title: safeName,
            subtitle: createdAt,
            withProgress: true,
            waveHeights: payload?.waveHeights,
            durationMs: validDurationMs > 0 ? validDurationMs : undefined,
          };
          setItems(prev => [...prev, newItem]);
          
          // Usar a URI do áudio gravado - se não tiver URI, não adicionar à playlist
          // (isso evita tocar áudios fictícios)
          if (payload?.uri) {
            const trackId = `a${playlist.length + 1}`;
            console.log('[SchedulingDetails-Content] Adicionando à playlist:', { trackId, uri: payload.uri, durationMs: validDurationMs });
            setPlaylist(prev => [...prev, { id: trackId, title: safeName, uri: payload.uri!, durationMs: validDurationMs > 0 ? validDurationMs : undefined }]);
            
            // Armazenar duração apenas se for válida
            if (validDurationMs > 0) {
              setAudioDurations(prev => ({ ...prev, [trackId]: validDurationMs }));
              console.log('[SchedulingDetails-Content] Duração armazenada:', { trackId, durationMs: validDurationMs });
            }
          } else {
            console.warn('[SchedulingDetails-Content] Áudio criado sem URI - não será possível reproduzir');
          }
          
          setAudioAnnotationVisible(false);
        }}
        onReset={() => console.log('[SchedulingDetails-Content] Resetar gravação')}
      />
      {/* Modal de ações dos cards (Figma 08) */}
      <ModalMenuCards
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={menuItem?.anchor}
        onEdit={() => {
          setMenuVisible(false);
          if (!menuItem) return;
          // Edição de TXT: abrir modal de anotação de texto
          if (menuItem.type === 'txt') {
            setEditingTextIndex(menuItem.index);
            setTextAnnotationVisible(true);
            return;
          }
          // Áudio: abrir modal de anotação para editar nome e/ou regravar
          if (menuItem.type === 'audioPlay' || menuItem.type === 'audioPause') {
            const listIndex = menuItem.index;
            const playlistIndex = getAudioIndexForListIndex(items, listIndex);
            if (playlistIndex >= 0) {
              setEditingAudio({ listIndex, playlistIndex });
              setAudioAnnotationVisible(true);
            }
          }
        }}
        onDelete={() => {
          setMenuVisible(false);
          if (!menuItem) return;
          setDeleteVisible(true);
        }}
      />
      {/* Modal padrão do sistema 209 - confirmação de exclusão de conteúdo */}
      <ModalAlertDeleteCommitment
        visible={deleteVisible}
        mode="content"
        name={menuItem?.title}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={() => {
          setDeleteVisible(false);
          if (!menuItem) return;
          const idx = menuItem.index;
          const item = items[idx];
          // Remover item da lista
          setItems(prev => prev.filter((_, i) => i !== idx));
          // Se for um áudio, remover também da playlist correspondente
          if (item && (item.type === 'audioPlay' || item.type === 'audioPause')) {
            const audioIdx = getAudioIndexForListIndex(items, idx);
            if (audioIdx >= 0) {
              setPlaylist(prev => prev.filter((_, i) => i !== audioIdx));
            }
          }
        }}
      />
      {/* Modal de filtro por tipo de conteúdo */}
      <FilterContentTypeModal
        visible={filterVisible}
        selectedType={filterType}
        onClose={() => setFilterVisible(false)}
        onSelect={(t) => { setFilterType(t as ListFilterType); setFilterVisible(false); }}
        counts={contentCounts}
      />
    </View>
    </AudioPlayerProvider>
  );
};

export default SchedulingDetailsContent;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: 0,
  },
  // ÁREA FIXA: Botões e Filtro
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  // WRAPPER DO SCROLL
  scrollWrapper: {
    flex: 1,
    position: 'relative',
    // No web, precisa de overflow hidden para o scroll interno funcionar
    ...Platform.select({
      web: {
        overflow: 'hidden',
      } as any,
      default: {},
    }),
  },
  // SCROLLVIEW - No web usa position absolute para ter altura definida
  scroll: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
      } as any,
      default: {
        flex: 1,
      },
    }),
  },
  // CONTENT do scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  // Espaçador no final para não ficar atrás do player
  bottomSpacer: {
    height: 15,
  },

  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  actionBtn: {
    height: 33,
    borderRadius: 6,
    paddingHorizontal: 10,
    // padding vertical mínimo para manter altura e conforto de clique
    paddingVertical: 5,
    // garantir centralização vertical do conteúdo
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnOutline: {
    borderWidth: 0.5,
    borderColor: '#1777CF',
    backgroundColor: '#FCFCFC',
  },
  actionBtnPrimary: {
    backgroundColor: '#1777CF',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutlineText: {
    color: '#1777CF',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 17,
  },
  actionPrimaryText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 17,
  },

  filterBox: {
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  filterInfoCol: {
    flex: 1,
  },
  filterIconBox: {
    width: 38,
    height: 37,
  },
  filterLabel: {
    color: '#7D8592',
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Inter_500Medium',
  },
  filterValue: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },

  audioPanelFixed: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 15, // 10px de margem inferior para não encostar na tela
    backgroundColor: '#1777CF',
    borderRadius: 16,
    height: 76,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  audioPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  panelTimeLeft: {
    color: '#FCFCFC',
    fontSize: 12,
    opacity: 0.95,
  },
  panelTimeRight: {
    color: '#FCFCFC',
    fontSize: 12,
    opacity: 0.95,
  },

  // Estilo para scroll quando está vazio - flex: 1 para ocupar toda altura
  scrollContentEmpty: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});