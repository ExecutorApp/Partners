import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
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
import CustomIcon from '../../components/CustomIcon';

type EnterpriseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Enterprise'>;

interface EnterpriseScreenProps {}

interface Company {
  id: string;
  name: string;
}

const companies: Company[] = [
  { id: '1', name: 'Lima Neto Advogados' },
  { id: '2', name: 'Sergio Escapamentos' },
  { id: '3', name: 'Barbomania - Produtos' },
];

export const EnterpriseScreen: React.FC<EnterpriseScreenProps> = () => {
  const navigation = useNavigation<EnterpriseScreenNavigationProp>();
  const [selectedCompany, setSelectedCompany] = useState<string>('1'); // Lima Neto selecionado por padrão

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

  const handleEnterCompany = () => {
    if (selectedCompany) {
      // Navegar para a tela de lista de produtos
      console.log('Empresa selecionada:', companies.find(c => c.id === selectedCompany)?.name);
      navigation.navigate(ScreenNames.ProductList);
    }
  };

  const RadioButton = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return null;
  }

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
              <CustomIcon width={43} height={50} />
            </View>
          </View>

          {/* Formulário de seleção de empresa */}
          <View style={styles.form}>
            {/* Título da pergunta */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                Por qual empresa{'\n'}você deseja fazer login?
              </Text>
            </View>

            {/* Lista de empresas */}
            <View style={styles.companiesContainer}>
              {companies.map((company, index) => (
                <View key={company.id}>
                  <TouchableOpacity
                    style={styles.companyOption}
                    onPress={() => setSelectedCompany(company.id)}
                  >
                    <RadioButton
                      selected={selectedCompany === company.id}
                      onPress={() => setSelectedCompany(company.id)}
                    />
                    <Text style={styles.companyName}>{company.name}</Text>
                  </TouchableOpacity>
                  {index < companies.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </View>

            {/* Área inferior com botão */}
            <View style={styles.bottomFill}>
              <TouchableOpacity
                style={[
                  styles.enterButton,
                  selectedCompany ? styles.enterButtonEnabled : styles.enterButtonDisabled
                ]}
                onPress={handleEnterCompany}
                disabled={!selectedCompany}
                accessibilityLabel="Entrar na empresa selecionada"
              >
                <Text style={[
                  styles.enterButtonText,
                  selectedCompany ? styles.enterButtonTextEnabled : styles.enterButtonTextDisabled
                ]}>
                  Entrar
                </Text>
              </TouchableOpacity>
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
    marginBottom: 40,
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
  form: {
    flex: 1,
    paddingHorizontal: 15,
    gap: 30,
  },
  questionContainer: {
    alignItems: 'center',
    paddingBottom: 0,
  },
  questionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
  companiesContainer: {
    backgroundColor: Colors.background,
    paddingBottom: 10,
    gap: 10,
  },
  companyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  radioButton: {
    padding: 5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  radioSelected: {
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  companyName: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    alignSelf: 'stretch',
    marginVertical: 5,
  },
  bottomFill: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  enterButton: {
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 143,
  },
  enterButtonEnabled: {
    backgroundColor: Colors.accent,
  },
  enterButtonDisabled: {
    backgroundColor: '#F4F4F4',
  },
  enterButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    lineHeight: 19,
  },
  enterButtonTextEnabled: {
    color: '#FCFCFC',
  },
  enterButtonTextDisabled: {
    color: '#9CA3AF',
  },
});