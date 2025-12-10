import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Layout } from '../../constants/theme';
import { SvgXml } from 'react-native-svg';

type AlternativeScreenProps = {
  items: Array<{
    id: string;
    date: string; // ISO date YYYY-MM-DD
    slots?: { start: string; end: string }[];
    client?: string;
    product?: string;
    hasExpert?: boolean; // Indica se o agendamento tem Expert associado
  }>;
  selectedId?: string | null; // ID do card selecionado
  onSelect: (id: string) => void;
  onOpenMenu?: (id: string) => void;
};

// Ícone de menu (3 pontinhos) extraído de "Ícones 10.txt"
const MORE_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="4" height="16" viewBox="0 0 4 16" fill="none">
  <path d="M4 1.77778C4 2.75962 3.10457 3.55556 2 3.55556C0.895431 3.55556 0 2.75962 0 1.77778C0 0.795938 0.895431 0 2 0C3.10457 0 4 0.795938 4 1.77778Z" fill="#7D8592"/>
  <path d="M4 8C4 8.98184 3.10457 9.77778 2 9.77778C0.895431 9.77778 0 8.98184 0 8C0 7.01816 0.895431 6.22222 2 6.22222C3.10457 6.22222 4 7.01816 4 8Z" fill="#7D8592"/>
  <path d="M2 16C3.10457 16 4 15.2041 4 14.2222C4 13.2404 3.10457 12.4444 2 12.4444C0.895431 12.4444 0 13.2404 0 14.2222C0 15.2041 0.895431 16 2 16Z" fill="#7D8592"/>
</svg>`;

const Card: React.FC<{ label: string; time?: string; id: string; onPress: () => void; onMenu?: () => void; highlighted?: boolean; hasExpert?: boolean; clientName?: string; productName?: string; }>
  = ({ label, time, id, onPress, onMenu, highlighted, hasExpert, clientName, productName }) => {
  return (
    <TouchableOpacity style={[styles.card, highlighted ? styles.cardHighlighted : null]} onPress={onPress} activeOpacity={0.85}>
      {/* Coluna esquerda: pílula de data - azul se hasExpert, cinza se não */}
      <View style={styles.leftColumn}>
        <View style={[styles.datePill, hasExpert ? styles.datePillBlue : null]}>
          <Text style={[styles.dateLabel, hasExpert ? styles.dateLabelBlue : null]} numberOfLines={1}>
            {label}
          </Text>
          {!!time && (
            <Text style={[styles.dateTime, hasExpert ? styles.dateTimeBlue : null]} numberOfLines={1}>
              {time}
            </Text>
          )}
        </View>
      </View>

      {/* Conteúdo à direita: título, linha divisória e subtítulo */}
      <View style={styles.rightContent}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>{clientName || '—'}</Text>
          <TouchableOpacity style={styles.moreBtn} onPress={onMenu} accessibilityRole="button" accessibilityLabel={`Abrir menu do card ${id}`}>
            <SvgXml xml={MORE_ICON_XML} width={4} height={16} />
          </TouchableOpacity>
        </View>
        <View style={styles.titleDivider} />
        <View style={styles.subtitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subtitleText} numberOfLines={1}>{productName || '—'}</Text>
          </View>
          <View style={styles.trailingSpacer} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const formatDayLabel = (dateIso: string) => {
  const d = new Date(`${dateIso}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((d.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Hoje';
  // Exibir ano com dois dígitos no formato DD/MM/YY
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const formatHour = (slot?: { start: string }) => {
  if (!slot?.start) return undefined;
  const [h, m] = slot.start.split(':');
  return `${h}:${m}`;
};

const AlternativeScreen: React.FC<AlternativeScreenProps> = ({ items, selectedId, onSelect, onOpenMenu }) => {
  return (
    <View style={styles.container}>
      {items.map((it) => (
        <Card
          key={it.id}
          id={it.id}
          label={formatDayLabel(it.date)}
          time={formatHour(it.slots?.[0])}
          highlighted={it.id === selectedId}
          hasExpert={it.hasExpert}
          clientName={it.client}
          productName={it.product}
          onPress={() => onSelect(it.id)}
          onMenu={() => onOpenMenu?.(it.id)}
        />
      ))}
    </View>
  );
};

export default AlternativeScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCFCFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 15,
    width: '100%',
    minHeight: 60,
    alignSelf: 'auto',
  },
  cardHighlighted: {
    borderColor: '#1777CF',
    backgroundColor: 'rgba(23, 119, 207, 0.03)',
  },
  leftColumn: {
    marginLeft: 0,
    marginRight: 10,
  },
  datePill: {
    width: 90,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#F4F4F4',
    borderWidth: 0.5,
    borderColor: '#D8E0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilo do datePill quando hasExpert = true (fundo azul)
  datePillBlue: {
    backgroundColor: '#1777CF',
    borderColor: '#1777CF',
  },
  dateLabel: {
    width: 80,
    textAlign: 'center',
    fontSize: 14,
    color: '#3A3F51',
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'underline',
    paddingBottom: 2,
  },
  // Estilo do dateLabel quando hasExpert = true (texto branco)
  dateLabelBlue: {
    color: '#FCFCFC',
  },
  dateTime: {
    width: 70,
    textAlign: 'center',
    fontSize: 14,
    color: '#7D8592',
    fontFamily: 'Inter_500Medium',
  },
  // Estilo do dateTime quando hasExpert = true (texto branco)
  dateTimeBlue: {
    color: '#FCFCFC',
  },
  rightContent: {
    flex: 1,
    marginLeft: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 17,
  },
  titleText: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  titleDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D8E0F0',
    alignSelf: 'flex-start',
    marginTop: 6,
    marginBottom: 6,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  subtitleText: {
    color: '#7D8592',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  moreBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  trailingSpacer: {
    width: 4,
    height: 18,
    borderRadius: 14,
  },
});