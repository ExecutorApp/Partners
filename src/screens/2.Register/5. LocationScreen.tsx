import React, { useState, useRef, useEffect } from 'react';
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
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { Svg, Path } from 'react-native-svg';
import { getLocation, saveLocation } from '../../utils/storage';

// Navegação tipada (mantendo padrão do app)
type LocationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Location'
>;

// Lista de estados do Brasil ("UF - Nome")
const BRAZIL_STATES: string[] = [
  'AC - Acre',
  'AL - Alagoas',
  'AP - Amapá',
  'AM - Amazonas',
  'BA - Bahia',
  'CE - Ceará',
  'DF - Distrito Federal',
  'ES - Espírito Santo',
  'GO - Goiás',
  'MA - Maranhão',
  'MT - Mato Grosso',
  'MS - Mato Grosso do Sul',
  'MG - Minas Gerais',
  'PA - Pará',
  'PB - Paraíba',
  'PR - Paraná',
  'PE - Pernambuco',
  'PI - Piauí',
  'RJ - Rio de Janeiro',
  'RN - Rio Grande do Norte',
  'RS - Rio Grande do Sul',
  'RO - Rondônia',
  'RR - Roraima',
  'SC - Santa Catarina',
  'SP - São Paulo',
  'SE - Sergipe',
  'TO - Tocantins',
];

export const LocationScreen: React.FC = () => {
  const navigation = useNavigation<LocationScreenNavigationProp>();

  // Dimensões para responsividade do efeito de topo (idêntico ao padrão)
  const { width } = useWindowDimensions();
  const DESIGN_WIDTH = 375;
  const scale = width / DESIGN_WIDTH;
  const effectWidth = Math.round(284 * scale);
  const effectHeight = Math.round(309 * scale);

  // Estados locais dos inputs
  const [selectedState, setSelectedState] = useState('');
  const [city, setCity] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

  // Dropdown de estados
  const [stateSearch, setStateSearch] = useState('');
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });
  useEffect(() => {
    Animated.timing(chevronAnim, {
      toValue: stateDropdownOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [stateDropdownOpen]);

  const filteredStates = BRAZIL_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase().trim())
  );

  // Hydrate from persisted storage whenever the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const stored = getLocation();
      if (stored && typeof stored.state === 'string' && typeof stored.city === 'string') {
        setSelectedState(stored.state);
        setCity(stored.city);
      }
      setHydrated(true);
    }, [])
  );

  // Persist whenever values change, after hydration to avoid overwriting saved data with defaults
  useEffect(() => {
    if (hydrated) {
      saveLocation(selectedState, city);
    }
  }, [selectedState, city, hydrated]);

  // Barra de progresso no mesmo padrão visual
  const renderProgressBar = () => {
    const steps = 6;
    const currentStep = 4; // Etapas anteriores em azul até Localização
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

  // Ícone de localização fornecido
  const LocationIcon = () => (
    <View style={styles.iconContainer}>
      <View style={styles.iconBackground}>
        <Svg width={24} height={33} viewBox="0 0 24 33" fill="none">
          <Path d="M12 0C5.38281 0 0 5.55167 0 12.375C0 21.5045 11.0716 32.3555 11.543 32.8133C11.6719 32.9375 11.8359 33 12 33C12.1641 33 12.3281 32.9375 12.4571 32.8133C12.9284 32.3555 24 21.5045 24 12.375C24 5.55167 18.6172 0 12 0ZM12 19.25C8.32419 19.25 5.33331 16.1657 5.33331 12.375C5.33331 8.58432 8.32425 5.49998 12 5.49998C15.6757 5.49998 18.6667 8.58438 18.6667 12.375C18.6667 16.1656 15.6758 19.25 12 19.25Z" fill="#1777CF" />
        </Svg>
      </View>
    </View>
  );

  const handleBackPress = () => {
    // Fecha dropdown, se aberto, e volta preservando histórico
    setStateDropdownOpen(false);
    navigation.goBack();
  };

  const handleNextPress = () => {
    // Navega para etapa de Segurança mantendo padrão do fluxo
    navigation.navigate('Security');
  };

  const isFormValid = selectedState.trim().length > 0 && city.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#021632" />

      {/* Header com ícone e título, idêntico em estrutura */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/Efeito - Tela de cadastro.png')}
          style={[styles.effectImage, { width: effectWidth, height: effectHeight, top: -110, right: -40 }]}
          resizeMode="cover"
        />
        <LocationIcon />
        <Text style={styles.title}>Localização</Text>
        {renderProgressBar()}
      </View>

      {/* Container branco com formulário */}
      <View style={styles.formContainer}>
        <View style={styles.formContent}>
          {/* Campo Estado (seleção com busca e lista) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Estado *</Text>
            <TouchableOpacity
              style={[styles.textInput, styles.stateSelectRow]}
              activeOpacity={0.7}
              onPress={() => setStateDropdownOpen((v) => !v)}
            >
              <Text
                style={selectedState.trim().length > 0 ? styles.selectionText : styles.selectionPlaceholder}
              >
                {selectedState.trim().length > 0 ? selectedState : 'Selecione um estado'}
              </Text>
              <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 6l6 6-6 6" stroke="#91929E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Animated.View>
            </TouchableOpacity>

            <Modal
              visible={stateDropdownOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setStateDropdownOpen(false)}
            >
              <TouchableWithoutFeedback onPress={() => setStateDropdownOpen(false)}>
                <View style={styles.modalBackdrop} />
              </TouchableWithoutFeedback>

              <View style={styles.modalContainer} pointerEvents="box-none">
                <View style={styles.dropdownContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
                    ]}
                    placeholder="Buscar estado"
                    placeholderTextColor="#91929E"
                    value={stateSearch}
                    onChangeText={setStateSearch}
                    autoCapitalize="none"
                  />

                  <ScrollView style={styles.stateList}>
                    {filteredStates.map((label) => (
                      <View key={label}>
                        <TouchableOpacity
                          style={[styles.stateItem, label === selectedState && styles.stateItemSelected]}
                          onPress={() => {
                            setSelectedState(label);
                            setStateSearch('');
                            setStateDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.stateItemText}>{label}</Text>
                        </TouchableOpacity>
                        <View style={styles.stateDivider} />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>

          {/* Campo Cidade (texto simples) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Cidade *</Text>
            <TextInput
              style={[
                styles.textInput,
                cityFocused && styles.textInputFocused,
                Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
              ]}
              placeholder="Digite sua cidade"
              placeholderTextColor="#91929E"
              value={city}
              onChangeText={(t) => {
                const idx = t.search(/\S/);
                if (idx === -1) {
                  setCity(t);
                } else {
                  const transformed = t.slice(0, idx) + t.charAt(idx).toUpperCase() + t.slice(idx + 1);
                  setCity(transformed);
                }
              }}
              onFocus={() => setCityFocused(true)}
              onBlur={() => setCityFocused(false)}
              autoCapitalize="none"
            />
          </View>

          {/* Mensagem dinâmica de validação/sucesso */}
          {isFormValid ? (
            <Text style={styles.successText}>✓ Pronto para continuar</Text>
          ) : (
            <Text style={styles.validationMessage}>Preencha os campos obrigatórios para continuar</Text>
          )}
        </View>

        {/* Rodapé com botões (mesmo padrão e posicionamento) */}
        <View style={styles.footerFill}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !isFormValid ? styles.nextButtonDisabled : styles.nextButtonReady]}
              onPress={handleNextPress}
              disabled={!isFormValid}
            >
              <Text style={[styles.nextButtonText, !isFormValid && styles.nextButtonTextDisabled]}>Próximo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Modal cuida do overlay/fechamento */}
    </View>
  );
};

const styles = StyleSheet.create({
  // ——— Layout base, copiado para manter padrão visual ———
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

  // ——— Estilos específicos do seletor de estado ———
  selectionText: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
  },
  selectionPlaceholder: {
    fontSize: 14,
    color: '#91929E',
    fontFamily: 'Inter_400Regular',
  },
  selectionInput: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
  stateSelectRow: {
    flexDirection: 'row',
    alignItems: 'center', // Centraliza verticalmente o texto e o ícone
    justifyContent: 'space-between', // Texto à esquerda e Chevron à direita
  },
  dropdownContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 10,
    backgroundColor: '#FCFCFC',
    padding: 8,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000055',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stateList: {
    maxHeight: 180,
    marginTop: 8,
  },
  stateItem: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  stateItemSelected: {
    backgroundColor: '#D8E0F033',
    borderRadius: 8,
  },
  stateItemText: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
  },
  stateDivider: {
    height: 1,
    backgroundColor: '#D8E0F0',
    opacity: 0.7,
  },
});