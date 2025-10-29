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

type WhatsAppValidationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChangePasswordWhatsAppValidation'
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

  // Título fixo para esta tela
  useEffect(() => {
    setTitleText('Validação WhatsApp');
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
    // Após validar o código, seguir para Segurança (3ª etapa)
    navigation.navigate('Security');
  };

  const fullCode = code.join('');
  const isFormValid = fullCode === '123456';

  const renderProgressBar = () => {
    const steps = 3; // Fluxo de troca de senha tem 3 passos
    const currentStep = 1; // Esta é a segunda tela (validação de código)
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

  const SecurityIcon = () => (
    <View style={styles.iconContainer}>
      <View style={styles.iconBackground}>
        <Svg width={41} height={40} viewBox="0 0 41 40" fill="none">
          <Path d="M6.73788 30.7538C6.57786 30.4744 6.21569 30.3813 5.93776 30.5422L4.47227 31.3973V29.6954C4.47227 29.3737 4.21117 29.1112 3.89113 29.1112C3.57108 29.1112 3.30998 29.3737 3.30998 29.6954V31.3973L1.84449 30.5422C1.56656 30.3813 1.2044 30.4744 1.04437 30.7538C0.884347 31.0332 0.976993 31.3973 1.25493 31.5582L2.72884 32.4219L1.25493 33.2855C0.976993 33.4464 0.884347 33.8105 1.04437 34.0899C1.2044 34.3693 1.56656 34.4625 1.84449 34.3016L3.30998 33.4464V35.1483C3.30998 35.4701 3.57108 35.7325 3.89113 35.7325C4.21117 35.7325 4.47227 35.4701 4.47227 35.1483V33.4464L5.93776 34.3016C6.21569 34.4625 6.57786 34.3693 6.73788 34.0899C6.8979 33.8105 6.80526 33.4464 6.52732 33.2855L5.05341 32.4219L6.52732 31.5582C6.80526 31.3889 6.90633 31.0332 6.73788 30.7538ZM12.1198 34.0814C12.2798 34.3609 12.6419 34.454 12.9199 34.2931L14.3854 33.4379V35.1398C14.3854 35.4616 14.6465 35.7241 14.9665 35.7241C15.2866 35.7241 15.5477 35.4616 15.5477 35.1398V33.4379L17.0131 34.2931C17.2911 34.454 17.6532 34.3609 17.8133 34.0814C17.9733 33.802 17.8806 33.4379 17.6027 33.2771L16.1288 32.4134L17.6027 31.5497C17.8806 31.3889 17.9733 31.0248 17.8133 30.7454C17.6532 30.4659 17.2911 30.3728 17.0131 30.5337L15.5477 31.3889V29.687C15.5477 29.3652 15.2866 29.1027 14.9665 29.1027C14.6465 29.1027 14.3854 29.3652 14.3854 29.687V31.3889L12.9199 30.5422C12.6419 30.3813 12.2798 30.4744 12.1198 30.7538C11.9597 31.0332 12.0524 31.3973 12.3303 31.5582L13.8042 32.4219L12.3303 33.2771C12.0524 33.4379 11.9597 33.802 12.1198 34.0814ZM11.0754 38.5182V39.5512C11.0754 39.7968 11.2775 40 11.5218 40H18.4197C18.6639 40 18.8661 39.7968 18.8661 39.5512V38.5182C18.8661 38.2727 18.6639 38.0695 18.4197 38.0695H11.5218C11.2691 38.0695 11.0754 38.2727 11.0754 38.5182ZM27.8864 9.64512H27.8359V7.34205C27.8359 3.33707 24.5764 -0.0667436 20.6011 0.000993963C16.7352 0.0687315 13.6021 3.2524 13.6021 7.15577V7.37592C13.6021 7.70614 13.8716 7.97709 14.2001 7.97709H16.112C16.4404 7.97709 16.7099 7.70614 16.7099 7.37592V7.30818C16.7099 5.15751 18.3186 3.26933 20.4579 3.13385C22.7825 2.98991 24.7196 4.84423 24.7196 7.1473V9.63666H18.824V9.64512H13.3747C12.364 9.67899 11.547 10.5003 11.547 11.5248V21.9395C11.547 22.9809 12.3893 23.8277 13.4252 23.8277H27.878C28.9139 23.8277 29.7562 22.9809 29.7562 21.9395V11.5333C29.7646 10.4918 28.9224 9.64512 27.8864 9.64512ZM21.7718 17.2063C21.6286 17.3079 21.5865 17.418 21.5865 17.5873C21.5949 18.3494 21.5949 19.1114 21.5865 19.882C21.6033 20.2037 21.4433 20.5085 21.1569 20.6525C20.4916 20.9912 19.8262 20.517 19.8262 19.882V17.5789C19.8262 17.4265 19.7925 17.3164 19.6578 17.2148C18.9671 16.7068 18.7397 15.8346 19.085 15.0641C19.4219 14.319 20.2389 13.8787 21.0053 14.0396C21.8644 14.2089 22.4624 14.9117 22.4708 15.7669C22.4961 16.3681 22.2518 16.8592 21.7718 17.2063ZM22.1424 38.5182V39.5512C22.1424 39.7968 22.3445 40 22.5887 40H29.4866C29.7309 40 29.933 39.7968 29.933 39.5512V38.5182C29.933 38.2727 29.7309 38.0695 29.4866 38.0695H22.5887C22.3445 38.0695 22.1424 38.2727 22.1424 38.5182ZM23.1867 34.0814C23.3468 34.3609 23.7089 34.454 23.9869 34.2931L25.4523 33.4379V35.1398C25.4523 35.4616 25.7134 35.7241 26.0335 35.7241C26.3535 35.7241 26.6146 35.4616 26.6146 35.1398V33.4379L28.0801 34.2931C28.3581 34.454 28.7202 34.3609 28.8802 34.0814C29.0403 33.802 28.9476 33.4379 28.6697 33.2771L27.1958 32.4134L28.6697 31.5497C28.9476 31.3889 29.0403 31.0248 28.8802 30.7454C28.7202 30.4659 28.3581 30.3728 28.0801 30.5337L26.6146 31.3889V29.687C26.6146 29.3652 26.3535 29.1027 26.0335 29.1027C25.7134 29.1027 25.4523 29.3652 25.4523 29.687V31.3889L23.9869 30.5337C23.7089 30.3728 23.3468 30.4659 23.1867 30.7454C23.0267 31.0248 23.1194 31.3889 23.3973 31.5497L24.8712 32.4134L23.3973 33.2771C23.1194 33.4379 23.0267 33.802 23.1867 34.0814ZM40.5536 38.0695H33.6557C33.4115 38.0695 33.2093 38.2727 33.2093 38.5182V39.5512C33.2093 39.7968 33.4115 40 33.6557 40H40.5536C40.7979 40 41 39.7968 41 39.5512V38.5182C41 38.2727 40.7979 38.0695 40.5536 38.0695ZM0.446385 40H7.34429C7.58854 40 7.79067 39.7968 7.79067 39.5512V38.5182C7.79067 38.2727 7.58854 38.0695 7.34429 38.0695H0.446385C0.202136 38.0695 0 38.2727 0 38.5182V39.5512C0 39.7968 0.202136 40 0.446385 40ZM34.2621 34.0814C34.4221 34.3609 34.7843 34.454 35.0622 34.2931L36.5277 33.4379V35.1398C36.5277 35.4616 36.7888 35.7241 37.1089 35.7241C37.4289 35.7241 37.69 35.4616 37.69 35.1398V33.4379L39.1555 34.2931C39.4334 34.454 39.7956 34.3609 39.9556 34.0814C40.1157 33.802 40.023 33.4379 39.7451 33.2771L38.2712 32.4134L39.7451 31.5497C40.023 31.3889 40.1157 31.0248 39.9556 30.7454C39.7956 30.4659 39.4334 30.3728 39.1555 30.5337L37.69 31.3889V29.687C37.69 29.3652 37.4289 29.1027 37.1089 29.1027C36.7888 29.1027 36.5277 29.3652 36.5277 29.687V31.3889L35.0622 30.5337C34.7843 30.3728 34.4221 30.4659 34.2621 30.7454C34.1021 31.0248 34.1947 31.3889 34.4727 31.5497L35.9466 32.4134L34.4727 33.2771C34.1947 33.4379 34.0937 33.802 34.2621 34.0814Z" fill="#1777CF" />
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
        <SecurityIcon />
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