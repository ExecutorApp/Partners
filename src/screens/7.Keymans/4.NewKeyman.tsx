import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Svg, Path, Rect } from 'react-native-svg';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  onlyDigits,
  maskCPF,
  isValidCPF,
  sanitizeEmail,
  isValidEmail,
  maskWhatsApp,
  validateWhatsApp,
  UF_LIST,
  maskCEP,
  isValidCEP,
  sanitizeCityNeighborhood,
  sanitizeAddress,
  sanitizeNumberField,
  sanitizeComplement,
  capitalizeFirstLetterLive,
  isValidCNPJ,
  formatCompanyNameInput,
} from '../../utils/validators';
import { saveKeymanDraft } from '../../utils/keymanStorage';

type NewKeymanPayload = {
  personType: 'FISICA' | 'JURIDICA';
  // Pessoa Física
  name?: string;
  cpf?: string;
  // Pessoa Jurídica
  companyName?: string; // Razão social
  cnpj?: string;
  responsibleName?: string;
  responsibleCPF?: string;
  // Comuns
  email: string;
  whatsapp: string;
  state: string;
  cep: string;
  city: string;
  neighborhood: string;
  address: string;
  number: string;
  complement?: string;
};

interface NewKeymanProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: NewKeymanPayload) => void;
}

const NewKeyman: React.FC<NewKeymanProps> = ({ visible, onClose, onSave }) => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  // Topo: tipo de pessoa e avatar
  const [personType, setPersonType] = useState<'FISICA' | 'JURIDICA'>('FISICA');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  // Formulário
  const [formData, setFormData] = useState({
    // PF
    name: '',
    cpf: '',
    // PJ
    companyName: '',
    cnpj: '',
    responsibleName: '',
    responsibleCPF: '',
    // Comuns
    email: '',
    whatsapp: '',
    state: '',
    cep: '',
    city: '',
    neighborhood: '',
    address: '',
    number: '',
    complement: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof formData, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Dropdown de Estado com rótulos "UF - Nome" (mesmo padrão do RegistrationData-Personal)
  const BRAZIL_STATES: string[] = useMemo(() => ([
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
  ]), []);
  const UF_NAME_MAP: Record<string, string> = useMemo(() => {
    return BRAZIL_STATES.reduce((acc, label) => {
      const [uf] = label.split(' - ');
      acc[uf] = label;
      return acc;
    }, {} as Record<string, string>);
  }, [BRAZIL_STATES]);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const chevronRotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  const filteredStates = useMemo(
    () => BRAZIL_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase().trim())),
    [BRAZIL_STATES, stateSearch]
  );
  React.useEffect(() => {
    Animated.timing(chevronAnim, { toValue: stateDropdownOpen ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [stateDropdownOpen]);

  // Persistência local: salva rascunho sempre que houver alterações relevantes
  React.useEffect(() => {
    const payload = {
      personType,
      // PF
      name: personType === 'FISICA' ? formData.name : undefined,
      cpf: personType === 'FISICA' ? formData.cpf : undefined,
      // PJ
      companyName: personType === 'JURIDICA' ? formData.companyName : undefined,
      cnpj: personType === 'JURIDICA' ? formData.cnpj : undefined,
      responsibleName: personType === 'JURIDICA' ? formData.responsibleName : undefined,
      responsibleCPF: personType === 'JURIDICA' ? formData.responsibleCPF : undefined,
      // Comuns
      email: formData.email,
      whatsapp: formData.whatsapp,
      state: formData.state,
      cep: formData.cep,
      city: formData.city,
      neighborhood: formData.neighborhood,
      address: formData.address,
      number: formData.number,
      complement: formData.complement || undefined,
      photoUri: avatarUri,
    } as const;
    console.debug('[NewKeyman] persistEffect', { fontsLoaded, personType, payloadPreview: { email: payload.email, state: payload.state, city: payload.city } });
    // Não aguarda; persiste em background
    saveKeymanDraft(payload).catch(() => { /* silencia erros de persistência */ });
  }, [formData, personType, avatarUri, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const collectErrors = (data: typeof formData) => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (personType === 'FISICA') {
      const nameWords = data.name.trim().split(/\s+/).filter(Boolean);
      if (nameWords.length < 2) newErrors.name = 'Informe nome completo (mínimo duas palavras).';
      if (!isValidCPF(data.cpf)) newErrors.cpf = 'CPF inválido.';
    } else {
      const companyWords = data.companyName.trim().split(/\s+/).filter(Boolean);
      if (companyWords.length < 2) newErrors.companyName = 'Informe a razão social completa (mínimo duas palavras).';
      if (!isValidCNPJ(data.cnpj)) newErrors.cnpj = 'CNPJ inválido.';
      const respWords = data.responsibleName.trim().split(/\s+/).filter(Boolean);
      if (respWords.length < 2) newErrors.responsibleName = 'Informe o nome do responsável (mínimo duas palavras).';
      if (!isValidCPF(data.responsibleCPF)) newErrors.responsibleCPF = 'CPF do responsável inválido.';
    }

    if (!isValidEmail(data.email)) newErrors.email = 'Email inválido.';

    const wDigits = onlyDigits(data.whatsapp);
    if (wDigits.length < 10 || !validateWhatsApp(data.whatsapp).valid) newErrors.whatsapp = 'WhatsApp inválido (DDD e comprimento).';

    if (!data.state || !UF_LIST.includes(data.state)) newErrors.state = 'Selecione um estado válido.';

    if (!isValidCEP(data.cep)) newErrors.cep = 'CEP inválido.';
    if (!data.city.trim()) newErrors.city = 'Cidade é obrigatória.';
    if (!data.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório.';
    if (!data.address.trim()) newErrors.address = 'Endereço é obrigatório.';
    if (!data.number.trim()) newErrors.number = 'Número é obrigatório.';
    // Complemento é opcional

    return newErrors;
  };

  const handleCreate = () => {
    setSubmitted(true);
    const newErrors = collectErrors(formData);
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (!hasErrors) {
      const payload: NewKeymanPayload = {
        personType,
        email: formData.email,
        whatsapp: formData.whatsapp,
        state: formData.state,
        cep: formData.cep,
        city: formData.city,
        neighborhood: formData.neighborhood,
        address: formData.address,
        number: formData.number,
        complement: formData.complement || undefined,
      };
      if (personType === 'FISICA') {
        payload.name = formData.name;
        payload.cpf = formData.cpf;
      } else {
        payload.companyName = formData.companyName;
        payload.cnpj = formData.cnpj;
        payload.responsibleName = formData.responsibleName;
        payload.responsibleCPF = formData.responsibleCPF;
      }
      onSave?.(payload);
      onClose();
    }
  };

  const RadioDot: React.FC<{ selected?: boolean }> = ({ selected }) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      {selected ? (
        <>
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
            fill="#1777CF"
          />
          <Path d="M5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10Z" fill="#1777CF" />
        </>
      ) : (
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
          fill="#6F7DA0"
          stroke="#FCFCFC"
        />
      )}
    </Svg>
  );

  const ChevronDownIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M7 10l5 5 5-5" stroke="#7D8592" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const CloseIcon = () => (
    <Svg width={38} height={38} viewBox="0 0 38 38" fill="none">
      <Rect width={38} height={38} rx={8} fill="#F4F4F4" />
      <Rect width={38} height={38} rx={8} stroke="#EDF2F6" />
      <Path d="M25.155 13.2479C24.7959 12.9179 24.2339 12.9173 23.874 13.2466L19 17.7065L14.126 13.2466C13.7661 12.9173 13.2041 12.9179 12.845 13.2479L12.7916 13.297C12.4022 13.6549 12.4029 14.257 12.7931 14.614L17.5863 19L12.7931 23.386C12.4029 23.743 12.4022 24.3451 12.7916 24.703L12.845 24.7521C13.2041 25.0821 13.7661 25.0827 14.126 24.7534L19 20.2935L23.874 24.7534C24.2339 25.0827 24.7959 25.0821 25.155 24.7521L25.2084 24.703C25.5978 24.3451 25.5971 23.743 25.2069 23.386L20.4137 19L25.2069 14.614C25.5971 14.257 25.5978 13.6549 25.2084 13.297L25.155 13.2479Z" fill="#3A3F51" />
    </Svg>
  );

  // Ícone e função de câmera iguais aos usados em RegistrationData-Personal
  const CameraIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
    <View style={{ left: 0, top: 0, position: 'absolute' }}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          {/* filtros conforme arquivo de referência */}
          {/* ids e blends mantidos para compatibilidade visual */}
        </defs>
        <Rect x={5} y={3} width={25} height={24} rx={12} fill="#FCFCFC" />
        <Rect x={5.1} y={3.1} width={24.8} height={23.8} rx={11.9} stroke="#D8E0F0" strokeWidth={0.2} />
        <Path d="M24.0455 11.0571H21.5255C21.4057 11.0571 21.2878 11.0292 21.1823 10.9759C21.0767 10.9226 20.9868 10.8456 20.9204 10.7517L20.1135 9.61063C19.9806 9.42279 19.8007 9.26878 19.5896 9.16226C19.3784 9.05574 19.1427 9 18.9033 9H16.0967C15.8573 9 15.6216 9.05574 15.4104 9.16226C15.1993 9.26878 15.0194 9.42279 14.8865 9.61063L14.0796 10.7517C14.0132 10.8456 13.9233 10.9226 13.8177 10.9759C13.7122 11.0292 13.5943 11.0571 13.4745 11.0571H13.1364V10.7143C13.1364 10.6234 13.0981 10.5361 13.0299 10.4718C12.9617 10.4076 12.8692 10.3714 12.7727 10.3714H11.6818C11.5854 10.3714 11.4929 10.4076 11.4247 10.4718C11.3565 10.5361 11.3182 10.6234 11.3182 10.7143V11.0571H10.9545C10.5688 11.0571 10.1988 11.2016 9.92603 11.4588C9.65325 11.716 9.5 12.0648 9.5 12.4286V19.6286C9.5 19.9923 9.65325 20.3411 9.92603 20.5983C10.1988 20.8555 10.5688 21 10.9545 21H24.0455C24.4312 21 24.8012 20.8555 25.074 20.5983C25.3468 20.3411 25.5 19.9923 25.5 19.6286V12.4286C25.5 12.0648 25.3468 11.716 25.074 11.4588C24.8012 11.2016 24.4312 11.0571 24.0455 11.0571ZM17.5 19.6286C16.6729 19.6286 15.8644 19.3973 15.1767 18.9641C14.489 18.5308 13.953 17.915 13.6365 17.1946C13.32 16.4741 13.2372 15.6813 13.3985 14.9165C13.5599 14.1517 13.9582 13.4491 14.543 12.8977C15.1278 12.3463 15.873 11.9708 16.6842 11.8186C17.4954 11.6665 18.3362 11.7446 19.1003 12.043C19.8644 12.3414 20.5176 12.8468 20.9771 13.4952C21.4366 14.1436 21.6818 14.9059 21.6818 15.6857C21.6818 16.7314 21.2412 17.7343 20.457 18.4737C19.6727 19.2132 18.6091 19.6286 17.5 19.6286Z" fill="#3A3F51" />
        <Path d="M17.5 13.1143C16.9606 13.1143 16.4333 13.2651 15.9848 13.5476C15.5363 13.8302 15.1867 14.2318 14.9803 14.7017C14.7739 15.1715 14.7199 15.6886 14.8251 16.1874C14.9304 16.6862 15.1901 17.1444 15.5715 17.504C15.9529 17.8636 16.4389 18.1085 16.9679 18.2077C17.497 18.307 18.0453 18.256 18.5437 18.0614C19.042 17.8668 19.468 17.5372 19.7676 17.1143C20.0673 16.6915 20.2273 16.1943 20.2273 15.6857C20.2273 15.0037 19.9399 14.3497 19.4285 13.8674C18.917 13.3852 18.2233 13.1143 17.5 13.1143ZM17.5 17.2286C17.0662 17.2281 16.6502 17.0654 16.3434 16.7762C16.0367 16.4869 15.8641 16.0948 15.8636 15.6857C15.8636 15.5948 15.9019 15.5076 15.9701 15.4433C16.0383 15.379 16.1308 15.3429 16.2273 15.3429C16.3237 15.3429 16.4162 15.379 16.4844 15.4433C16.5526 15.5076 16.5909 15.5948 16.5909 15.6857C16.5909 15.913 16.6867 16.1311 16.8572 16.2918C17.0277 16.4526 17.2589 16.5429 17.5 16.5429C17.5964 16.5429 17.6889 16.579 17.7571 16.6433C17.8253 16.7076 17.8636 16.7948 17.8636 16.8857C17.8636 16.9766 17.8253 17.0639 17.7571 17.1282C17.6889 17.1924 17.5964 17.2286 17.5 17.2286Z" fill="#3A3F51" />
      </Svg>
    </View>
  );

  const handleCameraPress = () => {
    // No web, abre o explorador de arquivos para selecionar uma imagem
    if (Platform.OS === 'web') {
      const doc: any = (globalThis as any).document;
      if (!doc) return;
      const input = doc.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            setAvatarUri(dataUrl);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.innerWrapper} activeOpacity={1}>
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Novo Keyman</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Fechar">
                  <CloseIcon />
                </TouchableOpacity>
              </View>

              {/* Topo com avatar e rádios */}
              <View style={styles.topSection}>
                <View style={styles.photoWrapper}>
                  <Image
                    source={avatarUri ? { uri: avatarUri } : require('../../../assets/AvatarPlaceholder02.png')}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.cameraBadge}
                    activeOpacity={0.7}
                    accessibilityLabel="Adicionar foto"
                    onPress={handleCameraPress}
                  >
                    <CameraIcon size={50} />
                  </TouchableOpacity>
                </View>
                <View style={styles.radioGroup}>
                  <TouchableOpacity style={styles.radioRow} onPress={() => setPersonType('FISICA')} accessibilityLabel="Selecionar Física">
                    <RadioDot selected={personType === 'FISICA'} />
                    <Text style={styles.radioLabel}>Fisica</Text>
                  </TouchableOpacity>
                  <View style={styles.radioDivider} />
                  <TouchableOpacity style={styles.radioRow} onPress={() => setPersonType('JURIDICA')} accessibilityLabel="Selecionar Jurídica">
                    <RadioDot selected={personType === 'JURIDICA'} />
                    <Text style={styles.radioLabel}>Jurídica</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 10 }}
              >
                <Text style={styles.sectionTitle}>Dados pessoais:</Text>

                {personType === 'FISICA' ? (
                  <>
                    {/* Nome */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Nome *</Text>
                      <TextInput
                        style={[styles.input, focusedField === 'name' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                        placeholder="Nome completo"
                        placeholderTextColor="#91929E"
                        value={formData.name}
                        onChangeText={(text) => {
                          const formatted = (text || '').replace(/\s+/g, ' ')
                            .split(' ')
                            .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
                            .join(' ');
                          setFormData({ ...formData, name: formatted });
                          const hasTwoWords = formatted.trim().split(/\s+/).length >= 2;
                          setErrors({ ...errors, name: hasTwoWords ? undefined : 'Informe nome completo (mínimo duas palavras).' });
                        }}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => { setFocusedField(null); setTouched({ ...touched, name: true }); }}
                        selectionColor="#1777CF"
                        cursorColor="#1777CF"
                        accessibilityLabel="Campo de nome"
                      />
                      {(errors.name && (submitted || touched.name)) ? (
                        <Text style={styles.errorText}>{errors.name}</Text>
                      ) : null}
                    </View>

                    {/* CPF */}
                    <View style={styles.field}>
                      <Text style={styles.label}>CPF *</Text>
                      <TextInput
                        style={[styles.input, focusedField === 'cpf' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                        value={formData.cpf}
                        onChangeText={(text) => {
                          const masked = maskCPF(text);
                          setFormData({ ...formData, cpf: masked });
                          const valid = isValidCPF(masked);
                          setErrors({ ...errors, cpf: valid || masked.length < 14 ? undefined : 'CPF inválido.' });
                        }}
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                        maxLength={14}
                        placeholderTextColor="#91929E"
                        onFocus={() => setFocusedField('cpf')}
                        onBlur={() => { setFocusedField(null); setTouched({ ...touched, cpf: true }); }}
                        selectionColor="#1777CF"
                        cursorColor="#1777CF"
                        accessibilityLabel="Campo de CPF"
                      />
                      {(errors.cpf && (submitted || touched.cpf)) ? (
                        <Text style={styles.errorText}>{errors.cpf}</Text>
                      ) : null}
                    </View>
                  </>
                ) : (
                  <>
                    {/* Razão social */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Razão social *</Text>
                      <TextInput
                        style={[styles.input, focusedField === 'companyName' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                        placeholder="Nome completo da empresa"
                        placeholderTextColor="#91929E"
                        value={formData.companyName}
                        onChangeText={(text) => {
                          const formatted = formatCompanyNameInput(text);
                          setFormData({ ...formData, companyName: formatted });
                          const hasTwoWords = formatted.trim().split(/\s+/).length >= 2;
                          setErrors({ ...errors, companyName: hasTwoWords ? undefined : 'Informe a razão social completa (mínimo duas palavras).' });
                        }}
                        onFocus={() => setFocusedField('companyName')}
                        onBlur={() => { setFocusedField(null); setTouched({ ...touched, companyName: true }); }}
                        selectionColor="#1777CF"
                        cursorColor="#1777CF"
                        accessibilityLabel="Campo de razão social"
                      />
                      {(errors.companyName && (submitted || touched.companyName)) ? (
                        <Text style={styles.errorText}>{errors.companyName}</Text>
                      ) : null}
                    </View>

                    {/* CNPJ */}
                    <View style={styles.field}>
                      <Text style={styles.label}>CNPJ *</Text>
                      <TextInput
                        style={[styles.input, focusedField === 'cnpj' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                        value={formData.cnpj}
                        onChangeText={(text) => {
                          const digits = onlyDigits(text).slice(0, 14);
                          const p1 = digits.slice(0, 2);
                          const p2 = digits.slice(2, 5);
                          const p3 = digits.slice(5, 8);
                          const p4 = digits.slice(8, 12);
                          const p5 = digits.slice(12, 14);
                          let masked = p1;
                          if (p2) masked += (masked ? '.' : '') + p2;
                          if (p3) masked += (masked ? '.' : '') + p3;
                          if (p4) masked += '/' + p4;
                          if (p5) masked += '-' + p5;
                          setFormData({ ...formData, cnpj: masked });
                          setErrors({ ...errors, cnpj: isValidCNPJ(masked) || masked.length < 18 ? undefined : 'CNPJ inválido.' });
                        }}
                        placeholder="00.000.000/0000-00"
                        keyboardType="numeric"
                        maxLength={18}
                        placeholderTextColor="#91929E"
                        onFocus={() => setFocusedField('cnpj')}
                        onBlur={() => { setFocusedField(null); setTouched({ ...touched, cnpj: true }); }}
                        selectionColor="#1777CF"
                        cursorColor="#1777CF"
                        accessibilityLabel="Campo de CNPJ"
                      />
                      {(errors.cnpj && (submitted || touched.cnpj)) ? (
                        <Text style={styles.errorText}>{errors.cnpj}</Text>
                      ) : null}
                    </View>

                    {/* Nome do responsável */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Nome do responsável *</Text>
                      <TextInput
                        style={[styles.input, focusedField === 'responsibleName' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                        placeholder="Nome completo do responsável"
                        placeholderTextColor="#91929E"
                        value={formData.responsibleName}
                        onChangeText={(text) => {
                          const formatted = (text || '').replace(/\s+/g, ' ')
                            .split(' ')
                            .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
                            .join(' ');
                          setFormData({ ...formData, responsibleName: formatted });
                          const hasTwoWords = formatted.trim().split(/\s+/).length >= 2;
                          setErrors({ ...errors, responsibleName: hasTwoWords ? undefined : 'Informe o nome do responsável (mínimo duas palavras).' });
                        }}
                        onFocus={() => setFocusedField('responsibleName')}
                        onBlur={() => { setFocusedField(null); setTouched({ ...touched, responsibleName: true }); }}
                        selectionColor="#1777CF"
                        cursorColor="#1777CF"
                        accessibilityLabel="Campo de nome do responsável"
                      />
                      {(errors.responsibleName && (submitted || touched.responsibleName)) ? (
                        <Text style={styles.errorText}>{errors.responsibleName}</Text>
                      ) : null}
                    </View>

                    {/* CPF do responsável */}
                    <View style={styles.field}>
                      <Text style={styles.label}>CPF do responsável *</Text>
                      <TextInput
                        style={[styles.input, focusedField === 'responsibleCPF' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                        value={formData.responsibleCPF}
                        onChangeText={(text) => {
                          const masked = maskCPF(text);
                          setFormData({ ...formData, responsibleCPF: masked });
                          const valid = isValidCPF(masked);
                          setErrors({ ...errors, responsibleCPF: valid || masked.length < 14 ? undefined : 'CPF do responsável inválido.' });
                        }}
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                        maxLength={14}
                        placeholderTextColor="#91929E"
                        onFocus={() => setFocusedField('responsibleCPF')}
                        onBlur={() => { setFocusedField(null); setTouched({ ...touched, responsibleCPF: true }); }}
                        selectionColor="#1777CF"
                        cursorColor="#1777CF"
                        accessibilityLabel="Campo de CPF do responsável"
                      />
                      {(errors.responsibleCPF && (submitted || touched.responsibleCPF)) ? (
                        <Text style={styles.errorText}>{errors.responsibleCPF}</Text>
                      ) : null}
                    </View>
                  </>
                )}

                {/* Email */}
                <View style={styles.field}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'email' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.email}
                    onChangeText={(text) => {
                      const cleaned = sanitizeEmail(text);
                      setFormData({ ...formData, email: cleaned });
                      setErrors({ ...errors, email: isValidEmail(cleaned) ? undefined : 'Email inválido.' });
                    }}
                    placeholder="seuemail@teste.com"
                    keyboardType="email-address"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, email: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de email"
                  />
                  {(errors.email && (submitted || touched.email)) ? (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  ) : null}
                </View>

                {/* WhatsApp */}
                <View style={styles.field}>
                  <Text style={styles.label}>WhatsApp *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'whatsapp' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.whatsapp}
                    onChangeText={(text) => {
                      const masked = maskWhatsApp(text);
                      setFormData({ ...formData, whatsapp: masked });
                      const info = validateWhatsApp(masked);
                      setErrors({ ...errors, whatsapp: info.valid || onlyDigits(masked).length < 10 ? undefined : 'WhatsApp inválido (DDD e comprimento).' });
                    }}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    maxLength={15}
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('whatsapp')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, whatsapp: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de WhatsApp"
                  />
                  {(errors.whatsapp && (submitted || touched.whatsapp)) ? (
                    <Text style={styles.errorText}>{errors.whatsapp}</Text>
                  ) : null}
                </View>

                {/* Localização */}
                <Text style={styles.sectionTitle}>Localização:</Text>
                {/* Estado */}
                <View style={styles.field}>
                  <Text style={styles.label}>Estado *</Text>
                  <TouchableOpacity
                    style={[styles.dropdownInput, styles.stateSelectRow, focusedField === 'state' ? styles.inputFocused : null]}
                    onPress={() => { setFocusedField('state'); setStateDropdownOpen((o) => !o); }}
                    accessibilityLabel="Seletor de estado"
                  >
                    <Text style={[styles.dropdownText, !formData.state ? styles.placeholderText : null]}>
                      {formData.state ? (UF_NAME_MAP[formData.state] || formData.state) : 'Selecione um estado'}
                    </Text>
                    <Animated.View style={[styles.dropdownChevron, { transform: [{ rotate: chevronRotate }] }]}> 
                      <ChevronDownIcon />
                    </Animated.View>
                  </TouchableOpacity>

                  <Modal
                    visible={stateDropdownOpen}
                    transparent
                    animationType="fade"
                    onRequestClose={() => { setStateDropdownOpen(false); setTouched({ ...touched, state: true }); }}
                  >
                    <TouchableWithoutFeedback onPress={() => { setStateDropdownOpen(false); setTouched({ ...touched, state: true }); }}>
                      <View style={styles.modalBackdrop} />
                    </TouchableWithoutFeedback>
                    <View style={styles.dropdownModalContainer} pointerEvents="box-none">
                      <View style={styles.dropdownContainer}>
                        <TextInput
                          style={[styles.input, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                          placeholder="Buscar estado"
                          placeholderTextColor="#91929E"
                          value={stateSearch}
                          onChangeText={setStateSearch}
                        />
                        <ScrollView style={styles.stateList}>
                          {filteredStates.map((label) => (
                            <View key={label}>
                              <TouchableOpacity
                                style={[styles.stateItem, (UF_NAME_MAP[formData.state] === label) && styles.stateItemSelected]}
                                onPress={() => {
                                  const uf = label.split(' - ')[0];
                                  setFormData({ ...formData, state: uf });
                                  setErrors({ ...errors, state: undefined });
                                  setStateSearch('');
                                  setStateDropdownOpen(false);
                                  setFocusedField(null);
                                  setTouched({ ...touched, state: true });
                                }}
                                accessibilityLabel={`Selecionar estado ${label}`}
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
                  {(errors.state && (submitted || touched.state)) ? (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  ) : null}
                </View>

                {/* CEP */}
                <View style={styles.field}>
                  <Text style={styles.label}>CEP *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'cep' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.cep}
                    onChangeText={(text) => {
                      const masked = maskCEP(text);
                      setFormData({ ...formData, cep: masked });
                      const valid = isValidCEP(masked);
                      setErrors({ ...errors, cep: valid ? undefined : 'CEP inválido.' });
                    }}
                    placeholder="00000-000"
                    keyboardType="numeric"
                    maxLength={9}
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('cep')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, cep: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de CEP"
                  />
                  {(errors.cep && (submitted || touched.cep)) ? (
                    <Text style={styles.errorText}>{errors.cep}</Text>
                  ) : null}
                </View>

                {/* Cidade */}
                <View style={styles.field}>
                  <Text style={styles.label}>Cidade *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'city' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.city}
                    onChangeText={(text) => {
                      const sanitized = sanitizeCityNeighborhood(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, city: cleaned });
                      setErrors({ ...errors, city: cleaned.trim() ? undefined : 'Cidade é obrigatória.' });
                    }}
                    placeholder="Digite o nome da cidade"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, city: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de cidade"
                  />
                  {(errors.city && (submitted || touched.city)) ? (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  ) : null}
                </View>

                {/* Bairro */}
                <View style={styles.field}>
                  <Text style={styles.label}>Bairro *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'neighborhood' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.neighborhood}
                    onChangeText={(text) => {
                      const sanitized = sanitizeCityNeighborhood(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, neighborhood: cleaned });
                      setErrors({ ...errors, neighborhood: cleaned.trim() ? undefined : 'Bairro é obrigatório.' });
                    }}
                    placeholder="Digite o nome do bairro"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('neighborhood')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, neighborhood: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de bairro"
                  />
                  {(errors.neighborhood && (submitted || touched.neighborhood)) ? (
                    <Text style={styles.errorText}>{errors.neighborhood}</Text>
                  ) : null}
                </View>

                {/* Endereço */}
                <View style={styles.field}>
                  <Text style={styles.label}>Endereço *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'address' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.address}
                    onChangeText={(text) => {
                      const sanitized = sanitizeAddress(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, address: cleaned });
                      setErrors({ ...errors, address: cleaned.trim() ? undefined : 'Endereço é obrigatório.' });
                    }}
                    placeholder="Digite o endereço"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, address: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de endereço"
                  />
                  {(errors.address && (submitted || touched.address)) ? (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  ) : null}
                </View>

                {/* Número */}
                <View style={styles.field}>
                  <Text style={styles.label}>Número *</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'number' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.number}
                    onChangeText={(text) => {
                      const cleaned = sanitizeNumberField(text, 6);
                      setFormData({ ...formData, number: cleaned });
                      setErrors({ ...errors, number: cleaned.trim() ? undefined : 'Número é obrigatório.' });
                    }}
                    placeholder="Número"
                    keyboardType="numeric"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('number')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, number: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de número"
                  />
                  {(errors.number && (submitted || touched.number)) ? (
                    <Text style={styles.errorText}>{errors.number}</Text>
                  ) : null}
                </View>

                {/* Complemento */}
                <View style={styles.field}>
                  <Text style={styles.label}>Complemento</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'complement' ? styles.inputFocused : null, Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null]}
                    value={formData.complement}
                    onChangeText={(text) => {
                      const sanitized = sanitizeComplement(text);
                      const cleaned = capitalizeFirstLetterLive(sanitized);
                      setFormData({ ...formData, complement: cleaned });
                    }}
                    placeholder="Apartamento, bloco, referência"
                    placeholderTextColor="#91929E"
                    onFocus={() => setFocusedField('complement')}
                    onBlur={() => { setFocusedField(null); setTouched({ ...touched, complement: true }); }}
                    selectionColor="#1777CF"
                    cursorColor="#1777CF"
                    accessibilityLabel="Campo de complemento"
                  />
                </View>

              </ScrollView>

              <View style={styles.actionsBar}>
                <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
                  <Text style={styles.primaryButtonText}>Criar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Overlay ocupa toda a tela; margem de 10px será aplicada via container absoluto
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  // Container absoluto para manter 10px de margem em todos os lados
  container: { position: 'absolute', left: 10, right: 10, top: 10, bottom: 10 },
  // Wrapper interno para garantir que o conteúdo ocupe toda a altura do container
  innerWrapper: { flex: 1 },
  // Conteúdo ocupa todo o espaço disponível e permite barra de ações fixa
  content: { flex: 1, position: 'relative', backgroundColor: '#FCFCFC', borderRadius: 12, padding: 20, paddingBottom: 70, elevation: 8, overflow: 'visible' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  closeButton: { padding: 4 },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#3A3F51' },
  topSection: { flexDirection: 'row', alignItems: 'center', gap: 25, paddingLeft: 3, marginBottom: 25 },
  photoWrapper: { position: 'relative', width: 65, height: 80 },
  avatarImage: { width: 65, height: 80, borderRadius: 8 },
  cameraBadge: { position: 'absolute', left: 42, top: 60 },
  radioGroup: { flex: 1, gap: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioLabel: { fontSize: 16, color: '#3A3F51', fontFamily: 'Inter_400Regular' },
  radioDivider: { height: 1, backgroundColor: '#D8E0F0', marginVertical: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#3A3F51', marginTop: 20, marginBottom: 10 },
  field: { marginBottom: 20 },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#7D8592', marginBottom: 5, paddingLeft: 5 },
  input: { borderWidth: 1, borderColor: '#D8E0F0', borderRadius: 8, paddingHorizontal: 12, height: 38, fontSize: 14, fontFamily: 'Inter_400Regular', color: '#3A3F51' },
  inputFocused: { borderColor: '#1777CF' },
  placeholderText: { color: '#91929E', fontFamily: 'Inter_500Medium' },
  // Mensagens de alerta dos campos
  errorText: { color: '#D82B2B', paddingLeft: 5 },
  // Dropdown
  dropdownInput: { borderWidth: 1, borderColor: '#D8E0F0', borderRadius: 8, paddingHorizontal: 12, height: 38, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' },
  dropdownText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#3A3F51' },
  stateSelectRow: { paddingVertical: 6 },
  dropdownChevron: { marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  dropdownModalContainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  dropdownContainer: { width: '90%', maxWidth: 420, backgroundColor: '#FCFCFC', borderRadius: 10, padding: 12, borderColor: '#D8E0F0', borderWidth: 1 },
  stateList: { maxHeight: 240, marginTop: 8, },

  stateItem: { paddingVertical: 10, paddingHorizontal: 8 },
  stateItemSelected: { backgroundColor: '#FCFCFC' },
  stateItemText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#3A3F51' },
  stateDivider: { height: 0.5, backgroundColor: '#D8E0F0' },
  
  // Ações
  // Barra de ações fixa/flutuante no rodapé do modal
  actionsBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    zIndex: 10,
  },
  secondaryButton: { 
    flex: 1, 
    minWidth: 0, 
    borderWidth: 1, 
    borderColor: '#D8E0F0', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 10,
    alignItems: 'center' },
    
  secondaryButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#7D8592', textAlign: 'center' },
  primaryButton: { 
  flex: 1, 
  minWidth: 0, 
  backgroundColor: '#1777CF', 
  borderRadius: 8, 
  paddingHorizontal: 16, 
  paddingVertical: 10,
  alignItems: 'center' },

  primaryButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#FCFCFC', textAlign: 'center' },
});

export default NewKeyman;