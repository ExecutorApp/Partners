import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Svg, Line } from 'react-native-svg';

type FullFlowProps = {
  visible: boolean;
  onClose: () => void;
  currentStep?: number;
  summaries?: Partial<Record<number, string>>;
  onSelectStep?: (step: number) => void;
  // Maior etapa acessível (etapas posteriores ficam bloqueadas). Por padrão, 1.
  maxAccessibleStep?: number;
};

const STEPS = [
  'Clientes',
  'Produtos',
  'Tipos de Fluxo',
  'Atividades',
  'Tipos de Agenda',
  'Profissionais',
  'Data e Hora',
];

export default function FullFlow({ visible, onClose, currentStep = 1, summaries, onSelectStep, maxAccessibleStep = 1 }: FullFlowProps) {
  // Formata o resumo da etapa "Data e Hora" para o padrão: dd/mm/aa - HH:MM às HH:MM
  const formatDateTimeSummary = React.useCallback((raw: string) => {
    if (!raw) return '';
    // Extrai a data no formato dd/mm/aa ou dd/mm/aaaa
    const dateMatch = raw.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    const date = dateMatch ? dateMatch[1] : raw.trim();
    // Extrai todos os pares de horários HH:MM-HH:MM (pode haver múltiplos separados por vírgula)
    const pairs = Array.from(raw.matchAll(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/g));
    let timesFormatted = '';
    if (pairs.length > 0) {
      timesFormatted = pairs.map((m) => `${m[1]} às ${m[2]}`).join(', ');
    } else {
      // Fallback: se existir parte após ":", substitui o hífen por " às "
      const afterColon = raw.split(':').slice(1).join(':').trim();
      if (afterColon) {
        timesFormatted = afterColon.replace(/\s*-\s*/g, ' às ');
      }
    }
    return timesFormatted ? `${date} - ${timesFormatted}` : date;
  }, []);
  
  // Lógica de visibilidade dinâmica das etapas com base nas escolhas do usuário
  const normalize = (s?: string) => (s ?? '').toLowerCase().trim();
  const selectedFlowType = normalize(summaries?.[3]); // "Guiado" ou "Livre"
  const selectedAgendaType = normalize(summaries?.[5]); // "Pessoal" ou "Compartilhada"
  const isFreeFlow = selectedFlowType === 'livre';
  // Antes do usuário escolher, considerar "Pessoal" como padrão para ocultar "Profissionais"
  const isPersonalAgenda = selectedAgendaType ? selectedAgendaType === 'pessoal' : true;
  
  const stepConfig = React.useMemo(() => (
    STEPS.map((label, idx) => ({ index: idx + 1, label }))
  ), []);
  
  const visibleSteps = React.useMemo(() => {
    return stepConfig.filter((s) => {
      if (isFreeFlow && s.index === 4) return false; // Oculta "Atividades" quando Fluxo = Livre
      if (isPersonalAgenda && s.index === 6) return false; // Oculta "Profissionais" quando Agenda = Pessoal
      return true;
    });
  }, [stepConfig, isFreeFlow, isPersonalAgenda]);
  const SEGMENT_HEIGHT = 50; // altura maior dos segmentos
  const SEGMENT_STROKE_WIDTH = 2.5; // espessura (largura) maior do tracejado
  // Captura o layout de cada linha para posicionar segmentos SVG (32px) entre os cards
  const [rowsLayout, setRowsLayout] = React.useState<Record<number, { y: number; height: number }>>({});
  const segments = React.useMemo(() => {
    const segs: { top: number }[] = [];
    for (let i = 0; i < visibleSteps.length - 1; i++) {
      const currIdx = visibleSteps[i].index;
      const nextIdx = visibleSteps[i + 1].index;
      const curr = rowsLayout[currIdx];
      const next = rowsLayout[nextIdx];
      if (curr && next) {
        const gapStart = curr.y + curr.height; // fim do card atual
        const gapEnd = next.y; // início do próximo card
        const gap = gapEnd - gapStart;
        const top = gapStart + (gap - SEGMENT_HEIGHT) / 2; // centraliza segmento no meio do gap
        segs.push({ top });
      }
    }
    return segs;
  }, [rowsLayout, visibleSteps]);

  // A etapa concluída máxima leva em conta valores reais presentes nos resumos
  const maxCompletedFromSummaries = React.useMemo(() => {
    const entries = Object.entries(summaries ?? {});
    const completed = entries
      .filter(([key, val]) => {
        const v = (val ?? '').trim();
        return v.length > 0 && v !== 'Nenhum';
      })
      .map(([key]) => Number(key))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= STEPS.length);
    return completed.length ? Math.max(...completed) : 0;
  }, [summaries]);

  // Considera também a etapa acessível atual (-1)
  const maxCompletedStep = Math.max(
    0,
    Math.min(maxAccessibleStep - 1, STEPS.length),
    maxCompletedFromSummaries
  );

  if (visible) {
    console.log('[FullFlow] maxAccessibleStep:', maxAccessibleStep, 'maxCompletedFromSummaries:', maxCompletedFromSummaries, '=> maxCompletedStep:', maxCompletedStep);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.title}>Fluxo completo</Text>
          <View style={styles.divider} />

          {/* Coluna com segmentos tracejados (SVG) entre cada card */}
          <View pointerEvents="none" style={styles.dashedSegmentsColumn}>
            {segments.map((seg, idx) => (
              <Svg
                key={`seg-${idx}`}
                width={SEGMENT_STROKE_WIDTH}
                height={SEGMENT_HEIGHT}
                style={[styles.segmentSvg, { top: seg.top }]}
              >
                <Line
                  x1={SEGMENT_STROKE_WIDTH / 2}
                  y1={0}
                  x2={SEGMENT_STROKE_WIDTH / 2}
                  y2={SEGMENT_HEIGHT}
                  stroke="#5F758B"
                  strokeOpacity={0.4}
                  strokeWidth={SEGMENT_STROKE_WIDTH}
                  strokeDasharray={[4, 2]}
                />
              </Svg>
            ))}
          </View>

          {visibleSteps.map(({ label, index }, visibleIdx) => {
            const active = index === currentStep;
            const rawValue = summaries?.[index] ?? '';
            const hasRealValue = rawValue && rawValue.trim().length > 0 && rawValue !== 'Nenhum';
            const canShowValue = index <= maxCompletedStep || (active && hasRealValue);
            const displayValue = canShowValue && hasRealValue ? (index === 7 ? formatDateTimeSummary(rawValue) : rawValue) : '-----------';
            const isDisabled = index > maxAccessibleStep;
            if (visible && index === 6) {
              console.log('[FullFlow] Etapa 6 -> raw:', rawValue, 'hasRealValue:', hasRealValue, 'canShowValue:', canShowValue, 'display:', displayValue);
            }
            return (
              <TouchableOpacity
                key={label}
                style={styles.stepRow}
                activeOpacity={0.8}
                disabled={isDisabled}
                accessibilityRole="button"
                accessibilityLabel={`Abrir etapa ${visibleIdx + 1}: ${label}`}
                onPress={() => {
                  if (!isDisabled) {
                    onSelectStep?.(index);
                    onClose();
                  }
                }}
                onLayout={(e) => {
                  const { y, height } = e.nativeEvent.layout;
                  setRowsLayout((prev) => {
                    const current = prev[index];
                    if (current && current.y === y && current.height === height) return prev;
                    return { ...prev, [index]: { y, height } };
                  });
                }}
              >
                <View
                  style={[styles.stepBadge, active && styles.stepBadgeActive]}
                >
                  <Text style={[styles.stepBadgeText, active && styles.stepBadgeTextActive]}>{visibleIdx + 1}°</Text>
                </View>

                <View style={styles.stepContent}>
                  <Text
                    style={[styles.stepTitle, active && styles.stepTitleActive]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {label}
                  </Text>
                  <Text
                    style={styles.stepPlaceholder}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {displayValue}
                  </Text>
                  {visibleIdx < visibleSteps.length - 1 && <View style={styles.itemDivider} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar fluxo completo"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(58,63,81,0.12)', // leve escurecimento
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  backdrop: {
    flex: 1,
  },
  panel: {
    width: 260, // largura fixa solicitada
    backgroundColor: '#FCFCFC',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderRightWidth: 1,
    borderColor: '#D8E0F0',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 12,
    // sombra sutil
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.08 : 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontSize: 18,
    color: '#3A3F51',
    fontFamily: 'Inter_700Bold',
  },
  divider: {
    height: 0.08,
    backgroundColor: '#D8E0F0',
    marginVertical: 20,
    alignSelf: 'stretch',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    columnGap: 10,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  stepBadge: {
    width: 35,
    height: 40,
    borderRadius: 4,
    borderWidth: 0.05,
    borderColor: '#D8E0F0',
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  stepBadgeText: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  stepBadgeTextActive: {
    color: '#FCFCFC',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    color: '#91929E',
    fontFamily: 'Inter_500Medium',
  },
  stepTitleActive: {
    color: '#91929E',
  },
  stepPlaceholder: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    // Espaçamento entre o label (título) e o valor abaixo
    marginTop: 5,
  },
  itemDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D8E0F0',
    alignSelf: 'stretch',
    marginTop: 20,
  },
  dashedSegmentsColumn: {
    position: 'absolute',
    left: 28, // alinhado conforme referência visual
    top: -12,
    bottom: 0,
    width: 2,
    pointerEvents: 'none',
    zIndex: -1, // atrás dos cards
  },
  segmentSvg: {
    position: 'absolute',
    left: 0,
  },
});