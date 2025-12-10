import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface ModalRequiredFieldsProps {
  visible: boolean;
  onClose: () => void;
  onGoToRegistration: () => void;
}

const ModalRequiredFields: React.FC<ModalRequiredFieldsProps> = ({
  visible,
  onClose,
  onGoToRegistration,
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header com ícone de atenção */}
            <View style={styles.headerContainer}>
              <View style={styles.iconContainer}>
                <Svg
                  width={35}
                  height={35}
                  viewBox="0 0 35 35"
                  fill="none">
                  {/* Fundo cinza padrão do sistema com borda suave */}
                  <Rect x={0.5} y={0.5} width={34} height={34} rx={8} fill="#F4F4F4" stroke="#EDF2F6" />
                  {/* Ícone de alerta */}
                  <Path
                    d="M28.876 18.072C28.876 11.7858 23.7727 6.67149 17.5 6.67149C11.2273 6.67149 6.12404 11.7858 6.12404 18.072V27.0533H28.8759V18.072H28.876ZM17.506 23.1138C16.6974 23.1138 16.1301 22.5453 16.1301 21.8438C16.1301 21.1301 16.6974 20.5979 17.506 20.5979C18.3147 20.5979 18.8699 21.1301 18.8699 21.8438C18.8699 22.5453 18.3147 23.1138 17.506 23.1138ZM18.4113 19.2355H16.5888L16.1422 13.853H18.8699L18.4113 19.2355ZM16.4746 0H18.5254V3.63088H16.4746V0ZM26.5719 6.97478L29.1334 4.40775L30.5833 5.86078L28.0218 8.42781L26.5719 6.97478ZM4.41164 5.85845L5.86154 4.40542L8.42304 6.97245L6.97314 8.42548L4.41164 5.85845ZM31.377 14.3065H35V16.3618H31.377V14.3065ZM0 14.3065H3.62305V16.3618H0V14.3065ZM29.1885 29.04H5.8115C3.7208 29.04 2.01988 30.7446 2.01988 32.8398V35H32.9801V32.8398C32.9801 30.7446 31.2792 29.04 29.1885 29.04Z"
                    fill="#1777CF"
                  />
                </Svg>
              </View>
              <Text style={styles.title}>Atenção!</Text>
            </View>

            {/* Conteúdo do modal */}
            <View style={styles.contentContainer}>
              <Text style={styles.subtitle}>
                As informações preenchidas foram salvas com sucesso.
              </Text>
              <Text style={styles.description}>
                No entanto, para acessar todos os recursos do sistema,
                é necessário preencher todos os campos obrigatórios.
              </Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onGoToRegistration}>
                <Text style={styles.cancelButtonText}>Sair</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onClose}>
                <Text style={styles.confirmButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#EDF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#3A3F51',
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#3A3F51',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
    fontFamily: 'Inter_500Medium',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  fieldsList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fieldItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  note: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmButton: {
    backgroundColor: '#1777CF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter_600SemiBold',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default ModalRequiredFields;