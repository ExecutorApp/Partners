import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  PanResponder,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';

type FiltersTab = 'periods' | 'products' | 'flows' | 'types';

// Payload de seleção retornado ao clicar em "Aplicar"
type FiltersSelection = {
  periodsLabel: string;
  productLabel: string;
  flowLabel: string;
  typeLabel: string;
  startDate?: Date | null;
  endDate?: Date | null;
  quickLabel?: 'none' | 'Hoje' | '15 dias' | 'Este mês';
};

interface ModalFiltersProps {
  visible: boolean;
  initialTab: FiltersTab;
  onClose: () => void;
  // Quando fornecido, será chamado com o resumo das seleções feitas no modal
  onApply?: (selection: FiltersSelection) => void;
}

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const ModalFilters: React.FC<ModalFiltersProps> = ({ visible, initialTab, onClose, onApply }) => {
  const [activeTab, setActiveTab] = React.useState<FiltersTab>(initialTab);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  // Estado de seleção de períodos
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [selectMode, setSelectMode] = React.useState<'none' | 'start' | 'end' | 'drag'>('none');
  const [quickLabel, setQuickLabel] = React.useState<'none' | 'Hoje' | '15 dias' | 'Este mês'>('none');
  // "Final" só pode ficar ativo após o usuário escolher uma data inicial via botão "Inicial"
  const [canUseFinal, setCanUseFinal] = React.useState<boolean>(false);
  // Aba Produtos: controlar opção selecionada para exibição no cabeçalho e estilo ativo
  const [selectedProduct, setSelectedProduct] = React.useState<string>('Todos');
  // Aba Tipos: controlar opção selecionada para exibição no cabeçalho e estilo ativo
  const [selectedType, setSelectedType] = React.useState<string>('Todos');
  // Aba Tipos de fluxo: controlar opção selecionada para exibição no cabeçalho e estilo ativo
  const [selectedFlow, setSelectedFlow] = React.useState<string>('Todos');
  const gridLayoutRef = React.useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const cellsRef = React.useRef<Date[]>([]);

  // Helpers de datas
  const formatDate = React.useCallback((d?: Date | null) => {
    if (!d) return '00/00/00';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }, []);

  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const lastOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const today = React.useMemo(() => new Date(), []);

  const headerText = React.useMemo(() => {
    // Aba Produtos: mostrar a opção selecionada pelo usuário
    if (activeTab === 'products') {
      return selectedProduct;
    }
    // Aba Tipos de fluxo: mostrar a opção selecionada pelo usuário
    if (activeTab === 'flows') {
      return selectedFlow;
    }
    // Aba Tipos de agenda: mostrar a opção selecionada pelo usuário
    if (activeTab === 'types') {
      return selectedType;
    }
    // Demais abas: manter comportamento existente (especialmente Períodos)
    if (quickLabel === 'Hoje') {
      return `Hoje - ${formatDate(today)}`;
    }
    if (quickLabel === '15 dias') {
      const start = today;
      const end = addDays(today, 14);
      return `15 dias - De ${formatDate(start)} à ${formatDate(end)}`;
    }
    if (quickLabel === 'Este mês') {
      const start = firstOfMonth(today);
      const end = lastOfMonth(today);
      return `Este mês - De ${formatDate(start)} à ${formatDate(end)}`;
    }
    // Quando o usuário está no modo de seleção (Inicial/Final), sempre mostramos o intervalo
    // com placeholders se necessário, em vez de "Todos".
    if (selectMode === 'start' || selectMode === 'end') {
      return `De ${formatDate(startDate)} à ${formatDate(endDate)}`;
    }
    if (startDate && endDate) {
      // Se for uma única data (start === end) e fora de modos de seleção, exibe apenas a data.
      if (startDate.getTime() === endDate.getTime()) {
        return `${formatDate(startDate)}`;
      }
      return `De ${formatDate(startDate)} à ${formatDate(endDate)}`;
    }
    if (startDate && !endDate) return `De ${formatDate(startDate)} à 00/00/00`;
    return 'Todos';
  }, [activeTab, selectedProduct, selectedFlow, selectedType, quickLabel, startDate, endDate, selectMode, formatDate, today]);

  // Constrói o payload de seleção para uso externo
  const buildSelection = React.useCallback((): FiltersSelection => {
    // Label de períodos resumida para os cards da home
    let periodsLabel = 'Todos';
    if (quickLabel === 'Hoje') {
      periodsLabel = 'Hoje';
    } else if (quickLabel === '15 dias') {
      periodsLabel = '15 dias';
    } else if (quickLabel === 'Este mês') {
      // Mantemos o texto curto do card conforme referência visual
      periodsLabel = 'Esse mês';
    } else if (startDate || endDate) {
      const s = formatDate(startDate);
      const e = formatDate(endDate);
      periodsLabel = `De ${s} à ${e}`;
    }

    return {
      periodsLabel,
      productLabel: selectedProduct || 'Todos',
      flowLabel: selectedFlow || 'Todos',
      typeLabel: selectedType || 'Todos',
      startDate,
      endDate,
      quickLabel,
    };
  }, [quickLabel, startDate, endDate, selectedProduct, selectedFlow, selectedType, formatDate]);

  React.useEffect(() => {
    if (visible) setActiveTab(initialTab);
  }, [visible, initialTab]);

  const goPrevTab = () => {
    const order: FiltersTab[] = ['periods', 'products', 'flows', 'types'];
    const idx = order.indexOf(activeTab);
    setActiveTab(order[Math.max(0, idx - 1)]);
  };

  const goNextTab = () => {
    const order: FiltersTab[] = ['periods', 'products', 'flows', 'types'];
    const idx = order.indexOf(activeTab);
    setActiveTab(order[Math.min(order.length - 1, idx + 1)]);
  };

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

  // Ícones (SVG) conforme especificação
  const HeaderArrowLeftIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 8, height = 12, color = '#FFFFFF' }) => (
    <Svg width={width} height={height} viewBox="0 0 8 12" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.72083 0.276203C8.10363 0.634498 8.09121 1.20424 7.69311 1.54875L2.44277 6L7.69311 10.4512C8.09121 10.7958 8.10363 11.3655 7.72083 11.7238C7.33804 12.0821 6.705 12.0933 6.30689 11.7487L0.306891 6.64875C0.110812 6.47907 -7.94727e-08 6.24482 -7.94727e-08 6C-7.94727e-08 5.75518 0.110812 5.52093 0.306891 5.35125L6.30689 0.251251C6.705 -0.0932627 7.33804 -0.0820913 7.72083 0.276203Z"
        fill={color}
      />
    </Svg>
  );

  const HeaderArrowRightIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 8, height = 12, color = '#FFFFFF' }) => (
    <Svg width={width} height={height} viewBox="0 0 8 12" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.279168 0.276203C-0.103625 0.634498 -0.0912127 1.20424 0.306892 1.54875L5.55723 6L0.306893 10.4512C-0.0912125 10.7958 -0.103625 11.3655 0.279168 11.7238C0.661961 12.0821 1.295 12.0933 1.69311 11.7487L7.69311 6.64875C7.88919 6.47907 8 6.24482 8 6C8 5.75518 7.88919 5.52093 7.69311 5.35125L1.69311 0.251251C1.295 -0.0932627 0.661961 -0.0820913 0.279168 0.276203Z"
        fill={color}
      />
    </Svg>
  );

  const CloseIconGray: React.FC<{ width?: number; height?: number }> = ({ width = 13, height = 12 }) => (
    <Svg width={width} height={height} viewBox="0 0 13 12" fill="none">
      <Path d="M12.655 0.247926C12.2959 -0.0821192 11.7339 -0.0827124 11.374 0.246573L6.5 4.70646L1.62595 0.246573C1.26609 -0.0827126 0.704125 -0.0821187 0.344999 0.247926L0.291597 0.297004C-0.0977822 0.654853 -0.0971065 1.25701 0.293074 1.61404L5.08634 6L0.293074 10.386C-0.0971063 10.743 -0.0977808 11.3451 0.291598 11.703L0.345 11.7521C0.704126 12.0821 1.26609 12.0827 1.62595 11.7534L6.5 7.29354L11.374 11.7534C11.7339 12.0827 12.2959 12.0821 12.655 11.7521L12.7084 11.703C13.0978 11.3451 13.0971 10.743 12.7069 10.386L7.91366 6L12.7069 1.61404C13.0971 1.25701 13.0978 0.654853 12.7084 0.297004L12.655 0.247926Z" fill="#3A3F51" />
    </Svg>
  );

  const MonthArrowLeftIcon: React.FC<{ width?: number; height?: number; opacity?: number }> = ({ width = 7, height = 10, opacity = 1 }) => (
    <Svg width={width} height={height} viewBox="0 0 7 10" fill="none" opacity={opacity}>
      <Path d="M6.18333 1.175L2.35833 5L6.18333 8.825L5 10L0 5L5 0L6.18333 1.175Z" fill="#3A3F51" />
    </Svg>
  );

  const MonthArrowRightIcon: React.FC<{ width?: number; height?: number; opacity?: number }> = ({ width = 7, height = 10, opacity = 1 }) => (
    <Svg width={width} height={height} viewBox="0 0 7 10" fill="none" opacity={opacity}>
      <Path d="M9.53674e-07 1.175L3.825 5L9.53674e-07 8.825L1.18333 10L6.18333 5L1.18333 0L9.53674e-07 1.175Z" fill="#3A3F51" />
    </Svg>
  );

  const renderHeader = () => {
    const order: FiltersTab[] = ['periods', 'products', 'flows', 'types'];
    const idx = order.indexOf(activeTab);
    const step = `${String(idx + 1).padStart(2, '0')}/${String(order.length).padStart(2, '0')}`;
    const title =
      activeTab === 'periods'
        ? 'Períodos'
        : activeTab === 'products'
        ? 'Produtos'
        : activeTab === 'flows'
        ? 'Tipos de fluxo'
        : 'Tipos de agenda';
    const isPrevDisabled = idx === 0;
    const isNextDisabled = idx === order.length - 1;
    return (
      <View style={styles.modalHeader}>
        <View style={styles.stepContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              isPrevDisabled ? styles.navButtonInactive : styles.navButtonActive,
            ]}
            onPress={goPrevTab}
            disabled={isPrevDisabled}
            activeOpacity={0.85}
          >
            <HeaderArrowLeftIcon color={isPrevDisabled ? '#5F758B' : '#FFFFFF'} />
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepIndicatorText}>{step}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.navButton,
              isNextDisabled ? styles.navButtonInactive : styles.navButtonActive,
            ]}
            onPress={goNextTab}
            disabled={isNextDisabled}
            activeOpacity={0.85}
          >
            <HeaderArrowRightIcon color={isNextDisabled ? '#5F758B' : '#FFFFFF'} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
          <CloseIconGray />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.inputFake}><Text style={styles.inputFakeText}>{headerText}</Text></View>
      </View>
    );
  };

  const renderPeriodsTab = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = `${monthNames[month]} - ${year}`;
    const firstDay = new Date(year, month, 1).getDay(); // 0..6 (Dom..Sáb)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { label: number; inMonth: boolean; isToday: boolean }[] = [];
    const today = new Date();

    // Dias do mês anterior (preenchimento inicial)
    for (let i = 0; i < firstDay; i++) {
      const num = daysInPrevMonth - firstDay + 1 + i;
      const d = new Date(year, month - 1, num);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      cells.push({ label: num, inMonth: false, isToday });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      cells.push({ label: i, inMonth: true, isToday });
    }

    // Completar com dias do próximo mês até fechar a grade
    const totalCells = Math.ceil(cells.length / 7) * 7;
    for (let i = 1; cells.length < totalCells; i++) {
      const d = new Date(year, month + 1, i);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      cells.push({ label: i, inMonth: false, isToday });
    }

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    // Largura fixa do modal conforme solicitado
    const modalWidth = 340;
    const innerWidth = modalWidth - 32; // padding horizontal do container da aba
    const desiredCalendarWidth = 312; // referência visual do layout
    const calendarWidth = Math.min(desiredCalendarWidth, innerWidth);
    const horizontalMarginsTotal = 28; // 7 células * (marginHorizontal 2 esquerda + 2 direita)
    const cellWidth = (calendarWidth - horizontalMarginsTotal) / 7;
    // Largura do cabeçalho das semanas deve casar com a grade (inclui margens)
    const weekRowWidth = cellWidth * 7 + horizontalMarginsTotal;
    const gridWidth = cellWidth * 7 + horizontalMarginsTotal;

    // Construir array de datas correspondente às células, mantendo o layout
    const cellDates: Date[] = [];
    // Dias do mês anterior (preenchimento inicial) foram empurrados no array "cells", replicamos datas aqui
    for (let i = 0; i < firstDay; i++) {
      const num = daysInPrevMonth - firstDay + 1 + i;
      cellDates.push(new Date(year, month - 1, num));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cellDates.push(new Date(year, month, i));
    }
    const totalCells2 = Math.ceil(cellDates.length / 7) * 7;
    for (let i = 1; cellDates.length < totalCells2; i++) {
      cellDates.push(new Date(year, month + 1, i));
    }
    cellsRef.current = cellDates;

    // PanResponder para arrasto entre dias (desktop e mobile)
    const columnW = cellWidth + 4; // largura da coluna incluindo margens
    const rowH = 34 + 4; // altura da linha incluindo margens
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => selectMode === 'drag',
      onPanResponderMove: (_evt, gestureState) => {
        if (selectMode !== 'drag') return;
        const lx = gestureState.moveX - (gridLayoutRef.current.x || 0);
        const ly = gestureState.moveY - (gridLayoutRef.current.y || 0);
        if (lx < 0 || ly < 0) return;
        const col = Math.min(6, Math.max(0, Math.floor(lx / columnW)));
        const row = Math.max(0, Math.floor(ly / rowH));
        const idx = row * 7 + col;
        const hovered = cellsRef.current[idx];
        if (!hovered) return;
        if (startDate) {
          const s = startDate.getTime();
          const e = hovered.getTime();
          if (e >= s) setEndDate(hovered);
          else {
            // Se arrastar para trás, invertemos
            setEndDate(startDate);
            setStartDate(hovered);
          }
        }
      },
      onPanResponderRelease: () => {
        if (selectMode === 'drag') setSelectMode('none');
      },
      onPanResponderTerminationRequest: () => true,
    });

    // Valores exibidos nos boxes "Inicial" e "Final"
    // Regras:
    // - Quando um atalho (Hoje, 15 dias, Este mês) estiver ativo, os boxes mostram 00/00/00.
    // - Quando o usuário escolhe uma data avulsa (fora de modos e start === end), os boxes mostram 00/00/00.
    const isSingleDateSelection = (
      quickLabel === 'none' &&
      selectMode === 'none' &&
      !!startDate && !!endDate &&
      startDate.getTime() === endDate.getTime()
    );
    const showPlaceholderInBoxes = quickLabel !== 'none' || isSingleDateSelection;
    const startBoxValue = showPlaceholderInBoxes ? '00/00/00' : formatDate(startDate);
    const endBoxValue = showPlaceholderInBoxes ? '00/00/00' : formatDate(endDate);

    return (
      <View style={styles.tabContainer}>
        {/* Contêiner de filtros conforme layout original do Figma */}
        <View style={styles.filterContainer}>
          <View style={styles.filterTopRow}>
            <TouchableOpacity
              style={[
                styles.allButton,
                // "Todos" ativo somente quando não há seleção rápida, nem intervalo, e selectMode está neutro
                (quickLabel === 'none' && !startDate && !endDate && selectMode === 'none') ? styles.allButtonActive : null,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                setQuickLabel('none');
                setStartDate(null);
                setEndDate(null);
                setSelectMode('none');
              }}
            >
              <Text style={[
                styles.allButtonText,
                (quickLabel === 'none' && !startDate && !endDate && selectMode === 'none') ? styles.allButtonTextActive : null,
              ]}>Todos</Text>
            </TouchableOpacity>
            <View style={styles.rangeContainer}>
              <TouchableOpacity
                style={[styles.rangeBox, selectMode === 'start' ? styles.rangeBoxActive : null]}
                activeOpacity={0.85}
                onPress={() => {
                  // Ao entrar em modo Inicial:
                  // - Desativa qualquer atalho ativo
                  // - Limpa intervalo atual para que o calendário não destaque um range
                  // - Mantém apenas a marcação da data atual (bolinha), conforme regra visual
                  setQuickLabel('none');
                  setSelectMode('start');
                  setStartDate(null);
                  setEndDate(null);
                  // "Final" fica inativo até escolher a data inicial
                  setCanUseFinal(false);
                }}
              >
                <Text style={[styles.rangeLabel, selectMode === 'start' ? styles.rangeLabelActive : null]}>Inicial</Text>
                <Text style={[styles.rangeValue, selectMode === 'start' ? styles.rangeValueActive : null]}>{startBoxValue}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rangeBox, selectMode === 'end' ? styles.rangeBoxActive : null, !canUseFinal ? styles.rangeBoxDisabled : null]}
                activeOpacity={0.85}
                disabled={!canUseFinal}
                onPress={() => { if (!canUseFinal) return; setQuickLabel('none'); setSelectMode('end'); }}
              >
                <Text style={[styles.rangeLabel, selectMode === 'end' ? styles.rangeLabelActive : null]}>Final</Text>
                <Text style={[styles.rangeValue, selectMode === 'end' ? styles.rangeValueActive : null]}>{endBoxValue}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.shortcutRow}>
            <TouchableOpacity
              style={[
                styles.shortcutItem,
                styles.shortcutItemNarrow,
                quickLabel === 'Hoje' ? styles.shortcutItemActive : null,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                const now = new Date();
                setQuickLabel('Hoje');
                // Garantir exclusividade: desativa modos de seleção manual
                setSelectMode('none');
                // Normaliza para início do dia para coincidir com as células do calendário
                const sod = startOfDay(now);
                // Para "Hoje": destacar visualmente o dia atual via quickLabel,
                // mas resetar os campos Inicial/Final para 00/00/00
                setStartDate(null);
                setEndDate(null);
                setCanUseFinal(false);
                // Navegar para o mês atual do sistema
                const d = new Date(currentDate);
                d.setFullYear(now.getFullYear());
                d.setMonth(now.getMonth());
                setCurrentDate(d);
              }}
            >
              <Text style={[styles.shortcutText, quickLabel === 'Hoje' ? styles.shortcutTextActive : null]}>Hoje</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.shortcutItem,
                styles.shortcutItemNarrow,
                quickLabel === '15 dias' ? styles.shortcutItemActive : null,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                const now = new Date();
                const until = addDays(now, 14);
                setQuickLabel('15 dias');
                // Garantir exclusividade: desativa modos de seleção manual
                setSelectMode('none');
                // Normaliza datas para início do dia para destacar corretamente bordas
                setStartDate(startOfDay(now));
                setEndDate(startOfDay(until));
                setCanUseFinal(false);
              }}
            >
              <Text style={[styles.shortcutText, quickLabel === '15 dias' ? styles.shortcutTextActive : null]}>15 dias</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.shortcutItem,
                styles.shortcutItemWide,
                quickLabel === 'Este mês' ? styles.shortcutItemActive : null,
              ]}
              activeOpacity={0.85}
              onPress={() => {
                const now = new Date();
                setQuickLabel('Este mês');
                // Garantir exclusividade: desativa modos de seleção manual
                setSelectMode('none');
                setStartDate(firstOfMonth(now));
                setEndDate(lastOfMonth(now));
                setCanUseFinal(false);
                // Garantir que o calendário está no mês atual
                const d = new Date(currentDate);
                d.setFullYear(now.getFullYear());
                d.setMonth(now.getMonth());
                setCurrentDate(d);
              }}
            >
              <Text style={[styles.shortcutText, quickLabel === 'Este mês' ? styles.shortcutTextActive : null]}>Esse mês</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cabeçalho do calendário conforme Figma */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity style={styles.monthArrowButton} onPress={goPrevMonth}>
            <MonthArrowLeftIcon />
          </TouchableOpacity>
          <View style={styles.monthHeaderCenter}>
            <Text style={styles.monthHeaderText}>{monthName}</Text>
          </View>
          <TouchableOpacity style={styles.monthArrowButton} onPress={goNextMonth}>
            <MonthArrowRightIcon />
          </TouchableOpacity>
        </View>

        {/* Nomes dos dias da semana */}
        <View style={[styles.weekRow, { width: weekRowWidth, alignSelf: 'center' }]}>
          {weekDays.map((name) => (
            <View key={name} style={[styles.weekNameCell, { width: cellWidth + 4 }]}>
              <Text style={styles.weekLabel}>{name}</Text>
            </View>
          ))}
        </View>

        {/* Grade de dias */}
        <View
          style={[styles.daysGrid, { width: gridWidth, alignSelf: 'center' }]}
          onLayout={(e) => {
            const l = e?.nativeEvent?.layout;
            gridLayoutRef.current = { x: l?.x ?? 0, y: l?.y ?? 0, width: l?.width ?? 0, height: l?.height ?? 0 };
          }}
          {...panResponder.panHandlers}
        >
          {cells.map((c, idx) => {
            // Data correspondente à célula
            const cellDate = cellDates[idx];
            const inMonth = c.inMonth;
            const isTodayCell = cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth() && cellDate.getFullYear() === today.getFullYear();
            const s = startDate?.getTime();
            const e = endDate?.getTime();
            const t = cellDate.getTime();
            const inRange = s != null && e != null && t >= Math.min(s, e) && t <= Math.max(s, e);
            const isEdge = (s != null && t === s) || (e != null && t === e);
          const selectedStyle = (isEdge ? styles.dayCellSelected : (inRange ? styles.dayCellInRange : null));
          const textStyle = (isEdge ? styles.dayTextSelected : null);
            // Formatação específica para "Hoje" quando acionado
            const todaySelected = quickLabel === 'Hoje' && isTodayCell;
            const todayStyle = todaySelected ? styles.dayCellSelected : null;
            const todayTextStyle = todaySelected ? styles.dayTextSelected : null;
            return (
              <TouchableOpacity
                key={`d-${idx}`}
                activeOpacity={0.85}
                onLongPress={() => {
                  setQuickLabel('none');
                  setSelectMode('drag');
                  setStartDate(cellDate);
                  setEndDate(cellDate);
                  // Seleção por arraste não habilita "Final"
                  setCanUseFinal(false);
                }}
                onPress={() => {
                  // Seleção por clique quando em modo Inicial/Final
                  if (selectMode === 'start') {
                    setStartDate(cellDate);
                    // Mantém o modo "Inicial" ativo para permitir múltiplas escolhas
                    // Habilita o uso do botão "Final" após escolher a data inicial
                    setCanUseFinal(true);
                  } else if (selectMode === 'end') {
                    // Não altera a data inicial: apenas define a data final
                    // Mantém o modo "Final" ativo até o usuário escolher outro botão
                    setEndDate(cellDate);
                  } else {
                    // Clique fora de modos: define ponto único
                    setQuickLabel('none');
                    setStartDate(cellDate);
                    setEndDate(cellDate);
                    // Escolha avulsa não habilita "Final"
                    setCanUseFinal(false);
                  }
                }}
                style={[styles.dayCell, !inMonth && styles.dayCellOut, selectedStyle || todayStyle, { width: cellWidth }]}
              >
                <Text style={[styles.dayText, !inMonth && styles.dayTextOut, textStyle || todayTextStyle]}>
                  {String(c.label).padStart(2, '0')}
                </Text>
                {isEdge && inRange && <View style={styles.rangeEdgeOverlay} />}
                {isTodayCell && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderProductsTab = () => (
    <View style={styles.tabContainer}>
      <ScrollView>
        <TouchableOpacity onPress={() => setSelectedProduct('Todos')} activeOpacity={0.85}>
          <Text style={[
            styles.linkAll,
            selectedProduct === 'Todos' ? styles.productActiveText : styles.productInactiveText,
          ]}>Todos</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.listItem} onPress={() => setSelectedProduct('Holding Patrimonial')} activeOpacity={0.85}>
          <Text style={[
            styles.listItemText,
            styles.productTitle,
            selectedProduct === 'Holding Patrimonial' ? styles.productActiveText : styles.productInactiveText,
          ]}>Holding Patrimonial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItem} onPress={() => setSelectedProduct('Ativos Fundiários')} activeOpacity={0.85}>
          <Text style={[
            styles.listItemText,
            styles.productTitle,
            selectedProduct === 'Ativos Fundiários' ? styles.productActiveText : styles.productInactiveText,
          ]}>Ativos Fundiários</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.listItem, styles.listItemLast]} onPress={() => setSelectedProduct('Planejamento Tributário')} activeOpacity={0.85}>
          <Text style={[
            styles.listItemText,
            styles.productTitle,
            selectedProduct === 'Planejamento Tributário' ? styles.productActiveText : styles.productInactiveText,
          ]}>Planejamento Tributário</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderFlowsTab = () => (
    <View style={styles.tabContainer}>
      <ScrollView>
        <TouchableOpacity onPress={() => setSelectedFlow('Todos')} activeOpacity={0.85}>
          <Text style={[
            styles.linkAll,
            selectedFlow === 'Todos' ? styles.productActiveText : styles.productInactiveText,
          ]}>Todos</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.listItem} onPress={() => setSelectedFlow('Guiado')} activeOpacity={0.85}>
          <Text style={[
            styles.listItemText,
            styles.productTitle,
            selectedFlow === 'Guiado' ? styles.productActiveText : styles.productInactiveText,
          ]}>Guiado</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.listItem, styles.listItemLast]} onPress={() => setSelectedFlow('Livre')} activeOpacity={0.85}>
          <Text style={[
            styles.listItemText,
            styles.productTitle,
            selectedFlow === 'Livre' ? styles.productActiveText : styles.productInactiveText,
          ]}>Livre</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderTypesTab = () => (
    <View style={styles.tabContainer}>
      <ScrollView>
        <TouchableOpacity onPress={() => setSelectedType('Todos')} activeOpacity={0.85}>
          <Text style={[
            styles.linkAll,
            selectedType === 'Todos' ? styles.productActiveText : styles.productInactiveText,
          ]}>Todos</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.listItem} onPress={() => setSelectedType('Individual')} activeOpacity={0.85}>
          <Text style={[
            styles.listItemText,
            styles.productTitle,
            selectedType === 'Individual' ? styles.productActiveText : styles.productInactiveText,
          ]}>Individual</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.listItem, styles.listItemLast]} onPress={() => setSelectedType('Compartilhada')} activeOpacity={0.85}>
          <Text style={[
            styles.listItemText,
            styles.productTitle,
            selectedType === 'Compartilhada' ? styles.productActiveText : styles.productInactiveText,
          ]}>Compartilhada</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'periods':
        return renderPeriodsTab();
      case 'products':
        return renderProductsTab();
      case 'flows':
        return renderFlowsTab();
      case 'types':
        return renderTypesTab();
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay} />
      <View style={styles.modalContainer} pointerEvents="box-none">
        <View style={styles.modalCard}>
          {renderHeader()}
          <View style={styles.modalContent}>
            {renderActiveTab()}
          </View>
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                if (onApply) {
                  const selection = buildSelection();
                  onApply(selection);
                } else {
                  onClose();
                }
              }}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const viewport = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContainer: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    width: 340,
    height: 650, // Altura fixa conforme Figma (05)
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'column',
  },
  modalContent: { flex: 1 },
  modalHeader: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 5 },
  navButton: { width: 30, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginHorizontal: 0 },
  navButtonActive: { backgroundColor: '#1777CF' },
  navButtonInactive: { backgroundColor: '#F4F4F4' },
  navButtonText: { color: '#0A74DA', fontSize: 16, fontFamily: 'Inter_700Bold' },
  navButtonDisabled: { color: '#9CA3AF' },
  stepIndicator: {
    minWidth: 70,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8E0F0',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',

  },
  stepIndicatorText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#3A3F51', textAlign: 'center' },
  closeIcon: { position: 'absolute', right: 12, top: 12, width: 35, height: 35, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F4F4' },
  closeIconText: { fontSize: 22, color: '#6B7280' },
  sectionTitle: { marginTop: 15, fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#7D8592', paddingLeft: 5 },
  inputFake: { marginTop: 6, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  inputFakeText: { color: '#6B7280', fontSize: 14, fontFamily: 'Inter_400Regular' },

  tabContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 },
  // Filtros (Todos, Inicial, Final) – layout do Figma
  filterContainer: { alignSelf: 'stretch', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 10, marginBottom: 10 },
  filterTopRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 5 },
    allButton: { minWidth: 60, height: 60, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: '#D8E0F0', justifyContent: 'center', alignItems: 'center' },
    allButtonActive: { backgroundColor: '#1777CF', borderColor: '#1777CF' },
    allButtonText: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
    allButtonTextActive: { color: '#FCFCFC' },
  rangeContainer: { flex: 1, height: 60, padding: 5, backgroundColor: '#F4F4F4', borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: '#D8E0F0', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 5 },
  rangeBox: { flex: 1, height: '100%', paddingHorizontal: 10, backgroundColor: '#FFFFFF', borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: '#D8E0F0', justifyContent: 'center', alignItems: 'center' },
  rangeBoxActive: { backgroundColor: '#1777CF', borderColor: '#1777CF' },
  rangeLabel: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  rangeLabelActive: { color: '#FCFCFC' },
  rangeValue: { color: '#91929E', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  rangeValueActive: { color: '#FCFCFC' },
  shortcutRow: { alignSelf: 'stretch', height: 40, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10 },
  shortcutItem: { flex: 1, height: '100%', paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: '#D8E0F0', justifyContent: 'center', alignItems: 'center' },
  shortcutItemActive: { backgroundColor: '#1777CF', borderColor: '#1777CF' },
  // Ajustes finos para evitar quebra do botão "Esse mês"
  shortcutItemNarrow: { flex: 0.92, paddingHorizontal: 16 },
  shortcutItemWide: { flex: 1.16 },
  shortcutText: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  shortcutTextActive: { color: '#FCFCFC' },

  // Cabeçalho do calendário e navegação do mês (layout do Figma)
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, gap: 10, },
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
  monthHeaderText: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_500Medium', },

  // Semana e grade de dias
  weekRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 6 },
  weekNameCell: { alignItems: 'center', justifyContent: 'center', borderRadius: 4, height: 34 },
  weekLabel: { textAlign: 'center', color: '#3A3F51', opacity: 0.4, fontSize: 14, fontFamily: 'Inter_500Medium' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 0, rowGap: 0 },
  dayCell: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8E0F0',
    position: 'relative',
  },
    dayCellSelected: { backgroundColor: '#1777CF', borderColor: '#1777CF' },
    // Dias intermediários do intervalo: mesmo azul com 10% de opacidade
    dayCellInRange: { backgroundColor: 'rgba(23, 119, 207, 0.1)' },
  dayCellOut: { opacity: 0.4 },
  dayText: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_400Regular', },
  dayTextSelected: { color: '#FCFCFC' },
  dayTextOut: { color: '#7D8592' },
  todayDot: { position: 'absolute', width: 10, height: 10, borderRadius: 99, backgroundColor: '#1777CF', top: -4, right: -4, zIndex: 3 },
  rangeEdgeOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderWidth: StyleSheet.hairlineWidth, borderColor: '#FFFFFF', borderRadius: 4, zIndex: 2 },

  linkAll: { color: '#1777CF', fontSize: 14, marginBottom: 5, fontFamily: 'Inter_400Regular' },
  listItem: { paddingVertical: 15, borderBottomWidth: 0.08, borderBottomColor: '#D8E0F0' },
  listItemLast: { borderBottomWidth: 0 },
  listItemText: { fontSize: 14, color: '#3A3F51' },
  productTitle: { fontFamily: 'Inter_400Regular' },
  // Estados de cor para itens da aba Produtos
  productActiveText: { color: '#1777CF' },
  productInactiveText: { color: '#3A3F51' },
  divider: { height: 0.08, backgroundColor: '#D8E0F0', alignSelf: 'stretch', marginVertical: 8 },

  footerActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginRight: 8 },
  cancelButtonText: { color: '#3A3F51', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  applyButton: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: '#1777CF', marginLeft: 8 },
  applyButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

export default ModalFilters;