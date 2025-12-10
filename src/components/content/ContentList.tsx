import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { TxtDocIcon, PdfDocIcon, DocxDocIcon, PlayCircleIcon, PauseCircleIcon, MenuDotsIcon } from './ContentIcons';
import ProgressBar from './ProgressBar';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { formatPositionByDuration, formatDurationHMS, formatDurationHM } from '../../utils/time';
import EmptyContentState from './EmptyContentState';
// Duração por item agora vem do AudioPlayerContext (prefetch centralizado)

// Dimensões dos ícones internos (respirar mais dentro da moldura 40x40)
const INNER_AUDIO_ICON_SIZE = 26; // diâmetro da bola branca para igualar altura dos docs
const INNER_DOC_ICON_WIDTH = 24;  // TXT/PDF/DOC
const INNER_DOC_ICON_HEIGHT = 26;

export type NoteItem = {
  type: 'txt' | 'pdf' | 'docx' | 'audioPlay' | 'audioPause';
  title: string;
  subtitle?: string;
  durationLabel?: string; // duração total, ex.: "1:35"
  withProgress?: boolean;
  // Ondas de gravação capturadas no modal (para reabrir edição com a mesma forma)
  waveHeights?: number[];
  // Conteúdo textual (apenas para itens TXT)
  textContent?: string;
  // URI do arquivo selecionado (PDF/DOCX/TXT). Áudio usa playlist.
  fileUri?: string;
  // Somente Web: referência ao File original (para fallback inline em base64)
  webFileRef?: File;
  durationMs?: number;
};


export type ContentFilterType = 'all' | 'txt' | 'pdf' | 'docx' | 'audio';

// Verifica se o item é do tipo áudio
const isAudioItem = (item: NoteItem) => {
  return item.type === 'audioPlay' || item.type === 'audioPause';
};

const ContentList: React.FC<{ items?: NoteItem[]; filterType?: ContentFilterType; onOpenItemMenu?: (info: { index: number; title: string; type: NoteItem['type']; anchor?: { top: number; left: number } }) => void; onOpenText?: (info: { index: number; item: NoteItem }) => void; onOpenPdf?: (info: { index: number; item: NoteItem }) => void; onOpenDocx?: (info: { index: number; item: NoteItem }) => void }> = ({ items: itemsProp, filterType = 'all', onOpenItemMenu, onOpenText, onOpenPdf, onOpenDocx }) => {
  const { currentIndex, togglePlay, playAt, isPlaying, progress, seekToFraction, displayPositionMillis, durationMillis, deactivate, durationsByIndex } = useAudioPlayer();
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const dotsRefs = React.useRef<Array<View | null>>([]);

  const source = React.useMemo(() => itemsProp ?? [], [itemsProp]);

  const items = React.useMemo(() => {
    switch (filterType) {
      case 'txt':
        return source.filter((i) => i.type === 'txt');
      case 'pdf':
        return source.filter((i) => i.type === 'pdf');
      case 'docx':
        return source.filter((i) => i.type === 'docx');
      case 'audio':
        return source.filter((i) => i.type === 'audioPlay' || i.type === 'audioPause');
      case 'all':
      default:
        return source;
    }
  }, [filterType, source]);

  const getAudioIndexForItem = (idx: number) => {
    let count = 0;
    for (let i = 0; i <= idx; i++) {
      const t = items[i]?.type;
      if (t === 'audioPlay' || t === 'audioPause') count++;
    }
    return count - 1; // índice dentro da playlist
  };

  // Mapeia índice da playlist (currentIndex) para o índice do item na lista (selectedIndex)
  const getItemIndexForAudioIndex = (audioIdx: number) => {
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      const t = items[i].type;
      if (t === 'audioPlay' || t === 'audioPause') {
        if (count === audioIdx) return i;
        count++;
      }
    }
    return -1;
  };

  const handleAudioPress = (idx: number) => {
    const audioIdx = getAudioIndexForItem(idx);
    if (audioIdx < 0) return;
    setSelectedIndex(idx);
    if (currentIndex === audioIdx) {
      void togglePlay();
    } else {
      void playAt(audioIdx);
    }
  };

  // Durações agora são fornecidas pelo contexto; nenhum prefetch local.

  // Sincroniza seleção visual quando troca via controles (Próximo/Voltar)
  React.useEffect(() => {
    if (typeof currentIndex === 'number' && currentIndex >= 0) {
      const itemIdx = getItemIndexForAudioIndex(currentIndex);
      if (itemIdx >= 0) setSelectedIndex(itemIdx);
    }
  }, [currentIndex]);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyContentState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.map((item, idx) => (
        <View key={`${item.title}-${idx}`} style={styles.itemBlock}>
          {/* Linha principal do card */}
          <View style={styles.itemRow}>
            {/* Moldura do ícone */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setSelectedIndex(idx);
                const t = items[idx].type;
                if (t === 'audioPlay' || t === 'audioPause') {
                  void handleAudioPress(idx);
                } else {
                  void deactivate();
                  if (t === 'txt') {
                    onOpenText?.({ index: idx, item });
                  } else if (t === 'pdf') {
                    onOpenPdf?.({ index: idx, item });
                  } else if (t === 'docx') {
                    try {
                      console.log('[ContentList] DOCX click on icon', {
                        index: idx,
                        title: item.title,
                        uri: (item as any)?.fileUri,
                      });
                    } catch {}
                    onOpenDocx?.({ index: idx, item });
                  }
                }
              }}
            >
              <View style={styles.iconFrame}>
                {item.type === 'audioPlay' || item.type === 'audioPause' ? (
                  currentIndex === getAudioIndexForItem(idx)
                    ? (isPlaying ? <PauseCircleIcon width={INNER_AUDIO_ICON_SIZE} height={INNER_AUDIO_ICON_SIZE} /> : <PlayCircleIcon width={INNER_AUDIO_ICON_SIZE} height={INNER_AUDIO_ICON_SIZE} />)
                    : <PlayCircleIcon width={INNER_AUDIO_ICON_SIZE} height={INNER_AUDIO_ICON_SIZE} />
                ) : (
                  renderIcon(item.type)
                )}
              </View>
            </TouchableOpacity>

            {/* Coluna de informações */}
            <View style={styles.infoCol}>
              <View style={styles.infoTopRow}>
                {/* Container do título com flex para ocupar espaço disponível e truncar */}
                <TouchableOpacity
                  style={styles.titleTouchable}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedIndex(idx);
                    const t = items[idx].type;
                    if (t === 'audioPlay' || t === 'audioPause') {
                      void handleAudioPress(idx);
                    } else {
                      void deactivate();
                      if (t === 'txt') {
                        onOpenText?.({ index: idx, item });
                      } else if (t === 'pdf') {
                        onOpenPdf?.({ index: idx, item });
                      } else if (t === 'docx') {
                        try {
                          console.log('[ContentList] DOCX click on title', {
                            index: idx,
                            title: item.title,
                            uri: (item as any)?.fileUri,
                          });
                        } catch {}
                        onOpenDocx?.({ index: idx, item });
                      }
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.type === 'audioPlay' || item.type === 'audioPause' ? 'Tocar/Pausar pelo título' : 'Selecionar conteúdo'}
                >
                  <Text 
                    style={[styles.title, selectedIndex === idx ? styles.titleActive : null]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
                {/* Ícone do menu com espaçamento fixo */}
                <View
                  style={styles.menuIconContainer}
                  ref={(el) => { dotsRefs.current[idx] = el; }}
                  collapsable={false}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => {
                      const ref: any = dotsRefs.current[idx];
                      if (ref && typeof ref.measure === 'function') {
                        ref.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                          const menuW = 184; // mesma largura usada no modal
                          const top = pageY + height + 6;
                          const left = pageX + width - menuW; // alinhar à direita do ícone
                          onOpenItemMenu?.({ index: idx, title: item.title, type: item.type, anchor: { top, left } });
                        });
                      } else {
                        onOpenItemMenu?.({ index: idx, title: item.title, type: item.type });
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir menu de ações para ${item.title}`}
                  >
                    <MenuDotsIcon />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.infoMetaRow}>
                {item.subtitle ? (
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                ) : <View />}
                {/* Duração exibida APENAS para itens de áudio */}
                {isAudioItem(item) ? (
                  <Text style={styles.durationLabel}>
                    {(() => {
                      const audioIdx = getAudioIndexForItem(idx);
                      if (audioIdx >= 0) {
                        // Prioridade: item ativo usa duração do contexto, demais usam prefetch global
                        const dActive = (currentIndex === audioIdx ? durationMillis : undefined);
                        const dPrefetch = durationsByIndex?.[audioIdx];
                        const d = (typeof dActive === 'number' && dActive > 0) ? dActive : (typeof dPrefetch === 'number' && dPrefetch > 0 ? dPrefetch : undefined);
                        // Exibir em MM:SS (<1h) ou HH:MM:SS (>=1h)
                        if (typeof d === 'number' && d > 0) return formatDurationHMS(d);
                        // Mostrar placeholder visível até que a duração real carregue
                        return '\u2014';
                      }
                      return '';
                    })()}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Barra de progresso e tempos (apenas quando selecionado e com progresso) */}
          {item.withProgress && selectedIndex === idx ? (
            <View style={styles.playbackBlock}>
              <ProgressBar
                progress={currentIndex === getAudioIndexForItem(idx) ? progress : 0}
                onSeek={currentIndex === getAudioIndexForItem(idx) ? seekToFraction : undefined}
                style={{ alignSelf: 'stretch' }}
              />
              <View style={styles.playbackTimesRow}>
                <Text style={styles.playbackTimeLeft}>
                  {currentIndex === getAudioIndexForItem(idx)
                    ? formatPositionByDuration(displayPositionMillis, durationMillis)
                    : '00:00'}
                </Text>
                <Text style={styles.playbackTimeRight}>
                  {currentIndex === getAudioIndexForItem(idx)
                    ? `- ${formatDurationHMS(Math.max(0, (durationMillis ?? 0) - (displayPositionMillis ?? 0)))}`
                    : (item.durationLabel ? `- ${item.durationLabel}` : '')}
                </Text>
              </View>
            </View>
          ) : null}

          {idx < items.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
};

function renderIcon(type: NoteItem['type']) {
  switch (type) {
    case 'txt':
      return <TxtDocIcon width={INNER_DOC_ICON_WIDTH} height={INNER_DOC_ICON_HEIGHT} />;
    case 'pdf':
      return <PdfDocIcon width={INNER_DOC_ICON_WIDTH} height={INNER_DOC_ICON_HEIGHT} />;
    case 'docx':
      return <DocxDocIcon width={INNER_DOC_ICON_WIDTH} height={INNER_DOC_ICON_HEIGHT} />;
    case 'audioPlay':
      return <PlayCircleIcon width={INNER_AUDIO_ICON_SIZE} height={INNER_AUDIO_ICON_SIZE} />;
    case 'audioPause':
      return <PauseCircleIcon width={INNER_AUDIO_ICON_SIZE} height={INNER_AUDIO_ICON_SIZE} />;
    default:
      return null;
  }
}

export default ContentList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    flex: 1,
    flexGrow: 1,
    minHeight: 0, // evita extrapolar e ficar oculto atrás do rodapé
    marginBottom: 5, // 10px de folga inferior
  },
  itemBlock: {
    gap: 5,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 12,
  },
  iconFrame: {
    width: 40,
    height: 40,
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    gap: 5,
  },
  infoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Container touchable do título - ocupa espaço disponível menos o ícone do menu
  titleTouchable: {
    flex: 1,
    marginRight: 15, // 20px de margem antes do ícone de menu (três pontinhos)
  },
  title: {
    color: '#3A3F51',
    fontSize: 14,
    fontWeight: '500',
  },
  titleActive: {
    color: '#1777CF',
  },
  // Container do ícone de menu - largura fixa para garantir espaço consistente
  menuIconContainer: {
    width: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // não encolhe
  },
  infoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtitle: {
    color: '#7D8592',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  durationLabel: {
    color: '#7D8592',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 10,
  },
  playbackBlock: {
    alignSelf: 'stretch',
    height: 30,
    justifyContent: 'center',
    gap: 5,
  },
  playbackTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playbackTimeLeft: {
    color: '#1777CF',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  playbackTimeRight: {
    color: '#1777CF',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});