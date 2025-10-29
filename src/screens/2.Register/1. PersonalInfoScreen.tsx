import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
// Removido import direto da imagem para re-adicionar via require do assets
import { Svg, Path } from 'react-native-svg';
import { formatWhatsappMask, isWhatsappComplete } from '../../utils/phone';
import { savePersonalInfo, getPersonalInfo, clearPersonalInfo } from '../../utils/storage';

type PersonalInfoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PersonalInfo'
>;

export const PersonalInfoScreen: React.FC = () => {
  const navigation = useNavigation<PersonalInfoScreenNavigationProp>();
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [whatsappFocused, setWhatsappFocused] = useState(false);
  const [fullNameError, setFullNameError] = useState('');
const [whatsappError, setWhatsappError] = useState('');
const [showConfirm, setShowConfirm] = useState(false);
  const { width, height } = useWindowDimensions();
  const DESIGN_WIDTH = 375;
  const DESIGN_HEIGHT = 812;
  const scaleX = width / DESIGN_WIDTH;
  const scaleY = height / DESIGN_HEIGHT;
  const scale = width / DESIGN_WIDTH; // usa escala uniforme baseada na largura para manter recorte idêntico
  const effectWidth = Math.round(284 * scale);
  const effectHeight = Math.round(309 * scale);
  const effectTop = Math.round(-29 * scale);
  const effectRight = Math.round(-45 * scale);
  
  // Capitaliza somente a primeira letra do primeiro nome
  const normalizeFullNameInput = (text: string) => {
    if (!text) return '';
    // Mantém espaços iniciais e apenas capitaliza a primeira letra visível
    return text.replace(/^(\s*)(\S)/, (_, spaces: string, first: string) => `${spaces}${first.toLocaleUpperCase('pt-BR')}`);
  };
  
  const validateFullNameTwoWords = (text: string) => text.trim().split(/\s+/).length >= 2;
  

  const areAllDigitsEqual = (digits: string) => digits.length > 0 && new Set(digits).size === 1;
  const isWhatsappValid = (digits: string) => digits.length >= 10 && digits.length <= 11 && !areAllDigitsEqual(digits);



  const handleBackPress = () => {
    setShowConfirm(true);
  };

  const handleNextPress = () => {
    // Salva dados localmente e navega
    savePersonalInfo(fullName.trim(), whatsapp);
    navigation.navigate('WhatsAppValidation');
  };

  const isFormValid = validateFullNameTwoWords(fullName) && isWhatsappValid(whatsapp);

  const formattedWhatsapp = formatWhatsappMask(whatsapp);

  useEffect(() => {
    const info = getPersonalInfo();
    if (info) {
      setFullName(info.fullName ?? '');
      setWhatsapp(info.whatsapp ?? '');
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const info = getPersonalInfo();
      if (info) {
        setFullName(info.fullName ?? '');
        setWhatsapp(info.whatsapp ?? '');
      }
    }, [])
  );
  const renderProgressBar = () => {
    const steps = 6;
    const currentStep = 0; // Esta tela é o passo 0
    return (
      <View style={styles.progressContainer}>
        {Array.from({ length: steps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressStep,
              index <= currentStep ? styles.progressStepActive : styles.progressStepInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  const UserIcon = () => (
    <View style={styles.iconContainer}>
      <View style={styles.iconBackground}>
        <Svg width={29} height={33} viewBox="0 0 29 33" fill="none">
          <Path d="M14.5 0C9.49493 0 5.4375 3.69366 5.4375 8.25C5.4375 12.8063 9.49493 16.5 14.5 16.5C19.505 16.5 23.5625 12.8063 23.5625 8.25C23.5625 3.69366 19.505 0 14.5 0Z" fill="#1777CF" />
          <Path d="M9.0625 19.8C6.65898 19.8 4.3539 20.6692 2.65435 22.2164C0.954789 23.7635 0 25.8619 0 28.05V33H29V28.05C29 25.8619 28.0452 23.7635 26.3456 22.2164C24.6462 20.6692 22.3411 19.8 19.9375 19.8H9.0625Z" fill="#1777CF" />
        </Svg>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#021632" />
      
      {/* Header com ícone e título */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/Efeito - Tela de cadastro.png')}
          style={[styles.effectImage, { width: effectWidth, height: effectHeight, top: -110, right: -40 }]}
          resizeMode="cover"
        />
        <UserIcon />
        <Text style={styles.title}>Informações Pessoais</Text>
        {renderProgressBar()}
      </View>

      {/* Container branco com formulário */}
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Campo Nome completo */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Nome completo *</Text>
            <TextInput
              style={[
                styles.textInput,
                fullNameFocused && styles.textInputFocused,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              placeholder="Seu nome completo"
              placeholderTextColor="#91929E"
              value={fullName}
              autoCapitalize="none"
              onChangeText={(text) => {
                const normalized = normalizeFullNameInput(text);
                setFullName(normalized);
                const isValid = validateFullNameTwoWords(normalized);
                if (!isValid && normalized.trim().length > 0) {
                  setFullNameError('Por favor, insira seu nome completo (nome e sobrenome)');
                } else {
                  setFullNameError('');
                }
                savePersonalInfo(normalized, whatsapp);
              }}
              onFocus={() => setFullNameFocused(true)}
              onBlur={() => {
                setFullNameFocused(false);
                setFullNameError(
                  validateFullNameTwoWords(fullName)
                    ? ''
                    : 'Por favor, insira seu nome completo (nome e sobrenome)'
                );
              }}
            />
            {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
          </View>

          {/* Campo WhatsApp */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>WhatsApp *</Text>
            <TextInput
              style={[
                styles.textInput,
                whatsappFocused && styles.textInputFocused,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#91929E"
               value={formattedWhatsapp}
               onChangeText={(text) => {
                const digits = text.replace(/\D/g, '').slice(0, 11);
                setWhatsapp(digits);
                if (digits.length > 0 && (digits.length < 10 || areAllDigitsEqual(digits))) {
                  setWhatsappError('Número inválido');
                } else {
                  setWhatsappError('');
                }
                savePersonalInfo(fullName, digits);
              }}
              keyboardType="numeric"
              maxLength={15}
              onFocus={() => setWhatsappFocused(true)}
              onBlur={() => {
                setWhatsappFocused(false);
                if (whatsapp.length < 10 || areAllDigitsEqual(whatsapp)) {
                  setWhatsappError('Número inválido');
                } else {
                  setWhatsappError('');
                }
              }}
              accessibilityLabel="Número de WhatsApp no formato (00) 00000-0000"
            />
            {whatsappError ? <Text style={styles.errorText}>{whatsappError}</Text> : null}
          </View>

          {/* Mensagem dinâmica de validação/sucesso */}
          {isFormValid ? (
            <Text style={styles.successText}>✓ Pronto para continuar</Text>
          ) : (
            <Text style={styles.validationMessage}>Preencha os campos obrigatórios para continuar</Text>
          )}
        </View>

        {/* Rodapé: ocupa espaço restante e fixa botões na base */}
        <View style={styles.footerFill}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.nextButton,
                !isFormValid ? styles.nextButtonDisabled : styles.nextButtonReady,
              ]}
              onPress={handleNextPress}
              disabled={!isFormValid}
            >
              <Text style={[
                styles.nextButtonText,
                !isFormValid && styles.nextButtonTextDisabled,
              ]}>
                Próximo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Overlay do modal movido para o contêiner raiz */}
      </View>
      {showConfirm && (
        <View style={[styles.modalOverlay, Platform.OS === 'web' ? styles.modalOverlayWeb : null]}>
          <View style={styles.modalCard}>
            {/* Ícone de aviso */}
            <View style={styles.modalIcon}>
              <Svg width="35" height="35" viewBox="0 0 35 35" fill="none">
                <Path
                  d="M28.876 18.072C28.876 11.7858 23.7727 6.67149 17.5 6.67149C11.2273 6.67149 6.12404 11.7858 6.12404 18.072V27.0533H28.8759V18.072H28.876ZM17.506 23.1138C16.6974 23.1138 16.1301 22.5453 16.1301 21.8438C16.1301 21.1301 16.6974 20.5979 17.506 20.5979C18.3147 20.5979 18.8699 21.1301 18.8699 21.8438C18.8699 22.5453 18.3147 23.1138 17.506 23.1138ZM18.4113 19.2355H16.5888L16.1422 13.853H18.8699L18.4113 19.2355ZM16.4746 0H18.5254V3.63088H16.4746V0ZM26.5719 6.97478L29.1334 4.40775L30.5833 5.86078L28.0218 8.42781L26.5719 6.97478ZM4.41164 5.85845L5.86154 4.40542L8.42304 6.97245L6.97314 8.42548L4.41164 5.85845ZM31.377 14.3065H35V16.3618H31.377V14.3065ZM0 14.3065H3.62305V16.3618H0V14.3065ZM29.1885 29.04H5.8115C3.7208 29.04 2.01988 30.7446 2.01988 32.8398V35H32.9801V32.8398C32.9801 30.7446 31.2792 29.04 29.1885 29.04Z"
                  fill="#1777CF"
                />
              </Svg>
            </View>
            
            {/* Conteúdo do texto */}
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>ATENÇÃO!</Text>
              <Text style={styles.modalMessage}>
                Ao voltar, os dados preenchidos serão perdidos. Deseja continuar?
              </Text>
            </View>
            
            {/* Botões */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowConfirm(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={() => {
                  setShowConfirm(false);
                  clearPersonalInfo();
                  setFullName('');
                  setWhatsapp('');
                  setFullNameError('');
                  setWhatsappError('');
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021632',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 0,
    position: 'relative',
  },
  effectImage: {
    position: 'absolute',
    resizeMode: 'cover',
  },
  effectImageOverlay: {
    position: 'absolute',
    resizeMode: 'cover',
    opacity: 0.35,
    transform: [{ scaleX: 1.04 }, { scaleY: 1.04 }],
  },
  headerImage: {
    opacity: 1,
  },
  iconContainer: {
    marginBottom: 15,
  },
  iconBackground: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#FCFCFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIconCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIconHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1777CF',
    marginBottom: 2,
  },
  userIconBody: {
    width: 20,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#1777CF',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FCFCFC',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    marginBottom: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    alignSelf: 'stretch',
  },
  progressStep: {
    flex: 1,
    height: 6,
    borderRadius: 6,
  },
  progressStepActive: {
    backgroundColor: '#1777CF',
  },
  progressStepInactive: {
    backgroundColor: '#FCFCFC',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 15,
    justifyContent: 'space-between',
    paddingBottom: 0,
    position: 'relative',
    minHeight: 0,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 21,
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    paddingHorizontal: 4,
  },
  textInput: {
    height: 43,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 10,
    backgroundColor: '#FCFCFC',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
  },
  textInputFocused: {
    borderColor: '#1777CF',
    borderWidth: 0.5,
  },
  validationMessage: {
    fontSize: 14,
    color: '#EC8938',
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 0,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#1B883C',
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 0,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4444',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  footerFill: {
    flexGrow: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 0,
    alignSelf: 'stretch',
    width: '100%',
  },
  backButton: {
    flex: 1,
    height: 42,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1777CF',
    fontFamily: 'Inter_600SemiBold',
  },
  nextButton: {
    flex: 1,
    height: 42,
    backgroundColor: '#1777CF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#F4F4F4',
  },
  nextButtonReady: {
    backgroundColor: '#1777CF',
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FCFCFC',
    fontFamily: 'Inter_700Bold',
  },
  nextButtonTextDisabled: {
    color: '#5F758B80',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingVertical: 20,
    zIndex: 999,
  },
  modalOverlayWeb: {
    position: 'absolute',
  },
  modalCard: {
    width: 316,
    maxWidth: '90%',
    height: 280,
    backgroundColor: '#FCFCFC',
    borderRadius: 18,
    paddingTop: 30,
    paddingHorizontal: 15,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    height: 42,
    backgroundColor: '#F4F4F4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#3A3F51',
    fontFamily: 'Inter_600SemiBold',
  },
  modalConfirm: {
    flex: 1,
    height: 42,
    backgroundColor: '#1777CF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#FCFCFC',
    fontFamily: 'Inter_600SemiBold',
  },
});