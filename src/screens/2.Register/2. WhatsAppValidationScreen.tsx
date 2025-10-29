import React, { useState, useRef, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { Svg, Path } from 'react-native-svg';
import { getPersonalInfo } from '../../utils/storage';

type WhatsAppValidationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WhatsAppValidation'
>;

export const WhatsAppValidationScreen: React.FC = () => {
  const navigation = useNavigation<WhatsAppValidationScreenNavigationProp>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [titleText, setTitleText] = useState('Validação WhatsApp');
  const [resendSeconds, setResendSeconds] = useState(28);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const { width, height } = useWindowDimensions();
  const DESIGN_WIDTH = 375;
  const DESIGN_HEIGHT = 812;
  const scale = width / DESIGN_WIDTH;
  const effectWidth = Math.round(284 * scale);
  const effectHeight = Math.round(309 * scale);

  useEffect(() => {
    const info = getPersonalInfo();
    if (info?.fullName) {
      const first = info.fullName.trim().split(/\s+/)[0];
      const cap = first ? first.charAt(0).toLocaleUpperCase('pt-BR') + first.slice(1) : '';
      setTitleText(cap ? `Excelente, ${cap}!` : 'Validação WhatsApp');
    } else {
      setTitleText('Validação WhatsApp');
    }
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setInterval(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendSeconds]);

  const formatTime = (s: number) => `00:${String(s).padStart(2, '0')}`;
  const handleResend = () => setResendSeconds(28);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBackPress = () => {
    // Voltar para a tela anterior preservando histórico
    navigation.goBack();
  };

  const handleNextPress = () => {
    navigation.navigate('Email');
  };

  const fullCode = code.join('');
  const isFormValid = fullCode === '123456';

  const renderProgressBar = () => {
    const steps = 6;
    const currentStep = 1; // Esta tela é o passo 1
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
        <Svg width={33} height={33} viewBox="0 0 33 33" fill="none">
          <Path d="M16.5041 0H16.4959C7.39819 0 0 7.40025 0 16.5C0 20.1094 1.16325 23.4548 3.14119 26.1711L1.08488 32.3008L7.42706 30.2734C10.0361 32.0018 13.1484 33 16.5041 33C25.6018 33 33 25.5977 33 16.5C33 7.40231 25.6018 0 16.5041 0ZM26.1051 23.3001C25.707 24.4241 24.1271 25.3564 22.8669 25.6286C22.0048 25.8122 20.8787 25.9586 17.0878 24.387C12.2389 22.3781 9.11625 17.4508 8.87288 17.1311C8.63981 16.8114 6.9135 14.5221 6.9135 12.1543C6.9135 9.78656 8.11594 8.63363 8.60063 8.13863C8.99869 7.73231 9.65662 7.54669 10.2878 7.54669C10.4919 7.54669 10.6755 7.557 10.8405 7.56525C11.3252 7.58588 11.5686 7.61475 11.8883 8.37994C12.2863 9.339 13.2557 11.7067 13.3712 11.9501C13.4887 12.1935 13.6063 12.5235 13.4413 12.8432C13.2866 13.1732 13.1505 13.3196 12.9071 13.6001C12.6637 13.8806 12.4327 14.0951 12.1894 14.3962C11.9666 14.6582 11.715 14.9387 11.9955 15.4234C12.276 15.8977 13.2454 17.4797 14.6726 18.7502C16.5144 20.3899 18.0077 20.9137 18.5419 21.1365C18.9399 21.3015 19.4143 21.2623 19.7051 20.9529C20.0743 20.5549 20.5301 19.8949 20.9942 19.2452C21.3242 18.7791 21.7408 18.7213 22.1781 18.8863C22.6236 19.041 24.981 20.2063 25.4657 20.4476C25.9504 20.691 26.2701 20.8065 26.3876 21.0107C26.5031 21.2149 26.5031 22.1739 26.1051 23.3001Z" fill="#1777CF" />
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
          style={[imageStyles.effectImage, { width: effectWidth, height: effectHeight, top: -110, right: -40 }]}
          resizeMode="cover"
        />
        <UserIcon />
        <Text style={styles.title}>{titleText}</Text>
        {renderProgressBar()}
      </View>

      {/* Container branco com formulário */}
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Texto de instrução */}
          <Text style={styles.instructionText}>
            Digite o código de 6 dígitos{'\n'}que enviamos para o seu WhatsApp
          </Text>

          {/* Campos de código */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.codeInput,
                  Platform.OS === 'web' ? ({ outlineStyle: 'solid', outlineWidth: 0 } as any) : null,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text.slice(-1), index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Mensagem de validação/sucesso */}
          {isFormValid ? (
            <Text style={styles.successText}>✓ Pronto para continuar</Text>
          ) : (
            <Text style={styles.validationMessage}>Digite o código de 6 dígitos para continuar</Text>
          )}

          {/* Texto de reenvio com contador */}
          {resendSeconds > 0 ? (
            <Text style={styles.resendText}>Reenviar código em {formatTime(resendSeconds)}</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Reenviar código</Text>
            </TouchableOpacity>
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
      </View>
      

    </View>
  );
};

const imageStyles = StyleSheet.create({
  effectImage: {
    position: 'absolute',
  },
});

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
  // effectImage: {
  //   position: 'absolute',
  //   resizeMode: 'cover',
  // },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  iconBackground: {
    width: 65,
    height: 65,
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    paddingTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  codeInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    borderRadius: 10,
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#3A3F51',
    textAlign: 'center',
    backgroundColor: '#FCFCFC',
    maxWidth: 48,
  },
  resendText: {
    fontSize: 14,
    color: '#0095FF',
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
  validationMessage: {
    fontSize: 14,
    color: '#EC8938',
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 0,
    textAlign: 'center',
    marginTop: 15,
  },
  successText: {
    fontSize: 14,
    color: '#1B883C',
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 0,
    textAlign: 'center',
    marginTop: 28,
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
    padding: 20,
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