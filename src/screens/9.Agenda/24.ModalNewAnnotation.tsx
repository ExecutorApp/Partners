import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { TxtDocIcon } from '../../components/content/ContentIcons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'audio' | 'text') => void;
};

// (Sem uso) CloseIconGray removido para manter o cÃ³digo limpo

// Ãcone de Ãudio conforme SVG fornecido pelo usuÃ¡rio
const MicIcon: React.FC<{ width?: number; height?: number }> = ({ width = 18, height = 25 }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 18 25" fill="none">
    <Path d="M8.99992 17.3073C10.3751 17.3073 11.5519 16.8365 12.531 15.8954C13.5099 14.9543 13.9995 13.8222 13.9995 12.5V4.80782C13.9995 3.48564 13.5103 2.35395 12.531 1.41238C11.5519 0.471021 10.3751 0 8.99992 0C7.62493 0 6.44793 0.471021 5.46877 1.41238C4.48956 2.35379 4.00004 3.48564 4.00004 4.80782V12.5C4.00004 13.8221 4.48978 14.9543 5.46877 15.8954C6.44777 16.8365 7.62493 17.3073 8.99992 17.3073Z" fill="#7D8592" />
    <Path d="M17.7026 9.90086C17.5052 9.71053 17.2703 9.61533 16.9995 9.61533C16.7289 9.61533 16.4946 9.71053 16.2964 9.90086C16.0987 10.0911 15.9998 10.3165 15.9998 10.5768V12.5C15.9998 14.353 15.3147 15.9379 13.9449 17.255C12.5756 18.5722 10.927 19.2307 8.99986 19.2307C7.07274 19.2307 5.42439 18.5722 4.05454 17.255C2.68486 15.9383 2.00007 14.3531 2.00007 12.5V10.5768C2.00007 10.3165 1.90107 10.0911 1.70324 9.90086C1.50529 9.71053 1.27118 9.61533 1.00017 9.61533C0.72917 9.61533 0.494778 9.71053 0.296944 9.90086C0.0989449 10.0911 0 10.3165 0 10.5768V12.5C0 14.7135 0.768354 16.6392 2.30462 18.2766C3.84095 19.9141 5.73934 20.8531 7.99985 21.0933V23.0767H3.99998C3.72914 23.0767 3.49481 23.172 3.29692 23.3623C3.09897 23.5525 2.99997 23.7779 2.99997 24.0383C2.99997 24.2983 3.09897 24.5242 3.29692 24.7144C3.49481 24.9045 3.72914 25 3.99998 25H13.9995C14.2703 25 14.5049 24.9046 14.7025 24.7144C14.9007 24.5242 14.9998 24.2984 14.9998 24.0383C14.9998 23.778 14.9007 23.5525 14.7025 23.3623C14.505 23.172 14.2703 23.0767 13.9995 23.0767H10.0001V21.0933C12.2602 20.8531 14.1585 19.9141 15.6949 18.2766C17.2314 16.6392 18 14.7135 18 12.5V10.5768C18 10.3165 17.9008 10.0914 17.7026 9.90086Z" fill="#7D8592" />
  </Svg>
);

const ModalNewAnnotation: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.title}>Novo conteúdo</Text>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose} accessibilityLabel="Fechar">
            {/* Ãcone X dentro do retÃ¢ngulo */}
            <View style={styles.closeInnerBox}>
              <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
                <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51" />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* SubtÃ­tulo */}
          <Text style={styles.subtitle}>Como deseja criar?</Text>
          <View style={styles.divider} />

          {/* OpÃ§Ãµes: Ãudio e Texto */}
          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.optionBox} onPress={() => onSelect('audio')} accessibilityRole="button" accessibilityLabel="Criar anotaÃ§Ã£o de áudio">
              <View style={styles.optionIconArea}>
                <MicIcon width={18} height={25} />
              </View>
              <Text style={styles.optionLabel}>Áudio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBox} onPress={() => onSelect('text')} accessibilityRole="button" accessibilityLabel="Criar anotaÃ§Ã£o de texto">
              <View style={styles.optionIconArea}>
              <TxtDocIcon
                width={25}
                height={27}
                baseColor="#7D8592"
                cornerColor="#F4F4F4"
                labelColor="#FFFFFF"
              />
              </View>
              <Text style={styles.optionLabel}>Texto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalNewAnnotation;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 255,
    backgroundColor: '#FCFCFC',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    position: 'relative',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    paddingLeft: 0,
  },
  closeIcon: {
    position: 'absolute',
    right: 14,
    top: 10,
  },
  closeInnerBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  subtitle: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 10,
    paddingLeft: 0,
    width: '100%',
  },
  divider: {
    width: 225,
    height: 0.5,
    backgroundColor: '#D8E0F0',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    width: 225,
    marginTop: 10,
  },
  optionBox: {
    flexGrow: 1,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 10,
  },
  optionIconArea: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E5E7EA',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
  },
});