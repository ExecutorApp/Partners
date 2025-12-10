import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// Ícone de alerta original do Figma com cor azul (#1777CF)
const AlertIcon: React.FC = () => (
  <Svg width={35} height={35} viewBox="0 0 35 35" fill="none">
    <Path d="M28.876 18.072C28.876 11.7858 23.7727 6.67149 17.5 6.67149C11.2273 6.67149 6.12404 11.7858 6.12404 18.072V27.0533H28.8759V18.072H28.876ZM17.506 23.1138C16.6974 23.1138 16.1301 22.5453 16.1301 21.8438C16.1301 21.1301 16.6974 20.5979 17.506 20.5979C18.3147 20.5979 18.8699 21.1301 18.8699 21.8438C18.8699 22.5453 18.3147 23.1138 17.506 23.1138ZM18.4113 19.2355H16.5888L16.1422 13.853H18.8699L18.4113 19.2355ZM16.4746 0H18.5254V3.63088H16.4746V0ZM26.5719 6.97478L29.1334 4.40775L30.5833 5.86078L28.0218 8.42781L26.5719 6.97478ZM4.41164 5.85845L5.86154 4.40542L8.42304 6.97245L6.97314 8.42548L4.41164 5.85845ZM31.377 14.3065H35V16.3618H31.377V14.3065ZM0 14.3065H3.62305V16.3618H0V14.3065ZM29.1885 29.04H5.8115C3.7208 29.04 2.01988 30.7446 2.01988 32.8398V35H32.9801V32.8398C32.9801 30.7446 31.2792 29.04 29.1885 29.04Z" fill="#1777CF" />
  </Svg>
);

const ModalAlertLeaveTheSchedule: React.FC<Props> = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <AlertIcon />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>Deseja realmente sair?</Text>
            <Text style={styles.subtitle}>Ao sair, seu agendamento não será salvo. Confirmar saída?</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancelar">
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.leaveButton} onPress={onConfirm} accessibilityRole="button" accessibilityLabel="Sair">
              <Text style={styles.leaveText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    paddingBottom: 20,
    width: 300,
    minHeight: 240,
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
  textBlock: {
    alignSelf: 'stretch',
    width: 270,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
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
  leaveButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1777CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#3A3F51',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  leaveText: {
    color: '#FCFCFC',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});

export default ModalAlertLeaveTheSchedule;