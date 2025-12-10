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
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FullFlow from './13.FullFlow';
import ModalAlertDeleteCommitment from './14.ModalAlert-DeleteCommitment';
import { getLocalStorage, idbGet, idbSet } from '../../utils/persistentStorageEngine';
import SlideInView from './SlideInView';
import TimetableModal from './17.TimetableModal';

interface DateTimeProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSchedule?: (payload: { date: Date; slots: { start: string; end: string }[] }) => void;
  summaries?: Partial<Record<number, string>>;
  onSelectStep?: (index: number) => void;
  onUpdateSummary?: (step: number, value: string) => void;
  maxAccessibleStep?: number;
  transitionDirection?: 'forward' | 'backward';
  // Modo embed: sem cabeçalho/rodapé, expõe avanço externo
  embedded?: boolean;
  registerNextHandler?: (fn: () => void) => void;
  onCanProceedChange?: (canProceed: boolean) => void;
}

// Ícone Olho – original do Figma com fill #3A3F51
const EyeIcon: React.FC = () => (
  <Svg width={23} height={14} viewBox="0 0 23 14" fill="none">
    <Path d="M11.5 0C5.46878 0 0.364891 6.3 0.149234 6.573C0.0524697 6.6954 0 6.84553 0 7C0 7.15447 0.0524697 7.3046 0.149234 7.427C0.364891 7.7 5.46878 14 11.5 14C17.5312 14 22.6351 7.7 22.8508 7.427C22.9475 7.3046 23 7.15447 23 7C23 6.84553 22.9475 6.6954 22.8508 6.573C22.6351 6.3 17.5312 0 11.5 0ZM11.5 12.6C7.02152 12.6 2.87371 8.4 1.65165 7C2.87371 5.6 7.01433 1.4 11.5 1.4C15.9857 1.4 20.1263 5.6 21.3484 7C20.1263 8.4 15.9857 12.6 11.5 12.6Z" fill="#3A3F51"/>
    <Path d="M15.0943 6.3C15.2129 6.29991 15.3297 6.27122 15.4342 6.21649C15.5387 6.16176 15.6277 6.0827 15.6932 5.98635C15.7586 5.89001 15.7986 5.77937 15.8095 5.66433C15.8204 5.54928 15.8019 5.43339 15.7556 5.327C15.3602 4.56023 14.7517 3.9169 13.9994 3.47018C13.2471 3.02345 12.3811 2.79126 11.5 2.8C10.3561 2.8 9.25902 3.2425 8.45014 4.03015C7.64127 4.8178 7.18685 5.88609 7.18685 7C7.18685 8.11391 7.64127 9.1822 8.45014 9.96985C9.25902 10.7575 10.3561 11.2 11.5 11.2C12.3811 11.2087 13.2471 10.9765 13.9994 10.5298C14.7517 10.0831 15.3602 9.43977 15.7556 8.673C15.8019 8.56661 15.8204 8.45072 15.8095 8.33568C15.7986 8.22063 15.7586 8.11 15.6932 8.01365C15.6277 7.9173 15.5387 7.83824 15.4342 7.78351C15.3297 7.72879 15.2129 7.7001 15.0943 7.7C14.9974 7.7099 14.8994 7.6986 14.8076 7.66692C14.7158 7.63525 14.6324 7.58399 14.5635 7.51691C14.4946 7.44982 14.4419 7.36859 14.4094 7.27916C14.3769 7.18973 14.3653 7.09436 14.3754 7C14.3653 6.90564 14.3769 6.81027 14.4094 6.72084C14.4419 6.63141 14.4946 6.55018 14.5635 6.48309C14.6324 6.41601 14.7158 6.36475 14.8076 6.33308C14.8994 6.3014 14.9974 6.2901 15.0943 6.3Z" fill="#3A3F51"/>
  </Svg>
);

// Ícone X – original do Figma com fill #3A3F51
const CloseIcon: React.FC = () => (
  <Svg width={13} height={12} viewBox="0 0 13 12" fill="none">
    <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51"/>
  </Svg>
);

// Ícones fornecidos (setas, relógio, +, lixeira)
const ArrowLeftIcon: React.FC<{ style?: any }> = ({ style }) => (
  <Svg style={style} width={7} height={10} viewBox="0 0 7 10" fill="none">
    <Path d="M6.18333 1.175L2.35833 5L6.18333 8.825L5 10L0 5L5 0L6.18333 1.175Z" fill="#3A3F51" />
  </Svg>
);
const ArrowRightIcon: React.FC = () => <ArrowLeftIcon style={{ transform: [{ rotate: '180deg' }] }} />;

const ClockIcon: React.FC = () => (
  <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
    <Path d="M9.04462 4.1567C8.99841 3.75883 8.66027 3.45 8.25 3.45C7.80817 3.45 7.45 3.80817 7.45 4.25V8.45L7.45685 8.55465C7.49308 8.82979 7.67051 9.06969 7.92935 9.18293L11.1293 10.5829L11.217 10.6154C11.6 10.7325 12.0185 10.5465 12.1829 10.1707L12.2154 10.083C12.3325 9.69999 12.1465 9.28152 11.7707 9.11707L9.05 7.9268V4.25L9.04462 4.1567Z" fill="#7D8592"/>
    <Path fillRule="evenodd" clipRule="evenodd" d="M8.25 0.25C3.83172 0.25 0.25 3.83172 0.25 8.25C0.25 12.6683 3.83172 16.25 8.25 16.25C12.6683 16.25 16.25 12.6683 16.25 8.25C16.25 3.83172 12.6683 0.25 8.25 0.25ZM8.25 1.85C11.7846 1.85 14.65 4.71538 14.65 8.25C14.65 11.7846 11.7846 14.65 8.25 14.65C4.71538 14.65 1.85 11.7846 1.85 8.25C1.85 4.71538 4.71538 1.85 8.25 1.85Z" fill="#7D8592"/>
    <Path d="M9.04462 4.1567C8.99841 3.75883 8.66027 3.45 8.25 3.45C7.80817 3.45 7.45 3.80817 7.45 4.25V8.45L7.45685 8.55465C7.49308 8.82979 7.67051 9.06969 7.92935 9.18293L11.1293 10.5829L11.217 10.6154C11.6 10.7325 12.0185 10.5465 12.1829 10.1707L12.2154 10.083C12.3325 9.69999 12.1465 9.28152 11.7707 9.11707L9.05 7.9268V4.25L9.04462 4.1567Z" stroke="#FCFCFC" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round"/>
    <Path fillRule="evenodd" clipRule="evenodd" d="M8.25 0.25C3.83172 0.25 0.25 3.83172 0.25 8.25C0.25 12.6683 3.83172 16.25 8.25 16.25C12.6683 16.25 16.25 12.6683 16.25 8.25C16.25 3.83172 12.6683 0.25 8.25 0.25ZM8.25 1.85C11.7846 1.85 14.65 4.71538 14.65 8.25C14.65 11.7846 11.7846 14.65 8.25 14.65C4.71538 14.65 1.85 11.7846 1.85 8.25C1.85 4.71538 4.71538 1.85 8.25 1.85Z" stroke="#FCFCFC" strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PlusIcon: React.FC = () => (
  <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
    <Path d="M11.1818 4.90909H7.09088V0.818182C7.09088 0.366544 6.72433 0 6.27269 0H5.72727C5.27563 0 4.90909 0.366544 4.90909 0.818182V4.90909H0.818182C0.366544 4.90909 0 5.27563 0 5.72727V6.27269C0 6.72433 0.366544 7.09088 0.818182 7.09088H4.90909V11.1818C4.90909 11.6334 5.27563 12 5.72727 12H6.27269C6.72433 12 7.09088 11.6334 7.09088 11.1818V7.09088H11.1818C11.6334 7.09088 12 6.72433 12 6.27269V5.72727C12 5.27563 11.6334 4.90909 11.1818 4.90909Z" fill="#FCFCFC"/>
  </Svg>
);

const TrashIcon: React.FC = () => (
  <Svg width={13} height={15} viewBox="0 0 13 15" fill="none">
    <Path d="M5.2 6.13636C5.53334 6.13636 5.80808 6.39957 5.84563 6.73867L5.85 6.81818V10.9091C5.85 11.2856 5.55899 11.5909 5.2 11.5909C4.86666 11.5909 4.59192 11.3277 4.55437 10.9886L4.55 10.9091V6.81818C4.55 6.44162 4.84101 6.13636 5.2 6.13636Z" fill="#7D8592"/>
    <Path d="M8.44563 6.73867C8.40808 6.39957 8.13334 6.13636 7.8 6.13636C7.44101 6.13636 7.15 6.44162 7.15 6.81818V10.9091L7.15437 10.9886C7.19192 11.3277 7.46666 11.5909 7.8 11.5909C8.15899 11.5909 8.45 11.2856 8.45 10.9091V6.81818L8.44563 6.73867Z" fill="#7D8592"/>
    <Path fillRule="evenodd" clipRule="evenodd" d="M7.8 0C8.83849 0 9.68738 0.851536 9.74669 1.92527L9.75 2.04545V2.72727H12.35C12.709 2.72727 13 3.03253 13 3.40909C13 3.75875 12.7491 4.04694 12.4258 4.08632L12.35 4.09091H11.7V12.9545C11.7 14.0439 10.8882 14.9343 9.86458 14.9965L9.75 15H3.25C2.21151 15 1.36262 14.1485 1.30331 13.0747L1.3 12.9545V4.09091H0.65C0.291015 4.09091 0 3.78565 0 3.40909C0 3.05943 0.250926 2.77125 0.574196 2.73186L0.65 2.72727H3.25V2.04545C3.25 0.956127 4.0618 0.0656858 5.08542 0.00347229L5.2 0H7.8ZM2.6 4.09091V12.9545C2.6 13.3042 2.85093 13.5924 3.1742 13.6318L3.25 13.6364H9.75C10.0833 13.6364 10.3581 13.3732 10.3956 13.0341L10.4 12.9545V4.09091H2.6ZM8.45 2.72727H4.55V2.04545L4.55437 1.96594C4.59192 1.62685 4.86666 1.36364 5.2 1.36364H7.8L7.8758 1.36822C8.19907 1.40761 8.45 1.69579 8.45 2.04545V2.72727Z" fill="#7D8592"/>
  </Svg>
);

// Utilitários
const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const weekday = ['Domingo', 'Segunda Feira', 'Terça Feira', 'Quarta Feira', 'Quinta Feira', 'Sexta Feira', 'Sábado'][d.getDay()];
  return `${weekday} - ${dd}/${mm}/${yy}`;
};

const isValidTime = (s: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);
const pad2 = (n: number) => String(n).padStart(2, '0');
const nextMinute = (s: string): string => {
  if (!isValidTime(s)) return '00:01';
  const [hh, mm] = s.split(':');
  let h = parseInt(hh, 10);
  let m = parseInt(mm, 10) + 1;
  if (m >= 60) { m = 0; h = (h + 1) % 24; }
  return `${pad2(h)}:${pad2(m)}`;
};
const timeToTuple = (s: string) => {
  if (!isValidTime(s)) return null;
  const [hh, mm] = s.split(':');
  return { h: parseInt(hh, 10), m: parseInt(mm, 10) };
};
const isTimeGE = (a?: string, b?: string) => {
  const ta = timeToTuple(a ?? '');
  const tb = timeToTuple(b ?? '');
  if (!ta || !tb) return false;
  return ta.h > tb.h || (ta.h === tb.h && ta.m >= tb.m);
};

// Máscara de tempo em tempo real: insere ':' após dois dígitos e limita a HH:MM
const maskTime = (input: string): string => {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length === 1) return digits;
  if (digits.length === 2) return `${digits}:`;
  if (digits.length === 3) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
};

// Persistência de horários por data
type SlotPair = { start: string; end: string };
type SlotMap = Record<string, SlotPair[]>;
const SLOTS_STORAGE_KEY = 'partners.agenda.slots.map';
const SELECTED_DATE_STORAGE_KEY = 'partners.agenda.selected.date';

const dateKey = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

async function loadSlotMap(): Promise<SlotMap> {
  const storage = getLocalStorage();
  try {
    const rawLocal = storage ? storage.getItem(SLOTS_STORAGE_KEY) : null;
    const rawIdb = await idbGet(SLOTS_STORAGE_KEY);
    const raw = rawLocal ?? rawIdb;
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SlotMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveSlotMap(map: SlotMap): Promise<void> {
  const storage = getLocalStorage();
  const payload = JSON.stringify(map);
  try {
    if (storage) storage.setItem(SLOTS_STORAGE_KEY, payload);
  } catch {
    // ignora
  }
  try {
    await idbSet(SLOTS_STORAGE_KEY, payload);
  } catch {
    // ignora
  }
}

async function loadSelectedDate(): Promise<Date | null> {
  const storage = getLocalStorage();
  try {
    const rawLocal = storage ? storage.getItem(SELECTED_DATE_STORAGE_KEY) : null;
    const rawIdb = await idbGet(SELECTED_DATE_STORAGE_KEY);
    const raw = rawLocal ?? rawIdb;
    if (!raw) return null;
    const [yyyy, mm, dd] = raw.split('-').map((v) => parseInt(v, 10));
    if (!yyyy || !mm || !dd) return null;
    return new Date(yyyy, mm - 1, dd);
  } catch {
    return null;
  }
}

async function saveSelectedDate(d: Date): Promise<void> {
  const key = dateKey(d);
  const storage = getLocalStorage();
  try { if (storage) storage.setItem(SELECTED_DATE_STORAGE_KEY, key); } catch {}
  try { await idbSet(SELECTED_DATE_STORAGE_KEY, key); } catch {}
}

const DateTimeScreen: React.FC<DateTimeProps> = ({ visible, transitionDirection = 'forward', onClose, onBack, onSchedule, summaries, onSelectStep, onUpdateSummary, maxAccessibleStep = 1, embedded = false, registerNextHandler, onCanProceedChange }) => {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slotStart, setSlotStart] = useState<string>('');
  const [slotEnd, setSlotEnd] = useState<string>('');
  const [slots, setSlots] = useState<SlotPair[]>([]);
  const [slotMap, setSlotMap] = useState<SlotMap>({});
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [daysWithSlots, setDaysWithSlots] = useState<Set<string>>(new Set());
  const [fullFlowVisible, setFullFlowVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);
  const [timetableVisible, setTimetableVisible] = useState<boolean>(false);
  const [timetableTitle, setTimetableTitle] = useState<string>('');
  const [timetableInitial, setTimetableInitial] = useState<string>('00:00');
  const [timetableMinTime, setTimetableMinTime] = useState<string | undefined>(undefined);
  const [timetableTarget, setTimetableTarget] = useState<{ type: 'top' | 'slot'; field: 'start' | 'end'; idx?: number } | null>(null);

  // Largura dinâmica do calendário para alinhar colunas com os títulos da semana
  const [calendarWidth, setCalendarWidth] = useState<number>(0);
  const weekGap = 6;
  const columnWidth = useMemo(() => {
    if (!calendarWidth || calendarWidth <= 0) return 34; // fallback
    return Math.floor((calendarWidth - weekGap * 6) / 7);
  }, [calendarWidth]);

  const addSlot = async () => {
    if (!isValidTime(slotStart) || !isValidTime(slotEnd)) return;
    const key = dateKey(selectedDate);
    const currentForDay = slotMap[key] ?? [];
    const newForDay = [...currentForDay, { start: slotStart, end: slotEnd }];
    const newMap = { ...slotMap, [key]: newForDay };
    setSlotMap(newMap);
    setSlots(newForDay);
    setDaysWithSlots(new Set(Object.keys(newMap)));
    await saveSlotMap(newMap);
    setSlotStart('');
    setSlotEnd('');
  };

  const updateSlot = async (idx: number, field: 'start' | 'end', value: string) => {
    const masked = maskTime(value);
    const key = dateKey(selectedDate);
    const current = slots;
    const updated = current.map((s, i) => (i === idx ? { ...s, [field]: masked } : s));
    setSlots(updated);
    const newMap = { ...slotMap, [key]: updated };
    setSlotMap(newMap);
    setDaysWithSlots(new Set(Object.keys(newMap)));
    await saveSlotMap(newMap);
  };

  const removeSlot = async (idx: number) => {
    const key = dateKey(selectedDate);
    const filtered = slots.filter((_, i) => i !== idx);
    setSlots(filtered);
    const newMap = { ...slotMap };
    if (filtered.length > 0) {
      newMap[key] = filtered;
    } else {
      delete newMap[key];
    }
    setSlotMap(newMap);
    setDaysWithSlots(new Set(Object.keys(newMap)));
    await saveSlotMap(newMap);
  };

  // Hidrata do armazenamento local ao montar
  useEffect(() => {
    (async () => {
      const map = await loadSlotMap();
      setSlotMap(map);
      setDaysWithSlots(new Set(Object.keys(map)));
      // Recupera data selecionada persistida, senão mantém hoje
      const persistedDate = await loadSelectedDate();
      if (persistedDate) {
        setSelectedDate(persistedDate);
        setCurrentDate(new Date(persistedDate.getFullYear(), persistedDate.getMonth(), 1));
        setSlots(map[dateKey(persistedDate)] ?? []);
      } else {
        setSlots(map[dateKey(selectedDate)] ?? []);
      }
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSlots(slotMap[dateKey(selectedDate)] ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Persiste a data selecionada sempre que mudar após hidratação
  useEffect(() => {
    if (!hydrated) return;
    saveSelectedDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, hydrated]);

  // Atualiza o resumo da etapa 7 em tempo real sempre que a data ou os horários mudarem
  useEffect(() => {
    if (!hydrated) return;
    const times = slots.map((s) => `${s.start}-${s.end}`).join(', ');
    const summary = slots.length > 0 ? `${formatDate(selectedDate)}${times ? `: ${times}` : ''}` : '';
    onUpdateSummary?.(7, summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, slots, hydrated]);

  // Calendário mensal simplificado (mesmo padrão visual do Figma/ModalFilters)
  const goPrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const goNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthLabel = `${monthNames[month]} - ${year}`;
  const firstDayWeek = new Date(year, month, 1).getDay(); // 0..6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Células do calendário (6 semanas x 7 dias)
  const cells: { label: number; inMonth: boolean; date: Date }[] = [];
  // Dias anteriores para preencher o início
  for (let i = 0; i < firstDayWeek; i++) {
    const num = daysInPrevMonth - firstDayWeek + 1 + i;
    cells.push({ label: num, inMonth: false, date: new Date(year, month - 1, num) });
  }
  // Dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ label: i, inMonth: true, date: new Date(year, month, i) });
  }
  // Completar até 42 células
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ label: i, inMonth: false, date: new Date(year, month + 1, i) });
  }

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const canSchedule = slots.length > 0;

  // Notifica capacidade de avançar (canProceed) no modo embed
  useEffect(() => {
    onCanProceedChange?.(canSchedule);
  }, [canSchedule, onCanProceedChange]);

  // Registra handler do botão "Próximo" para o host quando embed
  useEffect(() => {
    if (!registerNextHandler) return;
    registerNextHandler(() => {
      const times = slots.map((s) => `${s.start}-${s.end}`).join(', ');
      const summary = `${formatDate(selectedDate)}${times ? `: ${times}` : ''}`;
      onUpdateSummary?.(7, summary);
      onSchedule?.({ date: selectedDate, slots });
    });
  }, [registerNextHandler, selectedDate, slots, onUpdateSummary, onSchedule]);

  // Renderização sem cabeçalho/rodapé quando embed
  if (embedded) {
    return (
      <>
        {/* Conteúdo central */}
        <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
          <View style={styles.contentFlex}>
            {/* Título, subtítulo e progresso */}
            <View style={styles.introContainer}>
              <View style={styles.centerBlock}>
                <Text style={styles.sectionTitle}>Data e Horário</Text>
                <Text style={styles.sectionSubtitle}>Selecione uma data e horário</Text>
              </View>
              <View style={styles.stepsRow}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <View key={i} style={[styles.stepDot, styles.stepDotActive]} />
                ))}
              </View>
            </View>

            {/* Calendário mensal */}
            <View style={styles.monthCalendarContainer} onLayout={(e) => setCalendarWidth(e?.nativeEvent?.layout?.width ?? 0)}>
              {/* Cabeçalho do mês */}
              <View style={styles.monthCalendarHeader}>
                <TouchableOpacity style={styles.monthArrowButton} onPress={goPrevMonth} accessibilityRole="button" accessibilityLabel="Mês anterior">
                  <ArrowLeftIcon />
                </TouchableOpacity>
                <View style={styles.monthHeaderCenter}>
                  <Text style={styles.monthHeaderText}>{monthLabel}</Text>
                </View>
                <TouchableOpacity style={styles.monthArrowButton} onPress={goNextMonth} accessibilityRole="button" accessibilityLabel="Próximo mês">
                  <ArrowRightIcon />
                </TouchableOpacity>
              </View>
              {/* Nomes dos dias */}
              <View style={[styles.monthDayNamesRow, { width: columnWidth * 7 + weekGap * 6, alignSelf: 'center', justifyContent: 'flex-start', gap: weekGap }] }>
                {weekdayNames.map((name) => (
                  <View key={name} style={[styles.monthDayNameCell, { width: columnWidth }]}>
                    <Text style={styles.monthDayName}>{name}</Text>
                  </View>
                ))}
              </View>
              {/* Grade de dias */}
              <View style={styles.monthGrid}>
                {Array.from({ length: 6 }).map((_, wi) => (
                  <View key={`w-${wi}`} style={[styles.monthWeekRow, { width: columnWidth * 7 + weekGap * 6, alignSelf: 'center' }]}>
                    {Array.from({ length: 7 }).map((_, di) => {
                      const idx = wi * 7 + di;
                      const cell = cells[idx];
                      const inMonth = cell.inMonth;
                      const isSelected = isSameDay(cell.date, selectedDate);
                      const isTodayCell = isSameDay(cell.date, today);
                      const cellStyle = [styles.monthDayCell, { width: columnWidth }, !inMonth && styles.monthDayCellOut, isSelected && styles.monthDaySelected];
                      const textStyle = [styles.monthDayText, !inMonth && styles.monthDayTextOut, isSelected && styles.monthDayTextSelected];
                      const hasSaved = daysWithSlots.has(dateKey(cell.date));
                      const underlineWidth = Math.max(12, Math.min(columnWidth - 12, 18));
                      const underlineLeft = columnWidth / 2 - underlineWidth / 2;
                      return (
                        <TouchableOpacity key={`c-${idx}`} style={cellStyle} onPress={() => setSelectedDate(cell.date)}>
                          <Text style={textStyle}>{cell.label}</Text>
                          {isTodayCell ? (
                            <Svg width={8} height={8} viewBox="0 0 8 8" fill="none" style={styles.monthTodayDot}>
                              <Path d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z" fill="#1777CF" />
                            </Svg>
                          ) : null}
                          {hasSaved ? (
                            <View
                              style={[
                                styles.monthSavedMark,
                                { width: underlineWidth, left: underlineLeft },
                                isSelected ? styles.monthSavedMarkSelected : styles.monthSavedMarkDefault,
                              ]}
                            />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* Data escolhida e inserção de horários */}
            <View style={styles.dateHeaderRow}>
              <Text style={styles.dateHeaderText}>{formatDate(selectedDate)}</Text>
            </View>

            {/* Títulos dos campos de horário (acima da primeira linha) */}
            <View style={styles.slotsHeaderRow}>
              <Text style={styles.slotsHeaderLabel}>Hora início</Text>
              <Text style={styles.slotsHeaderLabel}>Hora término</Text>
              <View style={{ width: 32 }} />
            </View>

            <View style={styles.topSlotsRow}>
              <TouchableOpacity
                style={styles.inputGroup}
                activeOpacity={0.7}
                onPress={() => {
                  console.log('[DateTimeScreen/embed] abrir modal', { target: 'top', field: 'start', initial: slotStart });
                  setTimetableTitle('Hora inicial');
                  setTimetableInitial(isValidTime(slotStart) ? slotStart : '00:00');
                  setTimetableMinTime(undefined);
                  setTimetableTarget({ type: 'top', field: 'start' });
                  setTimetableVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Selecionar hora inicial"
              >
                <Text style={styles.readonlyText}>{slotStart || '00:00'}</Text>
                <View style={styles.timeIcon}><ClockIcon /></View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.inputGroup}
                activeOpacity={0.7}
                onPress={() => {
                  if (!isValidTime(slotStart)) {
                    console.warn('[DateTimeScreen/embed] bloqueado: defina Hora início antes de Hora término');
                    return;
                  }
                  const min = nextMinute(slotStart);
                  console.log('[DateTimeScreen/embed] abrir modal', { target: 'top', field: 'end', initial: slotEnd, min });
                  setTimetableTitle('Hora término');
                  const initial = isValidTime(slotEnd) && isTimeGE(slotEnd, min) ? slotEnd : min;
                  setTimetableInitial(initial);
                  setTimetableMinTime(min);
                  setTimetableTarget({ type: 'top', field: 'end' });
                  setTimetableVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Selecionar hora término"
              >
                <Text style={styles.readonlyText}>{slotEnd || '00:00'}</Text>
                <View style={styles.timeIcon}><ClockIcon /></View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={addSlot} accessibilityRole="button" accessibilityLabel="Adicionar horário">
                <PlusIcon />
              </TouchableOpacity>
            </View>

            {/* Divisória entre a primeira linha e a lista */}
            <View style={styles.divider} />

            {/* Lista de horários */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {slots.map((s, idx) => (
                <View key={`slot-${idx}`} style={styles.slotRow}>
                  <TouchableOpacity
                    style={[styles.inputGroup, styles.readonlyGroup]}
                    activeOpacity={0.7}
                    onPress={() => {
                      console.log('[DateTimeScreen/embed] abrir modal', { target: 'slot', field: 'start', idx, initial: s.start });
                      setTimetableTitle('Hora início');
                      setTimetableInitial(isValidTime(s.start) ? s.start : '00:00');
                      setTimetableMinTime(undefined);
                      setTimetableTarget({ type: 'slot', field: 'start', idx });
                      setTimetableVisible(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar hora início ${s.start}`}
                  >
                    <Text style={styles.readonlyText}>{s.start || '00:00'}</Text>
                    <View style={styles.timeIcon}><ClockIcon /></View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inputGroup, styles.readonlyGroup]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (!isValidTime(s.start)) {
                        console.warn('[DateTimeScreen/embed] bloqueado: defina Hora início do slot antes da Hora término');
                        return;
                      }
                      const min = nextMinute(s.start);
                      console.log('[DateTimeScreen/embed] abrir modal', { target: 'slot', field: 'end', idx, initial: s.end, min });
                      setTimetableTitle('Hora término');
                      const initial = isValidTime(s.end) && isTimeGE(s.end, min) ? s.end : min;
                      setTimetableInitial(initial);
                      setTimetableMinTime(min);
                      setTimetableTarget({ type: 'slot', field: 'end', idx });
                      setTimetableVisible(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar hora término ${s.end}`}
                  >
                    <Text style={styles.readonlyText}>{s.end || '00:00'}</Text>
                    <View style={styles.timeIcon}><ClockIcon /></View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.trashButton}
                    onPress={() => { setPendingDeleteIdx(idx); setDeleteModalVisible(true); }}
                    accessibilityRole="button"
                    accessibilityLabel="Remover horário"
                  >
                    <TrashIcon />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </SlideInView>

        {/* Modal de confirmação de remoção */}
        <ModalAlertDeleteCommitment
          visible={deleteModalVisible}
          start={pendingDeleteIdx !== null ? slots[pendingDeleteIdx]?.start : undefined}
          end={pendingDeleteIdx !== null ? slots[pendingDeleteIdx]?.end : undefined}
          onCancel={() => { setDeleteModalVisible(false); setPendingDeleteIdx(null); }}
          onConfirm={async () => {
            if (pendingDeleteIdx !== null) {
              await removeSlot(pendingDeleteIdx);
            }
            setDeleteModalVisible(false);
            setPendingDeleteIdx(null);
          }}
        />
        {/* TimetableModal para modo embed */}
        <TimetableModal
          visible={timetableVisible}
          title={timetableTitle}
          initialValue={timetableInitial}
          minTime={timetableMinTime}
          onCancel={() => setTimetableVisible(false)}
          onConfirm={(time) => {
            console.log('[DateTimeScreen/embed] confirmar modal', { time, target: timetableTarget });
            if (!timetableTarget) { setTimetableVisible(false); return; }
            if (timetableTarget.type === 'top') {
              if (timetableTarget.field === 'start') setSlotStart(time); else setSlotEnd(time);
            } else {
              if (typeof timetableTarget.idx === 'number') updateSlot(timetableTarget.idx, timetableTarget.field, time);
            }
            setTimetableVisible(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Modal visible={visible} transparent animationType="none">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Cabeçalho (padrão 4.NewAppointment01) */}
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

            {/* Conteúdo central */}
        <SlideInView visible={visible} direction={transitionDirection} style={{ alignSelf: 'stretch', flex: 1 }}>
            <View style={styles.contentFlex}>
              {/* Título, subtítulo e progresso */}
              <View style={styles.introContainer}>
                <View style={styles.centerBlock}>
                  <Text style={styles.sectionTitle}>Data e Horário</Text>
                  <Text style={styles.sectionSubtitle}>Selecione uma data e horário</Text>
                </View>
                <View style={styles.stepsRow}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <View key={i} style={[styles.stepDot, styles.stepDotActive]} />
                  ))}
                </View>
              </View>

              {/* Calendário mensal */}
              <View style={styles.monthCalendarContainer} onLayout={(e) => setCalendarWidth(e?.nativeEvent?.layout?.width ?? 0)}>
                {/* Cabeçalho do mês */}
                <View style={styles.monthCalendarHeader}>
                  <TouchableOpacity style={styles.monthArrowButton} onPress={goPrevMonth} accessibilityRole="button" accessibilityLabel="Mês anterior">
                    <ArrowLeftIcon />
                  </TouchableOpacity>
                  <View style={styles.monthHeaderCenter}>
                    <Text style={styles.monthHeaderText}>{monthLabel}</Text>
                  </View>
                  <TouchableOpacity style={styles.monthArrowButton} onPress={goNextMonth} accessibilityRole="button" accessibilityLabel="Próximo mês">
                    <ArrowRightIcon />
                  </TouchableOpacity>
                </View>
                {/* Nomes dos dias */}
                <View style={[styles.monthDayNamesRow, { width: columnWidth * 7 + weekGap * 6, alignSelf: 'center', justifyContent: 'flex-start', gap: weekGap }] }>
                  {weekdayNames.map((name) => (
                    <View key={name} style={[styles.monthDayNameCell, { width: columnWidth }]}>
                      <Text style={styles.monthDayName}>{name}</Text>
                    </View>
                  ))}
                </View>
                {/* Grade de dias */}
                <View style={styles.monthGrid}>
                  {Array.from({ length: 6 }).map((_, wi) => (
                    <View key={`w-${wi}`} style={[styles.monthWeekRow, { width: columnWidth * 7 + weekGap * 6, alignSelf: 'center' }]}>
                      {Array.from({ length: 7 }).map((_, di) => {
                        const idx = wi * 7 + di;
                        const cell = cells[idx];
                        const inMonth = cell.inMonth;
                        const isSelected = isSameDay(cell.date, selectedDate);
                        const isTodayCell = isSameDay(cell.date, today);
                        const cellStyle = [styles.monthDayCell, { width: columnWidth }, !inMonth && styles.monthDayCellOut, isSelected && styles.monthDaySelected];
                        const textStyle = [styles.monthDayText, !inMonth && styles.monthDayTextOut, isSelected && styles.monthDayTextSelected];
                        const hasSaved = daysWithSlots.has(dateKey(cell.date));
                        const underlineWidth = Math.max(12, Math.min(columnWidth - 12, 18));
                        const underlineLeft = columnWidth / 2 - underlineWidth / 2;
                        return (
                          <TouchableOpacity key={`c-${idx}`} style={cellStyle} onPress={() => setSelectedDate(cell.date)}>
                            <Text style={textStyle}>{cell.label}</Text>
                            {isTodayCell ? (
                              <Svg width={8} height={8} viewBox="0 0 8 8" fill="none" style={styles.monthTodayDot}>
                                <Path d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z" fill="#1777CF" />
                              </Svg>
                            ) : null}
                            {hasSaved ? (
                              <View
                                style={[
                                  styles.monthSavedMark,
                                  { width: underlineWidth, left: underlineLeft },
                                  isSelected ? styles.monthSavedMarkSelected : styles.monthSavedMarkDefault,
                                ]}
                              />
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>

              {/* Data escolhida e inserção de horários */}
              <View style={styles.dateHeaderRow}>
                <Text style={styles.dateHeaderText}>{formatDate(selectedDate)}</Text>
              </View>

              {/* Títulos dos campos de horário (acima da primeira linha) */}
              <View style={styles.slotsHeaderRow}>
                <Text style={styles.slotsHeaderLabel}>Hora início</Text>
                <Text style={styles.slotsHeaderLabel}>Hora término</Text>
                <View style={{ width: 32 }} />
              </View>

              <View style={styles.topSlotsRow}>
                <TouchableOpacity
                  style={styles.inputGroup}
                  activeOpacity={0.7}
                  onPress={() => {
                    console.log('[DateTimeScreen] abrir modal', { target: 'top', field: 'start', initial: slotStart });
                    setTimetableTitle('Hora inicial');
                    setTimetableInitial(isValidTime(slotStart) ? slotStart : '00:00');
                    // Limpa qualquer restrição residual ao abrir Hora início
                    setTimetableMinTime(undefined);
                    setTimetableTarget({ type: 'top', field: 'start' });
                    setTimetableVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar hora inicial"
                >
                  <Text style={styles.readonlyText}>{slotStart || '00:00'}</Text>
                  <View style={styles.timeIcon}><ClockIcon /></View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inputGroup}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!isValidTime(slotStart)) {
                      console.warn('[DateTimeScreen] bloqueado: defina Hora início antes de Hora término');
                      return;
                    }
                    const min = nextMinute(slotStart);
                    console.log('[DateTimeScreen] abrir modal', { target: 'top', field: 'end', initial: slotEnd, min });
                    setTimetableTitle('Hora término');
                    const initial = isValidTime(slotEnd) && isTimeGE(slotEnd, min) ? slotEnd : min;
                    setTimetableInitial(initial);
                    setTimetableMinTime(min);
                    setTimetableTarget({ type: 'top', field: 'end' });
                    setTimetableVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar hora término"
                >
                  <Text style={styles.readonlyText}>{slotEnd || '00:00'}</Text>
                  <View style={styles.timeIcon}><ClockIcon /></View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={addSlot} accessibilityRole="button" accessibilityLabel="Adicionar horário">
                  <PlusIcon />
                </TouchableOpacity>
              </View>

              {/* Divisória entre a primeira linha e a lista */}
              <View style={styles.divider} />

              {/* Lista de horários */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {slots.map((s, idx) => (
                  <View key={`slot-${idx}`} style={styles.slotRow}>
                    <TouchableOpacity
                      style={[styles.inputGroup, styles.readonlyGroup]}
                      activeOpacity={0.7}
                      onPress={() => {
                        console.log('[DateTimeScreen] abrir modal', { target: 'slot', field: 'start', idx, initial: s.start });
                        setTimetableTitle('Hora início');
                        setTimetableInitial(isValidTime(s.start) ? s.start : '00:00');
                        // Limpa qualquer restrição residual ao abrir Hora início do slot
                        setTimetableMinTime(undefined);
                        setTimetableTarget({ type: 'slot', field: 'start', idx });
                        setTimetableVisible(true);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar hora início ${s.start}`}
                    >
                      <Text style={styles.readonlyText}>{s.start || '00:00'}</Text>
                      <View style={styles.timeIcon}><ClockIcon /></View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.inputGroup, styles.readonlyGroup]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (!isValidTime(s.start)) {
                          console.warn('[DateTimeScreen] bloqueado: defina Hora início do slot antes da Hora término');
                          return;
                        }
                        const min = nextMinute(s.start);
                        console.log('[DateTimeScreen] abrir modal', { target: 'slot', field: 'end', idx, initial: s.end, min });
                        setTimetableTitle('Hora término');
                        const initial = isValidTime(s.end) && isTimeGE(s.end, min) ? s.end : min;
                        setTimetableInitial(initial);
                        setTimetableMinTime(min);
                        setTimetableTarget({ type: 'slot', field: 'end', idx });
                        setTimetableVisible(true);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar hora término ${s.end}`}
                    >
                      <Text style={styles.readonlyText}>{s.end || '00:00'}</Text>
                      <View style={styles.timeIcon}><ClockIcon /></View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.trashButton}
                      onPress={() => { setPendingDeleteIdx(idx); setDeleteModalVisible(true); }}
                      accessibilityRole="button"
                      accessibilityLabel="Remover horário"
                    >
                      <TrashIcon />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
            </SlideInView>

            {/* Rodapé */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[styles.footerButton]}
                onPress={onBack ?? onClose}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Text style={styles.footerButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonPrimary, !canSchedule && styles.footerButtonDisabled]}
                disabled={!canSchedule}
                accessibilityRole="button"
                accessibilityLabel="Agendar"
                accessibilityState={{ disabled: !canSchedule }}
                onPress={() => {
                  const times = slots.map((s) => `${s.start}-${s.end}`).join(', ');
                  const summary = `${formatDate(selectedDate)}${times ? `: ${times}` : ''}`;
                  onUpdateSummary?.(7, summary);
                  onSchedule?.({ date: selectedDate, slots });
                }}
              >
                <Text style={[styles.footerButtonText, styles.footerButtonTextPrimary]}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FullFlow visible={fullFlowVisible} onClose={() => setFullFlowVisible(false)} currentStep={7} summaries={summaries} onSelectStep={onSelectStep} maxAccessibleStep={maxAccessibleStep} />
      <ModalAlertDeleteCommitment
        visible={deleteModalVisible}
        start={pendingDeleteIdx !== null ? slots[pendingDeleteIdx]?.start : undefined}
        end={pendingDeleteIdx !== null ? slots[pendingDeleteIdx]?.end : undefined}
        onCancel={() => { setDeleteModalVisible(false); setPendingDeleteIdx(null); }}
        onConfirm={async () => {
          if (pendingDeleteIdx !== null) {
            await removeSlot(pendingDeleteIdx);
          }
          setDeleteModalVisible(false);
          setPendingDeleteIdx(null);
        }}
      />
      <TimetableModal
        visible={timetableVisible}
        title={timetableTitle}
        initialValue={timetableInitial}
        minTime={timetableMinTime}
        onCancel={() => setTimetableVisible(false)}
        onConfirm={(time) => {
          console.log('[DateTimeScreen] confirmar modal', { time, target: timetableTarget });
          if (!timetableTarget) { setTimetableVisible(false); return; }
          if (timetableTarget.type === 'top') {
            if (timetableTarget.field === 'start') setSlotStart(time); else setSlotEnd(time);
          } else {
            if (typeof timetableTarget.idx === 'number') updateSlot(timetableTarget.idx, timetableTarget.field, time);
          }
          setTimetableVisible(false);
        }}
      />
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
    marginBottom: 10,
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
  contentFlex: {
    flex: 1,
    alignSelf: 'stretch',
  },
  // Calendário
  monthCalendarContainer: {
    alignSelf: 'stretch',
    marginTop: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 0,
  },
  monthCalendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  monthArrowButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthHeaderCenter: {
    flex: 1,
    height: 32,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthHeaderText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  monthDayNamesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  monthDayNameCell: {
    alignItems: 'center',
  },
  monthDayName: {
    color: '#7D8592',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  monthGrid: {
    flexDirection: 'column',
    gap: 6,
  },
  monthWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  monthDayCell: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8E0F0',
    position: 'relative',
  },
  monthDayCellOut: {
    opacity: 0.4,
  },
  monthDaySelected: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  monthDayText: {
    color: '#3A3F51',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  monthDayTextOut: {
    color: '#91929E',
  },
  monthDayTextSelected: {
    color: '#FCFCFC',
    fontFamily: 'Inter_700Bold',
  },
  monthTodayDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#1777CF',
    top: -4,
    right: -4,
    zIndex: 3,
  },
  monthSavedDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1777CF',
    bottom: -4,
    zIndex: 3,
  },
  monthSavedMark: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    bottom: 4,
    zIndex: 3,
  },
  monthSavedMarkDefault: {
    backgroundColor: '#3A3F51',
  },
  monthSavedMarkSelected: {
    backgroundColor: '#FCFCFC',
  },
  // Data e horários
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  dateHeaderText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  inlineActions: { flexDirection: 'row', gap: 8 },
  topSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
    alignSelf: 'stretch',
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.005,
    borderColor: '#D8E0F0',
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
  },
  timeInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_500Medium',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  // Ícone sempre à direita, sem encolher, com respiro do texto
  timeIcon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8, flexShrink: 0 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1777CF',
  },
  slotsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  slotsHeaderLabel: { color: '#7D8592', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    marginTop: 5,
  },
  readonlyGroup: { backgroundColor: '#FFFFFF' },
  // O texto ocupa o espaço disponível, empurrando o ícone para a direita
  readonlyText: { flex: 1, color: '#3A3F51', fontFamily: 'Inter_500Medium', fontSize: 14 },
  trashButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    backgroundColor: '#F4F4F4',
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

export default DateTimeScreen;