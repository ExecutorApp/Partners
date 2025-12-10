import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FullFlow from './13.FullFlow';
import SlideInView from './SlideInView';

interface NewAppointmentAgendaTypesProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext?: (agendaTypeId: string) => void;
  onSelectAgendaType?: (agendaTypeId: string | null) => void;
  summaries?: Partial<Record<number, string>>;
  onSelectStep?: (step: number) => void;
  onUpdateSummary?: (step: number, value: string) => void;
  maxAccessibleStep?: number;
  transitionDirection?: 'forward' | 'backward';
  // Embed mode (unified modal)
  embedded?: boolean;
  registerNextHandler?: (handler: () => void) => void;
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

// Helpers (removidos os utilitários de busca por não serem mais necessários)

type AgendaType = { id: string; name: string };

const NewAppointmentAgendaTypes: React.FC<NewAppointmentAgendaTypesProps> = ({ visible, onClose, onBack, onNext, onSelectAgendaType, summaries, onSelectStep, onUpdateSummary, maxAccessibleStep = 1, transitionDirection = 'forward', embedded = false, registerNextHandler, onCanProceedChange }) => {
  const [fullFlowVisible, setFullFlowVisible] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const agendaTypes: AgendaType[] = useMemo(() => [
    { id: 'personal', name: 'Pessoal' },
    { id: 'shared', name: 'Compartilhada' },
  ], []);

  const isNextDisabled = selectedType === null;

  // Notifica rodapé unificado sobre possibilidade de prosseguir
  useEffect(() => {
    onCanProceedChange?.(!isNextDisabled);
  }, [isNextDisabled, onCanProceedChange]);

  // Registra handler do botão Próximo no modo embed
  useEffect(() => {
    if (!embedded || !registerNextHandler) return;
    registerNextHandler(() => {
      if (!isNextDisabled && selectedType) {
        onNext?.(selectedType);
      }
    });
  }, [embedded, registerNextHandler, isNextDisabled, selectedType, onNext]);

  // Inicialização: respeita resumo salvo; aplica padrão somente se não houver seleção prévia
  useEffect(() => {
    if (!visible) return;
    // Se já há seleção local, não sobrescreve
    if (selectedType) return;
    const summ = (summaries?.[5] ?? '').toLowerCase();
    const fromSummary = summ.includes('compart') ? 'shared' : summ.includes('pessoal') ? 'personal' : null;
    if (fromSummary) {
      setSelectedType(fromSummary);
      onSelectAgendaType?.(fromSummary);
      // Não atualiza resumo aqui; já está persistido
      return;
    }
    // Sem resumo: aplica padrão do sistema
    setSelectedType('personal');
    onSelectAgendaType?.('personal');
    onUpdateSummary?.(5, 'Pessoal');
  }, [visible]);

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    onSelectAgendaType?.(id);
    const found = agendaTypes.find((t) => t.id === id);
    if (found) onUpdateSummary?.(5, found.name);
  };

  // Renderização: embed retorna apenas conteúdo central; caso contrário, mantém modal completo
  if (embedded) {
    return (
      <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
        <View style={styles.contentFlex}>
          {/* Intro */}
          <View style={styles.introContainer}>
            <View style={styles.centerBlock}>
              <Text style={styles.sectionTitle}>Tipos de agenda</Text>
              <Text style={styles.sectionSubtitle}>Selecione uma agenda para continuar</Text>
            </View>
            <View style={styles.stepsRow}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={[styles.stepDot, i <= 4 ? styles.stepDotActive : styles.stepDotInactive]} />
              ))}
            </View>
          </View>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {agendaTypes.map((t, idx) => (
              <View key={t.id}>
                <TouchableOpacity style={styles.productRow} activeOpacity={1} onPress={() => handleSelectType(t.id)} accessibilityRole="button" accessibilityLabel={`Selecionar ${t.name}`}>
                  <RadioIcon selected={selectedType === t.id} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{t.name}</Text>
                  </View>
                </TouchableOpacity>
                {idx < agendaTypes.length - 1 ? <View style={styles.listDivider} /> : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </SlideInView>
    );
  }

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
                    <Text style={styles.sectionTitle}>Tipos de agenda</Text>
                    <Text style={styles.sectionSubtitle}>Selecione uma agenda para continuar</Text>
                  </View>
                  <View style={styles.stepsRow}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <View key={i} style={[styles.stepDot, i <= 4 ? styles.stepDotActive : styles.stepDotInactive]} />
                    ))}
                  </View>
                </View>
                <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                  {agendaTypes.map((t, idx) => (
                    <View key={t.id}>
                      <TouchableOpacity style={styles.productRow} activeOpacity={1} onPress={() => handleSelectType(t.id)} accessibilityRole="button" accessibilityLabel={`Selecionar ${t.name}`}>
                        <RadioIcon selected={selectedType === t.id} />
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>{t.name}</Text>
                        </View>
                      </TouchableOpacity>
                      {idx < agendaTypes.length - 1 ? <View style={styles.listDivider} /> : null}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </SlideInView>
            <View style={styles.footerRow}>
              <TouchableOpacity style={[styles.footerButton]} onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar">
                <Text style={styles.footerButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonPrimary, isNextDisabled && styles.footerButtonDisabled]}
                disabled={isNextDisabled}
                accessibilityRole="button"
                accessibilityLabel="Próximo"
                accessibilityState={{ disabled: isNextDisabled }}
                onPress={() => {
                  if (!isNextDisabled && selectedType) {
                    onNext?.(selectedType);
                  }
                }}
              >
                <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FullFlow visible={fullFlowVisible} onClose={() => setFullFlowVisible(false)} currentStep={5} summaries={summaries} onSelectStep={onSelectStep} maxAccessibleStep={maxAccessibleStep} />
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
    marginTop: 15,
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

  listDivider: {
    height: 0.08,
    backgroundColor: '#D8E0F0',
    alignSelf: 'stretch',
    marginTop: 25,
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
    paddingVertical: 0,
    marginTop: 25,
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

export default NewAppointmentAgendaTypes;