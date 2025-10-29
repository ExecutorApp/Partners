import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { Svg, Path } from 'react-native-svg';
import { saveEmail, getPersonalInfo } from '../../utils/storage';

type EmailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Email'
>;

const EmailScreen: React.FC = () => {
  const navigation = useNavigation<EmailScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [firstName, setFirstName] = useState('');
  
  const { width, height } = useWindowDimensions();
  const DESIGN_WIDTH = 375;
  const DESIGN_HEIGHT = 812;
  const scale = width / DESIGN_WIDTH;
  const effectWidth = Math.round(284 * scale);
  const effectHeight = Math.round(309 * scale);
  const effectTop = Math.round(-29 * scale);
  const effectRight = Math.round(-45 * scale);
  
  // Validação de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleBackPress = () => {
    // Voltar para a tela anterior preservando histórico
    navigation.goBack();
  };

  const handleNextPress = () => {
    // Salva email localmente e navega para próxima tela
    saveEmail(email.trim());
    navigation.navigate('EmailValidation');
  };

  const isFormValid = validateEmail(email);

  useEffect(() => {
    const info = getPersonalInfo();
    if (info) {
      setEmail(info.email ?? '');
      // Extrai o primeiro nome
      const fullName = info.fullName ?? '';
      const firstNameExtracted = fullName.trim().split(' ')[0];
      setFirstName(firstNameExtracted);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const info = getPersonalInfo();
      if (info) {
        setEmail(info.email ?? '');
        // Extrai o primeiro nome
        const fullName = info.fullName ?? '';
        const firstNameExtracted = fullName.trim().split(' ')[0];
        setFirstName(firstNameExtracted);
      }
    }, [])
  );

  const renderProgressBar = () => {
    const currentStep = 2; // Terceira etapa (Email)
    const steps = 6;
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
        <Text style={styles.title}>Email</Text>
        {/* Removido subtitle do header para posicionar dentro do formulário */}
        {renderProgressBar()}
      </View>

      {/* Container branco com formulário */}
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Subtítulo dentro do formulário, acima do input */}
          <Text style={styles.formSubtitle}>
            Qual o seu melhor email, {firstName}?
          </Text>

          {/* Campo Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={[
                styles.textInput,
                emailFocused && styles.textInputFocused,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              placeholder="seu@email.com"
              placeholderTextColor="#91929E"
              value={email}
              autoCapitalize="none"
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => {
                setEmailFocused(false);
                if (!validateEmail(email)) {
                  setEmailError('Digite um email válido');
                }
              }}
              keyboardType="email-address"
              autoCorrect={false}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Mensagem de validação/sucesso */}
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
    marginBottom: 15,
  },
  iconBackground: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#FCFCFC',
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
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FCFCFC',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    marginBottom: 10,
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
    gap: 30,
  },
  // Subtítulo do formulário, seguindo tipografia das demais telas
  formSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3A3F51',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    paddingHorizontal: 0,
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
});

export default EmailScreen;