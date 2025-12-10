import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  visible: boolean;
  tabLabel?: string | number;
  onCancel: () => void;
  onConfirm: () => void;
};

const TrashModalIcon: React.FC = () => (
  <Svg width={27} height={30} viewBox="0 0 27 30" fill="none">
    <Path d="M10.8 12.2727C11.4923 12.2727 12.0629 12.7991 12.1409 13.4773L12.15 13.6364V21.8182C12.15 22.5713 11.5456 23.1818 10.8 23.1818C10.1077 23.1818 9.53707 22.6554 9.45908 21.9772L9.45 21.8182V13.6364C9.45 12.8832 10.0544 12.2727 10.8 12.2727Z" fill="#EF4444" />
    <Path d="M17.5409 13.4773C17.4629 12.7991 16.8923 12.2727 16.2 12.2727C15.4544 12.2727 14.85 12.8832 14.85 13.6364V21.8182L14.8591 21.9772C14.9371 22.6554 15.5077 23.1818 16.2 23.1818C16.9456 23.1818 17.55 22.5713 17.55 21.8182V13.6364L17.5409 13.4773Z" fill="#EF4444" />
    <Path fillRule="evenodd" clipRule="evenodd" d="M16.2 0C18.3569 0 20.1199 1.70307 20.2431 3.85054L20.25 4.09091V5.45455H25.65C26.3956 5.45455 27 6.06507 27 6.81818C27 7.5175 26.4788 8.09387 25.8074 8.17264L25.65 8.18182H24.3V25.9091C24.3 28.0877 22.614 29.8686 20.488 29.9931L20.25 30H6.75C4.59313 30 2.83006 28.2969 2.70688 26.1495L2.7 25.9091V8.18182H1.35C0.604416 8.18182 0 7.5713 0 6.81818C0 6.11886 0.521154 5.54249 1.19256 5.46372L1.35 5.45455H6.75V4.09091C6.75 1.91225 8.43604 0.131372 10.562 0.00694458L10.8 0H16.2ZM5.4 8.18182V25.9091C5.4 26.6084 5.92115 27.1848 6.59256 27.2636L6.75 27.2727H20.25C20.9423 27.2727 21.5129 26.7463 21.5909 26.0681L21.6 25.9091V8.18182H5.4ZM17.55 5.45455H9.45V4.09091L9.45908 3.93188C9.53707 3.25369 10.1077 2.72727 10.8 2.72727H16.2L16.3574 2.73645C17.0288 2.81522 17.55 3.39159 17.55 4.09091V5.45455Z" fill="#EF4444" />
  </Svg>
);

const ModalExcludePaymentMethod: React.FC<Props> = ({ visible, tabLabel, onCancel, onConfirm }) => {
  const label = tabLabel != null ? String(tabLabel).padStart(2, '0') : '';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <TrashModalIcon />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{`Deseja realmente excluir${label ? ` a forma de pagamento (${label})?` : ' a forma de pagamento?'}`}</Text>
            <Text style={styles.subtitle}>Esta ação não pode ser desfeita.</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancelar">
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onConfirm} accessibilityRole="button" accessibilityLabel="Excluir">
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 300,
    paddingTop: 30,
    paddingBottom: 20,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FCFCFC',
    overflow: 'hidden',
    borderRadius: 18,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 25,
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  textBlock: { alignSelf: 'stretch', alignItems: 'center', gap: 10 },
  title: { textAlign: 'center', color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 21 },
  subtitle: { textAlign: 'center', color: '#7D8592', fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 21 },
  actions: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 10 },
  cancelButton: {
    flex: 1,
    height: 42,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { textAlign: 'center', color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_700Bold' },
  deleteButton: {
    flex: 1,
    height: 42,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 11,
    paddingBottom: 11,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: { textAlign: 'center', color: '#FCFCFC', fontSize: 14, fontFamily: 'Inter_700Bold' },
});

export default ModalExcludePaymentMethod;
