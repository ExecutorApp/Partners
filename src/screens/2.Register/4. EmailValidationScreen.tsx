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

type EmailValidationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EmailValidation'
>;

export const EmailValidationScreen: React.FC = () => {
  const navigation = useNavigation<EmailValidationScreenNavigationProp>();
  const [code, setCode] = useState(['', '', '', '']);
  const [titleText, setTitleText] = useState('Email');
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
      setTitleText(' Validação Email');
    } else {
      setTitleText('Validação Email');
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
    newCode[index] = text.replace(/\D/g, '').slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 3) {
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
    // Próxima etapa após validação de email
    navigation.navigate('Location');
  };

  const fullCode = code.join('');
  const isFormValid = fullCode === '1234';

  const renderProgressBar = () => {
    const steps = 6;
    const currentStep = 3; // Esta tela é o passo 4 (validação de email)
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

  const EmailIcon = () => (
    <View style={styles.iconContainer}>
      <View style={styles.iconBackground}>
        <Svg width={41} height={28} viewBox="0 0 41 28" fill="none">
          <Path d="M27.1779 14.2087L41 22.8887V5.16218L27.1779 14.2087ZM0 5.16218V22.8887L13.8221 14.2087L0 5.16218ZM38.4375 0H2.5625C1.28381 0 0.269063 0.946909 0.076875 2.16618L20.5 15.5324L40.9231 2.16618C40.7309 0.946909 39.7162 0 38.4375 0ZM24.8306 15.7462L21.2047 18.1185C20.9954 18.2551 20.7504 18.3277 20.5 18.3273C20.254 18.3273 20.0106 18.2585 19.7953 18.1185L16.1694 15.7436L0.082 25.8516C0.279312 27.0607 1.28894 28 2.5625 28H38.4375C39.7111 28 40.7207 27.0607 40.918 25.8516L24.8306 15.7462Z" fill="#1777CF" />
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
        <EmailIcon />
        <Text style={styles.title}>{titleText}</Text>
        {renderProgressBar()}
      </View>

      {/* Container branco com formulário */}
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Texto de instrução */}
          <Text style={styles.instructionText}>
            Digite o código de 4 dígitos que enviamos para o seu email
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
            <Text style={styles.validationMessage}>Digite o código de 4 dígitos para continuar</Text>
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
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
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
    marginTop: 10,
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
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#1777CF',
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginTop: 20,
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
});