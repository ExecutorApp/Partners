import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type CardMenuProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCopyLink: () => void;
  onDelete: () => void;
  anchorTop?: number;
  anchorRight?: number;
};

// Dimensões e offset conforme Figma 17
const MODAL_WIDTH = 223;
const MODAL_HEIGHT = 148;
const OFFSET_X = 8;
const OFFSET_Y = 8;
const EDGE = 8;

// Ícones originais do Figma (conforme especificação)
const EditIcon: React.FC = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.83873 0.581039L4.16126 6.25851C4.03725 6.38252 3.96758 6.55072 3.96758 6.72609V9.37115C3.96758 9.73636 4.26364 10.0324 4.62885 10.0324H7.2739C7.44928 10.0324 7.61748 9.96275 7.74149 9.83873L13.419 4.16126C14.1937 3.38654 14.1937 2.13048 13.419 1.35576L12.6442 0.581039C11.8695 -0.19368 10.6135 -0.19368 9.83873 0.581039ZM12.4838 2.29093L12.5388 2.35322C12.7405 2.61263 12.7222 2.98772 12.4838 3.2261L6.99882 8.70989H5.29011V6.99986L10.7739 1.51621C11.0321 1.25797 11.4508 1.25797 11.7091 1.51621L12.4838 2.29093Z"
      fill="#3A3F51"
    />
    <Path
      d="M6.63302 1.43598C6.63302 1.07078 6.33696 0.774719 5.97175 0.774719H3.30632L3.1629 0.777774C1.4034 0.852868 0 2.30306 0 4.08104V10.6937L0.00305472 10.8371C0.0781494 12.5966 1.52834 14 3.30632 14H9.91896L10.0624 13.9969C11.8219 13.9218 13.2253 12.4717 13.2253 10.6937V7.44137L13.2208 7.36426C13.1826 7.03539 12.9031 6.78011 12.564 6.78011C12.1988 6.78011 11.9028 7.07617 11.9028 7.44137V10.6937L11.8994 10.8102C11.839 11.8516 10.9754 12.6775 9.91896 12.6775H3.30632L3.18976 12.6741C2.14839 12.6138 1.32253 11.7502 1.32253 10.6937V4.08104L1.3259 3.96448C1.38623 2.92311 2.24983 2.09725 3.30632 2.09725H5.97175L6.04887 2.0928C6.37774 2.0546 6.63302 1.7751 6.63302 1.43598Z"
      fill="#3A3F51"
    />
  </Svg>
);

const LinkIcon: React.FC = () => (
  <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
    <Path
      d="M1.28711 11.1843C1.04833 11.0487 0.849727 10.8522 0.711478 10.6149C0.573229 10.3776 0.500264 10.108 0.5 9.83333V2.05556C0.5 1.2 1.2 0.5 2.05556 0.5H9.83333C10.4167 0.5 10.734 0.799444 11 1.27778M3.61111 5.68544C3.61111 5.1353 3.82966 4.60768 4.21867 4.21867C4.60768 3.82966 5.1353 3.61111 5.68544 3.61111H12.4257C12.6981 3.61111 12.9678 3.66477 13.2195 3.76901C13.4711 3.87326 13.6998 4.02605 13.8924 4.21867C14.0851 4.41129 14.2379 4.63996 14.3421 4.89163C14.4463 5.1433 14.5 5.41304 14.5 5.68544V12.4257C14.5 12.6981 14.4463 12.9678 14.3421 13.2195C14.2379 13.4711 14.0851 13.6998 13.8924 13.8924C13.6998 14.0851 13.4711 14.2379 13.2195 14.3421C12.9678 14.4463 12.6981 14.5 12.4257 14.5H5.68544C5.41304 14.5 5.1433 14.4463 4.89163 14.3421C4.63996 14.2379 4.41129 14.0851 4.21867 13.8924C4.02605 13.6998 3.87326 13.4711 3.76901 13.2195C3.66477 12.9678 3.61111 12.6981 3.61111 12.4257V5.68544Z"
      stroke="#3A3F51"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrashIcon: React.FC = () => (
  <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
    <Path d="M5.2 5.72727C5.53334 5.72727 5.80808 5.97293 5.84563 6.28942L5.85 6.36364V10.1818C5.85 10.5333 5.55899 10.8182 5.2 10.8182C4.86666 10.8182 4.59192 10.5725 4.55437 10.256L4.55 10.1818V6.36364C4.55 6.01218 4.84101 5.72727 5.2 5.72727Z" fill="#3A3F51" />
    <Path d="M8.44563 6.28942C8.40808 5.97293 8.13334 5.72727 7.8 5.72727C7.44101 5.72727 7.15 6.01218 7.15 6.36364V10.1818L7.15437 10.256C7.19192 10.5725 7.46666 10.8182 7.8 10.8182C8.15899 10.8182 8.45 10.5333 8.45 10.1818V6.36364L8.44563 6.28942Z" fill="#3A3F51" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.8 0C8.83849 0 9.68738 0.794767 9.74669 1.79692L9.75 1.90909V2.54545H12.35C12.709 2.54545 13 2.83036 13 3.18182C13 3.50817 12.7491 3.77714 12.4258 3.8139L12.35 3.81818H11.7V12.0909C11.7 13.1076 10.8882 13.9387 9.86458 13.9968L9.75 14H3.25C2.21151 14 1.36262 13.2052 1.30331 12.2031L1.3 12.0909V3.81818H0.65C0.291015 3.81818 0 3.53327 0 3.18182C0 2.85547 0.250926 2.5865 0.574196 2.54974L0.65 2.54545H3.25V1.90909C3.25 0.892385 4.0618 0.0613067 5.08542 0.0032408L5.2 0H7.8ZM2.6 3.81818V12.0909C2.6 12.4173 2.85093 12.6862 3.1742 12.723L3.25 12.7273H9.75C10.0833 12.7273 10.3581 12.4816 10.3956 12.1651L10.4 12.0909V3.81818H2.6ZM8.45 2.54545H4.55V1.90909L4.55437 1.83488C4.59192 1.51839 4.86666 1.27273 5.2 1.27273H7.8L7.8758 1.27701C8.19907 1.31377 8.45 1.58274 8.45 1.90909V2.54545Z"
      fill="#3A3F51"
    />
  </Svg>
);

const CardMenu: React.FC<CardMenuProps> = ({
  visible,
  onClose,
  onEdit,
  onCopyLink,
  onDelete,
  anchorTop,
  anchorRight,
}) => {
  React.useEffect(() => {
    if (visible) {
      console.log('[CardMenu] aberto – rótulo esperado: "Editar agendamento"');
    }
  }, [visible]);
  const [computedTop, setComputedTop] = React.useState<number>(anchorTop ?? 160);
  const [computedRight, setComputedRight] = React.useState<number>(anchorRight ?? 16);
  const lastClickRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const handler = (e: any) => {
        if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number') {
          lastClickRef.current = { x: e.clientX, y: e.clientY };
        }
      };
      document.addEventListener('click', handler, true);
      return () => document.removeEventListener('click', handler, true);
    }
  }, []);

  React.useEffect(() => {
    if (!visible) return;
    if (Platform.OS === 'web' && typeof document !== 'undefined' && typeof window !== 'undefined') {
      const activeEl = document.activeElement as any;
      let rect: DOMRect | null = null;
      if (activeEl && typeof activeEl.getBoundingClientRect === 'function') {
        rect = activeEl.getBoundingClientRect();
      }

      let nextTop = anchorTop ?? 160;
      let nextRight = anchorRight ?? 16;
      const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

      if (rect) {
        const winH = (window as any).innerHeight;
        const winW = (window as any).innerWidth;
        nextTop = clamp(rect.top - OFFSET_Y, EDGE, winH - MODAL_HEIGHT - EDGE);
        nextRight = clamp(winW - rect.right + OFFSET_X, EDGE, winW - EDGE);
      } else if (lastClickRef.current) {
        const winH = (window as any).innerHeight;
        const winW = (window as any).innerWidth;
        nextTop = clamp(lastClickRef.current.y - MODAL_HEIGHT * 0.5, EDGE, winH - MODAL_HEIGHT - EDGE);
        nextRight = clamp(winW - lastClickRef.current.x + OFFSET_X, EDGE, winW - EDGE);
      }

      setComputedTop(nextTop);
      setComputedRight(nextRight);
    } else {
      setComputedTop(anchorTop ?? computedTop);
      setComputedRight(anchorRight ?? computedRight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, anchorTop, anchorRight]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.container, { top: computedTop, right: computedRight }]}
              accessibilityRole="menu" accessibilityLabel="Menu do agendamento">
          <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => { onEdit(); onClose(); }}
            accessibilityRole="menuitem" accessibilityLabel="Editar agendamento">
            <EditIcon />
            <Text style={styles.text}>Editar agendamento</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => { onCopyLink(); onClose(); }}
            accessibilityRole="menuitem" accessibilityLabel="Copiar link da reunião">
            <LinkIcon />
            <Text style={styles.text}>Copiar link da reunião</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => { onDelete(); onClose(); }}
            accessibilityRole="menuitem" accessibilityLabel="Excluir agendamento">
            <TrashIcon />
            <Text style={styles.text}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D8E0F0',
    borderRadius: 8,
    backgroundColor: '#FCFCFC',
    rowGap: 15,
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  text: {
    color: '#3A3F51',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
  },
  separator: {
    alignSelf: 'stretch',
    height: 0.5,
    backgroundColor: '#D8E0F0',
    width: MODAL_WIDTH - 30,
  },
});

export default CardMenu;