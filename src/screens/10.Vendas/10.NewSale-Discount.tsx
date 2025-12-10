import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Linking } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  onApply?: (payload: { mode: 'percent' | 'currency'; value: number } | null) => void;
  onClose?: () => void;
  summaries?: Partial<Record<number, string>>;
}

const WhatsAppIcon: React.FC = () => (
  <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
    <Path d="M8.49121 0.0498047C10.739 0.0506959 12.8509 0.922379 14.4385 2.50391C16.0485 4.10809 16.9343 6.21201 16.9336 8.42773L16.9229 8.84473C16.8192 10.9203 15.9495 12.8604 14.4473 14.3467C12.8489 15.9281 10.7336 16.7988 8.49121 16.7988H8.48828C7.17104 16.7983 5.86473 16.4873 4.69434 15.8975L4.67871 15.8896L4.66113 15.8936L0.0888672 16.9326L1.08301 12.415L1.08691 12.3965L1.07812 12.3799C0.404793 11.1365 0.0501382 9.77486 0.0498047 8.42578V8.4209C0.0519866 6.19069 0.9343 4.08584 2.53516 2.50195C4.13325 0.920626 6.24854 0.0498624 8.49121 0.0498047ZM8.49121 1.27637C4.51587 1.27637 1.2789 4.48454 1.27637 8.42383C1.27637 9.64159 1.61989 10.8752 2.26758 11.9922L2.38574 12.1982L1.71973 15.2314L1.70312 15.3086L1.7793 15.291L4.85254 14.5918L5.05566 14.7021C6.1033 15.2709 7.29032 15.5717 8.48828 15.5723H8.49121C12.4676 15.5723 15.7053 12.3679 15.707 8.42773C15.7077 6.54001 14.9494 4.74446 13.5732 3.37305C12.217 2.02209 10.4117 1.27718 8.49121 1.27637ZM6.18066 4.75977C6.249 4.7626 6.30982 4.76742 6.37109 4.80371C6.43288 4.84036 6.50194 4.91448 6.57227 5.07031C6.65814 5.26065 6.79415 5.5942 6.91504 5.89355C7.03488 6.19033 7.14131 6.4575 7.16699 6.50879C7.21235 6.59925 7.23789 6.69416 7.18359 6.80273C7.11668 6.93605 7.09282 7.00915 7.00098 7.11621C6.90536 7.22737 6.78844 7.34405 6.70117 7.43066C6.65382 7.47765 6.59516 7.53592 6.56738 7.61035C6.53795 7.68947 6.54503 7.77988 6.60742 7.88672C6.7215 8.08168 7.12548 8.74214 7.70898 9.26074C8.457 9.92545 9.08512 10.1374 9.27539 10.2324C9.37579 10.2825 9.46378 10.3077 9.54492 10.2979C9.62815 10.2877 9.69543 10.242 9.75684 10.1719C9.86982 10.0431 10.253 9.59321 10.3848 9.39648C10.4442 9.3076 10.4979 9.2784 10.5498 9.27246C10.6071 9.26602 10.6733 9.28566 10.7637 9.31836C10.8497 9.34969 11.1292 9.48313 11.415 9.62305C11.6993 9.76217 11.9859 9.90563 12.083 9.9541C12.1827 10.0037 12.2595 10.0385 12.3213 10.0723C12.3831 10.106 12.4176 10.133 12.4346 10.1611C12.4402 10.1709 12.4489 10.2003 12.4531 10.2539C12.4571 10.3053 12.4561 10.3727 12.4492 10.4521C12.4354 10.6114 12.3958 10.8173 12.3164 11.0391C12.2411 11.2488 12.0146 11.4629 11.7539 11.6309C11.4937 11.7985 11.2142 11.9107 11.0479 11.9258C10.8663 11.9423 10.7015 11.9819 10.376 11.9385C10.0487 11.8947 9.55897 11.7671 8.74023 11.4453C6.78286 10.6759 5.54603 8.67447 5.44434 8.53906C5.39633 8.47506 5.19975 8.21575 5.01562 7.85449C4.83114 7.49245 4.6612 7.03226 4.66113 6.56738C4.66113 5.63612 5.1491 5.17998 5.32715 4.98633C5.49399 4.80476 5.69042 4.76075 5.80859 4.76074L6.18066 4.75977Z" fill="#3A3F51" stroke="#FCFCFC" strokeWidth={0.1} />
  </Svg>
);

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
      <Circle cx={10} cy={10} r={8} stroke="#6F7DA0" strokeWidth={1.5} fill="none" />
    )}
  </Svg>
);

const formatBRL = (value: number) => {
  try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); }
  catch {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    const int = Math.floor(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const cents = Math.round((abs % 1) * 100).toString().padStart(2, '0');
    return `${sign}R$ ${int},${cents}`;
  }
};

const formatNumberNoCurrency = (value: number) => {
  try { return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value); }
  catch {
    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    const int = Math.floor(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const cents = Math.round((abs % 1) * 100).toString().padStart(2, '0');
    return `${sign}${int},${cents}`;
  }
};

const parsePtNumber = (text: string): number => {
  const cleaned = String(text || '').replace(/[^0-9.,]/g, '');
  const normalized = cleaned.replace(/\./g, '').replace(/,/g, '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};

const NewSaleDiscount: React.FC<Props> = ({ onApply, onClose, summaries }) => {
  const baseAmount = useMemo(() => {
    const selectedLabel = (summaries?.[5] ?? '').toLowerCase();
    const selectedId = selectedLabel.includes('prolabore') && (selectedLabel.includes('éxito') || selectedLabel.includes('exito'))
      ? 'prolabore_success'
      : selectedLabel.includes('prolabore')
        ? 'prolabore'
        : (selectedLabel.includes('éxito') || selectedLabel.includes('exito'))
          ? 'success'
          : 'none';
    const valueMap: Record<string, number> = { none: 0, prolabore: 800, prolabore_success: 1000, success: 1600 };
    return valueMap[selectedId] ?? 0;
  }, [summaries]);

  type DiscountOption = 'none' | 'system' | 'manager';
  const [selectedOption, setSelectedOption] = useState<DiscountOption>('none');
  const [mode, setMode] = useState<'percent' | 'currency'>('currency');
  const [percentDigits, setPercentDigits] = useState<string>('');
  const [currencyDigits, setCurrencyDigits] = useState<string>('');
  const systemDiscountValue = 0;

  const percentValue = useMemo(() => parsePtNumber(percentDigits), [percentDigits]);
  const currencyValue = useMemo(() => parsePtNumber(currencyDigits), [currencyDigits]);
  const discountValueNumber = useMemo(() => {
    if (selectedOption === 'none') return 0;
    if (selectedOption === 'system') return systemDiscountValue;
    if (mode === 'percent') {
      const raw = (baseAmount * percentValue) / 100;
      return Math.round(raw * 100) / 100;
    }
    return Math.max(currencyValue, 0);
  }, [selectedOption, mode, percentValue, currencyValue, baseAmount]);

  const handleApply = () => {
    if (selectedOption === 'none') onApply?.(null);
    else if (selectedOption === 'system') onApply?.({ mode: 'currency', value: systemDiscountValue });
    else onApply?.({ mode, value: discountValueNumber });
    onClose?.();
  };

  const handleWhatsAppContact = async () => {
    const appUrl = 'whatsapp://send?phone=5517992460986';
    const webUrl = 'https://wa.me/5517992460986';
    try {
      if (Platform.OS !== 'web') {
        const can = await Linking.canOpenURL(appUrl);
        if (can) { await Linking.openURL(appUrl); return; }
      }
      await Linking.openURL(webUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  };

  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Desconto</Text>
        <View style={styles.divider} />

        <TouchableOpacity style={styles.radioRow} onPress={() => { if (selectedOption !== 'none') setSelectedOption('none'); }} accessibilityRole="button" accessibilityLabel="Nenhum" activeOpacity={1}>
          <RadioDot selected={selectedOption === 'none'} />
          <Text style={styles.radioLabel}>Nenhum</Text>
        </TouchableOpacity>
        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desconto do sistema</Text>
          <TouchableOpacity style={styles.inlineRow} onPress={() => { if (selectedOption !== 'system') setSelectedOption('system'); }} accessibilityRole="button" accessibilityLabel="Selecionar desconto do sistema" activeOpacity={1}>
            <RadioDot selected={selectedOption === 'system'} />
            <Text style={styles.sectionValue}>R$ 00,00</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desconto do gestor</Text>
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[styles.segmentedItem, mode === 'percent' ? styles.segmentedItemActive : null]}
              onPress={() => { setMode('percent'); setSelectedOption('manager'); }}
              accessibilityRole="button"
              accessibilityLabel="Percentual"
            >
              <Text style={mode === 'percent' ? styles.segmentedTextActive : styles.segmentedTextInactive}>%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentedItem, mode === 'currency' ? styles.segmentedItemActive : null]}
              onPress={() => { setMode('currency'); setSelectedOption('manager'); }}
              accessibilityRole="button"
              accessibilityLabel="Valor em reais"
            >
              <Text style={mode === 'currency' ? styles.segmentedTextActive : styles.segmentedTextInactive}>R$</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.discountInputRow}>
            <TouchableOpacity style={styles.radioTouch} onPress={() => { if (selectedOption !== 'manager') setSelectedOption('manager'); }} accessibilityRole="button" accessibilityLabel="Selecionar desconto" activeOpacity={1}>
              <RadioDot selected={selectedOption === 'manager'} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder={mode === 'percent' ? '00,00%' : '00,00'}
              placeholderTextColor="#91929E"
              value={mode === 'percent'
                ? (isInputFocused ? percentDigits : (percentDigits ? `${formatNumberNoCurrency(parsePtNumber(percentDigits))}%` : ''))
                : (isInputFocused ? currencyDigits : (currencyDigits ? formatNumberNoCurrency(parsePtNumber(currencyDigits)) : ''))}
              onChangeText={(t) => {
                const raw = t.replace(/[^0-9.,]/g, '');
                if (mode === 'percent') setPercentDigits(raw);
                else setCurrencyDigits(raw);
                if (selectedOption !== 'manager') setSelectedOption('manager');
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              cursorColor="#1777CF"
              selectionColor="#1777CF"
              keyboardType="default"
            />
          </View>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsAppContact} accessibilityRole="button" accessibilityLabel="Entrar em contato com gestor">
            <View style={styles.contactIconWrap}><WhatsAppIcon /></View>
            <Text style={styles.contactText}>Entrar em contato com gestor</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Valor da venda</Text>
            <Text style={styles.totalsValue}>{formatBRL(baseAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Desconto</Text>
            <Text style={styles.totalsValue}>{formatBRL(discountValueNumber)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total</Text>
            <Text style={styles.totalsTotal}>{formatBRL(Math.max(baseAmount - discountValueNumber, 0))}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={handleApply} accessibilityRole="button" accessibilityLabel="Aplicar">
        <Text style={styles.applyButtonText}>Aplicar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 260,
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 15,
    gap: 10,
  },
  content: { alignSelf: 'stretch', flex: 1, gap: 16 },
  title: { color: '#3A3F51', fontSize: 18, fontFamily: 'Inter_600SemiBold', alignSelf: 'stretch', marginBottom: 0, marginTop: 5 },
  divider: { alignSelf: 'stretch', height: 0.5, backgroundColor: '#D8E0F0', marginBottom: 0  },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch', marginBottom: 0  },
  radioLabel: { color: '#7D8592', fontSize: 14, fontFamily: 'Inter_500Medium' },
  section: { alignSelf: 'stretch', gap: 12, marginTop: 0 },
  sectionTitle: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_500Medium' },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 0  },
  sectionValue: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_400Regular' },
  segmentedContainer: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    padding: 3,
    backgroundColor: '#F4F4F4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 3,
  },
  segmentedItem: {
    flex: 1,
    height: 35,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    backgroundColor: '#FCFCFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedItemActive: { backgroundColor: '#1777CF' },
  segmentedTextInactive: { color: '#3A3F51', fontSize: 12, fontFamily: 'Inter_500Medium' },
  segmentedTextActive: { color: '#FCFCFC', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  discountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' },
  radioTouch: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10, },
  input: {
    flex: 1,
    height: 35,
    borderRadius: 8,
    borderWidth: 0.001,
    borderColor: '#D8E0F0',
    paddingHorizontal: 10,
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 10,
    minWidth: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  contactCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    padding: 10,
    alignSelf: 'stretch',
    backgroundColor: '#E9FBEE',
  },
  contactIconWrap: { width: 37, height: 37, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#57EB64' },
  contactText: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  totals: { alignSelf: 'stretch', gap: 15, paddingTop: 20 },
  totalsRow: { alignSelf: 'stretch', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 4 },
  totalsLabel: { color: '#7D8592', fontSize: 14, fontFamily: 'Inter_500Medium' },
  totalsValue: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_400Regular' },
  totalsTotal: { color: '#3A3F51', fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  applyButton: {
    alignSelf: 'stretch',
    height: 40,
    borderRadius: 6,
    backgroundColor: '#1777CF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: { color: '#FCFCFC', fontSize: 14, fontFamily: 'Inter_500Medium' },
});

export default NewSaleDiscount;
