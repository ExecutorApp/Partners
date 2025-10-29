import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import EyeIcon from '../../components/EyeIcon';
import EyeOpenIcon from '../../components/EyeOpenIcon';
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
  Inter_900Black} from '@expo-google-fonts/inter';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Comfortaa_400Regular } from '@expo-google-fonts/comfortaa';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '../../constants/theme';
import { RootStackParamList, ScreenNames } from '../../types/navigation';
import LoginIcon from '../../components/LoginIcon';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    DMSans_700Bold,
    Comfortaa_400Regular,
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validar email
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar senha
    if (!password.trim()) {
      setPasswordError('Senha é obrigatória');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = () => {
    if (validateForm()) {
      // Navegar diretamente para a lista de produtos após login válido
      navigation.navigate(ScreenNames.ProductList);
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate(ScreenNames.PersonalInfo);
  };

  const handleForgotPassword = () => {
    navigation.navigate(ScreenNames.VerificationMethod);
  };

  if (!fontsLoaded) {
    return null;
  }

  const isFormValid = email.trim() && password.trim();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero com curva superior e logo central */}
          <View style={styles.hero}>
            <View style={styles.topCurve} />
            <View style={styles.logoCircle}>
              <LoginIcon width={43} height={50} />
            </View>
            <View style={styles.titleBlock}>
              <Text
                style={[
                  styles.brandTitle,
                  Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as any) : null,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Partners
              </Text>
              <Text
                style={[
                  styles.brandSubtitle,
                  Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as any) : null,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.9}
              >
                sua plataforma de parcerias inteligentes
              </Text>
            </View>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            {/* Campo Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.fieldWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    emailFocused && styles.inputFocused,
                    emailError ? styles.inputError : null,
                    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                  ]}
                   value={email}
                   onChangeText={(text) => {
                     setEmail(text);
                     if (emailError) setEmailError('');
                   }}
                   onFocus={() => setEmailFocused(true)}
                   onBlur={() => setEmailFocused(false)}
                   placeholder="seu@email.com"
                   placeholderTextColor={Colors.textPlaceholder}
                   keyboardType="email-address"
                   autoCapitalize="none"
                   autoCorrect={false}
                   autoComplete="email"
                   textContentType="emailAddress"
                 />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Campo Senha */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                   style={[
                     styles.passwordInput,
                     passwordFocused && styles.inputFocused,
                     passwordError ? styles.inputError : null,
                     Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                   ]}
                   value={password}
                   onChangeText={(text) => {
                     setPassword(text);
                     if (passwordError) setPasswordError('');
                   }}
                   placeholder={password ? '' : '••••••••'}
                   placeholderTextColor={Colors.textPlaceholder}
                   secureTextEntry={!showPassword}
                   autoCapitalize="none"
                   autoCorrect={false}
                   autoComplete="password"
                   textContentType="password"
                   onFocus={() => setPasswordFocused(true)}
                   onBlur={() => setPasswordFocused(false)}
                 />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                     <EyeOpenIcon width={25} height={20} />
                   ) : (
                     <EyeIcon width={24} height={18} />
                   )}
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Botão Entrar */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              accessibilityLabel="Entrar na plataforma"
            >
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>

            {/* Área inferior preenchendo espaço e fixando ações no rodapé */}
            <View style={styles.bottomFill}>
              <View style={styles.actionsGroup}>
                <TouchableOpacity onPress={handleCreateAccount} style={styles.outlinedButton} accessibilityLabel="Criar conta">
                  <Text style={styles.outlinedText}>Criar conta</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword} style={styles.outlinedButton} accessibilityLabel="Esqueci minha senha">
                  <Text style={styles.linkPrimary}>Esqueci minha senha</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: 10,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    alignSelf: 'stretch',
    width: '100%',
  },
  topCurve: {
    position: 'absolute',
    top: -210,
    left: -90,
    right: -90,
    height: 400,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 400,
    borderBottomRightRadius: 400,
    zIndex: -1,
  },
  logoCircle: {
    marginTop: 130,
    width: 109,
    height: 109,
    borderRadius: 54.5,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  titleBlock: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    alignSelf: 'stretch',
    width: '100%',
  },
  brandTitle: {
    fontSize: Typography.fontSize.logoTitle,
    color: Colors.logoText,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    lineHeight: 80,
    alignSelf: 'stretch',
    width: '100%',
    flexShrink: 1,
  },
  brandSubtitle: {
    marginTop: -10,
    padding: 10,
    fontSize: Typography.fontSize.logoSubtitle,
    color: Colors.subtitle,
    fontFamily: 'Comfortaa_400Regular',
    textAlign: 'center',
    lineHeight: 10,
    alignSelf: 'stretch',
    width: '100%',
    flexShrink: 1,
  },
  form: {
    marginTop: 25,
    gap: 20,
    paddingHorizontal: Spacing.sm,
    flexGrow: 1,
  },
  inputContainer: {
    gap: 15,
  },
  label: {
    marginLeft: 5,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'Inter_500Medium',
  },
  fieldWrapper: {
    gap: 9,
  },
  input: {
    height: 43,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 9,
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    backgroundColor: Colors.background,
  },
  inputFocused: {
    borderColor: Colors.accent,
    borderWidth: 0.5,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 43,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingRight: 50,
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    backgroundColor: Colors.background,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
  },
  errorText: {
    fontSize: Typography.fontSize.caption,
    color: '#FF4444',
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  loginButton: {
    height: 42,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    color: '#FCFCFC',
    fontFamily: 'Inter_700Bold',
  },
  bottomFill: {
    flexGrow: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionsGroup: {
    gap: 10,
    alignSelf: 'stretch',
  },
  outlinedButton: {
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  linkPrimary: {
    fontSize: 16,
    color: Colors.accent,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'none',
  },
});