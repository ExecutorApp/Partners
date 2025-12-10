import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import EmptyCalendarIllustration from '../illustrations/EmptyCalendarIllustration';
import { Layout } from '../../constants/theme';

/**
 * Estado vazio padrão para listas de conteúdo.
 * Segue o layout do Figma "Lista": card com ilustração, título e instrução.
 */
const EmptyContentState: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.illustrationWrap}>
        <EmptyCalendarIllustration width={'100%'} height={'100%'} />
      </View>
      <Text style={styles.title}>{'Nenhum conte\u00FAdo\nencontrado!'}</Text>
      <Text style={styles.subtitle}>
        {'Para criar um novo conte\u00FAdo, toque \nno bot\u00E3o azul "Novo conte\u00FAdo"\nno topo da tela.'}
      </Text>
    </View>
  );
};

const winHeight = Dimensions.get('window').height;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const illustrationHeight = Platform.OS === 'web'
  ? ('20vh' as any)
  : clamp(Math.floor(winHeight * 0.25), 160, 240);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    gap: 15,
    backgroundColor: '#FFFFFF',
  },
  illustrationWrap: {
    alignSelf: 'stretch',
    width: '100%',
    height: illustrationHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#3A3F51',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7D8592',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});

export default EmptyContentState;
