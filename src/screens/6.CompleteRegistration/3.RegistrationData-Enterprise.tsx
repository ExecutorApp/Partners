import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  UF_LIST,
  formatCompanyNameInput,
  maskCEP,
  isValidCEP,
  sanitizeCityNeighborhood,
  sanitizeAddress,
  sanitizeNumberField,
  sanitizeComplement,
  capitalizeFirstLetter,
  capitalizeFirstLetterLive,
  onlyDigits,
} from '../../utils/validators';
import { RegistrationStorage } from '../../utils/registrationStorage';

export type EnterpriseRef = {
  save: () => boolean;
};

// Máscara de CNPJ: 00.000.000/0000-00
function maskCNPJ(input: string): string {
  const digits = onlyDigits(input).slice(0, 14);
  const p1 = digits.slice(0, 2);
  const p2 = digits.slice(2, 5);
  const p3 = digits.slice(5, 8);
  const p4 = digits.slice(8, 12);
  const p5 = digits.slice(12, 14);
  let out = p1;
  if (p2) out += (out ? '.' : '') + p2;
  if (p3) out += (out ? '.' : '') + p3;
  if (p4) out += '/' + p4;
  if (p5) out += '-' + p5;
  return out;
}

// Validação de CNPJ (algoritmo dos dígitos verificadores)
function isValidCNPJ(cnpjText: string): boolean {
  const cnpj = onlyDigits(cnpjText);
  if (cnpj.length !== 14) return false;
  if (/^([0-9])\1{13}$/.test(cnpj)) return false; // rejeita sequências
  const calcDV = (base: string, weights: number[]) => {
    const sum = base.split('').reduce((acc, cur, idx) => acc + parseInt(cur, 10) * weights[idx], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const dv1 = calcDV(cnpj.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]);
  if (dv1 !== parseInt(cnpj.charAt(12), 10)) return false;
  const dv2 = calcDV(cnpj.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]);
  return dv2 === parseInt(cnpj.charAt(13), 10);
}

// Ícone Dropdown (Chevron) — idêntico ao usado na tela pessoal
const ChevronDownIcon = () => (
  <Svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <Path d="M1.4 -5.72205e-06L0 1.39999L6 7.39999L12 1.39999L10.6 -5.72205e-06L6 4.59999L1.4 -5.72205e-06Z" fill="#7D8592"/>
  </Svg>
);

const RadioIcon = ({ selected }: { selected: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
      fill={selected ? '#1777CF' : '#6F7DA0'}
      stroke="#FCFCFC"
    />
    {selected ? <Circle cx={10} cy={10} r={5} fill="#1777CF"/> : null}
  </Svg>
);

const localStyles = StyleSheet.create({
  sameAddressBlock: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
  },
  questionText: {
    color: '#3A3F51',
    fontSize: 14,
    fontWeight: '400',
  },
  optionsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
    marginTop: 5,
    marginBottom: 5,
  },
  option: {
    flex: 1,
    paddingLeft: 39,
    paddingRight: 39,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    flexDirection: 'row',
  },
  optionSelected: {
    borderWidth: 0.5,
    borderColor: '#1777CF',
  },
  optionUnselected: {
    borderWidth: 1,
    borderColor: '#D8E0F0',
  },
  optionLabel: {
    color: '#3A3F51',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    alignSelf: 'stretch',
    height: 0,
    borderTopWidth: 0.5,
    borderTopColor: '#D8E0F0',
    marginTop: 10,
  },
});

interface RegistrationDataEnterpriseProps {
  // Reutiliza os estilos da tela pessoal para manter identidade visual
  styles: any;
}

const RegistrationDataEnterprise = React.forwardRef<EnterpriseRef, RegistrationDataEnterpriseProps>(({ styles }, ref) => {
  // Lista e mapa de estados (mesma abordagem da tela pessoal)
  const BRAZIL_STATES: string[] = [
    'AC - Acre','AL - Alagoas','AP - Amapá','AM - Amazonas','BA - Bahia','CE - Ceará','DF - Distrito Federal',
    'ES - Espírito Santo','GO - Goiás','MA - Maranhão','MT - Mato Grosso','MS - Mato Grosso do Sul','MG - Minas Gerais',
    'PA - Pará','PB - Paraíba','PR - Paraná','PE - Pernambuco','PI - Piauí','RJ - Rio de Janeiro','RN - Rio Grande do Norte',
    'RS - Rio Grande do Sul','RO - Rondônia','RR - Roraima','SC - Santa Catarina','SP - São Paulo','SE - Sergipe','TO - Tocantins',
  ];
  const UF_NAME_MAP: Record<string, string> = BRAZIL_STATES.reduce((acc, label) => {
    const [uf] = label.split(' - ');
    acc[uf] = label;
    return acc;
  }, {} as Record<string, string>);

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const chevronRotate = chevronAnim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  useEffect(() => {
    Animated.timing(chevronAnim, { toValue: stateDropdownOpen ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [stateDropdownOpen]);

  const filteredStates = BRAZIL_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase().trim()));

  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    state: '',
    cep: '',
    city: '',
    neighborhood: '',
    address: '',
    number: '',
    complement: '',
  });

  const [sameAddressAsPersonal, setSameAddressAsPersonal] = useState(true);

  const [errors, setErrors] = useState<{ [K in keyof typeof formData]?: string }>({});

  // Carregar dados do localStorage
  useEffect(() => {
    loadEnterpriseData();
  }, []);

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    saveEnterpriseData();
  }, [formData, sameAddressAsPersonal]);

  const loadEnterpriseData = async () => {
    try {
      const savedData = await RegistrationStorage.getRegistrationData();
      if (savedData && savedData.enterprise) {
        setFormData(savedData.enterprise);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa do localStorage:', error);
    }
  };

  const saveEnterpriseData = async () => {
    try {
      const currentData = await RegistrationStorage.getRegistrationData();
      const updatedData = {
        personal: currentData?.personal || {
          name: '',
          cpf: '',
          email: '',
          whatsapp: '',
          state: '',
          cep: '',
          city: '',
          neighborhood: '',
          address: '',
          number: '',
          complement: '',
        },
        enterprise: {
          ...formData,
          sameAddressAsPersonal,
        },
        bankAccount: currentData?.bankAccount || {
          bank: '',
          agency: '',
          account: '',
          pixKeyType: '',
          pixKey: '',
        },
      };
      await RegistrationStorage.saveRegistrationData(updatedData);
    } catch (error) {
      console.error('Erro ao salvar dados da empresa no localStorage:', error);
    }
  };

  const collectErrors = (data: typeof formData) => {
    const newErrors: { [K in keyof typeof formData]?: string } = {};

    // Razão Social: obrigatório e mínimo duas palavras
    const words = formatCompanyNameInput(data.companyName).trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) {
      newErrors.companyName = 'Informe a razão social (mínimo duas palavras).';
    }

    // CNPJ: obrigatório e válido
    if (!isValidCNPJ(data.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido.';
    }

    // Validações de endereço apenas quando NÃO é o mesmo endereço pessoal
    if (!sameAddressAsPersonal) {
      // Estado
      if (!data.state || !UF_LIST.includes(data.state)) {
        newErrors.state = 'Selecione um estado válido.';
      }

      // CEP (opcional, valida se preenchido)
      const cepDigits = onlyDigits(data.cep);
      if (cepDigits.length > 0 && !isValidCEP(data.cep)) {
        newErrors.cep = 'CEP inválido.';
      }

      // Obrigatórios
      if (!data.city.trim()) newErrors.city = 'Cidade é obrigatória.';
      if (!data.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório.';
      if (!data.address.trim()) newErrors.address = 'Endereço é obrigatório.';
      if (!data.number.trim()) newErrors.number = 'Número é obrigatório.';
    }

    return newErrors;
  };

  useImperativeHandle(ref, () => ({
    save: () => {
      setSubmitted(true);
      const newErrors = collectErrors(formData);
      setErrors(newErrors);
      const hasErrors = Object.values(newErrors).some(Boolean);
      if (!hasErrors) {
        setStateDropdownOpen(false);
        return true;
      }
      return false;
    },
  }));

  return (
    <View style={styles.formSection}>
      {/* Grupo de campos: Empresa */}
      <View style={styles.fieldGroup}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Razão Social *</Text>
          <TextInput
            style={[styles.input, focusedField === 'companyName' ? styles.inputFocused : null]}
            value={formData.companyName}
            onChangeText={(text) => {
              const formatted = formatCompanyNameInput(text);
              setFormData({ ...formData, companyName: formatted });
              const validWords = formatted.trim().split(/\s+/).filter(Boolean).length >= 2;
              setErrors({ ...errors, companyName: validWords ? undefined : 'Informe a razão social (mínimo duas palavras).' });
            }}
            placeholder="Digite a razão social da empresa"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('companyName')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, companyName: true });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            accessibilityLabel="Campo de razão social"
            accessibilityHint="Digite a razão social da empresa"
          />
          {(errors.companyName && (submitted || touched.companyName)) ? (
            <Text style={styles.errorText}>{errors.companyName}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>CNPJ *</Text>
          <TextInput
            style={[styles.input, focusedField === 'cnpj' ? styles.inputFocused : null]}
            value={formData.cnpj}
            onChangeText={(text) => {
              const masked = maskCNPJ(text);
              setFormData({ ...formData, cnpj: masked });
              const valid = isValidCNPJ(masked);
              setErrors({ ...errors, cnpj: valid || masked.length < 18 ? undefined : 'CNPJ inválido.' });
            }}
            placeholder="00.000.000/0000-00"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('cnpj')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, cnpj: true });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            keyboardType="numeric"
            maxLength={18}
            accessibilityLabel="Campo de CNPJ"
            accessibilityHint="Digite o CNPJ no formato 00.000.000/0000-00"
          />
          {(errors.cnpj && (submitted || touched.cnpj)) ? (
            <Text style={styles.errorText}>{errors.cnpj}</Text>
          ) : null}
        </View>
      </View>

      {/* Localização */}
      <View style={styles.locationSection}>
       <Text style={styles.sectionTitle}>Localização:</Text>

        {/* Pergunta: endereço da empresa igual ao pessoal? */}
        <View style={localStyles.sameAddressBlock}>
          <Text style={localStyles.questionText}>
            Sua empresa está no mesmo endereço que o seu endereço pessoal?
          </Text>
          <View style={localStyles.optionsRow}>
            <TouchableOpacity
              style={[localStyles.option, sameAddressAsPersonal ? localStyles.optionSelected : localStyles.optionUnselected]}
              onPress={() => {
                setSameAddressAsPersonal(true);
                setStateDropdownOpen(false);
                setErrors({
                  ...errors,
                  state: undefined,
                  cep: undefined,
                  city: undefined,
                  neighborhood: undefined,
                  address: undefined,
                  number: undefined,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Seleção Sim, endereço igual ao pessoal"
            >
              <RadioIcon selected={sameAddressAsPersonal} />
              <Text style={localStyles.optionLabel}>Sim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[localStyles.option, !sameAddressAsPersonal ? localStyles.optionSelected : localStyles.optionUnselected]}
              onPress={() => setSameAddressAsPersonal(false)}
              accessibilityRole="button"
              accessibilityLabel="Seleção Não, informar endereço da empresa"
            >
              <RadioIcon selected={!sameAddressAsPersonal} />
              <Text style={localStyles.optionLabel}>Não</Text>
            </TouchableOpacity>
          </View>
          <View style={localStyles.divider} />
        </View>

        {!sameAddressAsPersonal && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Estado *</Text>
          <TouchableOpacity
            style={[styles.dropdownInput, styles.stateSelectRow, focusedField === 'state' ? styles.inputFocused : null]}
            accessibilityLabel="Seletor de estado"
            accessibilityHint="Toque para selecionar o estado"
            accessibilityRole="button"
            onPress={() => {
              setFocusedField('state');
              setStateDropdownOpen((open) => !open);
            }}
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
            onRequestClose={() => {
              setStateDropdownOpen(false);
              setTouched({ ...touched, state: true });
              setErrors({ ...errors, state: formData.state ? undefined : 'Selecione um estado válido.' });
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                setStateDropdownOpen(false);
                setTouched({ ...touched, state: true });
                setErrors({ ...errors, state: formData.state ? undefined : 'Selecione um estado válido.' });
              }}
            >
              <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.dropdownModalContainer} pointerEvents="box-none">
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={[styles.input, Platform.OS === 'web' ? ({ outlineWidth: 0 } as any) : null]}
                  placeholder="Buscar estado"
                  placeholderTextColor="#91929E"
                  value={stateSearch}
                  onChangeText={setStateSearch}
                  autoCapitalize="none"
                />
                <Animated.ScrollView style={styles.stateList as any}>
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
                </Animated.ScrollView>
              </View>
            </View>
          </Modal>
          {(errors.state && (submitted || touched.state)) ? (
            <Text style={styles.errorText}>{errors.state}</Text>
          ) : null}
        </View>
        )}

        {!sameAddressAsPersonal && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>CEP *</Text>
          <TextInput
            style={[styles.input, focusedField === 'cep' ? styles.inputFocused : null]}
            value={formData.cep}
            onChangeText={(text) => {
              const masked = maskCEP(text);
              setFormData({ ...formData, cep: masked });
              const valid = isValidCEP(masked);
              setErrors({ ...errors, cep: valid || masked.length < 9 ? undefined : 'CEP inválido.' });
            }}
            placeholder="00000-000"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('cep')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, cep: true });
              setErrors({ ...errors, cep: isValidCEP(formData.cep) || formData.cep.length === 0 ? undefined : 'CEP inválido.' });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            keyboardType="numeric"
            maxLength={9}
            accessibilityLabel="Campo de CEP"
            accessibilityHint="Digite o CEP no formato 00000-000"
          />
          {(errors.cep && (submitted || touched.cep)) ? (
            <Text style={styles.errorText}>{errors.cep}</Text>
          ) : null}
        </View>
        )}

        {!sameAddressAsPersonal && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cidade *</Text>
          <TextInput
            style={[styles.input, focusedField === 'city' ? styles.inputFocused : null]}
            value={formData.city}
            onChangeText={(text) => {
              const sanitized = sanitizeCityNeighborhood(text);
              const cleaned = capitalizeFirstLetterLive(sanitized);
              setFormData({ ...formData, city: cleaned });
              if (submitted || touched.city) {
                setErrors({ ...errors, city: cleaned.trim() ? undefined : 'Cidade é obrigatória.' });
              } else if (errors.city) {
                setErrors({ ...errors, city: undefined });
              }
            }}
            placeholder="Nome da cidade da sua empresa"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('city')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, city: true });
              const finalized = capitalizeFirstLetter(sanitizeCityNeighborhood(formData.city));
              setFormData({ ...formData, city: finalized });
              setErrors({ ...errors, city: finalized.trim() ? undefined : 'Cidade é obrigatória.' });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            accessibilityLabel="Campo de cidade"
            accessibilityHint="Digite o nome da cidade da sua empresa"
          />
          {(errors.city && (submitted || touched.city)) ? (
            <Text style={styles.errorText}>{errors.city}</Text>
          ) : null}
        </View>
        )}

        {!sameAddressAsPersonal && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bairro *</Text>
          <TextInput
            style={[styles.input, focusedField === 'neighborhood' ? styles.inputFocused : null]}
            value={formData.neighborhood}
            onChangeText={(text) => {
              const sanitized = sanitizeCityNeighborhood(text);
              const cleaned = capitalizeFirstLetterLive(sanitized);
              setFormData({ ...formData, neighborhood: cleaned });
              if (submitted || touched.neighborhood) {
                setErrors({ ...errors, neighborhood: cleaned.trim() ? undefined : 'Bairro é obrigatório.' });
              } else if (errors.neighborhood) {
                setErrors({ ...errors, neighborhood: undefined });
              }
            }}
            placeholder="Nome do bairro da sua empresa"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('neighborhood')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, neighborhood: true });
              const finalized = capitalizeFirstLetter(sanitizeCityNeighborhood(formData.neighborhood));
              setFormData({ ...formData, neighborhood: finalized });
              setErrors({ ...errors, neighborhood: finalized.trim() ? undefined : 'Bairro é obrigatório.' });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            accessibilityLabel="Campo de bairro"
            accessibilityHint="Digite o nome do bairro da sua empresa"
          />
          {(errors.neighborhood && (submitted || touched.neighborhood)) ? (
            <Text style={styles.errorText}>{errors.neighborhood}</Text>
          ) : null}
        </View>
        )}

        {!sameAddressAsPersonal && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Endereço *</Text>
          <TextInput
            style={[styles.input, focusedField === 'address' ? styles.inputFocused : null]}
            value={formData.address}
            onChangeText={(text) => {
              const sanitized = sanitizeAddress(text);
              const cleaned = capitalizeFirstLetterLive(sanitized);
              setFormData({ ...formData, address: cleaned });
              if (submitted || touched.address) {
                setErrors({ ...errors, address: cleaned.trim() ? undefined : 'Endereço é obrigatório.' });
              } else if (errors.address) {
                setErrors({ ...errors, address: undefined });
              }
            }}
            placeholder="Endereço da sua empresa"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('address')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, address: true });
              const finalized = capitalizeFirstLetter(sanitizeAddress(formData.address));
              setFormData({ ...formData, address: finalized });
              setErrors({ ...errors, address: finalized.trim() ? undefined : 'Endereço é obrigatório.' });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            accessibilityLabel="Digite o endereço da sua empresa"
            accessibilityHint="Digite o nome da rua da sua empresa"
          />
          {(errors.address && (submitted || touched.address)) ? (
            <Text style={styles.errorText}>{errors.address}</Text>
          ) : null}
        </View>
        )}

        {!sameAddressAsPersonal && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Número *</Text>
          <TextInput
            style={[styles.input, focusedField === 'number' ? styles.inputFocused : null]}
            value={formData.number}
            onChangeText={(text) => {
              const cleaned = sanitizeNumberField(text, 6);
              setFormData({ ...formData, number: cleaned });
              if (submitted || touched.number) {
                setErrors({ ...errors, number: cleaned.trim() ? undefined : 'Número é obrigatório.' });
              } else if (errors.number) {
                setErrors({ ...errors, number: undefined });
              }
            }}
            placeholder="Número do endereço da sua empresa"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('number')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, number: true });
              setErrors({ ...errors, number: formData.number.trim() ? undefined : 'Número é obrigatório.' });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            keyboardType="numeric"
            maxLength={6}
            accessibilityLabel="Campo de número"
            accessibilityHint="Digite o número da sua empresa"
          />
          {(errors.number && (submitted || touched.number)) ? (
            <Text style={styles.errorText}>{errors.number}</Text>
          ) : null}
        </View>
        )}

        {!sameAddressAsPersonal && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={[styles.input, focusedField === 'complement' ? styles.inputFocused : null]}
            value={formData.complement}
            onChangeText={(text) => {
              const sanitized = sanitizeComplement(text);
              const cleaned = capitalizeFirstLetterLive(sanitized);
              setFormData({ ...formData, complement: cleaned });
            }}
            placeholder="Ex: bloco A, sala 10, apartamento 5"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('complement')}
            onBlur={() => {
              setFocusedField(null);
              const finalized = capitalizeFirstLetter(sanitizeComplement(formData.complement));
              setFormData({ ...formData, complement: finalized });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            accessibilityLabel="Campo de complemento"
            accessibilityHint="Digite informações adicionais como bloco, sala, etc."
          />
        </View>
        )}
      </View>
    </View>
  );
});

export default RegistrationDataEnterprise;