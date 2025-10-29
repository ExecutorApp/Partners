import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { Svg, Path } from 'react-native-svg';

type VerificationMethodScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VerificationMethod'
>;

export const VerificationMethodScreen: React.FC = () => {
  const navigation = useNavigation<VerificationMethodScreenNavigationProp>();
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'whatsapp' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const { width } = useWindowDimensions();
  const DESIGN_WIDTH = 375;
  const scale = width / DESIGN_WIDTH;
  const effectWidth = Math.round(284 * scale);
  const effectHeight = Math.round(309 * scale);

  const handleBackPress = () => {
    setShowConfirm(true);
  };

  const handleSendPress = () => {
      if (selectedMethod === 'email') {
        navigation.navigate('ChangePasswordEmailValidation');
      } else if (selectedMethod === 'whatsapp') {
        navigation.navigate('ChangePasswordWhatsAppValidation');
      }
  };

  const isFormValid = selectedMethod !== null;

  const renderProgressBar = () => {
    const steps = 3; // Fluxo de troca de senha tem 3 passos
    const currentStep = 0; // Esta é a primeira tela
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

  const EmailIcon = () => (
    <Svg width={22} height={15} viewBox="0 0 22 15" fill="none">
      <Path d="M14.5832 7.61182L22 12.2618V2.76545L14.5832 7.61182ZM0 2.76545V12.2618L7.41675 7.61182L0 2.76545ZM20.625 0H1.375C0.688875 0 0.144375 0.507273 0.04125 1.16045L11 8.32091L21.9588 1.16045C21.8556 0.507273 21.3111 0 20.625 0ZM13.3237 8.43545L11.3781 9.70636C11.2658 9.77952 11.1344 9.81839 11 9.81818C10.868 9.81818 10.7374 9.78136 10.6219 9.70636L8.67625 8.43409L0.044 13.8491C0.149875 14.4968 0.691625 15 1.375 15H20.625C21.3084 15 21.8501 14.4968 21.956 13.8491L13.3237 8.43545Z" fill="#1777CF"/>
    </Svg>
  );

  const WhatsAppIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M10.0025 0H9.9975C4.48375 0 0 4.485 0 10C0 12.1875 0.705 14.215 1.90375 15.8613L0.6575 19.5763L4.50125 18.3475C6.0825 19.395 7.96875 20 10.0025 20C15.5162 20 20 15.5137 20 10C20 4.48625 15.5162 0 10.0025 0ZM15.8212 14.1212C15.58 14.8025 14.6225 15.3675 13.8587 15.5325C13.3362 15.6437 12.6537 15.7325 10.3562 14.78C7.4175 13.5625 5.525 10.5762 5.3775 10.3825C5.23625 10.1887 4.19 8.80125 4.19 7.36625C4.19 5.93125 4.91875 5.2325 5.2125 4.9325C5.45375 4.68625 5.8525 4.57375 6.235 4.57375C6.35875 4.57375 6.47 4.58 6.57 4.585C6.86375 4.5975 7.01125 4.615 7.205 5.07875C7.44625 5.66 8.03375 7.095 8.10375 7.2425C8.175 7.39 8.24625 7.59 8.14625 7.78375C8.0525 7.98375 7.97 8.0725 7.8225 8.2425C7.675 8.4125 7.535 8.5425 7.3875 8.725C7.2525 8.88375 7.1 9.05375 7.27 9.3475C7.44 9.635 8.0275 10.5937 8.8925 11.3637C10.0087 12.3575 10.9137 12.675 11.2375 12.81C11.4787 12.91 11.7662 12.8863 11.9425 12.6988C12.1662 12.4575 12.4425 12.0575 12.7237 11.6638C12.9237 11.3813 13.1763 11.3462 13.4413 11.4462C13.7113 11.54 15.14 12.2462 15.4338 12.3925C15.7275 12.54 15.9212 12.61 15.9925 12.7338C16.0625 12.8575 16.0625 13.4387 15.8212 14.1212Z" fill="#1777CF"/>
    </Svg>
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
        <SecurityIcon />
        <Text style={styles.title}>Trocar Senha</Text>
        {renderProgressBar()}
      </View>

      {/* Container branco com formulário */}
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Texto de instrução */}
          <Text style={styles.instructionText}>
            Selecione uma opção para enviarmos o seu código de verificação.
          </Text>

          {/* Opções de verificação */}
          <View style={styles.optionsContainer}>
            {/* Opção Email */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === 'email' && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedMethod('email')}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIconContainer}>
                  <EmailIcon />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Email</Text>
                  <Text style={styles.optionSubtitle}>********@mail.com</Text>
                </View>
              </View>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioButton,
                  selectedMethod === 'email' && styles.radioButtonSelected,
                ]}>
                  {selectedMethod === 'email' && <View style={styles.radioButtonInner} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* Opção WhatsApp */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedMethod === 'whatsapp' && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedMethod('whatsapp')}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionIconContainer}>
                  <WhatsAppIcon />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>WhatsApp</Text>
                  <Text style={styles.optionSubtitle}>**** **** **** 0101</Text>
                </View>
              </View>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioButton,
                  selectedMethod === 'whatsapp' && styles.radioButtonSelected,
                ]}>
                  {selectedMethod === 'whatsapp' && <View style={styles.radioButtonInner} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Mensagem dinâmica de validação/sucesso */}
          {isFormValid ? (
            <Text style={styles.successText}>✓ Pronto para continuar</Text>
          ) : (
            <Text style={styles.validationMessage}>Selecione uma opção para continuar</Text>
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
              onPress={handleSendPress}
              disabled={!isFormValid}
            >
              <Text style={[
                styles.nextButtonText,
                !isFormValid && styles.nextButtonTextDisabled,
              ]}>
                Enviar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 25,
    gap: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 16,
    padding: 15,
    backgroundColor: '#FCFCFC',
  },
  optionCardSelected: {
    borderColor: '#1777CF',
    borderWidth: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_400Regular',
  },
  radioContainer: {
    marginLeft: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCFCFC',
  },
  radioButtonSelected: {
    borderColor: '#1777CF',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1777CF',
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