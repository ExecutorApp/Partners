import React, { useImperativeHandle, useState, forwardRef, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Image, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
// Importa utilitários já usados em 7.Keymans/4.NewKeyman.tsx para manter comportamento consistente
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
  formatCompanyNameInput,
  capitalizeFirstLetter,
  capitalizeFirstLetterLive,
  isValidCNPJ,
  formatNameInput,
} from '../../utils/validators';
// Importa o arquivo de referência (não renderizado diretamente pois é um Modal completo)
// Mantemos a importação para sinalizar reutilização de lógica/visual do módulo existente
import NewKeyman from '../../screens/7.Keymans/4.NewKeyman';

type CreateContactPayload = {
  id: string;
  personType: 'FISICA' | 'JURIDICA';
  // PF
  name?: string;
  cpf?: string;
  // PJ
  companyName?: string;
  cnpj?: string;
  responsibleName?: string;
  responsibleCPF?: string;
  // comuns
  email: string;
  whatsapp: string;
  state: string;
  cep: string;
  city: string;
  neighborhood: string;
  address: string;
  number: string;
  complement?: string;
  photoUri?: string | null;
};

interface CreateContactProps {
  onSaved?: (data: CreateContactPayload) => void;
  onValidityChange?: (valid: boolean) => void;
}

// Ícone de rádio idêntico ao usado em 7.Keymans/4.NewKeyman.tsx
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

// Ícone de câmera idêntico ao usado em 7.Keymans/4.NewKeyman.tsx
const CameraIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <View style={{ left: 0, top: 0, position: 'absolute' }}>
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Rect x={5} y={3} width={25} height={24} rx={12} fill="#FCFCFC" />
      <Rect x={5.1} y={3.1} width={24.8} height={23.8} rx={11.9} stroke="#D8E0F0" strokeWidth={0.2} />
      <Path d="M24.0455 11.0571H21.5255C21.4057 11.0571 21.2878 11.0292 21.1823 10.9759C21.0767 10.9226 20.9868 10.8456 20.9204 10.7517L20.1135 9.61063C19.9806 9.42279 19.8007 9.26878 19.5896 9.16226C19.3784 9.05574 19.1427 9 18.9033 9H16.0967C15.8573 9 15.6216 9.05574 15.4104 9.16226C15.1993 9.26878 15.0194 9.42279 14.8865 9.61063L14.0796 10.7517C14.0132 10.8456 13.9233 10.9226 13.8177 10.9759C13.7122 11.0292 13.5943 11.0571 13.4745 11.0571H13.1364V10.7143C13.1364 10.6234 13.0981 10.5361 13.0299 10.4718C12.9617 10.4076 12.8692 10.3714 12.7727 10.3714H11.6818C11.5854 10.3714 11.4929 10.4076 11.4247 10.4718C11.3565 10.5361 11.3182 10.6234 11.3182 10.7143V11.0571H10.9545C10.5688 11.0571 10.1988 11.2016 9.92603 11.4588C9.65325 11.716 9.5 12.0648 9.5 12.4286V19.6286C9.5 19.9923 9.65325 20.3411 9.92603 20.5983C10.1988 20.8555 10.5688 21 10.9545 21H24.0455C24.4312 21 24.8012 20.8555 25.074 20.5983C25.3468 20.3411 25.5 19.9923 25.5 19.6286V12.4286C25.5 12.0648 25.3468 11.716 25.074 11.4588C24.8012 11.2016 24.4312 11.0571 24.0455 11.0571ZM17.5 19.6286C16.6729 19.6286 15.8644 19.3973 15.1767 18.9641C14.489 18.5308 13.953 17.915 13.6365 17.1946C13.32 16.4741 13.2372 15.6813 13.3985 14.9165C13.5599 14.1517 13.9582 13.4491 14.543 12.8977C15.1278 12.3463 15.873 11.9708 16.6842 11.8186C17.4954 11.6665 18.3362 11.7446 19.1003 12.043C19.8644 12.3414 20.5176 12.8468 20.9771 13.4952C21.4366 14.1436 21.6818 14.9059 21.6818 15.6857C21.6818 16.7314 21.2412 17.7343 20.457 18.4737C19.6727 19.2132 18.6091 19.6286 17.5 19.6286Z" fill="#3A3F51" />
      <Path d="M17.5 13.1143C16.9606 13.1143 16.4333 13.2651 15.9848 13.5476C15.5363 13.8302 15.1867 14.2318 14.9803 14.7017C14.7739 15.1715 14.7199 15.6886 14.8251 16.1874C14.9304 16.6862 15.1901 17.1444 15.5715 17.504C15.9529 17.8636 16.4389 18.1085 16.9679 18.2077C17.497 18.307 18.0453 18.256 18.5437 18.0614C19.042 17.8668 19.468 17.5372 19.7676 17.1143C20.0673 16.6915 20.2273 16.1943 20.2273 15.6857C20.2273 15.0037 19.9399 14.3497 19.4285 13.8674C18.917 13.3852 18.2233 13.1143 17.5 13.1143ZM17.5 17.2286C17.0662 17.2281 16.6502 17.0654 16.3434 16.7762C16.0367 16.4869 15.8641 16.0948 15.8636 15.6857C15.8636 15.5948 15.9019 15.5076 15.9701 15.4433C16.0383 15.379 16.1308 15.3429 16.2273 15.3429C16.3237 15.3429 16.4162 15.379 16.4844 15.4433C16.5526 15.5076 16.5909 15.5948 16.5909 15.6857C16.5909 15.913 16.6867 16.1311 16.8572 16.2918C17.0277 16.4526 17.2589 16.5429 17.5 16.5429C17.5964 16.5429 17.6889 16.579 17.7571 16.6433C17.8253 16.7076 17.8636 16.7948 17.8636 16.8857C17.8636 16.9766 17.8253 17.0639 17.7571 17.1282C17.6889 17.1924 17.5964 17.2286 17.5 17.2286Z" fill="#3A3F51" />
    </Svg>
  </View>
);

// Ícone de seta (direita) usado no dropdown de Estado
const ArrowRightIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 8, height = 12, color = '#7D8592' }) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 8 12" fill="none">
    <Path d="M-5.72205e-06 1.4L1.39999 0L7.39999 6L1.39999 12L-5.72205e-06 10.6L4.59999 6L-5.72205e-06 1.4Z" fill={color} />
  </Svg>
);

// Campo de formulário em nível de módulo para estabilidade de foco no RN Web
interface FormFieldProps {
  name?: string;
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlurValidate?: (name: string, value: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: any;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  containerStyle?: any;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  value,
  onChangeText,
  onBlurValidate,
  placeholder,
  error,
  keyboardType,
  maxLength,
  autoCapitalize,
  containerStyle,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<TextInput | null>(null);
  // Web: listeners para seleção (dbl-click palavra, triple-click tudo) e estilo da seleção
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const doc: any = (globalThis as any).document;
    const el: any = inputRef.current as any;
    if (!doc || !el) return;

    // Injeta estilo de seleção seguindo o DS (uma vez)
    const STYLE_ID = 'partners-selection-style';
    if (!doc.getElementById(STYLE_ID)) {
      const style = doc.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        input[data-sel="partners"]::selection { background: rgba(23, 119, 207, 0.22); color: #3A3F51; }
        textarea[data-sel="partners"]::selection { background: rgba(23, 119, 207, 0.22); color: #3A3F51; }
        ::-moz-selection { background: rgba(23, 119, 207, 0.22); color: #3A3F51; }
      `;
      doc.head.appendChild(style);
    }
    // Atribui atributo para regra de seleção
    try { (el as any).setAttribute?.('data-sel', 'partners'); } catch {}

    // Util para selecionar intervalo
    const setSelection = (start: number, end: number) => {
      const len = String(el.value ?? '').length;
      const s = Math.max(0, Math.min(start, len));
      const e = Math.max(s, Math.min(end, len));
      inputRef.current?.setNativeProps({ selection: { start: s, end: e } });
    };
    // Selecionar palavra ao redor do caret
    const selectWordAtCaret = () => {
      const text: string = String(el.value ?? '');
      let pos: number = Number(el.selectionStart ?? 0);
      const isWord = (ch: string) => /[A-Za-zÀ-ÿ0-9_]/.test(ch);
      // Se já há seleção, usa o início
      if (typeof el.selectionStart === 'number') pos = el.selectionStart;
      let left = pos;
      let right = pos;
      while (left - 1 >= 0 && isWord(text[left - 1])) left--;
      while (right < text.length && isWord(text[right])) right++;
      setSelection(left, right);
    };

    let clickCount = 0;
    let lastClick = 0;
    const CLICK_MS = 600;
    const onClick = () => {
      const now = Date.now();
      clickCount = (now - lastClick) <= CLICK_MS ? clickCount + 1 : 1;
      lastClick = now;
      if (clickCount === 3) {
        setSelection(0, String(el.value ?? '').length);
        clickCount = 0;
      }
    };
    const onDblClick = () => selectWordAtCaret();

    el.addEventListener?.('click', onClick);
    el.addEventListener?.('dblclick', onDblClick);
    return () => {
      el.removeEventListener?.('click', onClick);
      el.removeEventListener?.('dblclick', onDblClick);
    };
  }, []);
  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={styles.label} selectable>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          isFocused ? styles.inputFocused : null,
          Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0, caretColor: '#1777CF' } as any) : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={(e) => {
          const ev: any = e.nativeEvent as any;
          if (Platform.OS === 'web' && (ev.ctrlKey || ev.metaKey) && (ev.key === 'a' || ev.key === 'A')) {
            const len = String(value ?? '').length;
            inputRef.current?.setNativeProps({ selection: { start: 0, end: len } });
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (onBlurValidate && name) onBlurValidate(name, value);
        }}
        placeholder={placeholder}
        placeholderTextColor="#91929E"
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

export type CreateContactRef = {
  validateAndGetPayload: () => CreateContactPayload | null;
};

const CreateContact = forwardRef<CreateContactRef, CreateContactProps>(({ onSaved, onValidityChange }, ref) => {
  const [personType, setPersonType] = useState<'FISICA' | 'JURIDICA'>('FISICA');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const [form, setForm] = useState({
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

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [dirty, setDirty] = useState<Partial<Record<keyof typeof form, boolean>>>({});

  // Dropdown de Estado (mesmo padrão visual/funcional de 7.Keymans/4.NewKeyman.tsx)
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
  // Fechado: direita (0deg). Aberto: baixo (90deg).
  const chevronRotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const filteredStates = useMemo(
    () => BRAZIL_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase().trim())),
    [BRAZIL_STATES, stateSearch]
  );
  useEffect(() => {
    Animated.timing(chevronAnim, { toValue: stateDropdownOpen ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [stateDropdownOpen]);

  // (Field foi extraído para nível de módulo como FormField)

  // Função reutilizável para construir erros (DRY)
  const computeErrors = (data: typeof form, currentType: typeof personType): Partial<Record<keyof typeof form, string>> => {
    const next: Partial<Record<keyof typeof form, string>> = {};
    if (currentType === 'FISICA') {
      const words = (data.name || '').trim().split(/\s+/).filter(Boolean);
      if (words.length < 2) next.name = 'Informe nome completo (mínimo duas palavras).';
      if (!isValidCPF(data.cpf)) next.cpf = 'CPF inválido.';
    } else {
      const words = (data.companyName || '').trim().split(/\s+/).filter(Boolean);
      if (words.length < 2) next.companyName = 'Informe a razão social completa (mínimo duas palavras).';
      if (!isValidCNPJ(data.cnpj)) next.cnpj = 'CNPJ inválido.';
      const respWords = (data.responsibleName || '').trim().split(/\s+/).filter(Boolean);
      if (respWords.length < 2) next.responsibleName = 'Informe o nome do responsável (mínimo duas palavras).';
      if (!isValidCPF(data.responsibleCPF)) next.responsibleCPF = 'CPF do responsável inválido.';
    }
    if (!isValidEmail(data.email)) next.email = 'Email inválido.';
    const wInfo = validateWhatsApp(data.whatsapp);
    if (!wInfo.valid) next.whatsapp = 'WhatsApp inválido (DDD e comprimento).';
    if (!data.state || !UF_LIST.includes(data.state)) next.state = 'Selecione um estado válido (UF).';
    if (!isValidCEP(data.cep)) next.cep = 'CEP inválido.';
    if (!data.city.trim()) next.city = 'Cidade é obrigatória.';
    if (!data.neighborhood.trim()) next.neighborhood = 'Bairro é obrigatório.';
    if (!data.address.trim()) next.address = 'Endereço é obrigatório.';
    if (!data.number.trim()) next.number = 'Número é obrigatório.';
    return next;
  };

  // Valida um campo específico somente quando o usuário já digitou (dirty)
  const validateFieldOnBlur = (field: keyof typeof form) => {
    if (!dirty[field]) return;
    const next = computeErrors(form, personType);
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  };

  const validateAll = (): boolean => {
    const next = computeErrors(form, personType);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validateAll()) return;
    const payload: CreateContactPayload = {
      id: `new_${Date.now()}`,
      personType,
      photoUri: avatarUri,
      // PF/PJ
      name: form.name,
      cpf: form.cpf,
      companyName: form.companyName,
      cnpj: form.cnpj,
      responsibleName: form.responsibleName,
      responsibleCPF: form.responsibleCPF,
      // Comuns
      email: sanitizeEmail(form.email),
      whatsapp: form.whatsapp,
      state: form.state,
      cep: form.cep,
      city: form.city,
      neighborhood: form.neighborhood,
      address: form.address,
      number: form.number,
      complement: form.complement,
    };
    onSaved?.(payload);
    return payload;
  };

  // Validação leve para habilitar/desabilitar o botão Próximo na aba "Criar contato"
  const isFormValid = (): boolean => {
    const data = form;
    if (personType === 'FISICA') {
      const words = (data.name || '').trim().split(/\s+/).filter(Boolean);
      if (words.length < 2 || !isValidCPF(data.cpf)) return false;
    } else {
      const companyWords = (data.companyName || '').trim().split(/\s+/).filter(Boolean);
      if (companyWords.length < 2 || !isValidCNPJ(data.cnpj)) return false;
      const respWords = (data.responsibleName || '').trim().split(/\s+/).filter(Boolean);
      if (respWords.length < 2 || !isValidCPF(data.responsibleCPF)) return false;
    }
    if (!isValidEmail(data.email)) return false;
    if (!validateWhatsApp(data.whatsapp).valid) return false;
    if (!data.state || !UF_LIST.includes(data.state)) return false;
    if (!isValidCEP(data.cep)) return false;
    if (!data.city.trim()) return false;
    if (!data.neighborhood.trim()) return false;
    if (!data.address.trim()) return false;
    if (!data.number.trim()) return false;
    return true;
  };

  useEffect(() => {
    onValidityChange?.(isFormValid());
  }, [form, personType]);

  const handleCameraPress = () => {
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
          reader.onload = () => setAvatarUri(reader.result as string);
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  useImperativeHandle(ref, () => ({
    validateAndGetPayload: () => {
      if (!validateAll()) return null;
      const payload: CreateContactPayload = {
        id: `new_${Date.now()}`,
        personType,
        photoUri: avatarUri,
        name: form.name,
        cpf: form.cpf,
        companyName: form.companyName,
        cnpj: form.cnpj,
        responsibleName: form.responsibleName,
        responsibleCPF: form.responsibleCPF,
        email: sanitizeEmail(form.email),
        whatsapp: form.whatsapp,
        state: form.state,
        cep: form.cep,
        city: form.city,
        neighborhood: form.neighborhood,
        address: form.address,
        number: form.number,
        complement: form.complement,
      };
      onSaved?.(payload);
      return payload;
    },
  }));

  return (
    <View style={styles.container}>
      {/* Topo base (avatar + tipo de pessoa) */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={avatarUri ? { uri: avatarUri } : require('../../../assets/AvatarPlaceholder02.png')}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.cameraBadge} onPress={handleCameraPress} accessibilityLabel="Adicionar foto">
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

      {/* Formulário */}
      <ScrollView
        style={styles.form}
        contentContainerStyle={{ paddingBottom: 0 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {personType === 'FISICA' ? (
          <>
            <FormField
              name="name"
              label="Nome completo *"
              value={form.name}
              onChangeText={(t) => {
                setForm({ ...form, name: formatNameInput(t) });
                setDirty((prev) => ({ ...prev, name: true }));
              }}
              onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
              placeholder="Nome completo"
              error={errors.name}
            />
            <FormField
              name="cpf"
              label="CPF *"
              value={form.cpf}
              onChangeText={(t) => {
                setForm({ ...form, cpf: maskCPF(t) });
                setDirty((prev) => ({ ...prev, cpf: true }));
              }}
              onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
              error={errors.cpf}
            />
          </>
        ) : (
          <>
            <FormField
              name="companyName"
              label="Razão social *"
              value={form.companyName}
              onChangeText={(t) => {
                setForm({ ...form, companyName: formatCompanyNameInput(t) });
                setDirty((prev) => ({ ...prev, companyName: true }));
              }}
              onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
              placeholder="Nome completo da empresa"
              error={errors.companyName}
            />
            <FormField
              name="cnpj"
              label="CNPJ *"
              value={form.cnpj}
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
                setForm({ ...form, cnpj: masked });
                setDirty((prev) => ({ ...prev, cnpj: true }));
              }}
              onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
              placeholder="00.000.000/0000-00"
              keyboardType="numeric"
              maxLength={18}
              error={errors.cnpj}
            />
            <FormField
              name="responsibleName"
              label="Nome do responsável *"
              value={form.responsibleName}
              onChangeText={(t) => {
                setForm({ ...form, responsibleName: formatNameInput(t) });
                setDirty((prev) => ({ ...prev, responsibleName: true }));
              }}
              onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
              placeholder="Nome completo do responsável"
              error={errors.responsibleName}
            />
            <FormField
              name="responsibleCPF"
              label="CPF do responsável *"
              value={form.responsibleCPF}
              onChangeText={(t) => {
                setForm({ ...form, responsibleCPF: maskCPF(t) });
                setDirty((prev) => ({ ...prev, responsibleCPF: true }));
              }}
              onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
              error={errors.responsibleCPF}
            />
          </>
        )}

        <FormField
          name="email"
          label="Email *"
          value={form.email}
          onChangeText={(t) => {
            setForm({ ...form, email: sanitizeEmail(t) });
            setDirty((prev) => ({ ...prev, email: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="seuemail@teste.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <FormField
          name="whatsapp"
          label="WhatsApp *"
          value={form.whatsapp}
          onChangeText={(t) => {
            setForm({ ...form, whatsapp: maskWhatsApp(t) });
            setDirty((prev) => ({ ...prev, whatsapp: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          maxLength={15}
          error={errors.whatsapp}
        />

        {/* Localização: Estado com dropdown em uma linha e CEP abaixo */}
        <View style={styles.field}>
          <Text style={styles.label} selectable>Estado *</Text>
          <TouchableOpacity
            style={[
              styles.input,
              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
              Platform.OS === 'web' ? ({ outlineStyle: 'none', outlineWidth: 0 } as any) : null,
            ]}
            onPress={() => setStateDropdownOpen(true)}
            accessibilityLabel="Selecionar estado"
          >
            <Text style={{ color: form.state ? '#3A3F51' : '#91929E', fontFamily: 'Inter_400Regular', fontSize: 14 }}>
              {form.state ? (UF_NAME_MAP[form.state] || form.state) : 'Selecione o estado'}
            </Text>
            <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
              <ArrowRightIcon width={8} height={12} color="#7D8592" />
            </Animated.View>
          </TouchableOpacity>
          {errors.state ? <Text style={styles.error}>{errors.state}</Text> : null}
          <Modal visible={stateDropdownOpen} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setStateDropdownOpen(false)}>
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
                <ScrollView style={styles.stateList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
                  {filteredStates.map((label) => (
                    <View key={label}>
                      <TouchableOpacity
                        style={[styles.stateItem, (UF_NAME_MAP[form.state] === label) && styles.stateItemSelected]}
                        onPress={() => {
                          const uf = label.split(' - ')[0];
                          setForm({ ...form, state: uf });
                          setErrors({ ...errors, state: undefined });
                          setStateSearch('');
                          setStateDropdownOpen(false);
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
        </View>

        <FormField
          name="cep"
          label="CEP *"
          value={form.cep}
          onChangeText={(t) => {
            setForm({ ...form, cep: maskCEP(t) });
            setDirty((prev) => ({ ...prev, cep: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="00000-000"
          keyboardType="numeric"
          maxLength={9}
          error={errors.cep}
        />

        <FormField
          name="city"
          label="Cidade *"
          value={form.city}
          onChangeText={(t) => {
            setForm({ ...form, city: sanitizeCityNeighborhood(capitalizeFirstLetterLive(t)) });
            setDirty((prev) => ({ ...prev, city: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="Cidade"
          error={errors.city}
        />

        <FormField
          name="neighborhood"
          label="Bairro *"
          value={form.neighborhood}
          onChangeText={(t) => {
            setForm({ ...form, neighborhood: sanitizeCityNeighborhood(capitalizeFirstLetterLive(t)) });
            setDirty((prev) => ({ ...prev, neighborhood: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="Bairro"
          error={errors.neighborhood}
        />
        {/* Endereço em uma linha, número em linha separada (não lado a lado) */}
        <FormField
          name="address"
          label="Endereço *"
          value={form.address}
          onChangeText={(t) => {
            setForm({ ...form, address: sanitizeAddress(capitalizeFirstLetterLive(t)) });
            setDirty((prev) => ({ ...prev, address: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="Digite o endereço"
          error={errors.address}
        />
        <FormField
          name="number"
          label="Número *"
          value={form.number}
          onChangeText={(t) => {
            setForm({ ...form, number: sanitizeNumberField(t, 6) });
            setDirty((prev) => ({ ...prev, number: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="Número"
          keyboardType="numeric"
          maxLength={6}
          error={errors.number}
        />

        <FormField
          name="complement"
          label="Complemento"
          value={form.complement}
          onChangeText={(t) => {
            setForm({ ...form, complement: sanitizeComplement(capitalizeFirstLetterLive(t)) });
            setDirty((prev) => ({ ...prev, complement: true }));
          }}
          onBlurValidate={(n) => validateFieldOnBlur(n as keyof typeof form)}
          placeholder="Apto, bloco, referência"
          error={errors.complement}
        />

      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 20,
    backgroundColor: 'transparent',
    flex: 1,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 },
  avatarWrap: { width: 65, height: 80, position: 'relative' },
  avatar: { width: 65, height: 80, borderRadius: 8, backgroundColor: '#F4F4F4' },
  cameraBadge: { position: 'absolute', left: 42, top: 60 },
  radioGroup: { flex: 1, gap: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioLabel: { fontSize: 16, color: '#3A3F51', fontFamily: 'Inter_400Regular' },
  radioDivider: { height: 1, backgroundColor: '#D8E0F0', marginVertical: 4 },
  form: { flex: 1 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, color: '#7D8592', fontFamily: 'Inter_500Medium', marginBottom: 6, paddingLeft: 4 },
  input: {
    height: 38,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
  },
  inputFocused: { borderColor: '#1777CF' },
  error: { color: '#CF3C3C', fontSize: 13, marginTop: 4, paddingLeft: 6 },
  fieldRow2: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  fieldHalf: { flex: 1 },
  fieldTwoThirds: { flex: 2 },
  fieldOneThird: { flex: 1 },
  // Dropdown de estado (mesmo padrão do NewKeyman)
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  dropdownModalContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  dropdownContainer: { width: 360, maxWidth: '90%', backgroundColor: '#FCFCFC', borderRadius: 10, borderWidth: 1, borderColor: '#D8E0F0', padding: 12 },
  stateList: { maxHeight: 240, marginTop: 10 },
  stateItem: { paddingVertical: 8 },
  stateItemSelected: { backgroundColor: '#E8F2FB', borderRadius: 6 },
  stateItemText: { fontSize: 14, color: '#3A3F51', fontFamily: 'Inter_400Regular', paddingHorizontal: 6 },
  stateDivider: { height: 1, backgroundColor: '#E5E7EB' },
});

export default CreateContact;