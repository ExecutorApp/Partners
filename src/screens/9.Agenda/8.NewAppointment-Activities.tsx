import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import FullFlow from './13.FullFlow';
import SlideInView from './SlideInView';

interface NewAppointmentActivitiesProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext?: (activityId: string) => void;
  onSelectActivity?: (activityId: string | null) => void;
  summaries?: Partial<Record<number, string>>;
  onSelectStep?: (step: number) => void;
  onUpdateSummary?: (step: number, value: string) => void;
  maxAccessibleStep?: number;
  transitionDirection?: 'forward' | 'backward';
  embedded?: boolean;
  registerNextHandler?: (fn: () => void) => void;
  onCanProceedChange?: (canProceed: boolean) => void;
}

// Formata para deixar a primeira letra da primeira palavra em maiúscula (mantendo espaços à esquerda)
const capitalizeFirstLetter = (s: string) => {
  if (!s) return s;
  return s.replace(/^(\s*)([a-zA-ZÀ-ÖØ-öø-ÿ])/u, (_, spaces: string, letter: string) => spaces + letter.toUpperCase());
};

// Ícone Olho (visualização) – padrão do fluxo
const EyeIcon: React.FC = () => (
  <Svg width={23} height={14} viewBox="0 0 23 14" fill="none">
    <Path d="M11.5 0C5.46878 0 0.364891 6.3 0.149234 6.573C0.0524697 6.6954 0 6.84553 0 7C0 7.15447 0.0524697 7.3046 0.149234 7.427C0.364891 7.7 5.46878 14 11.5 14C17.5312 14 22.6351 7.7 22.8508 7.427C22.9475 7.3046 23 7.15447 23 7C23 6.84553 22.9475 6.6954 22.8508 6.573C22.6351 6.3 17.5312 0 11.5 0ZM11.5 12.6C7.02152 12.6 2.87371 8.4 1.65165 7C2.87371 5.6 7.01433 1.4 11.5 1.4C15.9857 1.4 20.1263 5.6 21.3484 7C20.1263 8.4 15.9857 12.6 11.5 12.6Z" fill="#3A3F51"/>
    <Path d="M15.0943 6.3C15.2129 6.29991 15.3297 6.27122 15.4342 6.21649C15.5387 6.16176 15.6277 6.0827 15.6932 5.98635C15.7586 5.89001 15.7986 5.77937 15.8095 5.66433C15.8204 5.54928 15.8019 5.43339 15.7556 5.327C15.3602 4.56023 14.7517 3.9169 13.9994 3.47018C13.2471 3.02345 12.3811 2.79126 11.5 2.8C10.3561 2.8 9.25902 3.2425 8.45014 4.03015C7.64127 4.8178 7.18685 5.88609 7.18685 7C7.18685 8.11391 7.64127 9.1822 8.45014 9.96985C9.25902 10.7575 10.3561 11.2 11.5 11.2C12.3811 11.2087 13.2471 10.9765 13.9994 10.5298C14.7517 10.0831 15.3602 9.43977 15.7556 8.673C15.8019 8.56661 15.8204 8.45072 15.8095 8.33568C15.7986 8.22063 15.7586 8.11 15.6932 8.01365C15.6277 7.9173 15.5387 7.83824 15.4342 7.78351C15.3297 7.72879 15.2129 7.7001 15.0943 7.7C14.9974 7.7099 14.8994 7.6986 14.8076 7.66692C14.7158 7.63525 14.6324 7.58399 14.5635 7.51691C14.4946 7.44982 14.4419 7.36859 14.4094 7.27916C14.3769 7.18973 14.3653 7.09436 14.3754 7C14.3653 6.90564 14.3769 6.81027 14.4094 6.72084C14.4419 6.63141 14.4946 6.55018 14.5635 6.48309C14.6324 6.41601 14.7158 6.36475 14.8076 6.33308C14.8994 6.3014 14.9974 6.2901 15.0943 6.3Z" fill="#3A3F51"/>
  </Svg>
);

// Ícone X (fechar) – padrão do fluxo
const CloseIcon: React.FC = () => (
  <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
    <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51"/>
  </Svg>
);

// Ícone de busca — mesmo da tela 4.NewAppointment01
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

// Radio — mesmo padrão visual da tela 4.NewAppointment01
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

// Ícone check verde — original fornecido
const GreenCheckIcon: React.FC = () => (
  <Svg width={15} height={11} viewBox="0 0 15 11" fill="none">
    <Path d="M14.3216 2.13409L6.19652 10.2589C5.95276 10.5027 5.63278 10.6254 5.31281 10.6254C4.99283 10.6254 4.67285 10.5027 4.42909 10.2589L0.366669 6.19652C-0.122223 5.70786 -0.122223 4.91776 0.366669 4.42909C0.855331 3.9402 1.6452 3.9402 2.13409 4.42909L5.31281 7.6078L12.5542 0.366669C13.0428 -0.122223 13.8327 -0.122223 14.3216 0.366669C14.8103 0.855331 14.8103 1.6452 14.3216 2.13409Z" fill="#1B883C"/>
  </Svg>
);

// Botão de check quadrado — original fornecido
const CheckSquareIcon: React.FC<{ checked?: boolean }> = ({ checked = false }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <G clipPath="url(#clip0_520_1236)">
      <Path fillRule="evenodd" clipRule="evenodd" d="M20 4C20 1.79086 18.2091 0 16 0H4C1.79086 0 0 1.79086 0 4V16C0 18.2091 1.79086 20 4 20H16C18.2091 20 20 18.2091 20 16V4ZM4 2H16L16.1493 2.00549C17.1841 2.08183 18 2.94564 18 4V16L17.9945 16.1493C17.9182 17.1841 17.0544 18 16 18H4L3.85074 17.9945C2.81588 17.9182 2 17.0544 2 16V4L2.00549 3.85074C2.08183 2.81588 2.94564 2 4 2Z" fill="#3A3F51" stroke="#FCFCFC" strokeWidth={0.5}/>
      {checked ? (
        <Path fillRule="evenodd" clipRule="evenodd" d="M16.364 4.87846C16.7266 5.24109 16.7525 5.81293 16.4417 6.20545L16.364 6.29267L9.29289 13.3637C8.93027 13.7264 8.35842 13.7523 7.9659 13.4414L7.87868 13.3637L3.63604 9.1211C3.24552 8.73057 3.24552 8.09741 3.63604 7.70689C3.99867 7.34426 4.57052 7.31835 4.96303 7.62918L5.05025 7.70689L8.58601 11.2416L14.9497 4.87846C15.3124 4.51583 15.8842 4.48993 16.2767 4.80075L16.364 4.87846Z" fill="#1777CF"/>
      ) : null}
    </G>
    <Defs>
      <ClipPath id="clip0_520_1236">
        <Rect width={20} height={20} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

// Botão do checkbox com animação de "pop"
const CheckButton = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={checked ? 'Desmarcar atividade' : 'Marcar atividade'}
      style={styles.checkButtonTouch}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <CheckSquareIcon checked={checked} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function NewAppointmentActivities({ visible, onClose, onBack, onNext, onSelectActivity, summaries, onSelectStep, onUpdateSummary, maxAccessibleStep = 1, transitionDirection = 'forward', embedded = false, registerNextHandler, onCanProceedChange }: NewAppointmentActivitiesProps) {
  const [fullFlowVisible, setFullFlowVisible] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Duas concluídas (02/37) — estado mutável para marcar/desmarcar
  // Inicia com todos os checkboxes desmarcados
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const activities = useMemo(
    () => [
      { id: 'a1', name: 'Reunião 01' },
      { id: 'a2', name: 'Reunião 02' },
      { id: 'a3', name: 'Reunião 03' },
      { id: 'a4', name: 'Reunião 04' },
      { id: 'a5', name: 'Reunião 05' },
      { id: 'a6', name: 'Reunião 06' },
      { id: 'a7', name: 'Reunião 07' },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(a => a.name.toLowerCase().includes(q));
  }, [query, activities]);

  const canProceed = !!selectedActivity;

  // Notificar rodapé unificado sobre possibilidade de avançar
  useEffect(() => {
    onCanProceedChange?.(canProceed);
  }, [canProceed, onCanProceedChange]);

  // Registrar handler do botão "Próximo" para modo embed
  useEffect(() => {
    if (registerNextHandler) {
      registerNextHandler(() => {
        if (selectedActivity) {
          onNext?.(selectedActivity);
        }
      });
    }
  }, [registerNextHandler, selectedActivity, onNext]);

  // Utilitários de seleção
  const getFirstNonCompletedId = (list: { id: string; name: string }[], done: Set<string>) => {
    const found = list.find(a => !done.has(a.id));
    return found ? found.id : null;
  };

  const getNextNonCompletedIdBelow = (list: { id: string; name: string }[], currentId: string, done: Set<string>) => {
    const idx = list.findIndex(a => a.id === currentId);
    if (idx === -1) return null;
    for (let i = idx + 1; i < list.length; i++) {
      if (!done.has(list[i].id)) return list[i].id;
    }
    return null;
  };

  // Sempre manter um rádio ativo: inicial e após mudanças de filtro/conclusão
  // Manter um rádio ativo, preferindo manter a seleção atual mesmo se concluída.
  useEffect(() => {
    if (!filtered.length) {
      setSelectedActivity(null);
      return;
    }
    if (!selectedActivity || !filtered.some(a => a.id === selectedActivity)) {
      const firstId = getFirstNonCompletedId(filtered, completedIds) || filtered[0]?.id || null;
      setSelectedActivity(firstId);
    }
  }, [filtered, completedIds, selectedActivity]);

  // Seleção padrão: Reunião 01 (ao abrir a etapa)
  useEffect(() => {
    if (visible) {
      setSelectedActivity('a1');
      onSelectActivity?.('a1');
      onUpdateSummary?.(4, 'Reunião 01');
    }
  }, [visible]);

  // Atualiza o resumo conforme a atividade selecionada muda
  useEffect(() => {
    if (selectedActivity) {
      const found = activities.find(a => a.id === selectedActivity);
      if (found) onUpdateSummary?.(4, found.name);
    } else {
      onUpdateSummary?.(4, '');
    }
  }, [selectedActivity]);

  const toggleCompleted = (id: string, nextChecked: boolean) => {
    // Calcula o novo conjunto de concluídos
    const nextSet = new Set(completedIds);
    if (nextChecked) {
      // Marcar o item selecionado e todos os anteriores como concluídos
      nextSet.add(id);
      const idx = activities.findIndex(a => a.id === id);
      if (idx >= 0) {
        for (let i = 0; i < idx; i++) {
          nextSet.add(activities[i].id);
        }
      }
    } else {
      // Ao desmarcar, remover o item e todas as reuniões posteriores (cascata inversa)
      nextSet.delete(id);
      const idx = activities.findIndex(a => a.id === id);
      if (idx >= 0) {
        for (let i = idx + 1; i < activities.length; i++) {
          nextSet.delete(activities[i].id);
        }
      }
    }
    setCompletedIds(nextSet);

    // Regra: se o usuário concluir o item atualmente selecionado,
    // selecionar automaticamente o próximo rádio (de baixo). Caso não haja,
    // selecionar o primeiro não concluído da lista (mantendo sempre um ativo).
    if (nextChecked) {
      if (selectedActivity === id) {
        const nextId = getNextNonCompletedIdBelow(filtered, id, nextSet) || getFirstNonCompletedId(filtered, nextSet);
        setSelectedActivity(nextId);
      } else {
        // Se a seleção atual ficar inválida por se tornar concluída, o useEffect acima corrige.
      }
    } else {
      // Ao desmarcar, sempre selecionar o primeiro não concluído (de cima para baixo)
      const firstId = getFirstNonCompletedId(filtered, nextSet);
      setSelectedActivity(firstId);
    }
  };

  // Modo embed: apenas conteúdo central, sem cabeçalho/rodapé próprios
  if (embedded) {
    return (
      <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
        <View style={styles.introContainer}>
          <View style={styles.centerBlock}>
            <Text style={styles.sectionTitle}>Atividades (02/37)</Text>
            <Text style={styles.sectionSubtitle}>Selecione uma atividade para continuar</Text>
          </View>
          <View style={styles.stepsRow}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={[styles.stepDot, i < 4 ? styles.stepDotActive : styles.stepDotInactive]} />
            ))}
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchIconWrap}><SearchIcon /></View>
          <TextInput
            style={styles.searchInput}
            placeholder="pesquise aqui"
            value={query}
            onChangeText={(text) => setQuery(capitalizeFirstLetter(text))}
            placeholderTextColor="#91929E"
            cursorColor="#1777CF"
            selectionColor="#1777CF"
          />
        </View>

        <ScrollView style={styles.list} contentContainerStyle={{ paddingVertical: 6 }}>
          <View style={styles.contentFlex}>
            {filtered.map((act, idx) => {
              const isCompleted = completedIds.has(act.id);
              const isSelected = selectedActivity === act.id;
              return (
                <React.Fragment key={act.id}>
                  <TouchableOpacity
                    style={styles.activityRow}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (!isCompleted) {
                        const idxGlobal = activities.findIndex(a => a.id === act.id);
                        if (idxGlobal !== -1) {
                          const nextSet = new Set<string>();
                          for (let i = 0; i < idxGlobal; i++) {
                            nextSet.add(activities[i].id);
                          }
                          setCompletedIds(nextSet);
                        }
                        setSelectedActivity(act.id);
                        onSelectActivity?.(act.id);
                        onUpdateSummary?.(4, act.name);
                      }
                    }}
                  >
                    <View style={styles.activityLeft}>
                      {isCompleted ? (
                        <GreenCheckIcon />
                      ) : (
                        <RadioIcon selected={isSelected} />
                      )}
                      <Text style={styles.activityName}>{act.name}</Text>
                    </View>
                    <CheckButton
                      checked={isCompleted}
                      onToggle={() => toggleCompleted(act.id, !isCompleted)}
                    />
                  </TouchableOpacity>
                  {idx < filtered.length - 1 && <View style={styles.listDivider} />}
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>
      </SlideInView>
    );
  }

  // Modo padrão com Modal próprio
  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
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
              <View style={styles.introContainer}>
                <View style={styles.centerBlock}>
                  <Text style={styles.sectionTitle}>Atividades (02/37)</Text>
                  <Text style={styles.sectionSubtitle}>Selecione uma atividade para continuar</Text>
                </View>
                <View style={styles.stepsRow}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <View key={i} style={[styles.stepDot, i < 4 ? styles.stepDotActive : styles.stepDotInactive]} />
                  ))}
                </View>
              </View>

              <View style={styles.searchRow}>
                <View style={styles.searchIconWrap}><SearchIcon /></View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="pesquise aqui"
                  value={query}
                  onChangeText={(text) => setQuery(capitalizeFirstLetter(text))}
                  placeholderTextColor="#91929E"
                  cursorColor="#1777CF"
                  selectionColor="#1777CF"
                />
              </View>

              <ScrollView style={styles.list} contentContainerStyle={{ paddingVertical: 6 }}>
                <View style={styles.contentFlex}>
                  {filtered.map((act, idx) => {
                    const isCompleted = completedIds.has(act.id);
                    const isSelected = selectedActivity === act.id;
                    return (
                      <React.Fragment key={act.id}>
                        <TouchableOpacity
                          style={styles.activityRow}
                          activeOpacity={0.8}
                          onPress={() => {
                            if (!isCompleted) {
                              const idxGlobal = activities.findIndex(a => a.id === act.id);
                              if (idxGlobal !== -1) {
                                const nextSet = new Set<string>();
                                for (let i = 0; i < idxGlobal; i++) {
                                  nextSet.add(activities[i].id);
                                }
                                setCompletedIds(nextSet);
                              }
                              setSelectedActivity(act.id);
                              onSelectActivity?.(act.id);
                              onUpdateSummary?.(4, act.name);
                            }
                          }}
                        >
                          <View style={styles.activityLeft}>
                            {isCompleted ? (
                              <GreenCheckIcon />
                            ) : (
                              <RadioIcon selected={isSelected} />
                            )}
                            <Text style={styles.activityName}>{act.name}</Text>
                          </View>
                          <CheckButton
                            checked={isCompleted}
                            onToggle={() => toggleCompleted(act.id, !isCompleted)}
                          />
                        </TouchableOpacity>
                        {idx < filtered.length - 1 && <View style={styles.listDivider} />}
                      </React.Fragment>
                    );
                  })}
                </View>
              </ScrollView>
            </SlideInView>

            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Text style={styles.footerButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonPrimary, !canProceed && styles.footerButtonDisabled]}
                disabled={!canProceed}
                onPress={() => {
                  if (selectedActivity) {
                    onNext?.(selectedActivity);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Próximo"
                accessibilityState={{ disabled: !canProceed }}
              >
                <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FullFlow visible={fullFlowVisible} onClose={() => setFullFlowVisible(false)} currentStep={4} summaries={summaries} onSelectStep={onSelectStep} maxAccessibleStep={maxAccessibleStep} />
    </>
  );
}

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
  introContainer: {
    alignSelf: 'stretch',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
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
    marginBottom: 15,
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
    marginTop: 14,
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
  list: {
    flex: 1,
  },
  contentFlex: {
    flex: 1,
    alignSelf: 'stretch',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#D8E0F0',
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activityName: {
    flex: 1,
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
  },
  checkButtonTouch: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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