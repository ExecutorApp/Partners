import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { isValidTime, parseTime, clampToMin, formatTime } from '../../utils/time';

interface TimetableModalProps {
  visible: boolean;
  title: string; // "Hora inicial" | "Hora término"
  initialValue?: string; // HH:MM
  // Limite mínimo permitido para seleção (ex.: hora início + 1 minuto)
  minTime?: string; // HH:MM
  onCancel: () => void;
  onConfirm: (time: string) => void; // HH:MM
}

// Ícone de relógio – substituído pelo SVG do arquivo "Icone - Relogio.txt"
const ClockIcon: React.FC = () => (
  <Svg width={44} height={45} viewBox="0 0 44 45" fill="none">
    <Path d="M41.9233 4.71437L42.5768 4.07243C42.6095 4.04037 42.6356 4.00207 42.6537 3.95973C42.6719 3.91739 42.6816 3.87183 42.6824 3.82565C42.6833 3.77947 42.6751 3.73358 42.6585 3.6906C42.6419 3.64762 42.6171 3.60839 42.5856 3.57515C42.5541 3.54191 42.5164 3.51531 42.4748 3.49687C42.4332 3.47843 42.3884 3.46851 42.343 3.46768C42.2976 3.46685 42.2525 3.47512 42.2103 3.49202C42.168 3.50892 42.1294 3.53413 42.0968 3.56619L41.4346 4.21868C38.6815 1.62568 34.5041 1.39269 31.4888 3.66392C31.4486 3.69392 31.4153 3.73238 31.3912 3.77668C31.367 3.82098 31.3526 3.87007 31.3488 3.92059C31.345 3.9711 31.352 4.02185 31.3693 4.06936C31.3866 4.11686 31.4138 4.16 31.449 4.19583L36.3539 9.18547L35.201 10.2922C31.7871 6.81261 27.1772 4.81931 22.3453 4.73336V3.43471H24.2858C24.7539 3.43436 25.1333 3.04826 25.1335 2.57199V0.86272C25.1331 0.386536 24.7539 0.000615224 24.2858 0H19.7134C19.2454 0.000791002 18.8663 0.386624 18.8656 0.86272V2.57199C18.866 3.04817 19.2453 3.43409 19.7134 3.43471H21.6542V4.73336C16.8223 4.81977 12.2126 6.81314 8.79847 10.2925L7.64457 9.18406L12.5501 4.19407C12.5853 4.15825 12.6125 4.11511 12.6298 4.0676C12.6471 4.02009 12.6541 3.96935 12.6503 3.91883C12.6466 3.86831 12.6321 3.81923 12.608 3.77493C12.5838 3.73063 12.5505 3.69216 12.5104 3.66216C9.49464 1.39128 5.31724 1.62507 2.5645 4.21868L1.90167 3.56619C1.83568 3.50148 1.74712 3.46609 1.65548 3.46781C1.56384 3.46952 1.47662 3.5082 1.41301 3.57533C1.34941 3.64246 1.31462 3.73255 1.3163 3.82577C1.31799 3.919 1.35601 4.00772 1.422 4.07243L2.07584 4.71437C-0.471363 7.51522 -0.69988 11.7632 1.53155 14.8301C1.56113 14.8709 1.599 14.9048 1.64259 14.9294C1.68618 14.954 1.73446 14.9688 1.78417 14.9728H1.81043C1.90208 14.9728 1.98997 14.9357 2.05476 14.8698L7.15591 9.68151L8.32156 10.8012C1.29094 18.486 1.7154 30.5136 9.2695 37.6658C16.8236 44.8179 28.6469 44.3861 35.6776 36.7014C42.354 29.4038 42.354 18.0989 35.6776 10.8013L36.8432 9.6816L41.9447 14.8709C42.0094 14.9368 42.0972 14.9738 42.1887 14.9739H42.2153C42.265 14.97 42.3133 14.9553 42.3568 14.9306C42.4003 14.906 42.4381 14.8721 42.4676 14.8312C44.7002 11.7641 44.4716 7.51514 41.9233 4.71437ZM36.8059 23.7336C36.8056 32.0521 30.1762 38.7953 21.999 38.795C13.8219 38.7946 7.19324 32.0507 7.19358 23.7322C7.19393 15.4139 13.8228 8.67079 21.9997 8.67079C30.1731 8.68011 36.7967 15.4189 36.8059 23.7336ZM6.70216 42.2114C6.22457 43.1449 6.58121 44.2954 7.49882 44.7814C8.34973 45.232 9.39771 44.9557 9.92645 44.1414L12.1555 40.7032C10.9447 39.9767 9.81595 39.1173 8.78948 38.1404L6.70216 42.2114Z" fill="#3A3F51"/>
    <Path d="M35.2086 38.1439C34.1824 39.1186 33.0549 39.9767 31.8461 40.7032L34.0716 44.1414C34.6409 45.021 35.8033 45.2647 36.668 44.6856C37.4712 44.1478 37.744 43.0789 37.2994 42.2114L35.2086 38.1439ZM11.7052 23.3813H10.0001C9.9084 23.3813 9.8205 23.4184 9.75569 23.4843C9.69088 23.5502 9.65448 23.6396 9.65448 23.7329C9.65448 23.8261 9.69088 23.9155 9.75569 23.9815C9.8205 24.0474 9.9084 24.0844 10.0001 24.0844H11.7052C11.7968 24.0844 11.8847 24.0474 11.9495 23.9815C12.0143 23.9155 12.0507 23.8261 12.0507 23.7329C12.0507 23.6396 12.0143 23.5502 11.9495 23.4843C11.8847 23.4184 11.7968 23.3813 11.7052 23.3813ZM14.4757 30.8895L13.2703 32.1157C13.2373 32.1482 13.211 32.187 13.1929 32.2299C13.1748 32.2727 13.1652 32.3189 13.1648 32.3656C13.1644 32.4122 13.1732 32.4585 13.1905 32.5017C13.2079 32.5449 13.2336 32.5842 13.266 32.6172C13.2985 32.6502 13.3371 32.6763 13.3795 32.694C13.422 32.7117 13.4675 32.7206 13.5134 32.7202C13.5593 32.7197 13.6046 32.7101 13.6468 32.6916C13.689 32.6732 13.7271 32.6464 13.759 32.6128L14.9644 31.3866C15.0273 31.3203 15.0621 31.2315 15.0614 31.1393C15.0606 31.0471 15.0242 30.959 14.9601 30.8938C14.8961 30.8286 14.8094 30.7916 14.7188 30.7908C14.6282 30.79 14.5409 30.8255 14.4757 30.8895ZM13.759 14.8526C13.6938 14.7885 13.6065 14.7531 13.5159 14.7539C13.4253 14.7547 13.3386 14.7917 13.2745 14.8568C13.2104 14.922 13.1741 15.0102 13.1733 15.1024C13.1725 15.1946 13.2074 15.2834 13.2703 15.3497L14.4757 16.5762C14.5409 16.6403 14.6282 16.6757 14.7188 16.6749C14.8094 16.6741 14.8961 16.6371 14.9601 16.572C15.0242 16.5068 15.0606 16.4186 15.0614 16.3264C15.0621 16.2342 15.0273 16.1454 14.9644 16.0791L13.759 14.8526ZM21.9997 33.8549C21.9081 33.8549 21.8202 33.8919 21.7554 33.9579C21.6906 34.0238 21.6542 34.1132 21.6542 34.2064V35.941C21.6542 36.0343 21.6906 36.1237 21.7554 36.1896C21.8202 36.2555 21.9081 36.2926 21.9997 36.2926C22.0914 36.2926 22.1793 36.2555 22.2441 36.1896C22.3089 36.1237 22.3453 36.0343 22.3453 35.941V34.2064C22.3453 34.1132 22.3089 34.0238 22.2441 33.9579C22.1793 33.8919 22.0914 33.8549 21.9997 33.8549ZM29.1993 23.7343C29.1993 23.641 29.1629 23.5516 29.098 23.4857C29.0332 23.4198 28.9453 23.3827 28.8537 23.3827H23.624C23.5829 22.5146 22.9339 21.8025 22.0861 21.6953V15.7146C22.0861 15.6213 22.0497 15.5319 21.9849 15.466C21.9201 15.4001 21.8322 15.363 21.7405 15.363C21.6489 15.363 21.561 15.4001 21.4962 15.466C21.4314 15.5319 21.395 15.6213 21.395 15.7146V21.7438C20.4595 22.0089 19.9124 22.9953 20.1731 23.947C20.4337 24.8986 21.4033 25.4552 22.3388 25.19C22.6072 25.1139 22.8539 24.9741 23.0587 24.782C23.2635 24.5899 23.4205 24.3511 23.5168 24.0852H28.8526C28.898 24.0854 28.943 24.0764 28.985 24.0589C29.027 24.0413 29.0651 24.0155 29.0973 23.983C29.1295 23.9505 29.1551 23.9118 29.1726 23.8692C29.1901 23.8266 29.1991 23.7805 29.1993 23.7343ZM21.8695 24.5534C21.2778 24.5534 20.7981 24.0654 20.7981 23.4636C20.7981 22.8617 21.2778 22.3738 21.8695 22.3738C22.4611 22.3738 22.9408 22.8617 22.9408 23.4636C22.9408 24.0654 22.4612 24.5534 21.8695 24.5534ZM29.5234 30.8895C29.4582 30.8255 29.3709 30.79 29.2803 30.7908C29.1897 30.7916 29.1031 30.8286 29.039 30.8938C28.9749 30.959 28.9386 31.0471 28.9378 31.1393C28.937 31.2315 28.9718 31.3203 29.0348 31.3866L30.2402 32.6128C30.3053 32.6769 30.3926 32.7123 30.4832 32.7115C30.5739 32.7107 30.6605 32.6737 30.7246 32.6086C30.7887 32.5434 30.825 32.4552 30.8258 32.363C30.8266 32.2709 30.7918 32.182 30.7288 32.1157L29.5234 30.8895ZM30.2402 14.8526L29.0348 16.0791C29.0018 16.1116 28.9754 16.1504 28.9573 16.1933C28.9392 16.2361 28.9297 16.2823 28.9293 16.329C28.9289 16.3756 28.9376 16.4219 28.955 16.4651C28.9724 16.5083 28.998 16.5476 29.0305 16.5806C29.0629 16.6136 29.1015 16.6397 29.144 16.6574C29.1865 16.6751 29.232 16.684 29.2779 16.6836C29.3237 16.6831 29.3691 16.6734 29.4112 16.655C29.4534 16.6366 29.4915 16.6098 29.5234 16.5762L30.7288 15.3497C30.7918 15.2834 30.8266 15.1946 30.8258 15.1024C30.825 15.0102 30.7887 14.922 30.7246 14.8568C30.6605 14.7917 30.5739 14.7547 30.4832 14.7539C30.3926 14.7531 30.3053 14.7885 30.2402 14.8526ZM31.9487 23.7329C31.9487 23.8261 31.9851 23.9155 32.0499 23.9815C32.1148 24.0474 32.2027 24.0844 32.2943 24.0844H33.9994C34.0911 24.0844 34.179 24.0474 34.2438 23.9815C34.3086 23.9155 34.345 23.8261 34.345 23.7329C34.345 23.6396 34.3086 23.5502 34.2438 23.4843C34.179 23.4184 34.0911 23.3813 33.9994 23.3813H32.2943C32.2027 23.3813 32.1148 23.4184 32.0499 23.4843C31.9851 23.5502 31.9487 23.6396 31.9487 23.7329Z" fill="#3A3F51"/>
  </Svg>
);

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const two = (n: number) => String(n).padStart(2, '0');

const ITEM_HEIGHT = 36;
const MASK_GAP = 2;
const TOP_PAD = ITEM_HEIGHT * 2;
const BOTTOM_PAD = ITEM_HEIGHT * 2;

const indexFromOffset = (y: number, len: number) => {
  const normalized = Math.max(0, y);
  const idx = Math.round(normalized / ITEM_HEIGHT);
  return Math.min(len - 1, Math.max(0, idx));
};

const TimetableModal: React.FC<TimetableModalProps> = ({ visible, title, initialValue, minTime, onCancel, onConfirm }) => {
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const [displayHourIndex, setDisplayHourIndex] = useState<number>(0);
  const [displayMinuteIndex, setDisplayMinuteIndex] = useState<number>(0);
  const hourRef = useRef<ScrollView | null>(null);
  const minuteRef = useRef<ScrollView | null>(null);
  const hourIdleTimer = useRef<any>(null);
  const minuteIdleTimer = useRef<any>(null);

  const minBound = useMemo(() => parseTime(minTime), [minTime]);

  const isEndModal = useMemo(() => {
    const t = (title ?? '').toLowerCase();
    return t.includes('término') || t.includes('termino');
  }, [title]);

  const hours = useMemo(() => {
    if (isEndModal && minBound) {
      return range(24).filter((h) => h >= minBound.hour);
    }
    return range(24);
  }, [minBound, isEndModal]);

  // CRÍTICO: Para modal término, calcular o minTime REAL (não o que vem do pai)
  // O pai passa minTime = "08:06" mas queremos filtrar a partir de "08:05"
  const realStartTime = useMemo(() => {
    if (!isEndModal || !minBound) return null;
    // Se é modal término, o minTime que vem do pai já tem +1 minuto
    // Então voltamos 1 minuto para ter o tempo REAL de início
    let realMinute = minBound.minute - 1;
    let realHour = minBound.hour;
    
    if (realMinute < 0) {
      realMinute = 59;
      realHour = (minBound.hour - 1 + 24) % 24;
    }
    
    return { hour: realHour, minute: realMinute };
  }, [minBound, isEndModal]);

  const getMinutesForHour = (currentHour: number): number[] => {
    // Modal início: sempre 0-59
    if (!isEndModal) {
      return range(60);
    }

    // Modal término: usar realStartTime ao invés de minBound
    if (!realStartTime) {
      return range(60);
    }

    if (currentHour === realStartTime.hour) {
      // Na mesma hora do início REAL: filtra minutos > realStartTime.minute
      // Se hora início é 08:05, mostra [6,7,8...59]
      return range(60).filter((m) => m > realStartTime.minute);
    } else {
      // Em horas maiores: todos os minutos
      return range(60);
    }
  };

  const minutes = useMemo(() => {
    return getMinutesForHour(displayHourIndex);
  }, [displayHourIndex, realStartTime, isEndModal]);

  const clampLocal = (h: number, m: number) => {
    // Modal início: NUNCA aplica clamp
    if (!isEndModal) {
      return { h, m };
    }

    // Modal término: aplica clamp usando minBound (que já tem +1)
    const c = clampToMin(h, m, minBound);
    const validMinutes = getMinutesForHour(c.h);
    const mValid = validMinutes.includes(c.m) ? c.m : (validMinutes[0] ?? c.m);
    return { h: c.h, m: mValid };
  };

  const commitHourFromY = (y: number) => {
    const idx = indexFromOffset(y, hours.length);
    const safeIdx = Math.min(hours.length - 1, Math.max(0, idx));
    let nextH = hours[safeIdx] ?? displayHourIndex;
    let nextM = displayMinuteIndex;
    const clamped = clampLocal(nextH, nextM);
    nextH = clamped.h; nextM = clamped.m;
    setHour(nextH);
    setMinute(nextM);
    setDisplayHourIndex(nextH);
    setDisplayMinuteIndex(nextM);
    const hIdx = Math.max(0, hours.indexOf(nextH));
    hourRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated: false });
    const mIdx = Math.max(0, getMinutesForHour(nextH).indexOf(nextM));
    minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
  };

  const commitMinuteFromY = (y: number) => {
    const currentMinutes = getMinutesForHour(displayHourIndex);
    const idx = indexFromOffset(y, currentMinutes.length);
    const safeIdx = Math.min(currentMinutes.length - 1, Math.max(0, idx));
    let nextM = currentMinutes[safeIdx] ?? displayMinuteIndex;
    let nextH = displayHourIndex;
    const clamped = clampLocal(nextH, nextM);
    nextH = clamped.h; nextM = clamped.m;
    setHour(nextH);
    setMinute(nextM);
    setDisplayHourIndex(nextH);
    setDisplayMinuteIndex(nextM);
    const mIdx = Math.max(0, getMinutesForHour(nextH).indexOf(nextM));
    minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
    const hIdx = Math.max(0, hours.indexOf(nextH));
    hourRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated: false });
  };

  const scheduleHourCommitFromY = (y: number) => {
    try { if (hourIdleTimer.current) clearTimeout(hourIdleTimer.current); } catch {}
    hourIdleTimer.current = setTimeout(() => commitHourFromY(y), 120);
  };

  const scheduleMinuteCommitFromY = (y: number) => {
    try { if (minuteIdleTimer.current) clearTimeout(minuteIdleTimer.current); } catch {}
    minuteIdleTimer.current = setTimeout(() => commitMinuteFromY(y), 120);
  };

  const getScrollY = (e: any) => {
    const yRN = e?.nativeEvent?.contentOffset?.y;
    const yWeb = e?.nativeEvent?.target?.scrollTop ?? e?.target?.scrollTop;
    const y = (typeof yRN === 'number' ? yRN : (typeof yWeb === 'number' ? yWeb : 0));
    return y;
  };

  const getScrollYFromRef = (ref: React.MutableRefObject<ScrollView | null>) => {
    try {
      if (Platform.OS === 'web') {
        const anyRef: any = ref?.current as any;
        const node: any = anyRef?.getScrollableNode?.() ?? anyRef?._component ?? anyRef;
        const y = node?.scrollTop;
        if (typeof y === 'number') return y;
      }
    } catch {}
    return 0;
  };

  const getScrollNode = (ref: React.MutableRefObject<ScrollView | null>) => {
    try {
      if (Platform.OS === 'web') {
        const anyRef: any = ref?.current as any;
        return anyRef?.getScrollableNode?.() ?? anyRef?._component ?? null;
      }
    } catch {}
    return null;
  };

  // Reset completo quando fecha
  useEffect(() => {
    if (!visible) {
      // Resetar todos os estados quando o modal fecha
      setHour(0);
      setMinute(0);
      setDisplayHourIndex(0);
      setDisplayMinuteIndex(0);
    }
  }, [visible]);

  // Inicialização quando abre
  useEffect(() => {
    if (!visible) return;
    
    console.log('[TimetableModal] OPEN', { 
      title, 
      initialValue, 
      minTime, 
      minBound,
      realStartTime,
      isEndModal 
    });
    
    const init = parseTime(initialValue) ?? { hour: 0, minute: 0 };
    let ih: number;
    let im: number;
    
    if (isEndModal && realStartTime) {
      // Modal "Hora término": iniciar no próximo minuto após realStartTime
      const validMinutes = getMinutesForHour(realStartTime.hour);
      
      console.log('[TimetableModal] Término - realStartTime:', realStartTime, 'validMinutes:', validMinutes);
      
      if (validMinutes.length > 0) {
        ih = realStartTime.hour;
        im = validMinutes[0]; // Primeiro minuto válido da lista filtrada
      } else {
        // Próxima hora
        ih = (realStartTime.hour + 1) % 24;
        im = 0;
      }
    } else {
      // Modal "Hora inicial": SEMPRE usar initialValue exato
      ih = isNaN(init.hour) ? 0 : init.hour;
      im = isNaN(init.minute) ? 0 : init.minute;
      
      console.log('[TimetableModal] Início - usando initialValue exato:', { ih, im });
    }
    
    setHour(ih);
    setMinute(im);
    setDisplayHourIndex(ih);
    setDisplayMinuteIndex(im);
    
    setTimeout(() => {
      const validMinutes = getMinutesForHour(ih);
      const hIdx = Math.max(0, hours.indexOf(ih));
      const mIdx = Math.max(0, validMinutes.indexOf(im));
      
      console.log('[TimetableModal] Scrolling to:', { hIdx, mIdx, ih, im, validMinutesLength: validMinutes.length });
      
      hourRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated: false });
      minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
    }, 0);
  }, [visible, initialValue, realStartTime, hours, isEndModal]);

  // Reposiciona minutos quando hora muda
  useEffect(() => {
    if (!visible) return;
    const validMinutes = getMinutesForHour(displayHourIndex);
    
    if (!validMinutes.includes(displayMinuteIndex)) {
      const newMinute = validMinutes[0] ?? 0;
      setMinute(newMinute);
      setDisplayMinuteIndex(newMinute);
      const mIdx = Math.max(0, validMinutes.indexOf(newMinute));
      setTimeout(() => {
        minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
      }, 0);
    } else {
      const mIdx = Math.max(0, validMinutes.indexOf(displayMinuteIndex));
      setTimeout(() => {
        minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
      }, 0);
    }
  }, [displayHourIndex, visible]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const hNode: any = getScrollNode(hourRef);
    const mNode: any = getScrollNode(minuteRef);
    if (!hNode && !mNode) return;

    const onHourWebScroll = () => {
      const y = (hNode?.scrollTop ?? 0) as number;
      const idx = indexFromOffset(y, hours.length);
      const safeIdx = Math.min(hours.length - 1, Math.max(0, idx));
      const currentH = hours[safeIdx] ?? hours[0] ?? 0;
      if (currentH !== displayHourIndex) setDisplayHourIndex(currentH);
      scheduleHourCommitFromY(y);
    };

    const onMinuteWebScroll = () => {
      const y = (mNode?.scrollTop ?? 0) as number;
      const currentMinutes = getMinutesForHour(displayHourIndex);
      const idx = indexFromOffset(y, currentMinutes.length);
      const safeIdx = Math.min(currentMinutes.length - 1, Math.max(0, idx));
      const currentM = currentMinutes[safeIdx] ?? currentMinutes[0] ?? 0;
      if (currentM !== displayMinuteIndex) setDisplayMinuteIndex(currentM);
      scheduleMinuteCommitFromY(y);
    };

    if (hNode) hNode.addEventListener('scroll', onHourWebScroll, { passive: true });
    if (mNode) mNode.addEventListener('scroll', onMinuteWebScroll, { passive: true });

    return () => {
      try { if (hNode) hNode.removeEventListener('scroll', onHourWebScroll); } catch {}
      try { if (mNode) mNode.removeEventListener('scroll', onMinuteWebScroll); } catch {}
      try { if (hourIdleTimer.current) clearTimeout(hourIdleTimer.current); } catch {}
      try { if (minuteIdleTimer.current) clearTimeout(minuteIdleTimer.current); } catch {}
    };
  }, [visible, hours.length, minutes.length, displayHourIndex, displayMinuteIndex, hour, minute, minBound]);

  const onHourScrollEnd = (e: any) => {
    let nextH: number;
    let nextM: number;
    if (Platform.OS === 'web') {
      const node: any = getScrollNode(hourRef);
      const y = (node?.scrollTop ?? 0) as number;
      const idx = indexFromOffset(y, hours.length);
      const safeIdx = Math.min(hours.length - 1, Math.max(0, idx));
      nextH = hours[safeIdx] ?? displayHourIndex;
      nextM = displayMinuteIndex;
    } else {
      const y = getScrollY(e);
      const idx = indexFromOffset(y, hours.length);
      const safeIdx = Math.min(hours.length - 1, Math.max(0, idx));
      nextH = hours[safeIdx];
      nextM = minute;
    }
    const clamped = clampLocal(nextH, nextM);
    nextH = clamped.h;
    nextM = clamped.m;
    setHour(nextH);
    setMinute(nextM);
    setDisplayHourIndex(nextH);
    setDisplayMinuteIndex(nextM);
    const hIdx = Math.max(0, hours.indexOf(nextH));
    hourRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated: false });
    const mIdx = Math.max(0, getMinutesForHour(nextH).indexOf(nextM));
    minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
  };
  
  const onMinuteScrollEnd = (e: any) => {
    let nextM: number;
    let nextH: number;
    if (Platform.OS === 'web') {
      const node: any = getScrollNode(minuteRef);
      const y = (node?.scrollTop ?? 0) as number;
      const currentMinutes = getMinutesForHour(displayHourIndex);
      const idx = indexFromOffset(y, currentMinutes.length);
      const safeIdx = Math.min(currentMinutes.length - 1, Math.max(0, idx));
      nextM = currentMinutes[safeIdx] ?? displayMinuteIndex;
      nextH = displayHourIndex;
    } else {
      const y = getScrollY(e);
      const currentMinutes = getMinutesForHour(displayHourIndex);
      const idx = indexFromOffset(y, currentMinutes.length);
      const safeIdx = Math.min(currentMinutes.length - 1, Math.max(0, idx));
      nextM = currentMinutes[safeIdx];
      nextH = hour;
    }
    const clamped = clampLocal(nextH, nextM);
    nextH = clamped.h;
    nextM = clamped.m;
    setHour(nextH);
    setMinute(nextM);
    setDisplayHourIndex(nextH);
    setDisplayMinuteIndex(nextM);
    const mIdx = Math.max(0, getMinutesForHour(nextH).indexOf(nextM));
    minuteRef.current?.scrollTo({ y: mIdx * ITEM_HEIGHT, animated: false });
    const hIdx = Math.max(0, hours.indexOf(nextH));
    hourRef.current?.scrollTo({ y: hIdx * ITEM_HEIGHT, animated: false });
  };

  const onHourScroll = (e: any) => {
    const y = getScrollY(e);
    const idx = indexFromOffset(y, hours.length);
    const safeIdx = Math.min(hours.length - 1, Math.max(0, idx));
    const currentH = hours[safeIdx] ?? hours[0] ?? 0;
    setDisplayHourIndex(currentH);
  };
  
  const onMinuteScroll = (e: any) => {
    const y = getScrollY(e);
    const currentMinutes = getMinutesForHour(displayHourIndex);
    const idx = indexFromOffset(y, currentMinutes.length);
    const safeIdx = Math.min(currentMinutes.length - 1, Math.max(0, idx));
    const currentM = currentMinutes[safeIdx] ?? currentMinutes[0] ?? 0;
    setDisplayMinuteIndex(currentM);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.clockWrapper}><ClockIcon /></View>
          <View style={styles.labelsRow}>
            <View style={styles.labelsCell}>
              <Text style={styles.label}>Horas</Text>
            </View>
            <View style={styles.labelsGap} />
            <View style={styles.labelsCell}>
              <Text style={styles.label}>Minutos</Text>
            </View>
          </View>

          <View style={styles.pickersRow}>
            <View style={styles.pickerWrapper}>
              <ScrollView
                ref={(r) => (hourRef.current = r)}
                showsVerticalScrollIndicator={false}
                decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.9}
                onMomentumScrollEnd={onHourScrollEnd}
                onScrollEndDrag={onHourScrollEnd}
                onScroll={onHourScroll}
                scrollEventThrottle={16}
              >
                <View style={{ height: TOP_PAD }} />
                {hours.map((h) => (
                  <View key={`h-${h}`} style={[styles.itemRow, h === displayHourIndex && styles.itemRowActive]}>
                    <Text style={[styles.itemText, h === displayHourIndex ? styles.itemTextHidden : null]}>{two(h)}</Text>
                  </View>
                ))}
                <View style={{ height: BOTTOM_PAD }} />
              </ScrollView>
            </View>

            <Text style={styles.separator}>:</Text>

            <View style={styles.pickerWrapper}>
              <ScrollView
                ref={(r) => (minuteRef.current = r)}
                showsVerticalScrollIndicator={false}
                decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.9}
                onMomentumScrollEnd={onMinuteScrollEnd}
                onScrollEndDrag={onMinuteScrollEnd}
                onScroll={onMinuteScroll}
                scrollEventThrottle={16}
              >
                <View style={{ height: TOP_PAD }} />
                {minutes.map((m) => (
                  <View key={`m-${m}`} style={[styles.itemRow, m === displayMinuteIndex && styles.itemRowActive]}>
                    <Text style={[styles.itemText, m === displayMinuteIndex ? styles.itemTextHidden : null]}>{two(m)}</Text>
                  </View>
                ))}
                <View style={{ height: BOTTOM_PAD }} />
              </ScrollView>
            </View>

            <View pointerEvents="none" style={styles.selectionDividerTop} />
            <View pointerEvents="none" style={styles.selectionDividerBottom} />
            <View pointerEvents="none" style={styles.maskTop} />
            <View pointerEvents="none" style={styles.maskBottom} />

            <View pointerEvents="none" style={styles.innerMaskRow}>
              <View style={styles.innerMaskCell} />
              <View style={styles.innerMaskGap} />
              <View style={styles.innerMaskCell} />
            </View>

            <View pointerEvents="none" style={styles.centerOverlayRow}>
              <View style={styles.centerOverlayCell}>
                <Text style={styles.itemTextActive}>{two(displayHourIndex)}</Text>
              </View>
              <View style={styles.centerOverlayGap} />
              <View style={[styles.centerOverlayCell]}>
                <Text style={styles.itemTextActive}>{two(displayMinuteIndex)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancelar">
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                const clamped = clampLocal(displayHourIndex, displayMinuteIndex);
                onConfirm(formatTime(clamped.h, clamped.m));
              }}
              accessibilityRole="button"
              accessibilityLabel="Confirmar"
            >
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FCFCFC',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderRadius: 12,
    width: 330,
    gap: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#3A3F51',
    textAlign: 'center',
  },
  clockWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelsCell: {
    flex: 1,
    alignItems: 'center',
  },
  labelsGap: {
    width: 20,
  },
  label: {
    fontSize: 13,
    color: '#959DA6',
    fontFamily: 'Inter_500Medium',
  },
  pickersRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ITEM_HEIGHT * 5,
    overflow: 'hidden',
  },
  pickerWrapper: {
    flex: 1,
    height: ITEM_HEIGHT * 5,
    overflow: 'hidden',
  },
  separator: {
    fontSize: 16,
    color: '#959DA6',
    fontFamily: 'Inter_700Bold',
    width: 20,
    textAlign: 'center',
  },
  itemRow: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRowActive: {},
  itemText: {
    fontSize: 16,
    color: '#959DA6',
    fontFamily: 'Inter_500Medium',
  },
  itemTextHidden: {
    opacity: 0,
  },
  itemTextActive: {
    fontSize: 20,
    color: '#1777CF',
    fontFamily: 'Inter_700Bold',
  },
  selectionLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 6,
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  selectionDividerTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D8E0F0',
    top: ITEM_HEIGHT * 2,
    zIndex: 40,
    opacity: 1,
  },
  selectionDividerBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D8E0F0',
    top: ITEM_HEIGHT * 3,
    zIndex: 40,
    opacity: 1,
  },
  maskTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2 - MASK_GAP,
    height: MASK_GAP,
    backgroundColor: '#FCFCFC',
    zIndex: 9,
  },
  maskBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 3,
    height: MASK_GAP,
    backgroundColor: '#FCFCFC',
    zIndex: 9,
  },
  innerMaskRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  innerMaskCell: {
    flex: 1,
    backgroundColor: '#FCFCFC',
    height: ITEM_HEIGHT,
  },
  innerMaskGap: {
    width: 20,
    height: ITEM_HEIGHT,
    backgroundColor: 'transparent',
  },
  centerOverlayRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
  },
  centerOverlayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerOverlayGap: {
    width: 20,
    height: ITEM_HEIGHT,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F4F4F4',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#3A3F51' },
  confirmText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#FCFCFC' },
});

export default TimetableModal;