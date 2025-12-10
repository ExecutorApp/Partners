import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Svg, Path } from 'react-native-svg';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** Texto do item, ex.: "Título do conteúdo" */
  itemLabel?: string;
};

const InfoIcon: React.FC = () => (
  <Svg width={35} height={35} viewBox="0 0 35 35" fill="none">
    <Path d="M17.5 0C7.834 0 0 7.834 0 17.5C0 27.166 7.834 35 17.5 35C27.166 35 35 27.166 35 17.5C35 7.834 27.166 0 17.5 0ZM18.958 26.25H16.041V14.583H18.958V26.25ZM18.958 12.005H16.041V8.75H18.958V12.005Z" fill="#1777CF" />
  </Svg>
);

const ModalAlertExitText: React.FC<Props> = ({ visible, onCancel, onConfirm, itemLabel }) => {
  const labelSuffix = itemLabel ? ` (${itemLabel})` : '';
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <InfoIcon />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.title}>Deseja realmente sair?</Text>
            <Text style={styles.subtitle}>Ao sair, seu conteúdo {labelSuffix} não será salvo. Confirmar saída?</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancelar">
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} accessibilityRole="button" accessibilityLabel="Sair">
              <Text style={styles.confirmText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalAlertExitText;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: 25,
    borderRadius: 18,
    backgroundColor: '#FCFCFC',
    paddingTop: 30,
    paddingHorizontal: 15,
    paddingBottom: 15,
    width: 300,
    minHeight: 295,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F4F4',
  },
  textBox: {
    alignSelf: 'stretch',
    width: 270,
    rowGap: 8,
  },
  title: {
    textAlign: 'center',
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 21,
  },
  subtitle: {
    textAlign: 'center',
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    columnGap: 10,
    width: 270,
  },
  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1777CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  confirmText: {
    color: '#FCFCFC',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});