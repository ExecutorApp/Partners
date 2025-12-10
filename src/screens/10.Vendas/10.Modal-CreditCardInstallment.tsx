import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, ScrollView } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  visible: boolean;
  baseAmount: number;
  selected?: number;
  onCancel?: () => void;
  onSave?: (n: number) => void;
}

const CreditCardIcon: React.FC = () => (
  <Svg width={38} height={40} viewBox="0 0 38 40" fill="none">
    <Path d="M1.61255 21.77C1.02417 21.1817 1.02417 20.2243 1.61255 19.6362L15.9708 5.27799C16.1997 5.04911 16.1997 4.67802 15.9708 4.44944C15.7419 4.22025 15.3708 4.22056 15.1422 4.44944L0.783693 18.8077C-0.261231 19.8526 -0.261231 21.5534 0.783693 22.5986L4.40034 26.2149C4.51447 26.3291 4.66462 26.3864 4.81446 26.3864C4.96461 26.3864 5.11445 26.3294 5.22889 26.2149C5.45777 25.986 5.45777 25.615 5.22889 25.3864L1.61255 21.77Z" fill="#FCFCFC"/>
    <Path d="M13.1309 11.5928L4.26427 20.4594C4.03539 20.6882 4.03539 21.0593 4.26427 21.2882C4.37871 21.4024 4.52855 21.4597 4.6787 21.4597C4.82854 21.4597 4.97838 21.4027 5.09283 21.2882L13.9594 12.4216C14.1883 12.1928 14.1883 11.8217 13.9594 11.5928C13.7308 11.3642 13.3597 11.3642 13.1309 11.5928Z" fill="#FCFCFC"/>
    <Path d="M18.4935 10.6544C19.1008 10.6544 19.7081 10.4234 20.1704 9.96107L21.9441 8.18739C22.8688 7.26271 22.8688 5.75819 21.9441 4.8335C21.0194 3.90882 19.5149 3.90882 18.5902 4.8335L16.8165 6.60719C16.3685 7.05519 16.122 7.65058 16.122 8.28413C16.122 8.91737 16.3685 9.51308 16.8165 9.96107C17.2789 10.4234 17.8862 10.6544 18.4935 10.6544ZM17.6451 7.43574L19.4188 5.66206C19.8866 5.19422 20.6477 5.19422 21.1152 5.66206C21.5831 6.12989 21.5831 6.891 21.1152 7.35853L19.3416 9.13222C18.874 9.60005 18.1129 9.60005 17.6451 9.13222C17.4186 8.90577 17.2938 8.60457 17.2938 8.28413C17.2938 7.9637 17.4186 7.66218 17.6451 7.43574Z" fill="#FCFCFC"/>
    <Path d="M34.6234 19.4962H28.9831L33.3288 15.1505C34.374 14.1053 34.374 12.4045 33.3288 11.3593L22.6763 0.707094C22.17 0.200806 21.4968 -0.078125 20.7809 -0.078125C20.0649 -0.078125 19.3917 0.200806 18.8851 0.707094L16.7977 2.7945C16.5691 3.02338 16.5691 3.39417 16.7977 3.62305C17.0266 3.85194 17.3977 3.85194 17.6263 3.62305L19.714 1.53565C19.9987 1.25061 20.3777 1.09375 20.7809 1.09375C21.1837 1.09375 21.5627 1.25061 21.8478 1.53565L32.5 12.1878C33.0883 12.7762 33.0883 13.7332 32.5 14.3216L27.3257 19.4959H12.5182L16.7773 15.2368C17.0061 15.0083 17.0061 14.6372 16.7773 14.4083C16.5484 14.1794 16.1773 14.1794 15.9487 14.4083L10.8611 19.4962H9.02365C7.54538 19.4962 6.34298 20.6986 6.34298 22.1766V37.2413C6.34298 38.7193 7.54538 39.922 9.02365 39.922H34.6234C36.1016 39.922 37.304 38.7193 37.304 37.2413V35.0758C37.304 34.752 37.0419 34.4898 36.7181 34.4898C36.3946 34.4898 36.1322 34.752 36.1322 35.0758V37.2413C36.1322 38.0732 35.4556 38.7501 34.6234 38.7501H9.02365C8.19174 38.7501 7.51486 38.0732 7.51486 37.2413V29.0195H36.1322V32.732C36.1322 33.0555 36.3943 33.3179 36.7181 33.3179C37.0419 33.3179 37.304 33.0555 37.304 32.732V22.1769C37.304 20.6986 36.1016 19.4962 34.6234 19.4962ZM9.02365 20.6681H34.6234C35.4553 20.6681 36.1322 21.345 36.1322 22.1769V24.2289H7.51486V22.1769C7.51486 21.345 8.19174 20.6681 9.02365 20.6681ZM7.51486 27.8477V25.4007H36.1322V27.8477H7.51486Z" fill="#FCFCFC"/>
    <Path d="M29.7097 33.3176C29.2144 33.3176 28.8113 33.7208 28.8113 34.2161V36.4481C28.8113 36.9437 29.2144 37.3466 29.7097 37.3466H33.2601C33.7554 37.3466 34.1586 36.9437 34.1586 36.4481V34.2161C34.1586 33.7208 33.7554 33.3176 33.2601 33.3176H29.7097ZM32.9867 36.1747H29.9831V34.4895H32.9867V36.1747Z" fill="#FCFCFC"/>
    <Path d="M19.0048 33.3176C18.5095 33.3176 18.1063 33.7208 18.1063 34.2161V36.4481C18.1063 36.9437 18.5095 37.3466 19.0048 37.3466H26.5142C27.0095 37.3466 27.4127 36.9437 27.4127 36.4481V34.2161C27.4127 33.7208 27.0095 33.3176 26.5142 33.3176H19.0048ZM26.2408 36.1747H19.2782V34.4895H26.2408V36.1747Z" fill="#FCFCFC"/>
    <Path d="M11.8898 36.176C11.5663 36.176 11.3038 36.4385 11.3038 36.762C11.3038 37.0858 11.5663 37.3479 11.8898 37.3479H15.6312C15.9547 37.3479 16.2172 37.0858 16.2172 36.762C16.2172 36.4385 15.9547 36.176 15.6312 36.176H11.8898Z" fill="#FCFCFC"/>
  </Svg>
);

const RadioDot: React.FC<{ selected?: boolean }> = ({ selected }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Circle cx={10} cy={10} r={8} stroke="#6F7DA0" strokeWidth={1.5} fill="none" />
    {selected ? <Circle cx={10} cy={10} r={5} fill="#1777CF" /> : null}
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

const CreditCardInstallmentModal: React.FC<Props> = ({ visible, baseAmount, selected = 1, onCancel, onSave }) => {
  const [current, setCurrent] = useState<number>(selected || 1);
  const perInstallment = useMemo(() => (n: number) => {
    const amt = baseAmount > 0 ? Math.round((baseAmount / n) * 100) / 100 : 0;
    return amt;
  }, [baseAmount]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Cartão de crédito</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Fechar">
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <CreditCardIcon />
            </View>
          </View>

          <View style={styles.listWrap}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {Array.from({ length: 12 }).map((_, i) => {
                const n = i + 1;
                const selectedRow = current === n;
                return (
                  <View key={`n-${n}`}>
                    <TouchableOpacity style={styles.row} onPress={() => setCurrent(n)} accessibilityRole="button" accessibilityLabel={`${n}x`}>
                      <View style={styles.rowLeft}>
                        <RadioDot selected={selectedRow} />
                        <Text style={styles.rowLabel}>{`${n}x`}</Text>
                      </View>
                      <Text style={styles.rowValue}>{formatBRL(perInstallment(n))}</Text>
                    </TouchableOpacity>
                    {n < 12 ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancelar">
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton]} onPress={() => onSave?.(current)} accessibilityRole="button" accessibilityLabel="Salvar">
              <Text style={styles.saveText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 340,
    height: 650,
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 15 },
  headerTitle: { color: '#3A3F51', fontSize: 18, fontFamily: 'Inter_700Bold' },
  closeButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#3A3F51', fontSize: 20, fontFamily: 'Inter_700Bold' },
  iconRow: { alignItems: 'center', paddingTop: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1777CF', alignItems: 'center', justifyContent: 'center' },
  listWrap: { flex: 1, alignSelf: 'stretch', paddingHorizontal: 15, paddingTop: 10 },
  row: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', columnGap: 10 },
  rowLabel: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_500Medium' },
  rowValue: { color: '#7D8592', fontSize: 14, fontFamily: 'Inter_500Medium' },
  divider: { alignSelf: 'stretch', height: 1, backgroundColor: '#E5E7EB' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 10, paddingHorizontal: 15, paddingVertical: 15 },
  cancelButton: { flex: 1, height: 40, borderRadius: 6, backgroundColor: '#F4F4F4', borderWidth: 1, borderColor: '#D8E0F0', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_700Bold' },
  saveButton: { flex: 1, height: 40, borderRadius: 6, backgroundColor: '#1777CF', alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FCFCFC', fontSize: 14, fontFamily: 'Inter_700Bold' },
});

export default CreditCardInstallmentModal;

