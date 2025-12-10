import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SpeedIcon, RepeatIcon } from '../content/ContentIcons';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

type Props = {
  visible: boolean;
  onRequestClose: () => void;
};

// Modal de configuração do áudio com layout fiel ao Figma 680_1637
const AudioSettingsModal: React.FC<Props> = ({ visible, onRequestClose }) => {
  const { playbackRate, setPlaybackRate, repeatEnabled, setRepeatEnabled } = useAudioPlayer();
  const speedOptions = useMemo(() => [1.0, 1.25, 1.5, 2.0, 2.5, 3.0], []);
  // faixa de velocidade suportada pelo slider (0..3) com passo de 0,05
  const rateMin = 0.0;
  const rateMax = 3.0;
  const step = 0.05;

  const [sliderWidth, setSliderWidth] = useState(250);
  const fraction = Math.max(0, Math.min(1, (playbackRate - rateMin) / (rateMax - rateMin)));
  const filledWidth = Math.round(fraction * (sliderWidth - 5));
  // Compensar deslocamento de 2px do trilho para manter alinhamento
  const knobLeft = Math.max(0, Math.min(sliderWidth - 9, filledWidth + 2));

  // passos dos botões +/-: 0,20
  const btnStep = 0.20;
  const toFixed2 = (v: number) => parseFloat(v.toFixed(2));
  const clampRate = (v: number) => Math.max(0.0, Math.min(3.0, toFixed2(v)));
  const isOnBtnStep = (v: number) => Math.abs(v / btnStep - Math.round(v / btnStep)) < 1e-6;
  const stepUp = async () => {
    const next = isOnBtnStep(playbackRate)
      ? playbackRate + btnStep
      : Math.ceil(playbackRate / btnStep) * btnStep;
    await setPlaybackRate(clampRate(next));
  };
  const stepDown = async () => {
    const next = isOnBtnStep(playbackRate)
      ? playbackRate - btnStep
      : Math.floor(playbackRate / btnStep) * btnStep;
    await setPlaybackRate(clampRate(next));
  };

  const snapToStep = (value: number) => {
    const snapped = Math.round(value / step) * step;
    return Math.max(rateMin, Math.min(rateMax, parseFloat(snapped.toFixed(2))));
  };

  const setRateFromX = async (x: number) => {
    const trackLeft = 2;
    const trackWidth = Math.max(1, sliderWidth - 5);
    const frac = Math.max(0, Math.min(1, (x - trackLeft) / trackWidth));
    const rawRate = rateMin + frac * (rateMax - rateMin);
    const rate = snapToStep(rawRate);
    await setPlaybackRate(rate);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable style={styles.backdrop} onPress={onRequestClose} />
      <View pointerEvents="box-none" style={styles.anchorArea}>
        <View style={styles.card}>
          {/* Título com ícone de velocidade */}
          <View style={styles.titleRow}>
            <SpeedIcon />
            <Text style={styles.title}>Velocidade de reprodução</Text>
          </View>

          {/* Linha de controles de velocidade */}
          <View style={styles.speedRow}>
            <TouchableOpacity style={styles.squareBtn} onPress={stepDown}>
              <Text style={styles.squareBtnText}>-</Text>
            </TouchableOpacity>

            <View style={styles.speedCenter}>
              <Text style={styles.speedValue}>{playbackRate.toFixed(2)}x</Text>
              <View
                style={styles.progress}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => setRateFromX(e.nativeEvent.locationX)}
                onResponderMove={(e) => setRateFromX(e.nativeEvent.locationX)}
                onResponderRelease={(e) => setRateFromX(e.nativeEvent.locationX)}
              >
                <View style={styles.line} />
                <View style={[styles.lineFill, { width: filledWidth }]} />
                <View style={[styles.knob, { left: knobLeft }]} />
              </View>
            </View>

            <TouchableOpacity style={styles.squareBtn} onPress={stepUp}>
              <Text style={styles.squareBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Botões de presets */}
          <View style={styles.presetRow}>
            {speedOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.presetBtn, playbackRate === opt ? styles.presetBtnActive : null]}
                onPress={() => setPlaybackRate(opt)}
              >
                <Text style={[styles.presetText, playbackRate === opt ? styles.presetTextActive : null]}>
                  {String(opt).replace('.', ',')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Modo repetição */}
          <View style={styles.repeatRow}>
            <RepeatIcon />
            <Text style={styles.title}>Modo repetição</Text>
            <TouchableOpacity
              accessibilityRole="switch"
              accessibilityState={{ checked: repeatEnabled }}
              style={[
                styles.switch,
                { borderColor: repeatEnabled ? '#1777CF' : '#7D8592' },
              ]}
              onPress={() => setRepeatEnabled(!repeatEnabled)}
            >
              <View style={[styles.switchBullet, repeatEnabled ? styles.switchBulletRight : styles.switchBulletLeft, { backgroundColor: repeatEnabled ? '#1777CF' : '#7D8592' }]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AudioSettingsModal;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#00000055',
  },
  anchorArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    // posicionar acima do player azul (66px de altura + 15px de margem)
    // adicionar 10px extra de margem entre o modal e o player
    paddingBottom: 100,
  },
  card: {
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    width: 356,
    height: 240,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 20,
    marginBottom: 20,
  },
  title: {
    color: '#3A3F51',
    fontSize: 14,
    lineHeight: 15,
    fontFamily: 'Inter_600SemiBold' ,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  squareBtn: {
    width: 35,
    height: 35,
    borderWidth: 0.5,
    borderColor: '#D8E0F0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareBtnText: {
    color: '#1777CF',
    fontSize: 20,
    fontFamily: 'Inter_400Regular' ,
    lineHeight: 24,
  },
  speedCenter: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 0,
    alignItems: 'center',
  },
  speedValue: {
    color: '#3A3F51',
    fontSize: 14,
    lineHeight: 17,
    fontFamily: 'Inter_500Medium' ,
    marginBottom: 6,
  },
  progress: {
    position: 'relative',
    width: 225,
    height: 5,
  },
  line: {
    position: 'absolute',
    top: 0,
    left: 2,
    height: 2,
    width: 220,
    borderRadius: 8,
    backgroundColor: '#5F758B80',
  },
  lineFill: {
    position: 'absolute',
    top: 0,
    left: 2,
    height: 2,
    borderRadius: 8,
    backgroundColor: '#1777CF',
  },
  knob: {
    position: 'absolute',
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 9 / 2,
    backgroundColor: '#1777CF',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  presetBtn: {
    flex: 1,
    height: 35,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  presetBtnActive: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  presetText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_400Regular' ,
    lineHeight: 17,
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#D8E0F0',
    width: 325,
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 20,
  },
  switch: {
    marginLeft: 'auto',
    width: 40,
    height: 24,
    borderRadius: 45,
    borderWidth: 1,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchBullet: {
    width: 16,
    height: 16,
    borderRadius: 99,
    alignSelf: 'center',
  },
  switchBulletLeft: {
    // manter centralização vertical e posicionar à esquerda
    marginLeft: 0,
  },
  switchBulletRight: {
    marginLeft: 'auto',
  },
});