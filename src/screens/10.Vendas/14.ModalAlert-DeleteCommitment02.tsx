import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = {
  visible: boolean;
  start?: string;
  end?: string;
  // Rótulo opcional da data (ex.: "Hoje", "Amanhã", "Segunda", ou "23/11/25")
  dateLabel?: string;
  // Modo de uso: 'commitment' (padrão) ou 'content' para reutilização em exclusão de conteúdo
  mode?: 'commitment' | 'content';
  // Nome do item de conteúdo (ex.: "Anotação 02") quando mode === 'content'
  name?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const AlertIcon: React.FC = () => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={35} height={35} viewBox="0 0 35 35" fill="none">
    <Path d="M28.876 18.072C28.876 11.7858 23.7727 6.67149 17.5 6.67149C11.2273 6.67149 6.12404 11.7858 6.12404 18.072V27.0533H28.8759V18.072H28.876ZM17.506 23.1138C16.6974 23.1138 16.1301 22.5453 16.1301 21.8438C16.1301 21.1301 16.6974 20.5979 17.506 20.5979C18.3147 20.5979 18.8699 21.1301 18.8699 21.8438C18.8699 22.5453 18.3147 23.1138 17.506 23.1138ZM18.4113 19.2355H16.5888L16.1422 13.853H18.8699L18.4113 19.2355ZM16.4746 0H18.5254V3.63088H16.4746V0ZM26.5719 6.97478L29.1334 4.40775L30.5833 5.86078L28.0218 8.42781L26.5719 6.97478ZM4.41164 5.85845L5.86154 4.40542L8.42304 6.97245L6.97314 8.42548L4.41164 5.85845ZM31.377 14.3065H35V16.3618H31.377V14.3065ZM0 14.3065H3.62305V16.3618H0V14.3065ZM29.1885 29.04H5.8115C3.7208 29.04 2.01988 30.7446 2.01988 32.8398V35H32.9801V32.8398C32.9801 30.7446 31.2792 29.04 29.1885 29.04Z" fill="#EF4444" />
  </Svg>
);

const ModalAlertDeleteCommitment: React.FC<Props> = ({ visible, start = '00:00', end = '00:00', dateLabel, mode = 'commitment', name, onCancel, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <AlertIcon />
          </View>
          <Text style={styles.message}>
            {mode === 'content' ? (
              <>
                <Text style={styles.messageMuted}>Deseja realmente excluir o conteúdo{"\n"}</Text>
                <Text style={styles.messageMuted}>({name || 'este item'})?{"\n"}</Text>
              </>
            ) : dateLabel ? (
              <>
                <Text style={styles.messageMuted}>Deseja realmente excluir o{"\n"}</Text>
                <Text style={styles.messageMuted}>agendamento{"\n"}</Text>
                <Text style={styles.messageMuted}>({dateLabel} - {start} às {end})?{"\n"}</Text>
              </>
            ) : (
              <Text style={styles.messageMuted}>Tem certeza de que deseja excluir o horário das {start} às {end}?{"\n"}</Text>
            )}
            <Text style={styles.messageStrong}>Esta ação não pode ser desfeita.</Text>
          </Text>
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
    minHeight: 285,
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
  message: {
    alignSelf: 'stretch',
    width: 270,
    textAlign: 'center',
    lineHeight: 25,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  messageMuted: {
    color: '#7D8592',
  },
  messageStrong: {
    color: '#3A3F51',
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
  deleteButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  deleteText: {
    color: '#FCFCFC',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});

export default ModalAlertDeleteCommitment;