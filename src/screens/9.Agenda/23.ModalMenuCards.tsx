import React, { useEffect, useMemo } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { Svg, Path } from 'react-native-svg';

type Props = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  anchor?: { top: number; left: number };
};

// SVGs fornecidos pelo usuário
const EditIcon = () => (
  <View accessibilityLabel="Ícone Editar" style={styles.iconWrap}>
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path fillRule="evenodd" clipRule="evenodd" d="M9.83873 0.581039L4.16126 6.25851C4.03725 6.38252 3.96758 6.55072 3.96758 6.72609V9.37115C3.96758 9.73636 4.26364 10.0324 4.62885 10.0324H7.2739C7.44928 10.0324 7.61748 9.96275 7.74149 9.83873L13.419 4.16126C14.1937 3.38654 14.1937 2.13048 13.419 1.35576L12.6442 0.581039C11.8695 -0.19368 10.6135 -0.19368 9.83873 0.581039ZM12.4838 2.29093L12.5388 2.35322C12.7405 2.61263 12.7222 2.98772 12.4838 3.2261L6.99882 8.70989H5.29011V6.99986L10.7739 1.51621C11.0321 1.25797 11.4508 1.25797 11.7091 1.51621L12.4838 2.29093Z" fill="#3A3F51" />
      <Path d="M6.63302 1.43598C6.63302 1.07078 6.33696 0.774719 5.97175 0.774719H3.30632L3.1629 0.777774C1.4034 0.852868 0 2.30306 0 4.08104V10.6937L0.00305472 10.8371C0.0781494 12.5966 1.52834 14 3.30632 14H9.91896L10.0624 13.9969C11.8219 13.9218 13.2253 12.4717 13.2253 10.6937V7.44137L13.2208 7.36426C13.1826 7.03539 12.9031 6.78011 12.564 6.78011C12.1988 6.78011 11.9028 7.07617 11.9028 7.44137V10.6937L11.8994 10.8102C11.839 11.8516 10.9754 12.6775 9.91896 12.6775H3.30632L3.18976 12.6741C2.14839 12.6138 1.32253 11.7502 1.32253 10.6937V4.08104L1.3259 3.96448C1.38623 2.92311 2.24983 2.09725 3.30632 2.09725H5.97175L6.04887 2.0928C6.37774 2.0546 6.63302 1.7751 6.63302 1.43598Z" fill="#3A3F51" />
    </Svg>
  </View>
);

const TrashIcon = () => (
  <View accessibilityLabel="Ícone Excluir" style={styles.iconWrap}>
    <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
      <Path d="M5.2 5.72727C5.53334 5.72727 5.80808 5.97293 5.84563 6.28942L5.85 6.36364V10.1818C5.85 10.5333 5.55899 10.8182 5.2 10.8182C4.86666 10.8182 4.59192 10.5725 4.55437 10.256L4.55 10.1818V6.36364C4.55 6.01218 4.84101 5.72727 5.2 5.72727Z" fill="#3A3F51" />
      <Path d="M8.44563 6.28942C8.40808 5.97293 8.13334 5.72727 7.8 5.72727C7.44101 5.72727 7.15 6.01218 7.15 6.36364V10.1818L7.15437 10.256C7.19192 10.5725 7.46666 10.8182 7.8 10.8182C8.15899 10.8182 8.45 10.5333 8.45 10.1818V6.36364L8.44563 6.28942Z" fill="#3A3F51" />
      <Path fillRule="evenodd" clipRule="evenodd" d="M7.8 0C8.83849 0 9.68738 0.794767 9.74669 1.79692L9.75 1.90909V2.54545H12.35C12.709 2.54545 13 2.83036 13 3.18182C13 3.50817 12.7491 3.77714 12.4258 3.8139L12.35 3.81818H11.7V12.0909C11.7 13.1076 10.8882 13.9387 9.86458 13.9968L9.75 14H3.25C2.21151 14 1.36262 13.2052 1.30331 12.2031L1.3 12.0909V3.81818H0.65C0.291015 3.81818 0 3.53327 0 3.18182C0 2.85547 0.250926 2.5865 0.574196 2.54974L0.65 2.54545H3.25V1.90909C3.25 0.892385 4.0618 0.0613067 5.08542 0.0032408L5.2 0H7.8ZM2.6 3.81818V12.0909C2.6 12.4173 2.85093 12.6862 3.1742 12.723L3.25 12.7273H9.75C10.0833 12.7273 10.3581 12.4816 10.3956 12.1651L10.4 12.0909V3.81818H2.6ZM8.45 2.54545H4.55V1.90909L4.55437 1.83488C4.59192 1.51839 4.86666 1.27273 5.2 1.27273H7.8L7.8758 1.27701C8.19907 1.31377 8.45 1.58274 8.45 1.90909V2.54545Z" fill="#3A3F51" />
    </Svg>
  </View>
);

const ModalMenuCards: React.FC<Props> = ({ visible, onClose, onEdit, onDelete, anchor }) => {
  // Guardar última posição de clique para posicionar o menu no Web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (ev: MouseEvent) => {
      (window as any).__lastClick = { x: ev.clientX, y: ev.clientY };
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const computedPos = useMemo(() => {
    const menuW = 184;
    if (anchor && typeof anchor.top === 'number' && typeof anchor.left === 'number') {
      if (Platform.OS === 'web') {
        const vw = window.innerWidth;
        const safeLeft = Math.min(Math.max(8, anchor.left), vw - menuW - 8);
        const safeTop = Math.max(80, anchor.top);
        return { top: safeTop, left: safeLeft };
      }
      return anchor;
    }
    // Fallback: última posição de clique no web
    if (Platform.OS === 'web') {
      const pos = (window as any).__lastClick as { x: number; y: number } | undefined;
      if (!pos) return { top: 160, left: 24 };
      const vw = window.innerWidth;
      const left = Math.min(Math.max(8, pos.x - menuW / 2), vw - menuW - 8);
      const top = Math.max(100, pos.y + 8);
      return { top, left };
    }
    return { top: undefined as number | undefined, left: undefined as number | undefined };
  }, [visible, anchor]);

  const handleEdit = () => { onClose(); onEdit(); };
  const handleDelete = () => { onClose(); onDelete(); };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} accessibilityLabel="Fechar menu" />
      <View style={[styles.menuContainer, { top: computedPos.top, left: computedPos.left }]}> 
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={handleEdit} accessibilityRole="button" accessibilityLabel="Editar">
          <EditIcon />
          <Text style={styles.menuLabel}>Editar</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8} onPress={handleDelete} accessibilityRole="button" accessibilityLabel="Excluir">
          <TrashIcon />
          <Text style={styles.menuLabel}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#FCFCFC',
    borderColor: '#D8E0F0',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    width: 184,
    // Sombra sutil (Figma 08)
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuItem: {
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuLabel: {
    fontSize: 14,
    color: '#3A3F51',
  },
  separator: {
    height: 1,
    backgroundColor: '#E8EDF7',
    marginHorizontal: 0,
  },
});

export default ModalMenuCards;