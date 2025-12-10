import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Animated, TouchableWithoutFeedback, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  maskCPF,
  isValidCPF,
  sanitizeEmail,
  isValidEmail,
  maskWhatsApp,
  validateWhatsApp,
  sanitizeNumberField,
  onlyDigits,
} from '../../utils/validators';
import { RegistrationStorage } from '../../utils/registrationStorage';

export type BankAccountRef = {
  save: () => boolean;
};

// Ícone Dropdown (Chevron) — idêntico ao usado nas demais telas
const ChevronDownIcon = () => (
  <Svg width="12" height="8" viewBox="0 0 12 8" fill="none">
    <Path d="M1.4 -5.72205e-06L0 1.39999L6 7.39999L12 1.39999L10.6 -5.72205e-06L6 4.59999L1.4 -5.72205e-06Z" fill="#7D8592"/>
  </Svg>
);

// Máscara CNPJ (reutilizada aqui para validação de chave Pix tipo CNPJ)
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

// Máscara de conta com dígito: 12345-6
function maskAccountWithDigit(input: string): string {
  const digits = onlyDigits(input).slice(0, 13);
  if (digits.length <= 1) return digits;
  const body = digits.slice(0, -1);
  const dv = digits.slice(-1);
  return `${body}-${dv}`;
}

// Sanitiza chave aleatória (UUID ou similar): alfanumérico e hífen
function sanitizePixRandom(text: string): string {
  return (text || '').replace(/[^A-Za-z0-9\-]/g, '');
}

const BANK_OPTIONS: string[] = [
  '037 - Nubank',
  '001 - Banco do Brasil.',
  '033 - Banco Santander.',
  '037 - Banpará (Banco do Estado do Pará).',
  '041 - Banrisul.',
  '047 - Banese (Banco do Estado de Sergipe).',
  '070 - BRB (Banco de Brasília).',
  '077 - Banco Inter.',
  '104 - Caixa Econômica Federal.',
  '208 - BTG Pactual.',
  '212 - Banco Original.',
  '237 - Bradesco.',
  '260 - Nubank (Nu Pagamentos S.A.).',
  '318 - Banco BMG.',
  '341 - Itaú Unibanco.',
  '422 - Banco Safra.',
];

const PIX_TYPES: string[] = ['CPF', 'CNPJ', 'E-mail', 'Telefone', 'Chave aleatória'];

interface RegistrationDataBankAccountProps {
  // Recebe o mesmo objeto de estilos da tela pessoal para manter visual idêntico
  styles: any;
}

const RegistrationDataBankAccount = React.forwardRef<BankAccountRef, RegistrationDataBankAccountProps>(({ styles }, ref) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    bank: '',
    agency: '',
    account: '',
    pixKeyType: '',
    pixKey: '',
  });

  const [errors, setErrors] = useState<{ [K in keyof typeof formData]?: string }>({});

  // Carregar dados do localStorage
  useEffect(() => {
    loadBankAccountData();
  }, []);

  // Salvar dados no localStorage sempre que houver mudança
  useEffect(() => {
    saveBankAccountData();
  }, [formData]);

  const loadBankAccountData = async () => {
    try {
      const savedData = await RegistrationStorage.getRegistrationData();
      if (savedData && savedData.bankAccount) {
        setFormData(savedData.bankAccount);
      }
    } catch (error) {
      console.error('Erro ao carregar dados bancários do localStorage:', error);
    }
  };

  const saveBankAccountData = async () => {
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
        enterprise: currentData?.enterprise || {
          companyName: '',
          cnpj: '',
          cep: '',
          state: '',
          city: '',
          neighborhood: '',
          address: '',
          number: '',
          complement: '',
          sameAddressAsPersonal: true,
        },
        bankAccount: formData,
      };
      await RegistrationStorage.saveRegistrationData(updatedData);
    } catch (error) {
      console.error('Erro ao salvar dados bancários no localStorage:', error);
    }
  };

  // Dropdowns e animação do chevron (mesmo padrão das demais telas)
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const bankChevron = useRef(new Animated.Value(0)).current;
  const bankChevronRotate = bankChevron.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  useEffect(() => {
    Animated.timing(bankChevron, { toValue: bankDropdownOpen ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [bankDropdownOpen]);

  const [pixDropdownOpen, setPixDropdownOpen] = useState(false);
  const [pixSearch, setPixSearch] = useState('');
  const pixChevron = useRef(new Animated.Value(0)).current;
  const pixChevronRotate = pixChevron.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  useEffect(() => {
    Animated.timing(pixChevron, { toValue: pixDropdownOpen ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [pixDropdownOpen]);

  const filteredBanks = BANK_OPTIONS.filter((s) => s.toLowerCase().includes(bankSearch.toLowerCase().trim()));
  const filteredPixTypes = PIX_TYPES.filter((s) => s.toLowerCase().includes(pixSearch.toLowerCase().trim()));

  const collectErrors = (data: typeof formData) => {
    const newErrors: { [K in keyof typeof formData]?: string } = {};

    if (!data.bank) newErrors.bank = 'Selecione um banco.';

    const agencyDigits = onlyDigits(data.agency);
    if (agencyDigits.length < 3) newErrors.agency = 'Agência inválida.';

    const accountDigits = onlyDigits(data.account);
    if (accountDigits.length < 2 || !data.account.includes('-')) newErrors.account = 'Conta corrente inválida (use dígito).';

    if (!data.pixKeyType) newErrors.pixKeyType = 'Selecione o tipo de chave.';

    const key = data.pixKey;
    switch (data.pixKeyType) {
      case 'CPF':
        if (!isValidCPF(key)) newErrors.pixKey = 'CPF inválido.';
        break;
      case 'CNPJ':
        if (!isValidCNPJ(key)) newErrors.pixKey = 'CNPJ inválido.';
        break;
      case 'E-mail':
        if (!isValidEmail(key)) newErrors.pixKey = 'Email inválido.';
        break;
      case 'Telefone':
        {
          const info = validateWhatsApp(key);
          if (!info.valid) newErrors.pixKey = 'Telefone inválido (DDD e comprimento).';
        }
        break;
      case 'Chave aleatória':
        {
          const cleaned = sanitizePixRandom(key);
          if (cleaned.length < 32) newErrors.pixKey = 'Chave aleatória inválida.';
        }
        break;
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
        setBankDropdownOpen(false);
        setPixDropdownOpen(false);
        return true;
      }
      return false;
    },
  }));

  return (
    <View style={styles.formSection}>
      <View style={styles.fieldGroup}>
        {/* Banco */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Banco *</Text>
          <TouchableOpacity
            style={[styles.dropdownInput, styles.stateSelectRow, focusedField === 'bank' ? styles.inputFocused : null]}
            accessibilityLabel="Seletor de banco"
            accessibilityHint="Toque para selecionar o banco"
            accessibilityRole="button"
            onPress={() => {
              setFocusedField('bank');
              setBankDropdownOpen((open) => !open);
            }}
          >
            <Text style={[styles.dropdownText, !formData.bank ? styles.placeholderText : null]}>
              {formData.bank || 'Selecione um banco'}
            </Text>
            <Animated.View style={[styles.dropdownChevron, { transform: [{ rotate: bankChevronRotate }] }]}> 
              <ChevronDownIcon />
            </Animated.View>
          </TouchableOpacity>

          <Modal
            visible={bankDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => {
              setBankDropdownOpen(false);
              setTouched({ ...touched, bank: true });
              setErrors({ ...errors, bank: formData.bank ? undefined : 'Selecione um banco.' });
            }}
          >
            <TouchableWithoutFeedback onPress={() => {
              setBankDropdownOpen(false);
              setTouched({ ...touched, bank: true });
              setErrors({ ...errors, bank: formData.bank ? undefined : 'Selecione um banco.' });
            }}>
              <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.dropdownModalContainer} pointerEvents="box-none">
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={[styles.input, Platform.OS === 'web' ? ({ outlineWidth: 0 } as any) : null]}
                  placeholder="Buscar banco"
                  placeholderTextColor="#91929E"
                  value={bankSearch}
                  onChangeText={setBankSearch}
                  autoCapitalize="none"
                />
                <Animated.ScrollView style={styles.stateList as any}>
                  {filteredBanks.map((label) => (
                    <View key={label}>
                      <TouchableOpacity
                        style={[styles.stateItem, (formData.bank === label) && styles.stateItemSelected]}
                        onPress={() => {
                          setFormData({ ...formData, bank: label });
                          setErrors({ ...errors, bank: undefined });
                          setBankSearch('');
                          setBankDropdownOpen(false);
                          setFocusedField(null);
                          setTouched({ ...touched, bank: true });
                        }}
                        accessibilityLabel={`Selecionar banco ${label}`}
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
          {(errors.bank && (submitted || touched.bank)) ? (
            <Text style={styles.errorText}>{errors.bank}</Text>
          ) : null}
        </View>

        {/* Agência */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Agência *</Text>
          <TextInput
            style={[styles.input, focusedField === 'agency' ? styles.inputFocused : null]}
            value={formData.agency}
            onChangeText={(text) => {
              const cleaned = sanitizeNumberField(text, 6);
              setFormData({ ...formData, agency: cleaned });
              if (submitted || touched.agency) {
                setErrors({ ...errors, agency: onlyDigits(cleaned).length >= 3 ? undefined : 'Agência inválida.' });
              } else if (errors.agency) {
                setErrors({ ...errors, agency: undefined });
              }
            }}
            placeholder="Digite o número da agência (sem dígito)"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('agency')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, agency: true });
              setErrors({ ...errors, agency: onlyDigits(formData.agency).length >= 3 ? undefined : 'Agência inválida.' });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            keyboardType="numeric"
            maxLength={6}
            accessibilityLabel="Campo de agência"
            accessibilityHint="Digite o número da agência"
          />
          {(errors.agency && (submitted || touched.agency)) ? (
            <Text style={styles.errorText}>{errors.agency}</Text>
          ) : null}
        </View>

        {/* Conta corrente */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Conta corrente *</Text>
          <TextInput
            style={[styles.input, focusedField === 'account' ? styles.inputFocused : null]}
            value={formData.account}
            onChangeText={(text) => {
              const masked = maskAccountWithDigit(text);
              setFormData({ ...formData, account: masked });
              const valid = onlyDigits(masked).length >= 2 && masked.includes('-');
              setErrors({ ...errors, account: valid || onlyDigits(masked).length < 2 ? undefined : 'Conta corrente inválida (use dígito).' });
            }}
            placeholder="Digite o número da conta (com dígito)"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('account')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, account: true });
              const valid = onlyDigits(formData.account).length >= 2 && formData.account.includes('-');
              setErrors({ ...errors, account: valid ? undefined : 'Conta corrente inválida (use dígito).' });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            keyboardType="numeric"
            maxLength={14}
            accessibilityLabel="Campo de conta corrente"
            accessibilityHint="Digite o número da sua conta com dígito"
          />
          {(errors.account && (submitted || touched.account)) ? (
            <Text style={styles.errorText}>{errors.account}</Text>
          ) : null}
        </View>

        {/* Tipo de chave pix */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de chave pix *</Text>
          <TouchableOpacity
            style={[styles.dropdownInput, styles.stateSelectRow, focusedField === 'pixKeyType' ? styles.inputFocused : null]}
            accessibilityLabel="Seletor de tipo de chave Pix"
            accessibilityHint="Toque para selecionar o tipo de chave Pix"
            accessibilityRole="button"
            onPress={() => {
              setFocusedField('pixKeyType');
              setPixDropdownOpen((open) => !open);
            }}
          >
            <Text style={[styles.dropdownText, !formData.pixKeyType ? styles.placeholderText : null]}>
              {formData.pixKeyType || 'Selecione o tipo de chave'}
            </Text>
            <Animated.View style={[styles.dropdownChevron, { transform: [{ rotate: pixChevronRotate }] }]}> 
              <ChevronDownIcon />
            </Animated.View>
          </TouchableOpacity>

          <Modal
            visible={pixDropdownOpen}
            transparent
            animationType="fade"
            onRequestClose={() => {
              setPixDropdownOpen(false);
              setTouched({ ...touched, pixKeyType: true });
              setErrors({ ...errors, pixKeyType: formData.pixKeyType ? undefined : 'Selecione o tipo de chave.' });
            }}
          >
            <TouchableWithoutFeedback onPress={() => {
              setPixDropdownOpen(false);
              setTouched({ ...touched, pixKeyType: true });
              setErrors({ ...errors, pixKeyType: formData.pixKeyType ? undefined : 'Selecione o tipo de chave.' });
            }}>
              <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.dropdownModalContainer} pointerEvents="box-none">
              <View style={styles.dropdownContainer}>
                <TextInput
                  style={[styles.input, Platform.OS === 'web' ? ({ outlineWidth: 0 } as any) : null]}
                  placeholder="Buscar tipo de chave"
                  placeholderTextColor="#91929E"
                  value={pixSearch}
                  onChangeText={setPixSearch}
                  autoCapitalize="none"
                />
                <Animated.ScrollView style={styles.stateList as any}>
                  {filteredPixTypes.map((label) => (
                    <View key={label}>
                      <TouchableOpacity
                        style={[styles.stateItem, (formData.pixKeyType === label) && styles.stateItemSelected]}
                        onPress={() => {
                          setFormData({ ...formData, pixKeyType: label, pixKey: '' });
                          setErrors({ ...errors, pixKeyType: undefined, pixKey: undefined });
                          setPixSearch('');
                          setPixDropdownOpen(false);
                          setFocusedField(null);
                          setTouched({ ...touched, pixKeyType: true });
                        }}
                        accessibilityLabel={`Selecionar tipo ${label}`}
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
          {(errors.pixKeyType && (submitted || touched.pixKeyType)) ? (
            <Text style={styles.errorText}>{errors.pixKeyType}</Text>
          ) : null}
        </View>

        {/* Chave Pix empresa */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Chave pix empresa *</Text>
          <TextInput
            style={[styles.input, focusedField === 'pixKey' ? styles.inputFocused : null]}
            value={formData.pixKey}
            onChangeText={(text) => {
              let next = text;
              switch (formData.pixKeyType) {
                case 'CPF':
                  next = maskCPF(text);
                  break;
                case 'CNPJ':
                  next = maskCNPJ(text);
                  break;
                case 'E-mail':
                  next = sanitizeEmail(text);
                  break;
                case 'Telefone':
                  next = maskWhatsApp(text);
                  break;
                case 'Chave aleatória':
                  next = sanitizePixRandom(text);
                  break;
                default:
                  next = text;
              }
              setFormData({ ...formData, pixKey: next });
              if (submitted || touched.pixKey) {
                const newErrors = collectErrors({ ...formData, pixKey: next });
                setErrors({ ...errors, pixKey: newErrors.pixKey });
              } else if (errors.pixKey) {
                setErrors({ ...errors, pixKey: undefined });
              }
            }}
            placeholder="Digite a chave Pix da empresa"
            placeholderTextColor="#91929E"
            onFocus={() => setFocusedField('pixKey')}
            onBlur={() => {
              setFocusedField(null);
              setTouched({ ...touched, pixKey: true });
              const newErrors = collectErrors(formData);
              setErrors({ ...errors, pixKey: newErrors.pixKey });
            }}
            selectionColor="#1777CF"
            cursorColor="#1777CF"
            keyboardType={formData.pixKeyType === 'E-mail' ? 'email-address' : (formData.pixKeyType === 'Telefone' || formData.pixKeyType === 'CPF' || formData.pixKeyType === 'CNPJ') ? 'numeric' : 'default'}
            maxLength={formData.pixKeyType === 'Telefone' ? 15 : formData.pixKeyType === 'CPF' ? 14 : formData.pixKeyType === 'CNPJ' ? 18 : 64}
            accessibilityLabel="Campo de chave Pix"
            accessibilityHint="Digite a chave Pix correspondente ao tipo selecionado"
          />
          {(errors.pixKey && (submitted || touched.pixKey)) ? (
            <Text style={styles.errorText}>{errors.pixKey}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
});

export default RegistrationDataBankAccount;