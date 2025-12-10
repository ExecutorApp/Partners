import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FullFlow from './13.FullFlow';
import SlideInView from './SlideInView';

interface NewAppointmentProductsProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext?: (productId: string) => void;
  onSelectProduct?: (productId: string | null) => void;
  summaries?: Partial<Record<number, string>>;
  onSelectStep?: (step: number) => void;
  onUpdateSummary?: (step: number, value: string) => void;
  maxAccessibleStep?: number;
  transitionDirection?: 'forward' | 'backward';
  // Modo embed: renderiza apenas o conteúdo central, sem cabeçalho/rodapé próprios
  embedded?: boolean;
  // Permite ao pai registrar o handler do botão "Próximo" unificado
  registerNextHandler?: (fn: () => void) => void;
  // Notifica ao pai se o botão "Próximo" deve estar habilitado
  onCanProceedChange?: (canProceed: boolean) => void;
}

// Ícone Olho (visualização)
const EyeIcon: React.FC = () => (
  <Svg width={23} height={14} viewBox="0 0 23 14" fill="none">
    <Path d="M11.5 0C5.46878 0 0.364891 6.3 0.149234 6.573C0.0524697 6.6954 0 6.84553 0 7C0 7.15447 0.0524697 7.3046 0.149234 7.427C0.364891 7.7 5.46878 14 11.5 14C17.5312 14 22.6351 7.7 22.8508 7.427C22.9475 7.3046 23 7.15447 23 7C23 6.84553 22.9475 6.6954 22.8508 6.573C22.6351 6.3 17.5312 0 11.5 0ZM11.5 12.6C7.02152 12.6 2.87371 8.4 1.65165 7C2.87371 5.6 7.01433 1.4 11.5 1.4C15.9857 1.4 20.1263 5.6 21.3484 7C20.1263 8.4 15.9857 12.6 11.5 12.6Z" fill="#3A3F51"/>
    <Path d="M15.0943 6.3C15.2129 6.29991 15.3297 6.27122 15.4342 6.21649C15.5387 6.16176 15.6277 6.0827 15.6932 5.98635C15.7586 5.89001 15.7986 5.77937 15.8095 5.66433C15.8204 5.54928 15.8019 5.43339 15.7556 5.327C15.3602 4.56023 14.7517 3.9169 13.9994 3.47018C13.2471 3.02345 12.3811 2.79126 11.5 2.8C10.3561 2.8 9.25902 3.2425 8.45014 4.03015C7.64127 4.8178 7.18685 5.88609 7.18685 7C7.18685 8.11391 7.64127 9.1822 8.45014 9.96985C9.25902 10.7575 10.3561 11.2 11.5 11.2C12.3811 11.2087 13.2471 10.9765 13.9994 10.5298C14.7517 10.0831 15.3602 9.43977 15.7556 8.673C15.8019 8.56661 15.8204 8.45072 15.8095 8.33568C15.7986 8.22063 15.7586 8.11 15.6932 8.01365C15.6277 7.9173 15.5387 7.83824 15.4342 7.78351C15.3297 7.72879 15.2129 7.7001 15.0943 7.7C14.9974 7.7099 14.8994 7.6986 14.8076 7.66692C14.7158 7.63525 14.6324 7.58399 14.5635 7.51691C14.4946 7.44982 14.4419 7.36859 14.4094 7.27916C14.3769 7.18973 14.3653 7.09436 14.3754 7C14.3653 6.90564 14.3769 6.81027 14.4094 6.72084C14.4419 6.63141 14.4946 6.55018 14.5635 6.48309C14.6324 6.41601 14.7158 6.36475 14.8076 6.33308C14.8994 6.3014 14.9974 6.2901 15.0943 6.3Z" fill="#3A3F51"/>
  </Svg>
);

// Ícone X (fechar)
const CloseIcon: React.FC = () => (
  <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
    <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51"/>
  </Svg>
);

// Ícone de busca
const SearchIcon: React.FC = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M15 15L11.6556 11.6556M13.4444 7.22222C13.4444 10.6587 10.6587 13.4444 7.22222 13.4444C3.78578 13.4444 1 10.6587 1 7.22222C1 3.78578 3.78578 1 7.22222 1C10.6587 1 13.4444 3.78578 13.4444 7.22222Z"
      stroke="#7D8592"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Radio visual compatível com a etapa 01
const RadioIcon = ({ selected }: { selected: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z"
      fill={selected ? '#1777CF' : '#6F7DA0'}
      stroke="#FCFCFC"
    />
    {selected ? <Path d="M10 5a5 5 0 100 10 5 5 0 000-10z" fill="#1777CF"/> : null}
  </Svg>
);

// Helpers
const capitalizeFirstLetter = (s: string) => {
  if (!s) return s;
  return s.replace(/^(\s*)([a-zA-ZÀ-ÖØ-öø-ÿ])/u, (_, spaces: string, letter: string) => spaces + letter.toUpperCase());
};
const normalizeText = (str: string) => str
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

type Product = { id: string; name: string };

const NewAppointmentProducts: React.FC<NewAppointmentProductsProps> = ({ visible, onClose, onBack, onNext, onSelectProduct, summaries, onSelectStep, onUpdateSummary, maxAccessibleStep = 1, transitionDirection = 'forward', embedded = false, registerNextHandler, onCanProceedChange }) => {
  const [fullFlowVisible, setFullFlowVisible] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const products: Product[] = useMemo(() => [
    { id: 'p1', name: 'Holding Patrimonial' },
    { id: 'p2', name: 'Ativos fundiários' },
    { id: 'p3', name: 'Planejamento Tributário' },
  ], []);

  const filteredProducts = useMemo(() => {
    const sText = normalizeText(search);
    if (!sText) return products;
    return products.filter((p) => normalizeText(p.name).includes(sText));
  }, [search, products]);

  const isNextDisabled = selectedProduct === null || selectedProduct === 'none';

  // Hidrata seleção a partir do resumo salvo, sem sobrescrever
  useEffect(() => {
    if (!visible) return;
    const label = summaries?.[2] ?? '';
    const normLabel = normalizeText(label);
    const normNone = normalizeText('Nenhum');
    if (normLabel) {
      if (normLabel === normNone) {
        setSelectedProduct('none');
        onSelectProduct?.(null);
        console.log('[Products] Hydrate: resumo indica Nenhum');
      } else {
        const match = products.find((p) => normalizeText(p.name) === normLabel);
        if (match) {
          setSelectedProduct(match.id);
          onSelectProduct?.(match.id);
          console.log('[Products] Hydrate: resumo indica produto', match.id, match.name);
        } else {
          // resumo desconhecido: manter seleção atual; se inexistente, cair para none
          if (!selectedProduct) {
            setSelectedProduct('none');
            onSelectProduct?.(null);
            console.log('[Products] Hydrate: resumo não reconhecido, aplicando None');
          }
        }
      }
    } else {
      // sem resumo: não alterar summary; apenas preparar estado local
      if (!selectedProduct) {
        setSelectedProduct('none');
        onSelectProduct?.(null);
        console.log('[Products] Hydrate: sem resumo, aplicando None');
      }
    }
  }, [visible, summaries, products]);

  const handleSelectNone = () => {
    setSelectedProduct('none');
    onSelectProduct?.(null);
    onUpdateSummary?.(2, 'Nenhum');
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProduct(id);
    onSelectProduct?.(id);
    const found = products.find((p) => p.id === id);
    if (found) onUpdateSummary?.(2, found.name);
  };

  // Expor estado de avanço para o rodapé unificado
  useEffect(() => {
    onCanProceedChange?.(!isNextDisabled);
  }, [isNextDisabled, onCanProceedChange]);

  // Registrar handler de "Próximo" para o rodapé unificado
  useEffect(() => {
    if (registerNextHandler) {
      registerNextHandler(() => {
        if (!isNextDisabled && selectedProduct) {
          onNext?.(selectedProduct);
        }
      });
    }
  }, [registerNextHandler, isNextDisabled, selectedProduct, onNext]);

  // Modo embed: renderiza apenas o miolo, sem cabeçalho/rodapé próprios
  if (embedded) {
    return (
      <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
        <View style={styles.contentFlex}>
          <View style={styles.introContainer}>
            <View style={styles.centerBlock}>
              <Text style={styles.sectionTitle}>Produtos</Text>
              <Text style={styles.sectionSubtitle}>Selecione um produto para continuar</Text>
            </View>
            <View style={styles.stepsRow}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={[styles.stepDot, i <= 1 ? styles.stepDotActive : styles.stepDotInactive]} />
              ))}
            </View>
          </View>
          <View style={styles.searchRow}>
            <View style={styles.searchIconWrap}><SearchIcon /></View>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={(text) => setSearch(capitalizeFirstLetter(text))}
              placeholder="pesquise aqui"
              placeholderTextColor="#91929E"
              cursorColor="#1777CF"
              selectionColor="#1777CF"
            />
          </View>
          <TouchableOpacity style={styles.noneRow} onPress={handleSelectNone} accessibilityRole="button" accessibilityLabel="Selecionar nenhum" activeOpacity={1}>
            <RadioIcon selected={selectedProduct === 'none'} />
            <Text style={styles.noneLabel}>Nenhum</Text>
          </TouchableOpacity>
          <View style={styles.listDivider} />
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredProducts.map((p, idx) => (
              <View key={p.id}>
                <TouchableOpacity style={styles.productRow} onPress={() => handleSelectProduct(p.id)} accessibilityRole="button" accessibilityLabel={`Selecionar ${p.name}`} activeOpacity={1}>
                  <RadioIcon selected={selectedProduct === p.id} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                  </View>
                </TouchableOpacity>
                {idx < filteredProducts.length - 1 ? <View style={styles.listDivider} /> : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </SlideInView>
    );
  }

  // Modo padrão (modal próprio)
  return (
    <>
      <Modal visible={visible} transparent animationType="none">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Novo agendamento</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.iconButton} onPress={() => setFullFlowVisible(true)} accessibilityRole="button" accessibilityLabel="Visualizar">
                  <EyeIcon />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
                  <CloseIcon />
                </TouchableOpacity>
              </View>
            </View>
            <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
              <View style={styles.contentFlex}>
                <View style={styles.introContainer}>
                  <View style={styles.centerBlock}>
                    <Text style={styles.sectionTitle}>Produtos</Text>
                    <Text style={styles.sectionSubtitle}>Selecione um produto para continuar</Text>
                  </View>
                  <View style={styles.stepsRow}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <View key={i} style={[styles.stepDot, i <= 1 ? styles.stepDotActive : styles.stepDotInactive]} />
                    ))}
                  </View>
                </View>
                <View style={styles.searchRow}>
                  <View style={styles.searchIconWrap}><SearchIcon /></View>
                  <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={(text) => setSearch(capitalizeFirstLetter(text))}
                    placeholder="pesquise aqui"
                    placeholderTextColor="#91929E"
                    cursorColor="#1777CF"
                    selectionColor="#1777CF"
                  />
                </View>
                <TouchableOpacity style={styles.noneRow} onPress={handleSelectNone} accessibilityRole="button" accessibilityLabel="Selecionar nenhum" activeOpacity={1}>
                  <RadioIcon selected={selectedProduct === 'none'} />
                  <Text style={styles.noneLabel}>Nenhum</Text>
                </TouchableOpacity>
                <View style={styles.listDivider} />
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                  {filteredProducts.map((p, idx) => (
                    <View key={p.id}>
                      <TouchableOpacity style={styles.productRow} onPress={() => handleSelectProduct(p.id)} accessibilityRole="button" accessibilityLabel={`Selecionar ${p.name}`} activeOpacity={1}>
                        <RadioIcon selected={selectedProduct === p.id} />
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>{p.name}</Text>
                        </View>
                      </TouchableOpacity>
                      {idx < filteredProducts.length - 1 ? <View style={styles.listDivider} /> : null}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </SlideInView>
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[styles.footerButton]}
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Text style={styles.footerButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonPrimary, isNextDisabled && styles.footerButtonDisabled]}
                disabled={isNextDisabled}
                accessibilityRole="button"
                accessibilityLabel="Próximo"
                accessibilityState={{ disabled: isNextDisabled }}
                onPress={() => {
                  if (!isNextDisabled && selectedProduct) {
                    onNext?.(selectedProduct);
                  }
                }}
              >
                <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FullFlow visible={fullFlowVisible} onClose={() => setFullFlowVisible(false)} currentStep={2} summaries={summaries} onSelectStep={onSelectStep} maxAccessibleStep={maxAccessibleStep} />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    top: 15,
    bottom: 15,
    left: 15,
    right: 15,
    backgroundColor: '#FCFCFC',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: '#3A3F51',
    fontFamily: 'Inter_700Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_400Regular',
    marginTop: 6,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    marginTop: 14,
  },
  introContainer: {
    alignSelf: 'stretch',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
    flex: 1,
    minWidth: 24,
  },
  stepDotActive: {
    backgroundColor: '#1777CF',
  },
  stepDotInactive: {
    backgroundColor: '#E5E7EB',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 20,
  },
  searchIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    ...(Platform.OS === 'web'
      ? ({ outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' } as any)
      : {}),
  },
  noneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 5,
  },
  noneLabel: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  listDivider: {
    height: 0.08,
    backgroundColor: '#D8E0F0',
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  list: {
    flex: 1,
  },
  contentFlex: {
    flex: 1,
    alignSelf: 'stretch',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonDisabled: {
    opacity: 0.5,
    ...(Platform.OS === 'web' ? ({ cursor: 'not-allowed' } as any) : {}),
  },
  footerButtonPrimary: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  footerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#3A3F51',
  },
  footerButtonTextPrimary: {
    color: '#FCFCFC',
  },
});

export default NewAppointmentProducts;