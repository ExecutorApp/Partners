import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black
} from '@expo-google-fonts/inter';
import { useModal } from '../../context/ModalContext';

interface RegisterNowModalProps {
  visible: boolean;
  onClose: () => void;
  onRegister: () => void;
}

// Ícone de fechar "X" conforme especificação (38x38, fundo #F4F4F4)
const CloseIcon = () => (
  <Svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <Rect width={38} height={38} rx={8} fill="#F4F4F4" />
    <Rect width={38} height={38} rx={8} stroke="#EDF2F6" />
    <Path d="M25.155 13.2479C24.7959 12.9179 24.2339 12.9173 23.874 13.2466L19 17.7065L14.126 13.2466C13.7661 12.9173 13.2041 12.9179 12.845 13.2479L12.7916 13.297C12.4022 13.6549 12.4029 14.257 12.7931 14.614L17.5863 19L12.7931 23.386C12.4029 23.743 12.4022 24.3451 12.7916 24.703L12.845 24.7521C13.2041 25.0821 13.7661 25.0827 14.126 24.7534L19 20.2935L23.874 24.7534C24.2339 25.0827 24.7959 25.0821 25.155 24.7521L25.2084 24.703C25.5978 24.3451 25.5971 23.743 25.2069 23.386L20.4137 19L25.2069 14.614C25.5971 14.257 25.5978 13.6549 25.2084 13.297L25.155 13.2479Z" fill="#3A3F51" />
  </Svg>
);

// Ícone principal (alerta) com badge de confirmação
const BuildingIcon = () => (
  <View style={{width: 107, height: 107, position: 'relative'}}>
    <View style={{width: 100, height: 100, left: 0, top: 7, position: 'absolute', backgroundColor: '#F4F4F4', borderRadius: 10}} />
    <View data-svg-wrapper style={{left: 31, top: 31, position: 'absolute'}}>
      <Svg width="45" height="45" viewBox="0 0 38 38" fill="none">
        <Path d="M31.351 19.6211C31.351 12.796 25.8104 7.24334 19 7.24334C12.1896 7.24334 6.64896 12.796 6.64896 19.6211V29.3722H31.351V19.6211H31.351ZM19.0065 25.095C18.1286 25.095 17.5127 24.4778 17.5127 23.7162C17.5127 22.9413 18.1286 22.3634 19.0065 22.3634C19.8845 22.3634 20.4873 22.9413 20.4873 23.7162C20.4873 24.4778 19.8845 25.095 19.0065 25.095ZM19.9894 20.8842H18.0107L17.5259 15.0404H20.4873L19.9894 20.8842ZM17.8867 0H20.1133V3.94209H17.8867V0ZM28.8495 7.57261L31.6305 4.78555L33.2047 6.36313L30.4237 9.1502L28.8495 7.57261ZM4.78978 6.36061L6.36396 4.78302L9.14501 7.57009L7.57083 9.14767L4.78978 6.36061ZM34.0664 15.5328H38V17.7642H34.0664V15.5328ZM0 15.5328H3.93359V17.7642H0V15.5328ZM31.6904 31.5292H6.30963C4.03973 31.5292 2.19302 33.3799 2.19302 35.6547V38H35.807V35.6547C35.807 33.3799 33.9603 31.5292 31.6904 31.5292Z" fill="#1777CF"/>
      </Svg>
    </View>
    <View data-svg-wrapper style={{left: 77, top: 0, position: 'absolute'}}>
      <Svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <Path d="M18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0Z" fill="#1777CF" stroke="#FCFCFC" strokeWidth={3} />
        <Path d="M24.3216 15.1341L16.1965 23.2589C15.9528 23.5027 15.6328 23.6254 15.3128 23.6254C14.9928 23.6254 14.6729 23.5027 14.4291 23.2589L10.3667 19.1965C9.87778 18.7079 9.87778 17.9178 10.3667 17.4291C10.8553 16.9402 11.6452 16.9402 12.1341 17.4291L15.3128 20.6078L22.5542 13.3667C23.0428 12.8778 23.8327 12.8778 24.3216 13.3667C24.8103 13.8553 24.8103 14.6452 24.3216 15.1341Z" fill="#FCFCFC" />
      </Svg>
    </View>
  </View>
);

const RegisterNowModal: React.FC<RegisterNowModalProps> = ({
  visible,
  onClose,
  onRegister,
}) => {
  const { openModal, closeModal } = useModal();
  
  const [fontsLoaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const handleRegisterNow = () => {
    // Fecha imediatamente este modal e abre o cadastro pessoal
    closeModal();
    openModal('registrationDataPersonal');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header com botão fechar */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Ícone principal */}
          <BuildingIcon />

          {/* Textos */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Atenção</Text>
            <Text style={styles.subtitle}>
              Para ter acesso a todos os recursos do sistema, é necessário que conclua seu cadastro.
            </Text>
          </View>

          {/* Botão de ação */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegisterNow}>
            <Text style={styles.registerButtonText}>Concluir Cadastro</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>

    </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  modalContainer: {
    width: 360,
    height: 405,
    backgroundColor: '#FCFCFC',
    borderRadius: 16,
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    zIndex: 10000,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 13,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0,
  },
  subtitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#1777CF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 95,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    gap: 10,
  },
  registerButtonText: {
    fontSize: 16,
    color: '#FCFCFC',
    fontFamily: 'Inter_500Medium',
    lineHeight: 19,
    letterSpacing: 0,
  },
});

export default RegisterNowModal;