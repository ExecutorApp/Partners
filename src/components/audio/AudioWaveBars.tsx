import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

type AudioWaveBarsProps = {
  active?: boolean; // quando ativo, usa azul pleno; caso contrário, mantém estilo atenuado
  levels?: number[]; // opcional: níveis (0..1) para cada barra quando gravando (web)
  animate?: boolean; // quando true e sem levels, rotaciona barras para simular movimento
  speedMs?: number; // velocidade da animação
  amplitude?: number; // 0..1 amplitude global (RMS) para escalar padrão
  progressHeights?: number[]; // preenchimento progressivo da esquerda para direita
  maxBars?: number; // quantidade total de barras na faixa
  tailDots?: number; // quantidade de bolinhas cinza ao final (default 4)
  ghostCount?: number; // quantidade de colunas fantasma (default 1)
};

// Componente de barras de ondas baseado no documento "Onda sonora dos audios.txt"
// Mantém largura de cada barra em 3px e espaçamento de 2px, com cantos arredondados (rx=1.5)
const AudioWaveBars: React.FC<AudioWaveBarsProps> = ({ active = true, levels, animate = false, speedMs = 80, amplitude, progressHeights, maxBars = 40, tailDots = 4, ghostCount = 1 }) => {
  const blue = '#1777CF';
  const gray = '#7D8592';
  const mainOpacity = active ? 1 : 0.6;
  const MIN_H = 10; // altura mínima mais alta
  const MAX_H = 80; // altura máxima mais alta (executionBox tem 44)
  const RANGE = MAX_H - MIN_H;

  // Padrão de alturas extraído do documento
  const baseHeights: number[] = [
    10,16,22,25,25,20,16,20,25,22,
    25,20,16,20,25,20,14,10,16,22,
    27,15,19,12,16,22,
    25,20,16,20,25,20,14,10,16,22,
    27,15,19,12,
  ];

  const [animatedHeights, setAnimatedHeights] = useState<number[]>(baseHeights);
  const heights = useMemo(() => {

    // Quando recebemos preenchimento progressivo (esquerda -> direita)
    // Usa mesmo quando estiver vazio, para começar na primeira coluna
    if (typeof progressHeights !== 'undefined') {
      // Os valores de progressHeights geralmente são gerados na faixa 6..30.
      // Fazemos remapeamento linear para 10..40 para barras mais altas.
      const inMin = 6;
      const inMax = 30;
      const inRange = inMax - inMin;
      return progressHeights.map((h) => {
        const clamped = Math.max(inMin, Math.min(inMax, h));
        const norm = (clamped - inMin) / (inRange || 1);
        return Math.round(MIN_H + norm * RANGE);
      });
    }

    // Quando níveis específicos são fornecidos (web com frequências)
    if (levels && levels.length > 0) {
      const count = baseHeights.length;
      const scaled = levels.slice(0, count).map((lvl) => {
        const clamped = Math.max(0, Math.min(1, lvl));
        const shaped = Math.pow(clamped, 0.8); // dá mais contraste
        return Math.round(MIN_H + shaped * RANGE);
      });
      if (scaled.length < count) return scaled.concat(baseHeights.slice(scaled.length));
      return scaled;
    }

    // Quando amplitude global é fornecida (RMS), escala o padrão base
    if (typeof amplitude === 'number') {
      const factor = 0.35 + Math.max(0, Math.min(1, amplitude)) * 0.65; // 0.35..1.0
      return baseHeights.map((h) => Math.round(MIN_H + (h / 27) * RANGE * factor));
    }

    // Fallback: animação simples
    return animatedHeights;
  }, [levels, animatedHeights, amplitude, progressHeights]);

  // Log leve para validar fluxo progressivo (remover após validação)
  useEffect(() => {
    if (typeof progressHeights !== 'undefined') {
      console.log('[AudioWaveBars] progress count =', progressHeights.length);
    }
  }, [progressHeights]);

  useEffect(() => {
    if (levels && levels.length > 0) return; // quando níveis fornecidos, não anima localmente
    if (!animate) return;
    const id = setInterval(() => {
      setAnimatedHeights((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [animate, levels, speedMs]);

  // Fase de oscilação para manter movimento contínuo das barras, mesmo com progressHeights
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const id = setInterval(() => setPhase((p) => p + 1), speedMs);
    return () => clearInterval(id);
  }, [animate, speedMs]);

  // Aplica leve oscilação senoidal nas alturas para comunicar gravação ativa
  const displayHeights = useMemo(() => {
    if (!animate) return heights;
    return heights.map((h, i) => {
      const osc = Math.sin((phase + i) * 0.35);
      const factor = 0.85 + 0.2 * osc; // 0.65..1.05
      const v = Math.round(h * factor);
      return Math.max(MIN_H, Math.min(MAX_H, v));
    });
  }, [heights, animate, phase]);

  // Reservar sempre 1 coluna fantasma + 4 bolinhas no final
  const TAIL_DOTS = Math.max(0, tailDots);
  const GHOST_COUNT = Math.max(0, ghostCount);
  const reservedTail = TAIL_DOTS + GHOST_COUNT;
  const barsCount = Math.max(0, Math.min(heights.length, Math.max(0, maxBars - reservedTail)));

  return (
    <View style={styles.container}>
      {/* Barras azuis preenchidas (nunca ocupam a área reservada do final) */}
      {displayHeights.slice(0, barsCount).map((h, i) => (
        <Svg key={`bar-${i}`} width={3} height={h} viewBox={`0 0 3 ${h}`} fill="none">
          <Rect width={3} height={h} rx={1.5} fill={blue} opacity={mainOpacity} />
        </Svg>
      ))}

      {/* Coluna azul clara (fantasma) sempre visível, com altura da última barra real */}
      <Svg
        key={`ghost-${barsCount}`}
        width={3}
        height={barsCount > 0 ? displayHeights[barsCount - 1] : (displayHeights.length > 0 ? displayHeights[displayHeights.length - 1] : MIN_H)}
        viewBox={`0 0 3 ${barsCount > 0 ? displayHeights[barsCount - 1] : (displayHeights.length > 0 ? displayHeights[displayHeights.length - 1] : MIN_H)}`}
        fill="none"
      >
        <Rect width={3} height={barsCount > 0 ? displayHeights[barsCount - 1] : (displayHeights.length > 0 ? displayHeights[displayHeights.length - 1] : MIN_H)} rx={1.5} fill={blue} opacity={0.35} />
      </Svg>

      {/* As 4 bolinhas cinza sempre visíveis no final */}
      {Array.from({ length: TAIL_DOTS }).map((_, d) => (
        <Svg key={`dot-${barsCount + 1 + d}`} width={3} height={3} viewBox="0 0 3 3" fill="none">
          <Rect width={3} height={3} rx={1.5} fill={gray} opacity={0.4} />
        </Svg>
      ))}
    </View>
  );
};

export default AudioWaveBars;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    columnGap: 2,
  },
});